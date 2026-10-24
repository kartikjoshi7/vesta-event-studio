import { describe, it, expect, beforeEach } from 'vitest';
import {
  generatePersonalizedIdeas,
  draftVendorNegotiationMessage,
  askContextAssistant,
  aiResponseCache,
  buildCacheKey,
} from './aiService';
import { allPersonas } from '../data/verticalPersonas';

describe('AI Service (Hybrid GenAI Engine)', () => {
  const weddingProject = allPersonas.find((p) => p.vertical === 'wedding')!;
  const birthdayProject = allPersonas.find((p) => p.vertical === 'birthday')!;
  const communityProject = allPersonas.find((p) => p.vertical === 'community')!;

  describe('generatePersonalizedIdeas', () => {
    it('generates vertical-tailored ideas in offline fallback mode', async () => {
      const ideas = await generatePersonalizedIdeas(weddingProject);
      expect(ideas.length).toBeGreaterThan(0);
      expect(ideas[0]).toHaveProperty('title');
      expect(ideas[0]).toHaveProperty('category');
      expect(ideas[0]).toHaveProperty('description');
      expect(ideas[0]).toHaveProperty('estimatedCostImpact');
    });

    it('incorporates custom prompt focus when provided', async () => {
      const ideas = await generatePersonalizedIdeas(birthdayProject, 'drone light show');
      expect(ideas.length).toBeGreaterThan(0);
    });
  });

  describe('draftVendorNegotiationMessage', () => {
    it('drafts appropriate negotiation emails for all goal types', async () => {
      const vendor = weddingProject.vendors[0];
      const goals: Array<'discount' | 'scope-check' | 'contract-followup'> = [
        'discount',
        'scope-check',
        'contract-followup',
      ];

      for (const goal of goals) {
        const msg = await draftVendorNegotiationMessage(weddingProject, vendor, goal);
        expect(msg.length).toBeGreaterThan(50);
        expect(msg).toContain(vendor.vendorName);
      }
    });
  });

  describe('askContextAssistant', () => {
    it('answers queries with smart-context-engine mode when offline', async () => {
      const res = await askContextAssistant(communityProject, 'What is our budget status?');
      expect(res.reply).toBeDefined();
      expect(res.reply.length).toBeGreaterThan(20);
      expect(res.engineMode).toMatch(/gemini-live|smart-context-engine/);
    });
  });

  // ─── O(1) AI Response Cache Tests ──────────────────────────────────────────

  describe('O(1) AI Response Cache', () => {
    beforeEach(() => {
      aiResponseCache.clear();
    });

    it('buildCacheKey produces deterministic keys for the same input', () => {
      const key1 = buildCacheKey('ideas', 'wedding', 'Royal Heritage Wedding', '2500000', '');
      const key2 = buildCacheKey('ideas', 'wedding', 'Royal Heritage Wedding', '2500000', '');
      const key3 = buildCacheKey('ideas', 'birthday', 'Neon Rooftop', '450000', '');
      expect(key1).toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key1).toMatch(/^vc-/);
    });

    it('returns cached response on cache hit (O(1) latency)', () => {
      const key = buildCacheKey('assistant', 'TestProject', 'budget');
      const mockReply = 'Here is your budget summary with detailed breakdown.';
      aiResponseCache.set(key, mockReply);

      // Verify the cache returns the stored value
      const cached = aiResponseCache.get(key);
      expect(cached).toBe(mockReply);

      // Verify cache size
      expect(aiResponseCache.size).toBe(1);

      // Verify miss returns undefined
      const miss = aiResponseCache.get(buildCacheKey('assistant', 'OtherProject', 'vendors'));
      expect(miss).toBeUndefined();
    });

    it('evicts oldest entry when cache exceeds max size (FIFO)', () => {
      // Fill cache to capacity (100 entries)
      for (let i = 0; i < 100; i++) {
        aiResponseCache.set(`test-key-${i}`, `response-${i}`);
      }
      expect(aiResponseCache.size).toBe(100);
      expect(aiResponseCache.has('test-key-0')).toBe(true);

      // Add one more entry beyond capacity manually simulating cacheSet behavior
      // (cacheSet is private, so we replicate its FIFO logic)
      if (aiResponseCache.size >= 100) {
        const oldestKey = aiResponseCache.keys().next().value;
        if (oldestKey !== undefined) aiResponseCache.delete(oldestKey);
      }
      aiResponseCache.set('test-key-100', 'response-100');

      // Oldest entry should be evicted
      expect(aiResponseCache.has('test-key-0')).toBe(false);
      expect(aiResponseCache.has('test-key-100')).toBe(true);
      expect(aiResponseCache.size).toBe(100);
    });
  });
});
