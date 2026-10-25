/**
 * @fileoverview Deterministic budget rebalancing algorithm for Vesta Event Studio.
 */

import type { EventProject, BudgetCategory, ContextDecisionLog } from '../../types/event';
import { allocationRulesByVertical } from '../../data/verticalPersonas';

export interface RebalanceResult {
  updatedCategories: BudgetCategory[];
  decisionLog: ContextDecisionLog;
  warnings: string[];
}

function extractSlug(id: string): string {
  const parts = id.split('-');
  return parts.length > 1 ? parts.slice(1).join('-') : id;
}

export function rebalanceBudgetForContext(
  project: EventProject,
  newTotalBudget: number,
  newGuestCount: number,
  priorityFocus?: string,
): RebalanceResult {
  const warnings: string[] = [];
  const rules = allocationRulesByVertical[project.vertical];
  const guestRatio = project.guestCount > 0 ? newGuestCount / project.guestCount : 1;

  let lockedTotal = 0;
  for (const cat of project.budgetCategories) {
    if (cat.isLocked) lockedTotal += cat.allocatedAmount;
  }

  let availableBudget = Math.max(0, newTotalBudget - lockedTotal);
  const ruleMap = new Map(rules.map((r) => [r.categorySlug, r]));
  const variableUnlocked: BudgetCategory[] = [];
  const fixedUnlocked: BudgetCategory[] = [];

  for (const cat of project.budgetCategories) {
    if (cat.isLocked) continue;
    const rule = ruleMap.get(extractSlug(cat.id));
    if (rule?.isVariableCost) {
      variableUnlocked.push(cat);
    } else {
      fixedUnlocked.push(cat);
    }
  }

  let variableTotal = 0;
  const variableAllocations = new Map<string, number>();
  for (const cat of variableUnlocked) {
    const scaled = Math.round(cat.allocatedAmount * guestRatio);
    variableAllocations.set(cat.id, scaled);
    variableTotal += scaled;
  }

  let fixedBudget = Math.max(0, availableBudget - variableTotal);
  let priorityBonusId: string | null = null;
  let priorityBonusAmount = 0;

  if (priorityFocus) {
    const focusCat = fixedUnlocked.find((c) => extractSlug(c.id) === priorityFocus);
    if (focusCat) {
      priorityBonusAmount = Math.round(fixedBudget * 0.15);
      fixedBudget -= priorityBonusAmount;
      priorityBonusId = focusCat.id;
    }
  }

  const fixedRuleTotal = fixedUnlocked.reduce((sum, cat) => {
    return sum + (ruleMap.get(extractSlug(cat.id))?.defaultPct ?? 0.05);
  }, 0);

  const fixedAllocations = new Map<string, number>();
  for (const cat of fixedUnlocked) {
    const slug = extractSlug(cat.id);
    const pct = ruleMap.get(slug)?.defaultPct ?? 0.05;
    let alloc = Math.round((pct / fixedRuleTotal) * fixedBudget);
    if (cat.id === priorityBonusId) alloc += priorityBonusAmount;
    fixedAllocations.set(cat.id, alloc);
  }

  const updatedCategories: BudgetCategory[] = project.budgetCategories.map((cat) => {
    if (cat.isLocked) return { ...cat };
    const newAlloc = variableAllocations.get(cat.id) ?? fixedAllocations.get(cat.id) ?? cat.allocatedAmount;

    if (cat.spentAmount > newAlloc) {
      warnings.push(`⚠️ "${cat.name}" is over-budget: spent ₹${cat.spentAmount.toLocaleString('en-IN')} vs new allocation ₹${newAlloc.toLocaleString('en-IN')}.`);
    }
    return { ...cat, allocatedAmount: newAlloc };
  });

  const totalAllocated = updatedCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  if (totalAllocated > newTotalBudget) {
    warnings.push(`⚠️ Total allocations (₹${totalAllocated.toLocaleString('en-IN')}) exceed the new budget (₹${newTotalBudget.toLocaleString('en-IN')}) by ₹${(totalAllocated - newTotalBudget).toLocaleString('en-IN')}.`);
  }

  const decisionLog: ContextDecisionLog = {
    id: `cdl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    trigger: `Budget changed to ₹${newTotalBudget.toLocaleString('en-IN')}, guests to ${newGuestCount}${priorityFocus ? `, priority: ${priorityFocus}` : ''}`,
    reasoning: [
      `Vertical "${project.vertical}" rules applied.`,
      `Guest ratio: ${guestRatio.toFixed(2)}x — variable costs scaled proportionally.`,
      `Locked categories preserved (₹${lockedTotal.toLocaleString('en-IN')}).`,
      priorityFocus ? `Priority focus "${priorityFocus}" received 15% bonus.` : null,
      warnings.length > 0 ? `${warnings.length} warning(s) generated.` : 'No warnings.',
    ].filter(Boolean).join(' '),
    actionTaken: `Rebalanced ${updatedCategories.length} budget categories for new total ₹${newTotalBudget.toLocaleString('en-IN')}.`,
    impactLevel: Math.abs(newTotalBudget - project.totalBudget) / project.totalBudget > 0.2 ? 'high' : 'medium',
  };

  return { updatedCategories, decisionLog, warnings };
}
