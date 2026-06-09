import { Database } from 'better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const migrationsDir = path.join(__dirname)
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js') && f !== 'runner.js')
    .sort()

  const executed = new Set(
    db
      .prepare('SELECT name FROM migrations')
      .all()
      .map((r: any) => r.name)
  )

  for (const file of files) {
    if (!executed.has(file)) {
      console.log(`Running migration: ${file}`)
      const migration = require(path.join(migrationsDir, file))

      db.transaction(() => {
        if (migration.up) migration.up(db)
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file)
      })()
    }
  }
}
