/**
 * @fileoverview AI Negotiation & Commercial Outreach Modal for Vendor CRM (Portaled < 130L).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Copy, Check, X, Mail } from 'lucide-react';
import type { VendorChecklistItem, EventProject } from '../../types/event';

interface VendorNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorChecklistItem | null;
  project: EventProject;
  generatedDraft: string;
  isGeneratingDraft: boolean;
  negotiationGoal: 'discount' | 'scope-check' | 'contract-followup';
  onGoalChange: (goal: 'discount' | 'scope-check' | 'contract-followup') => void;
}

export const VendorNegotiationModal: React.FC<VendorNegotiationModalProps> = ({
  isOpen,
  onClose,
  vendor,
  project,
  generatedDraft,
  isGeneratingDraft,
  negotiationGoal,
  onGoalChange,
}) => {
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !vendor || typeof document === 'undefined') return null;

  const handleCopyClipboard = () => {
    if (generatedDraft) {
      navigator.clipboard.writeText(generatedDraft);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="ai-negotiation-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-vesta-gold/15 text-vesta-gold border border-vesta-gold/30 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
            <div>
              <h2 id="ai-negotiation-title" className="text-base font-bold text-vesta-text">AI Commercial Negotiation Assistant</h2>
              <p className="text-xs text-vesta-muted">Drafting tailored communication for {vendor.vendorName} ({vendor.category})</p>
            </div>
          </div>
          <button onClick={onClose} type="button" aria-label="Close modal" className="p-1.5 rounded-xl text-vesta-muted hover:text-white hover:bg-vesta-surface transition-colors focus:outline-none focus:ring-2 focus:ring-vesta-iris"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-vesta-text">Select Negotiation Strategy:</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'discount' as const, label: '10-15% Budget Cut', desc: 'Price relief request' },
              { id: 'scope-check' as const, label: 'Scope Clarity', desc: 'Deliverables check' },
              { id: 'contract-followup' as const, label: 'Contract Milestone', desc: 'Deposit terms' },
            ].map((strategy) => (
              <button key={strategy.id} type="button" onClick={() => onGoalChange(strategy.id)} className={`p-2.5 rounded-xl border text-left transition-all ${negotiationGoal === strategy.id ? 'bg-vesta-surface border-vesta-gold text-vesta-gold shadow-sm' : 'bg-vesta-surface/50 border-vesta-border text-vesta-muted hover:text-vesta-text'}`}>
                <div className="text-xs font-bold">{strategy.label}</div>
                <div className="text-[10px] opacity-75">{strategy.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-vesta-text">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-vesta-gold" />Synthesized Email Draft:</span>
            <span className="text-[11px] font-mono text-vesta-muted">To: {vendor.contactEmail}</span>
          </div>
          <div className="relative">
            {isGeneratingDraft ? (
              <div className="w-full h-48 rounded-2xl bg-vesta-surface/80 border border-vesta-border p-4 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-vesta-iris border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-vesta-muted animate-pulse">Synthesizing communication with {project.title} parameters…</span>
              </div>
            ) : (
              <textarea readOnly value={generatedDraft} rows={8} className="w-full p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border text-xs leading-relaxed text-vesta-text focus:outline-none resize-none font-mono" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-vesta-border/60">
          <div className="text-[11px] text-vesta-muted">Grounds: {project.guestCount} guests · {project.location}</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface">Close</button>
            <button type="button" onClick={handleCopyClipboard} disabled={isGeneratingDraft || !generatedDraft} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 disabled:opacity-50">
              {copiedSuccess ? <><Check className="w-3.5 h-3.5 text-white" /><span>Copied!</span></> : <><Copy className="w-3.5 h-3.5 text-white" /><span>Copy Draft</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
