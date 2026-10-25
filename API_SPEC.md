# Vesta Event Studio — API & Interface Specification

**Version**: 3.0.0  
**Specification Type**: Vercel Serverless Endpoints (`api/`) & Core Service Contracts  
**Runtime**: TypeScript 5 / ECMAScript Next  

---

## 1. Vercel Serverless Endpoints (`api/`)

### 1.1 `GET /api/health`
Edge health and uptime verification endpoint.
* **Response (200 OK)**:
  ```json
  {
    "status": "ok",
    "engine": "neurosymbolic-v1",
    "uptime": "100%",
    "timestamp": "2026-10-25T11:45:00.000Z"
  }
  ```

### 1.2 `POST /api/plan`
Generates a deterministic context-aware event plan.
* **Payload**: `{ "project": EventProject, "targetBudget"?: number, "targetGuests"?: number }`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "plan": {
      "totalBudget": 2500000,
      "guestCount": 250,
      "budgetCategories": [...],
      "readinessScore": { "overallScore": 92, "budgetHealth": 95, ... },
      "decisionLog": { ... },
      "warnings": []
    }
  }
  ```

### 1.3 `POST /api/chat`
Proxies Copilot inquiries to Gemini using server-side isolated API keys with fallback.
* **Payload**: `{ "project": EventProject, "message": string }`
* **Response (200 OK)**: `{ "reply": string, "engineMode": "gemini-live" | "smart-context-engine" }`

### 1.4 `POST /api/ideas`
Generates tailored event ideas using server-side Gemini key with deterministic fallback.
* **Payload**: `{ "project": EventProject, "prompt"?: string }`
* **Response (200 OK)**: `{ "ideas": PersonalizedIdea[], "source": string }`

---

## 2. Core TypeScript Service APIs

* `generatePersonalizedIdeas(project: EventProject, customPrompt?: string): Promise<PersonalizedIdea[]>`  
  Synthesizes context-grounded event ideas via serverless endpoint ➔ client Gemini ➔ local engine.
* `draftVendorNegotiationMessage(project, vendor, goal): Promise<string>`  
  Drafts contextual negotiation emails for price cuts, scope checks, or milestone followups.
* `askContextAssistant(project, userQuery): Promise<AssistantResponse>`  
  Answers live workspace questions with real-time project telemetry.
* `rebalanceBudgetForContext(project, budget, guests, priorityFocus?): RebalanceResult`  
  Deterministic invariant rebalancing respecting locked categories and guest-scaling variable costs.
* `calculateEventReadiness(project: EventProject): ReadinessScore`  
  Calculates a 0–100 composite score across budget health (35%), timeline health (35%), and vendor readiness (30%).
* `generateContingencyPlan(project, scenario): ContingencyResult`  
  Generates deterministic mitigations for weather, budget cuts, guest surges, or vendor drops.
