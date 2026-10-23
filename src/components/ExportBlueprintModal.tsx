/**
 * @fileoverview Executive Blueprint Export & Print Modal for Vesta Event Studio.
 *
 * Provides 1-click JSON blueprint download, copyable Markdown executive brief,
 * and high-fidelity print / PDF styling for Day-Of Run-of-Show and Vendor Checklists.
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { EventProject } from '../types/event';
import type { ReadinessScore } from '../services/contextEngine';

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1. JSON Download Generator
  const handleDownloadJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(project, null, 2),
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const fileName = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-blueprint.json`;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 2. Markdown Brief Generator
  const generateMarkdownBrief = (): string => {
    const totalAllocated = project.budgetCategories.reduce((s, c) => s + c.allocatedAmount, 0);
    const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);

    const runOfShowItems = project.timelineItems
      .filter((i) => i.phase === 'run-of-show')
      .map((i) => `- **${i.timeSlot || i.timeframe}**: ${i.title} (${i.status.toUpperCase()}) — Assigned to ${i.assignee || 'Lead'}`)
      .join('\n');

    const budgetTable = project.budgetCategories
      .map((c) => `| ${c.name} | ${project.currency} ${c.allocatedAmount.toLocaleString()} | ${project.currency} ${c.spentAmount.toLocaleString()} | ${c.priority.toUpperCase()} | ${c.isLocked ? '🔒 Locked' : 'Unlocked'} |`)
      .join('\n');

    const vendorTable = project.vendors
      .map((v) => `| ${v.vendorName} (${v.category}) | ${project.currency} ${v.estimatedCost.toLocaleString()} | ${v.status.toUpperCase()} | ${v.contactEmail} |`)
      .join('\n');

    return `# ${project.title} — Executive Blueprint
*Generated via Vesta Event Studio · Celebration Operating System*

## 1. Executive Summary
- **Vertical:** ${project.vertical.toUpperCase()}
- **Host / Client:** ${project.personaName}
- **Target Date:** ${project.date}
- **Location:** ${project.location}
- **Guest Count:** ${project.guestCount} Attendees
- **Total Budget:** ${project.currency} ${project.totalBudget.toLocaleString()} (Cost Per Head: ${project.currency} ${Math.round(project.totalBudget / Math.max(1, project.guestCount)).toLocaleString()})
- **Physical Setting:** ${project.indoorOutdoor.toUpperCase()} (${project.season} season)
- **Vibe Aesthetic:** ${project.vibeTags.join(', ')}
- **Dietary Restrictions:** ${project.dietaryRestrictions.join(', ') || 'Standard Catering'}
- **Overall Readiness Health:** ${readinessMetrics.overallScore}/100

---

## 2. Day-Of Run-of-Show
${runOfShowItems || '_No run-of-show items registered._'}

---

## 3. Financial Allocation Matrix
| Category | Allocated | Spent | Priority | Lock Status |
| :--- | :--- | :--- | :--- | :--- |
${budgetTable}

- **Total Allocated:** ${project.currency} ${totalAllocated.toLocaleString()}
- **Actual Spend:** ${project.currency} ${totalSpent.toLocaleString()}
- **Available Buffer:** ${project.currency} ${(project.totalBudget - totalSpent).toLocaleString()}

---

## 4. Vendor Registry & Procurement
| Vendor | Estimated Quote | Status | Contact |
| :--- | :--- | :--- | :--- |
${vendorTable}
`;
  };

  const handleCopyMarkdown = async () => {
    const brief = generateMarkdownBrief();
    try {
      await navigator.clipboard.writeText(brief);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 2500);
    } catch {
      // Fallback
    }
  };

  // 3. Print / Save PDF View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-vesta-foam/20 text-vesta-foam border border-vesta-foam/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-base font-bold text-vesta-text">
                Export Executive Event Blueprint
              </h2>
              <p className="text-xs text-vesta-muted mt-0.5">
                Download structured data, copy formatted Markdown briefs, or generate print-ready execution sheets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-1 rounded-lg text-vesta-muted hover:text-white hover:bg-vesta-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Export Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Download JSON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-gold/50 text-left transition-all space-y-2 group focus:outline-none focus:ring-2 focus:ring-vesta-gold"
          >
            <div className="w-9 h-9 rounded-xl bg-vesta-gold/15 text-vesta-gold flex items-center justify-center group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-vesta-text group-hover:text-vesta-gold transition-colors">
              Download JSON
            </div>
            <p className="text-[11px] text-vesta-muted leading-snug">
              Complete state export with all allocations, timeline nodes, and audit logs.
            </p>
          </button>

          {/* 2. Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-iris/50 text-left transition-all space-y-2 group focus:outline-none focus:ring-2 focus:ring-vesta-iris"
          >
            <div className="w-9 h-9 rounded-xl bg-vesta-iris/15 text-vesta-iris flex items-center justify-center group-hover:scale-105 transition-transform">
              {copiedBrief ? <Check className="w-5 h-5 text-vesta-success" /> : <Copy className="w-5 h-5" />}
            </div>
            <div className="text-xs font-bold text-vesta-text group-hover:text-vesta-iris transition-colors">
              {copiedBrief ? 'Copied to Clipboard!' : 'Copy Markdown'}
            </div>
            <p className="text-[11px] text-vesta-muted leading-snug">
              Executive brief formatted for Notion, Slack, emails, and client reviews.
            </p>
          </button>

          {/* 3. Print / Save PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-4 rounded-2xl bg-vesta-surface hover:bg-vesta-surface/80 border border-vesta-border hover:border-vesta-foam/50 text-left transition-all space-y-2 group focus:outline-none focus:ring-2 focus:ring-vesta-foam"
          >
            <div className="w-9 h-9 rounded-xl bg-vesta-foam/15 text-vesta-foam flex items-center justify-center group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-vesta-text group-hover:text-vesta-foam transition-colors">
              Print / Save PDF
            </div>
            <p className="text-[11px] text-vesta-muted leading-snug">
              Clean physical print sheet with day-of run-of-show and vendor contact sheets.
            </p>
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-vesta-text flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-vesta-gold" />
            Executive Blueprint Preview
          </span>
          <div className="p-4 rounded-2xl bg-vesta-surface/90 border border-vesta-border text-xs text-vesta-text/90 font-mono max-h-64 overflow-y-auto space-y-2 leading-relaxed">
            <p className="font-bold text-vesta-gold text-sm">{project.title}</p>
            <p className="text-vesta-muted text-[11px]">
              {project.guestCount} Guests · {project.currency} {project.totalBudget.toLocaleString()} Budget · {project.location} · {project.date}
            </p>
            <div className="border-t border-vesta-border/60 pt-2 text-[11px] text-vesta-text space-y-1">
              <p className="font-semibold text-vesta-iris">Day-Of Run-of-Show Sample:</p>
              {project.timelineItems
                .filter((i) => i.phase === 'run-of-show')
                .slice(0, 3)
                .map((i) => (
                  <p key={i.id} className="text-vesta-muted">
                    • {i.timeSlot || i.timeframe}: {i.title}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-vesta-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-vesta-surface hover:bg-vesta-border text-vesta-text transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
