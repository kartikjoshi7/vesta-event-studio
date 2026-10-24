/**
 * @fileoverview AI Settings & Key Configuration Modal for Vesta Event Studio (Portaled).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Key, Shield, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { maskApiKey } from '../../utils/security';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDemoData,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vesta_gemini_api_key');
    } catch {
      return null;
    }
  });
  const [apiKeySuccessToast, setApiKeySuccessToast] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    if (cleanKey) {
      try {
        localStorage.setItem('vesta_gemini_api_key', cleanKey);
        sessionStorage.setItem('vesta_gemini_api_key', cleanKey);
        setSavedApiKey(cleanKey);
        setApiKeyInput('');
        setApiKeySuccessToast(true);
        setTimeout(() => setApiKeySuccessToast(false), 3000);
      } catch {
        // Storage error handling
      }
    }
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('vesta_gemini_api_key');
      sessionStorage.removeItem('vesta_gemini_api_key');
      setSavedApiKey(null);
    } catch {
      // Storage error handling
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md my-auto rounded-2xl bg-vesta-card border border-vesta-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-vesta-iris/15 border border-vesta-iris/30 flex items-center justify-center text-vesta-iris">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 id="api-key-modal-title" className="text-base font-semibold text-vesta-text">
                AI Engine Configuration
              </h2>
              <p className="text-xs text-vesta-muted">Google Gemini 3.5 Flash Model Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-1 rounded-lg text-vesta-muted hover:text-vesta-text hover:bg-vesta-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl bg-vesta-surface/80 border border-vesta-border/60 p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-vesta-pine font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Client-Side Zero-Leakage Architecture</span>
          </div>
          <p className="text-vesta-muted leading-relaxed">
            Your Gemini API key is stored strictly in your browser session/localStorage. It is never sent to any intermediary server.
          </p>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div>
            <label htmlFor="gemini-key-input" className="block text-xs font-medium text-vesta-text mb-1.5">
              Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={savedApiKey ? maskApiKey(savedApiKey) : 'AIzaSy...'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-vesta-surface border border-vesta-border text-xs text-vesta-text placeholder-vesta-muted focus:ring-2 focus:ring-vesta-iris focus:outline-none transition-all"
            />
            <p className="text-[11px] text-vesta-muted mt-1">
              Get a free API key from{' '}
              <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-vesta-iris hover:underline">
                Google AI Studio
              </a>
            </p>
          </div>

          {apiKeySuccessToast && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-vesta-pine/10 border border-vesta-pine/30 text-xs text-vesta-pine">
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
                onClick={onClose}
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
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-vesta-muted hover:text-vesta-danger hover:bg-vesta-danger/10 border border-vesta-border hover:border-vesta-danger/30 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
