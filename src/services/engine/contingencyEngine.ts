/**
 * @fileoverview Deterministic parametric contingency planning engine for Vesta Event Studio.
 */

import type { EventProject, ContextDecisionLog } from '../../types/event';

export type ContingencyScenario = 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop';

export interface ContingencyResult {
  adjustments: string[];
  updatedTimelineNotes: string[];
  decisionLog: ContextDecisionLog;
}

function handleWeather(project: EventProject, adjustments: string[], notes: string[]) {
  if (project.indoorOutdoor === 'outdoor' || project.indoorOutdoor === 'hybrid') {
    adjustments.push(
      'Activate indoor backup venue or deploy weatherproof tenting/canopy over the main event area.',
      'Notify all vendors (caterer, décor, AV) of the venue change at least 48 hours in advance.',
      'Brief guests via SMS/email blast about the venue adjustment and updated directions.',
    );
    if (project.vertical === 'wedding') {
      adjustments.push('Move mandap setup indoors — confirm backup power for lighting and sound.', 'Pre-arrange covered pathway for Baraat procession.');
      notes.push('⛈️ Weather contingency: Mandap moved indoors, baraat route covered.');
    } else if (project.vertical === 'birthday') {
      adjustments.push('Shift rooftop activities to the covered lounge area — confirm DJ power setup indoors.', 'Relocate photo booth to indoor station near the bar.');
      notes.push('⛈️ Weather contingency: Activities moved to covered lounge.');
    } else {
      adjustments.push('Ensure all breakout sessions have indoor AV backup.', 'Move networking lunch from courtyard to main hall corridor.');
      notes.push('⛈️ Weather contingency: All sessions confirmed indoors.');
    }
  } else {
    adjustments.push('Indoor venue confirmed — weather impact is minimal.', 'Verify HVAC capacity for expected guest count in case of extreme heat/cold.');
    notes.push('✅ Indoor venue — weather contingency low risk.');
  }
}

function handleBudgetCut(project: EventProject, adjustments: string[], notes: string[]) {
  const low = project.budgetCategories.filter((c) => c.priority === 'low' && !c.isLocked).map((c) => c.name);
  const med = project.budgetCategories.filter((c) => c.priority === 'medium' && !c.isLocked).map((c) => c.name);

  adjustments.push(
    `Reduce or eliminate low-priority categories first: ${low.join(', ') || 'none available'}.`,
    `Negotiate 10-15% discounts with vendors in medium-priority categories: ${med.join(', ') || 'none available'}.`,
    'Evaluate DIY alternatives for décor and invitations to reduce vendor dependency.',
  );

  if (project.vertical === 'wedding') {
    adjustments.push('Consider cocktail reception format (saves ~20% catering cost).', 'Consolidate Day 2 and Day 3 events to save on venue rental.');
  } else if (project.vertical === 'birthday') {
    adjustments.push('Switch to curated playlist to save on live entertainment.', 'Reduce photo booth rental hours from 4 to 2.');
  } else {
    adjustments.push('Prioritise local speakers to save on travel.', 'Negotiate contra-deals with sponsors to cover AV or catering costs.');
  }
  notes.push('💰 Budget-cut contingency activated — review updated allocations.', 'Re-negotiate vendor contracts within the next 2 weeks.');
}

function handleGuestSurge(project: EventProject, adjustments: string[], notes: string[]) {
  const catering = project.budgetCategories.find((c) => c.name.toLowerCase().includes('cater') || c.name.toLowerCase().includes('food'));
  const surge = Math.round(project.guestCount * 0.25);

  adjustments.push(
    `Prepare for up to ${surge} additional guests (25% surge buffer).`,
    catering ? `Increase "${catering.name}" allocation by ~25% and confirm caterer can scale.` : 'Confirm catering vendor can scale servings on 48h notice.',
    'Arrange additional seating and table settings with furniture rental vendor.',
    'Update parking and transport logistics for higher guest volume.',
  );

  if (project.vertical === 'wedding') {
    adjustments.push('Confirm haveli courtyard can accommodate extra mandap-side seating.', 'Order additional favors and welcome kits.');
  } else if (project.vertical === 'birthday') {
    adjustments.push('Check rooftop max occupancy with venue for overflow.', 'Increase bar stock by 30% to handle higher consumption.');
  } else {
    adjustments.push('Open overflow auditorium with live AV feed from main stage.', 'Print additional lanyards, badges, and welcome kits.');
  }
  notes.push(`👥 Guest surge contingency: planning for up to ${project.guestCount + surge} attendees.`, 'Confirm vendor scalability within 1 week.');
}

function handleVendorDrop(project: EventProject, adjustments: string[], notes: string[]) {
  const active = project.vendors.filter((v) => v.status === 'booked' || v.status === 'negotiating');
  adjustments.push(
    'Activate backup vendor list — contact secondary options within 24 hours.',
    'Review contract cancellation terms to determine refund eligibility.',
    `${active.length} active vendor(s) should have backup alternatives identified immediately.`,
  );

  for (const vendor of active.slice(0, 3)) {
    adjustments.push(`Backup plan for ${vendor.vendorName} (${vendor.category}): source 2 alternatives within 48h.`);
  }

  if (project.vertical === 'wedding') {
    adjustments.push('Photography is critical — have second photographer on standby.', 'For caterer drop: contact hotel in-house catering as emergency backup.');
  } else if (project.vertical === 'birthday') {
    adjustments.push('If DJ drops: prepare curated playlist + portable speaker.', 'Contact venue for their recommended vendor emergency list.');
  } else {
    adjustments.push('For AV vendor drop: contact venue in-house AV team.', 'Speaker cancellations: have 2 standby speakers from local community.');
  }
  notes.push('🔧 Vendor-drop contingency: activate backup sourcing protocol.', 'Deadline: confirm replacement vendor within 72 hours.');
}

export function generateContingencyPlan(project: EventProject, scenario: ContingencyScenario): ContingencyResult {
  const adjustments: string[] = [];
  const updatedTimelineNotes: string[] = [];

  if (scenario === 'weather') handleWeather(project, adjustments, updatedTimelineNotes);
  else if (scenario === 'budget-cut') handleBudgetCut(project, adjustments, updatedTimelineNotes);
  else if (scenario === 'guest-surge') handleGuestSurge(project, adjustments, updatedTimelineNotes);
  else if (scenario === 'vendor-drop') handleVendorDrop(project, adjustments, updatedTimelineNotes);

  const decisionLog: ContextDecisionLog = {
    id: `cdl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    trigger: `Contingency scenario: "${scenario}" activated for "${project.title}".`,
    reasoning: `Generated ${adjustments.length} adjustments based on ${project.vertical} vertical rules.`,
    actionTaken: `Contingency plan for "${scenario}" created with ${adjustments.length} action items.`,
    impactLevel: scenario === 'vendor-drop' || scenario === 'budget-cut' ? 'high' : 'medium',
  };

  return { adjustments, updatedTimelineNotes, decisionLog };
}
