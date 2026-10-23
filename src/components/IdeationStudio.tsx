/**
 * @fileoverview Personalized Ideation Studio for Vesta Event Studio (Phase 4).
 *
 * Provides:
 * 1. Active persona constraints & contextual AI synthesis
 * 2. Curated Event Color Palette with 1-click copy hex codes
 * 3. AI Invitation & Toast Speech Copywriter with live generator & clipboard copy
 * 4. Filterable Idea Cards Grid with 1-click timeline & audit log injection
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
  Palette,
  Copy,
  Check,
  Mail,
  Mic,
  FileText,
} from 'lucide-react';
import type { EventProject, PersonalizedIdea, IdeaCategory } from '../types/event';
import { sanitizeUserInput } from '../utils/security';
import { generatePersonalizedIdeas } from '../services/aiService';

interface IdeationStudioProps {
  project: EventProject;
  onApplyIdea: (ideaId: string) => void;
  onAddGeneratedIdeas: (ideas: PersonalizedIdea[]) => void;
}

interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
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

  // Palette copy state
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Copywriter state
  const [copywriterMode, setCopywriterMode] = useState<'invitation' | 'toast'>('invitation');
  const [copiedCopyText, setCopiedCopyText] = useState(false);

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

  // 1. Curated Palettes by Vertical
  const palettesByVertical: Record<string, ColorSwatch[]> = {
    wedding: [
      { name: 'Royal Crimson', hex: '#881337', role: 'Primary Accent' },
      { name: 'Marigold Gold', hex: '#D97706', role: 'Secondary Accent' },
      { name: 'Ivory Silk', hex: '#FDF4E3', role: 'Base Linen' },
      { name: 'Haveli Navy', hex: '#1E3A8A', role: 'Contrast Border' },
      { name: 'Forest Emerald', hex: '#065F46', role: 'Floral Foliage' },
    ],
    birthday: [
      { name: 'Rooftop Obsidian', hex: '#0F172A', role: 'Base Midnight' },
      { name: 'Neon Rose', hex: '#F43F5E', role: 'Vibrant Highlight' },
      { name: 'Electric Cyan', hex: '#06B6D4', role: 'Cocktail Glow' },
      { name: 'Deep Violet', hex: '#A855F7', role: 'DJ Stage Ambient' },
      { name: 'Laser Gold', hex: '#FACC15', role: 'Metallic Trim' },
    ],
    community: [
      { name: 'Eco Forest', hex: '#047857', role: 'Sustainability Primary' },
      { name: 'Sky Innovation', hex: '#0284C7', role: 'Tech Accent' },
      { name: 'Solar Amber', hex: '#F59E0B', role: 'Stage Warmth' },
      { name: 'Slate Neutral', hex: '#475569', role: 'Signage & Badges' },
      { name: 'Clean Pearl', hex: '#F8FAFC', role: 'Exhibit Floor' },
    ],
  };

  const currentPalette =
    palettesByVertical[project.vertical] || palettesByVertical.wedding;

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2500);
    } catch {
      // Fallback
    }
  };

  // 2. Dynamic Copywriting Text
  const formattedDate = new Date(project.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const generatedInvitationText =
    project.vertical === 'wedding'
      ? `✨ Together with their families,\n${project.personaName} cordially invite you to celebrate the joyous union of\n${project.title}\n\n📅 Date: ${formattedDate}\n📍 Venue: ${project.location}\n👗 Dress Code / Vibe: ${project.vibeTags.join(', ')}\n\nKindly RSVP to celebrate love, tradition, and eternal memories.`
      : project.vertical === 'birthday'
      ? `🎉 You're invited to celebrate!\nJoin us for ${project.title} hosted by ${project.personaName}!\n\n📅 Date: ${formattedDate}\n📍 Location: ${project.location}\n🍸 Atmosphere: ${project.vibeTags.join(' · ')}\n\nGet ready for extraordinary music, bespoke drinks, and an unforgettable celebration. RSVP today!`
      : `🌱 You are invited to attend:\n${project.title}\nConvened by ${project.personaName}\n\n📅 Date: ${formattedDate}\n📍 Venue: ${project.location}\n🎯 Theme: ${project.vibeTags.join(' | ')}\n\nJoin 500+ leaders, innovators, and sustainability champions for impactful keynotes, interactive exhibits, and collaborative networking. Register your badge now!`;

  const generatedToastText =
    project.vertical === 'wedding'
      ? `Dear family and distinguished friends,\n\nStanding here today for ${project.title}, my heart is filled with gratitude. To everyone who traveled from near and far to ${project.location} to be with ${project.personaName}—thank you. May this celebration be blessed with laughter, timeless rituals, and a lifetime of happiness.\n\nPlease raise your glasses with me to love, family, and new beginnings!`
      : project.vertical === 'birthday'
      ? `Welcome everyone!\n\nThank you for turning up tonight to celebrate ${project.title}! Looking around this rooftop, seeing all our favorite people together in ${project.location} means the world to ${project.personaName}.\n\nHere is to milestone memories, bold dreams, and dancing until the sunrise. Cheers!`
      : `Honored delegates, keynote speakers, and partners,\n\nWelcome to ${project.title}. Today in ${project.location}, we gather with a shared mission: shaping sustainable technology for our collective future. Over the next full day, let us challenge assumptions, forge lasting partnerships, and turn vision into measurable action.\n\nThank you for your leadership and participation!`;

  const activeCopyContent =
    copywriterMode === 'invitation' ? generatedInvitationText : generatedToastText;

  const handleCopyCopywriterText = async () => {
    try {
      await navigator.clipboard.writeText(activeCopyContent);
      setCopiedCopyText(true);
      setTimeout(() => setCopiedCopyText(false), 2500);
    } catch {
      // Fallback
    }
  };

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

      {/* ─── Curated Event Color Palette Bar ────────────────────────────── */}
      <section
        aria-label="Curated Event Color Palette"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-vesta-gold/20 text-vesta-gold border border-vesta-gold/30">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-vesta-text">
                Curated Event Color Palette ({project.vertical.toUpperCase()})
              </h2>
              <p className="text-xs text-vesta-muted">
                Harmonious hex color tokens tailored to this celebration aesthetic. Click any swatch to copy.
              </p>
            </div>
          </div>

          <div aria-live="polite" className="text-xs text-vesta-success font-mono">
            {copiedHex && `Copied ${copiedHex} to clipboard!`}
          </div>
        </div>

        {/* 5 Swatches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {currentPalette.map((swatch, idx) => {
            const isCopied = copiedHex === swatch.hex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopyHex(swatch.hex)}
                aria-label={`Copy hex code ${swatch.hex} for ${swatch.name}`}
                className="p-3 rounded-2xl bg-vesta-surface/90 border border-vesta-border hover:border-vesta-iris/40 transition-all text-left space-y-2.5 group focus:outline-none focus:ring-2 focus:ring-vesta-iris"
              >
                {/* Visual Swatch */}
                <div
                  className="w-full h-12 rounded-xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform flex items-end justify-end p-1.5"
                  style={{ backgroundColor: swatch.hex }}
                >
                  <span className="p-1 rounded-md bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {isCopied ? <Check className="w-3 h-3 text-vesta-success" /> : <Copy className="w-3 h-3" />}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-vesta-text group-hover:text-vesta-gold transition-colors truncate">
                    {swatch.name}
                  </div>
                  <div className="text-[10px] font-mono text-vesta-foam mt-0.5">
                    {swatch.hex}
                  </div>
                  <div className="text-[9px] text-vesta-muted uppercase tracking-wider mt-0.5 truncate">
                    {swatch.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── AI Invitation & Toast Speech Copywriter ───────────────────── */}
      <section
        aria-label="AI Copywriter"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30">
              <FileText className="w-4 h-4 text-vesta-gold" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-vesta-text">
                AI Invitation & Toast Speech Copywriter
              </h2>
              <p className="text-xs text-vesta-muted">
                Synthesizes tone-matched guest invitation copy and keynote toast speeches tailored to your event details.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div role="tablist" aria-label="Copywriter format selection" className="flex items-center gap-1.5 p-1 rounded-xl bg-vesta-surface border border-vesta-border">
            <button
              type="button"
              role="tab"
              aria-selected={copywriterMode === 'invitation'}
              onClick={() => setCopywriterMode('invitation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                copywriterMode === 'invitation'
                  ? 'bg-vesta-card text-vesta-gold border border-vesta-gold/30 shadow-sm'
                  : 'text-vesta-muted hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Guest Invitation</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={copywriterMode === 'toast'}
              onClick={() => setCopywriterMode('toast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                copywriterMode === 'toast'
                  ? 'bg-vesta-card text-vesta-iris border border-vesta-iris/30 shadow-sm'
                  : 'text-vesta-muted hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Host Toast Speech</span>
            </button>
          </div>
        </div>

        {/* Copywriter Text Area */}
        <div className="relative">
          <label htmlFor="copywriter-textarea" className="sr-only">
            Generated {copywriterMode === 'invitation' ? 'Guest Invitation' : 'Host Toast Speech'}
          </label>
          <textarea
            id="copywriter-textarea"
            readOnly
            value={activeCopyContent}
            rows={7}
            className="w-full p-4 rounded-2xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-vesta-iris resize-none"
          />

          <button
            type="button"
            onClick={handleCopyCopywriterText}
            aria-label="Copy invitation or toast text to clipboard"
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vesta-card/90 hover:bg-vesta-border border border-vesta-border text-xs font-semibold text-vesta-text hover:text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          >
            {copiedCopyText ? (
              <>
                <Check className="w-3.5 h-3.5 text-vesta-success" />
                <span className="text-vesta-success">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-vesta-gold" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
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
