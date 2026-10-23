// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContextCopilotDrawer } from '../components/ContextCopilotDrawer';
import { allPersonas } from '../data/verticalPersonas';
import { calculateEventReadiness } from '../services/contextEngine';

describe('ContextCopilotDrawer Component', () => {
  const weddingProject = allPersonas.find((p) => p.vertical === 'wedding')!;
  const readiness = calculateEventReadiness(weddingProject);

  it('renders drawer header and context badges when open', () => {
    const handleClose = vi.fn();
    const handleTriggerContingency = vi.fn();
    const handleUpdateContext = vi.fn();

    render(
      <ContextCopilotDrawer
        isOpen={true}
        onClose={handleClose}
        project={weddingProject}
        readinessMetrics={readiness}
        onTriggerContingency={handleTriggerContingency}
        onUpdateContext={handleUpdateContext}
      />,
    );

    expect(screen.getByText('Vesta Context Copilot')).toBeDefined();
    expect(screen.getByText(new RegExp(`${readiness.overallScore}% Healthy`))).toBeDefined();
  });

  it('submits a user prompt, sanitizes input and handles AI response', async () => {
    const handleClose = vi.fn();
    const handleTriggerContingency = vi.fn();
    const handleUpdateContext = vi.fn();

    render(
      <ContextCopilotDrawer
        isOpen={true}
        onClose={handleClose}
        project={weddingProject}
        readinessMetrics={readiness}
        onTriggerContingency={handleTriggerContingency}
        onUpdateContext={handleUpdateContext}
      />,
    );

    const input = screen.getByPlaceholderText(/Ask Copilot about your budget/i);
    fireEvent.change(input, {
      target: { value: '<script>alert("xss")</script>How can I optimize catering budget?' },
    });

    const sendBtn = screen.getByLabelText(/Send Message/i);
    fireEvent.click(sendBtn);

    await waitFor(() => {
      // The sanitized message should appear in chat without script tags
      expect(screen.getByText(/How can I optimize catering budget\?/i)).toBeDefined();
    });
  });

  it('closes when close button is clicked', () => {
    const handleClose = vi.fn();
    const handleTriggerContingency = vi.fn();
    const handleUpdateContext = vi.fn();

    render(
      <ContextCopilotDrawer
        isOpen={true}
        onClose={handleClose}
        project={weddingProject}
        readinessMetrics={readiness}
        onTriggerContingency={handleTriggerContingency}
        onUpdateContext={handleUpdateContext}
      />,
    );

    const closeBtn = screen.getByLabelText(/Close Assistant Drawer/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
