/**
 * @fileoverview Hybrid GenAI Assistant Engine for Vesta Event Studio.
 *
 * Supports two operational modes:
 * 1. **Gemini Live** — Calls Google Gemini (`gemini-2.5-flash`) via REST
 *    when an API key is available.
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

// ─── Configuration ──────────────────────────────────────────────────────────

/** The Gemini model endpoint. */
const GEMINI_MODEL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) ||
  'gemini-3.5-flash';

/** Base URL for the Gemini REST API. */
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

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
      // If 404 (model retired/not found), proceed to next candidate model
      if (lastError.message.includes('404') || lastError.message.includes('NOT_FOUND')) {
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
  const uid = () => `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const ideaBank: Record<string, PersonalizedIdea[]> = {
    wedding: [
      { id: uid(), category: 'theme',          title: 'Moonlit Garden Ceremony',                   description: `Transform your ${project.location} venue into an enchanted moonlit garden with fairy lights, white florals, and mirror-topped tables reflecting candlelight. Ideal for your ${project.season} ${project.indoorOutdoor} setting.`, estimatedCostImpact: '+₹35,000', bestForContext: `${project.season} ${project.indoorOutdoor} weddings in ${project.location}`, appliedToPlan: false },
      { id: uid(), category: 'catering',        title: 'Regional Cuisine Tasting Journey',          description: `Curate a multi-station tasting experience featuring regional cuisines from ${project.location} and the couple's heritage cities. Each station tells a story with custom menu cards.`, estimatedCostImpact: '+₹20,000', bestForContext: `Weddings with ${project.guestCount}+ guests celebrating cultural heritage`, appliedToPlan: false },
      { id: uid(), category: 'sustainability',   title: 'Seed Paper Invitations',                   description: 'Replace traditional paper invites with plantable seed paper that grows into wildflowers. Include QR codes linking to the wedding website for RSVP.', estimatedCostImpact: 'Budget-neutral', bestForContext: 'Eco-conscious couples, any venue type', appliedToPlan: false },
      { id: uid(), category: 'entertainment',    title: 'Live Caricature Artists',                  description: `Station 2 caricature artists at the reception to sketch guests as wedding keepsakes. A fun, personal alternative to traditional party favors for ${project.guestCount} guests.`, estimatedCostImpact: '+₹15,000', bestForContext: 'Wedding receptions with 150+ guests', appliedToPlan: false },
      { id: uid(), category: 'decor',            title: 'Vintage Photo Timeline Display',           description: "Create a chronological photo display tracing the couple's journey from childhood to engagement, arranged along the entrance pathway with floral framing.", estimatedCostImpact: '+₹8,000', bestForContext: 'Heritage & traditional themed weddings', appliedToPlan: false },
    ],
    birthday: [
      { id: uid(), category: 'entertainment',    title: 'Mystery Guest Performer',                  description: `Surprise the birthday host with a 15-minute set from a local musician matching the ${project.vibeTags.join('/')} vibe. Coordinate secretly with close friends for maximum impact.`, estimatedCostImpact: '+₹12,000', bestForContext: `Milestone birthdays with ${project.vibeTags.join(', ')} aesthetic`, appliedToPlan: false },
      { id: uid(), category: 'theme',            title: 'Decade Throwback Experience',              description: `Since ${project.personaName} is turning a milestone, create themed zones representing each decade of their life with era-appropriate music, décor, and photo props.`, estimatedCostImpact: '+₹10,000', bestForContext: 'Milestone birthdays (30th, 40th, 50th)', appliedToPlan: false },
      { id: uid(), category: 'catering',         title: 'Dessert Grazing Table',                    description: `Create a stunning 10-foot dessert grazing table with artisanal chocolates, macarons, fruit tarts, and the birthday cake as the centrepiece. Accommodates all ${project.dietaryRestrictions.join(', ')} dietary needs.`, estimatedCostImpact: '+₹7,000', bestForContext: `Premium parties with dietary considerations`, appliedToPlan: false },
      { id: uid(), category: 'decor',            title: 'Personalized Neon Sign',                   description: `Commission a custom neon sign with "${project.personaName}'s" name or a signature catchphrase. Doubles as the main photo backdrop and a take-home keepsake.`, estimatedCostImpact: '+₹6,000', bestForContext: 'Neon, rooftop, or nightlife-themed parties', appliedToPlan: false },
      { id: uid(), category: 'logistics',        title: 'Coordinated Arrival Experience',           description: `Arrange branded ride-share credits for all ${project.guestCount} guests with a custom pick-up message. Ensures safe transport and creates a VIP arrival experience.`, estimatedCostImpact: '+₹8,000', bestForContext: 'Urban nightlife parties, safety-conscious hosts', appliedToPlan: false },
    ],
    community: [
      { id: uid(), category: 'logistics',        title: 'Hybrid Livestream with Live Q&A',          description: `Set up professional livestreaming for the keynote sessions, enabling remote attendees to participate via live chat Q&A. Extend the reach of your ${project.guestCount}-person summit to a global audience.`, estimatedCostImpact: '+₹25,000', bestForContext: 'Tech summits and professional conferences', appliedToPlan: false },
      { id: uid(), category: 'sustainability',   title: 'Digital-Only Swag Bags',                   description: 'Replace physical swag with digital goodie bags: discount codes, e-books, free software trials, and exclusive content from sponsors. Zero waste, high value.', estimatedCostImpact: '-₹15,000 saved', bestForContext: 'Sustainability-focused events, tech-savvy attendees', appliedToPlan: false },
      { id: uid(), category: 'entertainment',    title: 'Speed Networking Rounds',                  description: `Organize 3 rounds of structured speed networking (5 min each) during the tea break. Use topic-based table assignments to maximize meaningful connections among ${project.guestCount} attendees.`, estimatedCostImpact: 'Budget-neutral', bestForContext: 'Professional networking events with 200+ attendees', appliedToPlan: false },
      { id: uid(), category: 'catering',         title: 'Local Food Truck Alley',                   description: `Instead of traditional buffet, invite 4-5 local food trucks to create a vibrant "Food Truck Alley" during lunch. Supports local businesses and adds variety for ${project.guestCount} attendees.`, estimatedCostImpact: '+₹5,000', bestForContext: 'Community events in cities with active food truck culture', appliedToPlan: false },
      { id: uid(), category: 'theme',            title: 'Impact Wall & Pledge Board',               description: 'Set up a large interactive "Impact Wall" where attendees write sustainability pledges on post-it notes. Photograph and compile into a post-event impact report shared with all attendees.', estimatedCostImpact: '+₹2,000', bestForContext: 'Sustainability summits and community gatherings', appliedToPlan: false },
    ],
  };

  return ideaBank[project.vertical] ?? ideaBank.wedding;
}

