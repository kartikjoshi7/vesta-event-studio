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

import React, { useState, lazy, Suspense } from 'react';
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
import './index.css';

// Lazy-load non-initial tabs to slash initial bundle size and optimize LCP/FCP
const BudgetArchitect = lazy(() =>
  import('./components/BudgetArchitect').then((m) => ({ default: m.BudgetArchitect })),
);
const TimelineEngine = lazy(() =>
  import('./components/TimelineEngine').then((m) => ({ default: m.TimelineEngine })),
);
const VendorCRM = lazy(() =>
  import('./components/VendorCRM').then((m) => ({ default: m.VendorCRM })),
);
const IdeationStudio = lazy(() =>
  import('./components/IdeationStudio').then((m) => ({ default: m.IdeationStudio })),
);
const ContextCopilotDrawer = lazy(() =>
  import('./components/ContextCopilotDrawer').then((m) => ({ default: m.ContextCopilotDrawer })),
);
const ExportBlueprintModal = lazy(() =>
  import('./components/ExportBlueprintModal').then((m) => ({ default: m.ExportBlueprintModal })),
);

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

  // Global Keyboard Navigation (1-5 for tabs, Ctrl+K for Copilot)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      } else if (e.key === '1') {
        setActiveTab('overview');
      } else if (e.key === '2') {
        setActiveTab('budget');
      } else if (e.key === '3') {
        setActiveTab('timeline');
      } else if (e.key === '4') {
        setActiveTab('vendors');
      } else if (e.key === '5') {
        setActiveTab('ideation');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navTabs = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Overview',
      shortLabel: 'Overview',
      shortcut: '1',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: `${readinessMetrics.overallScore}%`,
    },
    {
      id: 'budget' as ActiveTab,
      label: 'Budget Architect',
      shortLabel: 'Budget',
      shortcut: '2',
      icon: <Coins className="w-4 h-4" />,
      badge: `${activeProject.currency} ${(activeProject.totalBudget / 1000).toFixed(0)}k`,
    },
    {
      id: 'timeline' as ActiveTab,
      label: 'Timeline & Run-of-Show',
      shortLabel: 'Timeline',
      shortcut: '3',
      icon: <Calendar className="w-4 h-4" />,
      badge: `${activeProject.timelineItems.length}`,
    },
    {
      id: 'vendors' as ActiveTab,
      label: 'Smart Vendor CRM',
      shortLabel: 'Vendors',
      shortcut: '4',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: `${activeProject.vendors.length}`,
    },
    {
      id: 'ideation' as ActiveTab,
      label: 'Ideation Studio',
      shortLabel: 'Creative',
      shortcut: '5',
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

      {/* ─── Streamlined Primary Navigation Bar ─────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Planning Modules Navigation"
        className="w-full border-b border-vesta-border/60 bg-vesta-midnight/80 backdrop-blur-xl sticky top-16 z-30 transition-all shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-2">
            {/* Module Tabs Segmented Control */}
            <div
              role="tablist"
              aria-label="Event Planning Modules"
              className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar"
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
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesta-iris ${
                      isActive
                        ? 'bg-vesta-surface text-vesta-gold border border-vesta-gold/30 shadow-sm'
                        : 'text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface/50 border border-transparent'
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
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-vesta-gold/20 text-vesta-gold'
                          : 'bg-vesta-card/80 text-vesta-muted'
                      }`}
                    >
                      {tab.badge}
                    </span>
                    <span className="hidden xl:inline-block text-[9px] font-mono text-vesta-muted opacity-80 group-hover:opacity-100 ml-0.5">
                      [{tab.shortcut}]
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Context Summary Breadcrumb */}
            <div className="hidden xl:flex items-center gap-2 text-xs text-vesta-muted shrink-0 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-vesta-surface/80 border border-vesta-border/60 text-vesta-text">
                📍 {activeProject.location.split(',')[0]}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-vesta-surface/80 border border-vesta-border/60 text-vesta-iris">
                👥 {activeProject.guestCount}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-vesta-surface/80 border border-vesta-border/60 font-mono text-vesta-gold">
                💰 {activeProject.currency} {(activeProject.totalBudget / 100000).toFixed(1)}L
              </span>
            </div>
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

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24 text-vesta-muted text-sm font-medium animate-pulse">
                ✦ Loading module...
              </div>
            }
          >
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
          </Suspense>
        </div>
      </main>

      {/* ─── Context AI Copilot Drawer & Export Blueprint Modal (Lazy) ── */}
      <Suspense fallback={null}>
        {isCopilotOpen && (
          <ContextCopilotDrawer
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            project={activeProject}
            readinessMetrics={readinessMetrics}
            onTriggerContingency={triggerContingencyScenario}
            onUpdateContext={updateProjectContext}
          />
        )}

        {isExportModalOpen && (
          <ExportBlueprintModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            project={activeProject}
            readinessMetrics={readinessMetrics}
          />
        )}
      </Suspense>

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
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-vesta-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-vesta-gold" />
              Vesta Event Studio · Enterprise Celebration & Event Planning OS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
