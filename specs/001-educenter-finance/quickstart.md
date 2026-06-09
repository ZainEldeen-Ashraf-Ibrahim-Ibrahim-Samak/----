# Quickstart: EduCenter Financial Management System

**Feature**: `001-educenter-finance` | **Date**: 2026-06-09

How to set up, run, and validate the project locally. Targets Windows 10+ and macOS 12+.

## Prerequisites

- Node.js 20 LTS and npm
- Git
- Platform build tools for native modules (better-sqlite3):
  - macOS: Xcode Command Line Tools
  - Windows: "Desktop development with C++" (Visual Studio Build Tools)
- (Optional, for sync) A MongoDB connection string (Atlas or self-hosted). The app runs
  fully without it — sync is off until configured.

## First-time setup

```bash
npm install
npm run dev          # launches Electron (electron-vite) with HMR
```

The app opens with default branding, English (LTR), and the OS theme. No login is
required (the optional local lock is off by default).

## Project layout (where things live)

| Area | Path |
|---|---|
| Main process (DB, services, sync, IPC handlers) | `src/main/` |
| Preload bridge (typed IPC) | `src/preload/` |
| React + Tailwind UI | `src/renderer/` |
| Shared types + Zod schemas + enums | `src/shared/` |
| Migrations | `src/main/db/migrations/` |
| i18n strings | `src/renderer/i18n/ar.json`, `en.json` |
| Tests | `tests/{unit,integration,e2e}/` |

## Common commands

```bash
npm run dev            # dev app with HMR
npm run typecheck      # tsc --noEmit (strict) — must be clean (Principle I)
npm run lint           # ESLint + Prettier
npm run test           # Vitest unit + integration
npm run test:e2e       # Playwright-for-Electron (key journeys, RTL/LTR, theme, branding)
npm run build          # production build
npm run package        # electron-builder → .exe (win) / .dmg (mac)
```

## Validating the core flows (maps to spec acceptance scenarios)

1. **Session revenue engine (US1, P1)**
   - Create a center; create a teacher on **revenue-share** with owner share 30%.
   - New Session → 10 students × 50 → expect total **500**, owner **150**, teacher **350**.
   - Repeat for **per-session** (earning = flat rate) and **fixed** (per-session earning 0).
   - Override price per student for one session → only that session changes.
   - Mark a session collected → status flips, collection date set.

2. **Bilingual / theme / branding shell (US2, P1)**
   - Switch language to Arabic → layout mirrors to RTL, sidebar moves right, labels in Arabic.
   - Toggle dark/light → all screens re-theme; restart → choice persists.
   - Settings → Branding: change name, upload a logo, pick an accent color → applies immediately and on report headers; restart → persists.
   - Resize narrow → sidebar collapses to icons, tables scroll horizontally.

3. **Centers & rent (US3, P2)**: add a center with rent due day 5 + 7-day alert; log a rent payment with receipt; advance the clock to 7 days before → rent alert appears; view monthly P&L.

4. **Payroll (US4, P2)**: with a month of sessions, `payroll:compute` → salary matches mode; record a partial payment; lock the month → edits blocked; unlock requires a reason.

5. **Personal finance (US5, P3)**: installment 12000/12 with 3 paid → remaining 9000; gam3eyya 10×1000, round 4 → payout 10000, receipt date computed; subscription advances next due date.

6. **Service lines (US6) / company (US7)**: studio 2h booking → due = 2×rate; mobile job transport 100 + labor 200 charged 500 → net 200; shared expense 60/40 splits correctly.

7. **Dashboard & reports (US8, P2)**: dashboard totals equal sum of entities; generate a monthly P&L, export PDF (carries branding + language) and Excel.

8. **Offline-first & sync (US9, P3)**: disable networking → create/edit/delete all succeed locally; re-enable → indicator goes offline → syncing → synced; simulate two-device edit → higher `updatedAt` wins, logged.

9. **Backup/restore**: `backup:export` → archive with manifest; `backup:restore` on a fresh profile → data fully recovered.

10. **Local lock**: enable PIN in settings → relaunch requires it; disable → opens directly.

## Definition of Done check (per Constitution)

Before marking a feature done, confirm: `typecheck` + `lint` clean; works offline against
SQLite; verified on **both** macOS and Windows; verified in **both** `ar` (RTL) and `en`
(LTR); verified in **both** dark and light at small and large window sizes.

## Sync configuration (optional)

Settings → Sync → paste the MongoDB connection string (stored in main-process config, TLS
required). Sync begins draining the pending change-log queue in the background. Leaving it
unset keeps the app fully functional, offline-only.
