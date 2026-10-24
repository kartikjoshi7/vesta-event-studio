/**
 * @fileoverview Dual-Horizon Timeline & Run-of-Show Engine for Vesta Event Studio.
 * Composed coordinator (< 90L) orchestrating:
 * 1. TimelineHorizonBar (Countdown roadmap vs Run-of-show tabs, critical path filter, summary metrics)
 * 2. AddMilestoneDrawer (Drawer to schedule new milestones or minute-by-minute slots)
 * 3. MilestoneCard (Individual milestone status, category, assignee & dependencies)
 */

import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import type { EventProject, TimelineItem } from '../types/event';
import { TimelineHorizonBar } from './timeline/TimelineHorizonBar';
import { AddMilestoneDrawer } from './timeline/AddMilestoneDrawer';
import { MilestoneCard } from './timeline/MilestoneCard';

interface TimelineEngineProps {
  project: EventProject;
  onUpdateStatus: (itemId: string, status: TimelineItem['status']) => void;
  onAddTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
}

export const TimelineEngine: React.FC<TimelineEngineProps> = ({
  project,
  onUpdateStatus,
  onAddTimelineItem,
}) => {
  const [activePhase, setActivePhase] = useState<'countdown' | 'run-of-show'>('countdown');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Filtered timeline items
  const filteredItems = project.timelineItems.filter((item) => {
    if (item.phase !== activePhase) return false;
    if (criticalOnly && !item.isCriticalPath) return false;
    return true;
  });

  // Summary counts for current phase
  const phaseTotal = project.timelineItems.filter((i) => i.phase === activePhase).length;
  const completedCount = project.timelineItems.filter(
    (i) => i.phase === activePhase && i.status === 'completed',
  ).length;
  const inProgressCount = project.timelineItems.filter(
    (i) => i.phase === activePhase && i.status === 'in-progress',
  ).length;
  const atRiskCount = project.timelineItems.filter(
    (i) => i.phase === activePhase && i.status === 'at-risk',
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Horizon Toggle Bar */}
      <TimelineHorizonBar
        activePhase={activePhase}
        setActivePhase={setActivePhase}
        criticalOnly={criticalOnly}
        setCriticalOnly={setCriticalOnly}
        isAddFormOpen={isAddFormOpen}
        setIsAddFormOpen={setIsAddFormOpen}
        phaseTotal={phaseTotal}
        completedCount={completedCount}
        inProgressCount={inProgressCount}
        atRiskCount={atRiskCount}
      />

      {/* 2. Add Milestone / Slot Drawer */}
      {isAddFormOpen && (
        <AddMilestoneDrawer
          activePhase={activePhase}
          onClose={() => setIsAddFormOpen(false)}
          onAddTimelineItem={onAddTimelineItem}
        />
      )}

      {/* 3. Milestone Items List */}
      <section aria-label="Timeline Milestone List" className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-vesta-card border border-vesta-border text-center text-xs text-vesta-muted space-y-2">
            <Filter className="w-6 h-6 mx-auto text-vesta-muted/60" />
            <p>No milestones match the selected filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <MilestoneCard
              key={item.id}
              item={item}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </section>
    </div>
  );
};
