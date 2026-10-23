/**
 * @fileoverview Dynamic Budget Architect & AI Rebalancer for Vesta Event Studio.
 *
 * Provides real-time financial tracking, per-guest unit economics, category-level
 * lock protections against automated rebalancing, overspend diagnostics, and a
 * 1-click contextual AI optimizer.
 */

import React, { useState } from 'react';
import {
  Coins,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  Plus,
  Users,
  PieChart,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import type { EventProject, BudgetCategory } from '../types/event';
import { sanitizeUserInput, validateNumberInput } from '../utils/security';

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
  // Rebalancer state
  const [priorityFocus, setPriorityFocus] = useState<string>('Balanced');

  // Inline editing row state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editAllocated, setEditAllocated] = useState<string>('');
  const [editSpent, setEditSpent] = useState<string>('');

  // Add Category form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAllocated, setNewCatAllocated] = useState('50000');
  const [newCatPriority, setNewCatPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Financial aggregates
  const totalAllocated = project.budgetCategories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const totalSpent = project.budgetCategories.reduce((sum, c) => sum + c.spentAmount, 0);
  const remainingBuffer = project.totalBudget - totalSpent;
  const allocationDelta = project.totalBudget - totalAllocated;
  const perGuestCost = Math.round(project.totalBudget / Math.max(1, project.guestCount));
  const spentPct = Math.min(100, Math.round((totalSpent / Math.max(1, project.totalBudget)) * 100));

  const handleStartEdit = (cat: BudgetCategory) => {
    setEditingCatId(cat.id);
    setEditAllocated(cat.allocatedAmount.toString());
    setEditSpent(cat.spentAmount.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const allocated = Number(editAllocated);
    const spent = Number(editSpent);
    if (!Number.isNaN(allocated) && !Number.isNaN(spent)) {
      onUpdateCategorySpend(catId, allocated, spent);
      setEditingCatId(null);
    }
  };

  const handleRunRebalance = () => {
    onUpdateContext({
      priorityFocus: priorityFocus === 'Balanced' ? undefined : priorityFocus,
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeUserInput(newCatName, 50);
    const allocated = validateNumberInput(newCatAllocated, 0, 100_000_000, 10_000);
    if (cleanName) {
      onAddCategory(cleanName, allocated, newCatPriority);
      setNewCatName('');
      setNewCatAllocated('50000');
      setIsAddFormOpen(false);
    }
  };

  const priorityFocusOptions = [
    { label: 'Balanced Optimization', value: 'Balanced' },
    { label: 'Culinary & Catering Focus', value: 'catering' },
    { label: 'Guest Experience & Decor', value: 'venue' },
    { label: 'Strict Cost Saving', value: 'cost-reduction' },
    { label: 'Media & Production Focus', value: 'photography' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── Financial Summary Bar ──────────────────────────────────────── */}
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
          {/* Total Budget */}
          <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border">
            <span className="text-[11px] font-medium text-vesta-muted block">Total Budget</span>
            <span className="text-base sm:text-lg font-bold font-mono text-vesta-text mt-1 block">
              {project.currency} {project.totalBudget.toLocaleString()}
            </span>
            <span className="text-[10px] text-vesta-muted mt-0.5 block">Target Cap</span>
          </div>

          {/* Total Allocated */}
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

          {/* Actual Spent */}
          <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border">
            <span className="text-[11px] font-medium text-vesta-muted block">Actual Spend</span>
            <span className="text-base sm:text-lg font-bold font-mono text-vesta-rose mt-1 block">
              {project.currency} {totalSpent.toLocaleString()}
            </span>
            <span className="text-[10px] text-vesta-muted mt-0.5 block">{spentPct}% of budget</span>
          </div>

          {/* Remaining Buffer */}
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

          {/* Cost Per Head */}
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

      {/* ─── 1-Click AI Context Rebalancer Bar ──────────────────────────── */}
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
              onChange={(e) => setPriorityFocus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              {priorityFocusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunRebalance}
              type="button"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-foam text-vesta-midnight hover:opacity-95 transition-all shadow-md shadow-vesta-iris/20 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize Allocations</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Category Table & Cards ─────────────────────────────────────── */}
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

        {/* Add Category Drawer */}
        {isAddFormOpen && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 rounded-2xl bg-vesta-surface border border-vesta-iris/40 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-vesta-text">
                Add Custom Budget Line Item
              </span>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="text-vesta-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="new-cat-name" className="block text-[11px] font-medium text-vesta-muted mb-1">
                  Category Name
                </label>
                <input
                  id="new-cat-name"
                  type="text"
                  required
                  placeholder="e.g. Drone Light Show"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
                />
              </div>

              <div>
                <label htmlFor="new-cat-amount" className="block text-[11px] font-medium text-vesta-muted mb-1">
                  Allocated Amount (₹)
                </label>
                <input
                  id="new-cat-amount"
                  type="number"
                  min="0"
                  step="5000"
                  required
                  value={newCatAllocated}
                  onChange={(e) => setNewCatAllocated(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text font-mono focus:outline-none focus:ring-2 focus:ring-vesta-iris"
                />
              </div>

              <div>
                <label htmlFor="new-cat-priority" className="block text-[11px] font-medium text-vesta-muted mb-1">
                  Priority
                </label>
                <select
                  id="new-cat-priority"
                  aria-label="New category priority"
                  value={newCatPriority}
                  onChange={(e) =>
                    setNewCatPriority(e.target.value as 'high' | 'medium' | 'low')
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-3 py-1 text-xs text-vesta-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-vesta-gold text-vesta-midnight hover:opacity-90"
              >
                Add Category
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid / Rows */}
        <div className="space-y-3">
          {project.budgetCategories.map((category) => {
            const isEditing = editingCatId === category.id;
            const spentPercent = Math.min(
              150,
              Math.round((category.spentAmount / Math.max(1, category.allocatedAmount)) * 100),
            );
            const isOverBudget = category.spentAmount > category.allocatedAmount;

            const priorityBadge =
              category.priority === 'high'
                ? 'bg-vesta-danger/10 text-vesta-danger border-vesta-danger/25'
                : category.priority === 'medium'
                ? 'bg-vesta-warning/10 text-vesta-warning border-vesta-warning/25'
                : 'bg-vesta-foam/10 text-vesta-foam border-vesta-foam/25';

            return (
              <div
                key={category.id}
                className="p-4 rounded-2xl bg-vesta-surface/70 border border-vesta-border hover:border-vesta-iris/40 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Lock Button */}
                    <button
                      type="button"
                      onClick={() => onToggleLock(category.id)}
                      title={
                        category.isLocked
                          ? 'Locked: Protected from AI rebalancing. Click to unlock.'
                          : 'Unlocked: Context engine can adjust this allocation. Click to lock.'
                      }
                      aria-label={`${category.name} is ${category.isLocked ? 'locked' : 'unlocked'}. Toggle lock.`}
                      className={`p-1.5 rounded-lg border transition-all ${
                        category.isLocked
                          ? 'bg-vesta-gold/15 text-vesta-gold border-vesta-gold/40'
                          : 'bg-vesta-card text-vesta-muted border-vesta-border hover:text-white'
                      }`}
                    >
                      {category.isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-vesta-text">
                          {category.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${priorityBadge}`}
                        >
                          {category.priority}
                        </span>
                        {isOverBudget && (
                          <span className="text-[10px] font-semibold text-vesta-danger bg-vesta-danger/10 px-1.5 py-0.5 rounded border border-vesta-danger/20 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Over Budget!
                          </span>
                        )}
                      </div>
                      {category.notes && (
                        <p className="text-[11px] text-vesta-muted mt-0.5">{category.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Amounts & Inline Edit */}
                  <div className="flex items-center gap-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-vesta-muted uppercase block">
                            Allocated
                          </span>
                          <input
                            type="number"
                            aria-label="Edit allocated amount"
                            value={editAllocated}
                            onChange={(e) => setEditAllocated(e.target.value)}
                            className="w-24 px-2 py-0.5 rounded bg-vesta-card border border-vesta-iris text-xs text-vesta-text font-mono"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-vesta-muted uppercase block">
                            Spent
                          </span>
                          <input
                            type="number"
                            aria-label="Edit spent amount"
                            value={editSpent}
                            onChange={(e) => setEditSpent(e.target.value)}
                            className="w-24 px-2 py-0.5 rounded bg-vesta-card border border-vesta-iris text-xs text-vesta-text font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(category.id)}
                          className="p-1.5 rounded-lg bg-vesta-success text-vesta-midnight hover:opacity-90 mt-3"
                          title="Save Changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="p-1.5 rounded-lg text-vesta-muted hover:text-white mt-3"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-vesta-text">
                            {project.currency} {category.allocatedAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-vesta-muted font-mono">
                            Spent: {project.currency} {category.spentAmount.toLocaleString()}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(category)}
                          className="p-1.5 rounded-lg text-vesta-muted hover:text-vesta-iris hover:bg-vesta-card transition-colors"
                          title="Edit Allocation / Spend"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-vesta-card overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverBudget
                          ? 'bg-vesta-danger'
                          : spentPercent > 80
                          ? 'bg-vesta-warning'
                          : 'bg-vesta-iris'
                      }`}
                      style={{ width: `${Math.min(100, spentPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-vesta-muted">
                    <span>{spentPercent}% spent</span>
                    <span>
                      Remaining: {project.currency}{' '}
                      {(category.allocatedAmount - category.spentAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
