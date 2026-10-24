/**
 * @fileoverview Vendor negotiation templates fixture for Vesta Event Studio.
 */

import type { EventProject, VendorChecklistItem } from '../../types/event';

export type NegotiationGoal = 'discount' | 'scope-check' | 'contract-followup';

export function formatNegotiationDraft(
  project: EventProject,
  vendor: VendorChecklistItem,
  goal: NegotiationGoal,
): string {
  const greeting = `Dear ${vendor.vendorName} Team,`;
  const eventRef = `Re: ${project.title} — ${project.date} at ${project.location}`;

  switch (goal) {
    case 'discount':
      return [
        greeting,
        '',
        eventRef,
        '',
        `Thank you for your quote of ₹${vendor.estimatedCost.toLocaleString('en-IN')} for ${vendor.category} services. We're excited about working with you for ${project.personaName}'s event.`,
        '',
        `Given our overall event budget and the scope of services across ${project.budgetCategories.length} categories, we'd like to discuss the possibility of a competitive adjustment. We're looking at a budget of approximately ₹${Math.round(vendor.estimatedCost * 0.85).toLocaleString('en-IN')} for this category.`,
        '',
        `We believe this can be a great portfolio piece for your team, with ${project.guestCount} guests and excellent exposure opportunities.`,
        '',
        'Would you be open to discussing revised pricing? We value the quality of your work and want to find a mutually beneficial arrangement.',
        '',
        'Looking forward to your response.',
        '',
        'Best regards,',
        `${project.personaName}`,
        'Powered by Vesta Event Studio',
      ].join('\n');

    case 'scope-check':
      return [
        greeting,
        '',
        eventRef,
        '',
        `As we finalize our plans for the event on ${project.date}, I wanted to confirm the scope of services included in your package:`,
        '',
        `• Service Category: ${vendor.category}`,
        `• Estimated Cost: ₹${vendor.estimatedCost.toLocaleString('en-IN')}`,
        `• Guest Count: ${project.guestCount}`,
        `• Venue Type: ${project.indoorOutdoor}`,
        '',
        'Could you please confirm:',
        '1. The detailed breakdown of services included at the quoted price.',
        '2. Any additional charges for setup, overtime, or travel.',
        '3. Your cancellation and rescheduling policy.',
        vendor.vettingChecklist.some((c) => !c.checked)
          ? `4. Outstanding items from our checklist: ${vendor.vettingChecklist.filter((c) => !c.checked).map((c) => c.label).join(', ')}.`
          : '',
        '',
        'Thank you for your prompt response.',
        '',
        'Best regards,',
        `${project.personaName}`,
        'Powered by Vesta Event Studio',
      ]
        .filter(Boolean)
        .join('\n');

    case 'contract-followup':
      return [
        greeting,
        '',
        eventRef,
        '',
        `This is a friendly follow-up regarding our ${vendor.category} services agreement. Our records show:`,
        '',
        `• Current Status: ${vendor.status}`,
        `• Estimated Cost: ₹${vendor.estimatedCost.toLocaleString('en-IN')}`,
        vendor.paymentDueDate ? `• Payment Due Date: ${vendor.paymentDueDate}` : '',
        '',
        'We would appreciate receiving the final contract for review at your earliest convenience. If the contract has already been sent, please disregard this message.',
        '',
        `The event is on ${project.date}, and we want to ensure all agreements are finalized well in advance.`,
        '',
        'Thank you for your attention to this matter.',
        '',
        'Best regards,',
        `${project.personaName}`,
        'Powered by Vesta Event Studio',
      ]
        .filter(Boolean)
        .join('\n');
  }
}
