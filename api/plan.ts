/**
 * @fileoverview Deterministic event plan generation endpoint: POST /api/plan (< 80L).
 */

import type { ServerResponse } from 'http';
import { type ExtendedRequest, applySecurityHeaders, parseJsonBody, sendJson, checkServerRateLimit } from './_handler';
import { rebalanceBudgetForContext } from '../src/services/engine/budgetRebalancing';
import { calculateEventReadiness } from '../src/services/engine/readinessCalculator';
import type { EventProject } from '../src/types/event';

export default async function handler(req: ExtendedRequest, res: ServerResponse): Promise<void> {
  applySecurityHeaders(res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (req.method !== 'POST') { sendJson(res, 405, { error: 'Method not allowed. Use POST.' }); return; }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
  if (!checkServerRateLimit(String(ip), 40, 60_000)) {
    sendJson(res, 429, { error: 'Rate limit exceeded. Please wait a minute.' });
    return;
  }

  const body = await parseJsonBody<{ project: EventProject; targetBudget?: number; targetGuests?: number }>(req);
  if (!body || !body.project) {
    sendJson(res, 400, { error: 'Missing event project payload.' });
    return;
  }

  const { project, targetBudget, targetGuests } = body;
  const budget = targetBudget || project.totalBudget;
  const guests = targetGuests || project.guestCount;

  const rebalance = rebalanceBudgetForContext(project, budget, guests);
  const updatedProject = { ...project, totalBudget: budget, guestCount: guests, budgetCategories: rebalance.updatedCategories };
  const readiness = calculateEventReadiness(updatedProject);

  sendJson(res, 200, {
    success: true,
    plan: {
      totalBudget: budget,
      guestCount: guests,
      budgetCategories: rebalance.updatedCategories,
      readinessScore: readiness,
      decisionLog: rebalance.decisionLog,
      warnings: rebalance.warnings,
    },
  });
}
