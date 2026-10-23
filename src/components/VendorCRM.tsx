/**
 * @fileoverview Smart Vendor CRM & Actionable Checklists for Vesta Event Studio.
 *
 * Provides procurement pipeline tracking, due-diligence vetting progress,
 * and GenAI-powered negotiation message generator with 1-click clipboard copy.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Plus,
  Mail,
  ShieldCheck,
  X,
  Calendar,
} from 'lucide-react';
import type { EventProject, VendorChecklistItem } from '../types/event';
import { sanitizeUserInput, validateNumberInput } from '../utils/security';
import { draftVendorNegotiationMessage } from '../services/aiService';

interface VendorCRMProps {
  project: EventProject;
  onToggleChecklistItem: (vendorId: string, checkId: string) => void;
  onUpdateVendorStatus: (
    vendorId: string,
    status: VendorChecklistItem['status'],
    actualCost?: number,
  ) => void;
  onAddVendor: (vendor: Omit<VendorChecklistItem, 'id'>) => void;
}

export const VendorCRM: React.FC<VendorCRMProps> = ({
  project,
  onToggleChecklistItem,
  onUpdateVendorStatus,
  onAddVendor,
}) => {
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI Negotiation Modal state
  const [activeNegotiationVendor, setActiveNegotiationVendor] =
    useState<VendorChecklistItem | null>(null);
  const [negotiationGoal, setNegotiationGoal] = useState<
    'discount' | 'scope-check' | 'contract-followup'
  >('discount');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Add Vendor Drawer state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newCategory, setNewCategory] = useState('Catering');
  const [newEmail, setNewEmail] = useState('');
  const [newEstimatedCost, setNewEstimatedCost] = useState('100000');
  const [newNotes, setNewNotes] = useState('');

  // Categories list for filter dropdown
  const categories = Array.from(new Set(project.vendors.map((v) => v.category)));

  const filteredVendors = project.vendors.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    return true;
  });

  // Pipeline metrics
  const totalCount = project.vendors.length;
  const shortlistedCount = project.vendors.filter((v) => v.status === 'shortlisted').length;
  const negotiatingCount = project.vendors.filter((v) => v.status === 'negotiating').length;
  const bookedCount = project.vendors.filter((v) => v.status === 'booked').length;
  const paidCount = project.vendors.filter((v) => v.status === 'paid').length;

  // Handle open negotiation modal & auto-draft initial goal
  const handleOpenNegotiation = async (
    vendor: VendorChecklistItem,
    initialGoal: 'discount' | 'scope-check' | 'contract-followup' = 'discount',
  ) => {
    setActiveNegotiationVendor(vendor);
    setNegotiationGoal(initialGoal);
    setIsGeneratingDraft(true);
    setCopiedSuccess(false);

    try {
      const message = await draftVendorNegotiationMessage(project, vendor, initialGoal);
      setGeneratedDraft(message);
    } catch {
      setGeneratedDraft('Unable to generate negotiation draft. Please try again.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleGoalChange = async (goal: 'discount' | 'scope-check' | 'contract-followup') => {
    if (!activeNegotiationVendor) return;
    setNegotiationGoal(goal);
    setIsGeneratingDraft(true);
    setCopiedSuccess(false);

    try {
      const message = await draftVendorNegotiationMessage(project, activeNegotiationVendor, goal);
      setGeneratedDraft(message);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!generatedDraft) return;
    try {
      await navigator.clipboard.writeText(generatedDraft);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeUserInput(newVendorName, 80);
    if (!cleanName) return;

    onAddVendor({
      category: sanitizeUserInput(newCategory, 40),
      vendorName: cleanName,
      contactEmail: sanitizeUserInput(newEmail || 'vendor@example.com', 80),
      estimatedCost: validateNumberInput(newEstimatedCost, 0, 100_000_000, 50_000),
      actualCost: 0,
      status: 'shortlisted',
      paymentDueDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0],
      vettingChecklist: [
        { id: 'c1', label: 'Commercial Quote & Portfolio Vetted', checked: false },
        { id: 'c2', label: 'Business License & Food/Safety Certifications', checked: false },
        { id: 'c3', label: 'Draft Service Agreement & SLA Reviewed', checked: false },
        { id: 'c4', label: 'Advance Payment Terms & Cancellation Buffer', checked: false },
      ],
      notes: sanitizeUserInput(newNotes, 200),
    });

    setNewVendorName('');
    setNewEmail('');
    setNewEstimatedCost('100000');
    setNewNotes('');
    setIsAddFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── Header & Pipeline Metrics ─────────────────────────────────── */}
      <section
        aria-label="Vendor Pipeline"
        className="rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-vesta-text flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-vesta-foam" />
              Smart Vendor CRM & Actionable Checklists
            </h1>
            <p className="text-xs text-vesta-muted mt-0.5">
              Track vendor procurement funnels, execute due-diligence checklists, and draft AI negotiation scripts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter vendors by category"
              className="px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              <option value="all">All Categories ({totalCount})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-foam to-vesta-pine text-white hover:opacity-90 shadow-md shadow-vesta-foam/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stage Funnel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-vesta-surface/80 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-muted">1. Shortlisted</span>
            <div className="text-lg font-bold font-mono text-vesta-muted mt-1">
              {shortlistedCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-vesta-surface/80 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-warning">2. In Negotiation</span>
            <div className="text-lg font-bold font-mono text-vesta-warning mt-1">
              {negotiatingCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-vesta-surface/80 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-iris">3. Booked / Contracted</span>
            <div className="text-lg font-bold font-mono text-vesta-iris mt-1">{bookedCount}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-vesta-surface/80 border border-vesta-border text-xs">
            <span className="text-[11px] text-vesta-success">4. Paid / Retained</span>
            <div className="text-lg font-bold font-mono text-vesta-success mt-1">{paidCount}</div>
          </div>
        </div>
      </section>

      {/* ─── Add Vendor Form Drawer ─────────────────────────────────────── */}
      {isAddFormOpen && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl bg-vesta-surface border border-vesta-foam/40 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-vesta-text flex items-center gap-2">
              <Plus className="w-4 h-4 text-vesta-foam" />
              Add Vendor to Event Registry
            </h2>
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="text-vesta-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-vesta-muted mb-1">
                Vendor / Business Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Haveli AV Systems"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-vesta-muted mb-1">Category</label>
              <input
                type="text"
                required
                placeholder="e.g. AV & Production"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-vesta-muted mb-1">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="contact@vendor.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-vesta-muted mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={newEstimatedCost}
                onChange={(e) => setNewEstimatedCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text font-mono focus:ring-2 focus:ring-vesta-iris focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-vesta-muted mb-1">
              Internal Vetting Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Recommended by venue manager. Holds 10kW sound license."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="px-3 py-1.5 text-xs text-vesta-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-vesta-foam text-vesta-midnight hover:opacity-90"
            >
              Register Vendor
            </button>
          </div>
        </form>
      )}

      {/* ─── Vendor Cards Grid ──────────────────────────────────────────── */}
      <section aria-label="Vendor Directory" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-2 p-8 rounded-3xl bg-vesta-card border border-vesta-border text-center text-xs text-vesta-muted">
            No vendors registered under this category.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const checkedCount = vendor.vettingChecklist.filter((c) => c.checked).length;
            const vettingPct = Math.round(
              (checkedCount / Math.max(1, vendor.vettingChecklist.length)) * 100,
            );

            return (
              <div
                key={vendor.id}
                className="p-5 rounded-3xl bg-vesta-card border border-vesta-border hover:border-vesta-foam/40 transition-all space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top: Name & Pipeline Stage Selector */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-sm text-vesta-text">{vendor.vendorName}</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-vesta-surface text-vesta-foam border border-vesta-foam/30 font-medium">
                          {vendor.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-vesta-muted mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-vesta-muted" />
                        {vendor.contactEmail}
                      </p>
                    </div>

                    <select
                      value={vendor.status}
                      onChange={(e) =>
                        onUpdateVendorStatus(
                          vendor.id,
                          e.target.value as VendorChecklistItem['status'],
                        )
                      }
                      aria-label={`Status for ${vendor.vendorName}`}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold border bg-vesta-surface border-vesta-border text-vesta-text focus:ring-2 focus:ring-vesta-foam focus:outline-none"
                    >
                      <option value="shortlisted">Shortlisted</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="booked">Booked</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  {/* Financials & Payment Due Date */}
                  <div className="p-3 rounded-2xl bg-vesta-surface/80 border border-vesta-border/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-vesta-muted block">Quoted Estimate</span>
                      <span className="font-mono font-bold text-vesta-text">
                        {project.currency} {vendor.estimatedCost.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-vesta-muted block">Actual Invoiced</span>
                      <span className="font-mono font-bold text-vesta-gold">
                        {vendor.actualCost > 0
                          ? `${project.currency} ${vendor.actualCost.toLocaleString()}`
                          : 'Pending final invoice'}
                      </span>
                    </div>

                    {vendor.paymentDueDate && (
                      <div className="text-right">
                        <span className="text-[10px] text-vesta-muted block flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-vesta-rose" />
                          Payment Due
                        </span>
                        <span className="font-mono text-xs text-vesta-text">
                          {vendor.paymentDueDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Vetting Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-vesta-text flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-vesta-foam" />
                        Due Diligence Vetting
                      </span>
                      <span className="font-mono text-vesta-muted">
                        {checkedCount}/{vendor.vettingChecklist.length} ({vettingPct}%)
                      </span>
                    </div>

                    {/* Micro Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-vesta-surface overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-vesta-foam to-vesta-pine rounded-full transition-all duration-300"
                        style={{ width: `${vettingPct}%` }}
                      />
                    </div>

                    {/* Vetting Checkboxes */}
                    <div className="space-y-1.5 pt-1">
                      {vendor.vettingChecklist.map((check) => (
                        <label
                          key={check.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-vesta-surface/60 cursor-pointer text-[11px] text-vesta-text/90 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={check.checked}
                            onChange={() => onToggleChecklistItem(vendor.id, check.id)}
                            className="rounded border-vesta-border bg-vesta-surface text-vesta-foam focus:ring-vesta-foam"
                          />
                          <span className={check.checked ? 'line-through text-vesta-muted' : ''}>
                            {check.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: AI Negotiation Draft Button */}
                <div className="pt-3 border-t border-vesta-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-vesta-muted truncate max-w-[200px]">
                    {vendor.notes || 'No notes added'}
                  </span>

                  <button
                    onClick={() => handleOpenNegotiation(vendor, 'discount')}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-vesta-iris/15 text-vesta-iris border border-vesta-iris/30 hover:bg-vesta-iris/25 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Negotiation Script</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ─── AI Draft Negotiation Modal ─────────────────────────────────── */}
      {activeNegotiationVendor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-negotiation-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
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
                    Tailored commercial communications for {activeNegotiationVendor.vendorName} (
                    {activeNegotiationVendor.category})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveNegotiationVendor(null)}
                type="button"
                aria-label="Close dialog"
                className="p-1 rounded-lg text-vesta-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Goal Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-vesta-surface border border-vesta-border">
              <button
                type="button"
                onClick={() => handleGoalChange('discount')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  negotiationGoal === 'discount'
                    ? 'bg-vesta-card text-vesta-gold border border-vesta-gold/30 shadow-sm'
                    : 'text-vesta-muted hover:text-white'
                }`}
              >
                1. Negotiate Discount
              </button>
              <button
                type="button"
                onClick={() => handleGoalChange('scope-check')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  negotiationGoal === 'scope-check'
                    ? 'bg-vesta-card text-vesta-iris border border-vesta-iris/30 shadow-sm'
                    : 'text-vesta-muted hover:text-white'
                }`}
              >
                2. Verify Scope & SLA
              </button>
              <button
                type="button"
                onClick={() => handleGoalChange('contract-followup')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  negotiationGoal === 'contract-followup'
                    ? 'bg-vesta-card text-vesta-foam border border-vesta-foam/30 shadow-sm'
                    : 'text-vesta-muted hover:text-white'
                }`}
              >
                3. Contract Follow-Up
              </button>
            </div>

            {/* Generated Script Area */}
            <div className="relative">
              <label htmlFor="negotiation-draft-textarea" className="sr-only">
                Generated negotiation draft
              </label>
              {isGeneratingDraft ? (
                <div className="w-full h-64 rounded-2xl bg-vesta-surface border border-vesta-border flex flex-col items-center justify-center gap-2 text-vesta-muted text-xs">
                  <Sparkles className="w-6 h-6 text-vesta-gold animate-spin" />
                  <span>Synthesizing bespoke negotiation strategy…</span>
                </div>
              ) : (
                <textarea
                  id="negotiation-draft-textarea"
                  readOnly
                  value={generatedDraft}
                  className="w-full h-64 p-4 rounded-2xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-vesta-iris resize-none"
                />
              )}
            </div>

            {/* Footer with Copy & Mailto */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-vesta-muted">
                Recipient: <span className="text-vesta-text">{activeNegotiationVendor.contactEmail}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  disabled={isGeneratingDraft}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-vesta-iris text-white hover:opacity-90 transition-all shadow-md shadow-vesta-iris/20"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-vesta-success" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>1-Click Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${activeNegotiationVendor.contactEmail}?subject=${encodeURIComponent(
                    `Inquiry: ${project.title} - ${activeNegotiationVendor.category}`,
                  )}&body=${encodeURIComponent(generatedDraft)}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-vesta-surface hover:bg-vesta-border border border-vesta-border text-vesta-text transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Email Client</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
