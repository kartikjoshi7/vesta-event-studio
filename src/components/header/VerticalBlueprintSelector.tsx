/**
 * @fileoverview Vertical blueprint picker pills for bespoke event modal.
 */

import React from 'react';
import type { EventVertical } from '../../types/event';
import { personaMetadata } from '../../data/verticalPersonas';

interface VerticalBlueprintSelectorProps {
  selectedVertical: EventVertical;
  onSelectVertical: (vert: EventVertical) => void;
}

const VERTICAL_OPTIONS: EventVertical[] = ['wedding', 'birthday', 'community'];

export const VerticalBlueprintSelector: React.FC<VerticalBlueprintSelectorProps> = ({
  selectedVertical,
  onSelectVertical,
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-vesta-text mb-2">
        Event Vertical Blueprint
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {VERTICAL_OPTIONS.map((vert) => {
          const isSel = selectedVertical === vert;
          const meta = personaMetadata[vert];
          return (
            <button
              key={vert}
              type="button"
              onClick={() => onSelectVertical(vert)}
              className={`p-3 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-vesta-iris ${
                isSel
                  ? 'bg-vesta-iris/15 border-vesta-iris text-vesta-text shadow-sm ring-1 ring-vesta-iris'
                  : 'bg-vesta-surface border-vesta-border text-vesta-muted hover:text-vesta-text hover:border-vesta-iris/40'
              }`}
            >
              <div className="text-lg">{meta.emoji}</div>
              <div className="text-xs font-semibold capitalize mt-1 text-vesta-text">
                {vert}
              </div>
              <div className="text-[10px] text-vesta-muted truncate mt-0.5">
                {meta.tagline}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
