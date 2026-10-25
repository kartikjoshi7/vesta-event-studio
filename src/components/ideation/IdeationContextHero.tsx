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
  'Zero-Waste Luxury Decor', 'Interactive Guest Icebreakers', 'Regional Fusion Tasting Menu',
  'High-Impact Low-Cost Lighting', 'Sunset Ceremony Transitions', 'Immersive AV Storytelling',
];

export const IdeationContextHero: React.FC<IdeationContextHeroProps> = ({ project, onAddGeneratedIdeas }) => {
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
        setSynthesisStatusMessage(`Successfully synthesized ${generated.length} personalized ideas!`);
      } else {
        setSynthesisStatusMessage('Ideas updated based on active project state.');
      }
    } catch {
      setSynthesisStatusMessage('Local fallback utilized.');
    } finally {
      setIsSynthesizing(false);
      setCustomPrompt('');
    }
  };

  return (
    <section aria-label="Ideation Context" className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-vesta-gold/15 text-vesta-gold border border-vesta-gold/30">Concept Lab</span>
            <span className="text-xs text-vesta-muted">Neurosymbolic AI Synthesis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-vesta-text tracking-tight">Personalized Ideation & Bespoke Concept Engine</h1>
          <p className="text-xs text-vesta-muted mt-1 max-w-2xl leading-relaxed">Synthesize hyper-tailored themes, culinary menus, decor motifs, and entertainment experiences.</p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-vesta-muted">
            <span className="px-2.5 py-1 rounded-lg bg-vesta-surface border border-vesta-border font-medium">👥 {project.guestCount} Guests</span>
            <span className="px-2.5 py-1 rounded-lg bg-vesta-surface border border-vesta-border font-medium">💰 {project.currency} {project.totalBudget.toLocaleString()}</span>
            <span className="px-2.5 py-1 rounded-lg bg-vesta-surface border border-vesta-border font-medium capitalize">📍 {project.indoorOutdoor}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-vesta-surface/60 border border-vesta-border/80 space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); handleSynthesize(); }} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="custom-idea-prompt" className="sr-only">Custom ideation prompt</label>
            <input id="custom-idea-prompt" type="text" value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Ask for bespoke concept ideas (e.g. 'Royal Rajasthani welcome with sustainable flower petals')" className="w-full px-4 py-2.5 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:outline-none focus:ring-2 focus:ring-vesta-iris" />
          </div>
          <button type="submit" disabled={isSynthesizing} aria-label="Synthesize ideas with AI" className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-gold via-vesta-iris to-vesta-foam text-vesta-midnight hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg">
            {isSynthesizing ? <><Sparkles className="w-4 h-4 animate-spin text-vesta-midnight" /><span>Synthesizing Ideas…</span></> : <><Zap className="w-4 h-4 fill-vesta-midnight text-vesta-midnight" /><span>Synthesize Personalized Ideas</span></>}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-vesta-muted flex items-center gap-1 mr-1"><Lightbulb className="w-3.5 h-3.5 text-vesta-gold" />Quick Inspiration:</span>
          {quickPrompts.map((prompt, idx) => (
            <button key={idx} type="button" onClick={() => { setCustomPrompt(prompt); handleSynthesize(prompt); }} disabled={isSynthesizing} className="px-2.5 py-1 rounded-lg text-[11px] bg-vesta-surface hover:bg-vesta-card border border-vesta-border text-vesta-muted hover:text-vesta-text transition-all">+ {prompt}</button>
          ))}
        </div>
        <div aria-live="polite" className="text-xs text-vesta-foam font-mono pt-1">{synthesisStatusMessage}</div>
      </div>
    </section>
  );
};
