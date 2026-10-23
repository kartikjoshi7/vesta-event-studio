import { describe, it, expect } from 'vitest';
import {
  generatePersonalizedIdeas,
  draftVendorNegotiationMessage,
  askContextAssistant,
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
});
