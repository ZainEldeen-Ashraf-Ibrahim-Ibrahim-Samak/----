# Phase 1 Data Model: EduCenter Financial Management System

**Feature**: `001-educenter-finance` | **Date**: 2026-06-09

Derived from the spec's Key Entities and Functional Requirements. This is the logical
model used for both the local SQLite schema and the MongoDB sync documents. Every entity
has a corresponding Zod schema in `src/shared/schemas` (Principle I) and is mirrored as a
MongoDB collection of the same name for sync.

## Conventions (apply to every entity)

- **id**: `string` UUID, primary key, stable across local and cloud.
- **Sync/audit fields on every table**: `createdAt: Date`, `updatedAt: Date`,
  `deviceId: string` (origin of last write), `version: integer` (monotonic, bumped each
  write), `deleted: boolean` (soft delete so deletions propagate via sync).
- **Money**: stored as integer minor units (piastres) to avoid floating-point error
  (EGP); formatted for display per locale (FR-044).
- **Bilingual names**: `{ ar: string, en: string }` stored as two columns / one embedded
  object in Mongo.
- **Indexes**: see each entity; date and foreign-key columns are indexed to hold targets
  at 10,000+ sessions/month with multi-year history (SC-014).

---

## Center  (FR-007, FR-008, FR-010)

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | {ar,en} | required |
| address | string | |
| phone | string | |
| rentAmount | money | ≥ 0 |
| rentDueDay | int (1–31) | |
| landlordName | string | |
| landlordPhone | string | |
| utilities | Utility[] | embedded list (type, amount, dueDay) |
| capacity | int | rooms/students, optional |
| isActive | boolean | default true |

**Relationships**: 1—N Sessions, RentPayments, Expenses, InCenterServices.
**Indexes**: `isActive`.

### RentPayment (rent ledger)
`id, centerId(FK), amount(money), paidOn(Date), receiptPath(string?), method(enum cash|transfer), notes(string?)`. Index: `centerId, paidOn`.

### Expense (per center / per entity)
`id, entityType(enum center|company|studio), entityId(FK), category(string), amount(money), incurredOn(Date), sharedAllocation(json?), notes(string?)`. Supports shared cost split (FR-024). Index: `entityType, entityId, incurredOn`.

---

## Teacher  (FR-011)

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | {ar,en} | required |
| phone | string | |
| subject | string | |
| centerIds | UUID[] | may belong to multiple centers |
| serviceType | enum | in-center \| studio \| mobile \| multiple |
| salaryType | enum | fixed \| per-session \| revenue-share |
| fixedSalary | money? | required if salaryType=fixed |
| perSessionRate | money? | required if salaryType=per-session |
| revenueSharePercent | number? | 0–100; owner's % if revenue-share |
| taxDeductionPercent | number? | optional, 0–100 |
| status | enum | active \| inactive \| suspended |

**Validation**: the rate field required by `salaryType` MUST be present (Zod refinement).
**Relationships**: N—N Centers; 1—N Sessions; 1—N PayrollEntries.
**Indexes**: `status`, `serviceType`.

---

## Session  (FR-001–FR-006) — core revenue record

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| centerId | FK | required |
| teacherId | FK | required |
| date | Date | required |
| startTime | string (HH:mm) | |
| durationMinutes | int | |
| subject | string | |
| studentCount | int ≥ 0 | |
| pricePerStudent | money ≥ 0 | auto-filled from teacher, overridable |
| **totalRevenue** | money (computed) | = studentCount × pricePerStudent |
| **teacherEarning** | money (computed) | per salary mode (see rules) |
| **ownerNet** | money (computed) | = totalRevenue − teacherEarning |
| appliedSalaryType | enum (snapshot) | salary mode in effect at record time |
| appliedRate | money/number (snapshot) | rate/percent used (preserves mid-month change) |
| paymentStatus | enum | collected \| pending |
| collectedAt | Date? | set when marked collected |
| notes | string? | |

**Computation rules** (FR-003):
- `fixed`     → `teacherEarning = 0` per session (salary handled in payroll); `ownerNet = totalRevenue`.
- `per-session` → `teacherEarning = appliedRate` (flat), regardless of studentCount.
- `revenue-share` → `ownerNet = totalRevenue × ownerPercent`; `teacherEarning = totalRevenue − ownerNet`.
- Salary terms are **snapshotted** onto the session at save time so later teacher edits do not retroactively change recorded sessions (edge case in spec).
- Zero students/price → revenue 0, never negative/NaN (edge case).

**Relationships**: N—1 Center, N—1 Teacher.
**Indexes**: `centerId, date`; `teacherId, date`; `paymentStatus`. (Hot paths: monthly payroll, per-center P&L, outstanding collections.)

---

## Student (light registry)
`id, name, gradeLevel, parentPhone, teacherIds[], centerIds[]`. Secondary to finance (spec). Index: none critical.

---

## PayrollMonth & PayrollEntry  (FR-012–FR-016)

### PayrollMonth
`id, entityType(center|company), entityId(FK), year(int), month(int 1–12), locked(boolean default false), lockedAt(Date?)`. Unique: `(entityType, entityId, year, month)`.

### PayrollEntry
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| payrollMonthId | FK | |
| payeeType | enum | teacher \| staff |
| payeeId | FK | teacherId or staffId |
| sessionsCount | int (computed) | from sessions in month |
| studentsServed | int (computed) | |
| grossRevenue | money (computed) | |
| salaryDue | money (computed) | per salary mode |
| deductions | money | default 0 |
| netSalary | money (computed) | salaryDue − deductions |
| paymentStatus | enum | paid \| pending \| partial |
| amountPaid | money | for partial tracking |
| paymentDate | Date? | |
| paymentMethod | enum? | cash \| transfer |

