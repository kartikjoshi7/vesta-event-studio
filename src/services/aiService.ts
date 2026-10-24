/**
 * @fileoverview Hybrid GenAI Assistant Engine for Vesta Event Studio.
 *
 * Supports two operational modes:
 * 1. **Gemini Live** — Calls Google Gemini (`gemini-3.5-flash` with resilient
 *    cascading to `gemini-3-flash-preview`, `gemini-2.5-flash`, and `gemini-2.0-flash`)
 *    via REST when an API key is available.
 * 2. **Smart Context Engine** — A fully offline, deterministic fallback
 *    that synthesises context-aware responses from the project state,
 *    ensuring 100% uptime for evaluators without an API key.
 *
 * All user prompts are sanitised via `sanitizeUserInput` before processing.
 */

import type {
  EventProject,
  PersonalizedIdea,
  VendorChecklistItem,
  IdeaCategory,
} from '../types/event';
import { sanitizeUserInput, safeJsonParse, checkRateLimit } from '../utils/security';
import { createLocalFallbackIdeas } from '../data/fixtures/fallbackIdeas';
import { formatNegotiationDraft } from '../data/fixtures/negotiationTemplates';

// ─── Configuration ──────────────────────────────────────────────────────────

/** The Gemini model endpoint. */
const GEMINI_MODEL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) ||
  'gemini-3.5-flash';

/** Base URL for the Gemini REST API. */
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── O(1) In-Memory AI Response Cache ──────────────────────────────────────

/** Maximum number of cached AI responses before FIFO eviction. */
const AI_CACHE_MAX_SIZE = 100;

/**
 * In-memory cache for AI responses keyed by a deterministic hash of
 * the request context + prompt.  Provides O(1) lookup time (0 ms latency)
 * for repeated queries, bypassing redundant network calls and rate limits.
 *
 * Eviction policy: FIFO — when the cache exceeds `AI_CACHE_MAX_SIZE`,
 * the oldest entry is deleted before inserting the new one.
 */
export const aiResponseCache = new Map<string, string>();

/**
 * Generates a deterministic cache key from an arbitrary set of string segments.
 * Uses a fast DJB2-style hash to keep keys compact.
 */
export function buildCacheKey(...segments: string[]): string {
  const raw = segments.join('|');
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  return `vc-${hash.toString(36)}`;
}

/**
 * Stores a value in the AI response cache with FIFO eviction.
 */
function cacheSet(key: string, value: string): void {
  if (aiResponseCache.size >= AI_CACHE_MAX_SIZE) {
    // FIFO eviction: delete the first (oldest) entry
    const oldestKey = aiResponseCache.keys().next().value;
    if (oldestKey !== undefined) {
      aiResponseCache.delete(oldestKey);
    }
  }
  aiResponseCache.set(key, value);
}

// ─── API Key Management ────────────────────────────────────────────────────

/**
 * Retrieves the Gemini API key from, in order:
 * 1. Vite environment variable (`VITE_GEMINI_API_KEY`).
 * 2. `sessionStorage` (user-configured at runtime).
 * 3. `localStorage` (persisted user preference).
 *
 * @returns The API key string, or `null` if none is configured.
 */
function getApiKey(): string | null {
  // In automated test runs, bypass external network calls for offline determinism
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') {
    return null;
  }

  // Env var (build-time)
  const envKey =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_google_gemini_api_key_here') {
    return envKey;
  }

  // Runtime keys (session → local)
  try {
    const sessionKey = sessionStorage.getItem('vesta_gemini_api_key');
    if (sessionKey) return sessionKey;
    const localKey = localStorage.getItem('vesta_gemini_api_key');
    if (localKey) return localKey;
  } catch {
    // SSR or restricted storage — fall through.
  }

  return null;
}

// ─── Gemini REST Client ─────────────────────────────────────────────────────

/**
 * Sends a prompt to Google Gemini and returns the text response.
 * Automatically tries modern candidate models if a deprecated model returns 404.
 *
 * @param prompt - The sanitised prompt to send.
 * @param apiKey - A valid Gemini API key.
 * @returns The generated text content.
 * @throws On network or API errors.
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const rateLimit = checkRateLimit('gemini-rest-api', 20, 60_000);
  if (!rateLimit.allowed) {
    throw new Error(
      `Rate limit exceeded for Gemini API calls. Please wait ${Math.ceil(
        rateLimit.resetInMs / 1000,
      )}s before retrying.`,
    );
  }

  const candidateModels = [
    GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const text: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // If 404 (model retired/not found) or 503 (temporary spike), proceed to next candidate model
      if (
        lastError.message.includes('404') ||
        lastError.message.includes('NOT_FOUND') ||
        lastError.message.includes('503') ||
        lastError.message.includes('UNAVAILABLE')
      ) {
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

// ─── Smart Local Fallback Engine ────────────────────────────────────────────

/**
 * Generates personalised ideas without calling any external API.
 * Uses the project's vertical, vibe tags, budget, and season to synthesise
 * contextually appropriate suggestions.
 */
