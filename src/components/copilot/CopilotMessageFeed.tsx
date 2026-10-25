/**
 * @fileoverview Chat message feed rendering for Context AI Copilot Drawer.
 */

import React from 'react';
import { Sparkles, User, ArrowRight } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  engineMode?: 'gemini-live' | 'smart-context-engine';
  suggestedAction?: string;
  actionTrigger?: 'weather' | 'budget-cut' | 'rebalance-catering' | 'rebalance-decor';
}

interface CopilotMessageFeedProps {
  messages: ChatMessage[];
  isAsking: boolean;
  onExecuteAction: (trigger: ChatMessage['actionTrigger']) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const CopilotMessageFeed: React.FC<CopilotMessageFeedProps> = ({
  messages,
  isAsking,
  onExecuteAction,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        return (
          <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
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
              {msg.actionTrigger && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onExecuteAction(msg.actionTrigger)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vesta-gold/15 hover:bg-vesta-gold/25 border border-vesta-gold/30 text-vesta-gold text-[11px] font-semibold transition-all shadow-sm"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>
                      {msg.actionTrigger === 'weather' ? 'Apply Weather Contingency Plan Now' : 'Execute 15% Budget Cut Now'}
                    </span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 px-1 text-[10px] text-vesta-muted font-mono">
                <span>{msg.timestamp}</span>
                {msg.engineMode && <span className="opacity-75">· {msg.engineMode}</span>}
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
  );
};
