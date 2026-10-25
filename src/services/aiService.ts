/**
 * @fileoverview Hybrid GenAI Assistant Engine Facade for Vesta Event Studio.
 *
 * Implements triple-redundancy failover:
 * 1. Serverless API endpoint (`/api/chat`, `/api/ideas`) with server-side credentials
 * 2. Client-side Gemini REST call (if runtime key is configured)
 * 3. Smart local deterministic engine (100% offline fallback)
 */

import type { EventProject, PersonalizedIdea, VendorChecklistItem } from '../types/event';
import { sanitizeUserInput } from '../utils/security';
import { createLocalFallbackIdeas } from '../data/fixtures/fallbackIdeas';
import { formatNegotiationDraft } from '../data/fixtures/negotiationTemplates';
import { aiResponseCache, buildCacheKey, cacheSet } from './ai/aiCache';
import {
  buildIdeasPrompt,
  buildVendorPrompt,
  buildAssistantPrompt,
  parseIdeasResponse,
} from './ai/aiPromptBuilder';
import { getClientApiKey, callGemini, callServerlessAi } from './ai/geminiClient';

export { aiResponseCache, buildCacheKey };

export interface AssistantResponse {
  reply: string;
  suggestedAction?: string;
  engineMode: 'gemini-live' | 'smart-context-engine';
}

export async function generatePersonalizedIdeas(
  project: EventProject,
  customPrompt?: string,
): Promise<PersonalizedIdea[]> {
  const cacheKey = buildCacheKey('ideas', project.vertical, project.title, String(project.totalBudget), customPrompt ?? '');
  const cached = aiResponseCache.get(cacheKey);
  if (cached) {
    const parsed = parseIdeasResponse(cached, project.vertical);
    if (parsed.length > 0) return parsed;
  }

  // 1. Try serverless /api/ideas
  const serverlessRaw = await callServerlessAi('/api/ideas', { project, prompt: customPrompt });
  if (serverlessRaw) {
    const parsed = parseIdeasResponse(serverlessRaw, project.vertical);
    if (parsed.length > 0) {
      cacheSet(cacheKey, serverlessRaw);
      return parsed;
    }
  }

  // 2. Try client-side Gemini key if present
  const apiKey = getClientApiKey();
  if (apiKey) {
    try {
      const sanitized = customPrompt ? sanitizeUserInput(customPrompt) : '';
      const raw = await callGemini(buildIdeasPrompt(project, sanitized), apiKey);
      cacheSet(cacheKey, raw);
      const parsed = parseIdeasResponse(raw, project.vertical);
      if (parsed.length > 0) return parsed;
    } catch (err) {
      console.warn('[Vesta AI] Gemini call failed, using local engine:', err);
    }
  }

  // 3. Deterministic local fallback
  return createLocalFallbackIdeas(project);
}

export async function draftVendorNegotiationMessage(
  project: EventProject,
  vendor: VendorChecklistItem,
  goal: 'discount' | 'scope-check' | 'contract-followup',
): Promise<string> {
  const cacheKey = buildCacheKey('vendor', project.title, vendor.vendorName, goal);
  const cached = aiResponseCache.get(cacheKey);
  if (cached && cached.trim().length > 50) return cached;

  const apiKey = getClientApiKey();
  if (apiKey) {
    try {
      const msg = await callGemini(buildVendorPrompt(project, vendor, goal), apiKey);
      if (msg.trim().length > 50) {
        cacheSet(cacheKey, msg);
        return msg;
      }
    } catch (err) {
      console.warn('[Vesta AI] Vendor draft fallback:', err);
    }
  }
  return formatNegotiationDraft(project, vendor, goal);
}

function localAsk(project: EventProject, q: string): { reply: string; suggestedAction?: string } {
  const query = q.toLowerCase();
  const spent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);
  const allocated = project.budgetCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  const done = project.timelineItems.filter((t) => t.status === 'completed').length;
  const booked = project.vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length;

  if (query.includes('budget') || query.includes('spend') || query.includes('cost')) {
    const util = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0';
    return {
      reply: `📊 **Budget Telemetry for "${project.title}"**\n\n• Total: ₹${project.totalBudget.toLocaleString('en-IN')}\n• Allocated: ₹${allocated.toLocaleString('en-IN')}\n• Spent: ₹${spent.toLocaleString('en-IN')} (${util}% utilised)\n• Remaining: ₹${(project.totalBudget - spent).toLocaleString('en-IN')}`,
      suggestedAction: project.totalBudget - spent < project.totalBudget * 0.1 ? 'Review low-priority categories.' : undefined,
    };
  }
  if (query.includes('timeline') || query.includes('task')) {
    return {
      reply: `📅 **Timeline Status for "${project.title}"**\n\n• Tasks Done: ${done}/${project.timelineItems.length}\n• Critical Pending: ${project.timelineItems.filter((t) => t.isCriticalPath && t.status !== 'completed').length}`,
    };
  }
  return {
    reply: `👋 **"${project.title}"** overview: ${project.guestCount} guests, ₹${project.totalBudget.toLocaleString('en-IN')} budget, ${booked}/${project.vendors.length} vendors booked, ${done}/${project.timelineItems.length} tasks complete.`,
  };
}

export async function askContextAssistant(
  project: EventProject,
  userQuery: string,
): Promise<AssistantResponse> {
  const sanitized = sanitizeUserInput(userQuery);
  const cacheKey = buildCacheKey('assistant', project.title, sanitized);
  const cached = aiResponseCache.get(cacheKey);
  if (cached && cached.trim().length > 20) return { reply: cached, engineMode: 'gemini-live' };

  // 1. Try serverless endpoint
  const serverlessReply = await callServerlessAi('/api/chat', { project, message: sanitized });
  if (serverlessReply && serverlessReply.trim().length > 20) {
    cacheSet(cacheKey, serverlessReply);
    return { reply: serverlessReply, engineMode: 'gemini-live' };
  }

  // 2. Try client-side Gemini key
  const apiKey = getClientApiKey();
  if (apiKey) {
    try {
      const reply = await callGemini(buildAssistantPrompt(project, sanitized), apiKey);
      if (reply.trim().length > 20) {
        cacheSet(cacheKey, reply);
        return { reply, engineMode: 'gemini-live' };
      }
    } catch (err) {
      console.warn('[Vesta AI] Assistant query fallback:', err);
    }
  }

  const fallback = localAsk(project, sanitized);
  return { ...fallback, engineMode: 'smart-context-engine' };
}
