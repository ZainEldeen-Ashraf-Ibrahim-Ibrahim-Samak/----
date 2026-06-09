import { Database } from 'better-sqlite3'

export function up(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS centers (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      rent_amount INTEGER NOT NULL,
      rent_due_day INTEGER NOT NULL,
      landlord_name TEXT NOT NULL,
      landlord_phone TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      device_id TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 0,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      center_ids TEXT NOT NULL, -- JSON array of UUIDs
      service_type TEXT NOT NULL,
      salary_type TEXT NOT NULL,
      fixed_salary INTEGER,
      per_session_rate INTEGER,
      revenue_share_percent INTEGER,
      tax_deduction_percent INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      device_id TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 0,
      deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      center_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      date DATETIME NOT NULL,
      start_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      subject TEXT NOT NULL,
      student_count INTEGER NOT NULL,
      price_per_student INTEGER NOT NULL,
      total_revenue INTEGER NOT NULL,
      teacher_earning INTEGER NOT NULL,
      owner_net INTEGER NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      collected_at DATETIME,
      notes TEXT,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      device_id TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 0,
      deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(center_id) REFERENCES centers(id),
      FOREIGN KEY(teacher_id) REFERENCES teachers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_center_id ON sessions(center_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_teacher_id ON sessions(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
  `)
}
