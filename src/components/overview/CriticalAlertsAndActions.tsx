import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Compass, ArrowRight } from 'lucide-react';
import type { ReadinessScore } from '../../services/contextEngine';

interface CriticalAlertsAndActionsProps {
  readinessMetrics: ReadinessScore;
}

export const CriticalAlertsAndActions: React.FC<CriticalAlertsAndActionsProps> = ({
  readinessMetrics,
}) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Critical Path Alerts */}
      <div className="rounded-2xl bg-vesta-card border border-vesta-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-vesta-text flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-vesta-danger" />
            Critical Path Alerts
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-vesta-danger/10 text-vesta-danger font-medium">
            {readinessMetrics.criticalAlerts.length} Active
          </span>
        </div>

        <div className="space-y-2.5">
          {readinessMetrics.criticalAlerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-vesta-surface/50 border border-vesta-border/50 text-xs text-vesta-muted flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-vesta-success" />
              Zero critical bottlenecks detected! Operational readiness is green.
            </div>
          ) : (
            readinessMetrics.criticalAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-vesta-danger/10 border border-vesta-danger/25 text-xs text-vesta-text flex items-start gap-2.5"
              >
                <AlertOctagon className="w-4 h-4 text-vesta-danger shrink-0 mt-0.5" />
                <span className="leading-relaxed">{alert}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Next Best Actions */}
      <div className="rounded-2xl bg-vesta-card border border-vesta-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-vesta-text flex items-center gap-2">
            <Compass className="w-4 h-4 text-vesta-iris" />
            AI Next Best Actions
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-vesta-iris/10 text-vesta-iris font-medium">
            Context Driven
          </span>
        </div>

        <div className="space-y-2.5">
          {readinessMetrics.nextBestActions.map((action, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-vesta-surface border border-vesta-border/80 text-xs text-vesta-text flex items-start gap-2.5 hover:border-vesta-iris/40 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-vesta-gold shrink-0 mt-0.5" />
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
