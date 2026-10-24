/**
 * @fileoverview Financial Summary Metrics Bar for Budget Architect.
 */

import React from 'react';
import { Coins, Users } from 'lucide-react';
import type { EventProject } from '../../types/event';

interface BudgetSummaryBarProps {
  project: EventProject;
}

export const BudgetSummaryBar: React.FC<BudgetSummaryBarProps> = ({ project }) => {
  const totalAllocated = project.budgetCategories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const totalSpent = project.budgetCategories.reduce((sum, c) => sum + c.spentAmount, 0);
  const remainingBuffer = project.totalBudget - totalSpent;
  const allocationDelta = project.totalBudget - totalAllocated;
  const perGuestCost = Math.round(project.totalBudget / Math.max(1, project.guestCount));
  const spentPct = Math.min(100, Math.round((totalSpent / Math.max(1, project.totalBudget)) * 100));

  return (
    <section
      aria-label="Financial Summary"
      className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-vesta-text flex items-center gap-2">
            <Coins className="w-5 h-5 text-vesta-gold" />
            Dynamic Budget Architect & AI Rebalancer
          </h1>
          <p className="text-xs text-vesta-muted mt-0.5">
            Deterministic, context-aware allocation engine with per-head unit economics and lock protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-vesta-iris/15 text-vesta-iris border border-vesta-iris/30 font-medium">
            Currency: {project.currency}
          </span>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border">
          <span className="text-[11px] font-medium text-vesta-muted block">Total Budget</span>
          <span className="text-base sm:text-lg font-bold font-mono text-vesta-text mt-1 block">
            {project.currency} {project.totalBudget.toLocaleString()}
          </span>
          <span className="text-[10px] text-vesta-muted mt-0.5 block">Target Cap</span>
        </div>

        <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border">
          <span className="text-[11px] font-medium text-vesta-muted block">Total Allocated</span>
          <span
            className={`text-base sm:text-lg font-bold font-mono mt-1 block ${
              totalAllocated > project.totalBudget ? 'text-vesta-danger' : 'text-vesta-gold'
            }`}
          >
            {project.currency} {totalAllocated.toLocaleString()}
          </span>
          <span className="text-[10px] text-vesta-muted mt-0.5 block">
            {allocationDelta >= 0
              ? `${project.currency} ${allocationDelta.toLocaleString()} unallocated`
              : 'Over-allocated!'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border">
          <span className="text-[11px] font-medium text-vesta-muted block">Actual Spend</span>
          <span className="text-base sm:text-lg font-bold font-mono text-vesta-rose mt-1 block">
            {project.currency} {totalSpent.toLocaleString()}
          </span>
          <span className="text-[10px] text-vesta-muted mt-0.5 block">{spentPct}% of budget</span>
        </div>

        <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border">
          <span className="text-[11px] font-medium text-vesta-muted block">Available Buffer</span>
          <span
            className={`text-base sm:text-lg font-bold font-mono mt-1 block ${
              remainingBuffer >= 0 ? 'text-vesta-success' : 'text-vesta-danger'
            }`}
          >
            {project.currency} {remainingBuffer.toLocaleString()}
          </span>
          <span className="text-[10px] text-vesta-muted mt-0.5 block">Cash in reserve</span>
        </div>

        <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-vesta-muted block flex items-center gap-1">
            <Users className="w-3 h-3 text-vesta-foam" />
            Per-Guest Cost
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-vesta-foam mt-1 block">
            {project.currency} {perGuestCost.toLocaleString()}
          </span>
          <span className="text-[10px] text-vesta-muted mt-0.5 block">
            Based on {project.guestCount} guests
          </span>
        </div>
      </div>

      {/* Global Spend vs Budget Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-vesta-muted">
          <span>Spend Velocity ({spentPct}%)</span>
          <span>
            {project.currency} {totalSpent.toLocaleString()} / {project.currency}{' '}
            {project.totalBudget.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-vesta-surface overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPct > 90
                ? 'bg-vesta-danger'
                : spentPct > 70
                ? 'bg-vesta-warning'
                : 'bg-gradient-to-r from-vesta-iris to-vesta-foam'
            }`}
            style={{ width: `${Math.min(100, spentPct)}%` }}
          />
        </div>
      </div>
    </section>
  );
};
