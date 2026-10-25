/**
 * @fileoverview Serverless Ideas Generation Endpoint: POST /api/ideas (< 85L).
 */

import type { ServerResponse } from 'http';
import { type ExtendedRequest, applySecurityHeaders, parseJsonBody, sendJson, checkServerRateLimit } from './_handler';
import { buildIdeasPrompt, parseIdeasResponse } from '../src/services/ai/aiPromptBuilder';
import { createLocalFallbackIdeas } from '../src/data/fixtures/fallbackIdeas';
import type { EventProject } from '../src/types/event';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

async function fetchGeminiIdeas(prompt: string, key: string): Promise<string> {
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
  throw new Error('AI upstream unavailable');
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

  const body = await parseJsonBody<{ project: EventProject; prompt?: string }>(req);
  if (!body || !body.project) {
    sendJson(res, 400, { error: 'Missing project payload.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(res, 200, { ideas: createLocalFallbackIdeas(body.project), source: 'local-deterministic' });
    return;
  }

  try {
    const prompt = buildIdeasPrompt(body.project, body.prompt || '');
    const raw = await fetchGeminiIdeas(prompt, apiKey);
    const parsed = parseIdeasResponse(raw, body.project.vertical);
    if (parsed.length > 0) {
      sendJson(res, 200, { ideas: parsed, source: 'gemini-serverless' });
      return;
    }
    sendJson(res, 200, { ideas: createLocalFallbackIdeas(body.project), source: 'local-deterministic' });
  } catch {
    sendJson(res, 200, { ideas: createLocalFallbackIdeas(body.project), source: 'local-deterministic' });
  }
}
