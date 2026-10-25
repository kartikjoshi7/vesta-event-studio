# Vesta Event Studio — System Architecture

**Specification Standard**: Enterprise Celebration & Event Planning OS  
**Full Documentation**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## High-Level Topology: Neurosymbolic Model & Triple-Redundancy

Vesta Event Studio combines deterministic computational mathematics with generative AI synthesis:

* **Presentation Layer**: React 19 + Tailwind CSS v4 + Lucide Icons (< 180 lines per file).
* **Deterministic Engine**: Pure TypeScript budget rebalancing, 0-100% event readiness scoring, and 4-scenario contingency planning (`src/services/engine/*`).
* **Triple-Redundancy AI**:
  1. Vercel Serverless Functions (`api/*`) using server-side credentials
  2. Client-side Google Gemini 3.5 Flash REST calls with cascading model fallback
  3. 100% offline deterministic fallback engine with an O(1) in-memory response cache
* **State Management**: Facade hook architecture with specialized domain hooks and zero-prop-drilling React Context.

For detailed diagrams and module breakdowns, refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
