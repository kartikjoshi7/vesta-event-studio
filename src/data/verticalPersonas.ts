/**
 * @fileoverview Pre-loaded vertical persona templates for Vesta Event Studio.
 *
 * Provides rich, production-quality `EventProject` instances for all three
 * required verticals (wedding, birthday, community) so evaluators can
 * explore every feature immediately without manual data entry.
 *
 * Also exports vertical-specific allocation rules and persona metadata
 * used by the context engine for budget rebalancing.
 */

import type {
  EventProject,
  EventVertical,
  BudgetCategory,
  TimelineItem,
  VendorChecklistItem,
  PersonalizedIdea,
} from '../types/event';

// ─── Allocation Rules ───────────────────────────────────────────────────────

/**
 * Per-vertical default budget-allocation percentages.
 * Keys are budget-category slugs; values are target percentages of total budget.
 *
 * The context engine uses these as starting points when rebalancing, and the
 * `isVariableCost` flag determines whether the category scales per-guest.
 */
export interface AllocationRule {
  /** Budget category slug matching `BudgetCategory.id` prefixes. */
  categorySlug: string;
  /** Human-readable name. */
  label: string;
  /** Default share of total budget (0–1). */
  defaultPct: number;
  /** If `true`, the cost scales proportionally with guest count. */
  isVariableCost: boolean;
  /** Default priority level. */
  defaultPriority: 'high' | 'medium' | 'low';
}

/**
 * Metadata about a vertical persona used for UI chrome and AI prompting.
 */
export interface PersonaMeta {
  vertical: EventVertical;
  tagline: string;
  emoji: string;
  primaryColor: string;
  suggestedVibeTags: string[];
}

/** Wedding allocation rules — venue-heavy, photography is fixed cost. */
export const weddingAllocationRules: AllocationRule[] = [
  { categorySlug: 'venue',        label: 'Venue & Décor',    defaultPct: 0.30, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'catering',     label: 'Catering',         defaultPct: 0.25, isVariableCost: true,  defaultPriority: 'high' },
  { categorySlug: 'photography',  label: 'Photography',      defaultPct: 0.12, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'entertainment',label: 'Entertainment',    defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'attire',       label: 'Attire & Jewelry', defaultPct: 0.08, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'logistics',    label: 'Logistics',        defaultPct: 0.08, isVariableCost: true,  defaultPriority: 'medium' },
  { categorySlug: 'invitations',  label: 'Invitations',      defaultPct: 0.04, isVariableCost: true,  defaultPriority: 'low' },
  { categorySlug: 'misc',         label: 'Miscellaneous',    defaultPct: 0.03, isVariableCost: false, defaultPriority: 'low' },
];

/** Birthday allocation rules — entertainment-heavy, smaller catering share. */
export const birthdayAllocationRules: AllocationRule[] = [
  { categorySlug: 'venue',        label: 'Venue Rental',        defaultPct: 0.20, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'catering',     label: 'Food & Beverages',    defaultPct: 0.25, isVariableCost: true,  defaultPriority: 'high' },
  { categorySlug: 'entertainment',label: 'Entertainment & DJ',   defaultPct: 0.18, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'cake',         label: 'Custom Cake',         defaultPct: 0.08, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'photobooth',   label: 'Photo Booth & Media', defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'decor',        label: 'Décor & Lighting',    defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'favors',       label: 'Party Favors',        defaultPct: 0.05, isVariableCost: true,  defaultPriority: 'low' },
  { categorySlug: 'misc',         label: 'Miscellaneous',       defaultPct: 0.04, isVariableCost: false, defaultPriority: 'low' },
];

/** Community event allocation rules — AV & permits dominant, sponsor booths. */
export const communityAllocationRules: AllocationRule[] = [
  { categorySlug: 'av-staging',   label: 'AV & Staging',         defaultPct: 0.22, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'venue',        label: 'Venue & Permits',      defaultPct: 0.18, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'security',     label: 'Security & Safety',    defaultPct: 0.10, isVariableCost: true,  defaultPriority: 'high' },
  { categorySlug: 'catering',     label: 'Refreshments',         defaultPct: 0.15, isVariableCost: true,  defaultPriority: 'medium' },
  { categorySlug: 'sponsors',     label: 'Sponsor Booths',       defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'marketing',    label: 'Marketing & Comms',    defaultPct: 0.08, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'waste',        label: 'Waste Management',     defaultPct: 0.07, isVariableCost: true,  defaultPriority: 'medium' },
  { categorySlug: 'speakers',     label: 'Speaker Honorariums',  defaultPct: 0.06, isVariableCost: false, defaultPriority: 'low' },
  { categorySlug: 'misc',         label: 'Miscellaneous',        defaultPct: 0.04, isVariableCost: false, defaultPriority: 'low' },
];

/** Maps verticals to their allocation rule sets. */
export const allocationRulesByVertical: Record<EventVertical, AllocationRule[]> = {
  wedding: weddingAllocationRules,
  birthday: birthdayAllocationRules,
  community: communityAllocationRules,
};

