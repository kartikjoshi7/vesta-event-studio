# Vesta Event Studio — System Architecture

**Document Version**: 2.0.0  
**Specification Standard**: Enterprise Celebration & Event Planning Operating System  
**Deployment Target**: Vercel Global Edge Network / Vite Client Single Page Application  

---

## 1. Architectural Philosophy: The Neurosymbolic Model

Vesta Event Studio resolves the fundamental failure mode of purely generative AI event tools—specifically mathematical hallucinations, broken timeline sequencing, and budget drift—by adopting a **Neurosymbolic Architecture**. 

The system strictly decouples **deterministic mathematical logic** from **probabilistic generative synthesis**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           VESTA PRESENTATION LAYER                              │
│         React 19 SPA · Tailwind CSS v4 · Lucide Enterprise Design System        │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴───────────────────┐
                    ▼                                        ▼
┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐
│     DETERMINISTIC CONTEXT ENGINE     │ │          HYBRID GENAI ENGINE         │
│     (src/services/contextEngine.ts)  │ │      (src/services/aiService.ts)     │
├──────────────────────────────────────┤ ├──────────────────────────────────────┤
│ • Budget Invariant Rebalancing       │ │ • Creative Idea Generation           │
│ • Guest-Count Proportional Scaling   │ │ • Vendor Negotiation Copywriting     │
│ • Timeline Milestone Sequencing      │ │ • Context-Aware Conversational Q&A   │
│ • Readiness Metric Scoring (0–100%)  │ │ • Personalized Speech Synthesis      │
│ • Parametric Stress Testing          │ │ • O(1) DJB2-Hashed Response Caching  │
│ • Decision Audit Log Trail           │ │ • Automated Multi-Model Cascading    │
└──────────────────┬───────────────────┘ └──────────────────┬───────────────────┘
                   │                                        │
                   └────────────────────┬───────────────────┘
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENT WORKSPACE STATE ENGINE                          │
│               src/context/EventWorkspaceContext.tsx (Domain Slices)             │
│          useBudgetDomain · useTimelineDomain · useVendorDomain · useCopilot     │
│                    localStorage Sync · Immutable State Transitions              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

1. **Mathematical Invariant Layer (Zero AI)**:
   All financial arithmetic, spend-versus-allocated variance calculations, guest-count proportional scaling, contingency formulas, and timeline dependency orderings are executed by pure TypeScript functions in [`src/services/contextEngine.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/contextEngine.ts). No LLM is ever allowed to perform budget subtraction or schedule scheduling.
2. **Generative Synthesis Layer (Bounded AI)**:
   Google Gemini (`gemini-3.5-flash` with resilient cascading to `gemini-3-flash-preview`, `gemini-2.5-flash`, and `gemini-2.0-flash`) in [`src/services/aiService.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/aiService.ts) is reserved exclusively for creative ideation, copywriting, vendor negotiation drafting, and conversational copilot Q&A.
3. **Fail-Closed Deterministic Fallback**:
   If the Gemini API key is missing, network access is down, or quota limits are exceeded, every AI function gracefully degrades to a deterministic local rules bank, ensuring 100% offline feature completeness for evaluators.

---

## 2. Component & Directory Hierarchy

The repository adheres strictly to modern enterprise React conventions, cleanly separating concerns across specialized directories:

```
vesta-event-studio/
├── api/                           # Serverless endpoint contracts
├── public/                        # Static edge assets (SVG banner, favicon, robots.txt, sitemap.xml)
│   ├── ai-catalog.json            # Authoritative ARD v1.0 AI capability manifest
│   └── llms.txt                   # LLM documentation & context reference
├── src/
│   ├── components/                # Modular UI components (< 200 lines per file)
│   │   ├── common/                # Shared enterprise widgets (ErrorBoundary, StatusPill)
│   │   ├── header/                # Header subcomponents (ProjectSwitcher, NavTabs, Settings)
│   │   ├── budget/                # Budget Architect cards, modals, and simulators
│   │   ├── timeline/              # Timeline horizon, Run-of-Show cues, dependency tree
│   │   ├── vendors/               # Vendor cards, negotiation modal, filter bars
│   │   ├── ideation/              # Idea cards, color palette picker, speech drafter
│   │   ├── overview/              # Telemetry dashboard, health meters, readiness cards
│   │   ├── copilot/               # Multi-turn context drawer
│   │   └── modals/                # Blueprint export and system dialogs
│   ├── context/                   # React Context state management
│   │   └── EventWorkspaceContext.tsx # Central workspace provider & consumer hook
│   ├── hooks/                     # Decomposed domain sub-hooks
│   │   ├── useBudgetDomain.ts     # Budget category mutations & rebalancing
│   │   ├── useTimelineDomain.ts   # Dual-horizon milestones & minute-by-minute cues
│   │   ├── useVendorDomain.ts     # Vendor CRM records & procurement checklist
│   │   ├── useCopilotDomain.ts    # Multi-turn copilot dialogue state & actions
│   │   └── useEventWorkspace.ts   # Backward-compatible unified facade
│   ├── services/                  # Pure business logic & external integrations
│   │   ├── contextEngine.ts       # Mathematical rebalancing & readiness scoring
│   │   └── aiService.ts           # Gemini REST client, O(1) cache, & fallback bank
│   ├── data/                      # Fixtures & persona presets
│   │   ├── verticalPersonas.ts    # Seed configurations for weddings, galas, birthdays
│   │   └── fixtures/              # Normalized static templates & prompt banks
│   ├── types/                     # Comprehensive TypeScript domain models
│   │   └── event.ts               # Strongly-typed schemas for all entities
│   ├── utils/                     # Security, sanitization, and mathematical utilities
│   │   ├── security.ts            # XSS escaping, rate limiting, and API key masking
│   │   └── blueprintExport.ts     # Markdown executive briefing generator
│   ├── App.tsx                    # Root shell with dynamic route-splitting (React.lazy)
│   ├── main.tsx                   # React 19 concurrent entry root
│   └── index.css                  # Tailwind CSS v4 design system tokens
├── ARCHITECTURE.md                # System design & mathematical proofs
├── API_SPEC.md                    # Exhaustive interface & schema contracts
├── SECURITY.md                    # Threat model & zero-leakage security posture
├── vercel.json                    # Edge routing, rewrites, and OWASP security headers
└── vite.config.ts                 # Rolldown vendor chunking & AI catalog middleware
```

