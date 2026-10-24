/**
 * @fileoverview Budget Domain Hook for Vesta Event Studio.
 *
 * Encapsulates financial operations: category locking, spend tracking,
 * and custom category insertion with auditable decision logs.
 */

import { useCallback } from 'react';
import type { EventProject, BudgetCategory, ContextDecisionLog } from '../types/event';
import { sanitizeUserInput } from '../utils/security';

function uid(prefix: string = 'cat'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface UseBudgetDomainReturn {
  toggleCategoryLock: (categoryId: string) => void;
  updateCategorySpend: (categoryId: string, allocated: number, spent: number) => void;
  addBudgetCategory: (name: string, allocated: number, priority: 'high' | 'medium' | 'low') => void;
}

export function useBudgetDomain(
  updateActiveProject: (updater: (prev: EventProject) => EventProject) => void,
): UseBudgetDomainReturn {
  // Toggle category lock state to preserve fixed costs during dynamic rebalancing
  const toggleCategoryLock = useCallback(
    (categoryId: string) => {
      updateActiveProject((current) => {
        let toggledName = '';
        let wasLocked = false;

        const updatedCategories = current.budgetCategories.map((cat) => {
          if (cat.id === categoryId) {
            toggledName = cat.name;
            wasLocked = cat.isLocked;
            return { ...cat, isLocked: !cat.isLocked };
          }
          return cat;
        });

        const log: ContextDecisionLog = {
          id: uid('cdl'),
          timestamp: nowIso(),
          trigger: `Category Lock: ${toggledName}`,
          reasoning: wasLocked
            ? `Category "${toggledName}" unlocked; AI context engine will now adjust it during dynamic rebalancing.`
            : `Category "${toggledName}" locked; AI context engine will preserve this fixed allocation.`,
          actionTaken: wasLocked ? `Unlocked "${toggledName}"` : `Locked "${toggledName}"`,
          impactLevel: 'low',
        };

        return {
          ...current,
          budgetCategories: updatedCategories,
          decisionLogs: [log, ...current.decisionLogs],
        };
      });
    },
    [updateActiveProject],
  );

  // Update allocation or spent amount for an existing category
  const updateCategorySpend = useCallback(
    (categoryId: string, allocated: number, spent: number) => {
      updateActiveProject((current) => {
        const updatedCategories = current.budgetCategories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              allocatedAmount: Math.max(0, allocated),
              spentAmount: Math.max(0, spent),
            };
          }
          return cat;
        });

        return {
          ...current,
          budgetCategories: updatedCategories,
        };
      });
    },
    [updateActiveProject],
  );

  // Add a new custom budget category line item
  const addBudgetCategory = useCallback(
    (name: string, allocated: number, priority: 'high' | 'medium' | 'low') => {
      const sanitizedName = sanitizeUserInput(name, 50);
      if (!sanitizedName) return;

      const newCategory: BudgetCategory = {
        id: uid('cat'),
        name: sanitizedName,
        allocatedAmount: Math.max(0, allocated),
        spentAmount: 0,
        priority,
        isLocked: false,
        notes: 'Added by planner',
      };

      updateActiveProject((current) => {
        const log: ContextDecisionLog = {
          id: uid('cdl'),
          timestamp: nowIso(),
          trigger: `Added Budget Category: ${sanitizedName}`,
          reasoning: `Planner added custom line-item with ${current.currency} ${allocated.toLocaleString()} allocation.`,
          actionTaken: `Inserted category "${sanitizedName}" with ${priority.toUpperCase()} priority.`,
          impactLevel: 'low',
        };

        return {
          ...current,
          budgetCategories: [...current.budgetCategories, newCategory],
          decisionLogs: [log, ...current.decisionLogs],
        };
      });
    },
    [updateActiveProject],
  );

  return {
    toggleCategoryLock,
    updateCategorySpend,
    addBudgetCategory,
  };
}
