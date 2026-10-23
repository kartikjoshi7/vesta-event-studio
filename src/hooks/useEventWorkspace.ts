/**
 * @fileoverview Persistent Workspace State Hook for Vesta Event Studio.
 *
 * Manages event project state across vertical personas (wedding, birthday,
 * community) with persistent localStorage synchronization, defensive parsing,
 * automatic contextual rebalancing, and auditable decision logging.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  EventProject,
  EventVertical,
  BudgetCategory,
  TimelineItem,
  VendorChecklistItem,
  ContextDecisionLog,
} from '../types/event';
import {
  allPersonas,
  personaMetadata,
} from '../data/verticalPersonas';
import {
  rebalanceBudgetForContext,
  calculateEventReadiness,
  generateContingencyPlan,
  type ReadinessScore,
} from '../services/contextEngine';
import {
  safeJsonParse,
  sanitizeUserInput,
  validateNumberInput,
} from '../utils/security';

const STORAGE_KEY_PROJECTS = 'vesta_event_studio_projects_v1';
const STORAGE_KEY_ACTIVE_ID = 'vesta_event_studio_active_id_v1';

function uid(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Loads projects from localStorage or falls back to standard personas.
 */
function loadInitialProjects(): EventProject[] {
  if (typeof window === 'undefined') {
    return allPersonas;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) return allPersonas;
    const parsed = safeJsonParse<EventProject[]>(raw, []);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : allPersonas;
  } catch {
    return allPersonas;
  }
}

/**
 * Loads the last active project ID or falls back to the first available project.
 */
function loadInitialActiveId(projects: EventProject[]): string {
  if (typeof window === 'undefined') {
    return projects[0]?.id || '';
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved && projects.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {
    // SSR or privacy mode
  }
  return projects[0]?.id || '';
}

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
  triggerContingencyScenario: (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
    adjustments: string[];
    notes: string[];
    log: ContextDecisionLog;
  };
  resetDemoData: () => void;
}

