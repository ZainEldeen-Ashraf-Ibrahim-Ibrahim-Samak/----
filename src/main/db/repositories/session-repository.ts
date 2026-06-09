import { BaseRepository } from './base-repository'
import { Session, sessionSchema } from '../../../shared/schemas/session'
import { PaymentStatus } from '../../../shared/constants'

export class SessionRepository extends BaseRepository<Session> {
  protected entityName = 'session'

  getById(id: string): Session | null {
    const row = this.db
      .prepare('SELECT * FROM sessions WHERE id = ? AND deleted = 0')
      .get(id) as any
    if (!row) return null
    return this.mapRow(row)
  }

  listByCenterAndDateRange(centerId: string, startDate: string, endDate: string): Session[] {
    const rows = this.db
      .prepare(
        `
      SELECT * FROM sessions 
      WHERE center_id = ? AND date >= ? AND date <= ? AND deleted = 0
      ORDER BY date DESC, start_time DESC
    `
      )
      .all(centerId, startDate, endDate) as any[]
    return rows.map((r) => this.mapRow(r))
  }

  create(session: Session): void {
    const validSession = sessionSchema.parse(session)
    this.executeWithSync('create', validSession, () => {
      this.db
        .prepare(
          `
        INSERT INTO sessions (
          id, center_id, teacher_id, date, start_time, duration_minutes, subject,
          student_count, price_per_student, total_revenue, teacher_earning, owner_net,
          payment_status, collected_at, notes, created_at, updated_at, device_id, version, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          validSession.id,
          validSession.centerId,
          validSession.teacherId,
          validSession.date.toISOString(),
          validSession.startTime,
          validSession.durationMinutes,
          validSession.subject,
          validSession.studentCount,
          validSession.pricePerStudent,
          validSession.totalRevenue,
          validSession.teacherEarning,
          validSession.ownerNet,
          validSession.paymentStatus,
          validSession.collectedAt?.toISOString() ?? null,
          validSession.notes ?? null,
          validSession.createdAt.toISOString(),
          validSession.updatedAt.toISOString(),
          validSession.deviceId,
          validSession.version,
          validSession.deleted ? 1 : 0
        )
    })
  }

  update(session: Session): void {
    const validSession = sessionSchema.parse(session)
    this.executeWithSync('update', validSession, () => {
      this.db
        .prepare(
          `
        UPDATE sessions SET
          center_id = ?, teacher_id = ?, date = ?, start_time = ?, duration_minutes = ?,
          subject = ?, student_count = ?, price_per_student = ?, total_revenue = ?,
          teacher_earning = ?, owner_net = ?, payment_status = ?, collected_at = ?, notes = ?,
          updated_at = ?, device_id = ?, version = ?, deleted = ?
        WHERE id = ?
      `
        )
        .run(
          validSession.centerId,
          validSession.teacherId,
          validSession.date.toISOString(),
          validSession.startTime,
          validSession.durationMinutes,
          validSession.subject,
          validSession.studentCount,
          validSession.pricePerStudent,
          validSession.totalRevenue,
          validSession.teacherEarning,
          validSession.ownerNet,
          validSession.paymentStatus,
          validSession.collectedAt?.toISOString() ?? null,
          validSession.notes ?? null,
          validSession.updatedAt.toISOString(),
          validSession.deviceId,
          validSession.version,
          validSession.deleted ? 1 : 0,
          validSession.id
        )
    })
  }

  private mapRow(row: any): Session {
    return {
      id: row.id,
      centerId: row.center_id,
      teacherId: row.teacher_id,
      date: new Date(row.date),
      startTime: row.start_time,
      durationMinutes: row.duration_minutes,
      subject: row.subject,
      studentCount: row.student_count,
      pricePerStudent: row.price_per_student,
      totalRevenue: row.total_revenue,
      teacherEarning: row.teacher_earning,
      ownerNet: row.owner_net,
      paymentStatus: row.payment_status as PaymentStatus,
      collectedAt: row.collected_at ? new Date(row.collected_at) : undefined,
      notes: row.notes ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deviceId: row.device_id,
      version: row.version,
      deleted: Boolean(row.deleted)
    }
  }
}
