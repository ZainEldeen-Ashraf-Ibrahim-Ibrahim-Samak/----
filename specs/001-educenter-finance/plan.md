# Implementation Plan: EduCenter Financial Management System

**Branch**: `001-educenter-finance` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-educenter-finance/spec.md`

## Summary

A cross-platform (Windows + macOS) Electron desktop application that manages the
complete financial lifecycle of a multi-center educational business: per-student
session revenue, teacher payroll, two centers with rent ledgers, three service lines
(studio / mobile / in-center), a partner company, and the owner's personal finances —
all offline-first against a local SQLite store with background sync to MongoDB,
bilingual (Arabic RTL / English LTR), dark/light themeable, and white-labelable at
runtime (name, logo, accent color, app icon).

Technical approach: an Electron app split into a TypeScript main process (business
logic, SQLite via better-sqlite3, MongoDB sync via the MongoDB driver, scheduling,
exports) and a React + Tailwind renderer, communicating over a typed, validated IPC
contract. SQLite is the single source of truth; a sync engine drains a change-log
queue to MongoDB with last-write-wins + device/timestamp audit for multi-device use.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) across main, preload, and renderer

**Primary Dependencies**:
- Shell/runtime: Electron 29.x, electron-vite (Vite-based build), electron-builder (packaging), electron-updater (auto-update)
- Renderer: React 18, Tailwind CSS 3, react-i18next (ar/en + RTL/LTR), Zustand (state), React Router 6, React Hook Form, Recharts, Lucide React, date-fns
- Main: better-sqlite3 (local DB), official `mongodb` driver (sync target), electron-store (config/branding), node-cron (alerts/scheduled jobs), pdfkit (PDF export), exceljs (Excel/CSV export)
- Shared: Zod (runtime validation at every IPC / storage / sync boundary)

**Storage**:
- Local source of truth: SQLite via better-sqlite3 (synchronous, in main process)
- Online sync target: MongoDB (Atlas or self-hosted), official driver
- Config/branding/lock metadata: electron-store JSON file (`branding.json`, app settings)

**Testing**: Vitest (unit — calc engines, sync logic, validators, i18n), Playwright for Electron (end-to-end across both OS targets), with calculation/sync test suites treated as the highest-value coverage.

**Target Platform**: Windows 10+ (.exe NSIS, signed) and macOS 12 Monterey+ (.dmg/.app, notarized), desktop only.

**Project Type**: Electron desktop application (main + preload + renderer, plus shared library).

**Performance Goals**: app ready < 3s; session save < 200ms; any monthly report < 5s; sync non-blocking (background); all targets hold with 10,000+ sessions/month and multi-year history.

**Constraints**: fully offline-capable (no network required for any feature); no data loss (write confirmed to SQLite before UI update); RTL + LTR parity; dark + light parity; runtime white-label (no rebuild); branding config not exposed directly to renderer; SQLite encrypted at rest is a v2 option (TLS for MongoDB required now).

**Scale/Scope**: single owner, multi-device sync; 5 financial entities; ~20 screens; 10,000+ sessions/month; years of retained history; manual full backup/restore.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How this plan complies | Status |
|---|---|---|
| I. Type-Safe Codebase (NON-NEGOTIABLE) | TypeScript strict across all processes; Zod schemas validate every IPC message, SQLite row mapping, and MongoDB sync payload; CI fails on type/lint errors. | ✅ PASS |
| II. Offline-First, Sync-Reliable Data | SQLite is the only source of truth; all reads/writes work offline; `SyncRecord` change-log carries id + device + timestamp + version; conflicts resolved by documented last-write-wins with audit; interrupted sync is idempotent/resumable. | ✅ PASS |
| III. Cross-Platform Parity (macOS & Windows) | Single Electron codebase; OS-specific concerns (paths, dialogs, tray/icon, notifications, auto-update) isolated behind a `platform` adapter; electron-builder produces and smoke-tests both targets. | ✅ PASS |
| IV. Internationalization & Bidirectional UI (ar/en) | react-i18next with `ar`/`en` resource files; no hard-coded strings; `dir` attribute + Tailwind logical properties drive RTL/LTR; both directions verified per screen. | ✅ PASS |
| V. Adaptive & Themeable Interface | Tailwind with CSS-variable theme tokens (accent + dark/light); responsive layout (sidebar collapse, horizontal table scroll); follows OS theme by default; every component authored theme- and direction-agnostic. | ✅ PASS |
| VI. Runtime White-Label Branding | `branding.json` read at runtime for name/logo/accent/icon; applied to title bar, chrome, reports, and (per-OS) app/tray icon; safe defaults and graceful fallback for missing/invalid assets. | ✅ PASS |

**Result**: All gates pass. No violations — Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-educenter-finance/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── ipc-contract.md       # Typed IPC channels (renderer ↔ main)
│   └── sync-contract.md      # SQLite ↔ MongoDB sync protocol
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── main/                     # Electron main process (Node/TypeScript)
│   ├── index.ts              # App bootstrap, window + tray + icon lifecycle
│   ├── ipc/                  # IPC handlers, one module per domain, Zod-validated
│   ├── db/                   # better-sqlite3: connection, migrations, repositories
│   │   ├── migrations/       # Ordered schema migrations
│   │   └── repositories/     # Center, Teacher, Session, Payroll, Personal, ...
│   ├── services/             # Business logic
│   │   ├── revenue/          # Session revenue + salary-mode calculators
│   │   ├── payroll/          # Monthly payroll computation + month lock
│   │   ├── alerts/           # node-cron scheduled due-date alerts
│   │   ├── reports/          # P&L, payroll, cash-flow report builders
│   │   ├── export/           # pdfkit + exceljs export
│   │   └── backup/           # Full local backup export/restore
│   ├── sync/                 # MongoDB sync engine (queue drain, LWW, retry)
│   ├── branding/             # branding.json read/write + icon swap
│   ├── security/             # Optional local lock (PIN/password) verification
│   └── platform/             # OS abstraction (paths, dialogs, notifications, updater)
├── preload/
│   └── index.ts              # Context-isolated typed bridge exposing IPC API
├── renderer/                 # React + Tailwind UI
│   ├── app/                  # Router, layout shell (sidebar/topbar), providers
│   ├── pages/                # One folder per screen (SCR-001 … SCR-020)
│   ├── components/           # Shared UI (tables, forms, cards, charts, empty states)
│   ├── stores/               # Zustand stores
│   ├── i18n/                 # react-i18next config + ar.json / en.json
│   ├── theme/                # CSS-variable tokens, dark/light, accent application
│   └── hooks/                # Data + IPC hooks
└── shared/                   # Code shared between processes
    ├── types/                # Domain TypeScript types
    ├── schemas/              # Zod schemas (entities, IPC payloads, sync records)
    └── constants/            # Enums (salary modes, statuses, alert types)

tests/
├── unit/                     # Vitest: calculators, payroll, sync logic, validators
├── integration/             # Repositories against a temp SQLite db; sync against mock Mongo
└── e2e/                      # Playwright-Electron: key journeys, RTL/LTR, theme, branding
```

**Structure Decision**: Electron desktop layout with three process roots (`src/main`,
`src/preload`, `src/renderer`) plus a `src/shared` library that holds domain types and
Zod schemas reused on both sides of the IPC boundary. This keeps Principle I (one set of
validated types everywhere) and Principle III (OS specifics isolated in `src/main/platform`)
structurally enforced rather than convention-only.

## Complexity Tracking

> No constitutional violations — this section is intentionally empty.
