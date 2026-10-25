/**
 * @fileoverview Birthday persona definition for Vesta Event Studio.
 */

import type { EventProject } from '../../types/event';

export const birthdayPersona: EventProject = {
  id: 'vesta-birthday-001',
  title: "Rohan's 30th Neon Rooftop Soirée",
  vertical: 'birthday',
  personaName: 'Rohan Desai',
  date: '2027-01-18',
  location: 'Bandra, Mumbai',
  guestCount: 80,
  totalBudget: 180000,
  currency: 'INR',
  season: 'winter',
  indoorOutdoor: 'outdoor',
  vibeTags: ['Neon', 'Rooftop', 'Chic', 'Party', 'Milestone'],
  dietaryRestrictions: ['Vegan', 'Gluten-Free'],
  budgetCategories: [
    { id: 'b-venue', name: 'Venue Rental', allocatedAmount: 36000, spentAmount: 18000, priority: 'high', isLocked: true, notes: 'Skyline rooftop.' },
    { id: 'b-catering', name: 'Food & Beverages', allocatedAmount: 45000, spentAmount: 10000, priority: 'high', isLocked: false, notes: 'Cocktail-style platters.' },
    { id: 'b-entertainment', name: 'Entertainment & DJ', allocatedAmount: 32400, spentAmount: 15000, priority: 'high', isLocked: false, notes: 'DJ + saxophonist.' },
    { id: 'b-cake', name: 'Custom Cake', allocatedAmount: 14400, spentAmount: 0, priority: 'medium', isLocked: false, notes: 'Neon fondant cake.' },
    { id: 'b-photobooth', name: 'Photo Booth & Media', allocatedAmount: 18000, spentAmount: 5000, priority: 'medium', isLocked: false, notes: '360° video booth.' },
    { id: 'b-decor', name: 'Décor & Lighting', allocatedAmount: 18000, spentAmount: 8000, priority: 'medium', isLocked: false, notes: 'Neon signs & UV balloons.' },
    { id: 'b-favors', name: 'Party Favors', allocatedAmount: 9000, spentAmount: 0, priority: 'low', isLocked: false, notes: 'Neon sunglasses & kits.' },
    { id: 'b-misc', name: 'Miscellaneous', allocatedAmount: 7200, spentAmount: 1000, priority: 'low', isLocked: false, notes: 'Uber credits for rides.' },
  ],
  timelineItems: [
    { id: 'bt-01', title: 'Lock down rooftop venue date', phase: 'countdown', timeframe: '3 months before', category: 'Venue', status: 'completed', isCriticalPath: true, assignee: 'Rohan' },
    { id: 'bt-02', title: 'Curate guest list (80 pax) & send e-invites', phase: 'countdown', timeframe: '2 months before', category: 'Planning', status: 'completed', isCriticalPath: true, assignee: 'Rohan' },
    { id: 'bt-03', title: 'Book DJ + saxophonist combo', phase: 'countdown', timeframe: '6 weeks before', category: 'Entertainment', status: 'in-progress', isCriticalPath: true, assignee: 'Best Friend' },
    { id: 'bt-04', title: 'Confirm catering menu & dietary needs', phase: 'countdown', timeframe: '4 weeks before', category: 'Catering', status: 'in-progress', isCriticalPath: true, assignee: 'Rohan' },
    { id: 'bt-05', title: 'Order custom neon cake', phase: 'countdown', timeframe: '3 weeks before', category: 'Cake', status: 'pending', isCriticalPath: false, assignee: 'Rohan' },
    { id: 'bt-06', title: 'Décor & lighting setup rehearsal', phase: 'countdown', timeframe: '1 week before', category: 'Décor', status: 'pending', isCriticalPath: false, assignee: 'Décor Vendor' },
    { id: 'bt-07', title: 'Finalize party favors order', phase: 'countdown', timeframe: '2 weeks before', category: 'Favors', status: 'pending', isCriticalPath: false, assignee: 'Rohan' },
    { id: 'bt-08', title: 'Venue access & décor setup', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '14:00 – 17:00', category: 'Venue', status: 'pending', isCriticalPath: true, assignee: 'Décor Vendor' },
    { id: 'bt-09', title: 'Sound check & lighting test', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '17:00 – 18:00', category: 'Entertainment', status: 'pending', isCriticalPath: true, assignee: 'DJ' },
    { id: 'bt-10', title: 'Guest arrival & sunset cocktail hour', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '18:30 – 19:30', category: 'Catering', status: 'pending', isCriticalPath: false, assignee: 'Caterer' },
    { id: 'bt-11', title: 'DJ set + live sax session', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '19:30 – 21:30', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'DJ + Sax' },
    { id: 'bt-12', title: 'Cake reveal & birthday toast', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '21:30 – 22:00', category: 'Cake', status: 'pending', isCriticalPath: true, assignee: 'Rohan' },
    { id: 'bt-13', title: 'Photo booth open & party continues', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '22:00 – 00:00', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'SnapLoop' },
    { id: 'bt-14', title: 'Party favors distribution & wind-down', phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '00:00 – 00:30', category: 'Logistics', status: 'pending', isCriticalPath: false, assignee: 'Friend' },
  ],
  vendors: [
    {
      id: 'bv-01', category: 'Venue', vendorName: 'SkyHigh Rooftop Lounge', contactEmail: 'events@skyhighbandra.com',
      estimatedCost: 36000, actualCost: 36000, status: 'booked', paymentDueDate: '2026-12-01',
      vettingChecklist: [
        { id: 'bc-01', label: 'Confirmed capacity for 80 pax', checked: true },
        { id: 'bc-02', label: 'Rain backup plan available', checked: true },
      ],
      notes: 'Premium rooftop with city skyline view.',
    },
    {
      id: 'bv-02', category: 'DJ', vendorName: 'DJ Anika Beats', contactEmail: 'anika@beatsbynika.com',
      estimatedCost: 25000, status: 'negotiating',
      vettingChecklist: [{ id: 'bc-04', label: 'Listened to live set recordings', checked: true }],
      notes: 'Popular club DJ, great with Bollywood-EDM crossover.',
    },
  ],
  savedIdeas: [
    { id: 'bi-01', category: 'entertainment', title: 'Secret Rooftop Flash Mob', description: 'Coordinated dance routine during DJ set.', estimatedCostImpact: 'Budget-neutral', bestForContext: 'Milestone birthday', appliedToPlan: false },
    { id: 'bi-02', category: 'decor', title: 'Interactive Neon Graffiti Wall', description: 'UV-reactive glowing message wall.', estimatedCostImpact: '+₹5,000', bestForContext: 'Neon party', appliedToPlan: false },
  ],
  decisionLogs: [],
};