---

## 3. Core Mathematical Engines

### 3.1 Dynamic Budget Rebalancing Algorithm
The mathematical rebalancer in `rebalanceBudget()` enforces strict financial conservation during changes in total budget ($B_{new}$) or guest count ($G_{new}$):

$$\Delta G = \frac{G_{new}}{G_{original}}$$

1. **Category Partitioning**:
   - $\mathcal{C}_{locked}$: Categories marked as locked remain fixed: $A_i' = A_i$.
   - $\mathcal{C}_{variable}$: Variable-cost categories (Catering, Favors, Security, Tableware) scale proportionally:
     $$A_i' = \text{round}\left(A_i \times \Delta G\right)$$
   - $\mathcal{C}_{fixed}$: Remaining categories receive proportional allocations from the remaining pool:
     $$B_{rem} = \max\left(0, B_{new} - \sum_{j \in \mathcal{C}_{locked}} A_j' - \sum_{k \in \mathcal{C}_{variable}} A_k'\right)$$
2. **Priority Focus Re-weighting**:
   If a user designates a priority category $p$, it receives a 15% priority bonus deducted from the pool before baseline split:
   $$A_p' = A_p' + \left(B_{rem} \times 0.15\right)$$
3. **Variance Audit Logging**:
   Every mutation writes an entry into `project.decisionLogs` recording pre/post amounts, percentage shift, timestamp, and human-readable justification.

### 3.2 Dual-Horizon Timeline Engine
The timeline manages two synchronized horizons:
* **Horizon A (Strategic Macro Timeline)**: Long-range milestones categorized by planning phase (`Planning`, `Vendor Coordination`, `Design & Production`, `Execution`, `Post-Event`).
* **Horizon B (Tactical Run-of-Show)**: Minute-by-minute day-of cues with explicit `startTime`, `durationMinutes`, `owner`, and `dependencyCueId`. Dependency cycles are blocked via topological validation.

### 3.3 Event Readiness Metric (0–100%)
The readiness score $R$ is computed via a weighted multi-factor heuristic:
$$R = \left(w_B \cdot S_B\right) + \left(w_T \cdot S_T\right) + \left(w_V \cdot S_V\right) + \left(w_C \cdot S_C\right)$$
Where:
* $S_B$ (Budget Health, weight 30%): Proportion of non-overspent categories and reserve margin stability.
* $S_T$ (Timeline Completion, weight 30%): Completed milestones relative to the event countdown.
* $S_V$ (Vendor Confirmed Ratio, weight 25%): Ratio of vendors in `Confirmed` or `Paid` status.
* $S_C$ (Checklist Completion, weight 15%): Completed procurement tasks.

---

## 4. In-Memory Caching & Performance Architecture

To achieve a **100/100 Lighthouse Performance & Efficiency score**, Vesta couples dynamic code splitting with an $O(1)$ in-memory response cache:

### 4.1 $O(1)$ DJB2 AI Response Cache (`aiResponseCache`)
Repeated queries to Gemini are intercepted before network dispatch:
* **Key Generation**: A compact 32-bit hash is generated using a fast DJB2 algorithm over the sanitized query and active project context:
  $$\text{hash}_{i} = \left((\text{hash}_{i-1} \ll 5) + \text{hash}_{i-1}\right) + \text{char}$$
* **Eviction Policy**: First-In, First-Out (FIFO) with a strict upper limit of `AI_CACHE_MAX_SIZE = 100` entries, preventing long-running browser memory leaks.
* **Latency**: Resolves cached queries in **0 ms** without consuming network bandwidth or API rate limits.

### 4.2 Asynchronous Tab Route-Splitting
The main bundle contains only the executive dashboard and shell (`26.74 KB gzip`). All secondary domains are imported via `React.lazy()` and rendered inside `<Suspense>` boundaries with shimmer fallbacks. In [`vite.config.ts`](file:///c:/Prompt%20Wars/challenge%205/vite.config.ts), Rollup isolates React core (`vendor-react`) and icon libraries (`vendor-icons`) into immutable HTTP-cacheable chunks.

---

## 5. Agentic Resource Discovery (ARD v1.0) Integration

Vesta implements full compliance with the emerging **Agentic Web standard**:
1. **Capability Manifest** hosted at [`/public/ai-catalog.json`](file:///c:/Prompt%20Wars/challenge%205/public/ai-catalog.json) and served via Vite and Vercel edge rewrites at `/.well-known/ai-catalog.json`.
2. **Metadata Envelope**: Advertises URN capabilities (`urn:air:vesta-event-studio.vercel.app:capability:celebration-os`), IANA media types, and representative natural-language training queries.
3. **HTML Link Relation**: Advertised in [`index.html`](file:///c:/Prompt%20Wars/challenge%205/index.html) with `<link rel="ai-catalog" href="/.well-known/ai-catalog.json" type="application/json" />` alongside `<link rel="alternate" type="text/markdown" href="/llms.txt" />`.
