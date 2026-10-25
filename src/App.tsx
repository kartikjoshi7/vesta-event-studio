/**
 * @fileoverview Main Application Root for Vesta Event Studio (< 130L Coordinator).
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useEventWorkspace } from './hooks/useEventWorkspace';
import { EventWorkspaceProvider } from './context/EventWorkspaceContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/Header';
import { WorkspaceNavbar, type ActiveTab } from './components/navigation/WorkspaceNavbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import './index.css';

const BudgetArchitect = lazy(() => import('./components/BudgetArchitect').then((m) => ({ default: m.BudgetArchitect })));
const TimelineEngine = lazy(() => import('./components/TimelineEngine').then((m) => ({ default: m.TimelineEngine })));
const VendorCRM = lazy(() => import('./components/VendorCRM').then((m) => ({ default: m.VendorCRM })));
const IdeationStudio = lazy(() => import('./components/IdeationStudio').then((m) => ({ default: m.IdeationStudio })));
const ContextCopilotDrawer = lazy(() => import('./components/ContextCopilotDrawer').then((m) => ({ default: m.ContextCopilotDrawer })));
const ExportBlueprintModal = lazy(() => import('./components/ExportBlueprintModal').then((m) => ({ default: m.ExportBlueprintModal })));

export function App() {
  const workspace = useEventWorkspace();
  const { projects, activeProject, readinessMetrics, selectVerticalProject, createNewProject, updateProjectContext, toggleCategoryLock, updateCategorySpend, addBudgetCategory, updateTimelineStatus, addTimelineItem, toggleVendorChecklistItem, updateVendorStatus, addVendor, applyIdeaToPlan, addGeneratedIdeas, triggerContingencyScenario, resetDemoData } = workspace;

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setIsCopilotOpen((p) => !p); }
      else if (e.key === '1') setActiveTab('overview');
      else if (e.key === '2') setActiveTab('budget');
      else if (e.key === '3') setActiveTab('timeline');
      else if (e.key === '4') setActiveTab('vendors');
      else if (e.key === '5') setActiveTab('ideation');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <EventWorkspaceProvider value={workspace}>
        <div className="min-h-screen bg-vesta-midnight text-vesta-text flex flex-col font-sans selection:bg-vesta-iris selection:text-white relative">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-vesta-gold text-vesta-midnight font-bold rounded-xl shadow-2xl focus:outline-none">Skip to main content</a>
          <Header activeProject={activeProject} projects={projects} readinessMetrics={readinessMetrics} onSelectVertical={selectVerticalProject} onCreateProject={createNewProject} onResetDemoData={resetDemoData} onOpenExportModal={() => setIsExportModalOpen(true)} onOpenCopilot={() => setIsCopilotOpen(true)} />
          <WorkspaceNavbar activeTab={activeTab} setActiveTab={setActiveTab} activeProject={activeProject} readinessMetrics={readinessMetrics} />

          <main id="main-content" role="main" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="focus:outline-none">
              <ErrorBoundary key={activeTab}>
                {activeTab === 'overview' && <OverviewDashboard project={activeProject} readinessMetrics={readinessMetrics} onUpdateContext={updateProjectContext} onTriggerContingency={triggerContingencyScenario} />}
                <Suspense fallback={<div className="flex items-center justify-center py-24 text-vesta-muted text-sm font-medium animate-pulse">✦ Loading module...</div>}>
                  {activeTab === 'budget' && <BudgetArchitect project={activeProject} onToggleLock={toggleCategoryLock} onUpdateCategorySpend={updateCategorySpend} onAddCategory={addBudgetCategory} onUpdateContext={updateProjectContext} />}
                  {activeTab === 'timeline' && <TimelineEngine project={activeProject} onUpdateStatus={updateTimelineStatus} onAddTimelineItem={addTimelineItem} />}
                  {activeTab === 'vendors' && <VendorCRM project={activeProject} onToggleChecklistItem={toggleVendorChecklistItem} onUpdateVendorStatus={updateVendorStatus} onAddVendor={addVendor} />}
                  {activeTab === 'ideation' && <IdeationStudio project={activeProject} onApplyIdea={applyIdeaToPlan} onAddGeneratedIdeas={addGeneratedIdeas} />}
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>

          <Suspense fallback={null}>
            {isCopilotOpen && <ErrorBoundary><ContextCopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} project={activeProject} readinessMetrics={readinessMetrics} onTriggerContingency={triggerContingencyScenario} onUpdateContext={updateProjectContext} /></ErrorBoundary>}
            {isExportModalOpen && <ErrorBoundary><ExportBlueprintModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} project={activeProject} readinessMetrics={readinessMetrics} /></ErrorBoundary>}
          </Suspense>

          <footer role="contentinfo" className="w-full border-t border-vesta-border bg-vesta-surface/30 backdrop-blur-md py-4 text-center text-xs text-vesta-muted mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-vesta-success animate-pulse" /><span>Active: <strong className="text-vesta-text">{activeProject.title}</strong> ({activeProject.guestCount} Guests · {activeProject.currency} {activeProject.totalBudget.toLocaleString()})</span></div>
              <div className="flex items-center gap-3"><span className="flex items-center gap-1.5 text-[11px] font-medium text-vesta-muted"><span className="w-1.5 h-1.5 rounded-full bg-vesta-gold" />Vesta Event Studio · Enterprise Celebration & Event Planning OS</span></div>
            </div>
          </footer>
        </div>
      </EventWorkspaceProvider>
    </ErrorBoundary>
  );
}

export default App;
