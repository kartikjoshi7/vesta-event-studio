/**
 * @fileoverview Add Category Form Drawer for Budget Architect.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { sanitizeUserInput, validateNumberInput } from '../../utils/security';

interface AddCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, allocated: number, priority: 'high' | 'medium' | 'low') => void;
}

export const AddCategoryDrawer: React.FC<AddCategoryDrawerProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatAllocated, setNewCatAllocated] = useState('50000');
  const [newCatPriority, setNewCatPriority] = useState<'high' | 'medium' | 'low'>('medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeUserInput(newCatName, 50);
    const allocated = validateNumberInput(newCatAllocated, 0, 100_000_000, 10_000);
    if (cleanName) {
      onAddCategory(cleanName, allocated, newCatPriority);
      setNewCatName('');
      setNewCatAllocated('50000');
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-2xl bg-vesta-surface border border-vesta-iris/40 space-y-3 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-vesta-text">Add Custom Budget Line Item</span>
        <button type="button" onClick={onClose} className="text-vesta-muted hover:text-white">
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
            onChange={(e) => setNewCatPriority(e.target.value as 'high' | 'medium' | 'low')}
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
          onClick={onClose}
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
  );
};
