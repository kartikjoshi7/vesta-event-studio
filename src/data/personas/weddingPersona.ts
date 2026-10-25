/**
 * @fileoverview Wedding persona definition for Vesta Event Studio.
 */

import type { EventProject } from '../../types/event';

export const weddingPersona: EventProject = {
  id: 'proj-wedding-01',
  vertical: 'wedding',
  title: "Aarav & Meera's Royal Heritage Wedding",
  personaName: 'Aarav & Meera Sharma',
  date: '2026-11-20',
  location: 'Udaipur, Rajasthan, India',
  guestCount: 250,
  totalBudget: 2500000,
  currency: 'INR',
  season: 'winter',
  indoorOutdoor: 'hybrid',
  priorityFocus: 'venue',
  vibeTags: ['Royal Heritage', 'Traditional Rajasthani', 'Lakeside Grandeur', 'Opulent'],
  dietaryRestrictions: ['Vegetarian', 'Jain Options', 'Gluten-Free'],
  budgetCategories: [
    { id: 'w-venue', name: 'Venue & Décor', allocatedAmount: 750000, spentAmount: 200000, priority: 'high', isLocked: false, notes: 'Heritage haveli in Udaipur.' },
    { id: 'w-catering', name: 'Catering', allocatedAmount: 625000, spentAmount: 150000, priority: 'high', isLocked: false, notes: 'Multi-cuisine Rajasthani thali.' },
    { id: 'w-photography', name: 'Photography & Video', allocatedAmount: 300000, spentAmount: 75000, priority: 'high', isLocked: true, notes: 'Cinematographer confirmed.' },
    { id: 'w-entertainment', name: 'Entertainment', allocatedAmount: 250000, spentAmount: 50000, priority: 'medium', isLocked: false, notes: 'Bollywood DJ + folk band.' },
    { id: 'w-attire', name: 'Attire & Jewelry', allocatedAmount: 200000, spentAmount: 180000, priority: 'medium', isLocked: true, notes: 'Heirloom jewelry finalized.' },
    { id: 'w-logistics', name: 'Logistics & Travel', allocatedAmount: 200000, spentAmount: 60000, priority: 'medium', isLocked: false, notes: 'Guest airport shuttles.' },
    { id: 'w-invitations', name: 'Invitations', allocatedAmount: 100000, spentAmount: 95000, priority: 'low', isLocked: true, notes: 'Custom fragrance boxes shipped.' },
    { id: 'w-misc', name: 'Miscellaneous', allocatedAmount: 75000, spentAmount: 10000, priority: 'low', isLocked: false, notes: 'Emergency contingency fund.' },
  ],
  timelineItems: [
    { id: 'wt-01', title: 'Finalize guest list & send invitations', phase: 'countdown', timeframe: '6 months before', category: 'Planning', status: 'completed', isCriticalPath: true, assignee: 'Meera' },
    { id: 'wt-02', title: 'Book venue & confirm haveli availability', phase: 'countdown', timeframe: '5 months before', category: 'Venue', status: 'completed', isCriticalPath: true, assignee: 'Wedding Planner' },
    { id: 'wt-03', title: 'Shortlist & book photographer + videographer', phase: 'countdown', timeframe: '4 months before', category: 'Photography', status: 'completed', isCriticalPath: true, assignee: 'Aarav' },
    { id: 'wt-04', title: 'Finalize catering menu & tastings', phase: 'countdown', timeframe: '3 months before', category: 'Catering', status: 'completed', isCriticalPath: true, assignee: 'Meera' },
    { id: 'wt-05', title: 'Confirm entertainment acts (DJ + folk band)', phase: 'countdown', timeframe: '3 months before', category: 'Entertainment', status: 'in-progress', isCriticalPath: false, assignee: 'Planner' },
    { id: 'wt-06', title: 'Arrange guest accommodation & transport', phase: 'countdown', timeframe: '2 months before', category: 'Logistics', status: 'in-progress', isCriticalPath: true, assignee: 'Best Man' },
    { id: 'wt-07', title: 'Final décor mock-up review', phase: 'countdown', timeframe: '1 month before', category: 'Venue', status: 'pending', isCriticalPath: false, assignee: 'Décor Team' },
    { id: 'wt-08', title: 'Final dress & jewelry fittings', phase: 'countdown', timeframe: '2 weeks before', category: 'Attire', status: 'pending', isCriticalPath: false, assignee: 'Aarav & Meera' },
    { id: 'wt-09', title: 'Mehendi artists setup', phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '10:00 – 11:00', category: 'Décor', status: 'pending', isCriticalPath: false, assignee: 'Décor Team' },
    { id: 'wt-10', title: 'Mehendi ceremony', phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '11:00 – 15:00', category: 'Ceremony', status: 'pending', isCriticalPath: false, assignee: 'Meera' },
    { id: 'wt-11', title: 'Sangeet: sound check & stage prep', phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '17:00 – 18:00', category: 'Entertainment', status: 'pending', isCriticalPath: true, assignee: 'DJ Ravi' },
    { id: 'wt-12', title: 'Sangeet performances & dinner', phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '19:00 – 23:00', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'Planner' },
    { id: 'wt-13', title: 'Baraat procession arrival', phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '09:00 – 10:00', category: 'Ceremony', status: 'pending', isCriticalPath: true, assignee: 'Aarav' },
    { id: 'wt-14', title: 'Pheras & wedding rituals', phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '10:30 – 13:00', category: 'Ceremony', status: 'pending', isCriticalPath: true, assignee: 'Pandit Ji' },
    { id: 'wt-15', title: 'Grand wedding lunch', phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '13:30 – 15:30', category: 'Catering', status: 'pending', isCriticalPath: true, assignee: 'Caterer' },
    { id: 'wt-16', title: 'Vidaai & farewell', phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '16:00 – 17:00', category: 'Ceremony', status: 'pending', isCriticalPath: false, assignee: 'Family' },
    { id: 'wt-17', title: 'Reception venue setup & lighting', phase: 'run-of-show', timeframe: 'Day 3', timeSlot: '15:00 – 17:00', category: 'Venue', status: 'pending', isCriticalPath: true, assignee: 'Décor Team' },
    { id: 'wt-18', title: 'Reception cocktail hour', phase: 'run-of-show', timeframe: 'Day 3', timeSlot: '18:00 – 19:00', category: 'Catering', status: 'pending', isCriticalPath: false, assignee: 'Caterer' },
    { id: 'wt-19', title: 'Reception dinner & dance', phase: 'run-of-show', timeframe: 'Day 3', timeSlot: '19:30 – 23:00', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'DJ Ravi' },
  ],
  vendors: [
    {
      id: 'wv-01', category: 'Venue', vendorName: 'Udaipur Heritage Haveli', contactEmail: 'events@heritagehaveli.in',
      estimatedCost: 450000, actualCost: 430000, status: 'booked', paymentDueDate: '2026-11-01',
      vettingChecklist: [
        { id: 'vc-01', label: 'Visited venue in person', checked: true },
        { id: 'vc-02', label: 'Reviewed cancellation policy', checked: true },
        { id: 'vc-03', label: 'Confirmed backup indoor space for rain', checked: true },
        { id: 'vc-04', label: 'Verified fire safety clearance', checked: true },
      ],
      notes: 'Heritage property with lake view. 20% advance paid.',
    },
    {
      id: 'wv-02', category: 'Photographer', vendorName: 'Priya Kapoor Photography', contactEmail: 'priya@pkphoto.in',
      estimatedCost: 300000, actualCost: 280000, status: 'booked', paymentDueDate: '2026-12-15',
      vettingChecklist: [
        { id: 'vc-05', label: 'Reviewed portfolio (50+ weddings)', checked: true },
        { id: 'vc-06', label: 'Confirmed drone photography license', checked: true },
        { id: 'vc-07', label: 'Second shooter included in package', checked: true },
      ],
      notes: 'Pre-wedding shoot included. Deliverables: photo album + highlight film.',
    },
    {
      id: 'wv-03', category: 'Catering', vendorName: 'Royal Rasoi Caterers', contactEmail: 'info@royalrasoi.com',
      estimatedCost: 550000, status: 'negotiating', paymentDueDate: '2026-10-15',
      vettingChecklist: [
        { id: 'vc-08', label: 'Tasting session completed', checked: true },
        { id: 'vc-09', label: 'FSSAI hygiene certification checked', checked: true },
        { id: 'vc-10', label: 'Staff-to-guest ratio >= 1:15', checked: false },
        { id: 'vc-11', label: 'Waste management plan in place', checked: false },
      ],
      notes: 'Negotiating discount for multi-meal package.',
    },
    {
      id: 'wv-04', category: 'Entertainment', vendorName: 'DJ Ravi & The Desert Grooves', contactEmail: 'djravi@desertgrooves.in',
      estimatedCost: 200000, status: 'shortlisted', paymentDueDate: '2026-10-30',
      vettingChecklist: [
        { id: 'vc-12', label: 'Audio equipment spec sheet verified', checked: true },
        { id: 'vc-13', label: 'Song playlist approved by couple', checked: false },
        { id: 'vc-14', label: 'Backup generator confirmed for power', checked: false },
      ],
      notes: 'Shortlisted among 3 DJs. Need to finalize by end of month.',
    },
  ],
  savedIdeas: [
    { id: 'wi-01', category: 'theme', title: 'Royal Mewar Palace Heritage Motif', description: 'Deep jewel tones, handcrafted marigold floral canopies, and vintage brass lanterns.', estimatedCostImpact: '+₹45,000', bestForContext: 'Evening Sangeet', appliedToPlan: false },
    { id: 'wi-02', category: 'catering', title: 'Live Dal Baati Churma Culinary Station', description: 'Interactive culinary counter with heritage chefs preparing smoked ghee delicacies live.', estimatedCostImpact: 'Budget-neutral', bestForContext: 'Day 2 Wedding Lunch', appliedToPlan: false },
    { id: 'wi-03', category: 'entertainment', title: 'Lakeside Sitar Symphony Welcome', description: 'Acoustic sitar and tabla duet playing gentle ragas as guests arrive via traditional boat.', estimatedCostImpact: '+₹25,000', bestForContext: 'Welcome Cocktail', appliedToPlan: false },
  ],
  decisionLogs: [
    { id: 'wd-01', timestamp: '2026-05-10T14:30:00Z', trigger: 'Initial budget setup', reasoning: 'Allocated 25L across 8 categories based on wedding vertical rules.', actionTaken: 'Locked photography and attire categories after contract sign-off.', impactLevel: 'high' },
  ],
};
