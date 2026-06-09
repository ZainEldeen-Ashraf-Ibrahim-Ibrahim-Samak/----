---
description: "Task list for EduCenter Financial Management System implementation"
---

# Tasks: EduCenter Financial Management System

**Input**: Design documents from `/specs/001-educenter-finance/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (ipc-contract.md, sync-contract.md), quickstart.md

**Tests**: Targeted tests are included for the highest-risk logic (revenue/salary calculators, payroll, personal-finance math, service-line math, and sync conflict resolution) and for the IPC/sync contract obligations defined in `contracts/`. UI screens are validated via Playwright e2e at story checkpoints. Broad unit coverage of trivial code is not mandated.

**Organization**: Tasks are grouped by user story. Stories are ordered by spec priority (P1 → P2 → P3) and are independently testable after the Foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1–US9)
- All paths are relative to the repository root (see `plan.md` → Project Structure)

## Path Conventions

- Main process: `src/main/`, preload: `src/preload/`, renderer: `src/renderer/`, shared: `src/shared/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and toolchain

- [ ] T001 Initialize electron-vite + TypeScript (strict) project with main/preload/renderer entry points in `package.json`, `electron.vite.config.ts`, `tsconfig.json` (strict, noUncheckedIndexedAccess)
- [ ] T002 [P] Configure Tailwind CSS with CSS-variable theme tokens in `tailwind.config.ts` and `src/renderer/theme/tokens.css`
- [ ] T003 [P] Configure ESLint + Prettier with `typecheck` and `lint` npm scripts in `.eslintrc.cjs`, `.prettierrc`, `package.json`
- [ ] T004 [P] Set up Vitest config for unit + integration tests in `vitest.config.ts` and create `tests/` tree
- [ ] T005 [P] Set up Playwright-for-Electron e2e harness in `playwright.config.ts` and `tests/e2e/`
- [ ] T006 [P] Create source folder skeleton (`src/main`, `src/preload`, `src/renderer`, `src/shared`) with index stubs per plan
- [ ] T007 [P] Configure electron-builder for Windows NSIS + macOS dmg targets in `electron-builder.yml`
- [ ] T008 [P] Add electron-updater wiring stub in `src/main/platform/updater.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Define shared enums/constants (salary modes, statuses, payment status, alert types) in `src/shared/constants/index.ts`
- [ ] T010 [P] Implement money utility (integer minor units, parse/format EGP) with unit test in `src/shared/money.ts` and `tests/unit/money.test.ts`
- [ ] T011 Create base entity + sync/audit Zod schema (id, createdAt, updatedAt, deviceId, version, deleted) in `src/shared/schemas/base.ts`
- [ ] T012 Implement SQLite connection (better-sqlite3) and migration runner in `src/main/db/connection.ts` and `src/main/db/migrations/runner.ts`
- [ ] T013 Create initial migration: sync/audit column convention + `sync_record` table in `src/main/db/migrations/0001_init.ts`
- [ ] T014 Implement base Repository that writes the domain row + a `sync_record` row in a single transaction in `src/main/db/repositories/base-repository.ts`
- [ ] T015 Implement IPC result envelope + Zod validation wrapper (`IpcResult<T>`) in `src/main/ipc/handler.ts`
- [ ] T016 Implement context-isolated preload bridge exposing the typed invoke API in `src/preload/index.ts`
- [ ] T017 Implement Electron main bootstrap (window lifecycle, contextIsolation true, nodeIntegration false, load renderer) in `src/main/index.ts`
- [ ] T018 [P] Implement platform adapter (paths, dialogs, OS notifications) in `src/main/platform/index.ts`
- [ ] T019 [P] Implement error handling + structured logging in `src/main/services/logger.ts`
- [ ] T020 [P] Implement minimal renderer mount + React Router shell (placeholder sidebar/topbar) in `src/renderer/app/Root.tsx` and `src/renderer/app/router.tsx`
- [ ] T021 [P] Implement IPC query/mutation hooks helper in `src/renderer/hooks/useIpc.ts`
- [ ] T022 Implement app settings store (electron-store: language, theme, in-center service types, sync config) in `src/main/services/settings.ts`

**Checkpoint**: Foundation ready — the app launches, persists to SQLite, and exposes validated IPC. User stories can begin.

---

## Phase 3: User Story 1 - Record Sessions & Auto-Calculate Revenue Split (Priority: P1) 🎯 MVP

**Goal**: Owner records a session and the system instantly computes total revenue, teacher earning, and owner net per the teacher's salary mode, updating the center and teacher ledgers.

**Independent Test**: Create one center + one teacher, record a session of N students at price P, and confirm total = N×P, teacher cut matches the salary mode, owner net = total − teacher cut; override price for one session; mark collected.

### Tests for User Story 1 ⚠️

- [ ] T023 [P] [US1] Unit tests for revenue/salary calculators — all three modes + zero/edge cases in `tests/unit/revenue.test.ts`
- [ ] T024 [P] [US1] Contract test for `session:*` channels (preview/create/markCollected) per `contracts/ipc-contract.md` in `tests/integration/session-ipc.test.ts`

### Implementation for User Story 1

- [ ] T025 [P] [US1] Center Zod schema + type in `src/shared/schemas/center.ts`
- [ ] T026 [P] [US1] Teacher Zod schema with salaryType refinement (required rate per mode) in `src/shared/schemas/teacher.ts`
- [ ] T027 [P] [US1] Session Zod schema (computed + snapshotted salary fields) in `src/shared/schemas/session.ts`
- [ ] T028 [US1] Migration for `centers`, `teachers`, `sessions` tables (with indexes per data-model) in `src/main/db/migrations/0002_core.ts`
- [ ] T029 [P] [US1] CenterRepository in `src/main/db/repositories/center-repository.ts`
- [ ] T030 [P] [US1] TeacherRepository in `src/main/db/repositories/teacher-repository.ts`
- [ ] T031 [P] [US1] SessionRepository in `src/main/db/repositories/session-repository.ts`
- [ ] T032 [US1] Revenue/salary calculator (fixed / per-session / revenue-share, snapshot terms, zero-safe) in `src/main/services/revenue/calculator.ts`
- [ ] T033 [US1] Session draft autosave service for crash recovery in `src/main/services/revenue/draft.ts`
- [ ] T034 [US1] `center:*` and `teacher:*` CRUD IPC handlers in `src/main/ipc/center.ts` and `src/main/ipc/teacher.ts`
- [ ] T035 [US1] `session:*` IPC handlers (list/preview/create/update/markCollected/draft) in `src/main/ipc/session.ts`
- [ ] T036 [P] [US1] Centers list + create/edit screen in `src/renderer/pages/centers/CentersList.tsx`
- [ ] T037 [P] [US1] Teachers list + profile/edit screen with salary configuration in `src/renderer/pages/teachers/TeachersList.tsx`
- [ ] T038 [US1] New Session form with live calculation (calls `session:preview`) in `src/renderer/pages/sessions/NewSession.tsx`
- [ ] T039 [US1] Sessions log list with collected/pending + mark-collected action in `src/renderer/pages/sessions/SessionsLog.tsx`

**Checkpoint**: Session revenue engine fully functional and independently testable — the MVP.

---

## Phase 4: User Story 2 - Bilingual, Themeable, White-Label Application Shell (Priority: P1)

**Goal**: Run in Arabic (RTL) or English (LTR), switch dark/light, and customize name/logo/accent/icon at runtime from settings.

**Independent Test**: Switch to Arabic → full RTL mirror; toggle dark mode → all screens adapt and persist; change name + logo + accent → applies immediately and after restart; resize narrow → sidebar collapses, tables scroll.

### Tests for User Story 2 ⚠️

- [ ] T040 [P] [US2] e2e test: language switch (RTL/LTR), theme toggle persistence, branding apply in `tests/e2e/shell.spec.ts`

### Implementation for User Story 2

- [ ] T041 [P] [US2] react-i18next setup + base `ar.json` / `en.json` resource files in `src/renderer/i18n/`
- [ ] T042 [US2] RTL/LTR direction handling (root `dir` attribute + Tailwind logical properties) in `src/renderer/app/DirectionProvider.tsx`
- [ ] T043 [P] [US2] Dark/light theme via CSS variables, OS default, persisted choice in `src/renderer/theme/ThemeProvider.tsx`
- [ ] T044 [US2] BrandingConfig schema + main-process branding service reading/writing `branding.json` (with fallback) in `src/shared/schemas/branding.ts` and `src/main/branding/index.ts`
- [ ] T045 [US2] `branding:*` IPC handlers (get/set/setIcon) + live `branding:changed` event in `src/main/ipc/branding.ts`
- [ ] T046 [US2] Runtime app/tray icon swap via nativeImage (per-OS fallback) in `src/main/branding/icon.ts`
- [ ] T047 [US2] Settings → Branding screen (name, logo upload, accent color picker, live preview) in `src/renderer/pages/settings/Branding.tsx`
- [ ] T048 [US2] Responsive layout shell — collapsible sidebar, horizontal table scroll, topbar language/theme toggles in `src/renderer/app/Layout.tsx`
- [ ] T049 [P] [US2] Apply branding accent + name to title bar, sidebar, and report headers in `src/renderer/app/Branding.tsx`

**Checkpoint**: Full bilingual, themeable, white-label shell wrapping US1 screens.

---

## Phase 5: User Story 3 - Centers Management with Rent Ledger & Due Alerts (Priority: P2)

**Goal**: Configure centers, keep a rent ledger with receipts, get rent-due alerts, and view per-center monthly P&L.

**Independent Test**: Create center with rent due day 5 + 7-day alert; log a rent payment with receipt; advance clock to 7 days before due → alert appears; view monthly P&L.

### Tests for User Story 3 ⚠️

- [ ] T050 [P] [US3] Unit test for center P&L computation + rent-due alert rule in `tests/unit/center-pnl.test.ts`

### Implementation for User Story 3

- [ ] T051 [P] [US3] RentPayment + Expense (+ Utility) schemas in `src/shared/schemas/rent.ts` and `src/shared/schemas/expense.ts`
- [ ] T052 [US3] Migration for `rent_payments`, `expenses`, utilities in `src/main/db/migrations/0003_centers.ts`
- [ ] T053 [P] [US3] RentPaymentRepository + ExpenseRepository in `src/main/db/repositories/rent-repository.ts` and `expense-repository.ts`
- [ ] T054 [US3] Center P&L report builder (revenue − rent/utilities/expenses/teacher cuts) in `src/main/services/reports/center-pnl.ts`
- [ ] T055 [US3] Rent-due alert rule + node-cron scheduler registration in `src/main/services/alerts/rent.ts`
- [ ] T056 [US3] `center:rent:*` and `center:pnl` IPC handlers in `src/main/ipc/center.ts`
- [ ] T057 [US3] Center Detail screen with rent ledger + receipt upload + monthly P&L in `src/renderer/pages/centers/CenterDetail.tsx`

**Checkpoint**: Centers manageable with rent tracking, alerts, and P&L.

---

## Phase 6: User Story 4 - Automated Monthly Payroll (Priority: P2)

**Goal**: Auto-compute each teacher's monthly salary from sessions, review/deduct, mark paid/pending/partial, generate slips, and lock the month.

**Independent Test**: With a month of sessions, compute payroll → salary matches mode; record a partial payment; lock month → edits blocked; unlock requires a reason.

### Tests for User Story 4 ⚠️

- [ ] T058 [P] [US4] Unit test payroll computation per salary mode + month-lock behavior in `tests/unit/payroll.test.ts`

### Implementation for User Story 4

- [ ] T059 [P] [US4] PayrollMonth + PayrollEntry + Staff schemas in `src/shared/schemas/payroll.ts`
- [ ] T060 [US4] Migration for `payroll_months`, `payroll_entries`, `staff` in `src/main/db/migrations/0004_payroll.ts`
- [ ] T061 [P] [US4] PayrollRepository in `src/main/db/repositories/payroll-repository.ts`
- [ ] T062 [US4] Payroll computation service (aggregate month sessions, deductions, net) in `src/main/services/payroll/compute.ts`
- [ ] T063 [US4] Month lock/unlock service with audit trail in `src/main/services/payroll/lock.ts`
- [ ] T064 [US4] Salary slip PDF generator (pdfkit, branded, per language) in `src/main/services/export/salary-slip.ts`
- [ ] T065 [US4] `payroll:*` IPC handlers in `src/main/ipc/payroll.ts`
- [ ] T066 [US4] Monthly Payroll screen (sheet, payment status, lock, slip export) in `src/renderer/pages/payroll/Payroll.tsx`

**Checkpoint**: Payroll computed, paid, slipped, and lockable.

---

## Phase 7: User Story 8 - Unified Dashboard, Reports & Exports (Priority: P2)

**Goal**: Single dashboard across all entities plus branded, filterable reports exportable to PDF and Excel/CSV in either language.

**Independent Test**: Dashboard totals equal sum of entities; generate a monthly P&L; export PDF (with branding + language) and Excel.

### Tests for User Story 8 ⚠️

- [ ] T067 [P] [US8] Unit test dashboard aggregation + report filtering by date/entity in `tests/unit/dashboard.test.ts`

### Implementation for User Story 8

- [ ] T068 [P] [US8] Report/export schemas + types in `src/shared/schemas/report.ts`
- [ ] T069 [US8] Dashboard summary service (combined + per-entity revenue, upcoming dues, top teachers, trend) in `src/main/services/reports/dashboard.ts`
- [ ] T070 [P] [US8] Report builders (session revenue, combined cash flow, outstanding payments) in `src/main/services/reports/builders.ts`
- [ ] T071 [US8] PDF report exporter (branded header, language) in `src/main/services/export/pdf-report.ts`
- [ ] T072 [US8] Excel/CSV exporter (exceljs) in `src/main/services/export/excel-report.ts`
- [ ] T073 [US8] `dashboard:*` and `report:*` IPC handlers in `src/main/ipc/reports.ts`
- [ ] T074 [P] [US8] Dashboard screen (widgets, Recharts charts, date/entity filters) in `src/renderer/pages/dashboard/Dashboard.tsx`
- [ ] T075 [US8] Reports screen (type/date/entity/language/format selectors + in-app table view) in `src/renderer/pages/reports/Reports.tsx`

**Checkpoint**: Whole-business visibility and exportable reports.

---

## Phase 8: User Story 5 - Personal Financial Management (Priority: P3)

**Goal**: Track installments, gam3eyya, and subscriptions with computed balances/dates and due alerts, fully separate from business.

**Independent Test**: Installment 12000/12 with 3 paid → remaining 9000; gam3eyya 10×1000 round 4 → payout 10000 + receipt date; subscription advances next due date.

### Tests for User Story 5 ⚠️

- [ ] T076 [P] [US5] Unit test installment remaining, gam3eyya receipt date, subscription cycle advance in `tests/unit/personal.test.ts`

### Implementation for User Story 5

- [ ] T077 [P] [US5] Installment, Gam3eyya, Subscription, PersonalCashFlow schemas in `src/shared/schemas/personal.ts`
- [ ] T078 [US5] Migration for personal tables in `src/main/db/migrations/0005_personal.ts`
- [ ] T079 [P] [US5] Personal repositories in `src/main/db/repositories/personal-repository.ts`
- [ ] T080 [US5] Personal computation services (remaining balance, receipt date, next due, delayed status) in `src/main/services/personal/index.ts`
- [ ] T081 [US5] Installment/gam3eyya/subscription due-alert rules in `src/main/services/alerts/personal.ts`
- [ ] T082 [US5] `personal:*` IPC handlers in `src/main/ipc/personal.ts`
- [ ] T083 [P] [US5] Personal screens: Installments, Gam3eyya, Subscriptions, Cash Flow in `src/renderer/pages/personal/`

**Checkpoint**: Personal finances tracked separately with alerts.

---

## Phase 9: User Story 6 - Service Line Tracking: Studio, Mobile, In-Center (Priority: P3)

**Goal**: Track studio bookings, mobile jobs (with net profit), and in-center services with configurable types; each reports its own net.

**Independent Test**: Studio 2h booking → due = 2×rate; mobile job transport 100 + labor 200 charged 500 → net 200; in-center service of a configured type recorded.

### Tests for User Story 6 ⚠️

- [ ] T084 [P] [US6] Unit test studio/mobile/in-center amount + net calculations in `tests/unit/service-lines.test.ts`

### Implementation for User Story 6

- [ ] T085 [P] [US6] StudioBooking, MobileJob, InCenterService schemas in `src/shared/schemas/services.ts`
- [ ] T086 [US6] Migration for service-line tables in `src/main/db/migrations/0006_services.ts`
- [ ] T087 [P] [US6] Service-line repositories in `src/main/db/repositories/service-line-repository.ts`
- [ ] T088 [US6] Service-line services (computed totals/net, configurable service types from settings) in `src/main/services/service-lines/index.ts`
- [ ] T089 [US6] `studio:*` / `mobile:*` / `incenter:*` IPC handlers in `src/main/ipc/services.ts`
- [ ] T090 [P] [US6] Studio Bookings, Mobile Jobs, and In-Center Services screens in `src/renderer/pages/services/`

**Checkpoint**: All three service lines tracked with their own P&L.

---

## Phase 10: User Story 7 - Company Financials (Priority: P3)

**Goal**: Manage the partner company as a separate entity with revenue, expenses, payroll, monthly P&L, and shared-cost allocation.

**Independent Test**: Record company revenue + expenses → company P&L; record a 60/40 shared expense → company books 60%, center books 40%.

### Tests for User Story 7 ⚠️

- [ ] T091 [P] [US7] Unit test company P&L + shared-cost allocation split in `tests/unit/company.test.ts`

### Implementation for User Story 7

- [ ] T092 [P] [US7] CompanyRevenue + shared allocation schema in `src/shared/schemas/company.ts`
- [ ] T093 [US7] Migration for company tables in `src/main/db/migrations/0007_company.ts`
- [ ] T094 [P] [US7] Company repository in `src/main/db/repositories/company-repository.ts`
- [ ] T095 [US7] Company P&L + shared-cost allocation service in `src/main/services/reports/company-pnl.ts`
- [ ] T096 [US7] `company:*` IPC handlers in `src/main/ipc/company.ts`
- [ ] T097 [US7] Company Financials screen in `src/renderer/pages/company/Company.tsx`

**Checkpoint**: Company books kept separate and complete.

---

## Phase 11: User Story 9 - Offline-First Operation with Background Cloud Sync (Priority: P3)

**Goal**: Full offline use with background MongoDB sync, deterministic conflict resolution, sync status + log; plus the optional local lock and full backup/restore that round out operational robustness (FR-046, FR-047).

**Independent Test**: With networking off, CRUD all succeed locally; re-enable → indicator goes offline→syncing→synced; two-device edit → higher `updatedAt` wins, logged; export then restore a backup → data fully recovered; enable PIN → relaunch requires it.

### Tests for User Story 9 ⚠️

- [ ] T098 [P] [US9] Unit test sync conflict resolution (LWW, deviceId tiebreak, idempotent retry) per `contracts/sync-contract.md` in `tests/unit/sync.test.ts`
- [ ] T099 [P] [US9] Integration test: offline CRUD persists, reconnect drains queue without duplication in `tests/integration/sync-engine.test.ts`

### Implementation for User Story 9

- [ ] T100 [P] [US9] SyncRecord schema + MongoDB envelope types in `src/shared/schemas/sync.ts`
- [ ] T101 [US9] MongoDB adapter (driver, TLS, upsert by `_id`, changed-since query) in `src/main/sync/mongo-adapter.ts`
- [ ] T102 [US9] Sync engine: push queue drain + pull merge (LWW + audit) + retry/backoff in `src/main/sync/engine.ts`
- [ ] T103 [US9] Background sync worker + connectivity detection + `sync:state` events in `src/main/sync/worker.ts`
- [ ] T104 [US9] `sync:*` IPC handlers (status/now/log/config) in `src/main/ipc/sync.ts`
- [ ] T105 [P] [US9] Sync status indicator (header) + Settings → Sync screen with log in `src/renderer/pages/settings/Sync.tsx`
- [ ] T106 [P] [US9] Local lock service (salted hash via Node crypto, verify) + `lock:*` IPC + launch gate in `src/main/security/lock.ts` and `src/renderer/pages/Lock.tsx`
- [ ] T107 [P] [US9] Backup export/restore service (consistent snapshot + manifest + atomic swap) + `backup:*` IPC in `src/main/services/backup/index.ts` and Settings → Backup screen

**Checkpoint**: Offline-first sync, conflict resolution, backup/restore, and optional lock all working.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Concerns spanning multiple stories

- [ ] T108 [P] Alert log screen + notification bell badge + OS desktop notification wiring in `src/renderer/pages/alerts/` and `src/main/services/alerts/dispatch.ts`
- [ ] T109 [P] Localization formatting: EGP currency, optional Arabic-Indic numerals, optional Hijri dates in `src/renderer/i18n/format.ts`
- [ ] T110 [P] Full RTL/LTR + dark/light QA pass across all screens (quickstart checklist) in `tests/e2e/visual.spec.ts`
- [ ] T111 [P] Performance pass: verify indexing + pagination hold at 10,000+ sessions/month (SC-014) in `tests/integration/perf.test.ts`
- [ ] T112 [P] electron-builder packaging: signed Windows `.exe` (NSIS) + notarized macOS `.dmg` + electron-updater channel
- [ ] T113 [P] Onboarding/user-guide screen + empty states for all lists in `src/renderer/pages/onboarding/`
- [ ] T114 Run full `quickstart.md` validation end-to-end on both Windows and macOS

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–11)**: all depend on Foundational; ordered by priority (US1, US2 = P1; US3, US4, US8 = P2; US5, US6, US7, US9 = P3)
- **Polish (Phase 12)**: depends on the user stories it touches

### User Story Dependencies

- **US1 (P1)**: depends only on Foundational. The MVP.
- **US2 (P1)**: depends only on Foundational; enriches the shell that hosts US1 screens (US1 screens work in default LTR/light before US2; US2 makes them bilingual/themeable/branded).
- **US3 (P2)**: builds on US1's Center/Session data to compute P&L; needs the alert scheduler (introduced here).
- **US4 (P2)**: depends on US1 sessions (payroll aggregates sessions); reuses PDF export.
- **US8 (P2)**: aggregates data from US1/US3/US4 (and later stories); best after the P2 stories exist, but degrades gracefully with whatever data is present.
- **US5, US6, US7 (P3)**: independent of each other; depend only on Foundational (and contribute to US8's dashboard/reports).
- **US9 (P3)**: depends on Foundational's `sync_record` write convention; independent of feature stories (it syncs whatever exists). Backup/lock are self-contained.

### Within Each User Story

- Tests (where present) before implementation of that story
- Schemas → migration → repositories → services → IPC handlers → UI screens
- Story complete and independently testable before moving to the next priority

---

## Parallel Opportunities

- All `[P]` Setup tasks (T002–T008) can run together after T001.
- Foundational `[P]` tasks (T009, T010, T018, T019, T020, T021) can run in parallel; T011–T017 and T022 have ordering among DB/IPC bootstrap.
- Within a story, `[P]` schema/repository/screen tasks on different files run in parallel; the migration and IPC-handler tasks for that story are typically serial (shared files).
- After Foundational, P3 stories US5/US6/US7 can be built in parallel by different developers (no cross-dependencies).

### Parallel Example: User Story 1

```bash
# After T028 (migration) lands, run repositories in parallel:
Task: "CenterRepository in src/main/db/repositories/center-repository.ts"   # T029
Task: "TeacherRepository in src/main/db/repositories/teacher-repository.ts" # T030
Task: "SessionRepository in src/main/db/repositories/session-repository.ts" # T031

