// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventWorkspace } from '../hooks/useEventWorkspace';
import { calculateEventReadiness } from '../services/contextEngine';

describe('End-to-End Readiness Recalculation', () => {
  it('recalculates readiness score dynamically after applying an idea', () => {
    const { result } = renderHook(() => useEventWorkspace());
    const ideaToApply = result.current.activeProject.savedIdeas[0];

    act(() => {
      result.current.applyIdeaToPlan(ideaToApply.id);
    });

    const updatedProject = result.current.activeProject;
    const updatedAppliedIdea = updatedProject.savedIdeas.find((i) => i.id === ideaToApply.id);
    expect(updatedAppliedIdea?.appliedToPlan).toBe(true);

    const recomputed = calculateEventReadiness(updatedProject);
    expect(recomputed.overallScore).toBeGreaterThanOrEqual(0);
    expect(recomputed.overallScore).toBeLessThanOrEqual(100);
    expect(updatedProject.decisionLogs[0].trigger).toContain('Idea Applied');
  });

  it('recalculates readiness and updates health indicators after a contingency scenario', () => {
    const { result } = renderHook(() => useEventWorkspace());
    const initialBudget = result.current.activeProject.totalBudget;

    act(() => {
      result.current.triggerContingencyScenario('budget-cut');
    });

    const modifiedProject = result.current.activeProject;
    expect(modifiedProject.totalBudget).toBeLessThan(initialBudget);

    const metricsAfter = result.current.readinessMetrics;
    expect(metricsAfter).toBeDefined();
    expect(metricsAfter.overallScore).toBeGreaterThanOrEqual(0);
    expect(metricsAfter.overallScore).toBeLessThanOrEqual(100);
    expect(metricsAfter.budgetHealth).toBeGreaterThanOrEqual(0);
    expect(metricsAfter.timelineHealth).toBeGreaterThanOrEqual(0);
    expect(metricsAfter.vendorReadiness).toBeGreaterThanOrEqual(0);
  });
});
