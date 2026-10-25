/**
 * @fileoverview Resilient client for Gemini REST API and Serverless proxy with model failover.
 */

import { checkRateLimit } from '../../utils/security';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export function getClientApiKey(): string | null {
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') {
    return null;
  }
  const envKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_google_gemini_api_key_here') return envKey;

  try {
    const sessionKey = sessionStorage.getItem('vesta_gemini_api_key');
    if (sessionKey) return sessionKey;
    const localKey = localStorage.getItem('vesta_gemini_api_key');
    if (localKey) return localKey;
  } catch {
    // Restricted storage fallback
  }
  return null;
}

export async function callGemini(
  prompt: string,
  apiKey: string,
  fetchFn: typeof fetch = fetch,
): Promise<string> {
  const rateLimit = checkRateLimit('gemini-rest-api', 20, 60_000);
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Retry in ${Math.ceil(rateLimit.resetInMs / 1000)}s.`);
  }

  const candidateModels = [
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || 'gemini-3.5-flash',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
      const response = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned an empty response.');
      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
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

export async function callServerlessAi(
  endpoint: string,
  payload: Record<string, unknown>,
  fetchFn: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const res = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.reply || (data.ideas ? JSON.stringify(data.ideas) : null);
  } catch {
    return null;
  }
}
