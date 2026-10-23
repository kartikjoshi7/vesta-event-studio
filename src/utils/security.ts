/**
 * @fileoverview Security utilities for Vesta Event Studio.
 *
 * Provides input sanitization, numeric validation, API-key masking, and
 * defensive JSON parsing to guard against XSS, prompt injection, and
 * malformed data from AI responses or localStorage payloads.
 */

/**
 * Strips dangerous HTML / script content, event-handler attributes,
 * `javascript:` URIs, and common prompt-injection delimiters from
 * user-supplied text while preserving clean prose.
 *
 * @param input  - Raw user input string.
 * @param maxLength - Optional ceiling on output length (default 10 000 chars).
 * @returns Sanitised plain-text string safe for rendering and AI prompting.
 *
 * @example
 * ```ts
 * sanitizeUserInput('<script>alert("xss")</script>Hello');
 * // → 'Hello'
 * ```
 */
export function sanitizeUserInput(input: string, maxLength: number = 10_000): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // 1. Remove <script> … </script> blocks (including multi-line).
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove all HTML tags (but keep inner text).
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');

  // 3. Remove inline event handlers (onerror=, onload=, onclick=, etc.).
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(['"]?).*?\1/gi, '');

  // 4. Remove javascript: URIs.
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // 5. Remove common prompt-injection delimiters.
  sanitized = sanitized.replace(/(\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>|<\|system\|>|<\|user\|>|<\|assistant\|>|###\s*(System|User|Assistant)\s*:)/gi, '');

  // 6. Collapse excessive whitespace.
  sanitized = sanitized.replace(/\s{3,}/g, '  ');

  // 7. Trim and enforce max length.
  return sanitized.trim().slice(0, maxLength);
}

/**
 * Validates that a value is a finite number within `[min, max]`.
 * Returns `fallback` for any invalid, NaN, Infinity, or out-of-range input.
 *
 * @param value    - The raw value to validate (may come from form inputs or JSON).
 * @param min      - Inclusive lower bound.
 * @param max      - Inclusive upper bound.
 * @param fallback - Safe default returned when validation fails.
 * @returns A valid number within the specified range.
 *
 * @example
 * ```ts
 * validateNumberInput('250', 1, 10000, 100); // → 250
 * validateNumberInput(-5, 0, 999, 0);        // → 0  (below min → fallback)
 * validateNumberInput('abc', 0, 999, 50);    // → 50 (NaN → fallback)
 * ```
 */
export function validateNumberInput(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback;
  }

  return parsed;
}

/**
 * Masks an API key for safe display in UI logs.
 * Shows only the first 4 and last 4 characters; everything in between is
 * replaced with asterisks.
 *
 * @param key - The raw API key string.
 * @returns A masked version, e.g. `"AIza****xyZ9"`.
 *
 * @example
 * ```ts
 * maskApiKey('AIzaSyD1234567890abcdef');
 * // → 'AIza************cdef'
 * ```
 */
export function maskApiKey(key: string): string {
  if (typeof key !== 'string' || key.length < 8) {
    return '****';
  }

  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  const masked = '*'.repeat(Math.max(key.length - 8, 4));

  return `${prefix}${masked}${suffix}`;
}

/**
 * Defensively parses a JSON string, returning `fallback` on any error.
 * Prevents malformed AI responses or corrupted localStorage blobs from
 * crashing the application.
 *
 * @typeParam T - Expected shape of the parsed result.
 * @param raw      - The raw JSON string to parse.
 * @param fallback - Value returned when parsing fails.
 * @returns The parsed object or the fallback value.
 *
 * @example
 * ```ts
 * safeJsonParse<number[]>('[1,2,3]', []);       // → [1, 2, 3]
 * safeJsonParse<number[]>('not json!', []);      // → []
 * safeJsonParse<null>(undefined as any, null);   // → null
 * ```
 */
export function safeJsonParse<T>(raw: string, fallback: T): T {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ─── Rate Limiting Guard ───────────────────────────────────────────────────

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitBuckets = new Map<string, RateLimitRecord>();

/**
 * Sliding-window rate-limiting guard to prevent API quota exhaustion,
 * client-side abuse, and denial-of-service request loops.
 *
 * @param actionKey   - Unique identifier for the rate-limited action (e.g. 'gemini-api').
 * @param maxRequests - Maximum allowed requests within the time window (default: 15).
 * @param windowMs    - Time window in milliseconds (default: 60,000 ms / 1 minute).
 * @returns Rate limit status containing `allowed`, `remaining`, and `resetInMs`.
 *
 * @example
 * ```ts
 * const status = checkRateLimit('gemini-call', 10, 60000);
 * if (!status.allowed) {
 *   console.warn(`Rate limit reached. Retry in ${status.resetInMs}ms`);
 * }
 * ```
 */
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

  // Purge expired timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0] || now;
    const resetInMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = Math.max(0, maxRequests - record.timestamps.length);

  return {
    allowed: true,
    remaining,
    resetInMs: windowMs,
  };
}
