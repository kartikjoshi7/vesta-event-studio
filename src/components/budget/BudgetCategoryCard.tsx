/**
 * @fileoverview Individual Budget Category Row Card for Budget Architect.
 */

import React, { useState } from 'react';
import { Lock, Unlock, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import type { BudgetCategory } from '../../types/event';

interface BudgetCategoryCardProps {
  category: BudgetCategory;
  currency: string;
  onToggleLock: (id: string) => void;
  onUpdateCategorySpend: (id: string, allocated: number, spent: number) => void;
}

export const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({
  category,
  currency,
  onToggleLock,
  onUpdateCategorySpend,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editAllocated, setEditAllocated] = useState(category.allocatedAmount.toString());
  const [editSpent, setEditSpent] = useState(category.spentAmount.toString());

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

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditAllocated(category.allocatedAmount.toString());
    setEditSpent(category.spentAmount.toString());
  };

  const handleSave = () => {
    const allocated = Number(editAllocated);
    const spent = Number(editSpent);
    if (!Number.isNaN(allocated) && !Number.isNaN(spent)) {
      onUpdateCategorySpend(category.id, allocated, spent);
      setIsEditing(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-vesta-surface/70 border border-vesta-border hover:border-vesta-iris/40 transition-all space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
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
            {category.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-vesta-text">{category.name}</span>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${priorityBadge}`}>
                {category.priority}
              </span>
              {isOverBudget && (
                <span className="text-[10px] font-semibold text-vesta-danger bg-vesta-danger/10 px-1.5 py-0.5 rounded border border-vesta-danger/20 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Over Budget!
                </span>
              )}
            </div>
            {category.notes && <p className="text-[11px] text-vesta-muted mt-0.5">{category.notes}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] text-vesta-muted uppercase block">Allocated</span>
                <input
                  type="number"
                  aria-label="Edit allocated amount"
                  value={editAllocated}
                  onChange={(e) => setEditAllocated(e.target.value)}
                  className="w-24 px-2 py-0.5 rounded bg-vesta-card border border-vesta-iris text-xs text-vesta-text font-mono"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-vesta-muted uppercase block">Spent</span>
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
                onClick={handleSave}
                className="p-1.5 rounded-lg bg-vesta-success text-vesta-midnight hover:opacity-90 mt-3"
                title="Save Changes"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
                  {currency} {category.allocatedAmount.toLocaleString()}
                </div>
                <div className="text-[10px] text-vesta-muted font-mono">
                  Spent: {currency} {category.spentAmount.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartEdit}
                className="p-1.5 rounded-lg text-vesta-muted hover:text-vesta-iris hover:bg-vesta-card transition-colors"
                title="Edit Allocation / Spend"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-vesta-card overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-vesta-danger' : spentPercent > 80 ? 'bg-vesta-warning' : 'bg-vesta-iris'
            }`}
            style={{ width: `${Math.min(100, spentPercent)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-vesta-muted">
          <span>{spentPercent}% spent</span>
          <span>
            Remaining: {currency} {(category.allocatedAmount - category.spentAmount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
