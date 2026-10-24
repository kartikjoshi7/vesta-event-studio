import React, { useState } from 'react';
import { Sparkles, X, Flame } from 'lucide-react';
import type { TimelineItem } from '../../types/event';
import { sanitizeUserInput } from '../../utils/security';

interface AddMilestoneDrawerProps {
  activePhase: 'countdown' | 'run-of-show';
  onClose: () => void;
  onAddTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
}

export const AddMilestoneDrawer: React.FC<AddMilestoneDrawerProps> = ({
  activePhase,
  onClose,
  onAddTimelineItem,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newTimeframe, setNewTimeframe] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newCategory, setNewCategory] = useState('Logistics');
  const [newAssignee, setNewAssignee] = useState('Lead Coordinator');
  const [newDependency, setNewDependency] = useState('');
  const [newIsCritical, setNewIsCritical] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 rounded-2xl bg-vesta-surface border border-vesta-iris/40 space-y-4 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-vesta-text flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-vesta-gold" />
          Add New {activePhase === 'countdown' ? 'Countdown Milestone' : 'Run-of-Show Segment'}
        </h2>
        <button
          type="button"
          onClick={onClose}
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
            onClick={onClose}
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
  );
};