/**
 * Drafts a vendor negotiation message using local templates.
 */
function localDraftVendorMessage(
  project: EventProject,
  vendor: VendorChecklistItem,
  goal: 'discount' | 'scope-check' | 'contract-followup',
): string {
  const greeting = `Dear ${vendor.vendorName} Team,`;
  const eventRef = `Re: ${project.title} — ${project.date} at ${project.location}`;

  switch (goal) {
    case 'discount':
      return [
        greeting,
        '',
        eventRef,
        '',
        `Thank you for your quote of ₹${vendor.estimatedCost.toLocaleString('en-IN')} for ${vendor.category} services. We're excited about working with you for ${project.personaName}'s event.`,
        '',
        `Given our overall event budget and the scope of services across ${project.budgetCategories.length} categories, we'd like to discuss the possibility of a competitive adjustment. We're looking at a budget of approximately ₹${Math.round(vendor.estimatedCost * 0.85).toLocaleString('en-IN')} for this category.`,
        '',
        `We believe this can be a great portfolio piece for your team, with ${project.guestCount} guests and excellent exposure opportunities.`,
        '',
        'Would you be open to discussing revised pricing? We value the quality of your work and want to find a mutually beneficial arrangement.',
        '',
        'Looking forward to your response.',
        '',
        `Best regards,`,
        `${project.personaName}`,
        'Powered by Vesta Event Studio',
      ].join('\n');

    case 'scope-check':
      return [
        greeting,
        '',
        eventRef,
        '',
        `As we finalize our plans for the event on ${project.date}, I wanted to confirm the scope of services included in your package:`,
        '',
        `• Service Category: ${vendor.category}`,
        `• Estimated Cost: ₹${vendor.estimatedCost.toLocaleString('en-IN')}`,
        `• Guest Count: ${project.guestCount}`,
        `• Venue Type: ${project.indoorOutdoor}`,
        '',
        'Could you please confirm:',
        '1. The detailed breakdown of services included at the quoted price.',
        '2. Any additional charges for setup, overtime, or travel.',
        '3. Your cancellation and rescheduling policy.',
        vendor.vettingChecklist.some((c) => !c.checked)
          ? `4. Outstanding items from our checklist: ${vendor.vettingChecklist.filter((c) => !c.checked).map((c) => c.label).join(', ')}.`
          : '',
        '',
        'Thank you for your prompt response.',
        '',
        `Best regards,`,
        `${project.personaName}`,
        'Powered by Vesta Event Studio',
      ].filter(Boolean).join('\n');

    case 'contract-followup':
      return [
        greeting,
        '',
        eventRef,
        '',
        `This is a friendly follow-up regarding our ${vendor.category} services agreement. Our records show:`,
        '',
        `• Current Status: ${vendor.status}`,
        `• Estimated Cost: ₹${vendor.estimatedCost.toLocaleString('en-IN')}`,
        vendor.paymentDueDate ? `• Payment Due Date: ${vendor.paymentDueDate}` : '',
        '',
        'We would appreciate receiving the final contract for review at your earliest convenience. If the contract has already been sent, please disregard this message.',
        '',
        `The event is on ${project.date}, and we want to ensure all agreements are finalized well in advance.`,
        '',
        'Thank you for your attention to this matter.',
        '',
        `Best regards,`,
        `${project.personaName}`,
        'Powered by Vesta Event Studio',
      ].filter(Boolean).join('\n');
  }
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

  if (apiKey) {
    try {
      const sanitizedPrompt = customPrompt ? sanitizeUserInput(customPrompt) : '';
      const prompt = buildIdeasPrompt(project, sanitizedPrompt);
      const raw = await callGemini(prompt, apiKey);
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
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const prompt = buildVendorPrompt(project, vendor, goal);
      const message = await callGemini(prompt, apiKey);
      if (message.trim().length > 50) return message;
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
  const apiKey = getApiKey();

  if (apiKey) {
    try {
      const prompt = buildAssistantPrompt(project, sanitized);
      const reply = await callGemini(prompt, apiKey);
      if (reply.trim().length > 20) {
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
