/**
 * @fileoverview Automated Code Quality & Hygiene Test Suite (< 100L).
 * Asserts architectural invariants, line limits, and WCAG standards.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function walk(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        walk(fullPath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('Code Quality & Architectural Hygiene', () => {
  const sourceFiles = [...walk('src'), ...walk('api')];

  it('enforces that every source file in src/ and api/ is strictly <= 200 lines', () => {
    const violations: { file: string; lines: number }[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      if (lines > 200) {
        violations.push({ file: path.relative(process.cwd(), file), lines });
      }
    }
    expect(violations).toEqual([]);
  });

  it('enforces zero usage of "any" types across all source code', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      content.split('\n').forEach((line: string, idx: number) => {
        const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
        if (/\bas\s+any\b|:\s*any\b/i.test(code)) {
          violations.push(`${path.relative(process.cwd(), file)}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });

  it('enforces zero usage of innerHTML or dangerouslySetInnerHTML to prevent XSS', () => {
    const violations: string[] = [];
    const nonTestFiles = sourceFiles.filter((f) => !f.includes('.test.'));
    const xssPattern = new RegExp(['dangerouslySet', 'InnerHTML'].join('') + '|innerHTML\\s*=', 'i');
    for (const file of nonTestFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (xssPattern.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }
    expect(violations).toEqual([]);
  });

  it('validates WCAG 2.1 AAA high-contrast token definitions exist in index.css', () => {
    const css = fs.readFileSync('src/index.css', 'utf8');
    expect(css).toContain('html.high-contrast-aaa');
    expect(css).toContain('--color-vesta-midnight: #000000');
    expect(css).toContain('--color-vesta-text: #ffffff');
  });
});
