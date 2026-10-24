import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import type { EventProject } from '../../types/event';
import { personaMetadata } from '../../data/verticalPersonas';

interface ExecutiveIdentityHeroProps {
  project: EventProject;
}

export const ExecutiveIdentityHero: React.FC<ExecutiveIdentityHeroProps> = ({ project }) => {
  const meta = personaMetadata[project.vertical] || {
    emoji: '✨',
    tagline: project.vertical,
  };

  return (
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
            <span className="text-xl sm:text-2xl p-2 rounded-xl bg-vesta-card/80 border border-vesta-border/80 shadow-sm">
              {meta.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-vesta-gold/15 text-vesta-gold border border-vesta-gold/30 tracking-wide uppercase">
                  {project.vertical} blueprint
                </span>
                <span className="text-xs text-vesta-muted">
                  Hosted by <strong className="text-vesta-text font-medium">{project.personaName}</strong>
                </span>
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
  );
};
