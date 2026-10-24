/**
 * @fileoverview Unit tests for blueprint markdown export generator.
 */

import { describe, it, expect } from 'vitest';
import { generateMarkdownBrief } from './blueprintExport';
import { allPersonas } from '../data/verticalPersonas';
import { calculateEventReadiness } from '../services/contextEngine';

describe('blueprintExport utility', () => {
  it('generates structured markdown containing title, budget, and readiness metrics', () => {
    const project = allPersonas[0];
    const metrics = calculateEventReadiness(project);
    const md = generateMarkdownBrief(project, metrics);

    expect(md).toContain(`# ${project.title} — Executive Blueprint`);
    expect(md).toContain('1. Executive Summary');
    expect(md).toContain('2. Day-Of Run-of-Show');
    expect(md).toContain('3. Financial Allocation Matrix');
    expect(md).toContain('4. Vendor Registry & Procurement');
    expect(md).toContain(project.personaName);
    expect(md).toContain(project.location);
    expect(md).toContain(project.totalBudget.toLocaleString());
  });
});
