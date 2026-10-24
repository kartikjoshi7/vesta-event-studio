import React, { useState } from 'react';
import { Sparkles, CloudRain, TrendingDown, UserPlus, AlertOctagon, CheckCircle2 } from 'lucide-react';

interface ContingencySimulatorCardProps {
  onTriggerContingency: (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
    adjustments: string[];
    notes: string[];
  };
}

export const ContingencySimulatorCard: React.FC<ContingencySimulatorCardProps> = ({
  onTriggerContingency,
}) => {
  const [simulationResult, setSimulationResult] = useState<{
    scenarioName: string;
    adjustments: string[];
    notes: string[];
  } | null>(null);

  const handleSimulate = (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => {
    const scenarioNames = {
      weather: 'Sudden Weather Shift (Rain & Wind)',
      'budget-cut': '15% Emergency Budget Cut',
      'guest-surge': '+25% Last-Minute Guest Surge',
      'vendor-drop': 'Key Vendor Cancellation',
    };

    const res = onTriggerContingency(scenario);
    setSimulationResult({
      scenarioName: scenarioNames[scenario],
      adjustments: res.adjustments,
      notes: res.notes,
    });
  };

  return (
    <section
      aria-label="Contingency Simulator"
      className="rounded-3xl bg-vesta-card border border-vesta-border p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-vesta-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-vesta-gold" />
            Interactive "What-If" Contingency Simulator
          </h2>
          <p className="text-xs text-vesta-muted mt-0.5">
            Stress-test your celebration blueprint against unexpected disruptions. The context
            engine dynamically calculates adjustments.
          </p>
        </div>
      </div>

      {/* 4 One-Click Scenario Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => handleSimulate('weather')}
          type="button"
          className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-foam/50 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-vesta-foam"
        >
          <div className="w-9 h-9 rounded-xl bg-vesta-foam/15 text-vesta-foam flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <CloudRain className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-vesta-text group-hover:text-vesta-foam transition-colors">
            Sudden Weather Shift
          </div>
          <p className="text-[11px] text-vesta-muted mt-1">
            Rain/heat contingency: shifts to indoor setting & activates waterproof AV.
          </p>
        </button>

        <button
          onClick={() => handleSimulate('budget-cut')}
          type="button"
          className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-warning/50 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-vesta-warning"
        >
          <div className="w-9 h-9 rounded-xl bg-vesta-warning/15 text-vesta-warning flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-vesta-text group-hover:text-vesta-warning transition-colors">
            15% Budget Cut
          </div>
          <p className="text-[11px] text-vesta-muted mt-1">
            Protects locked categories and reduces low-priority allocations automatically.
          </p>
        </button>

        <button
          onClick={() => handleSimulate('guest-surge')}
          type="button"
          className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-iris/50 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-vesta-iris"
        >
          <div className="w-9 h-9 rounded-xl bg-vesta-iris/15 text-vesta-iris flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-vesta-text group-hover:text-vesta-iris transition-colors">
            +25% Guest Surge
          </div>
          <p className="text-[11px] text-vesta-muted mt-1">
            Scales catering & seating buffers while preserving fixed production costs.
          </p>
        </button>

        <button
          onClick={() => handleSimulate('vendor-drop')}
          type="button"
          className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-danger/50 text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-vesta-danger"
        >
          <div className="w-9 h-9 rounded-xl bg-vesta-danger/15 text-vesta-danger flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-vesta-text group-hover:text-vesta-danger transition-colors">
            Vendor Cancellation
          </div>
          <p className="text-[11px] text-vesta-muted mt-1">
            Activates emergency backup RFP workflow and critical-path timeline mitigation.
          </p>
        </button>
      </div>

      {/* Simulation Result Drawer */}
      {simulationResult && (
        <div className="p-5 rounded-2xl bg-vesta-surface/90 border border-vesta-iris/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-vesta-success" />
              <span className="text-xs font-bold text-vesta-text">
                Simulation Applied: {simulationResult.scenarioName}
              </span>
            </div>
            <button
              onClick={() => setSimulationResult(null)}
              className="text-[11px] text-vesta-muted hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-vesta-card border border-vesta-border/60">
              <span className="text-[11px] font-semibold text-vesta-gold uppercase tracking-wider block">
                Actionable Adjustments
              </span>
              <ul className="space-y-1 text-vesta-text/90">
                {simulationResult.adjustments.map((adj, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-vesta-gold mt-1">•</span>
                    <span>{adj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-vesta-card border border-vesta-border/60">
              <span className="text-[11px] font-semibold text-vesta-iris uppercase tracking-wider block">
                Timeline Directives
              </span>
              <ul className="space-y-1 text-vesta-text/90">
                {simulationResult.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-vesta-iris mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
