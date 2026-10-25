/**
 * @fileoverview Context AI Copilot Drawer Coordinator for Vesta Event Studio (< 140L).
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bot, X, RotateCcw, Cpu, Send } from 'lucide-react';
import type { EventProject } from '../types/event';
import { sanitizeUserInput } from '../utils/security';
import { askContextAssistant } from '../services/aiService';
import type { ReadinessScore } from '../services/contextEngine';
import { CopilotMessageFeed, type ChatMessage } from './copilot/CopilotMessageFeed';
import { CopilotPromptChips } from './copilot/CopilotPromptChips';

interface ContextCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: EventProject;
  readinessMetrics: ReadinessScore;
  onTriggerContingency: (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => void;
  onUpdateContext: (updates: { priorityFocus?: string }) => void;
}

const contextPromptChips = [
  'How can I trim 10% from this budget without hurting guest experience?',
  'Identify critical path risks in my Day-Of Run-of-Show.',
  'Suggest weather backup steps for my venue.',
  'What due-diligence questions should I ask my catering vendor?',
];

export const ContextCopilotDrawer: React.FC<ContextCopilotDrawerProps> = ({
  isOpen,
  onClose,
  project,
  readinessMetrics,
  onTriggerContingency,
  onUpdateContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am your Vesta Context Copilot. I have full real-time awareness of "${project.title}" (${project.guestCount} guests, ${project.currency} ${project.totalBudget.toLocaleString()} budget, ${project.indoorOutdoor} setting in ${project.season}). How can I assist your planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engineMode: 'smart-context-engine',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAsking]);

  const handleSend = async (queryText?: string) => {
    const clean = sanitizeUserInput(queryText || inputQuery, 300);
    if (!clean || isAsking) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', content: clean, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAsking(true);

    try {
      const response = await askContextAssistant(project, clean);
      let trigger: ChatMessage['actionTrigger'];
      if (clean.toLowerCase().includes('weather') || clean.toLowerCase().includes('rain')) trigger = 'weather';
      else if (clean.toLowerCase().includes('trim') || clean.toLowerCase().includes('cut')) trigger = 'budget-cut';

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engineMode: response.engineMode,
        suggestedAction: response.suggestedAction,
        actionTrigger: trigger,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, sender: 'assistant', content: 'Encountered an issue synthesizing response. Please try again.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleExecuteAction = (trigger: ChatMessage['actionTrigger']) => {
    if (trigger === 'weather') onTriggerContingency('weather');
    else if (trigger === 'budget-cut') onTriggerContingency('budget-cut');
    else if (trigger === 'rebalance-catering') onUpdateContext({ priorityFocus: 'catering' });
    setMessages((prev) => [...prev, { id: `sys-${Date.now()}`, sender: 'assistant', content: `⚡ Applied action: ${trigger}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  if (!isOpen || typeof document === 'undefined') return null;
  const spent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Context AI Assistant Drawer" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-full bg-vesta-card border-l border-vesta-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b border-vesta-border bg-vesta-surface/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-vesta-gold to-vesta-iris flex items-center justify-center p-0.5 shadow-md">
                <div className="w-full h-full bg-vesta-surface rounded-[10px] flex items-center justify-center"><Bot className="w-4 h-4 text-vesta-gold" /></div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-vesta-text flex items-center gap-2">Vesta Context Copilot <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30 font-mono">Live</span></h2>
                <p className="text-[11px] text-vesta-muted">Adaptive AI grounded in your active celebration state</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setMessages([{ id: 'welcome', sender: 'assistant', content: `Refreshed chat for "${project.title}".`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])} title="Reset Chat" className="p-2 rounded-xl text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors focus:outline-none focus:ring-2 focus:ring-vesta-iris"><RotateCcw className="w-4 h-4" /></button>
              <button type="button" onClick={onClose} aria-label="Close Assistant Drawer" className="p-2 rounded-xl text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors focus:outline-none focus:ring-2 focus:ring-vesta-iris"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-vesta-card border border-vesta-border/80 text-[11px]">
            <div><span className="text-[10px] text-vesta-muted block">Readiness</span><span className="font-mono font-bold text-vesta-success">{readinessMetrics.overallScore}% Healthy</span></div>
            <div><span className="text-[10px] text-vesta-muted block">Reserve</span><span className="font-mono font-bold text-vesta-gold">{project.currency} {(project.totalBudget - spent).toLocaleString()}</span></div>
            <div><span className="text-[10px] text-vesta-muted block">Engine</span><span className="font-mono text-vesta-foam flex items-center gap-1"><Cpu className="w-3 h-3" /> Hybrid 3.5</span></div>
          </div>
        </div>

        <CopilotMessageFeed messages={messages} isAsking={isAsking} onExecuteAction={handleExecuteAction} messagesEndRef={messagesEndRef} />

        <div className="p-4 border-t border-vesta-border bg-vesta-surface/80 space-y-3">
          <CopilotPromptChips chips={contextPromptChips} isAsking={isAsking} onSelectChip={handleSend} />
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <label htmlFor="copilot-input" className="sr-only">Ask Copilot</label>
            <input id="copilot-input" type="text" value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} placeholder="Ask Copilot about your budget, timeline, or vendors…" className="flex-1 px-3.5 py-2.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:outline-none focus:ring-2 focus:ring-vesta-iris" />
            <button type="submit" disabled={!inputQuery.trim() || isAsking} aria-label="Send Message" className="p-2.5 rounded-xl bg-vesta-iris text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