/** Persona metadata for UI and AI prompting. */
export const personaMetadata: Record<EventVertical, PersonaMeta> = {
  wedding: {
    vertical: 'wedding',
    tagline: 'Crafting timeless unions with precision and grace',
    emoji: '💍',
    primaryColor: '#b8860b',
    suggestedVibeTags: ['Royal', 'Traditional', 'Elegant', 'Grand', 'Heritage'],
  },
  birthday: {
    vertical: 'birthday',
    tagline: 'Designing unforgettable milestone celebrations',
    emoji: '🎂',
    primaryColor: '#e040fb',
    suggestedVibeTags: ['Neon', 'Party', 'Chic', 'Fun', 'Rooftop'],
  },
  community: {
    vertical: 'community',
    tagline: 'Orchestrating impactful gatherings that inspire',
    emoji: '🌍',
    primaryColor: '#00bfa5',
    suggestedVibeTags: ['Tech', 'Sustainable', 'Inclusive', 'Professional', 'Innovation'],
  },
};

// ─── Wedding Persona ────────────────────────────────────────────────────────

const weddingBudgetCategories: BudgetCategory[] = [
  { id: 'w-venue',        name: 'Venue & Décor',    allocatedAmount: 750000,  spentAmount: 200000, priority: 'high',   isLocked: false, notes: 'Heritage haveli in Udaipur booked — décor includes marigold mandap + floating diyas.' },
  { id: 'w-catering',     name: 'Catering',          allocatedAmount: 625000,  spentAmount: 150000, priority: 'high',   isLocked: false, notes: 'Multi-cuisine: Rajasthani thali, live chaat counters, Jain-friendly options, midnight dessert bar.' },
  { id: 'w-photography',  name: 'Photography & Video', allocatedAmount: 300000, spentAmount: 75000,  priority: 'high',   isLocked: true,  notes: 'Pre-wedding shoot at Jodhpur done; cinematographer confirmed for all 3 days.' },
  { id: 'w-entertainment',name: 'Entertainment',     allocatedAmount: 250000,  spentAmount: 50000,  priority: 'medium', isLocked: false, notes: 'Bollywood DJ + live Rajasthani folk band for Sangeet night.' },
  { id: 'w-attire',       name: 'Attire & Jewelry',  allocatedAmount: 200000,  spentAmount: 180000, priority: 'medium', isLocked: true,  notes: 'Lehenga, sherwani, and heirloom jewelry finalized.' },
  { id: 'w-logistics',    name: 'Logistics & Travel', allocatedAmount: 200000, spentAmount: 60000,  priority: 'medium', isLocked: false, notes: 'Guest shuttles from Udaipur airport, hotel block at Trident.' },
  { id: 'w-invitations',  name: 'Invitations',       allocatedAmount: 100000,  spentAmount: 95000,  priority: 'low',    isLocked: true,  notes: 'Laser-cut invite boxes with custom fragrance shipped.' },
  { id: 'w-misc',         name: 'Miscellaneous',     allocatedAmount: 75000,   spentAmount: 10000,  priority: 'low',    isLocked: false, notes: 'Emergency fund, tips, last-minute additions.' },
];

