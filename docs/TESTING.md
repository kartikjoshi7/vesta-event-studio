# Vesta Event Studio — Test Strategy & Quality Assurance

**Test Runner**: Vitest 5 + JSDOM + @testing-library/react  
**Automation Goal**: 100% Pass Rate · Zero Flaky Tests · Zero Warning Leaks  

---

## 1. Test Architecture & Coverage Matrix

| Test Suite | File | Focus Area |
| :--- | :--- | :--- |
| **Deterministic Engine** | `src/services/contextEngine.test.ts` | Budget invariant rebalancing, readiness scores (0-100), contingency rules |
| **Hybrid GenAI Engine** | `src/services/aiService.test.ts` | Gemini cascading failover, prompt generation, O(1) response caching |
| **Workspace Hook Facade**| `src/hooks/useEventWorkspace.test.ts` | Project persistence, state mutations, contingency updates, demo resets |
| **End-to-End Readiness** | `src/__tests__/EndToEndReadiness.test.ts` | Multi-step user workflow simulation (from initial budget to Day-Of execution) |
| **Serverless Endpoints** | `src/__tests__/ServerlessApi.test.ts` | Health check, plan computation, chat proxy, and ideas endpoints |
| **Code Quality Hygiene** | `src/__tests__/CodeQualityHygiene.test.ts` | File line counts (<= 200L), zero `any`, zero `innerHTML`, WCAG contrast |
| **Error Boundary** | `src/components/common/ErrorBoundary.test.tsx` | Crash resilience, reload recovery workflow, UI fallback states |
| **UI Portals & Modals** | `src/components/header/NewProjectModal.test.tsx` | Document-body portal mounting, focus traps, form validations |
| **Export Engine** | `src/utils/blueprintExport.test.ts` | Markdown executive briefs, JSON state export serialization |
| **Security Hardening** | `src/utils/security.test.ts` | XSS sanitization, number clamping, API key masking, rate limiting |

---

## 2. Code Quality & Hygiene Gates

Every code change must pass three rigorous quality gates:

```bash
# 1. Lint and File Size Audit (asserts <= 200 lines and zero any types)
npm run lint

# 2. Strict TypeScript Typecheck (zero errors across 70+ files)
npm run typecheck

# 3. Full Test Suite (100% pass rate)
npm test
```

### Coverage Threshold Targets
* **Statements / Lines**: > 95%
* **Functions**: > 95%
* **Branches**: > 90%
