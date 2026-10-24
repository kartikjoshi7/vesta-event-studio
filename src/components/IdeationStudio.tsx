/**
 * @fileoverview Personalized Ideation Studio for Vesta Event Studio.
 * Composed coordinator (< 100L) orchestrating:
 * 1. IdeationContextHero (AI synthesis & constraint bar)
 * 2. CuratedPaletteSwatches (vertical-specific color palettes)
 * 3. SpeechCopywriterCard (invitation & toast speech generator)
 * 4. Filterable IdeaCard grid with 1-click plan injection
 */

import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import type { EventProject, PersonalizedIdea } from '../types/event';
import { IdeationContextHero } from './ideation/IdeationContextHero';
import { CuratedPaletteSwatches } from './ideation/CuratedPaletteSwatches';
import { SpeechCopywriterCard } from './ideation/SpeechCopywriterCard';
import { IdeaCard } from './ideation/IdeaCard';

interface IdeationStudioProps {
  project: EventProject;
  onApplyIdea: (ideaId: string) => void;
  onAddGeneratedIdeas: (ideas: PersonalizedIdea[]) => void;
}

const categories: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Theme & Concept', value: 'theme' },
  { label: 'Décor & Ambience', value: 'decor' },
  { label: 'Catering & F&B', value: 'catering' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Sustainability', value: 'sustainability' },
  { label: 'Logistics & Tech', value: 'logistics' },
];

export const IdeationStudio: React.FC<IdeationStudioProps> = ({
  project,
  onApplyIdea,
  onAddGeneratedIdeas,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredIdeas = project.savedIdeas.filter((idea) => {
    if (selectedCategory !== 'all' && idea.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Context Hero & AI Synthesis Bar */}
      <IdeationContextHero project={project} onAddGeneratedIdeas={onAddGeneratedIdeas} />

      {/* 2. Curated Event Color Palette Swatches */}
      <CuratedPaletteSwatches vertical={project.vertical} />

      {/* 3. AI Invitation & Toast Speech Copywriter */}
      <SpeechCopywriterCard project={project} />

      {/* 4. Category Filter Pills */}
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

      {/* 5. Ideas Cards Grid */}
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
          filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onApplyIdea={onApplyIdea} />
          ))
        )}
      </section>
    </div>
  );
};
