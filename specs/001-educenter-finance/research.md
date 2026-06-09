# Phase 0 Research: EduCenter Financial Management System

**Feature**: `001-educenter-finance` | **Date**: 2026-06-09

This document records the technology and design decisions that resolve the open
questions implied by the Technical Context. The PRD (`plan001.md`) fixed most of the
stack; the items below either confirm those choices with rationale or settle the few
points the PRD left open (test framework, IPC pattern, sync conflict mechanics,
backup format, local lock).

---

## D1. Local persistence: better-sqlite3

- **Decision**: Use `better-sqlite3` in the main process as the single source of truth.
- **Rationale**: Synchronous API keeps repository code simple and fast; zero external
  service; meets the < 200ms session-save and offline-first requirements; proven with
  10k+ rows/month and multi-year history when properly indexed.
- **Alternatives considered**: `sql.js` (WASM, in-renderer) — rejected: weaker
  durability and no native file persistence guarantees. `Prisma`/`TypeORM` — rejected:
  heavier, async, and better-sqlite3 + thin repositories give finer control over the
  sync change-log and migrations.

## D2. Online sync target: MongoDB official driver (not Mongoose)

- **Decision**: Use the official `mongodb` Node driver for the sync engine, not Mongoose.
- **Rationale**: Sync writes are simple upserts keyed by record id; the document shapes
  are already defined by `shared/schemas` (Zod), so a second ODM schema layer (Mongoose)
  is redundant and adds weight. The driver gives direct control over bulk upserts and TLS.
- **Alternatives considered**: Mongoose (named in PRD) — acceptable but rejected to avoid
  duplicating validation already owned by Zod; if richer server-side modeling is needed
  later it can be reintroduced behind the sync adapter without touching domain code.

## D3. IPC contract: typed, Zod-validated request/response channels

- **Decision**: All renderer↔main communication goes through a single context-isolated
  preload bridge that exposes named, typed channels; every payload is parsed with a Zod
  schema in the main handler before any DB access (Constitution Principle I).
- **Rationale**: `contextIsolation: true` + `nodeIntegration: false` is the secure
  Electron baseline; centralizing channels behind one typed API surface keeps the
  renderer free of Node/DB access and makes the contract testable.
- **Alternatives considered**: Exposing repositories directly to the renderer — rejected
  (security, violates process separation). `electron-trpc` — viable but adds a dependency
  for what a small typed wrapper achieves; revisit if channel count grows large.

## D4. State management: Zustand

- **Decision**: Zustand stores in the renderer, hydrated via IPC query hooks.
- **Rationale**: Lightweight, TypeScript-first, minimal boilerplate; matches PRD.
- **Alternatives considered**: Redux Toolkit (heavier), React Context only (re-render
  cost at this screen count). Rejected for ergonomics/perf.

## D5. i18n + RTL/LTR: react-i18next + dir attribute + Tailwind logical properties

- **Decision**: `react-i18next` with `ar.json`/`en.json`; set `dir="rtl|ltr"` on the root
  per active language; use Tailwind logical utilities (e.g. `ps-*`/`pe-*`, `text-start`)
  and `[dir=rtl]` variants instead of hard-coded left/right.
- **Rationale**: Single switch flips the whole layout; logical properties avoid a second
  RTL stylesheet; satisfies Principle IV (no hard-coded strings, verified both directions).
- **Alternatives considered**: `react-intl` (heavier API), manual mirrored CSS — rejected
  for maintenance cost.

## D6. Theming: Tailwind + CSS variables for dark/light + white-label accent

- **Decision**: Define semantic color tokens as CSS variables; dark/light switch swaps the
  variable set on a root class; the white-label accent color (from `branding.json`)
  overrides the accent variable at runtime. No hard-coded hex in components.
- **Rationale**: One mechanism serves both the dark/light requirement (Principle V) and
  runtime accent rebranding (Principle VI) without recompiling Tailwind.
- **Alternatives considered**: Multiple compiled Tailwind themes — rejected: cannot change
  accent at runtime. Inline styles — rejected: inconsistent, hard to test.

## D7. Runtime white-label & app icon swap

- **Decision**: Store branding in `branding.json` via electron-store (main process only).
  Name/logo/accent apply immediately by pushing branding state to the renderer over IPC.
  App/tray icon is swapped at runtime via Electron's `nativeImage` + `setIcon`/tray APIs;
  the OS dock/taskbar icon updates where the platform permits, with a documented fallback
  where it does not (icon takes effect next launch on that OS).
- **Rationale**: Meets Principle VI "without rebuild"; keeps secrets/config out of the
  renderer; graceful fallback when an asset is missing/invalid.
- **Alternatives considered**: Rebuild-per-brand via electron-builder config — rejected:
  violates the in-app, no-rebuild requirement.

## D8. Sync engine & conflict resolution: change-log queue + last-write-wins + audit

