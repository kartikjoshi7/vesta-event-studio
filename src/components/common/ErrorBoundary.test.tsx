// @vitest-environment jsdom
import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Helper component that throws on demand
const ProblemChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Simulated lifecycle render exception');
  }
  return <div>Healthy Child Content</div>;
};

// Stateful parent to test reset recovery
const RecoverableHarness: React.FC = () => {
  const [hasError, setHasError] = useState(true);

  return (
    <ErrorBoundary onReset={() => setHasError(false)}>
      <ProblemChild shouldThrow={hasError} />
    </ErrorBoundary>
  );
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suppress expected console.error during deliberate error throwing in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders healthy children normally when no exception is thrown', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Healthy Child Content')).toBeDefined();
  });

  it('catches render errors and displays accessible recovery UI with error message', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeDefined();
    expect(screen.getByText('Workspace View Encountered an Issue')).toBeDefined();
    expect(screen.getByText('Simulated lifecycle render exception')).toBeDefined();
    expect(screen.getByRole('button', { name: /Reset View/i })).toBeDefined();
  });

  it('renders custom fallback element when provided prop is set', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error Recovery</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('custom-fallback')).toBeDefined();
    expect(screen.getByText('Custom Error Recovery')).toBeDefined();
  });

  it('recovers cleanly when Reset View is clicked and onReset triggers state update', () => {
    render(<RecoverableHarness />);

    expect(screen.getByText('Workspace View Encountered an Issue')).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /Reset View/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('Healthy Child Content')).toBeDefined();
  });
});
