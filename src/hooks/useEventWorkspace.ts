/**
 * @fileoverview Unified Workspace State Facade for Vesta Event Studio (< 140L).
 */

import { useMemo, useCallback } from 'react';
import type {
  EventProject,
  EventVertical,
  TimelineItem,
  VendorChecklistItem,
  PersonalizedIdea,
  ContextDecisionLog,
} from '../types/event';
import { allPersonas, personaMetadata } from '../data/verticalPersonas';
import { rebalanceBudgetForContext, calculateEventReadiness, generateContingencyPlan, type ReadinessScore } from '../services/contextEngine';
import { sanitizeUserInput, validateNumberInput } from '../utils/security';
import { useBudgetDomain } from './useBudgetDomain';
import { useTimelineDomain } from './useTimelineDomain';
import { useVendorDomain } from './useVendorDomain';
import { useProjectPersistence } from './useProjectPersistence';

export interface UseEventWorkspaceReturn {
  projects: EventProject[];
  activeProjectId: string;
  activeProject: EventProject;
  readinessMetrics: ReadinessScore;
  selectVerticalProject: (verticalOrId: EventVertical | string) => void;
  createNewProject: (customData: Partial<EventProject>) => EventProject;
  updateProjectContext: (updates: {
    totalBudget?: number;
    guestCount?: number;
    season?: string;
    indoorOutdoor?: 'indoor' | 'outdoor' | 'hybrid';
    priorityFocus?: string;
    title?: string;
    location?: string;
  }) => void;
  toggleCategoryLock: (categoryId: string) => void;
  updateCategorySpend: (categoryId: string, allocated: number, spent: number) => void;
  addBudgetCategory: (name: string, allocated: number, priority: 'high' | 'medium' | 'low') => void;
  updateTimelineStatus: (itemId: string, status: TimelineItem['status']) => void;
  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  toggleVendorChecklistItem: (vendorId: string, checkId: string) => void;
  updateVendorStatus: (vendorId: string, status: VendorChecklistItem['status'], actualCost?: number) => void;
  addVendor: (vendor: Omit<VendorChecklistItem, 'id'>) => void;
  applyIdeaToPlan: (ideaId: string) => void;
  addGeneratedIdeas: (ideas: PersonalizedIdea[]) => void;
  triggerContingencyScenario: (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
    adjustments: string[];
    notes: string[];
    log: ContextDecisionLog;
  };
  resetDemoData: () => void;
}

