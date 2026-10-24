/**
 * @fileoverview Dynamic Budget Architect & AI Rebalancer for Vesta Event Studio (Modular Coordinator).
 */

import React, { useState } from 'react';
import { Plus, PieChart } from 'lucide-react';
import type { EventProject } from '../types/event';
import { BudgetSummaryBar } from './budget/BudgetSummaryBar';
import { RebalanceControlBar } from './budget/RebalanceControlBar';
import { BudgetCategoryCard } from './budget/BudgetCategoryCard';
import { AddCategoryDrawer } from './budget/AddCategoryDrawer';

interface BudgetArchitectProps {
  project: EventProject;
  onToggleLock: (categoryId: string) => void;
  onUpdateCategorySpend: (categoryId: string, allocated: number, spent: number) => void;
  onAddCategory: (name: string, allocated: number, priority: 'high' | 'medium' | 'low') => void;
  onUpdateContext: (updates: {
    totalBudget?: number;
    guestCount?: number;
    priorityFocus?: string;
  }) => void;
}

export const BudgetArchitect: React.FC<BudgetArchitectProps> = ({
  project,
  onToggleLock,
  onUpdateCategorySpend,
  onAddCategory,
  onUpdateContext,
}) => {
  const [priorityFocus, setPriorityFocus] = useState<string>('Balanced');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const handleRunRebalance = () => {
    onUpdateContext({
      priorityFocus: priorityFocus === 'Balanced' ? undefined : priorityFocus,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Financial Summary KPI Cards & Visual Velocity Bar */}
      <BudgetSummaryBar project={project} />

      {/* 1-Click AI Context Rebalancer Controls */}
      <RebalanceControlBar
        priorityFocus={priorityFocus}
        onPriorityChange={setPriorityFocus}
        onRunRebalance={handleRunRebalance}
      />

      {/* Line-Item Category Matrix */}
      <section
        aria-label="Budget Line Items"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 space-y-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-vesta-gold" />
            <h2 className="text-sm font-bold text-vesta-text">
              Line-Item Allocation & Lock Matrix
            </h2>
            <span className="text-xs font-mono text-vesta-muted">
              ({project.budgetCategories.length} Categories)
            </span>
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-vesta-surface hover:bg-vesta-border border border-vesta-border text-vesta-text transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-vesta-gold" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Add Category Form Drawer */}
        <AddCategoryDrawer
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onAddCategory={onAddCategory}
        />

        {/* Categories Grid */}
        <div className="space-y-3">
          {project.budgetCategories.map((category) => (
            <BudgetCategoryCard
              key={category.id}
              category={category}
              currency={project.currency}
              onToggleLock={onToggleLock}
              onUpdateCategorySpend={onUpdateCategorySpend}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
