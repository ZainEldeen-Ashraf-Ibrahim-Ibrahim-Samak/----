# Sync Contract: SQLite ↔ MongoDB

**Feature**: `001-educenter-finance` | **Date**: 2026-06-09

Defines the offline-first synchronization protocol between the local SQLite source of
truth and the MongoDB sync target (Constitution Principle II). The renderer is never
involved; sync runs entirely in the main process and never blocks the UI (FR-039).

## Principles encoded

- SQLite is authoritative; the app is fully functional with sync disabled/offline (FR-036).
- Every mutation writes the domain row **and** a `sync_record` row in one SQLite
  transaction (FR-037 — no change lost on crash).
- Sync is **resumable** and **idempotent**: retries never duplicate (FR-042).
- Conflicts resolve by **last-write-wins on `updatedAt`**, with `deviceId` retained for
  audit (FR-040); ties within a small clock-skew window prefer server-acknowledged order.

## Record envelope (MongoDB document shape, per collection)

Each domain entity maps to a MongoDB collection of the same name. Documents carry the
sync metadata so any device can resolve order:

```jsonc
{
  "_id": "<recordId UUID>",          // same id as SQLite PK (idempotent upsert key)
  "entity": "session",
  "data": { /* full entity payload, validated by the entity's Zod schema */ },
  "updatedAt": "2026-06-09T10:00:00.000Z",  // LWW key
  "deviceId": "device-abc",
  "version": 7,
  "deleted": false                    // soft delete propagates
}
```

## Push (local → cloud)

1. Worker selects `sync_record` rows where `status = pending`, ordered by `updatedAt`.
2. For each, builds the envelope and performs an **upsert** keyed by `_id`:
   - Apply only if incoming `updatedAt` ≥ stored `updatedAt` (server-side guard) else skip (cloud already newer).
3. On success → `status = synced`, set `syncedAt`. On failure → `status = failed`,
   increment `attempts`; the row stays eligible for retry with backoff.

## Pull (cloud → local)

1. Worker requests documents changed since the local high-water mark (`max(syncedAt)` per collection or a stored cursor).
2. For each incoming doc, compare with the local row:
   - incoming `updatedAt` > local `updatedAt` → overwrite local (LWW), record the resolution (winning `deviceId`, both timestamps) in the sync log for audit.
   - incoming `updatedAt` < local → keep local (local is newer; it will be pushed).
   - equal `updatedAt`, different `deviceId` → deterministic tiebreak by `deviceId` ordering; logged.
   - `deleted = true` → apply soft delete locally.
3. Local overwrite is wrapped in a transaction; the high-water mark advances only after commit.

## Conflict resolution summary

| Situation | Resolution | Audit |
|---|---|---|
| Same record edited on two devices, different times | Higher `updatedAt` wins | Winning device + both timestamps logged |
| Same record, same `updatedAt`, different devices | Deterministic `deviceId` tiebreak | Logged |
| Delete vs. edit | Higher `updatedAt` wins (delete or edit) | Logged |
| Clock skew within window | Prefer server-ack order; never drop a side silently | Logged |

## States surfaced to UI (FR-041)

`offline` (no connectivity / sync disabled) → `syncing` (queue draining) → `synced`
(no pending) ; `failed` on error (with retry). `sync:status` reports `{ state, pending,
lastSyncedAt }`; `sync:log` exposes the per-record audit trail.

## Safety guarantees (test obligations)

- Killing the app mid-push leaves the `sync_record` row `pending`; on restart it retries and does not create a duplicate cloud document (upsert by `_id`).
- A record created offline on two devices with the same business content but different ids remains two records (no false merge) — ids are authoritative.
- Disabling sync entirely leaves all features working against SQLite (offline-first).
- Restoring a backup re-seeds SQLite; subsequent sync reconciles via `updatedAt`/`version` without duplication.
