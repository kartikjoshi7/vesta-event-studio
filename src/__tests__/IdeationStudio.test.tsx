// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IdeationStudio } from '../components/IdeationStudio';
import { allPersonas } from '../data/verticalPersonas';

describe('IdeationStudio Component', () => {
  const weddingProject = allPersonas.find((p) => p.vertical === 'wedding')!;

  it('renders persona context constraints and ideas grid', () => {
    const handleApply = vi.fn();
    const handleAdd = vi.fn();

    render(
      <IdeationStudio
        project={weddingProject}
        onApplyIdea={handleApply}
        onAddGeneratedIdeas={handleAdd}
      />,
    );

    expect(screen.getByText(/Personalized Ideation/i)).toBeDefined();
    expect(screen.getByText(new RegExp(`${weddingProject.guestCount} Guests`))).toBeDefined();
    expect(screen.getByText(/Zero-Waste Luxury Decor/i)).toBeDefined();
  });

  it('filters ideas by category when filter pill is clicked', () => {
    const handleApply = vi.fn();
    const handleAdd = vi.fn();

    render(
      <IdeationStudio
        project={weddingProject}
        onApplyIdea={handleApply}
        onAddGeneratedIdeas={handleAdd}
      />,
    );

    const cateringFilter = screen.getByRole('button', { name: /Catering & F&B/i });
    fireEvent.click(cateringFilter);

    expect(cateringFilter.getAttribute('aria-pressed')).toBe('true');
  });

  it('triggers onApplyIdea callback when 1-Click Add to Plan is clicked', () => {
    const handleApply = vi.fn();
    const handleAdd = vi.fn();

    render(
      <IdeationStudio
        project={weddingProject}
        onApplyIdea={handleApply}
        onAddGeneratedIdeas={handleAdd}
      />,
    );

    const addButtons = screen.getAllByRole('button', { name: /1-Click Add to Plan/i });
    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);
    expect(handleApply).toHaveBeenCalledTimes(1);
  });

  it('renders curated color swatches and copywriter tools', () => {
    const handleApply = vi.fn();
    const handleAdd = vi.fn();

    render(
      <IdeationStudio
        project={weddingProject}
        onApplyIdea={handleApply}
        onAddGeneratedIdeas={handleAdd}
      />,
    );

    expect(screen.getByText(/Curated Event Color Palette/i)).toBeDefined();
    expect(screen.getByText(/AI Invitation & Toast Speech Copywriter/i)).toBeDefined();
    expect(screen.getByRole('tab', { name: /Guest Invitation/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Host Toast Speech/i })).toBeDefined();
  });
});
