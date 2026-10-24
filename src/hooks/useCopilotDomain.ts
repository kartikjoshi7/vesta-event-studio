/**
 * @fileoverview Copilot Domain Hook for Vesta Event Studio.
 *
 * Manages conversational state, message history, suggested prompts,
 * and asynchronous Q&A execution against the hybrid AI engine.
 */

import { useState, useCallback } from 'react';
import type { EventProject } from '../types/event';
import { sanitizeUserInput } from '../utils/security';
import { askContextAssistant, type AssistantResponse } from '../services/aiService';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  engineMode?: 'gemini-live' | 'smart-context-engine';
  suggestedAction?: AssistantResponse['suggestedAction'];
}

export interface UseCopilotDomainReturn {
  messages: CopilotMessage[];
  isAsking: boolean;
  sendMessage: (query: string) => Promise<void>;
  clearHistory: () => void;
}

let msgSeq = 0;
function nextId(prefix: string): string {
  msgSeq += 1;
  return `${prefix}-${msgSeq}-${Date.now().toString(36)}`;
}

function timeNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function useCopilotDomain(activeProject: EventProject): UseCopilotDomainReturn {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am your Vesta Context Copilot. I have full real-time awareness of "${activeProject.title}" (${activeProject.guestCount} guests, ${activeProject.currency} ${activeProject.totalBudget.toLocaleString()} budget, ${activeProject.indoorOutdoor} setting in ${activeProject.season}). How can I assist your planning today?`,
      timestamp: timeNow(),
      engineMode: 'smart-context-engine',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const sendMessage = useCallback(
    async (rawQuery: string) => {
      const sanitized = sanitizeUserInput(rawQuery, 2048);
      if (!sanitized.trim() || isAsking) return;

      const userMsg: CopilotMessage = {
        id: nextId('user'),
        sender: 'user',
        content: sanitized,
        timestamp: timeNow(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsAsking(true);

      try {
        const response = await askContextAssistant(activeProject, sanitized);
        const assistantMsg: CopilotMessage = {
          id: nextId('bot'),
          sender: 'assistant',
          content: response.reply,
          timestamp: timeNow(),
          engineMode: response.engineMode,
          suggestedAction: response.suggestedAction,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const fallbackMsg: CopilotMessage = {
          id: nextId('bot-err'),
          sender: 'assistant',
          content: 'I encountered an unexpected issue synthesizing your response. Please review your project metrics or try again.',
          timestamp: timeNow(),
          engineMode: 'smart-context-engine',
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsAsking(false);
      }
    },
    [activeProject, isAsking],
  );

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: nextId('welcome-reset'),
        sender: 'assistant',
        content: `Workspace conversation refreshed for "${activeProject.title}". Ask anything about your budget, timeline, or vendors!`,
        timestamp: timeNow(),
        engineMode: 'smart-context-engine',
      },
    ]);
  }, [activeProject.title]);

  return {
    messages,
    isAsking,
    sendMessage,
    clearHistory,
  };
}
