# Feature Specification: EduCenter Financial Management System

**Feature Branch**: `001-educenter-finance`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "plan001.md — EduCenter Financial Management System: a cross-platform desktop application for managing the complete financial and operational lifecycle of a multi-center educational business (two centers, three service lines, a partner company, and the owner's personal finances) — offline-first with cloud sync, bilingual (Arabic RTL / English LTR), themeable, and white-labelable."

## Clarifications

### Session 2026-06-09

- Q: Should the app require a local lock (PIN/password) on launch to protect financial data? → A: Optional PIN/password — off by default, owner can enable a local lock required on launch.
- Q: Is v1 used on a single machine or synced across multiple of the owner's devices? → A: Multi-device via cloud sync — multi-device use and conflict resolution are explicitly in v1 scope.
- Q: Does v1 need a manual local backup/restore of the entire database? → A: Yes — owner can export a full backup file and restore from it.
- Q: What data volume should the design target (sessions per month across all centers)? → A: 10,000+ sessions/month, with multiple years of history retained.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record Sessions & Auto-Calculate Revenue Split (Priority: P1)

The owner records a teaching session by selecting a center and teacher, entering the
date, the number of students present, and the price per student. The system instantly
calculates the session's total revenue, the teacher's earning (according to that
teacher's salary terms), and the owner's net, then records it against the center's
revenue ledger and the teacher's earnings ledger.

**Why this priority**: This is the core revenue engine and the primary pain point —
session revenue is currently calculated per-student by hand. Without it the product
delivers no value; with it alone the owner already replaces manual calculation.

**Independent Test**: Create one center and one teacher, record a session of N students
at price P, and confirm total = N×P, the teacher cut matches the teacher's salary mode,
and the owner net = total − teacher cut. Fully demonstrable on its own.

**Acceptance Scenarios**:

1. **Given** an active center and a teacher on a revenue-share term, **When** the owner saves a session with 10 students at 50 each and a 30% owner share, **Then** total revenue is 500, owner net is 150, and teacher earning is 350.
2. **Given** a teacher on a per-session rate, **When** a session is saved, **Then** the teacher earning equals the fixed per-session rate regardless of student count.
3. **Given** a teacher on a fixed monthly salary, **When** a session is saved, **Then** the session adds to revenue but the teacher earning attributed per session is zero (salary handled in payroll).
4. **Given** the price per student is auto-filled from the teacher profile, **When** the owner overrides it for a single session, **Then** the override is used for that session only.
5. **Given** a saved session, **When** the owner marks it as collected, **Then** it moves from pending to collected and the collection date is recorded.

---

### User Story 2 - Bilingual, Themeable, White-Label Application Shell (Priority: P1)

The owner runs the application in Arabic (right-to-left) or English (left-to-right),
switches between dark and light themes, and customizes the product's name, logo, and
accent color from an in-app settings panel — without reinstalling or rebuilding.

**Why this priority**: Arabic-first RTL, theming, and white-label branding are explicit,
non-negotiable requirements (the product must be resalable under another brand). The
application shell carries every other feature, so it must exist from the start.

**Independent Test**: Launch the app, switch language to Arabic and confirm the entire
layout mirrors to RTL; toggle dark mode and confirm all screens adapt; change the app
name, upload a logo, and pick an accent color, and confirm they apply immediately and
persist after restart.

**Acceptance Scenarios**:

1. **Given** the app is in English (LTR), **When** the owner switches to Arabic, **Then** the sidebar moves to the right, text aligns right, and all visible labels appear in Arabic.
2. **Given** any screen, **When** the owner toggles dark/light mode, **Then** all components re-theme with no unreadable or hard-coded colors, and the choice persists across restarts.
3. **Given** the branding settings, **When** the owner sets a new app name, uploads a logo, and picks an accent color, **Then** the title bar, sidebar, and report headers reflect the new branding immediately.
4. **Given** a custom branding asset is missing or invalid, **When** the app loads, **Then** it falls back to defaults and remains fully functional.
5. **Given** the window is resized from wide to narrow, **When** it drops below the comfortable width, **Then** the sidebar collapses to icons and tables scroll horizontally without breaking layout.

---

### User Story 3 - Centers Management with Rent Ledger & Due Alerts (Priority: P2)

The owner configures each educational center (name, address, rent amount, due day,
landlord, utilities, capacity), records rent payments with receipts in a rent ledger,
and receives alerts ahead of each rent due date. Each center maintains its own
profit-and-loss summary.

**Why this priority**: Centers are the operating units that sessions and payroll attach
to, and informal rent tracking is a stated pain point. It builds directly on the revenue
engine (US1) to produce per-center P&L.

**Independent Test**: Create a center with a monthly rent and due day, log a rent payment
with a receipt, and confirm the ledger entry and that a due alert is generated within the
configured window before the due date.

**Acceptance Scenarios**:

1. **Given** a center with rent due on day 5 and a 7-days-before alert, **When** the date reaches 7 days before the 5th, **Then** a rent-due alert is raised.
2. **Given** a center, **When** the owner records a rent payment with an attached receipt, **Then** it appears in the rent ledger history with amount, date, and receipt.
3. **Given** a center with recorded sessions and expenses for a month, **When** the owner views the monthly P&L, **Then** it shows revenue − (rent + utilities + expenses + teacher cuts) = net.

---

### User Story 4 - Automated Monthly Payroll (Priority: P2)

At month end the owner opens the payroll sheet; the system has auto-calculated each
teacher's salary from that month's session records and salary terms. The owner reviews,
applies deductions, marks each payment as paid/pending/partial with a method and date,
generates salary slips, and locks the month so past payroll cannot be edited.

**Why this priority**: Centralized payroll is a stated pain point and depends on the
session data from US1. It is high value but not required for the first revenue-tracking MVP.

**Independent Test**: With a month of sessions for a teacher, open payroll and confirm the
computed salary matches the salary mode; mark it paid and generate a slip; lock the month
and confirm past entries become read-only.

**Acceptance Scenarios**:

1. **Given** a month of sessions for a per-session teacher, **When** payroll is opened, **Then** the salary due equals sessions × rate.
2. **Given** a payroll row, **When** the owner records a partial payment, **Then** the status shows partial and the remaining amount is tracked.
3. **Given** a completed month, **When** the owner locks it, **Then** no payroll row for that month can be edited.
4. **Given** non-teacher staff with a fixed monthly salary, **When** payroll is generated, **Then** they appear with their fixed salary attributed to their center.

---

### User Story 5 - Personal Financial Management (Priority: P3)

The owner tracks personal obligations separate from all business entities: installments
(أقساط) with remaining balances and due-day reminders, gam3eyya (جمعية) participation with
round and estimated receipt date, and recurring subscriptions (اشتراكات) with next due
dates — plus a simple personal cash-flow view.

**Why this priority**: Solves real pain points (notebook-tracked gam3eyya, undigitized
installments) and enforces separation of personal vs. business cash, but is independent of
the business revenue core.

**Independent Test**: Add an installment with total, monthly amount, and duration; confirm
remaining balance and due alerts compute correctly. Add a gam3eyya and confirm the
estimated receipt date and total payout. Add a subscription and confirm the next due date.

**Acceptance Scenarios**:

1. **Given** an installment of total 12000 over 12 months with 3 paid, **When** viewed, **Then** remaining is 9000 and status is active.
2. **Given** an installment due on day 10 with a 5-days-before alert, **When** the date reaches day 5, **Then** an installment-due alert is raised.
3. **Given** a gam3eyya of 10 members at 1000/month with the owner's round = 4 and a start date, **When** viewed, **Then** total payout = 10000 and the estimated receipt date reflects the 4th round.
4. **Given** a monthly subscription, **When** a billing cycle passes, **Then** the next due date advances by one cycle.

---

### User Story 6 - Service Line Tracking: Studio, Mobile, In-Center (Priority: P3)

The owner tracks the three service lines independently: photography-studio bookings
(hourly/package/internal) with payment status, mobile-teacher-service jobs (with transport
and labor costs and net profit per job), and in-center teacher services (configurable
service types). Each line reports its own revenue, costs, and net.

**Why this priority**: These are distinct revenue streams that complete the financial
picture but are secondary to the centers' core session revenue.

**Independent Test**: Create a studio booking at an hourly rate and confirm amount due and
payment status; create a mobile job with transport + labor costs and confirm net profit =
charged − costs; record an in-center service of a configured type.

**Acceptance Scenarios**:

1. **Given** a studio hourly rate, **When** a 2-hour booking is recorded, **Then** amount due = 2 × hourly rate and payment status defaults to pending.
2. **Given** a center teacher booking the studio at an internal rate, **When** recorded, **Then** the internal (free/discounted) rate is applied.
3. **Given** a mobile job with transport 100 and labor 200 charged at 500, **When** saved, **Then** net profit = 200.
4. **Given** a configured in-center service type, **When** a service is recorded for a teacher, **Then** it appears under that center with its charged amount and payment status.

---

### User Story 7 - Company Financials (Priority: P3)

The owner manages the partner company as a separate financial entity with its own revenue
log, expense log, payroll, and monthly P&L, including allocation of costs shared between
the company and a center.

**Why this priority**: Keeps the partner company's books separate and complete, but is
independent of the educational-center core.

**Independent Test**: Record company revenue and expenses for a month and confirm the
company P&L; record a shared expense split between company and a center and confirm each
side reflects its allocated share.

**Acceptance Scenarios**:

1. **Given** company revenue and expense entries for a month, **When** the company P&L is viewed, **Then** it shows revenue − expenses = net for the company only.
2. **Given** a shared expense split 60/40 between company and a center, **When** recorded, **Then** the company books 60% and the center books 40%.

---

### User Story 8 - Unified Dashboard, Reports & Exports (Priority: P2)

The owner sees a single dashboard summarizing the whole business — combined and per-entity
revenue, upcoming rent and installment dues, gam3eyya round, top teachers, and an
expense-vs-revenue trend — and generates branded reports (P&L, payroll, session revenue,
personal summary, cash flow, outstanding payments) filtered by date range and entity,
exportable to PDF and Excel/CSV in either language.

**Why this priority**: Delivers the "unified view" that is a central goal, and depends on
data produced by the other stories; valuable early for visibility but not part of the
absolute first slice.

**Independent Test**: With data present, open the dashboard and confirm the combined and
per-entity revenue figures match the underlying records; generate a monthly P&L report,
export it to PDF with the current branding, and to Excel, in Arabic and in English.

**Acceptance Scenarios**:

1. **Given** sessions across two centers this month, **When** the dashboard loads, **Then** total revenue equals the sum of all entities and the per-entity chart reflects each center.
2. **Given** an upcoming rent due within 7 days, **When** the dashboard loads, **Then** it appears in the upcoming-dues widget.
3. **Given** a date range and an entity filter, **When** the owner generates a P&L report, **Then** only that entity's data for that range is included.
4. **Given** a report, **When** exported to PDF, **Then** the output carries the current white-label name, logo, and accent color and the chosen language.
5. **Given** a report, **When** exported to Excel/CSV, **Then** the raw data is downloadable for the same filters.

---

### User Story 9 - Offline-First Operation with Background Cloud Sync (Priority: P3)

The owner uses the entire application with no internet connection; every change is saved
locally first. When connectivity returns, changes synchronize to the cloud in the
background, conflicts are resolved deterministically, and a sync indicator shows current
status with a viewable sync log.

**Why this priority**: Offline-first reliability is a core promise, but the local-only
experience (all other stories) is fully usable before cloud sync is added, so sync can land
later without blocking value.

**Independent Test**: With networking disabled, perform create/update/delete operations and
confirm they succeed and persist; re-enable networking and confirm the queued changes
synchronize and the indicator transitions offline → syncing → synced.

**Acceptance Scenarios**:

1. **Given** no internet connection, **When** the owner records sessions, payments, and edits, **Then** all operations succeed and persist locally.
2. **Given** queued local changes, **When** connectivity returns, **Then** they sync in the background without blocking the UI and the indicator shows synced when complete.
3. **Given** the same record changed on two devices, **When** sync runs, **Then** the most recent change wins and the resolution is recorded for audit.
4. **Given** a sync failure, **When** it occurs, **Then** the indicator shows the failure, the owner is alerted, and pending changes are retried safely without duplication.

---

### Edge Cases

- A session is saved with zero students or a zero price — the system should accept it but compute zero revenue (or warn), never produce a negative or NaN value.
- A teacher belongs to multiple centers — session revenue and payroll must attribute to the correct center per session.
- A teacher's salary terms change mid-month — already-recorded sessions retain the terms in effect when they were recorded; payroll reflects per-session attribution.
- A month is locked, then the owner needs a correction — the system must require an explicit, audited unlock rather than silent edits.
- An installment or gam3eyya start date is in the past — computed remaining counts and receipt dates must still be correct.
- Currency and Arabic-Indic numerals — amounts must display correctly in both languages without rounding errors.
- A custom logo or icon file is corrupt or too large — the app rejects it gracefully and keeps the previous/default branding.
- The same change is made offline on two devices before either syncs — conflict resolution must not lose either user's audit trail.
- Clock differences between devices — timestamp-based conflict resolution must tolerate reasonable clock skew.

## Requirements *(mandatory)*

### Functional Requirements

**Core revenue & sessions**

- **FR-001**: System MUST allow the owner to record a session with center, teacher, date, start time, duration, subject, student count, and price per student.
- **FR-002**: System MUST auto-calculate session total revenue as student count × price per student.
- **FR-003**: System MUST auto-calculate the teacher's earning per session according to the teacher's salary mode (fixed, per-session, or revenue-share) and the owner's net as total − teacher earning.
- **FR-004**: System MUST auto-fill price per student from the teacher profile while allowing a per-session override.
- **FR-005**: System MUST let the owner mark session revenue as collected or pending and record the collection date.
- **FR-006**: System MUST update both the center revenue ledger and the teacher earnings ledger when a session is saved.

**Centers**

- **FR-007**: System MUST let the owner create and manage centers with name (Arabic + English), address, phone, rent amount, rent due day, landlord info, utilities, and capacity.
- **FR-008**: System MUST maintain a rent ledger per center with payment history and receipt attachments.
- **FR-009**: System MUST raise rent-due alerts at the configured intervals before and on the due date.
- **FR-010**: System MUST produce a monthly profit-and-loss summary per center.

**Teachers & payroll**

- **FR-011**: System MUST maintain a teacher registry with bilingual name, contact, subject, center assignment(s), service type, salary mode, applicable rates/percentages, optional tax deduction, and status.
- **FR-012**: System MUST auto-calculate each teacher's monthly salary from session records and salary terms.
- **FR-013**: System MUST let the owner review payroll, apply deductions, and mark each payment as paid, pending, or partial with method and date.
- **FR-014**: System MUST generate salary slips and allow exporting them.
- **FR-015**: System MUST let the owner lock a payroll month to prevent edits, with an explicit audited unlock to make corrections.
- **FR-016**: System MUST support fixed monthly salaries for non-teacher staff attributed to a center.

**Personal finance**

- **FR-017**: System MUST track installments with total amount, monthly amount, start date, duration, paid count, auto-computed remaining balance, due day, status, and a configurable reminder.
- **FR-018**: System MUST track gam3eyya participation with members, monthly contribution, owner's round, start date, auto-computed total payout and estimated receipt date, and status.
- **FR-019**: System MUST track recurring subscriptions with amount, billing cycle, auto-computed next due date, category, and auto-renew flag.
- **FR-020**: System MUST keep personal finances fully separate from all business entities and provide a personal cash-flow view.

**Service lines & company**

- **FR-021**: System MUST track studio bookings (hourly, package, or internal rate) with duration, amount due, amount paid, and payment status.
- **FR-022**: System MUST track mobile-service jobs with transport cost, labor cost, amount charged, and auto-computed net profit.
- **FR-023**: System MUST track in-center services using a configurable list of service types, with charged amount and payment status per center/teacher.
- **FR-024**: System MUST track the partner company as a separate entity with revenue, expenses, payroll, and monthly P&L, including allocation of costs shared with a center.

**Dashboard, reports & alerts**

- **FR-025**: System MUST present a dashboard with combined and per-entity revenue, upcoming rent and installment dues, next gam3eyya round, top-earning teachers, and an expense-vs-revenue trend, filterable by date range and entity.
- **FR-026**: System MUST generate reports including per-center P&L, payroll sheet, session revenue, studio bookings, personal finance summary, company P&L, combined cash flow, and outstanding payments.
- **FR-027**: System MUST export reports to PDF (with current branding) and Excel/CSV, selectable in Arabic or English.
- **FR-028**: System MUST track pending/outstanding collections distinctly from received revenue.
- **FR-029**: System MUST raise the alert types defined for rent due, installment due, gam3eyya round, subscription renewal, sync failure, and payroll readiness, surfaced both in-app and as desktop notifications, with an alert log.

**Application shell, i18n, theming & branding**

- **FR-030**: System MUST provide the full interface in Arabic (RTL) and English (LTR), switchable at runtime, with no hard-coded user-facing strings.
- **FR-031**: System MUST mirror layout, navigation, alignment, tables, and forms correctly between RTL and LTR.
- **FR-032**: System MUST support dark and light themes switchable at runtime, defaulting to the OS preference, with the choice persisted.
- **FR-033**: System MUST adapt responsively across window sizes, collapsing the sidebar and allowing horizontal table scroll at narrow widths without layout breakage.
- **FR-034**: System MUST let the owner change the product name, upload a logo, choose an accent color, and change the app icon from an in-app settings panel, applied without a rebuild and persisted.
- **FR-035**: System MUST fall back to default branding and remain functional when a custom branding asset is missing or invalid.

**Data, offline & sync**

- **FR-036**: System MUST persist all data locally and remain fully functional with no network connection.
- **FR-037**: System MUST confirm every write to local storage before reflecting it in the UI (no data loss on crash).
- **FR-038**: System MUST auto-save unsaved session drafts periodically to support crash recovery.
- **FR-039**: System MUST synchronize local changes to the cloud in the background when connectivity is available, without blocking the UI.
- **FR-040**: System MUST resolve sync conflicts deterministically (most-recent-change-wins) while retaining a per-record audit trail of device and timestamp.
- **FR-041**: System MUST display sync status (offline, syncing, synced, failed) and provide a viewable sync log.
- **FR-042**: System MUST retry failed or interrupted syncs safely without creating duplicates.
- **FR-045**: System MUST support multi-device use for a single owner: the same account's data syncs across more than one machine, and per-record device + timestamp tracking is used for conflict resolution.
- **FR-046**: System MUST let the owner export a full local backup to a file and restore the database from such a backup file, independent of cloud sync.

**Security & access**

- **FR-047**: System MUST provide an optional local lock (PIN or password), disabled by default, which when enabled is required to open the application; the app MUST remain fully functional with the lock disabled.

**Platform & localization**

- **FR-043**: System MUST run on Windows and macOS with identical behavior.
- **FR-044**: System MUST display currency (EGP) correctly in both languages and support optional Arabic-Indic numerals; Gregorian dates are the default with optional Hijri display.

### Key Entities *(include if feature involves data)*

- **Center**: An educational center; bilingual name, address, contact, rent terms (amount, due day, landlord), utilities, capacity, active status. Owns sessions, expenses, and a rent ledger.
- **Teacher**: A person delivering sessions or services; bilingual name, contact, subject, one or more center assignments, service type, salary mode and associated rates/percentages, optional tax, status. Linked to sessions and payroll.
- **Session**: A single class; references a center and teacher, with date/time, duration, subject, student count, price per student, and computed total revenue, teacher earning, owner net, and payment status. Core revenue record.
- **Student**: A basic registry record (name, grade, parent contact, associated teachers/centers, session history); secondary to financial tracking.
- **PayrollEntry / Salary Slip**: A teacher's or staff member's monthly salary derived from sessions and terms, with deductions, net, payment status/method/date, belonging to a lockable payroll month.
- **Installment**: A personal debt with total, monthly amount, schedule, paid count, remaining balance, due day, status, reminder, and payment history.
- **Gam3eyya**: A rotating-savings participation with members, contribution, owner's round, start date, computed payout and estimated receipt date, and status.
- **Subscription**: A recurring personal/business charge with amount, billing cycle, next due date, category, and auto-renew flag.
- **StudioBooking**: A studio reservation with client and type (external/center teacher), time window, duration, rate type and amount, charged/paid amounts, and status.
- **MobileJob**: An off-site service visit with client, location, date, service, team, transport and labor costs, amount charged, and computed net profit.
- **InCenterService**: A service to an in-center teacher of a configurable type, with center, teacher, date, charged amount, and status.
- **Company**: The partner company as a separate financial entity with its own revenue, expenses, payroll, and shared-cost allocations.
- **Branding Configuration**: The white-label settings — product name, logo, accent color, app icon, theme, and language preference.
- **Alert**: A scheduled or event-driven notification (rent, installment, gam3eyya, subscription, sync, payroll) with type, trigger, timing, and read state.
- **Sync Record**: An audit entry capturing entity, operation, record id, originating device, timestamp, and sync status for conflict resolution and the sync log.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An owner can record a session and see the computed total, teacher cut, and owner net in under 200 milliseconds after saving.
- **SC-002**: Session revenue is calculated with 100% accuracy versus the defined formulas across all three salary modes (zero manual recalculation needed).
- **SC-003**: The application launches and is ready to use in under 3 seconds on mid-range hardware.
- **SC-004**: The owner can generate any monthly report in under 5 seconds.
- **SC-005**: The application performs every create/read/update/delete operation successfully with no internet connection, and 100% of offline changes synchronize once connectivity returns.
- **SC-006**: Switching between Arabic (RTL) and English (LTR) re-lays out every screen correctly, verified on 100% of screens.
- **SC-007**: Every screen renders correctly in both dark and light themes with no unreadable elements.
- **SC-008**: The owner can rebrand the app (name, logo, accent color, icon) entirely from within the app, with changes visible immediately and after restart, and zero code changes required.
- **SC-009**: The system runs with identical feature behavior on Windows 10+ and macOS 12+.
- **SC-010**: Due alerts (rent, installment, gam3eyya, subscription) fire at their configured times with no missed or duplicate alerts.
- **SC-011**: Across all five financial entities, personal and business cash flows never co-mingle in any report or total.
- **SC-012**: Zero data loss occurs across app crashes — confirmed local persistence before UI update and recoverable unsaved drafts.
- **SC-013**: The owner can export a full backup file and fully restore the database from it on the same or another machine with no data loss.
- **SC-014**: Performance targets (SC-001, SC-003, SC-004) continue to hold with a database containing 10,000+ sessions per month and multiple years of accumulated history.
- **SC-015**: With the optional local lock enabled, the application cannot be opened without the correct PIN/password; with it disabled, the app opens directly.

## Assumptions

- The application is single-owner/single-operator; multi-user roles and permissions are out of scope for v1. Access protection is an optional local lock (PIN/password), off by default (see FR-047) — there is no multi-user login.
- Multi-device use by the single owner IS in scope for v1: the owner may run the app on more than one machine with cloud sync keeping them consistent (see FR-045), so conflict resolution is exercised, not merely theoretical.
- A full local backup can be exported to a file and restored independently of cloud sync (see FR-046); cloud sync is not the only recovery path.
- The system is designed to handle 10,000+ sessions per month across all centers with multiple years of retained history; performance targets must hold at that scale (see SC-014).
- Currency is EGP only in v1; multi-currency is out of scope.
- Dates default to Gregorian; Hijri display and Arabic-Indic numerals are optional toggles, not the default.
- The cloud sync target is a hosted document database the owner controls; an account/connection is configured once in settings, and sync is best-effort background, not real-time collaboration.
- Conflict resolution uses last-write-wins by timestamp with a device-tagged audit trail; true multi-user simultaneous editing is not a goal.
- Student management is intentionally minimal (a light registry) — the product's focus is financial tracking, not a full LMS/SIS.
- Receipts, logos, and exported files are stored locally; large-file handling and cloud asset storage are out of scope for v1.
- Auto-update distribution and code-signing/notarization are required for release but are delivery concerns handled outside the functional scope of individual stories.
- Minimum supported platforms are Windows 10 and macOS 12 (Monterey).
- The owner has basic familiarity with their own financial terms (rent, salary modes, gam3eyya rounds) needed to configure entities.
