import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'

let db: Database.Database | null = null

export function getConnection(): Database.Database {
  if (!db) {
    const dbPath = app.isPackaged
      ? join(app.getPath('userData'), 'educenter.db')
      : join(__dirname, '../../educenter-dev.db')

    db = new Database(dbPath, { verbose: console.log })
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function closeConnection(): void {
  if (db) {
    db.close()
    db = null
  }
}
