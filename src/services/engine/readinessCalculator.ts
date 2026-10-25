/**
 * @fileoverview Deterministic event-readiness composite scoring engine for Vesta Event Studio.
 */

import type { EventProject } from '../../types/event';

export interface ReadinessResult {
  overallScore: number;
  budgetHealth: number;
  timelineHealth: number;
  vendorReadiness: number;
  criticalAlerts: string[];
  nextBestActions: string[];
}

export type ReadinessScore = ReadinessResult;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateEventReadiness(project: EventProject): ReadinessResult {
  const criticalAlerts: string[] = [];
  const nextBestActions: string[] = [];

  // 1. Budget Health (35%)
  const totalAllocated = project.budgetCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);
  let budgetHealth = 100;

  if (totalSpent > project.totalBudget) {
    const overPct = ((totalSpent - project.totalBudget) / project.totalBudget) * 100;
    budgetHealth -= clamp(overPct * 2, 0, 60);
    criticalAlerts.push(`🚨 Over-budget by ₹${(totalSpent - project.totalBudget).toLocaleString('en-IN')} (${overPct.toFixed(1)}%).`);
  }

  for (const cat of project.budgetCategories) {
    if (cat.spentAmount > cat.allocatedAmount) {
      budgetHealth -= 5;
      criticalAlerts.push(`⚠️ "${cat.name}" overspent by ₹${(cat.spentAmount - cat.allocatedAmount).toLocaleString('en-IN')}.`);
    }
  }

  const utilisation = totalAllocated > 0 ? totalSpent / totalAllocated : 0;
  if (utilisation < 0.1) {
    budgetHealth -= 10;
    nextBestActions.push('Start confirming vendor payments to improve budget utilisation.');
  }
  budgetHealth = clamp(budgetHealth, 0, 100);

  // 2. Timeline Health (35%)
  let timelineHealth = 100;
  const criticalPathItems = project.timelineItems.filter((t) => t.isCriticalPath);
  const atRiskItems = project.timelineItems.filter((t) => t.status === 'at-risk');
  const pendingCritical = criticalPathItems.filter((t) => t.status === 'pending');
  const completedCount = project.timelineItems.filter((t) => t.status === 'completed').length;
  const totalItems = project.timelineItems.length;

  timelineHealth -= atRiskItems.length * 15;
  for (const item of atRiskItems) {
    criticalAlerts.push(`🔴 At-risk: "${item.title}" (${item.timeframe}).`);
  }

  timelineHealth -= pendingCritical.length * 5;
  if (pendingCritical.length > 0) {
    nextBestActions.push(`Address ${pendingCritical.length} pending critical-path item(s): ${pendingCritical.slice(0, 2).map((t) => `"${t.title}"`).join(', ')}.`);
  }

  const completionPct = totalItems > 0 ? completedCount / totalItems : 0;
  if (completionPct < 0.3) timelineHealth -= 10;
  timelineHealth = clamp(timelineHealth, 0, 100);

  // 3. Vendor Readiness (30%)
  let vendorReadiness = 100;
  const vendors = project.vendors;
  if (vendors.length === 0) {
    vendorReadiness = 0;
    nextBestActions.push('No vendors added yet — start building your vendor shortlist.');
  } else {
    const bookedOrPaid = vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length;
    const shortlisted = vendors.filter((v) => v.status === 'shortlisted').length;
    const pctBooked = bookedOrPaid / vendors.length;

    vendorReadiness = Math.round(pctBooked * 80 + 20);
    vendorReadiness -= shortlisted * 8;

    if (shortlisted > 0) {
      const shortlistedNames = vendors.filter((v) => v.status === 'shortlisted').map((v) => v.vendorName);
      nextBestActions.push(`Move ${shortlisted} shortlisted vendor(s) to negotiation: ${shortlistedNames.slice(0, 2).join(', ')}.`);
    }

    for (const vendor of vendors) {
      const unchecked = vendor.vettingChecklist.filter((c) => !c.checked);
      if (unchecked.length > 0 && (vendor.status === 'booked' || vendor.status === 'paid')) {
        vendorReadiness -= 3;
        nextBestActions.push(`Complete vetting for ${vendor.vendorName}: ${unchecked.map((c) => c.label).join(', ')}.`);
      }
    }
  }
  vendorReadiness = clamp(vendorReadiness, 0, 100);

  const overallScore = clamp(
    Math.round(budgetHealth * 0.35 + timelineHealth * 0.35 + vendorReadiness * 0.30),
    0,
    100,
  );

  return {
    overallScore,
    budgetHealth,
    timelineHealth,
    vendorReadiness,
    criticalAlerts,
    nextBestActions,
  };
}
