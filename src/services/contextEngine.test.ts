import { describe, it, expect } from 'vitest';
import {
  rebalanceBudgetForContext,
  calculateEventReadiness,
  generateContingencyPlan,
} from './contextEngine';
import { allPersonas } from '../data/verticalPersonas';

describe('Context Engine', () => {
  const weddingProject = allPersonas.find((p) => p.vertical === 'wedding')!;
  const birthdayProject = allPersonas.find((p) => p.vertical === 'birthday')!;
  const communityProject = allPersonas.find((p) => p.vertical === 'community')!;

  describe('rebalanceBudgetForContext', () => {
    it('rebalances budget allocations while respecting total target', () => {
      const result = rebalanceBudgetForContext(weddingProject, 2000000, 200);
      expect(result.updatedCategories.length).toBeGreaterThan(0);
      expect(result.decisionLog).toBeDefined();
      expect(result.decisionLog.trigger).toMatch(/20.*000/);
      
      const totalAllocated = result.updatedCategories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(totalAllocated).toBeCloseTo(2000000, -2);
    });

    it('protects locked budget categories from reallocation', () => {
      const lockedCatId = weddingProject.budgetCategories[0].id;
      const lockedOriginalAmount = weddingProject.budgetCategories[0].allocatedAmount;
      const projectWithLocked = {
        ...weddingProject,
        budgetCategories: weddingProject.budgetCategories.map((c) =>
          c.id === lockedCatId ? { ...c, isLocked: true } : c
        ),
      };

      const result = rebalanceBudgetForContext(projectWithLocked, 1500000, 150);
      const lockedAfter = result.updatedCategories.find((c) => c.id === lockedCatId);
      expect(lockedAfter?.allocatedAmount).toBe(lockedOriginalAmount);
    });

    it('emits warnings when spent amount exceeds new allocation', () => {
      const result = rebalanceBudgetForContext(weddingProject, 500000, 100);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('calculateEventReadiness', () => {
    it('calculates 0-100 readiness scores for all verticals', () => {
      for (const project of [weddingProject, birthdayProject, communityProject]) {
        const score = calculateEventReadiness(project);
        expect(score.overallScore).toBeGreaterThanOrEqual(0);
        expect(score.overallScore).toBeLessThanOrEqual(100);
        expect(score.budgetHealth).toBeGreaterThanOrEqual(0);
        expect(score.budgetHealth).toBeLessThanOrEqual(100);
        expect(score.timelineHealth).toBeGreaterThanOrEqual(0);
        expect(score.vendorReadiness).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(score.criticalAlerts)).toBe(true);
        expect(Array.isArray(score.nextBestActions)).toBe(true);
      }
    });
  });

  describe('generateContingencyPlan', () => {
    it('generates scenario-specific adjustments and decision logs', () => {
      const scenarios: Array<'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop'> = [
        'weather',
        'budget-cut',
        'guest-surge',
        'vendor-drop',
      ];

      for (const scenario of scenarios) {
        const plan = generateContingencyPlan(weddingProject, scenario);
        expect(plan.adjustments.length).toBeGreaterThan(0);
        expect(plan.updatedTimelineNotes.length).toBeGreaterThan(0);
        expect(plan.decisionLog.impactLevel).toMatch(/high|medium|low/);
      }
    });
  });
});
