# IPC Contract: Renderer ↔ Main

**Feature**: `001-educenter-finance` | **Date**: 2026-06-09

The renderer never touches Node, the filesystem, SQLite, or MongoDB directly. All access
goes through a context-isolated preload bridge exposing the typed API below. Every request
payload and response is validated with a Zod schema in the main-process handler **before**
any side effect (Constitution Principle I). Channels follow `domain:action`. Responses use
a uniform envelope:

```ts
type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string,string> } };
```

Conventions: list queries accept `{ filter?, dateRange?, page?, pageSize? }` and return
`{ items, total }`. All ids are UUID strings. Money is integer minor units.

---

## Centers — `center:*`
| Channel | Request | Response |
|---|---|---|
| `center:list` | `{ filter?, page?, pageSize? }` | `{ items: Center[], total }` |
| `center:get` | `{ id }` | `Center` |
| `center:create` | `CenterInput` | `Center` |
| `center:update` | `{ id, patch: Partial<CenterInput> }` | `Center` |
| `center:delete` | `{ id }` | `{ id }` (soft delete) |
| `center:rent:list` | `{ centerId, dateRange? }` | `{ items: RentPayment[], total }` |
| `center:rent:add` | `RentPaymentInput` (+ optional receipt file ref) | `RentPayment` |
| `center:pnl` | `{ centerId, year, month }` | `CenterPnL` |

## Teachers — `teacher:*`
| Channel | Request | Response |
|---|---|---|
| `teacher:list` | `{ filter?, status?, page?, pageSize? }` | `{ items: Teacher[], total }` |
| `teacher:get` | `{ id }` | `Teacher` |
| `teacher:create` | `TeacherInput` | `Teacher` |
| `teacher:update` | `{ id, patch }` | `Teacher` |
| `teacher:statement` | `{ teacherId, year, month }` | `TeacherStatement` |

Validation: `TeacherInput` Zod refinement enforces the rate field required by `salaryType`.

## Sessions — `session:*`  (core revenue engine)
| Channel | Request | Response |
|---|---|---|
| `session:list` | `{ centerId?, teacherId?, dateRange?, paymentStatus?, page?, pageSize? }` | `{ items: Session[], total }` |
| `session:preview` | `{ teacherId, studentCount, pricePerStudent? }` | `{ totalRevenue, teacherEarning, ownerNet }` (no write — drives live form calc, SC-001) |
| `session:create` | `SessionInput` | `Session` (computed fields + snapshotted salary terms) |
| `session:update` | `{ id, patch }` | `Session` |
| `session:markCollected` | `{ id, collectedAt }` | `Session` |
| `session:draft:save` | `SessionDraft` | `{ savedAt }` (autosave for crash recovery, FR-038) |
| `session:draft:get` | `{}` | `SessionDraft \| null` |

## Payroll — `payroll:*`
| Channel | Request | Response |
|---|---|---|
| `payroll:compute` | `{ entityType, entityId, year, month }` | `PayrollMonth + PayrollEntry[]` (computed) |
| `payroll:setPayment` | `{ entryId, status, amountPaid?, method?, date? }` | `PayrollEntry` |
| `payroll:setDeduction` | `{ entryId, deductions }` | `PayrollEntry` |
| `payroll:lock` | `{ payrollMonthId }` | `PayrollMonth` |
| `payroll:unlock` | `{ payrollMonthId, reason }` | `PayrollMonth` (audited) |
| `payroll:slip` | `{ entryId, language }` | `{ filePath }` (PDF) |

## Personal — `personal:*`
| Channel | Request | Response |
|---|---|---|
| `personal:installment:*` | CRUD + `addPayment` | `Installment` |
| `personal:gam3eyya:*` | CRUD | `Gam3eyya` |
| `personal:subscription:*` | CRUD | `Subscription` |
| `personal:cashflow:get/set` | `{ month }` / `CashFlowInput` | `PersonalCashFlow` |

## Service lines — `studio:*`, `mobile:*`, `incenter:*`, `company:*`
CRUD + per-line reports; each returns its line's net/P&L. `company:expense:addShared`
accepts a split allocation between company and a center (FR-024).

## Dashboard & reports — `dashboard:*`, `report:*`
| Channel | Request | Response |
|---|---|---|
| `dashboard:summary` | `{ dateRange?, entity? }` | `DashboardSummary` (combined + per-entity revenue, upcoming dues, top teachers, trend) |
| `report:generate` | `{ type, dateRange, entity?, language }` | `ReportData` (in-app view) |
| `report:export` | `{ type, dateRange, entity?, language, format: pdf\|excel\|csv }` | `{ filePath }` |

## Alerts — `alert:*`
`alert:list`, `alert:markRead`, `alert:settings:get/set`. Main process pushes
`alert:new` events to the renderer (badge count). De-duplicated by `dedupeKey`.

## Branding & settings — `branding:*`, `settings:*`
| Channel | Request | Response |
|---|---|---|
| `branding:get` | `{}` | `BrandingConfig` |
| `branding:set` | `Partial<BrandingConfig>` | `BrandingConfig` (applied immediately; invalid asset → fallback) |
| `branding:setIcon` | `{ iconPath }` | `{ applied: boolean, note? }` (per-OS behavior) |
| `settings:get/set` | — | app settings (language, theme, in-center service types, sync config) |

Main pushes `branding:changed` so the renderer re-themes live.

## Security (local lock) — `lock:*`
| Channel | Request | Response |
|---|---|---|
| `lock:status` | `{}` | `{ enabled: boolean }` |
| `lock:enable` | `{ password }` | `{ enabled: true }` (stores salted hash, no plaintext) |
| `lock:disable` | `{ password }` | `{ enabled: false }` |
| `lock:verify` | `{ password }` | `{ ok: boolean }` (gate before renderer loads data) |

## Backup & restore — `backup:*`
| Channel | Request | Response |
|---|---|---|
| `backup:export` | `{ targetPath }` | `{ filePath, manifest }` (consistent snapshot, FR-046) |
| `backup:restore` | `{ sourcePath }` | `{ ok, migratedFrom? }` (validates manifest, migrates, atomic swap) |

## Sync — `sync:*`
| Channel | Request | Response |
|---|---|---|
| `sync:status` | `{}` | `{ state: offline\|syncing\|synced\|failed, pending: int, lastSyncedAt? }` |
| `sync:now` | `{}` | `{ state }` (manual trigger; normally automatic/background) |
| `sync:log` | `{ page?, pageSize? }` | `{ items: SyncRecord[], total }` |
| `sync:config:set` | `{ connectionString, deviceId? }` | `{ ok }` |

Main pushes `sync:state` events so the header indicator updates live (FR-041).

---

### Contract test obligations
- Every channel has a Zod schema; an invalid payload returns `{ ok:false, error }` and performs **no** side effect.
- `session:create` returns computed `totalRevenue/teacherEarning/ownerNet` matching the data-model rules for all three salary modes (US1 acceptance).
- `payroll:lock` makes subsequent `payroll:setPayment` on that month fail with a documented error code; `payroll:unlock` requires a `reason`.
- `branding:set` with a missing/invalid asset still resolves `ok:true` with defaults applied (FR-035).