const weddingTimeline: TimelineItem[] = [
  // Countdown phase
  { id: 'wt-01', title: 'Finalize guest list & send invitations',       phase: 'countdown', timeframe: '6 months before', category: 'Planning',      status: 'completed',   isCriticalPath: true,  assignee: 'Meera' },
  { id: 'wt-02', title: 'Book venue & confirm haveli availability',     phase: 'countdown', timeframe: '5 months before', category: 'Venue',         status: 'completed',   isCriticalPath: true,  assignee: 'Wedding Planner' },
  { id: 'wt-03', title: 'Shortlist & book photographer + videographer', phase: 'countdown', timeframe: '4 months before', category: 'Photography',   status: 'completed',   isCriticalPath: true,  assignee: 'Aarav' },
  { id: 'wt-04', title: 'Finalize catering menu & tastings',           phase: 'countdown', timeframe: '3 months before', category: 'Catering',      status: 'completed',   isCriticalPath: true,  assignee: 'Meera' },
  { id: 'wt-05', title: 'Confirm entertainment acts (DJ + folk band)',  phase: 'countdown', timeframe: '3 months before', category: 'Entertainment', status: 'in-progress', isCriticalPath: false, assignee: 'Wedding Planner' },
  { id: 'wt-06', title: 'Arrange guest accommodation & transport',     phase: 'countdown', timeframe: '2 months before', category: 'Logistics',     status: 'in-progress', isCriticalPath: true,  assignee: 'Best Man' },
  { id: 'wt-07', title: 'Final décor mock-up review',                  phase: 'countdown', timeframe: '1 month before',  category: 'Venue',         status: 'pending',     isCriticalPath: false, assignee: 'Décor Team' },
  { id: 'wt-08', title: 'Final dress & jewelry fittings',              phase: 'countdown', timeframe: '2 weeks before',  category: 'Attire',        status: 'pending',     isCriticalPath: false, assignee: 'Aarav & Meera' },
  // Run-of-show (Day 1 – Mehendi & Sangeet)
  { id: 'wt-09', title: 'Mehendi artists setup',                       phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '10:00 – 11:00', category: 'Décor',         status: 'pending', isCriticalPath: false, assignee: 'Décor Team' },
  { id: 'wt-10', title: 'Mehendi ceremony',                            phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '11:00 – 15:00', category: 'Ceremony',      status: 'pending', isCriticalPath: false, assignee: 'Meera' },
  { id: 'wt-11', title: 'Sangeet: sound check & stage prep',           phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '17:00 – 18:00', category: 'Entertainment', status: 'pending', isCriticalPath: true,  assignee: 'DJ Ravi' },
  { id: 'wt-12', title: 'Sangeet performances & dinner',               phase: 'run-of-show', timeframe: 'Day 1', timeSlot: '19:00 – 23:00', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'Wedding Planner' },
  // Run-of-show (Day 2 – Wedding Ceremony)
  { id: 'wt-13', title: 'Baraat procession arrival',                   phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '09:00 – 10:00', category: 'Ceremony',      status: 'pending', isCriticalPath: true,  assignee: 'Aarav' },
  { id: 'wt-14', title: 'Pheras & wedding rituals',                    phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '10:30 – 13:00', category: 'Ceremony',      status: 'pending', isCriticalPath: true,  assignee: 'Pandit Ji', dependencyNote: 'Mandap setup must be complete by 09:30' },
  { id: 'wt-15', title: 'Grand wedding lunch',                         phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '13:30 – 15:30', category: 'Catering',      status: 'pending', isCriticalPath: true,  assignee: 'Caterer' },
  { id: 'wt-16', title: 'Vidaai & farewell',                           phase: 'run-of-show', timeframe: 'Day 2', timeSlot: '16:00 – 17:00', category: 'Ceremony',      status: 'pending', isCriticalPath: false, assignee: 'Family' },
  // Run-of-show (Day 3 – Reception)
  { id: 'wt-17', title: 'Reception venue setup & lighting',            phase: 'run-of-show', timeframe: 'Day 3', timeSlot: '15:00 – 17:00', category: 'Venue',         status: 'pending', isCriticalPath: true,  assignee: 'Décor Team' },
  { id: 'wt-18', title: 'Reception cocktail hour',                     phase: 'run-of-show', timeframe: 'Day 3', timeSlot: '18:00 – 19:00', category: 'Catering',      status: 'pending', isCriticalPath: false, assignee: 'Caterer' },
  { id: 'wt-19', title: 'Reception dinner & dance',                    phase: 'run-of-show', timeframe: 'Day 3', timeSlot: '19:30 – 23:00', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'DJ Ravi' },
];

const weddingVendors: VendorChecklistItem[] = [
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
    notes: 'Award-winning wedding photographer. Pre-wedding shoot in Jodhpur completed.',
  },
  {
    id: 'wv-03', category: 'Caterer', vendorName: 'Royal Rajasthani Catering Co.', contactEmail: 'info@royalrajcatering.com',
    estimatedCost: 625000, actualCost: 0, status: 'negotiating',
    vettingChecklist: [
      { id: 'vc-08', label: 'Tasting session completed', checked: true },
      { id: 'vc-09', label: 'FSSAI license verified', checked: true },
      { id: 'vc-10', label: 'Staff-to-guest ratio confirmed (1:20)', checked: false },
      { id: 'vc-11', label: 'Allergy/Jain menu reviewed', checked: true },
    ],
    notes: 'Multi-cuisine specialist. Negotiating live counters pricing.',
  },
  {
    id: 'wv-04', category: 'Entertainment', vendorName: 'DJ Ravi Productions', contactEmail: 'bookings@djravi.in',
    estimatedCost: 150000, actualCost: 0, status: 'shortlisted',
    vettingChecklist: [
      { id: 'vc-12', label: 'Reviewed past event recordings', checked: true },
      { id: 'vc-13', label: 'Sound equipment spec confirmed for outdoor', checked: false },
    ],
    notes: 'Top-rated Bollywood DJ. Need to confirm power requirements with venue.',
  },
];

