import { Database } from 'better-sqlite3'

export abstract class BaseRepository<T extends { id: string; version: number; deviceId: string }> {
  protected abstract entityName: string

  constructor(protected db: Database) {}

  protected executeWithSync(
    operation: 'create' | 'update' | 'delete',
    domainEntity: T,
    domainWriteQuery: () => void
  ): void {
    const syncRecordId = crypto.randomUUID()
    const now = new Date().toISOString()

    const transaction = this.db.transaction(() => {
      domainWriteQuery()

      this.db
        .prepare(
          `
        INSERT INTO sync_record (
          id, entity, record_id, operation, timestamp, status, version, device_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          syncRecordId,
          this.entityName,
          domainEntity.id,
          operation,
          now,
          'pending',
          domainEntity.version,
          domainEntity.deviceId
        )
    })

    transaction()
  }
}
