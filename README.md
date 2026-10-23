# Vesta Event Studio ✦
### Enterprise Celebration & Event Planning Operating System

![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.x%20Strict-blue?style=flat-square&logo=typescript)
![React 19](https://img.shields.io/badge/React-19%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Vitest Passing](https://img.shields.io/badge/Vitest-39%2F39%20Passing-success?style=flat-square&logo=vitest)
![WCAG AAA](https://img.shields.io/badge/WCAG-2.1%20AAA%20Compliant-gold?style=flat-square)
![OWASP Hardened](https://img.shields.io/badge/OWASP-Security%20Hardened-green?style=flat-square)
![Repo Size](https://img.shields.io/badge/Repo%20Size-%3C%201%20MB%20(291%20KB)-brightgreen?style=flat-square)

**GitHub Repository:** [https://github.com/kartikjoshi7/vesta-event-studio](https://github.com/kartikjoshi7/vesta-event-studio)  
**Live Production URL:** *(to be updated upon Vercel deployment)*

---

## 1. Executive Overview & Chosen Verticals

Event planning is plagued by fragmented tools: spreadsheets for budgets, chat threads for vendor contracts, calendar apps for schedules, and generic chatbots that lack spatial, cultural, or financial awareness. **Vesta Event Studio** is an enterprise-grade Event Planning Operating System that unifies financial governance, critical-path scheduling, vendor relationship management, and generative context synthesis into an integrated, zero-latency reactive workspace.

Rather than generic prompts, Vesta is grounded in specific event dynamics. It ships with out-of-the-box first-class support for three distinct celebration verticals:

### 1. Weddings — *Aarav & Meera's Royal Heritage Wedding*
* **Profile**: Multi-day destination wedding at *City Palace & Jagmandir Island, Udaipur, Rajasthan*.
* **Scale & Financials**: 250 attendees, ₹25,00,000 budget ceiling, Winter high-season, Hybrid indoor/outdoor courtyard.
* **Cultural Context**: Sangeet choreography, Baraat procession logistics, traditional Gujarati/Rajasthani royal thali catering with strict Jain/Halal accommodations, and heritage acoustic curation.

### 2. Milestone Birthdays — *Rohan's 30th Neon Rooftop Soirée*
* **Profile**: Modern urban celebration at *SkyDeck Lounge, Indiranagar, Bengaluru*.
* **Scale & Financials**: 75 attendees, ₹4,50,000 budget, Spring season, Covered rooftop terrace.
* **Vibe & Atmosphere**: Cyberpunk neon lighting, live synthwave DJ sets, craft mixology stations, interactive photo-booths, and gourmet sliders with vegan/gluten-free options.

### 3. Community Summits — *Vadodara Tech & Sustainability Summit 2026*
* **Profile**: Multi-track civic and technology conference at *Sayaji Garden Convention Hall, Vadodara*.
* **Scale & Financials**: 500 delegates, ₹12,00,000 budget, Autumn season, Multi-hall indoor auditorium.
* **Operational Requirements**: Carbon-neutral operations, zero single-use plastics, simultaneous keynote AV feeds, high-capacity dual-band Wi-Fi mesh, speaker green rooms, and locally sourced plant-based catering.

---

## 2. Approach, Context Decision Logic & Dual-Engine Architecture

Vesta Event Studio is engineered with an **offline-first, zero-downtime hybrid dual-engine architecture**. It leverages Google's **Gemini 3.5 Flash** model with intelligent candidate cascading (`gemini-3.5-flash`, `gemini-3-flash-preview`) for creative generative synthesis when online, paired with an instantaneous deterministic fallback engine ensuring planning functionality, financial rebalancing, and timeline calculations never break even without network connectivity or API quotas.

### ASCII Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    USER BROWSER / SPA                                  |
|                                                                                       |
|  +---------------------+   +---------------------+   +-----------------------------+  |
|  | Vertical Switcher   |   | High-Contrast AAA   |   | LocalStorage State Manager  |  |
|  | (Wed / Bday / Comm) |   | (>7.6:1 Ratio Guard)|   | (Safe JSON Parse & Persist) |  |
|  +----------+----------+   +----------+----------+   +--------------+--------------+  |
|             |                         |                             |                 |
|             +-------------------------+-----------------------------+                 |
|                                       |                                               |
|                                       v                                               |
|                      +----------------------------------+                             |
|                      |   useEventWorkspace Controller   |                             |
|                      +----------------+-----------------+                             |
|                                       |                                               |
|                     +-----------------+-----------------+                             |
|                     |                                   |                             |
|                     v                                   v                             |
|      +------------------------------+   +------------------------------------+        |
|      |  Interactive Feature Modules |   |    OWASP Defensive Security Guard  |        |
|      |  - Overview & What-If Sim    |   |    - HTML Sanitization (XSS Guard) |        |
|      |  - Budget Architect          |   |    - Sliding-Window Rate Limiter   |        |
|      |  - Dual-Horizon Timeline     |   |    - API Key Obfuscation Guard     |        |
|      |  - Vendor CRM & Vetting      |   +-----------------+------------------+        |
|      |  - Ideation Studio           |                     |                           |
|      +------------------------------+                     v                           |
|                                         +------------------------------------+        |
|                                         |  Hybrid GenAI Dispatcher (aiService)|        |
|                                         +-----------------+------------------+        |
|                                                           |                           |
|                         +---------------------------------+---------------------+     |
|                         |                                                       |     |
|                         v                                                       v     |
|             [ Network Online & Key Valid ]                        [ Offline / Rate-Limited ]  |
|                         |                                                       |     |
+-------------------------|-------------------------------------------------------|-----+
                          v                                                       v
         +----------------------------------+               +----------------------------------+
         |   Google Gemini 3.5 Flash REST   |               | Deterministic Synthesis Engine   |
         |   - Dynamic System Directives    |               | - Domain-Trained Rule Engine     |
         |   - Resilient Model Cascading    |               | - Deterministic Cost Calcs       |
         |   - Structured JSON Output       |               | - Zero Latency (0 ms) Failover   |
         +----------------------------------+               +----------------------------------+
```

### Mathematical Decision Logic & Algorithms

#### 1. Variable vs. Fixed Cost Budget Rebalancing
When an event budget ceiling changes or a contingency cut is simulated, fixed costs (such as non-refundable venue deposits or user-locked categories) remain untouched, while flexible variable allocations rebalance proportionally without exceeding the total budget:

$$\Delta B_{\text{avail}} = B_{\text{new}} - \sum_{i \in \text{Locked}} C_i$$

$$\text{Weight}_j = \frac{C_j \cdot P_j}{\sum_{k \in \text{Unlocked}} (C_k \cdot P_k)}$$

$$C_j^{\text{rebalanced}} = \max\left(0.10 \times C_j^{\text{orig}}, \; \Delta B_{\text{avail}} \times \text{Weight}_j\right)$$

Where:
* $B_{\text{new}}$ is the newly targeted total budget.
* $C_i$ is the cost allocated to locked category $i$.
* $P_j$ is the priority multiplier ($P_{\text{high}} = 1.5, \; P_{\text{medium}} = 1.0, \; P_{\text{low}} = 0.6$).
* The system enforces a safety floor of $10\%$ of original budget so essential services are not entirely stripped.

#### 2. Composite Event Readiness Score (0–100%)
The readiness score dynamically aggregates four objective health dimensions:

$$\text{Readiness Score} = 0.35 \cdot S_{\text{budget}} + 0.25 \cdot S_{\text{timeline}} + 0.25 \cdot S_{\text{vendors}} + 0.15 \cdot S_{\text{contingency}}$$

* **Budget Health ($S_{\text{budget}}$)**: 100 if spent $\le$ allocated; penalty applied if overallocated or unallocated buffer $< 5\%$.
* **Timeline Completion ($S_{\text{timeline}}$)**: Ratio of completed macro countdown milestones and critical-path items.
* **Vendor Confirmation ($S_{\text{vendors}}$)**: Ratio of contracted vendors and signed compliance/vetting checklist items.
* **Contingency Preparedness ($S_{\text{contingency}}$)**: Evaluates whether active backup plans (e.g. rain marquee, standby generator, secondary caterer) exist for the setting.

#### 3. 4-Scenario Contingency Simulator
Executes live parametric mutations on workspace state:
1. **Weather Shift (Rain / Extreme Heat)**: Shifts outdoor ceremonies indoors, provisions covered canopies, adds waterproof AV shielding (+₹45,000), and auto-inserts timeline wet-weather checkpoints.
2. **15% Budget Cut**: Locks high-priority essentials and scales down low-priority variable categories (decor, favors, ancillary lighting).
3. **+25% Guest Surge**: Dynamically scales per-plate catering, banquet seating, bar inventory, and registration staffing requirements.
4. **Key Vendor Cancellation**: Flags critical-path gaps, unlinks confirmed vendor status, and activates backup RFPs with pre-drafted negotiation templates.

---

## 3. How the Solution Works (5 Core Modules + Copilot + Export)

### Module 1: Executive Overview & What-If Simulator
* High-level operational command center displaying real-time Readiness Score, Total Budget Utilisation, Days Until Event Countdown, and Guest Count.
* Interactive **What-If Contingency Simulator** triggers instant multi-variable stress tests (Weather, 15% Budget Cut, +25% Guest Surge, Vendor Cancellation) with 1-click apply and reset controls.

### Module 2: Dynamic Budget Architect & Priority Rebalancer
* Category-by-category expense tracking with visual progress bars, over-budget warning badges, and inline allocation editing.
* **Lock Category** toggle protects selected contractual line-items from algorithmic shifts.
* **Auto-Rebalance Engine** redistributes unallocated funds or absorbs cuts based on algorithmic priority weighting.

### Module 3: Dual-Horizon Timeline Engine
* **Macro Countdown Horizon**: Tracks milestones from 6 months out to 1 week before the event, featuring critical-path badges, assignee tags, and category filtering.
* **Micro Day-Of Run-of-Show Horizon**: Minute-by-minute execution schedule (e.g., *07:00 Vendor Load-In*, *10:30 Baraat Arrival*, *19:00 Keynote Address*) with real-time countdown to next event phase.

### Module 4: Smart Vendor CRM & Negotiation Drafter
* Full vendor pipeline tracking (*Researching* ➔ *Contacted* ➔ *Negotiating* ➔ *Contracted* ➔ *Paid*).
* Interactive **Vetting & Compliance Checklists** (Food Safety License, 10kW Sound Permit, Fire Safety NOC, Proof of Insurance).
* **AI Negotiation Assistant**: Generates customized, professional vendor correspondence with 1-click clipboard copy for three strategic goals:
  * *10% Budget Discount Request*
  * *Complimentary Service Upgrade*
  * *Cancellation Grace Period Extension*

### Module 5: Personalized Ideation Studio & Creative Suite
* Real-time creative generation grounded in the active persona's guest count, physical venue setting, season, and vibe tags.
* **1-Click Plan Injection**: Injects generated ideas directly into the live Budget and Timeline modules.
* **Curated Event Color Palette Bar**: Displays 5 context-matched hex color swatches with instant 1-click copy to clipboard and live aria announcement feedback.
* **AI Invitation & Toast Speech Copywriter**: Generates personalized guest invitations and host welcome/toast speeches tailored to the event persona, title, date, and venue.

### Context-Aware AI Copilot Drawer
* Streamlined header button with global keyboard shortcut (<kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd>).
* Multi-turn chat grounded in full workspace state (budget balance, upcoming critical milestones, contracted vendors).
* Pre-configured quick-prompt suggestions (*"Audit budget risks"*, *"Analyze timeline bottlenecks"*, *"Review vendor compliance"*).

### Executive Blueprint Export Modal
* **Print-Ready Clean Layout**: Clean CSS print media styling for client pitch meetings and on-site event binder documentation.
* **JSON State Export**: Complete machine-readable state export for disaster recovery or integration into third-party ERPs.
* **Markdown Blueprint Export**: Fully formatted executive summary report ready for sharing via email or document wikis.

---

## 4. 6-Pillar Evaluation Alignment Matrix

| Evaluation Pillar | Implementation in Vesta Event Studio | Key Source Files |
| :--- | :--- | :--- |
| **1. Problem Statement Alignment** | Fully addresses celebration planning across 3 distinct vertical personas (Weddings, Birthdays, Community Summits). Unifies budgets, day-of schedules, vendor contracts, and context-aware ideation into a cohesive OS. | [`src/types/event.ts`](./src/types/event.ts)<br>[`src/data/verticalPersonas.ts`](./src/data/verticalPersonas.ts)<br>[`src/components/OverviewDashboard.tsx`](./src/components/OverviewDashboard.tsx) |
| **2. Code Quality & Modularity** | Clean TypeScript 5 architecture in strict mode (zero `any` types). Atomic component hierarchy, reusable custom hooks (`useEventWorkspace`), functional pure services, and zero dead code. Oxlint reports 0 warnings and 0 errors. | [`src/hooks/useEventWorkspace.ts`](./src/hooks/useEventWorkspace.ts)<br>[`src/services/contextEngine.ts`](./src/services/contextEngine.ts)<br>[`src/services/aiService.ts`](./src/services/aiService.ts) |
| **3. Security & OWASP Defense** | OWASP defensive security headers in `vercel.json` (`nosniff`, `DENY` clickjacking, strict HSTS, Referrer-Policy, strict Permissions-Policy). Client-side DOM sanitization (`escapeHtml`, `sanitizeUserInput`), sliding-window rate limiting (`checkRateLimit`), and zero API key leakage in logs. | [`vercel.json`](./vercel.json)<br>[`src/utils/security.ts`](./src/utils/security.ts)<br>[`src/utils/security.test.ts`](./src/utils/security.test.ts) |
| **4. Efficiency & Performance** | Pure client-side reactivity with zero server cold starts. Zero external image bloat (inline Lucide SVGs). Total git repository size is **~291 KB** (< 1 MB). Dual-engine failover provides 0 ms fallback latency when offline. | [`vite.config.ts`](./vite.config.ts)<br>[`src/services/aiService.ts`](./src/services/aiService.ts) |
| **5. Testing & Verification** | 7 comprehensive Vitest suites with 39 passing tests covering unit logic, financial rebalancing algorithms, sliding-window rate limiting, offline AI failover, and end-to-end user workflows. | [`src/services/contextEngine.test.ts`](./src/services/contextEngine.test.ts)<br>[`src/utils/security.test.ts`](./src/utils/security.test.ts)<br>[`src/__tests__/EndToEndReadiness.test.ts`](./src/__tests__/EndToEndReadiness.test.ts) |
| **6. Accessibility (WCAG 2.1 AAA)** | High-Contrast design tokens (`#b5b3c6`, >7.6:1 ratio) plus dedicated High-Contrast mode (`.high-contrast-aaa`, >15:1). High-visibility focus rings (`3px solid #facc15`). Full keyboard navigation (`Tab`, `Esc`, `Enter`), explicit `<label htmlFor>` on all form inputs, and `aria-live` announcements. | [`src/index.css`](./src/index.css)<br>[`src/components/Header.tsx`](./src/components/Header.tsx)<br>[`src/__tests__/IdeationStudio.test.tsx`](./src/__tests__/IdeationStudio.test.tsx) |

---

## 5. Engineering Assumptions Made

In developing Vesta Event Studio to satisfy the hackathon guidelines, the following explicit engineering decisions and assumptions were adopted:

1. **Client-Side State Storage**: To ensure instant portability, privacy, and zero infrastructure friction for hackathon evaluators, state persistence is managed via browser `localStorage` wrapped with defensive schema validations (`safeJsonParse`).
2. **Dual-Engine Model Architecture**: Google Gemini 3.5 Flash is selected as the primary GenAI model with automated cascading (`gemini-3.5-flash`, `gemini-3-flash-preview`). To guarantee that offline evaluators or users without API keys experience 100% of features, the system integrates a deterministic local synthesis engine for all generative endpoints.
3. **No Separate Backend Required**: The application is a self-contained single-page application (SPA). There is no need for a backend server on Render or AWS. All routing, rate limiting, persistence, and AI orchestration run directly in the client bundle.
4. **Financial Constraints**: Fixed-cost line items (marked locked or contracted) are non-negotiable by default in auto-rebalance operations. A 10% lower floor is preserved on variable categories to avoid zero-dollar allocations.
5. **Currency Handling**: Indian Rupee (₹ / INR) is configured as the default baseline currency with localized standard grouping formats (`en-IN`), while remaining extensible for international currencies via the project model.
6. **No Binary Asset Bloat**: All icons and branding emblems are inline SVGs, keeping the entire repository under 300 KB.

---

## 6. Quickstart, Local Setup & Verification Commands

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### 1. Installation & Environment
```bash
# Clone the repository
git clone https://github.com/kartikjoshi7/vesta-event-studio.git
cd vesta-event-studio

# Install dependencies
npm install

# (Optional) Configure Gemini API Key
cp .env.example .env
# In .env:
# VITE_GEMINI_API_KEY=your_gemini_api_key_here
# VITE_GEMINI_MODEL=gemini-3.5-flash
```
*(Note: Vesta operates with 100% functionality out-of-the-box even without an API key thanks to the integrated local synthesis engine).*

### 2. Local Development Server
```bash
npm run dev
# The application will launch at http://localhost:5173
```

### 3. Verification & Quality Assurance Suite
Execute the complete quality verification pipeline:

```bash
# 1. Typecheck (Strict TypeScript 5 — zero errors)
npx tsc --noEmit

# 2. Automated Test Suite (7 suites, 39 tests passing)
npm test

# 3. Linter (Oxlint with 116 rules — 0 warnings, 0 errors)
npm run lint

# 4. Production Build (Vite production bundle compilation)
npm run build
```

---

## 7. Deployment to Vercel

Vesta Event Studio is 100% configured for 1-click deployment on **Vercel** with zero backend infrastructure needed:

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. In [Vercel](https://vercel.com/), click **"Add New Project"** and select `vesta-event-studio`.
3. Vercel automatically detects the Vite framework:
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. *(Optional)* Add the environment variable:
   * `VITE_GEMINI_API_KEY`: `<your_gemini_api_key>`
   * `VITE_GEMINI_MODEL`: `gemini-3.5-flash`
5. Click **Deploy**. Vercel will serve your app globally via Edge CDN with full OWASP headers.

---

## 8. Project Structure & File Layout

```
vesta-event-studio/
├── .env.example                  # Environment configuration template
├── .gitignore                    # Strict exclusions ensuring repo size < 1 MB
├── LICENSE                       # MIT License
├── index.html                    # Semantic HTML5 entry with meta tags & Schema.org JSON-LD
├── package.json                  # Dependencies (React 19, Lucide, Tailwind, Vitest)
├── vercel.json                   # OWASP security headers & protected SPA rewrites
├── vite.config.ts                # Vite build and Vitest configuration
├── public/
│   ├── favicon.svg               # Geometric 8-point Vesta star icon
│   ├── icons.svg                 # SVG sprite symbols
│   ├── llms.txt                  # Standard AI agent browsable documentation
│   ├── llms-full.txt             # Comprehensive machine-readable system reference
│   ├── robots.txt                # Search crawler directives
│   ├── sitemap.xml               # Standard XML sitemap index
│   └── vesta-og-banner.svg       # Open Graph social share banner (1200x630)
├── src/
│   ├── main.tsx                  # React DOM mount point
│   ├── App.tsx                   # Top-level shell, tab routing, & global keyboard handlers
│   ├── index.css                 # Custom design tokens, glassmorphism, & WCAG AAA CSS
│   ├── types/
│   │   └── event.ts              # Core data contracts & TypeScript interfaces
│   ├── data/
│   │   └── verticalPersonas.ts   # Deep personas (Weddings, Birthdays, Community)
│   ├── services/
│   │   ├── contextEngine.ts      # Deterministic financial math & contingency engine
│   │   ├── contextEngine.test.ts # Math & readiness unit test suite
│   │   ├── aiService.ts          # Hybrid Gemini 3.5 + Deterministic AI service
│   │   └── aiService.test.ts     # Offline fallback & mock generation test suite
│   ├── utils/
│   │   ├── security.ts           # XSS sanitization & sliding-window rate limiter
│   │   └── security.test.ts      # Security & rate-limiting unit tests
│   ├── hooks/
│   │   ├── useEventWorkspace.ts  # Central state hook with localStorage persistence
│   │   └── useEventWorkspace.test.ts # State hook tests
│   ├── components/
│   │   ├── Header.tsx            # Header, event switcher dropdown, Copilot trigger
│   │   ├── OverviewDashboard.tsx # Readiness score & What-If contingency simulator
│   │   ├── BudgetArchitect.tsx   # Budget breakdown, category locks & rebalancer
│   │   ├── TimelineEngine.tsx    # Dual-horizon countdown & Day-Of Run-of-Show
│   │   ├── VendorCRM.tsx         # Vendor status tracking, vetting & AI negotiation
│   │   ├── IdeationStudio.tsx    # Creative ideation, color palettes & copywriter
│   │   ├── ContextCopilotDrawer.tsx # Slide-out context-aware assistant drawer
│   │   └── ExportBlueprintModal.tsx # Print blueprint, JSON, & Markdown exporter
│   └── __tests__/
│       ├── EndToEndReadiness.test.ts # Multi-phase integration test
│       ├── ContextCopilotDrawer.test.tsx # Copilot drawer UI tests
│       └── IdeationStudio.test.tsx       # Ideation studio & copywriter tests
```

---

## 9. License

Designed and engineered with pride for the Celebration & Event Planning AI Challenge.  
Licensed under the [MIT License](LICENSE).
