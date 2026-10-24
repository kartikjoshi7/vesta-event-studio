import React, { useState } from 'react';
import { Coins, Users, Sparkles } from 'lucide-react';
import type { EventProject } from '../../types/event';

interface FinancialTelemetryCardsProps {
  project: EventProject;
  onUpdateContext: (updates: {
    totalBudget?: number;
    guestCount?: number;
  }) => void;
}

export const FinancialTelemetryCards: React.FC<FinancialTelemetryCardsProps> = ({
  project,
  onUpdateContext,
}) => {
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [budgetInput, setBudgetInput] = useState(project.totalBudget.toString());
  const [guestsInput, setGuestsInput] = useState(project.guestCount.toString());

  const handleSaveMetrics = () => {
    const numBudget = Number(budgetInput);
    const numGuests = Number(guestsInput);
    if (!Number.isNaN(numBudget) && !Number.isNaN(numGuests)) {
      onUpdateContext({
        totalBudget: numBudget,
        guestCount: numGuests,
      });
      setIsEditingMetrics(false);
    }
  };

  const perGuestCost = Math.round(project.totalBudget / Math.max(1, project.guestCount));

  return (
    <section aria-label="Core Metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: Total Budget */}
      <div className="rounded-2xl bg-vesta-card/90 border border-vesta-border/80 p-5 shadow-lg backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-vesta-muted">
            <div className="p-1.5 rounded-lg bg-vesta-gold/15 text-vesta-gold">
              <Coins className="w-4 h-4" />
            </div>
            <span>Total Budget</span>
          </div>
          {isEditingMetrics ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsEditingMetrics(false)}
                className="text-[11px] text-vesta-muted hover:text-white px-1.5 py-0.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMetrics}
                className="text-[11px] font-semibold text-vesta-midnight bg-vesta-success px-2 py-0.5 rounded-md hover:opacity-90"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setBudgetInput(project.totalBudget.toString());
                setGuestsInput(project.guestCount.toString());
                setIsEditingMetrics(true);
              }}
              className="text-[11px] font-medium text-vesta-iris hover:text-white px-2 py-0.5 rounded-md bg-vesta-surface border border-vesta-border/80 hover:border-vesta-iris transition-colors"
            >
              Quick Edit
            </button>
          )}
        </div>

        {isEditingMetrics ? (
          <input
            type="number"
            aria-label="Total event budget"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-vesta-surface border border-vesta-iris text-sm text-vesta-text font-mono focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          />
        ) : (
          <div className="text-2xl font-extrabold font-mono text-vesta-text tracking-tight">
            {project.currency} {project.totalBudget.toLocaleString()}
          </div>
        )}

        <div className="text-[11px] text-vesta-muted flex items-center justify-between pt-1 border-t border-vesta-border/40">
          <span>Allocated: 100%</span>
          <span className="text-vesta-success font-medium">Healthy Buffer</span>
        </div>
      </div>

      {/* Card 2: Guest Scale */}
      <div className="rounded-2xl bg-vesta-card/90 border border-vesta-border/80 p-5 shadow-lg backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-vesta-muted">
            <div className="p-1.5 rounded-lg bg-vesta-iris/15 text-vesta-iris">
              <Users className="w-4 h-4" />
            </div>
            <span>Guest Scale</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-vesta-surface text-vesta-iris border border-vesta-iris/30 font-medium">
            Confirmed RSVPs
          </span>
        </div>

        {isEditingMetrics ? (
          <input
            type="number"
            aria-label="Total guest count"
            value={guestsInput}
            onChange={(e) => setGuestsInput(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-vesta-surface border border-vesta-iris text-sm text-vesta-text font-mono focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          />
        ) : (
          <div className="text-2xl font-extrabold font-mono text-vesta-text tracking-tight">
            {project.guestCount} <span className="text-sm font-sans font-medium text-vesta-muted">Attendees</span>
          </div>
        )}

        <div className="text-[11px] text-vesta-muted flex items-center justify-between pt-1 border-t border-vesta-border/40">
          <span>Capacity Target</span>
          <span className="text-vesta-iris font-medium">Managed Seating</span>
        </div>
      </div>

      {/* Card 3: Per-Head Investment */}
      <div className="rounded-2xl bg-vesta-card/90 border border-vesta-border/80 p-5 shadow-lg backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-vesta-muted">
            <div className="p-1.5 rounded-lg bg-vesta-foam/15 text-vesta-foam">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Cost Per Head</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-vesta-surface text-vesta-foam border border-vesta-foam/30 font-medium">
            All-Inclusive
          </span>
        </div>

        <div className="text-2xl font-extrabold font-mono text-vesta-foam tracking-tight">
          {project.currency} {perGuestCost.toLocaleString()} <span className="text-sm font-sans font-medium text-vesta-muted">/ person</span>
        </div>

        <div className="text-[11px] text-vesta-muted flex items-center justify-between pt-1 border-t border-vesta-border/40">
          <span>Catering, Decor & Venue</span>
          <span className="text-vesta-foam font-medium">Optimal Tier</span>
        </div>
      </div>
    </section>
  );
};
