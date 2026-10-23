/**
 * @fileoverview Main Application Root for Vesta Event Studio.
 *
 * Wires the persistent event workspace state hook to the interactive planning
 * modules: Header & Persona Switcher, Executive Overview & Contingency Simulator,
 * Dynamic Budget Architect, Dual-Horizon Timeline Engine, and Smart Vendor CRM.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Coins,
  Calendar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEventWorkspace } from './hooks/useEventWorkspace';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BudgetArchitect } from './components/BudgetArchitect';
import { TimelineEngine } from './components/TimelineEngine';
import { VendorCRM } from './components/VendorCRM';
import './index.css';

type ActiveTab = 'overview' | 'budget' | 'timeline' | 'vendors';

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
    triggerContingencyScenario,
    resetDemoData,
  } = useEventWorkspace();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

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
  ];

  return (
    <div className="min-h-screen bg-vesta-midnight text-vesta-text flex flex-col font-sans selection:bg-vesta-iris selection:text-white">
      {/* ─── Global Command Header ──────────────────────────────────────── */}
      <Header
        activeProject={activeProject}
        projects={projects}
        readinessMetrics={readinessMetrics}
        onSelectVertical={selectVerticalProject}
        onCreateProject={createNewProject}
        onResetDemoData={resetDemoData}
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
        role="main"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
        </div>
      </main>

      {/* ─── Enterprise Status Footer ───────────────────────────────────── */}
      <footer
        role="contentinfo"
        className="w-full border-t border-vesta-border bg-vesta-surface/30 backdrop-blur-md py-4 text-center text-xs text-vesta-muted"
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
              Vesta Event Studio v0.2.0 · GenAI Celebration OS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
