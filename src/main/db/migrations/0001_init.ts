import { Database } from 'better-sqlite3'

export function up(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_record (
      id TEXT PRIMARY KEY,
      entity TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      synced_at DATETIME,
      status TEXT NOT NULL DEFAULT 'pending',
      version INTEGER NOT NULL,
      device_id TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sync_record_status ON sync_record(status);
    CREATE INDEX IF NOT EXISTS idx_sync_record_entity_record ON sync_record(entity, record_id);
  `)
}
