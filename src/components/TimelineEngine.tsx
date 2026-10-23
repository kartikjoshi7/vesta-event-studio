/**
 * @fileoverview Dual-Horizon Timeline & Run-of-Show Engine for Vesta Event Studio.
 *
 * Supports Macro Countdown Roadmaps (months/weeks prior) and Day-Of Run-of-Show
 * (minute-by-minute execution schedule), critical path filtering, and status transitions.
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Flame,
  Plus,
  Filter,
  Users,
  GitBranch,
  X,
  Sparkles,
} from 'lucide-react';
import type { EventProject, TimelineItem } from '../types/event';
import { sanitizeUserInput } from '../utils/security';

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
  // Horizon sub-navigation: countdown vs run-of-show
  const [activePhase, setActivePhase] = useState<'countdown' | 'run-of-show'>('countdown');
  const [criticalOnly, setCriticalOnly] = useState(false);

  // Add Item Drawer
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newCategory, setNewCategory] = useState('Logistics');
  const [newAssignee, setNewAssignee] = useState('Lead Coordinator');
  const [newDependency, setNewDependency] = useState('');
  const [newIsCritical, setNewIsCritical] = useState(false);

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeUserInput(newTitle, 80);
    if (!cleanTitle) return;

    onAddTimelineItem({
      title: cleanTitle,
      phase: activePhase,
      timeframe: sanitizeUserInput(
        newTimeframe || (activePhase === 'countdown' ? '2 weeks before' : 'Day 1'),
        50,
      ),
      timeSlot:
        activePhase === 'run-of-show'
          ? sanitizeUserInput(newTimeSlot || '10:00 – 11:00 AM', 30)
          : undefined,
      category: sanitizeUserInput(newCategory, 40),
      status: 'pending',
      isCriticalPath: newIsCritical,
      assignee: sanitizeUserInput(newAssignee, 50),
      dependencyNote: newDependency ? sanitizeUserInput(newDependency, 120) : undefined,
    });

    setNewTitle('');
    setNewTimeframe('');
    setNewTimeSlot('');
    setNewDependency('');
    setNewIsCritical(false);
    setIsAddFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── Header & Horizon Toggle ────────────────────────────────────── */}
      <section
        aria-label="Timeline Controls"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-vesta-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-vesta-iris" />
              Dual-Horizon Timeline Engine
            </h1>
            <p className="text-xs text-vesta-muted mt-0.5">
              Seamlessly pivot between multi-month countdown milestones and minute-by-minute day-of execution.
            </p>
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 shadow-md shadow-vesta-iris/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add {activePhase === 'countdown' ? 'Milestone' : 'Time Slot'}</span>
          </button>
        </div>

        {/* Horizon Tabs & Critical Path Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-vesta-border/60">
          {/* Sub-nav Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-vesta-surface border border-vesta-border">
            <button
              onClick={() => setActivePhase('countdown')}
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activePhase === 'countdown'
                  ? 'bg-vesta-card text-vesta-iris shadow-md border border-vesta-iris/30'
                  : 'text-vesta-muted hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Macro Countdown Roadmap</span>
            </button>

            <button
              onClick={() => setActivePhase('run-of-show')}
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activePhase === 'run-of-show'
                  ? 'bg-vesta-card text-vesta-gold shadow-md border border-vesta-gold/30'
                  : 'text-vesta-muted hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day-Of Run-of-Show</span>
            </button>
          </div>

          {/* Critical Path Toggle */}
          <button
            onClick={() => setCriticalOnly(!criticalOnly)}
            type="button"
            aria-pressed={criticalOnly}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              criticalOnly
                ? 'bg-vesta-danger/15 text-vesta-danger border-vesta-danger/40 shadow-sm'
                : 'bg-vesta-surface text-vesta-muted border-vesta-border hover:text-vesta-text'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Critical Path Only</span>
            {criticalOnly && <span className="w-1.5 h-1.5 rounded-full bg-vesta-danger" />}
          </button>
        </div>

        {/* Phase Summary Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-vesta-surface/70 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-muted">Total Phase Tasks</span>
            <div className="text-base font-bold font-mono text-vesta-text mt-0.5">{phaseTotal}</div>
          </div>
          <div className="p-3 rounded-xl bg-vesta-surface/70 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-success">Completed</span>
            <div className="text-base font-bold font-mono text-vesta-success mt-0.5">
              {completedCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-vesta-surface/70 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-warning">In Progress</span>
            <div className="text-base font-bold font-mono text-vesta-warning mt-0.5">
              {inProgressCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-vesta-surface/70 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-danger">At Risk</span>
            <div className="text-base font-bold font-mono text-vesta-danger mt-0.5">
              {atRiskCount}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Add Task Form Drawer ───────────────────────────────────────── */}
      {isAddFormOpen && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl bg-vesta-surface border border-vesta-iris/40 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-vesta-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-vesta-gold" />
              Add New {activePhase === 'countdown' ? 'Countdown Milestone' : 'Run-of-Show Segment'}
            </h2>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="text-vesta-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <label htmlFor="new-milestone-title" className="block text-[11px] font-medium text-vesta-muted mb-1">
                Milestone Title
              </label>
              <input
                id="new-milestone-title"
                type="text"
                required
                placeholder="e.g. Sangeet Stage & Audio Soundcheck"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
              />
            </div>

            <div>
              <label htmlFor="new-milestone-category" className="block text-[11px] font-medium text-vesta-muted mb-1">
                Category
              </label>
              <input
                id="new-milestone-category"
                type="text"
                placeholder="e.g. AV / Production / Ceremony"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
              />
            </div>

            {activePhase === 'countdown' ? (
              <div>
                <label htmlFor="new-milestone-timeframe" className="block text-[11px] font-medium text-vesta-muted mb-1">
                  Timeframe (Relative)
                </label>
                <input
                  id="new-milestone-timeframe"
                  type="text"
                  placeholder="e.g. 4 months before"
                  value={newTimeframe}
                  onChange={(e) => setNewTimeframe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="new-milestone-timeslot" className="block text-[11px] font-medium text-vesta-muted mb-1">
                  Time Slot (Clock Time)
                </label>
                <input
                  id="new-milestone-timeslot"
                  type="text"
                  placeholder="e.g. 18:30 – 19:15"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
                />
              </div>
            )}

            <div>
              <label htmlFor="new-milestone-assignee" className="block text-[11px] font-medium text-vesta-muted mb-1">
                Assignee
              </label>
              <input
                id="new-milestone-assignee"
                type="text"
                placeholder="e.g. Sound Engineer"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
              />
            </div>

            <div>
              <label htmlFor="new-milestone-dependency" className="block text-[11px] font-medium text-vesta-muted mb-1">
                Dependency Note
              </label>
              <input
                id="new-milestone-dependency"
                type="text"
                placeholder="e.g. Requires stage generator test"
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-vesta-text font-medium">
              <input
                type="checkbox"
                checked={newIsCritical}
                onChange={(e) => setNewIsCritical(e.target.checked)}
                className="rounded border-vesta-border bg-vesta-card text-vesta-danger focus:ring-vesta-danger"
              />
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-vesta-danger" />
                Mark as Critical Path Item
              </span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-3 py-1.5 text-xs text-vesta-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-vesta-iris text-white hover:opacity-90"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── Timeline Cards List ────────────────────────────────────────── */}
      <section aria-label="Timeline Milestone List" className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-vesta-card border border-vesta-border text-center text-xs text-vesta-muted space-y-2">
            <Filter className="w-6 h-6 mx-auto text-vesta-muted/60" />
            <p>No milestones match the selected filters.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const statusConfig = {
              completed: {
                label: 'Completed',
                badge: 'bg-vesta-success/15 text-vesta-success border-vesta-success/30',
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
              },
              'in-progress': {
                label: 'In Progress',
                badge: 'bg-vesta-warning/15 text-vesta-warning border-vesta-warning/30',
                icon: <Hourglass className="w-3.5 h-3.5 animate-spin" />,
              },
              pending: {
                label: 'Pending',
                badge: 'bg-vesta-muted/15 text-vesta-muted border-vesta-muted/30',
                icon: <Clock className="w-3.5 h-3.5" />,
              },
              'at-risk': {
                label: 'At Risk',
                badge: 'bg-vesta-danger/15 text-vesta-danger border-vesta-danger/30',
                icon: <AlertTriangle className="w-3.5 h-3.5" />,
              },
            }[item.status];

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-vesta-card border transition-all space-y-2.5 ${
                  item.isCriticalPath
                    ? 'border-vesta-danger/30 shadow-sm shadow-vesta-danger/5'
                    : 'border-vesta-border hover:border-vesta-iris/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Time badge & Title */}
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-vesta-surface border border-vesta-border font-mono text-[11px] font-semibold text-vesta-text shrink-0 mt-0.5">
                      {item.timeSlot || item.timeframe}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-vesta-text">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-vesta-surface text-vesta-muted border border-vesta-border uppercase tracking-wider font-mono">
                          {item.category}
                        </span>
                        {item.isCriticalPath && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-vesta-danger/15 text-vesta-danger border border-vesta-danger/30 font-semibold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Critical Path
                          </span>
                        )}
                      </div>

                      {/* Details row: Assignee & Dependencies */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-vesta-muted mt-1">
                        {item.assignee && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-vesta-iris" />
                            {item.assignee}
                          </span>
                        )}
                        {item.dependencyNote && (
                          <span className="flex items-center gap-1 text-vesta-text/70">
                            <GitBranch className="w-3 h-3 text-vesta-gold" />
                            {item.dependencyNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        onUpdateStatus(item.id, e.target.value as TimelineItem['status'])
                      }
                      aria-label={`Update status for ${item.title}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-vesta-iris ${statusConfig.badge}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="at-risk">At Risk</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
