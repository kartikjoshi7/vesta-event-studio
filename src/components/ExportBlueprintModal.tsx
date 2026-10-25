/**
 * @fileoverview Export Event Blueprint Modal (Portaled < 140L).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Copy, Printer, Check, X, FileText, Sparkles } from 'lucide-react';
import type { EventProject } from '../types/event';
import type { ReadinessScore } from '../services/contextEngine';
import { generateMarkdownBrief } from '../utils/blueprintExport';

interface ExportBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: EventProject;
  readinessMetrics: ReadinessScore;
}

export const ExportBlueprintModal: React.FC<ExportBlueprintModalProps> = ({
  isOpen,
  onClose,
  project,
  readinessMetrics,
}) => {
  const [copiedBrief, setCopiedBrief] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleDownloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(project, null, 2))}`;
    const a = document.createElement('a');
    a.href = jsonString;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-blueprint.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyMarkdown = async () => {
    const brief = generateMarkdownBrief(project, readinessMetrics);
    try {
      await navigator.clipboard.writeText(brief);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2500);
    } catch {
      // Ignore
    }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="export-modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-vesta-foam/20 text-vesta-foam border border-vesta-foam/30"><FileText className="w-5 h-5" /></div>
            <div>
              <h2 id="export-modal-title" className="text-base font-bold text-vesta-text">Export Executive Event Blueprint</h2>
              <p className="text-xs text-vesta-muted mt-0.5">Download structured data, copy formatted Markdown briefs, or generate print-ready sheets.</p>
            </div>
          </div>
          <button onClick={onClose} type="button" aria-label="Close dialog" className="p-1.5 rounded-xl text-vesta-muted hover:text-white hover:bg-vesta-surface transition-colors focus:outline-none focus:ring-2 focus:ring-vesta-iris"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onClick={handleDownloadJson} className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-gold/50 text-left transition-all space-y-2 group">
            <div className="w-9 h-9 rounded-xl bg-vesta-gold/15 text-vesta-gold flex items-center justify-center group-hover:scale-105 transition-transform"><Download className="w-5 h-5" /></div>
            <div className="text-xs font-bold text-vesta-text group-hover:text-vesta-gold">Download JSON</div>
            <p className="text-[11px] text-vesta-muted">Complete state export with allocations and timeline.</p>
          </button>
          <button type="button" onClick={handleCopyMarkdown} className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-iris/50 text-left transition-all space-y-2 group">
            <div className="w-9 h-9 rounded-xl bg-vesta-iris/15 text-vesta-iris flex items-center justify-center group-hover:scale-105 transition-transform">{copiedBrief ? <Check className="w-5 h-5 text-vesta-success" /> : <Copy className="w-5 h-5" />}</div>
            <div className="text-xs font-bold text-vesta-text group-hover:text-vesta-iris">{copiedBrief ? 'Copied!' : 'Copy Markdown'}</div>
            <p className="text-[11px] text-vesta-muted">Executive brief formatted for Notion, Slack, and emails.</p>
          </button>
          <button type="button" onClick={() => window.print()} className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-foam/50 text-left transition-all space-y-2 group">
            <div className="w-9 h-9 rounded-xl bg-vesta-foam/15 text-vesta-foam flex items-center justify-center group-hover:scale-105 transition-transform"><Printer className="w-5 h-5" /></div>
            <div className="text-xs font-bold text-vesta-text group-hover:text-vesta-foam">Print / Save PDF</div>
            <p className="text-[11px] text-vesta-muted">Clean physical run-of-show and vendor contact sheets.</p>
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-vesta-text flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-vesta-gold" />Executive Blueprint Preview</span>
          <div className="p-4 rounded-2xl bg-vesta-surface/90 border border-vesta-border text-xs text-vesta-text/90 font-mono max-h-64 overflow-y-auto space-y-2">
            <p className="font-bold text-vesta-gold text-sm">{project.title}</p>
            <p className="text-vesta-muted text-[11px]">{project.guestCount} Guests · {project.currency} {project.totalBudget.toLocaleString()} Budget · {project.location}</p>
            <div className="border-t border-vesta-border/60 pt-2 text-[11px] text-vesta-text space-y-1">
              <p className="font-semibold text-vesta-iris">Day-Of Run-of-Show Sample:</p>
              {project.timelineItems.filter((i) => i.phase === 'run-of-show').slice(0, 3).map((i) => (
                <p key={i.id} className="text-vesta-muted">• {i.timeSlot || i.timeframe}: {i.title}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-vesta-border/60">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-semibold bg-vesta-surface hover:bg-vesta-border text-vesta-text">Done</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
