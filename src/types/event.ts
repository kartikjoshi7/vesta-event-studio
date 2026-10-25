/**
 * @fileoverview Core event domain types for Vesta Event Studio (< 140L).
 */

export type EventVertical = 'wedding' | 'birthday' | 'community';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'hybrid';
export type Season = 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  priority: 'high' | 'medium' | 'low';
  isLocked: boolean;
  notes: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  phase: 'countdown' | 'run-of-show';
  timeframe: string;
  timeSlot?: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending' | 'at-risk';
  isCriticalPath: boolean;
  assignee?: string;
  dependencyNote?: string;
}

export interface VettingChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface VendorChecklistItem {
  id: string;
  category: string;
  vendorName: string;
  contactEmail: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'shortlisted' | 'negotiating' | 'booked' | 'paid';
  paymentDueDate?: string;
  vettingChecklist: VettingChecklistItem[];
  notes: string;
}

export type IdeaCategory =
  | 'theme'
  | 'decor'
  | 'catering'
  | 'entertainment'
  | 'sustainability'
  | 'logistics';

export interface PersonalizedIdea {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  estimatedCostImpact: string;
  bestForContext: string;
  appliedToPlan: boolean;
}

export interface ContextDecisionLog {
  id: string;
  timestamp: string;
  trigger: string;
  reasoning: string;
  actionTaken: string;
  impactLevel: 'high' | 'medium' | 'low';
}

export interface EventProject {
  id: string;
  title: string;
  vertical: EventVertical;
  personaName: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  season: Season;
  indoorOutdoor: IndoorOutdoor;
  priorityFocus?: string;
  vibeTags: string[];
  dietaryRestrictions: string[];
  budgetCategories: BudgetCategory[];
  timelineItems: TimelineItem[];
  vendors: VendorChecklistItem[];
  savedIdeas: PersonalizedIdea[];
  decisionLogs: ContextDecisionLog[];
}
