/**
 * @fileoverview Export helpers for generating executive markdown blueprints.
 */

import type { EventProject } from '../types/event';
import type { ReadinessScore } from '../services/contextEngine';

export function generateMarkdownBrief(project: EventProject, readinessMetrics: ReadinessScore): string {
  const totalAllocated = project.budgetCategories.reduce((s, c) => s + c.allocatedAmount, 0);
  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);

  const runOfShowItems = project.timelineItems
    .filter((i) => i.phase === 'run-of-show')
    .map(
      (i) =>
        `- **${i.timeSlot || i.timeframe}**: ${i.title} (${i.status.toUpperCase()}) — Assigned to ${i.assignee || 'Lead'}`
    )
    .join('\n');

  const budgetTable = project.budgetCategories
    .map(
      (c) =>
        `| ${c.name} | ${project.currency} ${c.allocatedAmount.toLocaleString()} | ${project.currency} ${c.spentAmount.toLocaleString()} | ${c.priority.toUpperCase()} | ${c.isLocked ? '🔒 Locked' : 'Unlocked'} |`
    )
    .join('\n');

  const vendorTable = project.vendors
    .map(
      (v) =>
        `| ${v.vendorName} (${v.category}) | ${project.currency} ${v.estimatedCost.toLocaleString()} | ${v.status.toUpperCase()} | ${v.contactEmail} |`
    )
    .join('\n');

  return `# ${project.title} — Executive Blueprint
*Generated via Vesta Event Studio · Celebration Operating System*

## 1. Executive Summary
- **Vertical:** ${project.vertical.toUpperCase()}
- **Host / Client:** ${project.personaName}
- **Target Date:** ${project.date}
- **Location:** ${project.location}
- **Guest Count:** ${project.guestCount} Attendees
- **Total Budget:** ${project.currency} ${project.totalBudget.toLocaleString()} (Cost Per Head: ${project.currency} ${Math.round(project.totalBudget / Math.max(1, project.guestCount)).toLocaleString()})
- **Physical Setting:** ${project.indoorOutdoor.toUpperCase()} (${project.season} season)
- **Vibe Aesthetic:** ${project.vibeTags.join(', ')}
- **Dietary Restrictions:** ${project.dietaryRestrictions.join(', ') || 'Standard Catering'}
- **Overall Readiness Health:** ${readinessMetrics.overallScore}/100

---

## 2. Day-Of Run-of-Show
${runOfShowItems || '_No run-of-show items registered._'}

---

## 3. Financial Allocation Matrix
| Category | Allocated | Spent | Priority | Lock Status |
| :--- | :--- | :--- | :--- | :--- |
${budgetTable}

- **Total Allocated:** ${project.currency} ${totalAllocated.toLocaleString()}
- **Actual Spend:** ${project.currency} ${totalSpent.toLocaleString()}
- **Available Buffer:** ${project.currency} ${(project.totalBudget - totalSpent).toLocaleString()}

---

## 4. Vendor Registry & Procurement
| Vendor | Estimated Quote | Status | Contact |
| :--- | :--- | :--- | :--- |
${vendorTable}
`;
}