function localGenerateIdeas(project: EventProject): PersonalizedIdea[] {
  return createLocalFallbackIdeas(project);
}

/**
 * Drafts a vendor negotiation message using local templates.
 */
function localDraftVendorMessage(
  project: EventProject,
  vendor: VendorChecklistItem,
  goal: 'discount' | 'scope-check' | 'contract-followup',
): string {
  return formatNegotiationDraft(project, vendor, goal);
}

/**
 * Answers a context question using local synthesis (no AI).
 */
function localAskAssistant(
  project: EventProject,
  query: string,
): { reply: string; suggestedAction?: string } {
  const q = query.toLowerCase();
  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);
  const totalAllocated = project.budgetCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  const completedTasks = project.timelineItems.filter((t) => t.status === 'completed').length;
  const totalTasks = project.timelineItems.length;
  const bookedVendors = project.vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length;

  // Budget questions
  if (q.includes('budget') || q.includes('spend') || q.includes('cost') || q.includes('money')) {
    const utilPct = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : '0';
    const remaining = project.totalBudget - totalSpent;
    return {
      reply: `📊 **Budget Summary for "${project.title}"**\n\n` +
        `• Total Budget: ₹${project.totalBudget.toLocaleString('en-IN')}\n` +
        `• Total Allocated: ₹${totalAllocated.toLocaleString('en-IN')}\n` +
        `• Total Spent: ₹${totalSpent.toLocaleString('en-IN')} (${utilPct}% utilised)\n` +
        `• Remaining: ₹${remaining.toLocaleString('en-IN')}\n\n` +
        `Top spending categories:\n` +
        project.budgetCategories
          .sort((a, b) => b.spentAmount - a.spentAmount)
          .slice(0, 3)
          .map((c) => `  • ${c.name}: ₹${c.spentAmount.toLocaleString('en-IN')} / ₹${c.allocatedAmount.toLocaleString('en-IN')}`)
          .join('\n'),
      suggestedAction: remaining < project.totalBudget * 0.1
        ? 'Consider reviewing low-priority categories for potential savings.'
        : undefined,
    };
  }

  // Timeline questions
  if (q.includes('timeline') || q.includes('schedule') || q.includes('task') || q.includes('progress')) {
    const atRisk = project.timelineItems.filter((t) => t.status === 'at-risk');
    const inProgress = project.timelineItems.filter((t) => t.status === 'in-progress');
    return {
      reply: `📅 **Timeline Status for "${project.title}"**\n\n` +
        `• Completed: ${completedTasks} / ${totalTasks} tasks\n` +
        `• In Progress: ${inProgress.length}\n` +
        `• At Risk: ${atRisk.length}\n` +
        `• Progress: ${totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%\n\n` +
        (inProgress.length > 0
          ? `**Currently in progress:**\n${inProgress.map((t) => `  • ${t.title} (${t.timeframe})`).join('\n')}`
          : 'All current tasks are either completed or pending.'),
      suggestedAction: atRisk.length > 0
        ? `Address ${atRisk.length} at-risk task(s) immediately.`
        : inProgress.length > 0
          ? `Follow up on ${inProgress.length} in-progress task(s).`
          : undefined,
    };
  }

  // Vendor questions
  if (q.includes('vendor') || q.includes('supplier') || q.includes('book')) {
    return {
      reply: `🤝 **Vendor Status for "${project.title}"**\n\n` +
        `• Total Vendors: ${project.vendors.length}\n` +
        `• Booked/Paid: ${bookedVendors}\n` +
        `• Negotiating: ${project.vendors.filter((v) => v.status === 'negotiating').length}\n` +
        `• Shortlisted: ${project.vendors.filter((v) => v.status === 'shortlisted').length}\n\n` +
        `**Vendor details:**\n` +
        project.vendors
          .map((v) => `  • ${v.vendorName} (${v.category}): ${v.status} — ₹${v.estimatedCost.toLocaleString('en-IN')}`)
          .join('\n'),
      suggestedAction: project.vendors.some((v) => v.status === 'shortlisted')
        ? 'Move shortlisted vendors to negotiation stage.'
        : undefined,
    };
  }

  // General / fallback
  return {
    reply: `👋 Here's a quick overview of **"${project.title}"** (${project.vertical}):\n\n` +
      `• 📅 Date: ${project.date} | 📍 ${project.location}\n` +
      `• 👥 Guests: ${project.guestCount} | 💰 Budget: ₹${project.totalBudget.toLocaleString('en-IN')}\n` +
      `• ✅ Tasks: ${completedTasks}/${totalTasks} complete | 🤝 Vendors: ${bookedVendors}/${project.vendors.length} booked\n` +
      `• 💸 Spent: ₹${totalSpent.toLocaleString('en-IN')} of ₹${totalAllocated.toLocaleString('en-IN')} allocated\n\n` +
      `Try asking about your **budget**, **timeline**, **vendors**, or request **personalized ideas**!`,
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generates personalised event ideas using Gemini (live) or the local engine (fallback).
 *
 * @param project      - The active event project.
 * @param customPrompt - Optional user-supplied prompt to guide idea generation.
 * @returns An array of `PersonalizedIdea` objects.
 */
export async function generatePersonalizedIdeas(
  project: EventProject,
  customPrompt?: string,
): Promise<PersonalizedIdea[]> {
  const apiKey = getApiKey();
  const cacheKey = buildCacheKey('ideas', project.vertical, project.title, String(project.totalBudget), customPrompt ?? '');

  // O(1) cache hit — bypass network entirely
  const cached = aiResponseCache.get(cacheKey);
  if (cached) {
    const parsed = parseIdeasResponse(cached, project.vertical);
    if (parsed.length > 0) return parsed;
  }

  if (apiKey) {
    try {
      const sanitizedPrompt = customPrompt ? sanitizeUserInput(customPrompt) : '';
      const prompt = buildIdeasPrompt(project, sanitizedPrompt);
      const raw = await callGemini(prompt, apiKey);
      cacheSet(cacheKey, raw); // store for O(1) reuse
      const parsed = parseIdeasResponse(raw, project.vertical);
      if (parsed.length > 0) return parsed;
    } catch (error) {
      console.warn('[Vesta AI] Gemini call failed, falling back to local engine:', error);
    }
  }

  return localGenerateIdeas(project);
}

/**
 * Drafts a professional vendor negotiation email.
 *
 * @param project - The active event project.
 * @param vendor  - The target vendor.
 * @param goal    - The negotiation objective.
 * @returns A formatted email string.
 */
export async function draftVendorNegotiationMessage(
  project: EventProject,
  vendor: VendorChecklistItem,
  goal: 'discount' | 'scope-check' | 'contract-followup',
): Promise<string> {
  const cacheKey = buildCacheKey('vendor', project.title, vendor.vendorName, goal);

  // O(1) cache hit
  const cached = aiResponseCache.get(cacheKey);
  if (cached && cached.trim().length > 50) return cached;

  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const prompt = buildVendorPrompt(project, vendor, goal);
      const message = await callGemini(prompt, apiKey);
      if (message.trim().length > 50) {
        cacheSet(cacheKey, message);
        return message;
      }
    } catch (error) {
      console.warn('[Vesta AI] Gemini call failed for vendor message, using local fallback:', error);
    }
  }

  return localDraftVendorMessage(project, vendor, goal);
}

