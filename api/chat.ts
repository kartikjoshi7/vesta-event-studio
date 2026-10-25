/**
 * @fileoverview Serverless Copilot Chat Endpoint: POST /api/chat (< 90L).
 */

import type { ServerResponse } from 'http';
import { type ExtendedRequest, applySecurityHeaders, parseJsonBody, sendJson, checkServerRateLimit } from './_handler';
import { buildAssistantPrompt } from '../src/services/ai/aiPromptBuilder';
import type { EventProject } from '../src/types/event';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function queryGemini(prompt: string, key: string): Promise<string> {
  const models = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
  for (const m of models) {
    try {
      const res = await fetch(`${GEMINI_BASE_URL}/${m}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch {
      continue;
    }
  }
  throw new Error('Upstream AI unavailable');
}

export default async function handler(req: ExtendedRequest, res: ServerResponse): Promise<void> {
  applySecurityHeaders(res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed. Use POST.' }); return; }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
  if (!checkServerRateLimit(String(ip), 20, 60_000)) {
    sendJson(res, 429, { error: 'Rate limit reached. Please wait.' });
    return;
  }

  const body = await parseJsonBody<{ project: EventProject; message: string }>(req);
  if (!body || !body.project || !body.message) {
    sendJson(res, 400, { error: 'Missing project or message in request body.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(res, 200, {
      reply: `👋 Context summary for "${body.project.title}": ${body.project.guestCount} guests, ${body.project.currency} ${body.project.totalBudget.toLocaleString()} budget. Ask about budget, timeline, or vendor workflows!`,
      engineMode: 'smart-context-engine',
    });
    return;
  }

  try {
    const prompt = buildAssistantPrompt(body.project, body.message);
    const reply = await queryGemini(prompt, apiKey);
    sendJson(res, 200, { reply, engineMode: 'gemini-live' });
  } catch {
    sendJson(res, 200, {
      reply: `Telemetry overview for "${body.project.title}": ${body.project.guestCount} attendees, ${body.project.budgetCategories.length} categories allocated.`,
      engineMode: 'smart-context-engine',
    });
  }
}
