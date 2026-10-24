/**
 * @fileoverview AI Negotiation & Commercial Outreach Modal for Vendor CRM (Portaled).
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
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !vendor) return null;
  if (typeof document === 'undefined') return null;

  const handleCopyClipboard = () => {
    if (generatedDraft) {
      navigator.clipboard.writeText(generatedDraft);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-negotiation-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30">
              <Sparkles className="w-5 h-5 text-vesta-gold" />
            </div>
            <div>
              <h2 id="ai-negotiation-title" className="text-base font-bold text-vesta-text">
                AI Negotiation & Inquiry Generator
              </h2>
              <p className="text-xs text-vesta-muted mt-0.5">
                Tailored commercial communications for {vendor.vendorName} ({vendor.category})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-1 rounded-lg text-vesta-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-vesta-surface border border-vesta-border">
          {(
            [
              { id: 'discount', label: '10-15% Budget Optimization' },
              { id: 'scope-check', label: 'Scope & Deliverable Verification' },
              { id: 'contract-followup', label: 'Contract Sign-Off' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onGoalChange(tab.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                negotiationGoal === tab.id
                  ? 'bg-vesta-card text-vesta-gold border border-vesta-gold/30 shadow-sm'
                  : 'text-vesta-muted hover:text-vesta-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Draft Communication Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-vesta-muted">
            <span>Subject / Draft Email Output</span>
            <span className="flex items-center gap-1.5 text-vesta-foam font-mono text-[11px]">
              <Mail className="w-3.5 h-3.5" />
              Recipient: {vendor.contactEmail}
            </span>
          </div>

          <div className="relative">
            {isGeneratingDraft ? (
              <div className="w-full h-48 rounded-2xl bg-vesta-surface/80 border border-vesta-border/80 p-4 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-vesta-iris border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-vesta-muted animate-pulse">
                  Synthesizing contextual communication with {project.title} parameters...
                </span>
              </div>
            ) : (
              <textarea
                readOnly
                value={generatedDraft}
                rows={9}
                className="w-full p-4 rounded-2xl bg-vesta-surface/80 border border-vesta-border text-xs leading-relaxed text-vesta-text focus:outline-none resize-none font-mono"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-vesta-border/60">
          <div className="text-[11px] text-vesta-muted">
            Grounds context on: {project.guestCount} guests · {project.location} · {project.indoorOutdoor} setting
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopyClipboard}
              disabled={isGeneratingDraft || !generatedDraft}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md shadow-vesta-iris/20"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copy Draft Brief</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
