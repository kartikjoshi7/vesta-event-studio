/**
 * @fileoverview Executive Overview & Context Decision Dashboard for Vesta Event Studio.
 * Composed coordinator (< 80L) orchestrating:
 * 1. ExecutiveIdentityHero (Hero identity & constraints overview)
 * 2. FinancialTelemetryCards (Total budget with quick edit, guest count, cost/head)
 * 3. ReadinessHealthGauges (3 KPI health gauges: Budget, Timeline, Vendor)
 * 4. CriticalAlertsAndActions (Critical path bottlenecks & AI next steps)
 * 5. ContingencySimulatorCard (Stress-testing scenarios & adjustments)
 * 6. DecisionAuditFeed (Context decision audit log trail)
 */

import React from 'react';
import type { EventProject } from '../types/event';
import type { ReadinessScore } from '../services/contextEngine';
import { ExecutiveIdentityHero } from './overview/ExecutiveIdentityHero';
import { FinancialTelemetryCards } from './overview/FinancialTelemetryCards';
import { ReadinessHealthGauges } from './overview/ReadinessHealthGauges';
import { CriticalAlertsAndActions } from './overview/CriticalAlertsAndActions';
import { ContingencySimulatorCard } from './overview/ContingencySimulatorCard';
import { DecisionAuditFeed } from './overview/DecisionAuditFeed';

interface OverviewDashboardProps {
  project: EventProject;
  readinessMetrics: ReadinessScore;
  onUpdateContext: (updates: {
    totalBudget?: number;
    guestCount?: number;
    season?: string;
    indoorOutdoor?: 'indoor' | 'outdoor' | 'hybrid';
    priorityFocus?: string;
  }) => void;
  onTriggerContingency: (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
    adjustments: string[];
    notes: string[];
  };
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  project,
  readinessMetrics,
  onUpdateContext,
  onTriggerContingency,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Hero Event Identity Card */}
      <ExecutiveIdentityHero project={project} />

      {/* 2. Key Financial & Scale Stat Cards */}
      <FinancialTelemetryCards
        project={project}
        onUpdateContext={onUpdateContext}
      />

      {/* 3. Three KPI Health Gauges */}
      <ReadinessHealthGauges readinessMetrics={readinessMetrics} />

      {/* 4. Critical Alerts & AI Next Best Actions */}
      <CriticalAlertsAndActions readinessMetrics={readinessMetrics} />

      {/* 5. Interactive What-If Contingency Simulator */}
      <ContingencySimulatorCard onTriggerContingency={onTriggerContingency} />

      {/* 6. Live Context Decision Audit Log */}
      <DecisionAuditFeed decisionLogs={project.decisionLogs} />
    </div>
  );
};
