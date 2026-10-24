# Vesta Event Studio — API & Interface Specification

**Version**: 2.0.0  
**Specification Type**: Internal Service Contracts, Schemas & Agent Capability Manifest  
**Runtime**: TypeScript 5.8 / ECMAScript Next  

---

## 1. Core Service APIs

### 1.1 `generatePersonalizedIdeas`
Synthesizes 5 context-aware, creative ideas for the event based on venue, guest count, season, vibe tags, dietary requirements, and remaining budget headroom.

* **Module**: [`src/services/aiService.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/aiService.ts)
* **Signature**:
  ```typescript
  async function generatePersonalizedIdeas(
    project: EventProject,
    customPrompt?: string
  ): Promise<PersonalizedIdea[]>
  ```
* **Parameters**:
  * `project` (`EventProject`, required): The complete immutable event workspace state.
  * `customPrompt` (`string`, optional): User-supplied customization focus. Sanitized via `sanitizeUserInput()`.
* **Execution Pathway**:
  1. Computes cache key via `buildCacheKey('ideas', project.id, project.guestCount, customPrompt)`.
  2. If cached in `aiResponseCache`, returns parsed JSON in **0 ms ($O(1)$)**.
  3. Formulates prompt with strict JSON schema instructions and sends to Gemini 3.5 Flash REST endpoint.
  4. Cascades across candidate models on 404/503 errors.
  5. On error or missing API key, fail-closes to deterministic curated idea bank.
* **Return Schema (`PersonalizedIdea[]`)**:
  ```typescript
  interface PersonalizedIdea {
    id: string;
    category: 'decor' | 'culinary' | 'entertainment' | 'guest-experience';
    title: string;
    description: string;
    estimatedCostImpact: 'Low ($)' | 'Medium ($$)' | 'High ($$$)';
    bestForContext: string;
  }
  ```

---

### 1.2 `draftVendorNegotiationMessage`
Generates a highly contextual, professional vendor outreach or negotiation email grounded in contract status, quoted amounts, target budgets, and day-of timeline requirements.

* **Module**: [`src/services/aiService.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/aiService.ts)
* **Signature**:
  ```typescript
  async function draftVendorNegotiationMessage(
    project: EventProject,
    vendor: VendorChecklistItem,
    goal: 'discount' | 'scope-check' | 'contract-followup'
  ): Promise<string>
  ```
* **Parameters**:
  * `project` (`EventProject`): Current workspace project state.
  * `vendor` (`VendorChecklistItem`): Target vendor record containing quoted cost, status, category, and contact information.
  * `goal` (`'discount' | 'scope-check' | 'contract-followup'`): Negotiation objective.
* **Returns**: Formatted multi-paragraph email string ready for 1-click clipboard copying.

---

### 1.3 `askContextAssistant`
Interactive multi-turn conversational copilot grounded in real-time project metrics (current spend, readiness score, next timeline cues, unconfirmed vendors).

* **Module**: [`src/services/aiService.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/aiService.ts)
* **Signature**:
  ```typescript
  async function askContextAssistant(
    project: EventProject,
    userQuery: string
  ): Promise<AssistantResponse>
  ```
* **Return Model (`AssistantResponse`)**:
  ```typescript
  interface AssistantResponse {
    reply: string;
    suggestedAction?: {
      label: string;
      tabTarget: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideation';
      payload?: Record<string, unknown>;
    };
    engineMode: 'gemini-live' | 'deterministic-context';
  }
  ```

---

## 2. Deterministic Context Engine APIs

### 2.1 `rebalanceBudget`
Calculates optimal budget redistribution when total budget or guest count changes, preserving locked categories and scaling variable-cost categories proportionally.

* **Module**: [`src/services/contextEngine.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/contextEngine.ts)
* **Signature**:
  ```typescript
  function rebalanceBudget(
    project: EventProject,
    newTotalBudget: number,
    newGuestCount: number,
    priorityFocus?: string
  ): RebalanceResult
  ```
* **Return Model (`RebalanceResult`)**:
  ```typescript
  interface RebalanceResult {
    updatedCategories: BudgetCategory[];
    decisionLog: ContextDecisionLog;
    warnings: string[];
  }
  ```

---

