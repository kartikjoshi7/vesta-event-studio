# Vesta Event Studio — Security Architecture & OWASP Hardening

**Specification Standard**: OWASP Top 10 Web Application Hardening  
**Target Environment**: Vercel Edge Serverless & Browser Local Sandbox  

---

## 1. Zero-Trust API Key Management
* **Serverless Key Isolation**: When hosted on Vercel, the Google Gemini API key resides strictly server-side in `process.env.GEMINI_API_KEY`. The browser client never sees or requires the server key.
* **Client-Side Storage**: In standalone client mode, API keys entered in the AI Settings dialog are saved exclusively in browser `sessionStorage` and `localStorage`. Keys are never transmitted to any third-party telemetry, analytics, or logging server.
* **UI Masking**: The `maskApiKey()` utility automatically redacts all except the first 4 and last 4 characters (`AIza****xyz9`) in all UI presentation layers.

---

## 2. Input Sanitization & Anti-Injection Guardrails
* **`sanitizeUserInput()`**: Defensively strips script tags, HTML tags, inline event attributes (`onerror=`, `onclick=`), and `javascript:` pseudo-protocols.
* **LLM Prompt Injection Defense**: Strips system prompt boundary markers (`[INST]`, `[/INST]`, `<|im_start|>`, `<|system|>`, and `### System:`) before user text is interpolated into Gemini prompts.
* **Type Validation**: Number fields are clamped and validated using `validateNumberInput()` against explicit ranges. Non-finite values (`NaN`, `Infinity`) automatically fall back to safe defaults.

---

## 3. Defensive Serialization & Rate Limiting
* **Defensive JSON Parsing**: `safeJsonParse()` wraps all parsing in try/catch blocks with typed fallback values, preventing corrupted storage or malformed AI responses from triggering unhandled exceptions.
* **Sliding-Window Rate Limiting**: `checkRateLimit()` enforces client-side quotas (15 req/min) and server-side quotas (30 req/min) to prevent accidental denial-of-service loops and quota exhaustion.

---

## 4. HTTP Security Headers
Every edge response served by Vesta Event Studio enforces strict security headers configured in `vercel.json` and `api/_handler.ts`:
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(), microphone=(), geolocation=()`
