import React from 'react';
import { Coins, Calendar, ShieldCheck } from 'lucide-react';
import type { ReadinessScore } from '../../services/contextEngine';

interface ReadinessHealthGaugesProps {
  readinessMetrics: ReadinessScore;
}

export const ReadinessHealthGauges: React.FC<ReadinessHealthGaugesProps> = ({
  readinessMetrics,
}) => {
  return (
    <section aria-label="Readiness Pillars" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Budget Health */}
      <div className="rounded-2xl bg-vesta-card border border-vesta-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-vesta-text flex items-center gap-2">
            <Coins className="w-4 h-4 text-vesta-gold" />
            Budget Health
          </span>
          <span className="text-sm font-mono font-bold text-vesta-gold">
            {readinessMetrics.budgetHealth}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-vesta-surface overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vesta-gold to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${readinessMetrics.budgetHealth}%` }}
          />
        </div>
        <p className="text-[11px] text-vesta-muted">
          {readinessMetrics.budgetHealth >= 80
            ? 'Allocations align with industry benchmarks. Buffers healthy.'
            : 'Overspend detected or critical categories unlocked.'}
        </p>
      </div>

      {/* Timeline Health */}
      <div className="rounded-2xl bg-vesta-card border border-vesta-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-vesta-text flex items-center gap-2">
            <Calendar className="w-4 h-4 text-vesta-iris" />
            Timeline Health
          </span>
          <span className="text-sm font-mono font-bold text-vesta-iris">
            {readinessMetrics.timelineHealth}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-vesta-surface overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vesta-iris to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${readinessMetrics.timelineHealth}%` }}
          />
        </div>
        <p className="text-[11px] text-vesta-muted">
          {readinessMetrics.timelineHealth >= 70
            ? 'Milestones on schedule. Critical path buffer intact.'
            : 'Action needed on pending or at-risk critical tasks.'}
        </p>
      </div>

      {/* Vendor Readiness */}
      <div className="rounded-2xl bg-vesta-card border border-vesta-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-vesta-text flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vesta-foam" />
            Vendor Readiness
          </span>
          <span className="text-sm font-mono font-bold text-vesta-foam">
            {readinessMetrics.vendorReadiness}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-vesta-surface overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vesta-foam to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${readinessMetrics.vendorReadiness}%` }}
          />
        </div>
        <p className="text-[11px] text-vesta-muted">
          {readinessMetrics.vendorReadiness >= 75
            ? 'Key contracts negotiated and vetting checklists completed.'
            : 'Complete vetting checklists and advance shortlisted vendors.'}
        </p>
      </div>
    </section>
  );
};
