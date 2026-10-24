/**
 * @fileoverview Timeline Domain Hook for Vesta Event Studio.
 *
 * Manages macro milestones, minute-by-minute day-of cues, status updates,
 * and automatic conversion of creative ideas into actionable schedule tasks.
 */

import { useCallback } from 'react';
import type { EventProject, TimelineItem, ContextDecisionLog } from '../types/event';
import { sanitizeUserInput } from '../utils/security';

function uid(prefix: string = 'tl'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface UseTimelineDomainReturn {
  updateTimelineStatus: (itemId: string, status: TimelineItem['status']) => void;
  addTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
  applyIdeaToPlan: (ideaId: string) => void;
}

export function useTimelineDomain(
  updateActiveProject: (updater: (prev: EventProject) => EventProject) => void,
): UseTimelineDomainReturn {
  // Update status of a timeline milestone or cue
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

  // Add a new timeline milestone to the active project
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

  // Apply a personalized creative idea into the actionable timeline
  const applyIdeaToPlan = useCallback(
    (ideaId: string) => {
      updateActiveProject((current) => {
        const targetIdea = current.savedIdeas.find((i) => i.id === ideaId);
        if (!targetIdea || targetIdea.appliedToPlan) return current;

        const updatedIdeas = current.savedIdeas.map((i) =>
          i.id === ideaId ? { ...i, appliedToPlan: true } : i,
        );

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

  return {
    updateTimelineStatus,
    addTimelineItem,
    applyIdeaToPlan,
  };
}
