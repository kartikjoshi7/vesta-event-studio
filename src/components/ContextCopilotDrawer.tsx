/**
 * @fileoverview Context AI Copilot Drawer for Vesta Event Studio.
 *
 * Slide-over interactive AI assistant with live project context awareness,
 * pre-built strategic prompts, chat history, and direct 1-click plan actions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Bot,
  User,
  X,
  Send,
  Cpu,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { EventProject } from '../types/event';
import { sanitizeUserInput } from '../utils/security';
import { askContextAssistant } from '../services/aiService';
import type { ReadinessScore } from '../services/contextEngine';

let msgSequence = 0;
function generateMsgId(prefix: string): string {
  msgSequence += 1;
  return `${prefix}-${msgSequence}-${Math.random().toString(36).slice(2, 7)}`;
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface ContextCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: EventProject;
  readinessMetrics: ReadinessScore;
  onTriggerContingency: (scenario: 'weather' | 'budget-cut' | 'guest-surge' | 'vendor-drop') => void;
  onUpdateContext: (updates: { priorityFocus?: string }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  engineMode?: 'gemini-live' | 'smart-context-engine';
  suggestedAction?: string;
  actionTrigger?: 'weather' | 'budget-cut' | 'rebalance-catering' | 'rebalance-decor';
}

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAsking]);

  const contextPromptChips = [
    'How can I trim 10% from this budget without hurting guest experience?',
    'Identify critical path risks in my Day-Of Run-of-Show.',
    'Suggest weather backup steps for my venue.',
    'What due-diligence questions should I ask my catering vendor?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    const cleanQuery = sanitizeUserInput(textToSend, 300);
    if (!cleanQuery || isAsking) return;

    const userMsg: ChatMessage = {
      id: generateMsgId('user'),
      sender: 'user',
      content: cleanQuery,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAsking(true);

    try {
      const response = await askContextAssistant(project, cleanQuery);

      let actionTrigger: ChatMessage['actionTrigger'];
      if (cleanQuery.toLowerCase().includes('weather') || cleanQuery.toLowerCase().includes('rain')) {
        actionTrigger = 'weather';
      } else if (cleanQuery.toLowerCase().includes('trim') || cleanQuery.toLowerCase().includes('cut') || cleanQuery.toLowerCase().includes('budget')) {
        actionTrigger = 'budget-cut';
      }

      const assistantMsg: ChatMessage = {
        id: generateMsgId('assistant'),
        sender: 'assistant',
        content: response.reply,
        timestamp: getFormattedTime(),
        engineMode: response.engineMode,
        suggestedAction: response.suggestedAction,
        actionTrigger,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId('assistant'),
          sender: 'assistant',
          content: 'I encountered an issue synthesizing the response. Please try again.',
          timestamp: getFormattedTime(),
          engineMode: 'smart-context-engine',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleExecuteAction = (trigger: ChatMessage['actionTrigger']) => {
    if (trigger === 'weather') {
      onTriggerContingency('weather');
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId('sys'),
          sender: 'assistant',
          content: '⚡ Weather contingency plan activated! Setting changed to indoor and waterproof AV buffers injected into timeline.',
          timestamp: getFormattedTime(),
        },
      ]);
    } else if (trigger === 'budget-cut') {
      onTriggerContingency('budget-cut');
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId('sys'),
          sender: 'assistant',
          content: '⚡ 15% budget cut contingency executed! Unlocked categories rebalanced automatically.',
          timestamp: getFormattedTime(),
        },
      ]);
    } else if (trigger === 'rebalance-catering') {
      onUpdateContext({ priorityFocus: 'catering' });
      setMessages((prev) => [
        ...prev,
        {
          id: generateMsgId('sys'),
          sender: 'assistant',
          content: '⚡ Rebalanced budget with priority focus on Culinary & Catering.',
          timestamp: getFormattedTime(),
        },
      ]);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const totalSpent = project.budgetCategories.reduce((s, c) => s + c.spentAmount, 0);
  const remainingBuffer = project.totalBudget - totalSpent;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Context AI Assistant Drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg h-full bg-vesta-card border-l border-vesta-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* ─── Drawer Header ────────────────────────────────────────────── */}
        <div className="p-5 border-b border-vesta-border bg-vesta-surface/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-vesta-gold to-vesta-iris flex items-center justify-center p-0.5 shadow-md">
                <div className="w-full h-full bg-vesta-surface rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-vesta-gold" />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-bold text-vesta-text flex items-center gap-2">
                  Vesta Context Copilot
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30 font-mono">
                    Live
                  </span>
                </h2>
                <p className="text-[11px] text-vesta-muted">
                  Adaptive AI grounded in your active celebration state
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'assistant',
                      content: `Refreshed chat session for "${project.title}". How can I help you plan?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      engineMode: 'smart-context-engine',
                    },
                  ])
                }
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Assistant Drawer"
                className="p-1.5 rounded-lg text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Context Awareness Strip */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-vesta-card border border-vesta-border/80 text-[11px]">
            <div>
              <span className="text-[10px] text-vesta-muted block">Readiness</span>
              <span className="font-mono font-bold text-vesta-success">
                {readinessMetrics.overallScore}% Healthy
              </span>
            </div>
            <div>
              <span className="text-[10px] text-vesta-muted block">Reserve Buffer</span>
              <span className="font-mono font-bold text-vesta-gold">
                {project.currency} {remainingBuffer.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-vesta-muted block">Engine</span>
              <span className="font-mono text-vesta-foam flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Hybrid 2.5
              </span>
            </div>
          </div>
        </div>

        {/* ─── Chat Thread Messages ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-vesta-iris to-vesta-pine text-white rounded-br-none shadow-md'
                        : 'bg-vesta-surface border border-vesta-border text-vesta-text rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* 1-Click Action Suggestion pill if present */}
                  {msg.actionTrigger && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleExecuteAction(msg.actionTrigger)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vesta-gold/15 hover:bg-vesta-gold/25 border border-vesta-gold/30 text-vesta-gold text-[11px] font-semibold transition-all shadow-sm"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>
                          {msg.actionTrigger === 'weather'
                            ? 'Apply Weather Contingency Plan Now'
                            : 'Execute 15% Budget Cut Now'}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-1 text-[10px] text-vesta-muted font-mono">
                    <span>{msg.timestamp}</span>
                    {msg.engineMode && (
                      <span className="opacity-75">· {msg.engineMode}</span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-vesta-surface text-vesta-muted border border-vesta-border flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isAsking && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-vesta-iris/20 text-vesta-iris border border-vesta-iris/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-vesta-surface border border-vesta-border text-vesta-muted text-xs flex items-center gap-2">
                <span>Analyzing project context & synthesizing recommendation…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Footer with Context Chips & Input ─────────────────────────── */}
        <div className="p-4 border-t border-vesta-border bg-vesta-surface/80 space-y-3">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {contextPromptChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                disabled={isAsking}
                className="px-2.5 py-1 rounded-lg text-[10px] bg-vesta-card hover:bg-vesta-border border border-vesta-border text-vesta-muted hover:text-vesta-text whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <label htmlFor="copilot-input" className="sr-only">
              Ask Copilot
            </label>
            <input
              id="copilot-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot about your budget, timeline, or vendors…"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-vesta-card border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isAsking}
              aria-label="Send Message"
              className="p-2.5 rounded-xl bg-vesta-iris text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md shadow-vesta-iris/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
