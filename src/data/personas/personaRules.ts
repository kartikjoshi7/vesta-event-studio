/**
 * @fileoverview Allocation rules and persona metadata for Vesta Event Studio verticals.
 */

import type { EventVertical } from '../../types/event';

export interface AllocationRule {
  categorySlug: string;
  label: string;
  defaultPct: number;
  isVariableCost: boolean;
  defaultPriority: 'high' | 'medium' | 'low';
}

export interface PersonaMeta {
  vertical: EventVertical;
  tagline: string;
  emoji: string;
  primaryColor: string;
  suggestedVibeTags: string[];
}

export const weddingAllocationRules: AllocationRule[] = [
  { categorySlug: 'venue', label: 'Venue & Décor', defaultPct: 0.30, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'catering', label: 'Catering', defaultPct: 0.25, isVariableCost: true, defaultPriority: 'high' },
  { categorySlug: 'photography', label: 'Photography', defaultPct: 0.12, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'entertainment', label: 'Entertainment', defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'attire', label: 'Attire & Jewelry', defaultPct: 0.08, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'logistics', label: 'Logistics', defaultPct: 0.08, isVariableCost: true, defaultPriority: 'medium' },
  { categorySlug: 'invitations', label: 'Invitations', defaultPct: 0.04, isVariableCost: true, defaultPriority: 'low' },
  { categorySlug: 'misc', label: 'Miscellaneous', defaultPct: 0.03, isVariableCost: false, defaultPriority: 'low' },
];

export const birthdayAllocationRules: AllocationRule[] = [
  { categorySlug: 'venue', label: 'Venue Rental', defaultPct: 0.20, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'catering', label: 'Food & Beverages', defaultPct: 0.25, isVariableCost: true, defaultPriority: 'high' },
  { categorySlug: 'entertainment', label: 'Entertainment & DJ', defaultPct: 0.18, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'cake', label: 'Custom Cake', defaultPct: 0.08, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'photobooth', label: 'Photo Booth & Media', defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'decor', label: 'Décor & Lighting', defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'favors', label: 'Party Favors', defaultPct: 0.05, isVariableCost: true, defaultPriority: 'low' },
  { categorySlug: 'misc', label: 'Miscellaneous', defaultPct: 0.04, isVariableCost: false, defaultPriority: 'low' },
];

export const communityAllocationRules: AllocationRule[] = [
  { categorySlug: 'av-staging', label: 'AV & Staging', defaultPct: 0.22, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'venue', label: 'Venue & Permits', defaultPct: 0.18, isVariableCost: false, defaultPriority: 'high' },
  { categorySlug: 'security', label: 'Security & Safety', defaultPct: 0.10, isVariableCost: true, defaultPriority: 'high' },
  { categorySlug: 'catering', label: 'Refreshments', defaultPct: 0.15, isVariableCost: true, defaultPriority: 'medium' },
  { categorySlug: 'sponsors', label: 'Sponsor Booths', defaultPct: 0.10, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'marketing', label: 'Marketing & Comms', defaultPct: 0.08, isVariableCost: false, defaultPriority: 'medium' },
  { categorySlug: 'waste', label: 'Waste Management', defaultPct: 0.07, isVariableCost: true, defaultPriority: 'medium' },
  { categorySlug: 'speakers', label: 'Speaker Honorariums', defaultPct: 0.06, isVariableCost: false, defaultPriority: 'low' },
  { categorySlug: 'misc', label: 'Miscellaneous', defaultPct: 0.04, isVariableCost: false, defaultPriority: 'low' },
];

export const allocationRulesByVertical: Record<EventVertical, AllocationRule[]> = {
  wedding: weddingAllocationRules,
  birthday: birthdayAllocationRules,
  community: communityAllocationRules,
};

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
