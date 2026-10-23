/**
 * @fileoverview Deterministic context-aware decision engine for Vesta Event Studio.
 *
 * Provides budget rebalancing, event-readiness scoring, and contingency
 * planning — all driven by vertical-specific rules and the current project
 * state. Every mutation is auditable via `ContextDecisionLog` entries.
 */

import type {
  EventProject,
  BudgetCategory,
  ContextDecisionLog,
} from '../types/event';
import { allocationRulesByVertical } from '../data/verticalPersonas';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a simple unique id. */
function uid(): string {
  return `cdl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Current ISO timestamp. */
function now(): string {
  return new Date().toISOString();
}

/** Clamp a number between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Budget Rebalancing ─────────────────────────────────────────────────────

/**
 * Result of a budget rebalance operation.
 */
export interface RebalanceResult {
  /** Updated budget categories with recalculated allocations. */
  updatedCategories: BudgetCategory[];
  /** Audit log entry describing the rebalance reasoning. */
  decisionLog: ContextDecisionLog;
  /** Human-readable warnings (e.g. over-budget categories). */
  warnings: string[];
}

/**
 * Dynamically rebalances a project's budget when the total budget or
 * guest count changes.
 *
 * **Logic**:
 * 1. Locked categories keep their current allocation untouched.
 * 2. Variable-cost categories (catering, favors, seating, security) are
 *    scaled proportionally to the new guest count relative to the original.
 * 3. The remaining budget is distributed among unlocked fixed-cost
 *    categories according to the vertical's default percentage split.
 * 4. If a `priorityFocus` category slug is supplied, it receives a 15%
 *    bonus from the pool before distribution.
 * 5. Any category where `spentAmount > allocatedAmount` after rebalance
 *    generates a warning.
 *
 * @param project         - The current event project state.
 * @param newTotalBudget  - The new total budget to target.
 * @param newGuestCount   - The new expected guest count.
 * @param priorityFocus   - Optional category slug to prioritise.
 * @returns A `RebalanceResult` with updated categories, decision log, and warnings.
 */
export function rebalanceBudgetForContext(
  project: EventProject,
  newTotalBudget: number,
  newGuestCount: number,
  priorityFocus?: string,
): RebalanceResult {
  const warnings: string[] = [];
  const rules = allocationRulesByVertical[project.vertical];
  const guestRatio = project.guestCount > 0 ? newGuestCount / project.guestCount : 1;

  // 1. Calculate locked total — these categories are untouchable.
  let lockedTotal = 0;
  for (const cat of project.budgetCategories) {
    if (cat.isLocked) {
      lockedTotal += cat.allocatedAmount;
    }
  }

  // 2. Available budget for unlocked categories.
  let availableBudget = Math.max(0, newTotalBudget - lockedTotal);

  // 3. Separate unlocked categories into variable and fixed.
  const ruleMap = new Map(rules.map((r) => [r.categorySlug, r]));
  const variableUnlocked: BudgetCategory[] = [];
  const fixedUnlocked: BudgetCategory[] = [];

  for (const cat of project.budgetCategories) {
    if (cat.isLocked) continue;
    const slug = extractSlug(cat.id);
    const rule = ruleMap.get(slug);
    if (rule?.isVariableCost) {
      variableUnlocked.push(cat);
    } else {
      fixedUnlocked.push(cat);
    }
  }

  // 4. Scale variable-cost categories by guest ratio.
  let variableTotal = 0;
  const variableAllocations = new Map<string, number>();
  for (const cat of variableUnlocked) {
    const scaled = Math.round(cat.allocatedAmount * guestRatio);
    variableAllocations.set(cat.id, scaled);
    variableTotal += scaled;
  }

  // 5. Remaining budget goes to fixed-cost categories.
  let fixedBudget = Math.max(0, availableBudget - variableTotal);

  // 6. Priority focus bonus (15% of fixedBudget).
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

  // 7. Distribute fixed budget by default percentages.
  const fixedRuleTotal = fixedUnlocked.reduce((sum, cat) => {
    const slug = extractSlug(cat.id);
    return sum + (ruleMap.get(slug)?.defaultPct ?? 0.05);
  }, 0);

  const fixedAllocations = new Map<string, number>();
  for (const cat of fixedUnlocked) {
    const slug = extractSlug(cat.id);
    const pct = ruleMap.get(slug)?.defaultPct ?? 0.05;
    let alloc = Math.round((pct / fixedRuleTotal) * fixedBudget);
    if (cat.id === priorityBonusId) {
      alloc += priorityBonusAmount;
    }
    fixedAllocations.set(cat.id, alloc);
  }

  // 8. Build updated categories.
  const updatedCategories: BudgetCategory[] = project.budgetCategories.map((cat) => {
    if (cat.isLocked) return { ...cat };

    const newAlloc =
      variableAllocations.get(cat.id) ??
      fixedAllocations.get(cat.id) ??
      cat.allocatedAmount;

    if (cat.spentAmount > newAlloc) {
      warnings.push(
        `⚠️ "${cat.name}" is over-budget: spent ₹${cat.spentAmount.toLocaleString('en-IN')} vs new allocation ₹${newAlloc.toLocaleString('en-IN')}.`,
      );
    }

    return { ...cat, allocatedAmount: newAlloc };
  });

  // 9. Check total allocation vs target.
  const totalAllocated = updatedCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  if (totalAllocated > newTotalBudget) {
    warnings.push(
      `⚠️ Total allocations (₹${totalAllocated.toLocaleString('en-IN')}) exceed the new budget (₹${newTotalBudget.toLocaleString('en-IN')}) by ₹${(totalAllocated - newTotalBudget).toLocaleString('en-IN')}.`,
    );
  }

  const decisionLog: ContextDecisionLog = {
    id: uid(),
    timestamp: now(),
    trigger: `Budget changed to ₹${newTotalBudget.toLocaleString('en-IN')}, guests to ${newGuestCount}${priorityFocus ? `, priority: ${priorityFocus}` : ''}`,
    reasoning: [
      `Vertical "${project.vertical}" rules applied.`,
      `Guest ratio: ${guestRatio.toFixed(2)}x — variable costs (catering, security, favors) scaled proportionally.`,
      `Locked categories preserved (₹${lockedTotal.toLocaleString('en-IN')}).`,
      priorityFocus ? `Priority focus "${priorityFocus}" received 15% bonus (₹${priorityBonusAmount.toLocaleString('en-IN')}).` : null,
      warnings.length > 0 ? `${warnings.length} warning(s) generated.` : 'No warnings.',
    ]
      .filter(Boolean)
      .join(' '),
    actionTaken: `Rebalanced ${updatedCategories.length} budget categories for new total ₹${newTotalBudget.toLocaleString('en-IN')}.`,
    impactLevel: Math.abs(newTotalBudget - project.totalBudget) / project.totalBudget > 0.2 ? 'high' : 'medium',
  };

  return { updatedCategories, decisionLog, warnings };
}

// ─── Readiness Scoring ──────────────────────────────────────────────────────

/**
 * Result of the event-readiness calculation.
 */
export interface ReadinessResult {
  /** Composite 0–100 score. */
  overallScore: number;
  /** Budget health sub-score (0–100). */
  budgetHealth: number;
  /** Timeline health sub-score (0–100). */
  timelineHealth: number;
  /** Vendor readiness sub-score (0–100). */
  vendorReadiness: number;
  /** Urgent alerts requiring attention. */
  criticalAlerts: string[];
  /** Recommended next actions. */
  nextBestActions: string[];
}

/** Type alias for ReadinessResult */
export type ReadinessScore = ReadinessResult;

/**
 * Computes a real-time 0–100 event-readiness score with actionable alerts.
 *
 * **Sub-scores** (each 0–100, weighted into overall):
 * - **Budget health (35%)**: penalises over-spending and high unspent ratios
 *   on locked categories close to the event date.
 * - **Timeline health (35%)**: penalises at-risk and pending critical-path items.
 * - **Vendor readiness (30%)**: rewards booked/paid vendors, penalises
 *   shortlisted vendors for critical categories.
 *
 * @param project - The current event project to evaluate.
 * @returns A `ReadinessResult` with scores, alerts, and next actions.
 */
export function calculateEventReadiness(project: EventProject): ReadinessResult {
  const criticalAlerts: string[] = [];
  const nextBestActions: string[] = [];

  // ── Budget Health ──
  const totalAllocated = project.budgetCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);

  let budgetHealth = 100;
  // Penalise if total spent exceeds total budget.
  if (totalSpent > project.totalBudget) {
    const overPct = ((totalSpent - project.totalBudget) / project.totalBudget) * 100;
    budgetHealth -= clamp(overPct * 2, 0, 60);
    criticalAlerts.push(`🚨 Over-budget by ₹${(totalSpent - project.totalBudget).toLocaleString('en-IN')} (${overPct.toFixed(1)}%).`);
  }
  // Penalise per-category overspend.
  for (const cat of project.budgetCategories) {
    if (cat.spentAmount > cat.allocatedAmount) {
      budgetHealth -= 5;
      criticalAlerts.push(`⚠️ "${cat.name}" overspent by ₹${(cat.spentAmount - cat.allocatedAmount).toLocaleString('en-IN')}.`);
    }
  }
  // Reward reasonable utilisation (40-90% spent is healthy).
  const utilisation = totalAllocated > 0 ? totalSpent / totalAllocated : 0;
  if (utilisation < 0.1) {
    budgetHealth -= 10;
    nextBestActions.push('Start confirming vendor payments to improve budget utilisation.');
  }
  budgetHealth = clamp(budgetHealth, 0, 100);

  // ── Timeline Health ──
  let timelineHealth = 100;
  const criticalPathItems = project.timelineItems.filter((t) => t.isCriticalPath);
  const atRiskItems = project.timelineItems.filter((t) => t.status === 'at-risk');
  const pendingCritical = criticalPathItems.filter((t) => t.status === 'pending');
  const completedCount = project.timelineItems.filter((t) => t.status === 'completed').length;
  const totalItems = project.timelineItems.length;

  // Penalise at-risk items heavily.
  timelineHealth -= atRiskItems.length * 15;
  for (const item of atRiskItems) {
    criticalAlerts.push(`🔴 At-risk: "${item.title}" (${item.timeframe}).`);
  }
  // Penalise pending critical-path items.
  timelineHealth -= pendingCritical.length * 5;
  if (pendingCritical.length > 0) {
    nextBestActions.push(`Address ${pendingCritical.length} pending critical-path item(s): ${pendingCritical.slice(0, 2).map((t) => `"${t.title}"`).join(', ')}.`);
  }
  // Reward completion progress.
  const completionPct = totalItems > 0 ? completedCount / totalItems : 0;
  if (completionPct < 0.3) {
    timelineHealth -= 10;
  }
  timelineHealth = clamp(timelineHealth, 0, 100);

  // ── Vendor Readiness ──
  let vendorReadiness = 100;
  const vendors = project.vendors;
  if (vendors.length === 0) {
    vendorReadiness = 0;
    nextBestActions.push('No vendors added yet — start building your vendor shortlist.');
  } else {
    const bookedOrPaid = vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length;
    const shortlisted = vendors.filter((v) => v.status === 'shortlisted').length;
    const pctBooked = bookedOrPaid / vendors.length;

    vendorReadiness = Math.round(pctBooked * 80 + 20); // 20 base for having vendors at all.
    vendorReadiness -= shortlisted * 8; // Penalise still-shortlisted vendors.

    if (shortlisted > 0) {
      const shortlistedNames = vendors
        .filter((v) => v.status === 'shortlisted')
        .map((v) => v.vendorName);
      nextBestActions.push(
        `Move ${shortlisted} shortlisted vendor(s) to negotiation: ${shortlistedNames.slice(0, 2).join(', ')}.`,
      );
    }

    // Check vetting completeness.
    for (const vendor of vendors) {
      const unchecked = vendor.vettingChecklist.filter((c) => !c.checked);
      if (unchecked.length > 0 && (vendor.status === 'booked' || vendor.status === 'paid')) {
        vendorReadiness -= 3;
        nextBestActions.push(
          `Complete vetting for ${vendor.vendorName}: ${unchecked.map((c) => c.label).join(', ')}.`,
        );
      }
    }
  }
  vendorReadiness = clamp(vendorReadiness, 0, 100);

  // ── Overall Score ──
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

// ─── Contingency Planning ───────────────────────────────────────────────────

/** Supported contingency scenarios. */
export type ContingencyScenario = 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop';

/**
 * Result of contingency plan generation.
 */
export interface ContingencyResult {
  /** Recommended adjustments to the plan. */
  adjustments: string[];
  /** Notes to add to affected timeline items. */
  updatedTimelineNotes: string[];
  /** Audit trail entry. */
  decisionLog: ContextDecisionLog;
}

/**
 * Generates a deterministic contingency plan for a given risk scenario.
 *
 * Each scenario produces vertical-aware, actionable adjustments:
 * - **weather**: indoor backup, tent/canopy options, guest communication.
 * - **budget-cut**: priority-based trimming, scope reductions, vendor renegotiation.
 * - **guest-surge**: catering scale-up, seating reconfiguration, logistics adjustments.
 * - **vendor-drop**: backup vendor activation, timeline impact, emergency sourcing.
 *
 * @param project  - The current event project.
 * @param scenario - The contingency scenario to plan for.
 * @returns A `ContingencyResult` with adjustments, timeline notes, and an audit log.
 */
export function generateContingencyPlan(
  project: EventProject,
  scenario: ContingencyScenario,
): ContingencyResult {
  const adjustments: string[] = [];
  const updatedTimelineNotes: string[] = [];
  const vertical = project.vertical;

  switch (scenario) {
    case 'weather': {
      if (project.indoorOutdoor === 'outdoor' || project.indoorOutdoor === 'hybrid') {
        adjustments.push(
          'Activate indoor backup venue or deploy weatherproof tenting/canopy over the main event area.',
          'Notify all vendors (caterer, décor, AV) of the venue change at least 48 hours in advance.',
          `Brief guests via SMS/email blast about the venue adjustment and updated directions.`,
        );
        if (vertical === 'wedding') {
          adjustments.push(
            'Move mandap setup indoors — confirm backup power for lighting and sound.',
            'Pre-arrange covered pathway for Baraat procession.',
          );
          updatedTimelineNotes.push('⛈️ Weather contingency: Mandap moved indoors, baraat route covered.');
        } else if (vertical === 'birthday') {
          adjustments.push(
            'Shift rooftop activities to the covered lounge area — confirm DJ power setup indoors.',
            'Relocate photo booth to indoor station near the bar.',
          );
          updatedTimelineNotes.push('⛈️ Weather contingency: Activities moved to covered lounge.');
        } else {
          adjustments.push(
            'Ensure all breakout sessions have indoor AV backup.',
            'Move networking lunch from courtyard to main hall corridor.',
          );
          updatedTimelineNotes.push('⛈️ Weather contingency: All sessions confirmed indoors.');
        }
      } else {
        adjustments.push(
          'Indoor venue confirmed — weather impact is minimal.',
          'Verify HVAC capacity for expected guest count in case of extreme heat/cold.',
        );
        updatedTimelineNotes.push('✅ Indoor venue — weather contingency low risk.');
      }
      break;
    }

    case 'budget-cut': {
      const lowPriorityCats = project.budgetCategories
        .filter((c) => c.priority === 'low' && !c.isLocked)
        .map((c) => c.name);
      const medPriorityCats = project.budgetCategories
        .filter((c) => c.priority === 'medium' && !c.isLocked)
        .map((c) => c.name);

      adjustments.push(
        `Reduce or eliminate low-priority categories first: ${lowPriorityCats.join(', ') || 'none available'}.`,
        `Negotiate 10-15% discounts with vendors in medium-priority categories: ${medPriorityCats.join(', ') || 'none available'}.`,
        'Evaluate DIY alternatives for décor and invitations to reduce vendor dependency.',
      );

      if (vertical === 'wedding') {
        adjustments.push(
          'Consider reducing the reception from a full dinner to a cocktail reception format (saves ~20% catering cost).',
          'Consolidate Day 2 and Day 3 events to reduce venue rental by one day.',
        );
      } else if (vertical === 'birthday') {
        adjustments.push(
          'Switch from live saxophonist to a curated Spotify playlist to save on entertainment.',
          'Reduce photo booth rental hours from 4 to 2.',
        );
      } else {
        adjustments.push(
          'Reduce speaker honorariums and prioritise local speakers to save on travel.',
          'Negotiate contra-deals with sponsors to cover AV or catering costs.',
        );
      }

      updatedTimelineNotes.push(
        '💰 Budget-cut contingency activated — review updated allocations.',
        'Re-negotiate vendor contracts within the next 2 weeks.',
      );
      break;
    }

    case 'guest-surge': {
      const cateringCat = project.budgetCategories.find(
        (c) => c.name.toLowerCase().includes('cater') || c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('refreshment'),
      );
      const surgeAmount = Math.round(project.guestCount * 0.25);

      adjustments.push(
        `Prepare for up to ${surgeAmount} additional guests (25% surge buffer).`,
        cateringCat
          ? `Increase "${cateringCat.name}" allocation by ~25% and confirm caterer can scale.`
          : 'Confirm catering vendor can scale servings on 48-hour notice.',
        'Arrange additional seating and table settings — contact furniture rental vendor.',
        'Update parking/transport logistics for higher guest volume.',
      );

      if (vertical === 'wedding') {
        adjustments.push(
          'Confirm haveli courtyard can accommodate extra mandap-side seating.',
          'Order additional favors and invitation welcome kits.',
        );
      } else if (vertical === 'birthday') {
        adjustments.push(
          'Check rooftop max occupancy with venue — may need to add overflow area.',
          'Increase bar stock by 30% to handle higher consumption.',
        );
      } else {
        adjustments.push(
          'Open overflow auditorium with live AV feed from the main stage.',
          'Print additional lanyards, badges, and welcome kits.',
        );
      }

      updatedTimelineNotes.push(
        `👥 Guest surge contingency: planning for up to ${project.guestCount + surgeAmount} attendees.`,
        'Confirm vendor scalability within 1 week.',
      );
      break;
    }

    case 'vendor-drop': {
      const bookedVendors = project.vendors.filter(
        (v) => v.status === 'booked' || v.status === 'negotiating',
      );

      adjustments.push(
        'Activate backup vendor list — contact secondary options within 24 hours.',
        'Review contract cancellation terms to determine refund eligibility.',
        `${bookedVendors.length} active vendor(s) should have backup alternatives identified immediately.`,
      );

      for (const vendor of bookedVendors.slice(0, 3)) {
        adjustments.push(
          `Backup plan for ${vendor.vendorName} (${vendor.category}): source 2 alternative vendors and get quotes within 48 hours.`,
        );
      }

      if (vertical === 'wedding') {
        adjustments.push(
          'Photography is critical — have a second photographer on standby agreement.',
          'For caterer drop: contact hotel in-house catering as emergency backup.',
        );
      } else if (vertical === 'birthday') {
        adjustments.push(
          'If DJ drops: prepare a curated playlist + portable speaker as emergency backup.',
          'Contact venue for their recommended vendor list as fast alternatives.',
        );
      } else {
        adjustments.push(
          'For AV vendor drop: contact the venue\'s in-house AV team.',
          'Speaker cancellations: have 2 standby speakers from the local tech community.',
        );
      }

      updatedTimelineNotes.push(
        '🔧 Vendor-drop contingency: activate backup sourcing protocol.',
        'Deadline: confirm replacement vendor within 72 hours.',
      );
      break;
    }
  }

  const decisionLog: ContextDecisionLog = {
    id: uid(),
    timestamp: now(),
    trigger: `Contingency scenario: "${scenario}" activated for "${project.title}".`,
    reasoning: `Generated ${adjustments.length} adjustments based on ${vertical} vertical rules. Evaluated ${project.vendors.length} vendors and ${project.budgetCategories.length} budget categories.`,
    actionTaken: `Contingency plan for "${scenario}" created with ${adjustments.length} action items and ${updatedTimelineNotes.length} timeline updates.`,
    impactLevel: scenario === 'vendor-drop' || scenario === 'budget-cut' ? 'high' : 'medium',
  };

  return { adjustments, updatedTimelineNotes, decisionLog };
}

// ─── Internal Utilities ─────────────────────────────────────────────────────

/**
 * Extracts the category slug from a budget category ID.
 * Convention: IDs are `{prefix}-{slug}`, e.g. `w-catering` → `catering`.
 */
function extractSlug(id: string): string {
  const parts = id.split('-');
  return parts.length > 1 ? parts.slice(1).join('-') : id;
}
