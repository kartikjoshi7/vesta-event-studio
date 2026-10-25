/**
 * @fileoverview Rebalance Control Bar for Budget Architect.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface RebalanceControlBarProps {
  priorityFocus: string;
  onPriorityChange: (val: string) => void;
  onRunRebalance: () => void;
}

export const RebalanceControlBar: React.FC<RebalanceControlBarProps> = ({
  priorityFocus,
  onPriorityChange,
  onRunRebalance,
}) => {
  const priorityFocusOptions = [
    { label: 'Balanced Optimization', value: 'balanced' },
    { label: 'Culinary & Catering Focus', value: 'catering' },
    { label: 'Venue & Production Focus', value: 'venue' },
    { label: 'Photography & Media Focus', value: 'photography' },
    { label: 'Entertainment & Music Focus', value: 'entertainment' },
    { label: 'Strict Cost Saving', value: 'cost-reduction' },
  ];

  return (
    <section
      aria-label="AI Rebalance Controls"
      className="rounded-2xl bg-gradient-to-r from-vesta-surface via-vesta-card to-vesta-surface border border-vesta-iris/30 p-5 space-y-4 shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-vesta-text">
              1-Click AI Context Rebalancer
            </h2>
            <p className="text-[11px] text-vesta-muted">
              Locks protect fixed contracts while unlocked categories automatically adapt to
              guest scale and strategic priorities.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="rebalance-focus" className="sr-only">
            Priority Focus
          </label>
          <select
            id="rebalance-focus"
            value={priorityFocus}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
          >
            {priorityFocusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRunRebalance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 shadow-md shadow-vesta-iris/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rebalance Allocations</span>
          </button>
        </div>
      </div>
    </section>
  );
};
