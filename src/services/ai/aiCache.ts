/**
 * @fileoverview O(1) in-memory response cache with FIFO eviction for Vesta Event Studio AI.
 */

const AI_CACHE_MAX_SIZE = 100;

export const aiResponseCache = new Map<string, string>();

export function buildCacheKey(...segments: string[]): string {
  const raw = segments.join('|');
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  return `vc-${hash.toString(36)}`;
}

export function cacheSet(key: string, value: string): void {
  if (aiResponseCache.size >= AI_CACHE_MAX_SIZE) {
    const oldestKey = aiResponseCache.keys().next().value;
    if (oldestKey !== undefined) {
      aiResponseCache.delete(oldestKey);
    }
  }
  aiResponseCache.set(key, value);
}

export function cacheGet(key: string): string | undefined {
  return aiResponseCache.get(key);
}

export function cacheClear(): void {
  aiResponseCache.clear();
}