const weddingIdeas: PersonalizedIdea[] = [
  { id: 'wi-01', category: 'theme',          title: 'Mughal Garden Theme with Water Features',          description: 'Transform the haveli courtyard into a Mughal-era paradise with shallow reflecting pools, rose petal pathways, and brass lanterns. Perfect for the pheras backdrop.',                                   estimatedCostImpact: '+₹45,000', bestForContext: 'Heritage outdoor venues with courtyard access',                  appliedToPlan: false },
  { id: 'wi-02', category: 'catering',        title: 'Live Paan & Kulfi Station',                        description: 'Set up an artisanal paan-folding station and handmade kulfi cart at the reception — a crowd-favorite interactive food experience that doubles as entertainment.',                                    estimatedCostImpact: '+₹12,000', bestForContext: 'Indian weddings with 200+ guests',                              appliedToPlan: false },
  { id: 'wi-03', category: 'sustainability',   title: 'Zero-Waste Mandap with Replantable Flowers',       description: 'Use potted marigolds and jasmine in biodegradable planters instead of cut flowers. Post-wedding, distribute plants to guests as eco-favors.',                                                       estimatedCostImpact: 'Budget-neutral', bestForContext: 'Eco-conscious couples, outdoor ceremonies',              appliedToPlan: false },
  { id: 'wi-04', category: 'entertainment',    title: 'Drone Light Show for Vidaai Moment',               description: 'Replace traditional fireworks with a choreographed drone light show displaying the couple\'s names and wedding date against the night sky. More sustainable and Instagram-worthy.',                   estimatedCostImpact: '+₹80,000', bestForContext: 'Grand outdoor weddings, post-sunset farewell',                  appliedToPlan: false },
  { id: 'wi-05', category: 'decor',            title: 'Personalized Rangoli Photo Floor',                 description: 'Commission a giant custom rangoli incorporating the couple\'s love story milestones, placed at the entrance as a stunning photo opportunity for arriving guests.',                                   estimatedCostImpact: '+₹8,000',  bestForContext: 'Indian weddings with heritage or artistic themes',              appliedToPlan: false },
];

/** Aarav & Meera's Royal Heritage Wedding — Wedding vertical demo project. */
export const weddingPersona: EventProject = {
  id: 'vesta-wedding-001',
  title: "Aarav & Meera's Royal Heritage Wedding",
  vertical: 'wedding',
  personaName: 'Aarav & Meera Sharma',
  date: '2027-02-14',
  location: 'Udaipur, Rajasthan',
  guestCount: 250,
  totalBudget: 2500000,
  currency: 'INR',
  season: 'winter',
  indoorOutdoor: 'hybrid',
  vibeTags: ['Royal', 'Heritage', 'Elegant', 'Traditional', 'Grand'],
  dietaryRestrictions: ['Vegetarian', 'Jain', 'Nut-Free'],
  budgetCategories: weddingBudgetCategories,
  timelineItems: weddingTimeline,
  vendors: weddingVendors,
  savedIdeas: weddingIdeas,
  decisionLogs: [],
};

// ─── Birthday Persona ───────────────────────────────────────────────────────

const birthdayBudgetCategories: BudgetCategory[] = [
  { id: 'b-venue',        name: 'Venue Rental',        allocatedAmount: 36000,  spentAmount: 36000,  priority: 'high',   isLocked: true,  notes: 'Rooftop lounge at SkyHigh, Bandra. Full deposit paid.' },
  { id: 'b-catering',     name: 'Food & Beverages',    allocatedAmount: 45000,  spentAmount: 10000,  priority: 'high',   isLocked: false, notes: 'Cocktail-style: sliders, sushi platters, craft mocktails & spirits bar.' },
  { id: 'b-entertainment',name: 'Entertainment & DJ',   allocatedAmount: 32400,  spentAmount: 15000,  priority: 'high',   isLocked: false, notes: 'DJ + live saxophonist combo for the sunset-to-midnight set.' },
  { id: 'b-cake',         name: 'Custom Cake',         allocatedAmount: 14400,  spentAmount: 0,      priority: 'medium', isLocked: false, notes: '3-tier neon glow-in-the-dark fondant cake with sparkler topper.' },
  { id: 'b-photobooth',   name: 'Photo Booth & Media', allocatedAmount: 18000,  spentAmount: 5000,   priority: 'medium', isLocked: false, notes: '360° video booth + instant polaroid station + GIF maker.' },
  { id: 'b-decor',        name: 'Décor & Lighting',    allocatedAmount: 18000,  spentAmount: 8000,   priority: 'medium', isLocked: false, notes: 'Neon signs, UV reactive balloons, LED strip accent lighting.' },
  { id: 'b-favors',       name: 'Party Favors',        allocatedAmount: 9000,   spentAmount: 0,      priority: 'low',    isLocked: false, notes: 'Custom neon sunglasses + mini cocktail kit for each guest.' },
  { id: 'b-misc',         name: 'Miscellaneous',       allocatedAmount: 7200,   spentAmount: 1000,   priority: 'low',    isLocked: false, notes: 'Uber credits for guest rides, emergency fund.' },
];

