/**
 * @fileoverview Core event domain types for Vesta Event Studio.
 *
 * Defines the full type system covering event verticals, budget allocation,
 * timeline management, vendor tracking, AI-generated ideas, and decision logging.
 * Every interface is designed for serialization (localStorage / JSON export) and
 * strict TypeScript narrowing—no `any` types are used.
 */

// ─── Event Verticals ────────────────────────────────────────────────────────

/** The three supported event verticals. */
export type EventVertical = 'wedding' | 'birthday' | 'community';

/** Indoor / outdoor classification for venue planning. */
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'hybrid';

/** Season hint used by the context engine for weather contingency planning. */
export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';

// ─── Budget ─────────────────────────────────────────────────────────────────

/**
 * A single line-item in the event budget.
 *
 * @example
 * ```ts
 * const catering: BudgetCategory = {
 *   id: 'cat-01',
 *   name: 'Catering',
 *   allocatedAmount: 500000,
 *   spentAmount: 120000,
 *   priority: 'high',
 *   isLocked: false,
 *   notes: 'Vegetarian + Jain options required',
 * };
 * ```
 */
export interface BudgetCategory {
  /** Unique identifier (UUID or slug). */
  id: string;
  /** Human-readable category name (e.g. "Photography", "AV Staging"). */
  name: string;
  /** Planned allocation in the project currency. */
  allocatedAmount: number;
  /** Actual spend to date. */
  spentAmount: number;
  /** Relative priority used by the rebalance engine. */
  priority: 'high' | 'medium' | 'low';
  /** When `true` the rebalance engine will not touch this category. */
  isLocked: boolean;
  /** Free-form notes visible to the planner. */
  notes: string;
}

// ─── Timeline ───────────────────────────────────────────────────────────────

/**
 * A single item on the event timeline.
 *
 * Items belong to either the **countdown** phase (weeks/months before the
 * event) or the **run-of-show** phase (the event day itself).
 */
export interface TimelineItem {
  /** Unique identifier. */
  id: string;
  /** Short, actionable title. */
  title: string;
  /** Which planning phase this item belongs to. */
  phase: 'countdown' | 'run-of-show';
  /** Human-readable relative time, e.g. "6 months before" or "Day 2". */
  timeframe: string;
  /** Optional clock time for run-of-show items, e.g. "09:30 – 10:00". */
  timeSlot?: string;
  /** Logical category (e.g. "Venue", "Catering", "Entertainment"). */
  category: string;
  /** Current completion status. */
  status: 'completed' | 'in-progress' | 'pending' | 'at-risk';
  /** If `true`, delays here cascade to the whole event. */
  isCriticalPath: boolean;
  /** Person or team responsible. */
  assignee?: string;
  /** Free-form note describing upstream dependencies. */
  dependencyNote?: string;
}

// ─── Vendors ────────────────────────────────────────────────────────────────

/** A single checkbox in the vendor vetting checklist. */
export interface VettingChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

/**
 * Tracks a vendor from shortlisting through final payment.
 */
export interface VendorChecklistItem {
  /** Unique identifier. */
  id: string;
  /** Service category (e.g. "Photographer", "Sound Engineer"). */
  category: string;
  /** Business or individual name. */
  vendorName: string;
  /** Primary contact email. */
  contactEmail: string;
  /** Quoted / estimated cost. */
  estimatedCost: number;
  /** Final negotiated or invoiced cost. */
  actualCost: number;
  /** Procurement funnel stage. */
  status: 'shortlisted' | 'negotiating' | 'booked' | 'paid';
  /** ISO date string for the next payment milestone. */
  paymentDueDate?: string;
  /** Structured due-diligence checklist. */
  vettingChecklist: VettingChecklistItem[];
  /** Free-form notes. */
  notes: string;
}

// ─── AI-Generated Ideas ────────────────────────────────────────────────────

/** Categories for AI-generated personalized suggestions. */
export type IdeaCategory =
  | 'theme'
  | 'decor'
  | 'catering'
  | 'entertainment'
  | 'sustainability'
  | 'logistics';

/**
 * A single AI-generated or curated idea that the planner can apply to the
 * event project.
 */
export interface PersonalizedIdea {
  /** Unique identifier. */
  id: string;
  /** Functional category for filtering. */
  category: IdeaCategory;
  /** Short headline. */
  title: string;
  /** Rich description explaining the idea and why it fits the event. */
  description: string;
  /** Approximate budget impact description (e.g. "+₹12,000" or "Budget-neutral"). */
  estimatedCostImpact: string;
  /** Contextual note on when/where this idea shines. */
  bestForContext: string;
  /** Whether the planner has accepted this idea into the plan. */
  appliedToPlan: boolean;
}

// ─── Decision Logging ───────────────────────────────────────────────────────

/**
 * An auditable record of a context-engine or AI-driven decision.
 *
 * Every automated rebalance, contingency activation, or AI suggestion
 * generates one of these so the planner can review the reasoning chain.
 */
export interface ContextDecisionLog {
  /** Unique identifier. */
  id: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** What triggered this decision (e.g. "Budget reduced by 20%"). */
  trigger: string;
  /** The engine's reasoning chain summary. */
  reasoning: string;
  /** Human-readable description of the action taken. */
  actionTaken: string;
  /** Severity / significance of this decision. */
  impactLevel: 'high' | 'medium' | 'low';
}

// ─── Top-Level Event Project ────────────────────────────────────────────────

/**
 * The root aggregate for an event planning project.
 *
 * Every screen in Vesta Event Studio reads from and writes to this structure.
 * It is persisted to `localStorage` as a JSON blob keyed by `id`.
 */
export interface EventProject {
  /** UUID for the project. */
  id: string;
  /** User-chosen project title. */
  title: string;
  /** Which vertical template this project follows. */
  vertical: EventVertical;
  /** Name of the persona / host. */
  personaName: string;
  /** Target event date (ISO 8601). */
  date: string;
  /** Venue or city name. */
  location: string;
  /** Expected number of guests / attendees. */
  guestCount: number;
  /** Total budget in the chosen currency. */
  totalBudget: number;
  /** ISO 4217 currency code (e.g. "INR", "USD"). */
  currency: string;
  /** Seasonal hint for context-aware planning. */
  season: Season;
  /** Venue type classification. */
  indoorOutdoor: IndoorOutdoor;
  /** Free-form vibe / aesthetic tags. */
  vibeTags: string[];
  /** Dietary restriction labels for catering planning. */
  dietaryRestrictions: string[];
  /** Itemised budget breakdown. */
  budgetCategories: BudgetCategory[];
  /** Full timeline (countdown + run-of-show). */
  timelineItems: TimelineItem[];
  /** Vendor tracking list. */
  vendors: VendorChecklistItem[];
  /** AI-generated or curated ideas. */
  savedIdeas: PersonalizedIdea[];
  /** Audit trail of automated decisions. */
  decisionLogs: ContextDecisionLog[];
}
