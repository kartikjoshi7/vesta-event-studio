/**
 * @fileoverview Vendor Pipeline Metrics KPI Cards for Vendor CRM.
 */

import React from 'react';
import type { VendorChecklistItem } from '../../types/event';

interface VendorPipelineMetricsProps {
  vendors: VendorChecklistItem[];
}

export const VendorPipelineMetrics: React.FC<VendorPipelineMetricsProps> = ({ vendors }) => {
  const totalCount = vendors.length;
  const shortlistedCount = vendors.filter((v) => v.status === 'shortlisted').length;
  const negotiatingCount = vendors.filter((v) => v.status === 'negotiating').length;
  const bookedCount = vendors.filter((v) => v.status === 'booked').length;
  const paidCount = vendors.filter((v) => v.status === 'paid').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="p-4 rounded-2xl bg-vesta-card border border-vesta-border">
        <span className="text-[11px] font-medium text-vesta-muted block">Total Partners</span>
        <span className="text-xl font-bold font-mono text-vesta-text mt-1 block">
          {totalCount}
        </span>
        <span className="text-[10px] text-vesta-muted mt-0.5 block">Procurement Active</span>
      </div>

      <div className="p-4 rounded-2xl bg-vesta-card border border-vesta-border">
        <span className="text-[11px] font-medium text-vesta-muted block">Shortlisted</span>
        <span className="text-xl font-bold font-mono text-vesta-gold mt-1 block">
          {shortlistedCount}
        </span>
        <span className="text-[10px] text-vesta-muted mt-0.5 block">Reviewing Portfolios</span>
      </div>

      <div className="p-4 rounded-2xl bg-vesta-card border border-vesta-border">
        <span className="text-[11px] font-medium text-vesta-muted block">Negotiating</span>
        <span className="text-xl font-bold font-mono text-vesta-warning mt-1 block">
          {negotiatingCount}
        </span>
        <span className="text-[10px] text-vesta-muted mt-0.5 block">Drafting terms</span>
      </div>

      <div className="p-4 rounded-2xl bg-vesta-card border border-vesta-border">
        <span className="text-[11px] font-medium text-vesta-muted block">Booked</span>
        <span className="text-xl font-bold font-mono text-vesta-iris mt-1 block">
          {bookedCount}
        </span>
        <span className="text-[10px] text-vesta-muted mt-0.5 block">Contract locked</span>
      </div>

      <div className="p-4 rounded-2xl bg-vesta-card border border-vesta-border col-span-2 sm:col-span-1">
        <span className="text-[11px] font-medium text-vesta-muted block">Paid</span>
        <span className="text-xl font-bold font-mono text-vesta-success mt-1 block">
          {paidCount}
        </span>
        <span className="text-[10px] text-vesta-muted mt-0.5 block">Fulfilled & ready</span>
      </div>
    </div>
  );
};
