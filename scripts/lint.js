#!/usr/bin/env node
/**
 * @fileoverview Fast Code Quality & Architecture Hygiene verification script (< 100L).
 * Verifies that:
 * 1. Every TypeScript file in src/ and api/ is strictly <= 200 lines.
 * 2. Zero usage of `any` types in source code.
 * 3. Zero usage of `innerHTML` or `dangerouslySetInnerHTML`.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIRS = ['src', 'api'];
const MAX_LINES = 200;
let errors = 0;

function walk(dir, fileList = []) {
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

const allFiles = ROOT_DIRS.flatMap((d) => walk(d));
console.log(`🔍 Auditing ${allFiles.length} files across src/ and api/ for enterprise code hygiene...`);

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(process.cwd(), file);

  // 1. Line count check
  if (lines.length > MAX_LINES) {
    console.error(`❌ [Line Count] ${relPath} exceeds ${MAX_LINES} lines (${lines.length} lines)`);
    errors++;
  }

  // 2. Unsafe innerHTML check (production source files)
  if (!file.includes('.test.') && /dangerouslySetInnerHTML|innerHTML\s*=/i.test(content)) {
    console.error(`❌ [XSS Risk] ${relPath} contains innerHTML or dangerouslySetInnerHTML`);
    errors++;
  }

  // 3. Strict any check in code (excluding comments)
  lines.forEach((line, idx) => {
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    if (/\bas\s+any\b|:\s*any\b/i.test(code)) {
      console.error(`❌ [Any Type] ${relPath}:${idx + 1} contains 'any' type: "${line.trim()}"`);
      errors++;
    }
  });
}

if (errors > 0) {
  console.error(`\n❌ Failed: ${errors} code hygiene violations found.`);
  process.exit(1);
}

console.log(`✅ All ${allFiles.length} files strictly <= ${MAX_LINES} lines with 0 'any' types and 0 XSS risks!`);
process.exit(0);
