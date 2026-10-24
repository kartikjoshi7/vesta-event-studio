/**
 * @fileoverview Header action buttons (AI status, Export, WCAG AAA toggle, Copilot).
 */

import React from 'react';
import { Cpu, FileText, Bot, Contrast } from 'lucide-react';
import type { ReadinessScore } from '../../services/contextEngine';
import { WorkspaceMetricsPill } from './WorkspaceMetricsPill';

interface HeaderActionButtonsProps {
  readinessMetrics: ReadinessScore;
  hasLiveApiKey: boolean;
  isApiKeyModalOpen: boolean;
  onOpenApiKeyModal: () => void;
  onOpenExportModal?: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenCopilot?: () => void;
}

export const HeaderActionButtons: React.FC<HeaderActionButtonsProps> = ({
  readinessMetrics,
  hasLiveApiKey,
  isApiKeyModalOpen,
  onOpenApiKeyModal,
  onOpenExportModal,
  isHighContrast,
  onToggleHighContrast,
  onOpenCopilot,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <WorkspaceMetricsPill readinessMetrics={readinessMetrics} />

      <button
        onClick={onOpenApiKeyModal}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isApiKeyModalOpen}
        aria-label="AI Engine and API Key settings"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesta-iris ${
          hasLiveApiKey
            ? 'bg-vesta-foam/10 text-vesta-foam border-vesta-foam/30 hover:bg-vesta-foam/20'
            : 'bg-vesta-surface text-vesta-muted border-vesta-border/80 hover:text-vesta-text hover:border-vesta-iris/40'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 text-vesta-foam" />
        <span className="hidden lg:inline text-xs">
          {hasLiveApiKey ? 'Gemini 3.5' : 'Local AI'}
        </span>
      </button>

      {onOpenExportModal && (
        <button
          onClick={onOpenExportModal}
          type="button"
          aria-label="Export Event Blueprint"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-vesta-surface hover:bg-vesta-card border border-vesta-border/80 text-vesta-text hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-vesta-foam"
        >
          <FileText className="w-3.5 h-3.5 text-vesta-foam" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      <button
        onClick={onToggleHighContrast}
        type="button"
        aria-pressed={isHighContrast}
        aria-label="Toggle WCAG 2.1 AAA High Contrast Mode"
        title="Toggle WCAG 2.1 AAA High Contrast Mode (>7:1 ratio)"
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesta-gold ${
          isHighContrast
            ? 'bg-yellow-400 text-black border-yellow-400 shadow-md font-bold'
            : 'bg-vesta-surface text-vesta-muted border-vesta-border/80 hover:text-vesta-text hover:border-yellow-400/40'
        }`}
      >
        <Contrast className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AAA</span>
      </button>

      {onOpenCopilot && (
        <button
          onClick={onOpenCopilot}
          type="button"
          aria-label="Open AI Copilot Drawer (Ctrl+K)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 transition-all shadow-md shadow-vesta-iris/20 focus:outline-none focus:ring-2 focus:ring-vesta-iris"
        >
          <Bot className="w-3.5 h-3.5 text-vesta-gold" />
          <span className="hidden sm:inline">Copilot</span>
          <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-black/30 text-[9px] font-mono text-white/80">
            ⌘K
          </kbd>
        </button>
      )}
    </div>
  );
};
