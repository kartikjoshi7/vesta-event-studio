// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventWorkspace } from './useEventWorkspace';

describe('useEventWorkspace Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default personas and computes readiness score', () => {
    const { result } = renderHook(() => useEventWorkspace());

    expect(result.current.projects.length).toBeGreaterThanOrEqual(3);
    expect(result.current.activeProject).toBeDefined();
    expect(result.current.activeProject.vertical).toBe('wedding');
    expect(result.current.readinessMetrics.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.current.readinessMetrics.overallScore).toBeLessThanOrEqual(100);
  });

  it('switches vertical project correctly', () => {
    const { result } = renderHook(() => useEventWorkspace());

    act(() => {
      result.current.selectVerticalProject('birthday');
    });

    expect(result.current.activeProject.vertical).toBe('birthday');
  });

  it('updates project context and triggers rebalancing', () => {
    const { result } = renderHook(() => useEventWorkspace());

    act(() => {
      result.current.updateProjectContext({
        totalBudget: 3000000,
        guestCount: 300,
      });
    });

    expect(result.current.activeProject.totalBudget).toBe(3000000);
    expect(result.current.activeProject.guestCount).toBe(300);
    expect(result.current.activeProject.decisionLogs[0].trigger).toMatch(/3,000,000|30,00,000/);
  });

  it('toggles category locks and logs decisions', () => {
    const { result } = renderHook(() => useEventWorkspace());
    const catId = result.current.activeProject.budgetCategories[0].id;
    const initialLockState = result.current.activeProject.budgetCategories[0].isLocked;

    act(() => {
      result.current.toggleCategoryLock(catId);
    });

    const updatedCat = result.current.activeProject.budgetCategories.find((c) => c.id === catId);
    expect(updatedCat?.isLocked).toBe(!initialLockState);
  });

  it('creates a custom project with rebalanced allocations', () => {
    const { result } = renderHook(() => useEventWorkspace());

    act(() => {
      result.current.createNewProject({
        title: 'Tech Gala 2026',
        vertical: 'community',
        totalBudget: 800000,
        guestCount: 400,
      });
    });

    expect(result.current.activeProject.title).toBe('Tech Gala 2026');
    expect(result.current.activeProject.vertical).toBe('community');
  });

  it('executes contingency simulation scenario', () => {
    const { result } = renderHook(() => useEventWorkspace());

    act(() => {
      result.current.triggerContingencyScenario('budget-cut');
    });

    expect(result.current.activeProject.decisionLogs[0].trigger).toContain('Contingency');
  });
});
