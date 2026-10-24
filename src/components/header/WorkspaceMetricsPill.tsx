/**
 * @fileoverview Workspace Readiness & Metrics Pill for Vesta Event Studio.
 */

import React from 'react';
import type { ReadinessScore } from '../../services/contextEngine';

interface WorkspaceMetricsPillProps {
  readinessMetrics: ReadinessScore;
}

export const WorkspaceMetricsPill: React.FC<WorkspaceMetricsPillProps> = ({
  readinessMetrics,
}) => {
  const score = readinessMetrics.overallScore;
  const scoreColor =
    score >= 80
      ? 'text-vesta-success border-vesta-success/30 bg-vesta-success/10'
      : score >= 60
      ? 'text-vesta-warning border-vesta-warning/30 bg-vesta-warning/10'
      : 'text-vesta-danger border-vesta-danger/30 bg-vesta-danger/10';

  return (
    <div
      role="status"
      aria-label={`Event Readiness Score: ${score} percent`}
      title={`Readiness: ${score}/100 - Budget ${readinessMetrics.budgetHealth}%, Timeline ${readinessMetrics.timelineHealth}%, Vendors ${readinessMetrics.vendorReadiness}%`}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur transition-all shadow-sm ${scoreColor}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            score >= 80
              ? 'bg-vesta-success'
              : score >= 60
              ? 'bg-vesta-warning'
              : 'bg-vesta-danger'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            score >= 80
              ? 'bg-vesta-success'
              : score >= 60
              ? 'bg-vesta-warning'
              : 'bg-vesta-danger'
          }`}
        />
      </span>
      <span className="font-mono text-xs">{score}%</span>
      <span className="hidden md:inline text-[10px] font-medium pl-1 border-l border-current/25">
        Ready
      </span>
    </div>
  );
};
