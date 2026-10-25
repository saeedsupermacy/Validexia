# Validexia — Vendor Risk Management Frontend

Interactive frontend prototype for third-party risk management (TPRM).
React 19 + Vite + TypeScript + Tailwind CSS.

## Current status: demo prototype

This is a **frontend demo**, not a production system. It uses synthetic data and
browser-local state. See [SCORE_CONTRACT.md](./SCORE_CONTRACT.md) for risk-score semantics.

**What works:** full UI across 17 workspaces (vendors, assessments, evidence,
remediation, monitoring, fourth-parties, decisions, reports, vendor portal, etc.),
deep-linking navigation, filtering, CSV exports, demo-mode persistence via localStorage.

**What needs a backend:** authentication, multi-tenant data isolation, persistent
server-side records, real monitoring feeds, real AI analysis, tamper-proof audit log,
file storage, email invitations.

A yellow **Demo** badge in the topbar indicates demo mode. Features labelled
"Simulated" (AI Workbench, Monitoring feed) use pre-scripted data, not live systems.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run dev      # dev server
npm run build    # production build (outputs to dist/)
npx tsc --noEmit # type check
```

Copy `.env.example` to `.env` and fill in values. Never commit `.env`.

## Project structure

- `src/features/` — one folder per workspace (vendors, evidence, etc.)
- `src/data/vendors.ts` — canonical vendor dataset + registry (single source of truth)
- `src/fixtures/` — rich detail overlays for demo vendor pages
- `src/shared/navigation.ts` — navigation with deep-link params + URL hash sync
- `src/shared/ui/` — shared components (DeepLinkBanner, etc.)

## Risk scoring

Higher score = higher risk (0–100). See [SCORE_CONTRACT.md](./SCORE_CONTRACT.md).
**Do not connect a backend score without confirming direction first.**
