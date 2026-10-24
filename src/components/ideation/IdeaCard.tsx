import React from 'react';
import { Coins, Compass, CheckCircle2, Plus } from 'lucide-react';
import type { PersonalizedIdea, IdeaCategory } from '../../types/event';

interface IdeaCardProps {
  idea: PersonalizedIdea;
  onApplyIdea: (ideaId: string) => void;
}

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

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onApplyIdea }) => {
  const badgeClass = getCategoryBadgeClass(idea.category);

  return (
    <div className="p-5 rounded-3xl bg-vesta-card border border-vesta-border hover:border-vesta-iris/40 transition-all shadow-lg flex flex-col justify-between space-y-4 group">
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
};
