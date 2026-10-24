/**
 * @fileoverview Luxury Glassmorphic Command Header for Vesta Event Studio (Modular Coordinator).
 */

import React, { useState, useEffect, useRef } from 'react';
import type { EventProject } from '../types/event';
import type { ReadinessScore } from '../services/contextEngine';
import { AISettingsModal } from './header/AISettingsModal';
import { NewProjectModal } from './header/NewProjectModal';
import { ProjectSelectorMenu } from './header/ProjectSelectorMenu';
import { HeaderBrandLogo } from './header/HeaderBrandLogo';
import { HeaderActionButtons } from './header/HeaderActionButtons';

interface HeaderProps {
  activeProject: EventProject;
  projects: EventProject[];
  readinessMetrics: ReadinessScore;
  onSelectVertical: (verticalOrId: string) => void;
  onCreateProject: (customData: Partial<EventProject>) => void;
  onResetDemoData: () => void;
  onOpenExportModal?: () => void;
  onOpenCopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  projects,
  readinessMetrics,
  onSelectVertical,
  onCreateProject,
  onResetDemoData,
  onOpenExportModal,
  onOpenCopilot,
}) => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const eventMenuRef = useRef<HTMLDivElement>(null);

  // Close menus & modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsApiKeyModalOpen(false);
        setIsNewEventModalOpen(false);
        setIsEventMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close Event Menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventMenuRef.current && !eventMenuRef.current.contains(e.target as Node)) {
        setIsEventMenuOpen(false);
      }
    };
    if (isEventMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEventMenuOpen]);

  // WCAG 2.1 AAA High Contrast Mode state
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vesta_high_contrast_aaa') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast-aaa');
    } else {
      document.documentElement.classList.remove('high-contrast-aaa');
    }
  }, [isHighContrast]);

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vesta_high_contrast_aaa', String(next));
      } catch {
        // Storage error handling
      }
      return next;
    });
  };

  const hasLiveApiKey = Boolean(
    (typeof localStorage !== 'undefined' && localStorage.getItem('vesta_gemini_api_key')) ||
      (typeof import.meta !== 'undefined' &&
        import.meta.env?.VITE_GEMINI_API_KEY &&
        import.meta.env.VITE_GEMINI_API_KEY !== 'your_google_gemini_api_key_here'),
  );

  return (
    <header
      role="banner"
      aria-label="Application Header"
      className="sticky top-0 z-40 w-full border-b border-vesta-border/60 bg-vesta-midnight/90 backdrop-blur-xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Project Selector */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <HeaderBrandLogo />

          <div className="h-5 w-px bg-vesta-border/80 hidden sm:block" aria-hidden="true" />

          {/* Project Selector Dropdown Menu */}
          <ProjectSelectorMenu
            activeProject={activeProject}
            projects={projects}
            isOpen={isEventMenuOpen}
            onToggle={() => setIsEventMenuOpen((prev) => !prev)}
            onClose={() => setIsEventMenuOpen(false)}
            onSelectVertical={onSelectVertical}
            onOpenNewProjectModal={() => setIsNewEventModalOpen(true)}
            onResetDemoData={onResetDemoData}
            menuRef={eventMenuRef}
          />
        </div>

        {/* Right Actions: Live Readiness + AI Status + Export + AAA + Copilot */}
        <HeaderActionButtons
          readinessMetrics={readinessMetrics}
          hasLiveApiKey={hasLiveApiKey}
          isApiKeyModalOpen={isApiKeyModalOpen}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenExportModal={onOpenExportModal}
          isHighContrast={isHighContrast}
          onToggleHighContrast={toggleHighContrast}
          onOpenCopilot={onOpenCopilot}
        />
      </div>

      {/* AI Settings Modal */}
      <AISettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onResetDemoData={onResetDemoData}
      />

      {/* Create Custom Event Modal */}
      <NewProjectModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreateProject={onCreateProject}
      />
    </header>
  );
};
