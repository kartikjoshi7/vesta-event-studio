/**
 * @fileoverview Security utilities for Vesta Event Studio (< 140L).
 */

export function sanitizeUserInput(input: string, maxLength: number = 10_000): string {
  if (typeof input !== 'string') return '';
  let sanitized = input;
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(['"]?).*?\1/gi, '');
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  sanitized = sanitized.replace(/(\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>|<\|system\|>|<\|user\|>|<\|assistant\|>|###\s*(System|User|Assistant)\s*:)/gi, '');
  sanitized = sanitized.replace(/\s{3,}/g, '  ');
  return sanitized.trim().slice(0, maxLength);
}

export function validateNumberInput(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback;
  }
  return parsed;
}

export function maskApiKey(key: string): string {
  if (typeof key !== 'string' || key.length < 8) return '****';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  const masked = '*'.repeat(Math.max(key.length - 8, 4));
  return `${prefix}${masked}${suffix}`;
}

export function safeJsonParse<T>(raw: string, fallback: T): T {
  if (typeof raw !== 'string' || raw.trim().length === 0) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitBuckets = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  actionKey: string,
  maxRequests: number = 15,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  let record = rateLimitBuckets.get(actionKey);

  if (!record) {
    record = { timestamps: [] };
    rateLimitBuckets.set(actionKey, record);
  }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0] || now;
    const resetInMs = Math.max(0, windowMs - (now - oldest));
    return { allowed: false, remaining: 0, resetInMs };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, maxRequests - record.timestamps.length);
  return { allowed: true, remaining, resetInMs: windowMs };
}