export function useEventWorkspace(): UseEventWorkspaceReturn {
  const { projects, setProjects, activeProjectId, setActiveProjectId, activeProject, updateActiveProject, resetDemoData } = useProjectPersistence();

  const readinessMetrics = useMemo(() => calculateEventReadiness(activeProject), [activeProject]);
  const budgetDomain = useBudgetDomain(updateActiveProject);
  const timelineDomain = useTimelineDomain(updateActiveProject);
  const vendorDomain = useVendorDomain(updateActiveProject);

  const selectVerticalProject = useCallback((verticalOrId: EventVertical | string) => {
    const match = projects.find((p) => p.id === verticalOrId) || projects.find((p) => p.vertical === verticalOrId);
    if (match) setActiveProjectId(match.id);
  }, [projects, setActiveProjectId]);

  const createNewProject = useCallback((customData: Partial<EventProject>): EventProject => {
    const vertical: EventVertical = customData.vertical || 'wedding';
    const template = allPersonas.find((p) => p.vertical === vertical) || allPersonas[0];
    const meta = personaMetadata[vertical];
    const initialBudget = validateNumberInput(customData.totalBudget, 10_000, 1_000_000_000, template.totalBudget);
    const initialGuests = validateNumberInput(customData.guestCount, 1, 100_000, template.guestCount);
    const rebalance = rebalanceBudgetForContext({ ...template, totalBudget: initialBudget, guestCount: initialGuests }, initialBudget, initialGuests);
    const newId = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const title = sanitizeUserInput(customData.title || `${customData.personaName || 'Custom'}'s Celebration`, 100);

    const newProject: EventProject = {
      id: newId,
      title: title || 'New Celebration Project',
      vertical,
      personaName: sanitizeUserInput(customData.personaName || 'Event Host', 80),
      date: customData.date || new Date(Date.now() + 90 * 86_400_000).toISOString().split('T')[0],
      location: sanitizeUserInput(customData.location || 'Bengaluru, India', 100),
      guestCount: initialGuests,
      totalBudget: initialBudget,
      currency: customData.currency || template.currency || 'INR',
      season: (customData.season as EventProject['season']) || template.season,
      indoorOutdoor: customData.indoorOutdoor || template.indoorOutdoor,
      vibeTags: customData.vibeTags?.length ? customData.vibeTags.map((t) => sanitizeUserInput(t, 30)) : meta.suggestedVibeTags,
      dietaryRestrictions: customData.dietaryRestrictions || template.dietaryRestrictions,
      budgetCategories: rebalance.updatedCategories,
      timelineItems: template.timelineItems.map((item) => ({ ...item, id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, status: 'pending' })),
      vendors: template.vendors.map((v) => ({ ...v, id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, status: 'shortlisted', actualCost: 0, vettingChecklist: v.vettingChecklist.map((c) => ({ ...c, checked: false })) })),
      savedIdeas: template.savedIdeas.map((idea) => ({ ...idea, id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, appliedToPlan: false })),
      decisionLogs: [{ id: `cdl-${Date.now()}`, timestamp: new Date().toISOString(), trigger: `Initialized ${meta.emoji} ${vertical}`, reasoning: `Scaffolded bespoke event for ${title}.`, actionTaken: `Configured ${rebalance.updatedCategories.length} categories.`, impactLevel: 'medium' }],
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newId);
    return newProject;
  }, [setProjects, setActiveProjectId]);

  const updateProjectContext = useCallback((updates: { totalBudget?: number; guestCount?: number; season?: string; indoorOutdoor?: 'indoor' | 'outdoor' | 'hybrid'; priorityFocus?: string; title?: string; location?: string }) => {
    updateActiveProject((current) => {
      const newBudget = updates.totalBudget !== undefined ? validateNumberInput(updates.totalBudget, 1000, 1_000_000_000, current.totalBudget) : current.totalBudget;
      const newGuests = updates.guestCount !== undefined ? validateNumberInput(updates.guestCount, 1, 100_000, current.guestCount) : current.guestCount;
      const needsRebalance = updates.totalBudget !== undefined || updates.guestCount !== undefined || updates.priorityFocus !== undefined;
      const reb = needsRebalance ? rebalanceBudgetForContext(current, newBudget, newGuests, updates.priorityFocus) : null;
      return {
        ...current,
        totalBudget: newBudget,
        guestCount: newGuests,
        season: (updates.season as EventProject['season']) || current.season,
        indoorOutdoor: updates.indoorOutdoor || current.indoorOutdoor,
        title: updates.title ? sanitizeUserInput(updates.title, 100) : current.title,
        location: updates.location ? sanitizeUserInput(updates.location, 100) : current.location,
        budgetCategories: reb ? reb.updatedCategories : current.budgetCategories,
        decisionLogs: reb ? [reb.decisionLog, ...current.decisionLogs] : current.decisionLogs,
      };
    });
  }, [updateActiveProject]);

  const addGeneratedIdeas = useCallback((newIdeas: PersonalizedIdea[]) => {
    updateActiveProject((curr) => {
      const titles = new Set(curr.savedIdeas.map((i) => i.title.toLowerCase()));
      return { ...curr, savedIdeas: [...newIdeas.filter((i) => !titles.has(i.title.toLowerCase())), ...curr.savedIdeas] };
    });
  }, [updateActiveProject]);

  const triggerContingencyScenario = useCallback((scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
    const contingency = generateContingencyPlan(activeProject, scenario);
    updateActiveProject((curr) => {
      const p = { ...curr };
      if (scenario === 'weather') p.indoorOutdoor = 'indoor';
      else if (scenario === 'budget-cut') {
        const cut = Math.round(curr.totalBudget * 0.85);
        p.totalBudget = cut;
        p.budgetCategories = rebalanceBudgetForContext(curr, cut, curr.guestCount).updatedCategories;
      } else if (scenario === 'guest-surge') {
        const surge = Math.round(curr.guestCount * 1.25);
        p.guestCount = surge;
        p.budgetCategories = rebalanceBudgetForContext(curr, curr.totalBudget, surge).updatedCategories;
      } else if (scenario === 'vendor-drop') {
        p.vendors = curr.vendors.map((v, i) => i === 0 ? { ...v, status: 'shortlisted', notes: `[Backup Alert]: Sourcing replacement. ${v.notes}` } : v);
      }
      const task: TimelineItem = { id: `tl-cont-${Date.now()}`, title: `Contingency: ${scenario.toUpperCase()}`, phase: 'countdown', timeframe: 'Immediate (48h)', category: 'Contingency', status: 'at-risk', isCriticalPath: true, assignee: 'Operations Lead' };
      return { ...p, timelineItems: [task, ...p.timelineItems], decisionLogs: [contingency.decisionLog, ...p.decisionLogs] };
    });
    return { adjustments: contingency.adjustments, notes: contingency.updatedTimelineNotes, log: contingency.decisionLog };
  }, [activeProject, updateActiveProject]);

  return {
    projects, activeProjectId, activeProject, readinessMetrics, selectVerticalProject, createNewProject, updateProjectContext,
    toggleCategoryLock: budgetDomain.toggleCategoryLock, updateCategorySpend: budgetDomain.updateCategorySpend, addBudgetCategory: budgetDomain.addBudgetCategory,
    updateTimelineStatus: timelineDomain.updateTimelineStatus, addTimelineItem: timelineDomain.addTimelineItem,
    toggleVendorChecklistItem: vendorDomain.toggleVendorChecklistItem, updateVendorStatus: vendorDomain.updateVendorStatus, addVendor: vendorDomain.addVendor,
    applyIdeaToPlan: timelineDomain.applyIdeaToPlan, addGeneratedIdeas, triggerContingencyScenario, resetDemoData,
  };
}