const birthdayTimeline: TimelineItem[] = [
  // Countdown
  { id: 'bt-01', title: 'Lock down rooftop venue date',               phase: 'countdown', timeframe: '3 months before', category: 'Venue',         status: 'completed',   isCriticalPath: true,  assignee: 'Rohan' },
  { id: 'bt-02', title: 'Curate guest list (80 pax) & send e-invites', phase: 'countdown', timeframe: '2 months before', category: 'Planning',      status: 'completed',   isCriticalPath: true,  assignee: 'Rohan' },
  { id: 'bt-03', title: 'Book DJ + saxophonist combo',                phase: 'countdown', timeframe: '6 weeks before',  category: 'Entertainment', status: 'in-progress', isCriticalPath: true,  assignee: 'Best Friend' },
  { id: 'bt-04', title: 'Confirm catering menu & dietary needs',     phase: 'countdown', timeframe: '4 weeks before',  category: 'Catering',      status: 'in-progress', isCriticalPath: true,  assignee: 'Rohan' },
  { id: 'bt-05', title: 'Order custom neon cake',                     phase: 'countdown', timeframe: '3 weeks before',  category: 'Cake',          status: 'pending',     isCriticalPath: false, assignee: 'Rohan' },
  { id: 'bt-06', title: 'Décor & lighting setup rehearsal',          phase: 'countdown', timeframe: '1 week before',   category: 'Décor',         status: 'pending',     isCriticalPath: false, assignee: 'Décor Vendor' },
  { id: 'bt-07', title: 'Finalize party favors order',               phase: 'countdown', timeframe: '2 weeks before',  category: 'Favors',        status: 'pending',     isCriticalPath: false, assignee: 'Rohan' },
  // Run-of-show
  { id: 'bt-08', title: 'Venue access & décor setup',                phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '14:00 – 17:00', category: 'Venue',         status: 'pending', isCriticalPath: true,  assignee: 'Décor Vendor' },
  { id: 'bt-09', title: 'Sound check & lighting test',               phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '17:00 – 18:00', category: 'Entertainment', status: 'pending', isCriticalPath: true,  assignee: 'DJ' },
  { id: 'bt-10', title: 'Guest arrival & sunset cocktail hour',      phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '18:30 – 19:30', category: 'Catering',      status: 'pending', isCriticalPath: false, assignee: 'Caterer' },
  { id: 'bt-11', title: 'DJ set + live sax session',                 phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '19:30 – 21:30', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'DJ + Saxophonist' },
  { id: 'bt-12', title: 'Cake reveal & birthday toast',              phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '21:30 – 22:00', category: 'Cake',          status: 'pending', isCriticalPath: true,  assignee: 'Rohan', dependencyNote: 'Cake must arrive by 20:00' },
  { id: 'bt-13', title: 'Photo booth open & party continues',        phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '22:00 – 00:00', category: 'Entertainment', status: 'pending', isCriticalPath: false, assignee: 'Photo Booth Vendor' },
  { id: 'bt-14', title: 'Party favors distribution & wind-down',     phase: 'run-of-show', timeframe: 'Event Day', timeSlot: '00:00 – 00:30', category: 'Logistics',     status: 'pending', isCriticalPath: false, assignee: 'Best Friend' },
];

const birthdayVendors: VendorChecklistItem[] = [
  {
    id: 'bv-01', category: 'Venue', vendorName: 'SkyHigh Rooftop Lounge', contactEmail: 'events@skyhighbandra.com',
    estimatedCost: 36000, actualCost: 36000, status: 'booked', paymentDueDate: '2026-12-01',
    vettingChecklist: [
      { id: 'bc-01', label: 'Confirmed capacity for 80 pax', checked: true },
      { id: 'bc-02', label: 'Rain backup plan available', checked: true },
      { id: 'bc-03', label: 'Noise permit until midnight', checked: true },
    ],
    notes: 'Premium rooftop with city skyline view. Deposit non-refundable.',
  },
  {
    id: 'bv-02', category: 'DJ', vendorName: 'DJ Anika Beats', contactEmail: 'anika@beatsbynika.com',
    estimatedCost: 25000, actualCost: 0, status: 'negotiating',
    vettingChecklist: [
      { id: 'bc-04', label: 'Listened to live set recordings', checked: true },
      { id: 'bc-05', label: 'Confirmed own equipment setup', checked: false },
    ],
    notes: 'Popular club DJ, great with Bollywood-EDM crossover. Checking sax collab pricing.',
  },
  {
    id: 'bv-03', category: 'Caterer', vendorName: 'Urban Bite Catering', contactEmail: 'orders@urbanbite.in',
    estimatedCost: 45000, actualCost: 0, status: 'shortlisted',
    vettingChecklist: [
      { id: 'bc-06', label: 'Menu tasting scheduled', checked: false },
      { id: 'bc-07', label: 'Can handle vegan + gluten-free', checked: true },
    ],
    notes: 'Contemporary fusion menu. Need to confirm cocktail package pricing.',
  },
  {
    id: 'bv-04', category: 'Photo Booth', vendorName: 'SnapLoop 360°', contactEmail: 'hello@snaploop.in',
    estimatedCost: 18000, actualCost: 15000, status: 'booked',
    vettingChecklist: [
      { id: 'bc-08', label: 'Reviewed sample videos', checked: true },
      { id: 'bc-09', label: 'Instant sharing to phone confirmed', checked: true },
    ],
    notes: '360° slow-mo booth with neon props. Includes GIF + boomerang modes.',
  },
];

