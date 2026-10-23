/**
 * @fileoverview Main Application Root for Vesta Event Studio (Phase 3).
 *
 * Integrates all 5 planning modules:
 * 1. Executive Overview & Contingency Simulator
 * 2. Dynamic Budget Architect
 * 3. Dual-Horizon Timeline Engine
 * 4. Smart Vendor CRM & Actionable Checklists
 * 5. Personalized Ideation Studio
 *
 * Alongside the floating Context AI Copilot Drawer and Executive Blueprint Export Modal.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Coins,
  Calendar,
  ShieldCheck,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useEventWorkspace } from './hooks/useEventWorkspace';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BudgetArchitect } from './components/BudgetArchitect';
import { TimelineEngine } from './components/TimelineEngine';
import { VendorCRM } from './components/VendorCRM';
import { IdeationStudio } from './components/IdeationStudio';
import { ContextCopilotDrawer } from './components/ContextCopilotDrawer';
import { ExportBlueprintModal } from './components/ExportBlueprintModal';
import './index.css';

type ActiveTab = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideation';

export function App() {
  const {
    projects,
    activeProject,
    readinessMetrics,
    selectVerticalProject,
    createNewProject,
    updateProjectContext,
    toggleCategoryLock,
    updateCategorySpend,
    addBudgetCategory,
    updateTimelineStatus,
    addTimelineItem,
    toggleVendorChecklistItem,
    updateVendorStatus,
    addVendor,
    applyIdeaToPlan,
    addGeneratedIdeas,
    triggerContingencyScenario,
    resetDemoData,
  } = useEventWorkspace();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const navTabs = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: `${readinessMetrics.overallScore}%`,
    },
    {
      id: 'budget' as ActiveTab,
      label: 'Budget Architect',
      icon: <Coins className="w-4 h-4" />,
      badge: `${activeProject.currency} ${(activeProject.totalBudget / 1000).toFixed(0)}k`,
    },
    {
      id: 'timeline' as ActiveTab,
      label: 'Timeline & Run-of-Show',
      icon: <Calendar className="w-4 h-4" />,
      badge: `${activeProject.timelineItems.length}`,
    },
    {
      id: 'vendors' as ActiveTab,
      label: 'Smart Vendor CRM',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: `${activeProject.vendors.length}`,
    },
    {
      id: 'ideation' as ActiveTab,
      label: 'Ideation Studio',
      icon: <Sparkles className="w-4 h-4" />,
      badge: `${activeProject.savedIdeas.length}`,
    },
  ];

  return (
    <div className="min-h-screen bg-vesta-midnight text-vesta-text flex flex-col font-sans selection:bg-vesta-iris selection:text-white relative">
      {/* ─── WCAG 2.1 AA Skip to Content Link ────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-vesta-gold text-vesta-midnight font-bold rounded-xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* ─── Global Command Header ──────────────────────────────────────── */}
      <Header
        activeProject={activeProject}
        projects={projects}
        readinessMetrics={readinessMetrics}
        onSelectVertical={selectVerticalProject}
        onCreateProject={createNewProject}
        onResetDemoData={resetDemoData}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* ─── Primary Navigation Bar ─────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Planning Modules Navigation"
        className="w-full border-b border-vesta-border bg-vesta-surface/40 backdrop-blur-md sticky top-20 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="Event Planning Modules"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar"
          >
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesta-iris ${
                    isActive
                      ? 'bg-vesta-card text-vesta-gold border border-vesta-gold/30 shadow-md shadow-vesta-gold/5'
                      : 'text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface/80 border border-transparent'
                  }`}
                >
                  <span
                    className={
                      isActive ? 'text-vesta-gold' : 'text-vesta-muted group-hover:text-vesta-text'
                    }
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-vesta-gold/20 text-vesta-gold'
                        : 'bg-vesta-surface text-vesta-muted'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ─── Main Content Canvas ────────────────────────────────────────── */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"
      >
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="focus:outline-none"
        >
          {activeTab === 'overview' && (
            <OverviewDashboard
              project={activeProject}
              readinessMetrics={readinessMetrics}
              onUpdateContext={updateProjectContext}
              onTriggerContingency={triggerContingencyScenario}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetArchitect
              project={activeProject}
              onToggleLock={toggleCategoryLock}
              onUpdateCategorySpend={updateCategorySpend}
              onAddCategory={addBudgetCategory}
              onUpdateContext={updateProjectContext}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineEngine
              project={activeProject}
              onUpdateStatus={updateTimelineStatus}
              onAddTimelineItem={addTimelineItem}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorCRM
              project={activeProject}
              onToggleChecklistItem={toggleVendorChecklistItem}
              onUpdateVendorStatus={updateVendorStatus}
              onAddVendor={addVendor}
            />
          )}

          {activeTab === 'ideation' && (
            <IdeationStudio
              project={activeProject}
              onApplyIdea={applyIdeaToPlan}
              onAddGeneratedIdeas={addGeneratedIdeas}
            />
          )}
        </div>
      </main>

      {/* ─── Floating AI Copilot Trigger Button ──────────────────────────── */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isCopilotOpen}
        aria-label="Open Context AI Copilot"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-vesta-iris via-purple-600 to-vesta-foam text-white shadow-2xl shadow-vesta-iris/40 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-vesta-iris/50 flex items-center gap-2 group border border-white/20"
      >
        <Bot className="w-5 h-5 text-vesta-gold group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold pr-1 hidden sm:inline">Ask Copilot</span>
      </button>

      {/* ─── Context AI Copilot Drawer ──────────────────────────────────── */}
      <ContextCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        project={activeProject}
        readinessMetrics={readinessMetrics}
        onTriggerContingency={triggerContingencyScenario}
        onUpdateContext={updateProjectContext}
      />

      {/* ─── Executive Blueprint Export Modal ────────────────────────────── */}
      <ExportBlueprintModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={activeProject}
        readinessMetrics={readinessMetrics}
      />

      {/* ─── Enterprise Status Footer ───────────────────────────────────── */}
      <footer
        role="contentinfo"
        className="w-full border-t border-vesta-border bg-vesta-surface/30 backdrop-blur-md py-4 text-center text-xs text-vesta-muted mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vesta-success animate-pulse" />
            <span>
              Active: <strong className="text-vesta-text">{activeProject.title}</strong> (
              {activeProject.guestCount} Guests · {activeProject.currency}{' '}
              {activeProject.totalBudget.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-vesta-gold" />
              Vesta Event Studio v0.3.0 · GenAI Celebration OS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