# Schemas earlier are also parallel:
Task: "Center schema"  # T025
Task: "Teacher schema" # T026
Task: "Session schema" # T027
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational).
2. Complete Phase 3 (US1 — session revenue engine).
3. **STOP and VALIDATE**: run T023/T024 and the US1 quickstart steps; the owner can already replace manual per-student revenue calculation.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 (revenue engine) → **MVP**, demo.
3. US2 (bilingual/theme/branding shell) → resale-ready UX.
4. US3 (centers/rent) → per-center P&L + alerts.
5. US4 (payroll) → automated salaries.
6. US8 (dashboard/reports) → unified visibility.
7. US5 / US6 / US7 (personal, service lines, company) → complete the financial picture.
8. US9 (offline sync + backup + lock) → multi-device durability.
9. Polish → packaging, localization formatting, QA, onboarding.

### Parallel Team Strategy

After Foundational: one developer takes US1, another US2 (P1 pair); once P2 stories land, split US5/US6/US7 across developers since they are mutually independent; US9 can proceed alongside since it only consumes the shared `sync_record` convention.

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks.
- Every task lists an exact file path; financial calculations and sync logic carry dedicated tests (highest risk).
- Each `sync_record` write happens in the same SQLite transaction as its domain mutation (Constitution Principle II) — keep this invariant in every repository.
- Money is integer minor units everywhere; only format at the UI boundary.
- Verify each story against both OS targets, both languages (RTL/LTR), and both themes before marking done (Constitution Definition of Done).