const birthdayIdeas: PersonalizedIdea[] = [
  { id: 'bi-01', category: 'entertainment', title: 'Secret Rooftop Flash Mob',                   description: 'Coordinate 10 friends to break into a choreographed dance routine during the DJ set. Film from the 360° booth for an unforgettable reel.',                                estimatedCostImpact: 'Budget-neutral', bestForContext: 'Milestone birthdays with close friend groups',         appliedToPlan: false },
  { id: 'bi-02', category: 'decor',         title: 'Interactive Neon Graffiti Wall',              description: 'Set up a UV-reactive graffiti wall where guests can leave glowing birthday messages with UV markers. Doubles as décor and entertainment.',                                estimatedCostImpact: '+₹5,000',        bestForContext: 'Neon / blacklight themed parties',                     appliedToPlan: false },
  { id: 'bi-03', category: 'catering',      title: 'Molecular Cocktail Experience Station',      description: 'Hire a molecular mixologist for 2 hours to craft show-stopping cocktails with liquid nitrogen, edible glitter, and smoke bubbles at the bar.',                             estimatedCostImpact: '+₹8,000',        bestForContext: 'Upscale rooftop parties with cocktail culture',        appliedToPlan: false },
  { id: 'bi-04', category: 'sustainability',title: 'Digital-Only Invites with AR Preview',        description: 'Skip paper entirely — send animated AR-enabled e-invites that let guests point their phone at the invite to see a 3D preview of the rooftop venue.',                       estimatedCostImpact: '-₹3,000 saved',  bestForContext: 'Tech-savvy guest lists, eco-conscious hosts',          appliedToPlan: false },
  { id: 'bi-05', category: 'theme',         title: 'Time Capsule Station',                        description: 'Set up a "Letters to Future Rohan" station where guests write notes to be opened on his 40th birthday. Seal in a custom UV-lit capsule box.',                             estimatedCostImpact: '+₹2,000',        bestForContext: 'Milestone birthday celebrations (30th, 40th, 50th)',   appliedToPlan: false },
];

/** Rohan's 30th Neon Rooftop Soirée — Birthday vertical demo project. */
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
  budgetCategories: birthdayBudgetCategories,
  timelineItems: birthdayTimeline,
  vendors: birthdayVendors,
  savedIdeas: birthdayIdeas,
  decisionLogs: [],
};

// ─── Community Event Persona ────────────────────────────────────────────────

const communityBudgetCategories: BudgetCategory[] = [
  { id: 'c-av',       name: 'AV & Staging',        allocatedAmount: 143000, spentAmount: 50000,  priority: 'high',   isLocked: false, notes: 'Main stage LED wall, 4 breakout room projectors, wireless mic system.' },
  { id: 'c-venue',    name: 'Venue & Permits',      allocatedAmount: 117000, spentAmount: 80000,  priority: 'high',   isLocked: true,  notes: 'Vadodara Convention Centre — all permits (fire, noise, crowd) filed.' },
  { id: 'c-security', name: 'Security & Safety',    allocatedAmount: 65000,  spentAmount: 20000,  priority: 'high',   isLocked: false, notes: '15 security personnel, 2 medical first-aid stations, crowd management plan.' },
  { id: 'c-catering', name: 'Refreshments',          allocatedAmount: 97500,  spentAmount: 15000,  priority: 'medium', isLocked: false, notes: 'Breakfast, lunch buffet, tea breaks, hydration stations. All vegetarian.' },
  { id: 'c-sponsors', name: 'Sponsor Booths',        allocatedAmount: 65000,  spentAmount: 10000,  priority: 'medium', isLocked: false, notes: '20 sponsor booth setups with branded standees and power connections.' },
  { id: 'c-marketing',name: 'Marketing & Comms',     allocatedAmount: 52000,  spentAmount: 35000,  priority: 'medium', isLocked: false, notes: 'Social media campaign, press releases, LinkedIn event page, local radio ads.' },
  { id: 'c-waste',    name: 'Waste Management',      allocatedAmount: 45500,  spentAmount: 5000,   priority: 'medium', isLocked: false, notes: 'Zero-waste target: compost stations, recycling bins, reusable cutlery.' },
  { id: 'c-speakers', name: 'Speaker Honorariums',   allocatedAmount: 39000,  spentAmount: 20000,  priority: 'low',    isLocked: false, notes: '3 keynotes + 8 workshop leads. Travel reimbursement for outstation speakers.' },
  { id: 'c-misc',     name: 'Miscellaneous',         allocatedAmount: 26000,  spentAmount: 2000,   priority: 'low',    isLocked: false, notes: 'Volunteer T-shirts, lanyards, emergency contingency.' },
];