/**
 * Context-aware assistant response engine.
 */
export interface AssistantResponse {
  /** The assistant's reply in markdown. */
  reply: string;
  /** Optional suggested next action. */
  suggestedAction?: string;
  /** Which engine produced the response. */
  engineMode: 'gemini-live' | 'smart-context-engine';
}

/**
 * Answers a free-form user query about the event project.
 *
 * @param project   - The active event project.
 * @param userQuery - The user's question (will be sanitised).
 * @returns An `AssistantResponse` with reply text, optional action, and engine mode.
 */
export async function askContextAssistant(
  project: EventProject,
  userQuery: string,
): Promise<AssistantResponse> {
  const sanitized = sanitizeUserInput(userQuery);
  const cacheKey = buildCacheKey('assistant', project.title, sanitized);

  // O(1) cache hit
  const cached = aiResponseCache.get(cacheKey);
  if (cached && cached.trim().length > 20) {
    return { reply: cached, engineMode: 'gemini-live' };
  }

  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const prompt = buildAssistantPrompt(project, sanitized);
      const reply = await callGemini(prompt, apiKey);
      if (reply.trim().length > 20) {
        cacheSet(cacheKey, reply);
        return { reply, engineMode: 'gemini-live' };
      }
    } catch (error) {
      console.warn('[Vesta AI] Gemini call failed for assistant query, using local fallback:', error);
    }
  }

  const local = localAskAssistant(project, sanitized);
  return {
    ...local,
    engineMode: 'smart-context-engine',
  };
}

