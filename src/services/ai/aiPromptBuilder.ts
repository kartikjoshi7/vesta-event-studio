/**
 * @fileoverview Prompt templates and response parsers for Vesta Event Studio AI.
 */

import type { EventProject, VendorChecklistItem, PersonalizedIdea, IdeaCategory } from '../../types/event';
import { safeJsonParse } from '../../utils/security';

export function buildIdeasPrompt(project: EventProject, customPrompt: string): string {
  return [
    'You are Vesta, an expert event planning AI assistant.',
    `The user is planning: "${project.title}" — a ${project.vertical} event.`,
    `Details: ${project.guestCount} guests, ₹${project.totalBudget.toLocaleString('en-IN')} budget, ${project.season} season, ${project.indoorOutdoor} venue in ${project.location}.`,
    `Vibe: ${project.vibeTags.join(', ')}.`,
    `Dietary restrictions: ${project.dietaryRestrictions.join(', ')}.`,
    customPrompt ? `User's specific request: "${customPrompt}"` : '',
    '',
    'Generate exactly 5 creative, personalised event ideas as a JSON array of objects with these fields:',
    '- category: one of "theme", "decor", "catering", "entertainment", "sustainability", "logistics"',
    '- title: short headline',
    '- description: 2-3 sentence rich description',
    '- estimatedCostImpact: string like "+₹15,000" or "Budget-neutral"',
    '- bestForContext: when/where this idea works best',
    '',
    'Return ONLY the JSON array, no markdown fences or explanation.',
  ].filter(Boolean).join('\n');
}

export function buildVendorPrompt(project: EventProject, vendor: VendorChecklistItem, goal: string): string {
  return [
    'You are Vesta, an expert event planning AI writing a professional vendor email.',
    `Event: "${project.title}" (${project.vertical}), ${project.date} at ${project.location}, ${project.guestCount} guests.`,
    `Vendor: ${vendor.vendorName} (${vendor.category}), estimated cost: ₹${vendor.estimatedCost.toLocaleString('en-IN')}, status: ${vendor.status}.`,
    `Goal: ${goal}`,
    '',
    `Write a polite, professional email from ${project.personaName} to the vendor. Be concise, specific, and include relevant event details. Sign off with "Powered by Vesta Event Studio".`,
  ].join('\n');
}

export function buildAssistantPrompt(project: EventProject, query: string): string {
  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);
  const completedTasks = project.timelineItems.filter((t) => t.status === 'completed').length;

  return [
    'You are Vesta, an expert AI event planning assistant. Answer the user\'s question about their event.',
    `Event: "${project.title}" (${project.vertical})`,
    `Date: ${project.date}, Location: ${project.location}`,
    `Guests: ${project.guestCount}, Budget: ₹${project.totalBudget.toLocaleString('en-IN')}, Spent: ₹${totalSpent.toLocaleString('en-IN')}`,
    `Timeline: ${completedTasks}/${project.timelineItems.length} tasks done`,
    `Vendors: ${project.vendors.filter((v) => v.status === 'booked' || v.status === 'paid').length}/${project.vendors.length} booked`,
    `Vibe: ${project.vibeTags.join(', ')}`,
    '',
    `User's question: "${query}"`,
    '',
    'Provide a helpful, concise answer in markdown format. If applicable, suggest a specific next action.',
  ].join('\n');
}

export function parseIdeasResponse(raw: string, vertical: string): PersonalizedIdea[] {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = safeJsonParse<Array<Record<string, unknown>>>(cleaned, []);
  if (!Array.isArray(parsed) || parsed.length === 0) return [];

  const validCategories: IdeaCategory[] = ['theme', 'decor', 'catering', 'entertainment', 'sustainability', 'logistics'];

  return parsed
    .filter((item) => item && typeof item.title === 'string' && typeof item.description === 'string')
    .map((item, index) => ({
      id: `ai-${vertical}-${Date.now()}-${index}`,
      category: (validCategories.includes(item.category as IdeaCategory)
        ? item.category
        : 'theme') as IdeaCategory,
      title: String(item.title),
      description: String(item.description),
      estimatedCostImpact: String(item.estimatedCostImpact ?? 'Budget-neutral'),
      bestForContext: String(item.bestForContext ?? 'General use'),
      appliedToPlan: false,
    }));
}
