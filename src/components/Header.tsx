/**
 * @fileoverview Luxury Glassmorphic Command Header for Vesta Event Studio.
 *
 * Provides brand identity, vertical persona quick-switcher, custom event creator modal,
 * real-time readiness health indicator, and AI Engine / API Key configuration modal.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Key,
  Shield,
  RotateCcw,
  CheckCircle2,
  X,
  Cpu,
  Calendar,
  MapPin,
  Users,
  Coins,
  FileText,
  Bot,
  Contrast,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { EventProject, EventVertical } from '../types/event';
import { personaMetadata } from '../data/verticalPersonas';
import { maskApiKey, sanitizeUserInput, validateNumberInput } from '../utils/security';
import type { ReadinessScore } from '../services/contextEngine';

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
  // Modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const eventMenuRef = React.useRef<HTMLDivElement>(null);

  // Close menus & modals on Escape key
  React.useEffect(() => {
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
  React.useEffect(() => {
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

  // API Key local state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vesta_gemini_api_key');
    } catch {
      return null;
    }
  });
  const [apiKeySuccessToast, setApiKeySuccessToast] = useState(false);

  // New Event form state
  const [newTitle, setNewTitle] = useState('');
  const [newVertical, setNewVertical] = useState<EventVertical>('wedding');
  const [newHost, setNewHost] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newGuests, setNewGuests] = useState('150');
  const [newBudget, setNewBudget] = useState('1500000');
  const [newSetting, setNewSetting] = useState<'indoor' | 'outdoor' | 'hybrid'>('hybrid');
  const [newSeason, setNewSeason] = useState<EventProject['season']>('winter');

  // WCAG 2.1 AAA High Contrast Mode state
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vesta_high_contrast_aaa') === 'true';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
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
        // Storage access error
      }
      return next;
    });
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeUserInput(apiKeyInput.trim(), 120);
    if (sanitized) {
      try {
        localStorage.setItem('vesta_gemini_api_key', sanitized);
        setSavedApiKey(sanitized);
        setApiKeyInput('');
        setApiKeySuccessToast(true);
        setTimeout(() => setApiKeySuccessToast(false), 3000);
      } catch {
        // Handle localStorage error
      }
    }
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('vesta_gemini_api_key');
      setSavedApiKey(null);
      setApiKeyInput('');
    } catch {
      // Handle error
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guests = validateNumberInput(newGuests, 1, 100_000, 100);
    const budget = validateNumberInput(newBudget, 10_000, 1_000_000_000, 500_000);

    onCreateProject({
      title: newTitle || `${newHost || 'Private'} ${personaMetadata[newVertical].emoji} Event`,
      vertical: newVertical,
      personaName: newHost || 'Event Host',
      date: newDate || new Date(Date.now() + 60 * 86_400_000).toISOString().split('T')[0],
      location: newLocation || 'Bengaluru, India',
      guestCount: guests,
      totalBudget: budget,
      indoorOutdoor: newSetting,
      season: newSeason,
    });

    setIsNewEventModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewHost('');
    setNewLocation('');
  };

  const score = readinessMetrics.overallScore;
  const scoreColor =
    score >= 80
      ? 'text-vesta-success border-vesta-success/30 bg-vesta-success/10'
      : score >= 60
      ? 'text-vesta-warning border-vesta-warning/30 bg-vesta-warning/10'
      : 'text-vesta-danger border-vesta-danger/30 bg-vesta-danger/10';

  const hasLiveApiKey = Boolean(
    savedApiKey ||
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
        {/* Left: Brand Logo + Unified Event Switcher */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vesta-gold via-vesta-iris to-vesta-foam p-0.5 shadow-md shadow-vesta-gold/10"
              aria-hidden="true"
            >
              <div className="w-full h-full bg-vesta-surface rounded-[9px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-vesta-gold animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-vesta-text via-vesta-gold to-vesta-foam bg-clip-text text-transparent">
                  VESTA
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-vesta-iris/15 text-vesta-iris border border-vesta-iris/30 tracking-wide uppercase">
                  Studio OS
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-vesta-border/80 hidden sm:block" aria-hidden="true" />

          {/* Event Switcher Dropdown */}
          <div ref={eventMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsEventMenuOpen((prev) => !prev)}
              aria-expanded={isEventMenuOpen}
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
                  isEventMenuOpen ? 'rotate-180 text-vesta-iris' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isEventMenuOpen && (
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
                        setIsEventMenuOpen(false);
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
                      setIsEventMenuOpen(false);
                      setIsNewEventModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-vesta-iris/15 hover:bg-vesta-iris/25 text-vesta-iris border border-vesta-iris/30 text-xs font-semibold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Event</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEventMenuOpen(false);
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
        </div>

        {/* Right Actions: Live Readiness + AI Status + Export + AAA + Copilot */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Readiness Score Pill */}
          <div
            role="status"
            aria-label={`Event Readiness Score: ${score} percent`}
            title={`Readiness: ${score}/100 - Budget ${readinessMetrics.budgetHealth}%, Timeline ${readinessMetrics.timelineHealth}%, Vendors ${readinessMetrics.vendorReadiness}%`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur transition-all shadow-sm ${scoreColor}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  score >= 80
                    ? 'bg-vesta-success'
                    : score >= 60
                    ? 'bg-vesta-warning'
                    : 'bg-vesta-danger'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  score >= 80
                    ? 'bg-vesta-success'
                    : score >= 60
                    ? 'bg-vesta-warning'
                    : 'bg-vesta-danger'
                }`}
              />
            </span>
            <span className="font-mono text-xs">{score}%</span>
            <span className="hidden md:inline text-[10px] font-medium opacity-80 pl-1 border-l border-current/20">
              Ready
            </span>
          </div>

          {/* AI Engine Status Pill */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isApiKeyModalOpen}
            aria-label="AI Engine and API Key settings"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesta-iris ${
              hasLiveApiKey
                ? 'bg-vesta-foam/10 text-vesta-foam border-vesta-foam/30 hover:bg-vesta-foam/20'
                : 'bg-vesta-surface text-vesta-muted border-vesta-border/80 hover:text-vesta-text hover:border-vesta-iris/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-vesta-foam" />
            <span className="hidden lg:inline text-xs">
              {hasLiveApiKey ? 'Gemini 2.5' : 'Local AI'}
            </span>
          </button>

          {/* Export Blueprint Button */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              type="button"
              aria-label="Export Event Blueprint"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-vesta-surface hover:bg-vesta-card border border-vesta-border/80 text-vesta-text hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-vesta-foam"
            >
              <FileText className="w-3.5 h-3.5 text-vesta-foam" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* WCAG 2.1 AAA High-Contrast Toggle Button */}
          <button
            onClick={toggleHighContrast}
            type="button"
            aria-pressed={isHighContrast}
            aria-label="Toggle WCAG 2.1 AAA High Contrast Mode"
            title="Toggle WCAG 2.1 AAA High Contrast Mode (>7:1 ratio)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vesta-gold ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-400 shadow-md font-bold'
                : 'bg-vesta-surface text-vesta-muted border-vesta-border/80 hover:text-vesta-text hover:border-yellow-400/40'
            }`}
          >
            <Contrast className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AAA</span>
          </button>

          {/* AI Copilot Button */}
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              type="button"
              aria-label="Open AI Copilot Drawer (Ctrl+K)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 transition-all shadow-md shadow-vesta-iris/20 focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              <Bot className="w-3.5 h-3.5 text-vesta-gold" />
              <span className="hidden sm:inline">Copilot</span>
              <kbd className="hidden md:inline-block px-1 py-0.2 rounded bg-black/30 text-[9px] font-mono text-white/80">
                ⌘K
              </kbd>
            </button>
          )}
        </div>
      </div>

      {/* ─── AI Engine / API Key Modal ────────────────────────────────────── */}
      {isApiKeyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-vesta-iris/15 text-vesta-iris border border-vesta-iris/30">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="api-modal-title" className="text-base font-semibold text-vesta-text">
                    AI Engine & API Key Setup
                  </h2>
                  <p className="text-xs text-vesta-muted mt-0.5">
                    Configure Google Gemini 2.5 Flash or utilize the Smart Context Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                type="button"
                aria-label="Close dialog"
                className="p-1 rounded-lg text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Engine Status Banner */}
            <div className="p-4 rounded-xl bg-vesta-surface/70 border border-vesta-border/80 flex items-start gap-3">
              <div className="mt-0.5 text-vesta-gold">
                {hasLiveApiKey ? (
                  <CheckCircle2 className="w-5 h-5 text-vesta-success" />
                ) : (
                  <Cpu className="w-5 h-5 text-vesta-foam" />
                )}
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-vesta-text flex items-center gap-2">
                  <span>
                    Current Mode: {hasLiveApiKey ? 'Gemini 2.5 Flash (Live)' : 'Smart Context Engine (Zero Latency)'}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                      hasLiveApiKey
                        ? 'bg-vesta-success/20 text-vesta-success'
                        : 'bg-vesta-foam/20 text-vesta-foam'
                    }`}
                  >
                    Active
                  </span>
                </div>
                <p className="text-vesta-muted text-[11px] leading-relaxed">
                  {hasLiveApiKey
                    ? `Live Gemini REST calls enabled with key: ${maskApiKey(savedApiKey || '')}. Automatic smart local fallback remains active if network errors occur.`
                    : '100% offline uptime enabled. The Smart Context Engine generates deterministic, context-tailored negotiation scripts, contingency blueprints, and recommendations without requiring an API key.'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label
                  htmlFor="gemini-key-input"
                  className="block text-xs font-semibold text-vesta-text mb-1.5"
                >
                  Custom Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    id="gemini-key-input"
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSyD..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:outline-none focus:ring-2 focus:ring-vesta-iris focus:border-transparent font-mono"
                  />
                </div>
                <p className="text-[11px] text-vesta-muted mt-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-vesta-success" />
                  Stored locally in your browser. Never exposed or logged in plain text.
                </p>
              </div>

              {apiKeySuccessToast && (
                <div className="p-2.5 rounded-lg bg-vesta-success/15 border border-vesta-success/30 text-vesta-success text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gemini API Key successfully updated!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {savedApiKey ? (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-xs text-vesta-danger hover:underline font-medium"
                  >
                    Remove Saved Key
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!apiKeyInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-iris to-vesta-pine text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md shadow-vesta-iris/20"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </form>

            {/* Danger Zone: Reset Demo Data */}
            <div className="border-t border-vesta-border/60 pt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-vesta-text">Reset Demo Personas</p>
                <p className="text-[11px] text-vesta-muted">Restore default Wedding, Birthday & Summit data</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all demo data back to clean initial states?')) {
                    onResetDemoData();
                    setIsApiKeyModalOpen(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-vesta-muted hover:text-vesta-danger hover:bg-vesta-danger/10 border border-vesta-border hover:border-vesta-danger/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Custom Event Modal ────────────────────────────────────── */}
      {isNewEventModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-event-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
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
                onClick={() => setIsNewEventModalOpen(false)}
                type="button"
                aria-label="Close dialog"
                className="p-1 rounded-lg text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Vertical Selection */}
              <div>
                <label className="block text-xs font-semibold text-vesta-text mb-2">
                  Event Vertical Blueprint
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['wedding', 'birthday', 'community'] as EventVertical[]).map((vert) => {
                    const isSel = newVertical === vert;
                    const meta = personaMetadata[vert];
                    return (
                      <button
                        key={vert}
                        type="button"
                        onClick={() => setNewVertical(vert)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSel
                            ? 'bg-vesta-iris/15 border-vesta-iris text-vesta-text shadow-sm'
                            : 'bg-vesta-surface border-vesta-border text-vesta-muted hover:text-vesta-text'
                        }`}
                      >
                        <div className="text-lg">{meta.emoji}</div>
                        <div className="text-xs font-semibold capitalize mt-1 text-vesta-text">
                          {vert}
                        </div>
                        <div className="text-[10px] text-vesta-muted truncate mt-0.5">
                          {meta.tagline}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Host */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-title" className="block text-xs font-medium text-vesta-text mb-1">
                    Event Title
                  </label>
                  <input
                    id="new-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Royal Heritage Sangeet"
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-host" className="block text-xs font-medium text-vesta-text mb-1">
                    Host / Client Name
                  </label>
                  <input
                    id="new-host"
                    type="text"
                    value={newHost}
                    onChange={(e) => setNewHost(e.target.value)}
                    placeholder="e.g. Priya & Arjun"
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-date" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-vesta-gold" />
                    Target Date
                  </label>
                  <input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-loc" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-vesta-rose" />
                    City / Venue
                  </label>
                  <input
                    id="new-loc"
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Udaipur, Rajasthan"
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  />
                </div>
              </div>

              {/* Guest Count & Total Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-guests" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-vesta-iris" />
                    Guest Count
                  </label>
                  <input
                    id="new-guests"
                    type="number"
                    min="1"
                    max="100000"
                    value={newGuests}
                    onChange={(e) => setNewGuests(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text font-mono focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-budget" className="block text-xs font-medium text-vesta-text mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-vesta-foam" />
                    Total Budget (₹)
                  </label>
                  <input
                    id="new-budget"
                    type="number"
                    min="10000"
                    step="10000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text font-mono focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  />
                </div>
              </div>

              {/* Setting & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-setting" className="block text-xs font-medium text-vesta-text mb-1">
                    Physical Setting
                  </label>
                  <select
                    id="new-setting"
                    value={newSetting}
                    onChange={(e) => setNewSetting(e.target.value as 'indoor' | 'outdoor' | 'hybrid')}
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  >
                    <option value="indoor">Indoor (Ballroom/Hall)</option>
                    <option value="outdoor">Outdoor (Lawn/Courtyard)</option>
                    <option value="hybrid">Hybrid (Indoor + Canopy/Courtyard)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-season" className="block text-xs font-medium text-vesta-text mb-1">
                    Season
                  </label>
                  <select
                    id="new-season"
                    value={newSeason}
                    onChange={(e) => setNewSeason(e.target.value as EventProject['season'])}
                    className="w-full px-3 py-2 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text focus:ring-2 focus:ring-vesta-iris focus:outline-none"
                  >
                    <option value="winter">Winter</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="monsoon">Monsoon (Rain Contingency)</option>
                    <option value="autumn">Autumn</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-vesta-border/60">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-vesta-gold to-vesta-rose text-vesta-midnight hover:opacity-95 transition-opacity shadow-lg shadow-vesta-gold/20"
                >
                  Scaffold Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
