/**
 * @fileoverview Quick contextual prompt suggestions for Context AI Copilot.
 */

import React from 'react';

interface CopilotPromptChipsProps {
  chips: string[];
  isAsking: boolean;
  onSelectChip: (chip: string) => void;
}

export const CopilotPromptChips: React.FC<CopilotPromptChipsProps> = ({
  chips,
  isAsking,
  onSelectChip,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectChip(chip)}
          disabled={isAsking}
          className="px-2.5 py-1 rounded-lg text-[10px] bg-vesta-card hover:bg-vesta-border border border-vesta-border text-vesta-muted hover:text-vesta-text whitespace-nowrap transition-colors disabled:opacity-50"
        >
          {chip}
        </button>
      ))}
    </div>
  );
};
