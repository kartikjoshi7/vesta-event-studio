/**
 * @fileoverview Smart Vendor CRM & Actionable Checklists for Vesta Event Studio (Modular Coordinator).
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { EventProject, VendorChecklistItem } from '../types/event';
import { draftVendorNegotiationMessage } from '../services/aiService';
import { VendorPipelineMetrics } from './vendors/VendorPipelineMetrics';
import { VendorItemCard } from './vendors/VendorItemCard';
import { VendorNegotiationModal } from './vendors/VendorNegotiationModal';
import { AddVendorDrawer } from './vendors/AddVendorDrawer';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNegotiationVendor, setActiveNegotiationVendor] = useState<VendorChecklistItem | null>(null);
  const [negotiationGoal, setNegotiationGoal] = useState<'discount' | 'scope-check' | 'contract-followup'>('discount');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const categories = Array.from(new Set(project.vendors.map((v) => v.category)));

  const filteredVendors = project.vendors.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    return true;
  });

  const handleOpenNegotiation = async (
    vendor: VendorChecklistItem,
    initialGoal: 'discount' | 'scope-check' | 'contract-followup' = 'discount',
  ) => {
    setActiveNegotiationVendor(vendor);
    setNegotiationGoal(initialGoal);
    setIsGeneratingDraft(true);

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

    try {
      const message = await draftVendorNegotiationMessage(project, activeNegotiationVendor, goal);
      setGeneratedDraft(message);
    } catch {
      setGeneratedDraft('Failed to adjust negotiation goals.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 5-Stage Procurement Metrics */}
      <VendorPipelineMetrics vendors={project.vendors} />

      {/* Filter and Register Bar */}
      <section
        aria-label="Vendor Pipeline"
        className="space-y-6 rounded-3xl bg-vesta-card/50 border border-vesta-border/80 p-6 shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-vesta-text">
              Vendor Procurement & Due Diligence Matrix
            </h2>
            <p className="text-xs text-vesta-muted mt-0.5">
              Track vendor progress, compliance checklists, and activate AI negotiation scripts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="vendor-category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="vendor-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              <option value="all">All Categories ({project.vendors.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-foam to-vesta-pine text-vesta-midnight hover:opacity-95 shadow-md shadow-vesta-foam/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Partner</span>
            </button>
          </div>
        </div>

        {/* Add Vendor Drawer */}
        <AddVendorDrawer
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          categories={categories}
          onAddVendor={onAddVendor}
        />

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorItemCard
              key={vendor.id}
              vendor={vendor}
              currency={project.currency}
              onToggleChecklistItem={onToggleChecklistItem}
              onUpdateVendorStatus={onUpdateVendorStatus}
              onOpenNegotiation={handleOpenNegotiation}
            />
          ))}
        </div>
      </section>

      {/* AI Negotiation Modal */}
      <VendorNegotiationModal
        isOpen={Boolean(activeNegotiationVendor)}
        onClose={() => setActiveNegotiationVendor(null)}
        vendor={activeNegotiationVendor}
        project={project}
        generatedDraft={generatedDraft}
        isGeneratingDraft={isGeneratingDraft}
        negotiationGoal={negotiationGoal}
        onGoalChange={handleGoalChange}
      />
    </div>
  );
};
