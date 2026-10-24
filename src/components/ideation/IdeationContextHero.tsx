import React, { useState } from 'react';
import { Sparkles, Zap, Lightbulb } from 'lucide-react';
import type { EventProject, PersonalizedIdea } from '../../types/event';
import { sanitizeUserInput } from '../../utils/security';
import { generatePersonalizedIdeas } from '../../services/aiService';

interface IdeationContextHeroProps {
  project: EventProject;
  onAddGeneratedIdeas: (ideas: PersonalizedIdea[]) => void;
}

const quickPrompts = [
  'Zero-Waste Luxury Decor',
  'Interactive Guest Icebreakers',
  'Regional Fusion Tasting Menu',
  'High-Impact Low-Cost Lighting',
  'Sunset Ceremony Transitions',
  'Immersive AV Storytelling',
];

export const IdeationContextHero: React.FC<IdeationContextHeroProps> = ({
  project,
  onAddGeneratedIdeas,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStatusMessage, setSynthesisStatusMessage] = useState('');

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

  return (
    <section
      aria-label="Ideation Context"
      className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-vesta-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-vesta-gold" />
            Personalized Ideation & Creative Studio
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
  );
};
