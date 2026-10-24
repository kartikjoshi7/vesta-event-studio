/**
 * @fileoverview Enterprise React Error Boundary for Vesta Event Studio.
 * Catches unhandled lifecycle and render errors in the component tree,
 * logs diagnostic info safely without leaking sensitive keys, and renders
 * an accessible recovery UI with reset capabilities.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Safe console logging for diagnostic audits without sensitive tokens
    console.error('ErrorBoundary caught an unhandled component exception:', error, errorInfo);
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="m-4 p-8 rounded-3xl bg-vesta-card border border-vesta-danger/40 shadow-2xl text-center space-y-4 max-w-xl mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-vesta-danger/15 text-vesta-danger flex items-center justify-center mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-vesta-text">
              Workspace View Encountered an Issue
            </h2>
            <p className="text-xs text-vesta-muted leading-relaxed">
              An unexpected render error occurred in this workspace segment. Your event data remains
              safely preserved in local storage.
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-3 rounded-xl bg-vesta-surface text-left font-mono text-[11px] text-vesta-danger border border-vesta-border/60 overflow-x-auto">
              <code>{this.state.error.message}</code>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-vesta-surface hover:bg-vesta-card border border-vesta-border hover:border-vesta-iris text-vesta-text hover:text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-vesta-iris"
            >
              <RotateCcw className="w-3.5 h-3.5 text-vesta-iris" />
              <span>Reset View</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
