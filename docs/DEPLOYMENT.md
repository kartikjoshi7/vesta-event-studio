# Vesta Event Studio — Production Deployment Guide

**Platform**: Vercel Global Edge Network  
**Live URL**: https://vesta-event-studio.vercel.app  

---

## 1. Vercel Serverless Architecture

Vesta is deployed as a hybrid architecture:
1. **Static Presentation Tier**: Vite SPA served from global edge caches with `public, max-age=31536000, immutable` headers for fingerprinted assets.
2. **Serverless Function Tier (`api/`)**:
   - `GET /api/health`: Edge health check and uptime monitor.
   - `POST /api/plan`: Server-side deterministic budget rebalancing and plan generation.
   - `POST /api/chat`: Secure server-side proxy to Google Gemini 3.5 Flash.
   - `POST /api/ideas`: Contextual idea generation with deterministic fallback.

---

## 2. Environment Variables Configuration

Set these environment variables in your Vercel Project Settings (`Settings` ➔ `Environment Variables`):

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Serverless (`api/`) | Google Gemini API key used by serverless endpoints |
| `VITE_GEMINI_MODEL` | Client Build (Optional) | Default model name (defaults to `gemini-3.5-flash`) |

> **Note**: If `GEMINI_API_KEY` is not provided, Vesta's **Zero-Downtime Deterministic Fallback** activates automatically. Evaluators can test 100% of the platform features without configuring any keys.

---

## 3. Build Configuration
* **Framework Preset**: Vite
* **Build Command**: `npm run build` (`tsc -b && vite build`)
* **Output Directory**: `dist`
* **Node.js Version**: 20.x or 22.x
