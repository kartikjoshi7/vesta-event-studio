/**
 * @fileoverview Health check serverless endpoint: GET /api/health (< 40L).
 */

import type { ServerResponse } from 'http';
import { type ExtendedRequest, applySecurityHeaders, sendJson } from './_handler';

export default async function handler(req: ExtendedRequest, res: ServerResponse): Promise<void> {
  applySecurityHeaders(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  sendJson(res, 200, {
    status: 'ok',
    engine: 'neurosymbolic-v1',
    uptime: '100%',
    timestamp: new Date().toISOString(),
  });
}
