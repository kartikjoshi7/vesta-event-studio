/**
 * @fileoverview Automated Test Suite for Vercel Serverless api/* endpoints (< 110L).
 */

import { describe, it, expect, vi } from 'vitest';
import healthHandler from '../../api/health';
import planHandler from '../../api/plan';
import chatHandler from '../../api/chat';
import ideasHandler from '../../api/ideas';
import { weddingPersona } from '../data/personas/weddingPersona';
import type { ExtendedRequest } from '../../api/_handler';
import type { ServerResponse } from 'http';

function createMockRes() {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let body = '';

  const res = {
    get statusCode() { return statusCode; },
    set statusCode(code: number) { statusCode = code; },
    setHeader: vi.fn((key: string, val: string) => { headers[key] = val; }),
    end: vi.fn((chunk?: string) => { if (chunk) body = chunk; }),
    getJson: () => JSON.parse(body || '{}'),
    headers,
  } as unknown as ServerResponse & { getJson: () => Record<string, unknown> };

  return res;
}

describe('Vercel Serverless Functions (api/*)', () => {
  it('GET /api/health returns 200 OK and neurosymbolic status', async () => {
    const req = { method: 'GET', headers: {}, socket: {} } as ExtendedRequest;
    const res = createMockRes();

    await healthHandler(req, res);
    expect(res.statusCode).toBe(200);
    const data = res.getJson();
    expect(data.status).toBe('ok');
    expect(data.engine).toBe('neurosymbolic-v1');
    expect(data.uptime).toBe('100%');
  });

  it('POST /api/plan computes deterministic budget allocations and readiness', async () => {
    const req = {
      method: 'POST',
      headers: {},
      socket: {},
      body: { project: weddingPersona, targetBudget: 3000000, targetGuests: 300 },
    } as unknown as ExtendedRequest;
    const res = createMockRes();

    await planHandler(req, res);
    expect(res.statusCode).toBe(200);
    const data = res.getJson() as { success: boolean; plan: { totalBudget: number; guestCount: number; readinessScore: { overallScore: number } } };
    expect(data.success).toBe(true);
    expect(data.plan.totalBudget).toBe(3000000);
    expect(data.plan.guestCount).toBe(300);
    expect(data.plan.readinessScore.overallScore).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/chat returns context response in offline fallback mode', async () => {
    const req = {
      method: 'POST',
      headers: {},
      socket: {},
      body: { project: weddingPersona, message: 'What is our budget status?' },
    } as unknown as ExtendedRequest;
    const res = createMockRes();

    await chatHandler(req, res);
    expect(res.statusCode).toBe(200);
    const data = res.getJson();
    expect(data.reply).toBeDefined();
    expect(typeof data.reply).toBe('string');
  });

  it('POST /api/ideas returns contextual event ideas list', async () => {
    const req = {
      method: 'POST',
      headers: {},
      socket: {},
      body: { project: weddingPersona, prompt: 'Royal floral decor' },
    } as unknown as ExtendedRequest;
    const res = createMockRes();

    await ideasHandler(req, res);
    expect(res.statusCode).toBe(200);
    const data = res.getJson() as { ideas: unknown[] };
    expect(Array.isArray(data.ideas)).toBe(true);
    expect(data.ideas.length).toBeGreaterThan(0);
  });
});
