// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { useTimelineDomain } from './useTimelineDomain';
import { allPersonas } from '../data/verticalPersonas';
import type { EventProject } from '../types/event';

describe('useTimelineDomain Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const useTestTimelineHarness = () => {
    const [project, setProject] = useState<EventProject>({ ...allPersonas[0] });
    const timelineDomain = useTimelineDomain(setProject);
    return { project, ...timelineDomain };
  };

  it('updates milestone status to completed and records decision', () => {
    const { result } = renderHook(() => useTestTimelineHarness());
    const targetItem = result.current.project.timelineItems[0];

    act(() => {
      result.current.updateTimelineStatus(targetItem.id, 'completed');
    });

    const updated = result.current.project.timelineItems.find((i) => i.id === targetItem.id);
    expect(updated?.status).toBe('completed');
    expect(result.current.project.decisionLogs[0].trigger).toContain(targetItem.title);
  });

  it('handles transitioning milestone to at-risk', () => {
    const { result } = renderHook(() => useTestTimelineHarness());
    const targetItem = result.current.project.timelineItems[1];

    act(() => {
      result.current.updateTimelineStatus(targetItem.id, 'at-risk');
    });

    const updated = result.current.project.timelineItems.find((i) => i.id === targetItem.id);
    expect(updated?.status).toBe('at-risk');
  });

  it('adds a new milestone item to countdown roadmap', () => {
    const { result } = renderHook(() => useTestTimelineHarness());
    const initialCount = result.current.project.timelineItems.length;

    act(() => {
      result.current.addTimelineItem({
        title: 'Final Floral Mockup Signoff',
        phase: 'countdown',
        timeframe: '1 month before',
        category: 'Decor',
        status: 'pending',
        isCriticalPath: true,
        assignee: 'Floral Designer',
      });
    });

    expect(result.current.project.timelineItems.length).toBe(initialCount + 1);
    const added = result.current.project.timelineItems.find(
      (i) => i.title === 'Final Floral Mockup Signoff',
    );
    expect(added).toBeDefined();
    expect(added?.isCriticalPath).toBe(true);
  });

  it('applies a personalized idea to the plan and creates timeline task', () => {
    const { result } = renderHook(() => useTestTimelineHarness());
    const targetIdea = result.current.project.savedIdeas[0];

    act(() => {
      result.current.applyIdeaToPlan(targetIdea.id);
    });

    const updatedIdea = result.current.project.savedIdeas.find((i) => i.id === targetIdea.id);
    expect(updatedIdea?.appliedToPlan).toBe(true);

    const generatedTask = result.current.project.timelineItems.find((i) =>
      i.title.includes(targetIdea.title),
    );
    expect(generatedTask).toBeDefined();
  });
});
