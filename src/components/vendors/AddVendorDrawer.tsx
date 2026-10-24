/**
 * @fileoverview Add Vendor Drawer Form for Vendor CRM.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { VendorChecklistItem } from '../../types/event';
import { sanitizeUserInput, validateNumberInput } from '../../utils/security';

interface AddVendorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddVendor: (vendor: Omit<VendorChecklistItem, 'id'>) => void;
}

export const AddVendorDrawer: React.FC<AddVendorDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  onAddVendor,
}) => {
  const [newVendorName, setNewVendorName] = useState('');
  const [newCategory, setNewCategory] = useState('Catering');
  const [newEmail, setNewEmail] = useState('');
  const [newEstimatedCost, setNewEstimatedCost] = useState('100000');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeUserInput(newVendorName, 80);
    const cleanEmail = sanitizeUserInput(newEmail, 80);
    const cost = validateNumberInput(newEstimatedCost, 0, 100_000_000, 50_000);

    if (cleanName) {
      onAddVendor({
        vendorName: cleanName,
        category: newCategory,
        contactEmail: cleanEmail || 'partner@eventpro.com',
        status: 'shortlisted',
        estimatedCost: cost,
        actualCost: 0,
        notes: sanitizeUserInput(newNotes, 200),
        vettingChecklist: [
          { id: 'vc-1', label: 'License & Health Permit Verified', checked: false },
          { id: 'vc-2', label: 'Commercial Liability Insurance (₹20L+)', checked: false },
          { id: 'vc-3', label: 'Client Reference Checked', checked: false },
        ],
      });

      setNewVendorName('');
      setNewEmail('');
      setNewNotes('');
      onClose();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 rounded-2xl bg-vesta-surface border border-vesta-iris/40 space-y-4 animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-vesta-text">Register New Vendor Partner</span>
        <button type="button" onClick={onClose} className="text-vesta-muted hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label htmlFor="new-vendor-name" className="block text-[11px] font-medium text-vesta-muted mb-1">
            Vendor Name
          </label>
          <input
            id="new-vendor-name"
            type="text"
            required
            placeholder="e.g. Royal Caterers Co."
            value={newVendorName}
            onChange={(e) => setNewVendorName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          />
        </div>

        <div>
          <label htmlFor="new-vendor-cat" className="block text-[11px] font-medium text-vesta-muted mb-1">
            Category
          </label>
          <select
            id="new-vendor-cat"
            aria-label="New vendor category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Production">Production & Audio</option>
            <option value="Decor">Floral & Decor</option>
            <option value="Hospitality">Hospitality & Ushers</option>
          </select>
        </div>

        <div>
          <label htmlFor="new-vendor-email" className="block text-[11px] font-medium text-vesta-muted mb-1">
            Contact Email
          </label>
          <input
            id="new-vendor-email"
            type="email"
            placeholder="billing@partner.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          />
        </div>

        <div>
          <label htmlFor="new-vendor-cost" className="block text-[11px] font-medium text-vesta-muted mb-1">
            Quoted Estimate (₹)
          </label>
          <input
            id="new-vendor-cost"
            type="number"
            min="0"
            step="10000"
            required
            value={newEstimatedCost}
            onChange={(e) => setNewEstimatedCost(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text font-mono focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 text-xs text-vesta-muted hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-vesta-foam text-vesta-midnight hover:opacity-90"
        >
          Register Vendor
        </button>
      </div>
    </form>
  );
};
