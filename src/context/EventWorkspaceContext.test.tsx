// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { EventWorkspaceProvider } from './EventWorkspaceContext';
import { useEventWorkspaceContext } from './useEventWorkspaceContext';
import type { UseEventWorkspaceReturn } from '../hooks/useEventWorkspace';
import { allPersonas } from '../data/verticalPersonas';

const ConsumerComponent: React.FC = () => {
  const { activeProject, selectVerticalProject } = useEventWorkspaceContext();

  return (
    <div>
      <span data-testid="active-vertical">{activeProject.vertical}</span>
      <span data-testid="active-title">{activeProject.title}</span>
      <button
        type="button"
        onClick={() => selectVerticalProject('birthday')}
        data-testid="switch-btn"
      >
        Switch
      </button>
    </div>
  );
};

describe('EventWorkspaceContext & useEventWorkspaceContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('throws descriptive error when hook is invoked outside EventWorkspaceProvider', () => {
    // Suppress React logging error about thrown exception
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useEventWorkspaceContext());
    }).toThrow(/useEventWorkspaceContext must be used within an <EventWorkspaceProvider>/);
  });

  it('provides default workspace state to child components within provider', () => {
    render(
      <EventWorkspaceProvider>
        <ConsumerComponent />
      </EventWorkspaceProvider>,
    );

    expect(screen.getByTestId('active-vertical').textContent).toBe('wedding');
  });

  it('allows consumers to dispatch workspace actions and reflect updated state', () => {
    render(
      <EventWorkspaceProvider>
        <ConsumerComponent />
      </EventWorkspaceProvider>,
    );

    const switchBtn = screen.getByTestId('switch-btn');
    fireEvent.click(switchBtn);

    expect(screen.getByTestId('active-vertical').textContent).toBe('birthday');
  });

  it('accepts an explicit custom mock workspace value via provider props', () => {
    const mockSelect = vi.fn();
    const mockValue: UseEventWorkspaceReturn = {
      projects: allPersonas,
      activeProjectId: allPersonas[0].id,
      activeProject: {
        ...allPersonas[0],
        title: 'Custom Mock Summit 2026',
        vertical: 'community',
      },
      readinessMetrics: {
        overallScore: 99,
        budgetHealth: 99,
        timelineHealth: 99,
        vendorReadiness: 99,
        criticalAlerts: [],
        nextBestActions: ['Review sponsorship packet'],
      },
      selectVerticalProject: mockSelect,
      createNewProject: vi.fn(),
      updateProjectContext: vi.fn(),
      toggleCategoryLock: vi.fn(),
      updateCategorySpend: vi.fn(),
      addBudgetCategory: vi.fn(),
      updateTimelineStatus: vi.fn(),
      addTimelineItem: vi.fn(),
      toggleVendorChecklistItem: vi.fn(),
      updateVendorStatus: vi.fn(),
      addVendor: vi.fn(),
      applyIdeaToPlan: vi.fn(),
      addGeneratedIdeas: vi.fn(),
      triggerContingencyScenario: vi.fn(),
      resetDemoData: vi.fn(),
    };

    render(
      <EventWorkspaceProvider value={mockValue}>
        <ConsumerComponent />
      </EventWorkspaceProvider>,
    );

    expect(screen.getByTestId('active-title').textContent).toBe('Custom Mock Summit 2026');
    expect(screen.getByTestId('active-vertical').textContent).toBe('community');

    const switchBtn = screen.getByTestId('switch-btn');
    fireEvent.click(switchBtn);
    expect(mockSelect).toHaveBeenCalledWith('birthday');
  });
});
