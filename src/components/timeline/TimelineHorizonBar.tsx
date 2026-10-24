import React from 'react';
import { Calendar, Clock, Flame, Plus } from 'lucide-react';

interface TimelineHorizonBarProps {
  activePhase: 'countdown' | 'run-of-show';
  setActivePhase: (phase: 'countdown' | 'run-of-show') => void;
  criticalOnly: boolean;
  setCriticalOnly: (critical: boolean) => void;
  isAddFormOpen: boolean;
  setIsAddFormOpen: (open: boolean) => void;
  phaseTotal: number;
  completedCount: number;
  inProgressCount: number;
  atRiskCount: number;
}

export const TimelineHorizonBar: React.FC<TimelineHorizonBarProps> = ({
  activePhase,
  setActivePhase,
  criticalOnly,
  setCriticalOnly,
  isAddFormOpen,
  setIsAddFormOpen,
  phaseTotal,
  completedCount,
  inProgressCount,
  atRiskCount,
}) => {
  return (
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
  );
};
