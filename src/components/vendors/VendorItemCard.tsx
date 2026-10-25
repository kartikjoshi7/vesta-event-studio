/**
 * @fileoverview Individual Vendor Card for Vendor CRM.
 */

import React from 'react';
import { Sparkles, Mail, ShieldCheck, Calendar } from 'lucide-react';
import type { VendorChecklistItem } from '../../types/event';

interface VendorItemCardProps {
  vendor: VendorChecklistItem;
  currency: string;
  onToggleChecklistItem: (vendorId: string, checkId: string) => void;
  onUpdateVendorStatus: (
    vendorId: string,
    status: VendorChecklistItem['status'],
    actualCost?: number,
  ) => void;
  onOpenNegotiation: (vendor: VendorChecklistItem, goal?: 'discount' | 'scope-check' | 'contract-followup') => void;
}

export const VendorItemCard: React.FC<VendorItemCardProps> = ({
  vendor,
  currency,
  onToggleChecklistItem,
  onUpdateVendorStatus,
  onOpenNegotiation,
}) => {
  const checkedCount = vendor.vettingChecklist.filter((c) => c.checked).length;
  const vettingPct = Math.round((checkedCount / Math.max(1, vendor.vettingChecklist.length)) * 100);

  const statusColors = {
    shortlisted: 'bg-vesta-gold/15 text-vesta-gold border-vesta-gold/30',
    negotiating: 'bg-vesta-warning/15 text-vesta-warning border-vesta-warning/30',
    booked: 'bg-vesta-iris/15 text-vesta-iris border-vesta-iris/30',
    paid: 'bg-vesta-success/15 text-vesta-success border-vesta-success/30',
  };

  return (
    <div className="p-5 rounded-3xl bg-vesta-card border border-vesta-border hover:border-vesta-iris/40 transition-all space-y-4 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-vesta-text">{vendor.vendorName}</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-vesta-surface text-vesta-muted border border-vesta-border">
              {vendor.category}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-vesta-muted">
            <Mail className="w-3.5 h-3.5 text-vesta-muted" />
            <span>{vendor.contactEmail}</span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor={`status-${vendor.id}`} className="sr-only">
            Vendor Status
          </label>
          <select
            id={`status-${vendor.id}`}
            value={vendor.status}
            onChange={(e) =>
              onUpdateVendorStatus(
                vendor.id,
                e.target.value as VendorChecklistItem['status'],
              )
            }
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border focus:outline-none focus:ring-2 focus:ring-vesta-iris transition-all ${
              statusColors[vendor.status]
            }`}
          >
            <option value="shortlisted">Shortlisted</option>
            <option value="negotiating">Negotiating</option>
            <option value="booked">Booked</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Financials & Payment Milestones */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-vesta-surface/80 border border-vesta-border/60">
        <div>
          <span className="text-[10px] text-vesta-muted block">Estimated Quote</span>
          <span className="font-mono text-xs font-bold text-vesta-text">
            {currency} {vendor.estimatedCost.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-vesta-muted block">Committed Actual</span>
          <span className="font-mono text-xs font-bold text-vesta-rose">
            {currency} {(vendor.actualCost ?? vendor.estimatedCost).toLocaleString()}
          </span>
        </div>

        {vendor.paymentDueDate && (
          <div className="col-span-2 text-right border-t border-vesta-border/40 pt-2 flex items-center justify-between">
            <span className="text-[10px] text-vesta-muted flex items-center gap-1">
              <Calendar className="w-3 h-3 text-vesta-rose" />
              Payment Due
            </span>
            <span className="font-mono text-xs text-vesta-text">{vendor.paymentDueDate}</span>
          </div>
        )}
      </div>

      {/* Vetting Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-vesta-text flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-vesta-foam" />
            Due Diligence Vetting
          </span>
          <span className="font-mono text-vesta-muted">
            {checkedCount}/{vendor.vettingChecklist.length} ({vettingPct}%)
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-vesta-surface overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vesta-foam to-vesta-pine rounded-full transition-all duration-300"
            style={{ width: `${vettingPct}%` }}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {vendor.vettingChecklist.map((check) => (
            <label
              key={check.id}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-vesta-surface/60 cursor-pointer text-[11px] text-vesta-text/90 transition-colors"
            >
              <input
                type="checkbox"
                checked={check.checked}
                onChange={() => onToggleChecklistItem(vendor.id, check.id)}
                className="rounded border-vesta-border bg-vesta-surface text-vesta-foam focus:ring-vesta-foam"
              />
              <span className={check.checked ? 'line-through text-vesta-muted' : ''}>
                {check.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bottom Actions: AI Negotiation Draft Button */}
      <div className="pt-3 border-t border-vesta-border/60 flex items-center justify-between">
        <span className="text-[11px] text-vesta-muted truncate max-w-[200px]">
          {vendor.notes || 'No notes added'}
        </span>

        <button
          onClick={() => onOpenNegotiation(vendor, 'discount')}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-vesta-iris/15 text-vesta-iris border border-vesta-iris/30 hover:bg-vesta-iris/25 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Negotiation Script</span>
        </button>
      </div>
    </div>
  );
};
