# Vesta Event Studio — Security Architecture Summary

**Specification Standard**: OWASP Top 10 Web Application Hardening  
**Full Documentation**: See [docs/SECURITY.md](docs/SECURITY.md)

---

## Security Invariants

* **API Key Isolation**: `GEMINI_API_KEY` is isolated server-side within Vercel Serverless Functions (`api/`). In client-only mode, keys are stored strictly in `sessionStorage` and never logged or leaked.
* **Input Sanitization**: All user strings are purified via `sanitizeUserInput()` to eliminate XSS vectors and prompt injection delimiters.
* **Defensive JSON Parsing**: `safeJsonParse()` guarantees crash-proof state hydration from `localStorage`.
* **Sliding-Window Rate Limiting**: Client (15 req/min) and server (30 req/min) quotas prevent accidental request floods.
* **OWASP Headers**: Enforced via `vercel.json` and `api/_handler.ts` (`nosniff`, `DENY`, `HSTS`, `strict-origin-when-cross-origin`).

For detailed implementation audits, refer to [docs/SECURITY.md](docs/SECURITY.md).