export function useEventWorkspace(): UseEventWorkspaceReturn {
  const [projects, setProjects] = useState<EventProject[]>(loadInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadInitialActiveId(projects),
  );

  // Sync projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch {
      // Storage quota or privacy mode error handling
    }
  }, [projects]);

  // Sync active project ID to localStorage
  useEffect(() => {
    try {
      if (activeProjectId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeProjectId);
      }
    } catch {
      // Ignore storage errors
    }
  }, [activeProjectId]);

  // Active project memo
  const activeProject = useMemo<EventProject>(() => {
    const match = projects.find((p) => p.id === activeProjectId);
    return match || projects[0] || allPersonas[0];
  }, [projects, activeProjectId]);

  // Real-time readiness score memo
  const readinessMetrics = useMemo<ReadinessScore>(() => {
    return calculateEventReadiness(activeProject);
  }, [activeProject]);

  // Helper to update active project immutably
  const updateActiveProject = useCallback(
    (updater: (prev: EventProject) => EventProject) => {
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === activeProject.id ? updater(p) : p)),
      );
    },
    [activeProject.id],
  );

  // 1. Select vertical or specific project ID
  const selectVerticalProject = useCallback(
    (verticalOrId: EventVertical | string) => {
      const match =
        projects.find((p) => p.id === verticalOrId) ||
        projects.find((p) => p.vertical === verticalOrId);

      if (match) {
        setActiveProjectId(match.id);
      }
    },
    [projects],
  );

  // 2. Create custom event project
  const createNewProject = useCallback(
    (customData: Partial<EventProject>): EventProject => {
      const vertical: EventVertical = customData.vertical || 'wedding';
      const template =
        allPersonas.find((p) => p.vertical === vertical) || allPersonas[0];
      const meta = personaMetadata[vertical];

      const initialBudget = validateNumberInput(
        customData.totalBudget,
        10_000,
        1_000_000_000,
        template.totalBudget,
      );
      const initialGuests = validateNumberInput(
        customData.guestCount,
        1,
        100_000,
        template.guestCount,
      );

      // Clone template categories and rebalance for the new budget & guest count
      const rebalanceInitial = rebalanceBudgetForContext(
        {
          ...template,
          totalBudget: initialBudget,
          guestCount: initialGuests,
        },
        initialBudget,
        initialGuests,
      );

      const newId = uid('proj');
      const title = sanitizeUserInput(
        customData.title || `${customData.personaName || 'Custom'}'s Celebration`,
        100,
      );

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
        vibeTags:
          customData.vibeTags && customData.vibeTags.length > 0
            ? customData.vibeTags.map((t) => sanitizeUserInput(t, 30))
            : meta.suggestedVibeTags,
        dietaryRestrictions:
          customData.dietaryRestrictions || template.dietaryRestrictions,
        budgetCategories: rebalanceInitial.updatedCategories,
        timelineItems: template.timelineItems.map((item) => ({
          ...item,
          id: uid('tl'),
          status: 'pending',
        })),
        vendors: template.vendors.map((v) => ({
          ...v,
          id: uid('vendor'),
          status: 'shortlisted',
          actualCost: 0,
          vettingChecklist: v.vettingChecklist.map((c) => ({ ...c, checked: false })),
        })),
        savedIdeas: template.savedIdeas.map((idea) => ({
          ...idea,
          id: uid('idea'),
          appliedToPlan: false,
        })),
        decisionLogs: [
          {
            id: uid('cdl'),
            timestamp: nowIso(),
            trigger: `Initialized ${meta.emoji} ${vertical.toUpperCase()} Project`,
            reasoning: `Scaffolded bespoke event architecture for ${title} with ${initialGuests} guests and ${template.currency} ${initialBudget.toLocaleString()} budget.`,
            actionTaken: `Configured ${rebalanceInitial.updatedCategories.length} allocation categories, ${template.timelineItems.length} timeline milestones, and ${template.vendors.length} vendor workflows.`,
            impactLevel: 'medium',
          },
        ],
      };

      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newId);
      return newProject;
    },
    [],
  );

  // 3. Update project context (budget, guests, setting) with automatic rebalance
  const updateProjectContext = useCallback(
    (updates: {
      totalBudget?: number;
      guestCount?: number;
      season?: string;
      indoorOutdoor?: 'indoor' | 'outdoor' | 'hybrid';
      priorityFocus?: string;
      title?: string;
      location?: string;
    }) => {
      updateActiveProject((current) => {
        const newBudget =
          updates.totalBudget !== undefined
            ? validateNumberInput(updates.totalBudget, 1000, 1_000_000_000, current.totalBudget)
            : current.totalBudget;

        const newGuests =
          updates.guestCount !== undefined
            ? validateNumberInput(updates.guestCount, 1, 100_000, current.guestCount)
            : current.guestCount;

        const needsRebalance =
          updates.totalBudget !== undefined ||
          updates.guestCount !== undefined ||
          updates.priorityFocus !== undefined;

        let updatedCategories = current.budgetCategories;
        const newLogs: ContextDecisionLog[] = [...current.decisionLogs];

        if (needsRebalance) {
          const rebalance = rebalanceBudgetForContext(
            current,
            newBudget,
            newGuests,
            updates.priorityFocus,
          );
          updatedCategories = rebalance.updatedCategories;
          newLogs.unshift(rebalance.decisionLog);
        }

        if (updates.indoorOutdoor && updates.indoorOutdoor !== current.indoorOutdoor) {
          newLogs.unshift({
            id: uid('cdl'),
            timestamp: nowIso(),
            trigger: `Venue Setting Changed to ${updates.indoorOutdoor.toUpperCase()}`,
            reasoning: 'Change in venue physical constraints impacts weather risk & logistics.',
            actionTaken: `Updated venue planning setting to ${updates.indoorOutdoor}.`,
            impactLevel: 'medium',
          });
        }

        return {
          ...current,
          totalBudget: newBudget,
          guestCount: newGuests,
          season: (updates.season as EventProject['season']) || current.season,
          indoorOutdoor: updates.indoorOutdoor || current.indoorOutdoor,
          title: updates.title ? sanitizeUserInput(updates.title, 100) : current.title,
          location: updates.location ? sanitizeUserInput(updates.location, 100) : current.location,
          budgetCategories: updatedCategories,
          decisionLogs: newLogs,
        };
      });
    },
    [updateActiveProject],
  );

  // 4. Toggle category lock
  const toggleCategoryLock = useCallback(
    (categoryId: string) => {
      updateActiveProject((current) => {
        let toggledName = '';
        let wasLocked = false;

        const updatedCategories = current.budgetCategories.map((cat) => {
          if (cat.id === categoryId) {
            toggledName = cat.name;
            wasLocked = cat.isLocked;
            return { ...cat, isLocked: !cat.isLocked };
          }
          return cat;
        });

        const log: ContextDecisionLog = {
          id: uid('cdl'),
          timestamp: nowIso(),
          trigger: `Category Lock: ${toggledName}`,
          reasoning: wasLocked
            ? `Category "${toggledName}" unlocked; AI context engine will now adjust it during dynamic rebalancing.`
            : `Category "${toggledName}" locked; AI context engine will preserve this fixed allocation.`,
          actionTaken: wasLocked ? `Unlocked "${toggledName}"` : `Locked "${toggledName}"`,
          impactLevel: 'low',
        };

        return {
          ...current,
          budgetCategories: updatedCategories,
          decisionLogs: [log, ...current.decisionLogs],
        };
      });
    },
    [updateActiveProject],
  );

  // 5. Update category spend
  const updateCategorySpend = useCallback(
    (categoryId: string, allocated: number, spent: number) => {
      updateActiveProject((current) => {
        const updatedCategories = current.budgetCategories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              allocatedAmount: Math.max(0, allocated),
              spentAmount: Math.max(0, spent),
            };
          }
          return cat;
        });

        return {
          ...current,
          budgetCategories: updatedCategories,
        };
      });
    },
    [updateActiveProject],
  );

  // 6. Add budget category
  const addBudgetCategory = useCallback(
    (name: string, allocated: number, priority: 'high' | 'medium' | 'low') => {
      const sanitizedName = sanitizeUserInput(name, 50);
      if (!sanitizedName) return;

      const newCategory: BudgetCategory = {
        id: uid('cat'),
        name: sanitizedName,
        allocatedAmount: Math.max(0, allocated),
        spentAmount: 0,
        priority,
        isLocked: false,
        notes: 'Added by planner',
      };

      updateActiveProject((current) => {
        const log: ContextDecisionLog = {
          id: uid('cdl'),
          timestamp: nowIso(),
          trigger: `Added Budget Category: ${sanitizedName}`,
          reasoning: `Planner added custom line-item with ${current.currency} ${allocated.toLocaleString()} allocation.`,
          actionTaken: `Inserted category "${sanitizedName}" with ${priority.toUpperCase()} priority.`,
          impactLevel: 'low',
        };

        return {
          ...current,
          budgetCategories: [...current.budgetCategories, newCategory],
          decisionLogs: [log, ...current.decisionLogs],
        };
      });
    },
    [updateActiveProject],
  );

  // 7. Update timeline item status
  const updateTimelineStatus = useCallback(
    (itemId: string, status: TimelineItem['status']) => {
      updateActiveProject((current) => {
        let itemTitle = '';
        let isCritical = false;

        const updatedTimeline = current.timelineItems.map((item) => {
          if (item.id === itemId) {
            itemTitle = item.title;
            isCritical = item.isCriticalPath;
            return { ...item, status };
          }
          return item;
        });

        const newLogs = [...current.decisionLogs];
        if (isCritical && (status === 'at-risk' || status === 'completed')) {
          newLogs.unshift({
            id: uid('cdl'),
            timestamp: nowIso(),
            trigger: `Critical Milestone Update: "${itemTitle}"`,
            reasoning:
              status === 'at-risk'
                ? `Critical path item "${itemTitle}" flagged at-risk. Contingency buffers should be activated.`
                : `Critical path item "${itemTitle}" successfully completed. Downstream schedule unlocked.`,
            actionTaken: `Milestone status changed to ${status.toUpperCase()}.`,
            impactLevel: status === 'at-risk' ? 'high' : 'medium',
          });
        }

        return {
          ...current,
          timelineItems: updatedTimeline,
          decisionLogs: newLogs,
        };
      });
    },
    [updateActiveProject],
  );

  // 8. Add timeline item
  const addTimelineItem = useCallback(
    (item: Omit<TimelineItem, 'id'>) => {
      const newItem: TimelineItem = {
        ...item,
        id: uid('tl'),
        title: sanitizeUserInput(item.title, 80),
        timeframe: sanitizeUserInput(item.timeframe, 50),
        timeSlot: item.timeSlot ? sanitizeUserInput(item.timeSlot, 30) : undefined,
        category: sanitizeUserInput(item.category, 40),
        dependencyNote: item.dependencyNote ? sanitizeUserInput(item.dependencyNote, 120) : undefined,
        assignee: item.assignee ? sanitizeUserInput(item.assignee, 50) : undefined,
      };

      updateActiveProject((current) => ({
        ...current,
        timelineItems: [...current.timelineItems, newItem],
      }));
    },
    [updateActiveProject],
  );

  // 9. Toggle vendor checklist item
  const toggleVendorChecklistItem = useCallback(
    (vendorId: string, checkId: string) => {
      updateActiveProject((current) => {
        const updatedVendors = current.vendors.map((vendor) => {
          if (vendor.id === vendorId) {
            return {
              ...vendor,
              vettingChecklist: vendor.vettingChecklist.map((c) =>
                c.id === checkId ? { ...c, checked: !c.checked } : c,
              ),
            };
          }
          return vendor;
        });

        return {
          ...current,
          vendors: updatedVendors,
        };
      });
    },
    [updateActiveProject],
  );

  // 10. Update vendor status
  const updateVendorStatus = useCallback(
    (vendorId: string, status: VendorChecklistItem['status'], actualCost?: number) => {
      updateActiveProject((current) => {
        let vendorName = '';

        const updatedVendors = current.vendors.map((vendor) => {
          if (vendor.id === vendorId) {
            vendorName = vendor.vendorName;
            return {
              ...vendor,
              status,
              actualCost: actualCost !== undefined ? Math.max(0, actualCost) : vendor.actualCost,
            };
          }
          return vendor;
        });

        const newLogs = [...current.decisionLogs];
        if (status === 'booked' || status === 'paid') {
          newLogs.unshift({
            id: uid('cdl'),
            timestamp: nowIso(),
            trigger: `Vendor Milestones: ${vendorName}`,
            reasoning: `Procurement stage updated to ${status.toUpperCase()} for ${vendorName}.`,
            actionTaken: `Vendor committed to event registry.`,
            impactLevel: 'medium',
          });
        }

        return {
          ...current,
          vendors: updatedVendors,
          decisionLogs: newLogs,
        };
      });
    },
    [updateActiveProject],
  );

  // 11. Add vendor
  const addVendor = useCallback(
    (vendor: Omit<VendorChecklistItem, 'id'>) => {
      const newVendor: VendorChecklistItem = {
        ...vendor,
        id: uid('vendor'),
        category: sanitizeUserInput(vendor.category, 50),
        vendorName: sanitizeUserInput(vendor.vendorName, 80),
        contactEmail: sanitizeUserInput(vendor.contactEmail, 80),
        notes: sanitizeUserInput(vendor.notes, 200),
        estimatedCost: Math.max(0, vendor.estimatedCost),
        actualCost: Math.max(0, vendor.actualCost),
      };

      updateActiveProject((current) => ({
        ...current,
        vendors: [...current.vendors, newVendor],
      }));
    },
    [updateActiveProject],
  );

  // 12. Apply personalized idea to plan
  const applyIdeaToPlan = useCallback(
    (ideaId: string) => {
      updateActiveProject((current) => {
        const targetIdea = current.savedIdeas.find((i) => i.id === ideaId);
        if (!targetIdea || targetIdea.appliedToPlan) return current;

        // Mark idea as applied
        const updatedIdeas = current.savedIdeas.map((i) =>
          i.id === ideaId ? { ...i, appliedToPlan: true } : i,
        );

        // Inject actionable milestone in timeline
        const injectedMilestone: TimelineItem = {
          id: uid('tl'),
          title: `Activate: ${targetIdea.title}`,
          phase: 'countdown',
          timeframe: '2 weeks before event',
          category: targetIdea.category.toUpperCase(),
          status: 'in-progress',
          isCriticalPath: false,
          assignee: 'Experience Coordinator',
          dependencyNote: targetIdea.description,
        };

        const decisionLog: ContextDecisionLog = {
          id: uid('cdl'),
          timestamp: nowIso(),
          trigger: `Idea Applied: "${targetIdea.title}"`,
          reasoning: `Contextual recommendation in ${targetIdea.category} adopted. ${targetIdea.bestForContext}`,
          actionTaken: `Injected milestone into countdown roadmap with estimated impact ${targetIdea.estimatedCostImpact}.`,
          impactLevel: 'medium',
        };

        return {
          ...current,
          savedIdeas: updatedIdeas,
          timelineItems: [injectedMilestone, ...current.timelineItems],
          decisionLogs: [decisionLog, ...current.decisionLogs],
        };
      });
    },
    [updateActiveProject],
  );

  // 13. Trigger contingency scenario
  const triggerContingencyScenario = useCallback(
    (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
      const contingency = generateContingencyPlan(activeProject, scenario);

      updateActiveProject((current) => {
        let updatedProject = { ...current };

        // Real-time mutations based on scenario type
        if (scenario === 'weather') {
          updatedProject.indoorOutdoor = 'indoor';
        } else if (scenario === 'budget-cut') {
          const cutBudget = Math.round(current.totalBudget * 0.85);
          const rebalance = rebalanceBudgetForContext(current, cutBudget, current.guestCount);
          updatedProject.totalBudget = cutBudget;
          updatedProject.budgetCategories = rebalance.updatedCategories;
        } else if (scenario === 'guest-surge') {
          const surgeGuests = Math.round(current.guestCount * 1.25);
          const rebalance = rebalanceBudgetForContext(current, current.totalBudget, surgeGuests);
          updatedProject.guestCount = surgeGuests;
          updatedProject.budgetCategories = rebalance.updatedCategories;
        } else if (scenario === 'vendor-drop') {
          // Flag the first booked or negotiating vendor as at-risk/shortlisted
          updatedProject.vendors = current.vendors.map((v, idx) =>
            idx === 0
              ? {
                  ...v,
                  status: 'shortlisted',
                  notes: `[Contingency Alert]: Primary vendor dropped. Activating backup shortlist. ${v.notes}`,
                }
              : v,
          );
        }

        // Add actionable timeline mitigation task
        const mitigationTask: TimelineItem = {
          id: uid('tl-contingency'),
          title: `Contingency Execution: ${scenario.toUpperCase()}`,
          phase: 'countdown',
          timeframe: 'Immediate (Within 48h)',
          category: 'Contingency',
          status: 'at-risk',
          isCriticalPath: true,
          assignee: 'Lead Operations Director',
          dependencyNote: contingency.adjustments[0] || 'Execute contingency playbook.',
        };

        return {
          ...updatedProject,
          timelineItems: [mitigationTask, ...updatedProject.timelineItems],
          decisionLogs: [contingency.decisionLog, ...updatedProject.decisionLogs],
        };
      });

      return {
        adjustments: contingency.adjustments,
        notes: contingency.updatedTimelineNotes,
        log: contingency.decisionLog,
      };
    },
    [activeProject, updateActiveProject],
  );

  // 14. Reset demo data cleanly
  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_PROJECTS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    } catch {
      // ignore
    }
    setProjects(allPersonas);
    setActiveProjectId(allPersonas[0].id);
  }, []);

  return {
    projects,
    activeProjectId,
    activeProject,
    readinessMetrics,
    selectVerticalProject,
    createNewProject,
    updateProjectContext,
    toggleCategoryLock,
    updateCategorySpend,
    addBudgetCategory,
    updateTimelineStatus,
    addTimelineItem,
    toggleVendorChecklistItem,
    updateVendorStatus,
    addVendor,
    applyIdeaToPlan,
    triggerContingencyScenario,
    resetDemoData,
  };
}