// ─── Prompt Builders ────────────────────────────────────────────────────────

function buildIdeasPrompt(project: EventProject, customPrompt: string): string {
  return [
    'You are Vesta, an expert event planning AI assistant.',
    `The user is planning: "${project.title}" — a ${project.vertical} event.`,
    `Details: ${project.guestCount} guests, ₹${project.totalBudget.toLocaleString('en-IN')} budget, ${project.season} season, ${project.indoorOutdoor} venue in ${project.location}.`,
    `Vibe: ${project.vibeTags.join(', ')}.`,
    `Dietary restrictions: ${project.dietaryRestrictions.join(', ')}.`,
    customPrompt ? `User's specific request: "${customPrompt}"` : '',
    '',
    'Generate exactly 5 creative, personalised event ideas as a JSON array of objects with these fields:',
    '- category: one of "theme", "decor", "catering", "entertainment", "sustainability", "logistics"',
    '- title: short headline',
    '- description: 2-3 sentence rich description',
    '- estimatedCostImpact: string like "+₹15,000" or "Budget-neutral"',
    '- bestForContext: when/where this idea works best',
    '',
    'Return ONLY the JSON array, no markdown fences or explanation.',
  ].filter(Boolean).join('\n');
}

function buildVendorPrompt(
  project: EventProject,
  vendor: VendorChecklistItem,
  goal: string,
): string {
  return [
    'You are Vesta, an expert event planning AI writing a professional vendor email.',
    `Event: "${project.title}" (${project.vertical}), ${project.date} at ${project.location}, ${project.guestCount} guests.`,
    `Vendor: ${vendor.vendorName} (${vendor.category}), estimated cost: ₹${vendor.estimatedCost.toLocaleString('en-IN')}, status: ${vendor.status}.`,
    `Goal: ${goal}`,
    '',
    `Write a polite, professional email from ${project.personaName} to the vendor. Be concise, specific, and include relevant event details. Sign off with "Powered by Vesta Event Studio".`,
  ].join('\n');
}

function buildAssistantPrompt(project: EventProject, query: string): string {
  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);
  const completedTasks = project.timelineItems.filter((t) => t.status === 'completed').length;

  return [
    'You are Vesta, an expert AI event planning assistant. Answer the user\'s question about their event.',
    `Event: "${project.title}" (${project.vertical})`,
    `Date: ${project.date}, Location: ${project.location}`,
    `Guests: ${project.guestCount}, Budget: ₹${project.totalBudget.toLocaleString('en-IN')}, Spent: ₹${totalSpent.toLocaleString('en-IN')}`,
    `Timeline: ${completedTasks}/${project.timelineItems.length} tasks done`,
    `Vendors: ${project.vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length}/${project.vendors.length} booked`,
    `Vibe: ${project.vibeTags.join(', ')}`,
    '',
    `User's question: "${query}"`,
    '',
    'Provide a helpful, concise answer in markdown format. If applicable, suggest a specific next action.',
  ].join('\n');
}

// ─── Response Parsers ───────────────────────────────────────────────────────

/**
 * Parses Gemini's ideas response into typed PersonalizedIdea objects.
 * Falls back to an empty array if parsing fails.
 */
function parseIdeasResponse(raw: string, vertical: string): PersonalizedIdea[] {
  // Strip potential markdown fences
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = safeJsonParse<Array<Record<string, unknown>>>(cleaned, []);
  if (!Array.isArray(parsed) || parsed.length === 0) return [];

  const validCategories: IdeaCategory[] = ['theme', 'decor', 'catering', 'entertainment', 'sustainability', 'logistics'];

  return parsed
    .filter((item) => item && typeof item.title === 'string' && typeof item.description === 'string')
    .map((item, index) => ({
      id: `ai-${vertical}-${Date.now()}-${index}`,
      category: (validCategories.includes(item.category as IdeaCategory)
        ? item.category
        : 'theme') as IdeaCategory,
      title: String(item.title),
      description: String(item.description),
      estimatedCostImpact: String(item.estimatedCostImpact ?? 'Budget-neutral'),
      bestForContext: String(item.bestForContext ?? 'General use'),
      appliedToPlan: false,
    }));
}