### 2.2 `calculateEventReadiness`
Generates the composite readiness score (0–100%) and categorizes the project status (`Critical Attention`, `In Progress`, `On Track`, `Ready for Execution`).

* **Module**: [`src/services/contextEngine.ts`](file:///c:/Prompt%20Wars/challenge%205/src/services/contextEngine.ts)
* **Signature**:
  ```typescript
  function calculateEventReadiness(project: EventProject): ReadinessScore
  ```
* **Return Model (`ReadinessScore`)**:
  ```typescript
  interface ReadinessScore {
    overallScore: number; // 0 - 100
    budgetHealth: number; // 0 - 100
    timelineHealth: number; // 0 - 100
    vendorReadiness: number; // 0 - 100
    criticalAlerts: string[];
    nextBestActions: string[];
  }
  ```

---

## 3. Security & Utility APIs

### 3.1 `sanitizeUserInput`
* **Module**: [`src/utils/security.ts`](file:///c:/Prompt%20Wars/challenge%205/src/utils/security.ts)
* **Signature**: `sanitizeUserInput(input: string, maxLength = 2048): string`
* **Security Guarantees**:
  1. Strips null bytes (`\0`) and dangerous control characters (`[\x00-\x08\x0B\x0C\x0E-\x1F]`).
  2. Converts HTML meta-characters (`&`, `<`, `>`, `"`, `'`, `/`) to strict XML/HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#x27;`, `&#x2F;`).
  3. Clamps string length to `maxLength` to protect against memory exhaustion or regex DoS attacks.

### 3.2 `checkRateLimit`
* **Module**: [`src/utils/security.ts`](file:///c:/Prompt%20Wars/challenge%205/src/utils/security.ts)
* **Signature**: `checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean`
* **Guarantee**: Enforces a sliding-window rate limit per client or IP key. Returns `false` when quota is exceeded.

### 3.3 `maskApiKey`
* **Module**: [`src/utils/security.ts`](file:///c:/Prompt%20Wars/challenge%205/src/utils/security.ts)
* **Signature**: `maskApiKey(key: string): string`
* **Guarantee**: Masks all characters except the first 4 and last 4 (e.g., `AIza••••••••••••••••••••••••••••1234`), guaranteeing zero credential leakage in UI logs or telemetry.

### 3.4 `safeJsonParse`
* **Module**: [`src/utils/security.ts`](file:///c:/Prompt%20Wars/challenge%205/src/utils/security.ts)
* **Signature**: `safeJsonParse<T>(raw: string, fallback: T): T`
* **Guarantee**: Defensively parses JSON without throwing uncaught exceptions. Strips `__proto__` and `constructor` keys to eliminate prototype pollution risks.

---

## 4. Agentic Resource Discovery Manifest (ARD v1.0)

Vesta provides full machine-readable capability discovery for autonomous AI agents via the ARD standard:

* **Endpoint**: `/.well-known/ai-catalog.json` (rewritten to `/ai-catalog.json`)
* **Content-Type**: `application/json; charset=utf-8`
* **CORS**: `Access-Control-Allow-Origin: *`
* **Manifest Structure**:
  ```json
  {
    "specVersion": "1.0",
    "host": {
      "displayName": "Vesta Event Studio",
      "documentationUrl": "https://vesta-event-studio.vercel.app/llms.txt"
    },
    "entries": [
      {
        "identifier": "urn:air:vesta-event-studio.vercel.app:capability:celebration-os",
        "displayName": "Vesta Celebration & Event Planning OS",
        "type": "text/markdown",
        "url": "https://vesta-event-studio.vercel.app/llms-full.txt",
        "description": "Autonomous event planning operating system with context-aware financial governance, timeline sequencing, and vendor negotiation.",
        "tags": [
          "event-planning",
          "budget-management",
          "celebration",
          "wedding-planner",
          "run-of-show"
        ],
        "representativeQueries": [
          "Plan a 250-guest destination wedding in Udaipur with INR 25,00,000 budget",
          "Rebalance budget when guest count changes from 200 to 250",
          "Generate Day-Of run-of-show timeline cues for milestone birthday",
          "Draft vendor negotiation email for 10 percent discount"
        ]
      }
    ]
  }
  ```
