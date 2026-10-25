/**
 * @fileoverview Shared security, rate-limiting, and response handler for Vercel Serverless api/ (< 100L).
 */

import type { IncomingMessage, ServerResponse } from 'http';

export interface ExtendedRequest extends IncomingMessage {
  body?: Record<string, unknown>;
  query?: Record<string, string>;
}

const rateLimitMap = new Map<string, number[]>();

export function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function checkServerRateLimit(key: string, maxReq: number = 30, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxReq) return false;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

export async function parseJsonBody<T = Record<string, unknown>>(req: ExtendedRequest): Promise<T | null> {
  if (req.body && typeof req.body === 'object') return req.body as T;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer | string) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? (JSON.parse(data) as T) : null);
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

export function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  applySecurityHeaders(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}