const communityTimeline: TimelineItem[] = [
  // Countdown
  { id: 'ct-01', title: 'Secure venue booking & permits',            phase: 'countdown', timeframe: '6 months before', category: 'Venue',    status: 'completed',   isCriticalPath: true,  assignee: 'Organizing Committee' },
  { id: 'ct-02', title: 'Confirm keynote speakers & panelists',     phase: 'countdown', timeframe: '5 months before', category: 'Speakers', status: 'completed',   isCriticalPath: true,  assignee: 'Program Chair' },
  { id: 'ct-03', title: 'Launch sponsor outreach & booth sales',    phase: 'countdown', timeframe: '4 months before', category: 'Sponsors', status: 'completed',   isCriticalPath: false, assignee: 'Sponsorship Lead' },
  { id: 'ct-04', title: 'Open attendee registration',               phase: 'countdown', timeframe: '3 months before', category: 'Planning', status: 'completed',   isCriticalPath: true,  assignee: 'Registration Team' },
  { id: 'ct-05', title: 'Finalize AV requirements & vendor',       phase: 'countdown', timeframe: '2 months before', category: 'AV',       status: 'in-progress', isCriticalPath: true,  assignee: 'Tech Lead' },
  { id: 'ct-06', title: 'Confirm catering & dietary accommodations', phase: 'countdown', timeframe: '6 weeks before',  category: 'Catering', status: 'in-progress', isCriticalPath: true,  assignee: 'Logistics Lead' },
  { id: 'ct-07', title: 'Recruit & brief 30 volunteers',           phase: 'countdown', timeframe: '4 weeks before',  category: 'Planning', status: 'pending',     isCriticalPath: false, assignee: 'Volunteer Coordinator' },
  { id: 'ct-08', title: 'Final run-through & signage installation', phase: 'countdown', timeframe: '1 week before',   category: 'Venue',    status: 'pending',     isCriticalPath: true,  assignee: 'Organizing Committee' },
  // Run-of-show
  { id: 'ct-09', title: 'Venue open — volunteer stations ready',     phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '07:00 – 08:00', category: 'Venue',    status: 'pending', isCriticalPath: true,  assignee: 'Volunteer Coordinator' },
  { id: 'ct-10', title: 'Registration & welcome kit distribution',   phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '08:00 – 09:00', category: 'Planning', status: 'pending', isCriticalPath: true,  assignee: 'Registration Team' },
  { id: 'ct-11', title: 'Opening keynote: "Tech for Sustainability"',phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '09:00 – 10:00', category: 'Speakers', status: 'pending', isCriticalPath: true,  assignee: 'Keynote Speaker 1' },
  { id: 'ct-12', title: 'Panel: Green Infrastructure & Smart Cities',phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '10:15 – 11:15', category: 'Speakers', status: 'pending', isCriticalPath: false, assignee: 'Panel Moderator' },
  { id: 'ct-13', title: 'Tea break & sponsor booth networking',      phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '11:15 – 11:45', category: 'Catering', status: 'pending', isCriticalPath: false, assignee: 'Caterer' },
  { id: 'ct-14', title: 'Workshop tracks (4 parallel sessions)',     phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '11:45 – 13:00', category: 'Speakers', status: 'pending', isCriticalPath: false, assignee: 'Workshop Leads' },
  { id: 'ct-15', title: 'Networking lunch & sustainability exhibits', phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '13:00 – 14:00', category: 'Catering', status: 'pending', isCriticalPath: true,  assignee: 'Caterer', dependencyNote: 'Must accommodate 500 pax in 60 min' },
  { id: 'ct-16', title: 'Afternoon keynote & fireside chat',         phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '14:00 – 15:30', category: 'Speakers', status: 'pending', isCriticalPath: true,  assignee: 'Keynote Speaker 2' },
  { id: 'ct-17', title: 'Hackathon showcase & awards ceremony',      phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '15:45 – 17:00', category: 'Planning', status: 'pending', isCriticalPath: false, assignee: 'Program Chair' },
  { id: 'ct-18', title: 'Closing remarks & attendee survey',        phase: 'run-of-show', timeframe: 'Summit Day', timeSlot: '17:00 – 17:30', category: 'Planning', status: 'pending', isCriticalPath: false, assignee: 'Organizing Committee' },
];

