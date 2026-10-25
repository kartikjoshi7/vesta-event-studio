/**
 * @fileoverview Primary workspace navigation bar for Vesta Event Studio (< 110L).
 */

import React from 'react';
import { LayoutDashboard, Coins, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import type { EventProject } from '../../types/event';
import type { ReadinessScore } from '../../services/contextEngine';

export type ActiveTab = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideation';

interface WorkspaceNavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProject: EventProject;
  readinessMetrics: ReadinessScore;
}

export const WorkspaceNavbar: React.FC<WorkspaceNavbarProps> = ({
  activeTab,
  setActiveTab,
  activeProject,
  readinessMetrics,
}) => {
  const formattedBudget = activeProject.currency === 'INR'
    ? (activeProject.totalBudget >= 100000 ? `${(activeProject.totalBudget / 100000).toFixed(1)}L` : `${Math.round(activeProject.totalBudget / 1000)}k`)
    : (activeProject.totalBudget >= 1000000 ? `${(activeProject.totalBudget / 1000000).toFixed(1)}M` : `${Math.round(activeProject.totalBudget / 1000)}k`);

  const navTabs = [
    { id: 'overview' as ActiveTab, label: 'Executive Overview', shortcut: '1', icon: <LayoutDashboard className="w-4 h-4" />, badge: `${readinessMetrics.overallScore}%` },
    { id: 'budget' as ActiveTab, label: 'Budget Architect', shortcut: '2', icon: <Coins className="w-4 h-4" />, badge: `${activeProject.currency} ${formattedBudget}` },
    { id: 'timeline' as ActiveTab, label: 'Timeline & Run-of-Show', shortcut: '3', icon: <Calendar className="w-4 h-4" />, badge: `${activeProject.timelineItems.length}` },
    { id: 'vendors' as ActiveTab, label: 'Smart Vendor CRM', shortcut: '4', icon: <ShieldCheck className="w-4 h-4" />, badge: `${activeProject.vendors.length}` },
    { id: 'ideation' as ActiveTab, label: 'Ideation Studio', shortcut: '5', icon: <Sparkles className="w-4 h-4" />, badge: `${activeProject.savedIdeas.length}` },
  ];

  return (
    <nav role="navigation" aria-label="Planning Modules Navigation" className="w-full border-b border-vesta-border/60 bg-vesta-midnight/80 backdrop-blur-xl sticky top-16 z-30 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2">
          <div role="tablist" aria-label="Event Planning Modules" className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
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
                    isActive ? 'bg-vesta-surface text-vesta-gold border border-vesta-gold/30 shadow-sm' : 'text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface/50 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-vesta-gold' : 'text-vesta-muted group-hover:text-vesta-text'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${isActive ? 'bg-vesta-gold/20 text-vesta-gold' : 'bg-vesta-card/80 text-vesta-muted'}`}>{tab.badge}</span>
                  <span className="hidden xl:inline-block text-[9px] font-mono text-vesta-muted opacity-80 ml-0.5">[{tab.shortcut}]</span>
                </button>
              );
            })}
          </div>
          <div className="hidden xl:flex items-center gap-2 text-xs text-vesta-muted shrink-0 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-vesta-surface/80 border border-vesta-border/60 text-vesta-text">📍 {activeProject.location.split(',')[0]}</span>
            <span className="px-2 py-0.5 rounded-md bg-vesta-surface/80 border border-vesta-border/60 text-vesta-iris">👥 {activeProject.guestCount}</span>
            <span className="px-2 py-0.5 rounded-md bg-vesta-surface/80 border border-vesta-border/60 font-mono text-vesta-gold">💰 {activeProject.currency} {formattedBudget}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
