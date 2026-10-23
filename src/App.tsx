/**
 * @fileoverview Phase 1 Diagnostic Status Screen for Vesta Event Studio.
 *
 * Confirms that all core modules are loaded and functional. This is a
 * temporary screen that will be replaced by the full UI in Phase 2.
 */

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Shield,
  Database,
  Brain,
  Bot,
} from 'lucide-react';
import './index.css';

// ─── Module imports for verification ────────────────────────────────────────

import type { EventProject } from './types/event';
import { sanitizeUserInput, validateNumberInput, maskApiKey, safeJsonParse } from './utils/security';
import { allPersonas, personaMetadata, allocationRulesByVertical } from './data/verticalPersonas';
import { rebalanceBudgetForContext, calculateEventReadiness, generateContingencyPlan } from './services/contextEngine';
import { generatePersonalizedIdeas, askContextAssistant } from './services/aiService';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ModuleCheck {
  name: string;
  icon: React.ReactNode;
  status: 'pass' | 'fail' | 'loading';
  detail: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

function App() {
  const [checks, setChecks] = useState<ModuleCheck[]>([]);
  const [phase, setPhase] = useState<'checking' | 'done'>('checking');

  useEffect(() => {
    let isMounted = true;

    async function executeDiagnostics() {
      const results: ModuleCheck[] = [];

      // 1. Types module
      try {
        const sample: EventProject = allPersonas[0];
        const hasRequiredFields =
          sample.id && sample.title && sample.vertical && sample.budgetCategories.length > 0;
        results.push({
          name: 'Types & Domain Model',
          icon: <Database size={20} />,
          status: hasRequiredFields ? 'pass' : 'fail',
          detail: hasRequiredFields
            ? `EventProject interface validated — ${Object.keys(sample).length} fields`
            : 'Missing required fields on EventProject',
        });
      } catch (e) {
        results.push({ name: 'Types & Domain Model', icon: <Database size={20} />, status: 'fail', detail: String(e) });
      }

      // 2. Security utilities
      try {
        const xss = sanitizeUserInput('<script>alert("xss")</script>Hello World');
        const num = validateNumberInput('250', 1, 10000, 100);
        const masked = maskApiKey('AIzaSyD1234567890abcdef');
        const parsed = safeJsonParse('[1,2,3]', []);
        const allPass = xss === 'Hello World' && num === 250 && masked.includes('****') && parsed.length === 3;
        results.push({
          name: 'Security Utilities',
          icon: <Shield size={20} />,
          status: allPass ? 'pass' : 'fail',
          detail: allPass
            ? 'XSS sanitizer, numeric validator, key masker, JSON parser — all passing'
            : `Some checks failed: xss="${xss}" num=${num} masked="${masked}" parsed=${JSON.stringify(parsed)}`,
        });
      } catch (e) {
        results.push({ name: 'Security Utilities', icon: <Shield size={20} />, status: 'fail', detail: String(e) });
      }

      // 3. Vertical personas
      try {
        const verticals = allPersonas.map((p) => p.vertical);
        const hasAll = verticals.includes('wedding') && verticals.includes('birthday') && verticals.includes('community');
        const metaOk = personaMetadata.wedding && personaMetadata.birthday && personaMetadata.community;
        const rulesOk = allocationRulesByVertical.wedding.length > 0;
        results.push({
          name: 'Vertical Personas & Data',
          icon: <Sparkles size={20} />,
          status: hasAll && metaOk && rulesOk ? 'pass' : 'fail',
          detail: hasAll
            ? `3 verticals loaded: ${allPersonas.map((p) => `${personaMetadata[p.vertical].emoji} ${p.title}`).join(' | ')}`
            : 'Missing verticals',
        });
      } catch (e) {
        results.push({ name: 'Vertical Personas & Data', icon: <Sparkles size={20} />, status: 'fail', detail: String(e) });
      }

      // 4. Context engine
      try {
        const wedding = allPersonas.find((p) => p.vertical === 'wedding')!;
        const rebalance = rebalanceBudgetForContext(wedding, 2000000, 200);
        const readiness = calculateEventReadiness(wedding);
        const contingency = generateContingencyPlan(wedding, 'weather');
        const engineOk =
          rebalance.updatedCategories.length > 0 &&
          readiness.overallScore >= 0 &&
          contingency.adjustments.length > 0;
        results.push({
          name: 'Context Decision Engine',
          icon: <Brain size={20} />,
          status: engineOk ? 'pass' : 'fail',
          detail: engineOk
            ? `Rebalance: ${rebalance.updatedCategories.length} categories | Readiness: ${readiness.overallScore}/100 | Contingency: ${contingency.adjustments.length} actions`
            : 'Engine returned invalid data',
        });
      } catch (e) {
        results.push({ name: 'Context Decision Engine', icon: <Brain size={20} />, status: 'fail', detail: String(e) });
      }

      // 5. AI service (local fallback)
      try {
        const wedding = allPersonas.find((p) => p.vertical === 'wedding')!;
        const ideas = await generatePersonalizedIdeas(wedding);
        const assistant = await askContextAssistant(wedding, 'What is my budget status?');
        const aiOk = ideas.length > 0 && assistant.reply.length > 0;
        results.push({
          name: 'AI Service (Hybrid Engine)',
          icon: <Bot size={20} />,
          status: aiOk ? 'pass' : 'fail',
          detail: aiOk
            ? `${ideas.length} ideas generated | Assistant mode: ${assistant.engineMode} | Reply: ${assistant.reply.slice(0, 60)}…`
            : 'AI service returned empty results',
        });
      } catch (e) {
        results.push({ name: 'AI Service (Hybrid Engine)', icon: <Bot size={20} />, status: 'fail', detail: String(e) });
      }

      if (isMounted) {
        setChecks(results);
        setPhase('done');
      }
    }

    void executeDiagnostics();

    return () => {
      isMounted = false;
    };
  }, []);

  const passCount = checks.filter((c) => c.status === 'pass').length;
  const allPassed = phase === 'done' && passCount === checks.length && checks.length > 0;

  return (
    <div className="min-h-dvh bg-vesta-midnight flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-vesta-gold via-vesta-iris to-vesta-foam bg-clip-text text-transparent">
            Vesta Event Studio
          </h1>
          <p className="text-vesta-muted mt-2 text-sm tracking-wide uppercase">
            Phase 1 — Architecture Diagnostic
          </p>
        </div>

        {/* Status card */}
        <div className="bg-vesta-card border border-vesta-border rounded-2xl p-6 shadow-2xl">
          {phase === 'checking' && checks.length === 0 ? (
            <div className="flex items-center justify-center gap-3 py-8 text-vesta-muted">
              <Loader2 size={24} className="animate-spin" />
              <span>Running diagnostics…</span>
            </div>
          ) : (
            <div className="space-y-4">
              {checks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-vesta-surface/50 border border-vesta-border/50"
                >
                  <div className="mt-0.5 shrink-0">
                    {check.status === 'pass' ? (
                      <CheckCircle size={20} className="text-vesta-success" />
                    ) : check.status === 'fail' ? (
                      <XCircle size={20} className="text-vesta-danger" />
                    ) : (
                      <Loader2 size={20} className="text-vesta-muted animate-spin" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-vesta-iris">{check.icon}</span>
                      <span className="font-semibold text-vesta-text text-sm">{check.name}</span>
                    </div>
                    <p className="text-xs text-vesta-muted mt-1 break-words">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {phase === 'done' && (
            <div className={`mt-6 p-4 rounded-xl text-center text-sm font-medium ${
              allPassed
                ? 'bg-vesta-success/10 text-vesta-success border border-vesta-success/20'
                : 'bg-vesta-danger/10 text-vesta-danger border border-vesta-danger/20'
            }`}>
              {allPassed
                ? `✅ All ${passCount} modules verified — Phase 1 complete. Ready for Phase 2.`
                : `❌ ${checks.length - passCount} module(s) failed. Review errors above.`}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-vesta-muted/50 mt-6">
          Vesta Event Studio v0.1.0 · GenAI-Powered Celebration OS · Phase 1 Architecture
        </p>
      </div>
    </div>
  );
}

export default App;
