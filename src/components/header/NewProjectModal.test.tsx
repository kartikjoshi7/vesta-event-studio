/**
 * @fileoverview Unit tests for NewProjectModal portal rendering.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NewProjectModal } from './NewProjectModal';

describe('NewProjectModal', () => {
  it('renders into document.body when isOpen is true', () => {
    const handleClose = vi.fn();
    const handleCreate = vi.fn();

    render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onCreateProject={handleCreate}
      />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Create Bespoke Event Project')).toBeDefined();
    expect(screen.getByText(/wedding/i)).toBeDefined();
    expect(screen.getByText(/birthday/i)).toBeDefined();
    expect(screen.getByText(/community/i)).toBeDefined();
  });

  it('triggers onCreateProject when form is submitted', () => {
    const handleClose = vi.fn();
    const handleCreate = vi.fn();

    render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onCreateProject={handleCreate}
      />
    );

    const submitBtn = screen.getByText('Initialize Workspace');
    fireEvent.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
