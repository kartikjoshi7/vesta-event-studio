/**
 * @fileoverview Executive Overview & Context Decision Dashboard for Vesta Event Studio.
 *
 * Displays event executive summary, 3 core KPI health gauges, critical path alerts,
 * AI next best actions, interactive What-If contingency simulator, and live audit feed.
 */

import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Coins,
  Sparkles,
  CloudRain,
  TrendingDown,
  UserPlus,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  History,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { EventProject } from '../types/event';
import { personaMetadata } from '../data/verticalPersonas';
import type { ReadinessScore } from '../services/contextEngine';

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
  // Inline quick editing state
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [budgetInput, setBudgetInput] = useState(project.totalBudget.toString());
  const [guestsInput, setGuestsInput] = useState(project.guestCount.toString());

  // Contingency simulation outcome state
  const [simulationResult, setSimulationResult] = useState<{
    scenarioName: string;
    adjustments: string[];
    notes: string[];
  } | null>(null);

  const meta = personaMetadata[project.vertical] || {
    emoji: '✨',
    tagline: project.vertical,
  };

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

  const perGuestCost = Math.round(project.totalBudget / Math.max(1, project.guestCount));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── Hero Event Identity Card ─────────────────────────────────── */}
      <section
        aria-label="Event Executive Summary"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-vesta-card/90 via-vesta-surface/90 to-vesta-card/90 border border-vesta-border/70 p-6 sm:p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-vesta-iris/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-vesta-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top Row: Vertical Badge & Persona Tag + Setting/Season */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl p-2 rounded-xl bg-vesta-card/80 border border-vesta-border/80 shadow-sm">{meta.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-vesta-gold/15 text-vesta-gold border border-vesta-gold/30 tracking-wide uppercase">
                    {project.vertical} blueprint
                  </span>
                  <span className="text-xs text-vesta-muted">Hosted by <strong className="text-vesta-text font-medium">{project.personaName}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-vesta-surface/80 border border-vesta-border/80 text-vesta-foam font-medium capitalize flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-vesta-foam" />
                {project.indoorOutdoor} setting
              </span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-vesta-surface/80 border border-vesta-border/80 text-vesta-iris font-medium capitalize flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-vesta-iris" />
                {project.season} season
              </span>
            </div>
          </div>

          {/* Title & Location */}
          <div className="pt-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-vesta-text">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-xs text-vesta-muted mt-2.5">
              <span className="flex items-center gap-1.5 font-medium text-vesta-text/90">
                <Calendar className="w-4 h-4 text-vesta-gold" />
                {new Date(project.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-vesta-text/90">
                <MapPin className="w-4 h-4 text-vesta-rose" />
                {project.location}
              </span>
            </div>
          </div>

          {/* Vibe Tags & Dietary Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-vesta-border/50">
            <span className="text-[10px] font-semibold text-vesta-muted uppercase tracking-wider mr-1">
              Vibes:
            </span>
            {project.vibeTags.map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-vesta-surface/80 text-vesta-text/80 border border-vesta-border/70"
              >
                #{tag}
              </span>
            ))}
            {project.dietaryRestrictions.length > 0 && (
              <>
                <span className="text-[10px] font-semibold text-vesta-muted uppercase tracking-wider ml-2 mr-1">
                  Dietary:
                </span>
                {project.dietaryRestrictions.map((diet, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-vesta-pine/20 text-vesta-foam border border-vesta-pine/40"
                  >
                    {diet}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3 Key Financial & Scale Stat Cards ───────────────────────── */}
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

      {/* ─── 3 KPI Health Gauges ────────────────────────────────────────── */}
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

      {/* ─── Critical Alerts & AI Next Best Actions ─────────────────────── */}
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

      {/* ─── Interactive What-If Contingency Simulator ──────────────────── */}
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

      {/* ─── Live Context Decision Audit Log ────────────────────────────── */}
      <section
        aria-label="Decision Audit Log"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-vesta-gold" />
            <h2 className="text-sm font-bold text-vesta-text">
              Context Decision Audit Feed
            </h2>
          </div>
          <span className="text-xs font-mono text-vesta-muted">
            {project.decisionLogs.length} Logged Entries
          </span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {project.decisionLogs.map((log) => {
            const impactBadge =
              log.impactLevel === 'high'
                ? 'bg-vesta-danger/15 text-vesta-danger border-vesta-danger/30'
                : log.impactLevel === 'medium'
                ? 'bg-vesta-warning/15 text-vesta-warning border-vesta-warning/30'
                : 'bg-vesta-foam/15 text-vesta-foam border-vesta-foam/30';

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-vesta-surface/80 border border-vesta-border text-xs space-y-1.5 hover:border-vesta-iris/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-vesta-text">{log.trigger}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${impactBadge}`}
                    >
                      {log.impactLevel}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-vesta-muted">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-vesta-muted text-[11px] leading-relaxed">{log.reasoning}</p>

                <div className="text-[11px] font-medium text-vesta-foam flex items-center gap-1.5 pt-0.5">
                  <span className="text-vesta-muted">Action:</span>
                  <span>{log.actionTaken}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
