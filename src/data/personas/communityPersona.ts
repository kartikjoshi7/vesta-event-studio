/**
 * @fileoverview Community summit persona definition for Vesta Event Studio.
 */

import type { EventProject } from '../../types/event';

export const communityPersona: EventProject = {
  id: 'vesta-community-001',
  title: 'Gujarat CleanTech & Climate Innovation Summit',
  vertical: 'community',
  personaName: 'Dr. Priya Patel',
  date: '2026-12-05',
  location: 'Vadodara Convention Centre, Gujarat',
  guestCount: 500,
  totalBudget: 650000,
  currency: 'INR',
  season: 'winter',
  indoorOutdoor: 'indoor',
  vibeTags: ['CleanTech', 'Innovation', 'Sustainable', 'Policy', 'Civic'],
  dietaryRestrictions: ['Vegetarian', 'Jain Options', 'Vegan'],
  budgetCategories: [
    { id: 'c-av', name: 'AV & Staging', allocatedAmount: 143000, spentAmount: 50000, priority: 'high', isLocked: false, notes: 'Main stage LED wall, 4 breakout rooms.' },
    { id: 'c-venue', name: 'Venue & Permits', allocatedAmount: 117000, spentAmount: 80000, priority: 'high', isLocked: true, notes: 'Vadodara Convention Centre booked.' },
    { id: 'c-security', name: 'Security & Safety', allocatedAmount: 65000, spentAmount: 20000, priority: 'high', isLocked: false, notes: '15 personnel + first aid.' },
    { id: 'c-catering', name: 'Refreshments', allocatedAmount: 97500, spentAmount: 15000, priority: 'medium', isLocked: false, notes: 'Buffet + tea breaks.' },
    { id: 'c-sponsors', name: 'Sponsor Booths', allocatedAmount: 65000, spentAmount: 10000, priority: 'medium', isLocked: false, notes: '20 sponsor booths.' },
    { id: 'c-marketing', name: 'Marketing & Comms', allocatedAmount: 52000, spentAmount: 35000, priority: 'medium', isLocked: false, notes: 'Press and social campaign.' },
    { id: 'c-waste', name: 'Waste Management', allocatedAmount: 45500, spentAmount: 5000, priority: 'medium', isLocked: false, notes: 'Zero-waste initiative.' },
    { id: 'c-speakers', name: 'Speaker Honorariums', allocatedAmount: 39000, spentAmount: 20000, priority: 'low', isLocked: false, notes: 'Keynotes & workshop leads.' },
    { id: 'c-misc', name: 'Miscellaneous', allocatedAmount: 26000, spentAmount: 2000, priority: 'low', isLocked: false, notes: 'Badges and volunteer kits.' },
  ],
  timelineItems: [
    { id: 'ct-01', title: 'Secure venue booking & permits', phase: 'countdown', timeframe: '6 months before', category: 'Venue', status: 'completed', isCriticalPath: true, assignee: 'Committee' },
    { id: 'ct-02', title: 'Confirm keynote speakers & panelists', phase: 'countdown', timeframe: '5 months before', category: 'Speakers', status: 'completed', isCriticalPath: true, assignee: 'Program Chair' },
    { id: 'ct-03', title: 'Launch sponsor outreach & booth sales', phase: 'countdown', timeframe: '4 months before', category: 'Sponsors', status: 'completed', isCriticalPath: false, assignee: 'Sponsorship Lead' },
    { id: 'ct-04', title: 'Open attendee registration', phase: 'countdown', timeframe: '3 months before', category: 'Planning', status: 'completed', isCriticalPath: true, assignee: 'Registration Team' },
    { id: 'ct-05', title: 'Finalize AV requirements & vendor', phase: 'countdown', timeframe: '2 months before', category: 'AV', status: 'in-progress', isCriticalPath: true, assignee: 'Tech Lead' },
    { id: 'ct-06', title: 'Confirm catering & dietary needs', phase: 'countdown', timeframe: '6 weeks before', category: 'Catering', status: 'in-progress', isCriticalPath: true, assignee: 'Logistics Lead' },
    { id: 'ct-07', title: 'Recruit & brief 30 volunteers', phase: 'countdown', timeframe: '4 weeks before', category: 'Planning', status: 'pending', isCriticalPath: false, assignee: 'Coordinator' },
    { id: 'ct-08', title: 'Final run-through & signage installation', phase: 'countdown', timeframe: '1 week before', category: 'Venue', status: 'pending', isCriticalPath: true, assignee: 'Committee' },
    { id: 'ct-09', title: 'Venue open — volunteer stations ready', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '07:00 – 08:00', category: 'Venue', status: 'pending', isCriticalPath: true, assignee: 'Coordinator' },
    { id: 'ct-10', title: 'Registration & welcome kit distribution', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '08:00 – 09:00', category: 'Planning', status: 'pending', isCriticalPath: true, assignee: 'Registration' },
    { id: 'ct-11', title: 'Opening keynote: "Tech for Sustainability"', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '09:00 – 10:00', category: 'Speakers', status: 'pending', isCriticalPath: true, assignee: 'Speaker 1' },
    { id: 'ct-12', title: 'Panel: Green Infrastructure & Smart Cities', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '10:15 – 11:15', category: 'Speakers', status: 'pending', isCriticalPath: false, assignee: 'Moderator' },
    { id: 'ct-13', title: 'Tea break & sponsor networking', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '11:15 – 11:45', category: 'Catering', status: 'pending', isCriticalPath: false, assignee: 'Caterer' },
    { id: 'ct-14', title: 'Workshop tracks (4 parallel sessions)', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '11:45 – 13:00', category: 'Speakers', status: 'pending', isCriticalPath: false, assignee: 'Workshop Leads' },
    { id: 'ct-15', title: 'Networking lunch & exhibits', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '13:00 – 14:00', category: 'Catering', status: 'pending', isCriticalPath: true, assignee: 'Caterer' },
    { id: 'ct-16', title: 'Afternoon keynote & fireside chat', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '14:00 – 15:30', category: 'Speakers', status: 'pending', isCriticalPath: true, assignee: 'Speaker 2' },
    { id: 'ct-17', title: 'Closing remarks & action roadmap', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '16:00 – 17:00', category: 'Speakers', status: 'pending', isCriticalPath: true, assignee: 'Chair' },
  ],
  vendors: [
    {
      id: 'cv-01', category: 'Venue', vendorName: 'Vadodara Convention Centre', contactEmail: 'bookings@vadodaraconvention.org',
      estimatedCost: 117000, actualCost: 117000, status: 'booked', paymentDueDate: '2026-11-01',
      vettingChecklist: [
        { id: 'cc-01', label: 'Occupancy permit verified (500 pax)', checked: true },
        { id: 'cc-02', label: 'Fire safety & emergency exit clearance', checked: true },
      ],
      notes: 'Convention centre with 4 breakout rooms and 1 auditorium.',
    },
    {
      id: 'cv-02', category: 'AV & Staging', vendorName: 'SoundWave Professional AV', contactEmail: 'info@soundwaveav.in',
      estimatedCost: 130000, status: 'negotiating',
      vettingChecklist: [{ id: 'cc-04', label: 'Full equipment inventory inspected', checked: true }],
      notes: 'Main stage LED wall, wireless mics, recording setup.',
    },
  ],
  savedIdeas: [
    { id: 'ci-01', category: 'sustainability', title: 'Zero Single-Use Plastic Mandate', description: 'Eliminate plastic bottles with copper hydration stations.', estimatedCostImpact: '-₹15,000 saved', bestForContext: 'Eco summits', appliedToPlan: true },
  ],
  decisionLogs: [],
};