- **Decision**: Every local mutation writes the domain row to SQLite **and** appends a
  `sync_record` row (entity, op, recordId, deviceId, updatedAt, version, status=pending)
  in the same transaction. A background worker drains pending records to MongoDB as
  idempotent upserts keyed by recordId; on pull, the higher `updatedAt` wins
  (last-write-wins), and the resolution (winning device + timestamp) is retained for audit.
  Each record carries a monotonic `version` to detect concurrent edits.
- **Rationale**: Satisfies Principle II (offline-first, resumable, no silent loss with an
  audit trail) and the multi-device clarification; idempotent upserts make retries safe
  (FR-042). Transactional log write guarantees no change is lost if the app crashes
  mid-sync.
- **Alternatives considered**: CRDTs / operational transforms — rejected: overkill for a
  single-owner, low-concurrency app. Full bidirectional 3-way merge — rejected for v1
  complexity; LWW + audit is the documented, acceptable strategy per the spec.

## D9. Clock-skew tolerance

- **Decision**: Conflict comparison uses each record's `updatedAt` set on write; the sync
  engine tolerates reasonable skew by preferring the server-acknowledged order when two
  timestamps are within a small window, and always records `deviceId` so ties are auditable.
- **Rationale**: Addresses the clock-difference edge case without requiring a time server.
- **Alternatives considered**: Strict logical clocks (Lamport/vector) — deferred to v2 if
  multi-device concurrency proves higher than expected.

## D10. Reports & exports: pdfkit + exceljs

- **Decision**: Generate PDFs with pdfkit (branded header from `branding.json`, language
  per export) and Excel/CSV with exceljs; run generation in the main process to keep the
  UI responsive and hit the < 5s target.
- **Rationale**: Matches PRD; both libraries are mature and run server-side (main process).
- **Alternatives considered**: HTML-to-PDF via headless rendering — rejected: heavier and
  slower for tabular financial reports.

## D11. Scheduled alerts: node-cron

- **Decision**: A main-process scheduler evaluates rent/installment/gam3eyya/subscription
  due rules and payroll-ready conditions, emitting in-app notifications and OS desktop
  notifications, with an alert log persisted in SQLite. De-duplication keys prevent
  repeat alerts for the same trigger window (SC-010).
- **Rationale**: Runs even when windows are focused/blurred; persists across navigation.
- **Alternatives considered**: Renderer-side timers — rejected: stop when UI unmounts,
  unreliable for due-date guarantees.

## D12. Optional local lock (security)

- **Decision**: Optional PIN/password, disabled by default. When enabled, store a salted
  hash (e.g. scrypt/argon2 via Node crypto) in main-process config; require verification
  on launch before the renderer loads data. No plaintext stored (NFR). Disabling/enabling
  is an explicit settings action.
- **Rationale**: Implements FR-047/SC-015 with low friction; keeps the white-label/resale
  case usable (off by default).
- **Alternatives considered**: OS keychain-bound encryption — deferred to v2 alongside
  SQLCipher at-rest encryption.

## D13. Full backup & restore format

- **Decision**: Backup = a single portable archive containing a consistent SQLite snapshot
  (via the SQLite backup API / `VACUUM INTO`) plus `branding.json` and stored assets
  (logos/receipts), with a manifest (app version, schema version, created-at, deviceId).
  Restore validates the manifest/schema version, runs migrations if older, and atomically
  replaces the working database. Independent of cloud sync (FR-046/SC-013).
- **Rationale**: A consistent snapshot avoids partial/corrupt backups; the manifest enables
  safe cross-version and cross-machine restore.
- **Alternatives considered**: Raw file copy of the live DB — rejected: risks copying a
  mid-write state. Relying on cloud sync as the only recovery — rejected per clarification.

## D14. Testing strategy: Vitest + Playwright-for-Electron

- **Decision**: Vitest for unit tests (revenue/salary calculators, payroll, sync conflict
  logic, Zod validators, date/gam3eyya math); integration tests run repositories against a
  temporary SQLite file and the sync engine against a mock/in-memory Mongo; Playwright for
  Electron drives end-to-end journeys including RTL/LTR switch, dark/light, and branding,
  executed on both Windows and macOS in CI.
- **Rationale**: The financial calculators and sync logic are the highest-risk areas and
  are pure/easily unit-tested; e2e on both OSes enforces Principle III parity.
- **Alternatives considered**: Jest (slower with ESM/Vite), Spectron (deprecated) —
  rejected.

## D15. Build & packaging: electron-vite + electron-builder + electron-updater

- **Decision**: electron-vite for fast dev/build; electron-builder for signed Windows NSIS
  `.exe` and notarized macOS `.dmg`/`.app`; electron-updater for auto-updates.
- **Rationale**: Matches PRD; standard, well-supported toolchain meeting the packaging NFRs
  (min Windows 10 / macOS 12).
- **Alternatives considered**: Forge — viable; builder chosen for its mature multi-target
  signing/notarization config.

---

## Resolved unknowns

All Technical Context items are resolved; **no `NEEDS CLARIFICATION` markers remain**.
The four spec-level clarifications (optional lock, multi-device sync, backup/restore,
10k+/month scale) are reflected in D8, D9, D12, D13 and the performance/indexing notes in
`data-model.md`.