const communityVendors: VendorChecklistItem[] = [
  {
    id: 'cv-01', category: 'AV Provider', vendorName: 'SoundStage Pro Gujarat', contactEmail: 'tech@soundstagepro.in',
    estimatedCost: 143000, actualCost: 0, status: 'negotiating',
    vettingChecklist: [
      { id: 'cc-01', label: 'Reviewed AV specs for 500-pax hall', checked: true },
      { id: 'cc-02', label: 'Backup equipment clause in contract', checked: false },
      { id: 'cc-03', label: 'On-site technician included', checked: true },
    ],
    notes: 'Leading AV provider in Gujarat. Need to finalize LED wall size.',
  },
  {
    id: 'cv-02', category: 'Security', vendorName: 'GuardForce India', contactEmail: 'ops@guardforce.in',
    estimatedCost: 65000, actualCost: 55000, status: 'booked', paymentDueDate: '2026-12-01',
    vettingChecklist: [
      { id: 'cc-04', label: 'Licensed security personnel', checked: true },
      { id: 'cc-05', label: 'Emergency evacuation plan reviewed', checked: true },
      { id: 'cc-06', label: 'Crowd management for 500+ trained', checked: true },
    ],
    notes: '15 guards + 2 supervisors. Medical team coordination confirmed.',
  },
  {
    id: 'cv-03', category: 'Caterer', vendorName: 'Green Plate Catering', contactEmail: 'hello@greenplate.co.in',
    estimatedCost: 97500, actualCost: 0, status: 'shortlisted',
    vettingChecklist: [
      { id: 'cc-07', label: 'Can handle 500+ servings in buffet format', checked: true },
      { id: 'cc-08', label: 'Zero-waste commitment (compostable servingware)', checked: false },
      { id: 'cc-09', label: 'FSSAI certified', checked: true },
    ],
    notes: 'Vegetarian-only caterer with sustainable packaging. Tasting pending.',
  },
  {
    id: 'cv-04', category: 'Waste Management', vendorName: 'EcoSort Vadodara', contactEmail: 'info@ecosort.org',
    estimatedCost: 45500, actualCost: 40000, status: 'booked', paymentDueDate: '2027-01-15',
    vettingChecklist: [
      { id: 'cc-10', label: 'Compost collection setup confirmed', checked: true },
      { id: 'cc-11', label: 'Recycling stations for 500+ event', checked: true },
      { id: 'cc-12', label: 'Post-event waste report included', checked: true },
    ],
    notes: 'Local NGO partner. Will provide waste audit report for sustainability metrics.',
  },
];

const communityIdeas: PersonalizedIdea[] = [
  { id: 'ci-01', category: 'sustainability', title: 'Carbon-Neutral Event Certification',            description: 'Partner with a carbon offset provider to measure and neutralize the summit\'s carbon footprint. Display a live carbon dashboard at the venue and issue digital certificates to attendees.',     estimatedCostImpact: '+₹15,000',       bestForContext: 'Tech & sustainability focused conferences',            appliedToPlan: false },
  { id: 'ci-02', category: 'entertainment',  title: 'Live Hackathon with Sustainability Challenge',  description: 'Run a 3-hour mini-hackathon during the afternoon where teams build sustainability tech prototypes. Top 3 teams get prizes and mentorship from keynote speakers.',                              estimatedCostImpact: '+₹20,000',       bestForContext: 'Tech summits with developer audience',                 appliedToPlan: false },
  { id: 'ci-03', category: 'logistics',      title: 'AI-Powered Attendee Matchmaking App',           description: 'Deploy a simple web app that matches attendees by interests and schedules 1:1 networking meetings during breaks, maximizing the value of the event for every participant.',                    estimatedCostImpact: '+₹8,000',        bestForContext: 'Professional networking events with 300+ attendees',   appliedToPlan: false },
  { id: 'ci-04', category: 'catering',       title: 'Farm-to-Table Local Sourcing Initiative',       description: 'Source all catering ingredients from farms within 50 km of Vadodara. Display origin stories at food stations to connect attendees with local agriculture.',                                   estimatedCostImpact: 'Budget-neutral',  bestForContext: 'Sustainability-themed events in agricultural regions', appliedToPlan: false },
  { id: 'ci-05', category: 'decor',          title: 'Upcycled Art Installations by Local Artists',   description: 'Commission 3 local artists to create installations from e-waste and recycled materials. Auction them post-event, with proceeds going to a local STEM education NGO.',                        estimatedCostImpact: '+₹12,000',       bestForContext: 'Community events focused on sustainability & art',     appliedToPlan: false },
];

/** Vadodara Tech & Sustainability Summit 2026 — Community vertical demo project. */
export const communityPersona: EventProject = {
  id: 'vesta-community-001',
  title: 'Vadodara Tech & Sustainability Summit 2026',
  vertical: 'community',
  personaName: 'Vadodara Innovation Collective',
  date: '2027-03-22',
  location: 'Vadodara, Gujarat',
  guestCount: 500,
  totalBudget: 650000,
  currency: 'INR',
  season: 'spring',
  indoorOutdoor: 'indoor',
  vibeTags: ['Tech', 'Sustainable', 'Inclusive', 'Innovation', 'Professional'],
  dietaryRestrictions: ['Vegetarian', 'Vegan'],
  budgetCategories: communityBudgetCategories,
  timelineItems: communityTimeline,
  vendors: communityVendors,
  savedIdeas: communityIdeas,
  decisionLogs: [],
};

// ─── Exports ────────────────────────────────────────────────────────────────

/** All demo personas indexed by vertical. */
export const personasByVertical: Record<EventVertical, EventProject> = {
  wedding: weddingPersona,
  birthday: birthdayPersona,
  community: communityPersona,
};

/** Convenience array of all demo projects. */
export const allPersonas: EventProject[] = [weddingPersona, birthdayPersona, communityPersona];