**Lock rule** (FR-015): when `PayrollMonth.locked`, entries are read-only; an explicit,
audited unlock (records who/when) is required to edit.
**Staff** (non-teacher): `id, name, centerId(FK), fixedSalary(money), status`.

---

## Personal entities (kept separate from all business entities — FR-020)

### Installment  (FR-017)
`id, itemName{ar,en}, totalAmount(money), monthlyAmount(money), startDate(Date), durationMonths(int), paidCount(int), remainingAmount(money computed = total − paidCount×monthly), dueDayOfMonth(int), alertDaysBefore(int), status(active|completed|delayed), payments: InstallmentPayment[]`.
- **InstallmentPayment**: `date, amount(money), method(cash|transfer), notes?`.
- Status `delayed` when an expected payment date has passed without a matching payment.

### Gam3eyya  (FR-018)
`id, groupName, totalMembers(int), monthlyContribution(money), myRoundNumber(int), startDate(Date), estimatedReceiptDate(Date computed = startDate + (myRoundNumber−1) months), totalPayout(money computed = monthlyContribution × totalMembers), status(active|completed), notes?`.

### Subscription  (FR-019)
`id, serviceName, amount(money), billingCycle(monthly|yearly|custom), customCycleDays(int?), nextDueDate(Date computed/advanced), category(personal|business), autoRenew(boolean), notes?`.

### PersonalCashFlow  (FR-020)
`id, month(YYYY-MM), income(money), expenses(money), netPosition(money computed)`. Pure personal scope.

---

## Service line entities

### StudioBooking  (FR-021)
`id, clientName, clientType(external|center-teacher), date, startTime, endTime, durationHours(computed), rateType(hourly|half-day|full-day|internal), rateAmount(money), totalCharged(money computed by rateType), amountPaid(money), paymentStatus(paid|partial|pending), notes?`. Index: `date`, `paymentStatus`.

### MobileJob  (FR-022)
`id, clientName, location, visitDate(Date), service(string), teamMembers(string[]), transportCost(money), laborCost(money), totalCost(money computed = transport + labor), amountCharged(money), netProfit(money computed = charged − totalCost), paymentStatus`. Index: `visitDate`.

### InCenterService  (FR-023)
`id, centerId(FK), teacherId(FK), serviceType(string from configurable list), date, amountCharged(money), paymentStatus, notes?`. Configurable service-type list stored in settings. Index: `centerId, date`.

---

## Company  (FR-024)
`id, name{ar,en}`. Has its own Expenses (entityType=company), RevenueEntries, PayrollMonth/Entries (entityType=company). Shared expenses use `Expense.sharedAllocation` to split a percentage between company and a center.

### CompanyRevenue
`id, companyId(FK), amount(money), receivedOn(Date), source(string), notes?`.

---

## Cross-cutting / system entities

### BrandingConfig  (FR-034, FR-035) — stored in `branding.json`, not SQLite
`appName(string), logoPath(string?), accentColor(hex), iconPath(string?), theme(dark|light|system), language(ar|en)`. Defaults provided; invalid asset → fallback (FR-035).

### LocalLock  (FR-047) — stored in main-process config, not synced
`enabled(boolean default false), passwordHash(string?), salt(string?), algo(string)`. No plaintext.

### Alert  (FR-029, SC-010)
`id, type(rent|installment|gam3eyya|subscription|sync|payroll), refEntityType, refEntityId, triggerAt(Date), dedupeKey(string unique), channel(in-app|os|both), read(boolean), createdAt`. Unique `dedupeKey` prevents duplicates.

### SyncRecord  (FR-039–FR-042, II) — the change-log queue
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| entity | string | table/collection name |
| operation | enum | create \| update \| delete |
| recordId | UUID | target row id |
| deviceId | string | origin device |
| updatedAt | Date | source change time (LWW key) |
| version | int | record version at write |
| status | enum | pending \| synced \| failed |
| syncedAt | Date? | |
| attempts | int | retry counter |

**Indexes**: `status`, `recordId`. Written in the **same transaction** as the domain
mutation. Drained to MongoDB as idempotent upserts keyed by `recordId`; LWW by `updatedAt`
with `deviceId` retained for audit; retries are safe (no duplicates) via upsert + `attempts`.

### BackupManifest  (FR-046, SC-013) — inside the backup archive, not a table
`appVersion, schemaVersion, createdAt, deviceId`. Restore validates and migrates if older.

---

## Entity relationship summary

```
Owner (implicit, single user)
 ├── Center (1..2) ──< Session >── Teacher (N)
 │      ├──< RentPayment
 │      ├──< Expense
 │      └──< InCenterService >── Teacher
 ├── Company ──< CompanyRevenue / Expense / PayrollEntry
 ├── StudioBooking (client may be external or a center Teacher)
 ├── MobileJob (external clients)
 ├── Personal: Installment, Gam3eyya, Subscription, PersonalCashFlow  (isolated)
 └── PayrollMonth ──< PayrollEntry >── Teacher | Staff

System: BrandingConfig, LocalLock, Alert, SyncRecord (+ MongoDB mirror), BackupManifest
```

## State transitions

- **Session.paymentStatus**: `pending → collected` (sets `collectedAt`); reversible only before month lock.
- **PayrollMonth**: `open → locked` (entries read-only) → `locked → open` only via audited unlock.
- **Installment.status**: `active → completed` (paidCount = durationMonths); `active → delayed` (missed due) → back to `active` on payment.
- **Subscription.nextDueDate**: advances one billingCycle when a cycle elapses.
- **SyncRecord.status**: `pending → synced` | `pending → failed → pending` (retry).
