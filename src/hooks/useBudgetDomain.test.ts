// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useBudgetDomain } from './useBudgetDomain';
import { allPersonas } from '../data/verticalPersonas';
import type { EventProject } from '../types/event';

describe('useBudgetDomain Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const useTestBudgetHarness = () => {
    const [project, setProject] = useState<EventProject>({ ...allPersonas[0] });
    const budgetDomain = useBudgetDomain(setProject);
    return { project, ...budgetDomain };
  };

  it('toggles category lock status and records audit decision', () => {
    const { result } = renderHook(() => useTestBudgetHarness());
    const targetCat = result.current.project.budgetCategories[0];
    const initialLock = targetCat.isLocked;

    act(() => {
      result.current.toggleCategoryLock(targetCat.id);
    });

    const updated = result.current.project.budgetCategories.find((c) => c.id === targetCat.id);
    expect(updated?.isLocked).toBe(!initialLock);
    expect(result.current.project.decisionLogs[0].trigger).toContain(targetCat.name);
  });

  it('updates category spend amount accurately', () => {
    const { result } = renderHook(() => useTestBudgetHarness());
    const targetCat = result.current.project.budgetCategories[0];

    act(() => {
      result.current.updateCategorySpend(targetCat.id, targetCat.allocatedAmount, 99999);
    });

    const updated = result.current.project.budgetCategories.find((c) => c.id === targetCat.id);
    expect(updated?.spentAmount).toBe(99999);
  });

  it('adds a new budget category and maintains total allocation', () => {
    const { result } = renderHook(() => useTestBudgetHarness());
    const initialCount = result.current.project.budgetCategories.length;

    act(() => {
      result.current.addBudgetCategory('Pyrotechnics & Fireworks', 75000, 'low');
    });

    expect(result.current.project.budgetCategories.length).toBe(initialCount + 1);
    const added = result.current.project.budgetCategories.find(
      (c) => c.name === 'Pyrotechnics & Fireworks',
    );
    expect(added).toBeDefined();
    expect(added?.allocatedAmount).toBe(75000);
  });

  it('does not mutate state if invalid category ID is provided for lock', () => {
    const { result } = renderHook(() => useTestBudgetHarness());
    const categoriesBefore = JSON.stringify(result.current.project.budgetCategories);

    act(() => {
      result.current.toggleCategoryLock('non-existent-id-999');
    });

    const categoriesAfter = JSON.stringify(result.current.project.budgetCategories);
    expect(categoriesBefore).toBe(categoriesAfter);
  });

  it('does not mutate state if invalid category ID is provided for spend update', () => {
    const { result } = renderHook(() => useTestBudgetHarness());
    const categoriesBefore = JSON.stringify(result.current.project.budgetCategories);

    act(() => {
      result.current.updateCategorySpend('invalid-id', 50000, 10000);
    });

    const categoriesAfter = JSON.stringify(result.current.project.budgetCategories);
    expect(categoriesBefore).toBe(categoriesAfter);
  });
});
