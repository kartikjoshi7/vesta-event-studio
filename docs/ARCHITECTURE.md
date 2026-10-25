# Vesta Event Studio — System Architecture

**Document Version**: 3.0.0  
**Specification Standard**: Enterprise Celebration & Event Planning OS  
**Deployment Target**: Vercel Global Edge Network & Serverless Functions (`api/`) + Vite SPA Client  

---

## 1. Architectural Philosophy: The Neurosymbolic Model & Triple-Redundancy

Vesta Event Studio resolves the fundamental failure mode of purely generative AI event tools—specifically mathematical hallucinations, broken timeline sequencing, and budget drift—by adopting a **Neurosymbolic Architecture** backed by **Triple-Redundancy AI Failover**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VESTA PRESENTATION LAYER                              │
│         React 19 SPA · Tailwind CSS v4 · Lucide Enterprise Design System        │
│              Strictly Decomposed Modular Architecture (< 180L per file)         │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│     DETERMINISTIC CONTEXT ENGINE     │        │     TRIPLE-REDUNDANCY GENAI ENGINE   │
│     (src/services/engine/*)          │        │     (api/* + src/services/ai/*)      │
├──────────────────────────────────────┤        ├──────────────────────────────────────┤
│ • Budget Invariant Rebalancing       │        │ Tier 1: Vercel Serverless api/*      │
│   (engine/budgetRebalancing.ts)      │        │         Server-isolated API keys     │
│ • Guest-Count Proportional Scaling   │        │ Tier 2: Direct Gemini 3.5 Flash REST │
│ • 3-Pillar Readiness Scoring (0–100%)│        │         Client-side key with failover│
│   (engine/readinessCalculator.ts)    │        │ Tier 3: Zero-Downtime Deterministic  │
│ • 4-Scenario Contingency Simulator   │        │         Local Context Engine         │
│   (engine/contingencyEngine.ts)      │        │ • O(1) FIFO Response Cache (100 Max) │
│ • Auditable Context Decision Logs    │        │ • Cascading Model Fallback Matrix    │
└──────────────────┬───────────────────┘        └──────────────────┬───────────────────┘
                   │                                               │
                   └───────────────────────┬───────────────────────┘
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENT WORKSPACE STATE ENGINE                          │
│                    src/context/EventWorkspaceContext.tsx                        │
│          useBudgetDomain · useTimelineDomain · useVendorDomain · useCopilot     │
│             useProjectPersistence · localStorage Sync · Zero Prop Drilling      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Strict Invariant Segregation
1. **Mathematical Invariant Layer (Zero AI)**:
   All financial arithmetic, spend-versus-allocated variance calculations, guest-count proportional scaling, contingency formulas, and timeline dependency orderings are executed by pure TypeScript functions in `src/services/engine/`. No LLM is ever allowed to perform budget subtraction or schedule calculations.
2. **Generative Synthesis Layer (Bounded AI)**:
   Google Gemini (`gemini-3.5-flash` with resilient cascading to `gemini-3-flash-preview` and `gemini-2.5-flash`) is reserved exclusively for creative ideation, copywriting, vendor negotiation drafting, and conversational copilot Q&A.
3. **Fail-Closed Triple Redundancy**:
   - Primary: `/api/*` Vercel Serverless Function proxying Gemini using server-side `GEMINI_API_KEY`.
   - Secondary: Client-side Gemini REST call using user-configured key from session storage.
   - Tertiary: Deterministic local rule engine ensuring 100% offline feature completeness without an API key.

---

## 2. Directory Hierarchy & Clean Separation of Concerns

```
vesta-event-studio/
├── api/                           # Vercel Serverless Functions (< 100L each)
│   ├── _handler.ts                # Shared rate-limiting, CORS & security handler
│   ├── health.ts                  # GET /api/health
│   ├── plan.ts                    # POST /api/plan
│   ├── chat.ts                    # POST /api/chat
│   └── ideas.ts                   # POST /api/ideas
├── docs/                          # Enterprise Governance Documentation
│   ├── ARCHITECTURE.md            # System topology & design patterns
│   ├── SECURITY.md                # OWASP compliance, zero-trust storage
│   ├── ACCESSIBILITY.md           # WCAG 2.1 AAA compliance matrix
│   ├── TESTING.md                 # Test suite documentation & coverage thresholds
│   └── DEPLOYMENT.md              # Vercel edge deployment guide
├── public/                        # Static assets, manifests & agentic discovery
│   ├── .well-known/ai-catalog.json# Machine-readable AI capability manifest
│   ├── llms.txt & llms-full.txt   # LLM agent context discovery files
│   └── robots.txt & sitemap.xml   # Search crawler indexing controls
├── scripts/                       # Build & Code Quality verification
│   └── lint.js                    # Automated <200L & hygiene verification script
├── src/                           # Client Application Source (< 180L each)
│   ├── components/                # Decomposed UI coordinators & subcomponents
│   ├── context/                   # React Context state providers
│   ├── data/                      # Fixtures, vertical personas & allocation rules
│   ├── hooks/                     # Domain-driven hooks (Budget, Timeline, Vendors)
│   ├── services/                  # Business engine & AI modules
│   ├── types/                     # Strict TypeScript interfaces
│   └── utils/                     # Sanitization, rate-limiting & export helpers
└── vercel.json                    # Edge caching, serverless routing & security headers
```
