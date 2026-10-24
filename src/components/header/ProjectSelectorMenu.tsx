/**
 * @fileoverview Project Selector Dropdown Menu for Vesta Event Studio.
 */

import React from 'react';
import { ChevronDown, Check, Plus, RotateCcw } from 'lucide-react';
import type { EventProject } from '../../types/event';
import { personaMetadata } from '../../data/verticalPersonas';

interface ProjectSelectorMenuProps {
  activeProject: EventProject;
  projects: EventProject[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelectVertical: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onResetDemoData: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export const ProjectSelectorMenu: React.FC<ProjectSelectorMenuProps> = ({
  activeProject,
  projects,
  isOpen,
  onToggle,
  onClose,
  onSelectVertical,
  onOpenNewProjectModal,
  onResetDemoData,
  menuRef,
}) => {
  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Current celebration: ${activeProject.title}. Click to switch.`}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-vesta-surface/90 hover:bg-vesta-surface border border-vesta-border/80 hover:border-vesta-iris/50 text-xs font-medium text-vesta-text transition-all focus:outline-none focus:ring-2 focus:ring-vesta-iris shadow-sm"
      >
        <span className="text-sm">{personaMetadata[activeProject.vertical]?.emoji || '✨'}</span>
        <span className="max-w-[130px] sm:max-w-[180px] lg:max-w-[220px] truncate font-semibold">
          {activeProject.title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-vesta-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-vesta-iris' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-vesta-card/95 border border-vesta-border/80 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
        >
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-vesta-muted flex items-center justify-between">
            <span>Switch Celebration Blueprint</span>
            <span className="text-vesta-iris font-mono">{projects.length} Available</span>
          </div>

          {projects.map((project) => {
            const isActive = project.id === activeProject.id;
            const meta = personaMetadata[project.vertical] || { emoji: '✨', tagline: project.vertical };
            return (
              <button
                key={project.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  onSelectVertical(project.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs ${
                  isActive
                    ? 'bg-vesta-surface border border-vesta-gold/30 text-vesta-gold shadow-sm font-semibold'
                    : 'hover:bg-vesta-surface/70 text-vesta-text'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base p-1.5 rounded-lg bg-vesta-card border border-vesta-border/60">
                    {meta.emoji}
                  </span>
                  <div className="truncate">
                    <div className="truncate font-medium">{project.title}</div>
                    <div className="text-[10px] text-vesta-muted truncate">
                      {project.location} · {project.guestCount} guests · {project.currency} {(project.totalBudget / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-vesta-gold shrink-0 ml-2" />}
              </button>
            );
          })}

          <div className="pt-1 border-t border-vesta-border/60 mt-1 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewProjectModal();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-vesta-iris/15 hover:bg-vesta-iris/25 text-vesta-iris border border-vesta-iris/30 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Event</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onResetDemoData();
              }}
              title="Reset to challenge default demo personas"
              className="p-2 rounded-xl text-vesta-muted hover:text-white hover:bg-vesta-surface transition-all border border-transparent hover:border-vesta-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
