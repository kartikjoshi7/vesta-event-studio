/**
 * @fileoverview Personalized Ideation Studio for Vesta Event Studio.
 *
 * Provides vertical-tailored GenAI inspiration matching active persona constraints
 * (budget tier, guest count, setting, season, dietary restrictions), category filtering,
 * and 1-click timeline & audit log injection.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Plus,
  Coins,
  Compass,
  Zap,
} from 'lucide-react';
import type { EventProject, PersonalizedIdea, IdeaCategory } from '../types/event';
import { sanitizeUserInput } from '../utils/security';
import { generatePersonalizedIdeas } from '../services/aiService';

interface IdeationStudioProps {
  project: EventProject;
  onApplyIdea: (ideaId: string) => void;
  onAddGeneratedIdeas: (ideas: PersonalizedIdea[]) => void;
}

export const IdeationStudio: React.FC<IdeationStudioProps> = ({
  project,
  onApplyIdea,
  onAddGeneratedIdeas,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStatusMessage, setSynthesisStatusMessage] = useState('');

  const quickPrompts = [
    'Zero-Waste Luxury Decor',
    'Interactive Guest Icebreakers',
    'Regional Fusion Tasting Menu',
    'High-Impact Low-Cost Lighting',
    'Sunset Ceremony Transitions',
    'Immersive AV Storytelling',
  ];

  const categories: { label: string; value: string }[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Theme & Concept', value: 'theme' },
    { label: 'Décor & Ambience', value: 'decor' },
    { label: 'Catering & F&B', value: 'catering' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Sustainability', value: 'sustainability' },
    { label: 'Logistics & Tech', value: 'logistics' },
  ];

  const filteredIdeas = project.savedIdeas.filter((idea) => {
    if (selectedCategory !== 'all' && idea.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleSynthesize = async (promptToUse?: string) => {
    const rawPrompt = promptToUse || customPrompt;
    const cleanPrompt = sanitizeUserInput(rawPrompt, 150);

    setIsSynthesizing(true);
    setSynthesisStatusMessage('Synthesizing bespoke event ideas matching project context…');

    try {
      const generated = await generatePersonalizedIdeas(project, cleanPrompt || undefined);
      if (generated && generated.length > 0) {
        onAddGeneratedIdeas(generated);
        setSynthesisStatusMessage(
          `Successfully synthesized ${generated.length} personalized ideas tailored to your event constraints!`,
        );
      } else {
        setSynthesisStatusMessage('Ideas updated based on active project state.');
      }
    } catch {
      setSynthesisStatusMessage('Failed to connect to AI engine. Local fallback utilized.');
    } finally {
      setIsSynthesizing(false);
      setCustomPrompt('');
    }
  };

  const getCategoryBadgeClass = (category: IdeaCategory) => {
    switch (category) {
      case 'theme':
        return 'bg-vesta-iris/15 text-vesta-iris border-vesta-iris/30';
      case 'decor':
        return 'bg-vesta-rose/15 text-vesta-rose border-vesta-rose/30';
      case 'catering':
        return 'bg-vesta-gold/15 text-vesta-gold border-vesta-gold/30';
      case 'entertainment':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'sustainability':
        return 'bg-vesta-success/15 text-vesta-success border-vesta-success/30';
      case 'logistics':
        return 'bg-vesta-foam/15 text-vesta-foam border-vesta-foam/30';
      default:
        return 'bg-vesta-surface text-vesta-muted border-vesta-border';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── Studio Header & Context Constraints Bar ───────────────────── */}
      <section
        aria-label="Ideation Context"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-vesta-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-vesta-gold" />
              Personalized Ideation Studio
            </h1>
            <p className="text-xs text-vesta-muted mt-0.5">
              GenAI synthesis grounded in your physical setting, guest scale, budget ceiling, and dietary preferences.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-vesta-surface border border-vesta-border text-vesta-foam">
              {project.savedIdeas.length} Active Ideas
            </span>
            <span className="px-3 py-1 rounded-full bg-vesta-success/15 border border-vesta-success/30 text-vesta-success">
              {project.savedIdeas.filter((i) => i.appliedToPlan).length} Injected into Plan
            </span>
          </div>
        </div>

        {/* Persona Constraints Strip */}
        <div className="p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold text-vesta-muted uppercase tracking-wider">
              Target Context:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-vesta-card border border-vesta-border text-vesta-text font-medium">
              👥 {project.guestCount} Guests
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-vesta-card border border-vesta-border text-vesta-gold font-medium">
              💰 {project.currency} {project.totalBudget.toLocaleString()}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-vesta-card border border-vesta-border text-vesta-iris capitalize font-medium">
              📍 {project.indoorOutdoor} · {project.season}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {project.vibeTags.map((vibe, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-vesta-card border border-vesta-border text-vesta-muted"
              >
                #{vibe}
              </span>
            ))}
          </div>
        </div>

        {/* Synthesis Prompt Input & Quick Pills */}
        <div className="space-y-3 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSynthesize();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <label htmlFor="custom-idea-prompt" className="sr-only">
                Custom ideation prompt
              </label>
              <input
                id="custom-idea-prompt"
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask for bespoke concept ideas (e.g. 'Royal Rajasthani welcome with sustainable flower petals')"
                className="w-full px-4 py-2.5 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:outline-none focus:ring-2 focus:ring-vesta-iris"
              />
            </div>

            <button
              type="submit"
              disabled={isSynthesizing}
              aria-label="Synthesize ideas with AI"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-gold via-vesta-iris to-vesta-foam text-vesta-midnight hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-vesta-gold/15"
            >
              {isSynthesizing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-vesta-midnight" />
                  <span>Synthesizing Ideas…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-vesta-midnight text-vesta-midnight" />
                  <span>Synthesize Personalized Ideas</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-vesta-muted flex items-center gap-1 mr-1">
              <Lightbulb className="w-3.5 h-3.5 text-vesta-gold" />
              Quick Inspiration:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCustomPrompt(prompt);
                  handleSynthesize(prompt);
                }}
                disabled={isSynthesizing}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-vesta-surface hover:bg-vesta-card border border-vesta-border text-vesta-muted hover:text-vesta-text transition-all focus:outline-none focus:ring-1 focus:ring-vesta-iris"
              >
                + {prompt}
              </button>
            ))}
          </div>

          {/* Polite Screen Reader Live Status */}
          <div aria-live="polite" className="text-xs text-vesta-foam font-mono pt-1">
            {synthesisStatusMessage}
          </div>
        </div>
      </section>

      {/* ─── Category Filter Pills ──────────────────────────────────────── */}
      <nav
        aria-label="Filter Ideas by Category"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              type="button"
              aria-pressed={isSelected}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-vesta-card text-vesta-gold border border-vesta-gold/30 shadow-md shadow-vesta-gold/5'
                  : 'bg-vesta-surface/80 text-vesta-muted hover:text-vesta-text border border-vesta-border'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* ─── Ideas Cards Grid ───────────────────────────────────────────── */}
      <section aria-label="Personalized Ideas Grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl bg-vesta-card border border-vesta-border text-center text-xs text-vesta-muted space-y-2">
            <Lightbulb className="w-8 h-8 text-vesta-muted mx-auto" />
            <p>No ideas found in this category.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-vesta-iris hover:underline font-semibold text-xs"
            >
              Show all categories
            </button>
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const badgeClass = getCategoryBadgeClass(idea.category);

            return (
              <div
                key={idea.id}
                className="p-5 rounded-3xl bg-vesta-card border border-vesta-border hover:border-vesta-iris/40 transition-all shadow-lg flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Category & Cost Impact */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold ${badgeClass}`}
                    >
                      {idea.category}
                    </span>
                    <span className="text-[11px] font-mono text-vesta-foam flex items-center gap-1 font-semibold">
                      <Coins className="w-3.5 h-3.5" />
                      {idea.estimatedCostImpact}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-sm font-bold text-vesta-text group-hover:text-vesta-gold transition-colors">
                      {idea.title}
                    </h2>
                    <p className="text-xs text-vesta-muted mt-1.5 leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  {/* Best For Rationale */}
                  <div className="p-2.5 rounded-xl bg-vesta-surface/80 border border-vesta-border/60 text-[11px] text-vesta-text/80 flex items-start gap-2">
                    <Compass className="w-3.5 h-3.5 text-vesta-iris shrink-0 mt-0.5" />
                    <span className="leading-snug">{idea.bestForContext}</span>
                  </div>
                </div>

                {/* 1-Click Add to Plan Action */}
                <div className="pt-3 border-t border-vesta-border/60">
                  {idea.appliedToPlan ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-vesta-success/15 border border-vesta-success/30 text-vesta-success text-xs font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Applied to Timeline & Audit Log ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApplyIdea(idea.id)}
                      className="w-full py-2 px-3 rounded-xl bg-vesta-surface hover:bg-vesta-iris/20 border border-vesta-border hover:border-vesta-iris/40 text-vesta-text hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-vesta-iris shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-vesta-gold" />
                      <span>1-Click Add to Plan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};
