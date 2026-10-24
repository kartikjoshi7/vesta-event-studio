/**
 * @fileoverview New Custom Event Project Modal for Vesta Event Studio (Portaled).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { EventProject, EventVertical } from '../../types/event';
import { validateNumberInput } from '../../utils/security';
import { VerticalBlueprintSelector } from './VerticalBlueprintSelector';
import { NewProjectFormFields } from './NewProjectFormFields';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (customData: Partial<EventProject>) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newVertical, setNewVertical] = useState<EventVertical>('wedding');
  const [newHost, setNewHost] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newGuests, setNewGuests] = useState('150');
  const [newBudget, setNewBudget] = useState('1500000');
  const [newSetting, setNewSetting] = useState<'indoor' | 'outdoor' | 'hybrid'>('hybrid');
  const [newSeason, setNewSeason] = useState<EventProject['season']>('winter');

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
  if (typeof document === 'undefined') return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guestNum = validateNumberInput(parseInt(newGuests, 10), 1, 100_000, 150);
    const budgetNum = validateNumberInput(parseInt(newBudget, 10), 10_000, 1_000_000_000, 1_500_000);

    onCreateProject({
      title: newTitle.trim() || undefined,
      vertical: newVertical,
      personaName: newHost.trim() || undefined,
      date: newDate || undefined,
      location: newLocation.trim() || undefined,
      guestCount: guestNum,
      totalBudget: budgetNum,
      indoorOutdoor: newSetting,
      season: newSeason,
    });

    onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-event-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl my-auto rounded-2xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="new-event-title" className="text-base font-semibold text-vesta-text">
              Create Bespoke Event Project
            </h2>
            <p className="text-xs text-vesta-muted mt-0.5">
              Scaffold an enterprise event blueprint with contextual budgets and timelines
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-1 rounded-lg text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <VerticalBlueprintSelector
            selectedVertical={newVertical}
            onSelectVertical={setNewVertical}
          />

          <NewProjectFormFields
            title={newTitle}
            onTitleChange={setNewTitle}
            host={newHost}
            onHostChange={setNewHost}
            date={newDate}
            onDateChange={setNewDate}
            location={newLocation}
            onLocationChange={setNewLocation}
            guests={newGuests}
            onGuestsChange={setNewGuests}
            budget={newBudget}
            onBudgetChange={setNewBudget}
            setting={newSetting}
            onSettingChange={setNewSetting}
            season={newSeason}
            onSeasonChange={setNewSeason}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-vesta-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-95 shadow-md shadow-vesta-iris/20 transition-all"
            >
              Initialize Workspace
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
