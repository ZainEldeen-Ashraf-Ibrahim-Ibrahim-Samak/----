import { BaseRepository } from './base-repository'
import { Teacher, teacherSchema } from '../../../shared/schemas/teacher'
import { SalaryMode, EntityStatus, ServiceLineType } from '../../../shared/constants'

export class TeacherRepository extends BaseRepository<Teacher> {
  protected entityName = 'teacher'

  getById(id: string): Teacher | null {
    const row = this.db
      .prepare('SELECT * FROM teachers WHERE id = ? AND deleted = 0')
      .get(id) as any
    if (!row) return null
    return this.mapRow(row)
  }

  listByCenter(centerId: string): Teacher[] {
    const rows = this.db
      .prepare(
        `
      SELECT * FROM teachers 
      WHERE deleted = 0 AND center_ids LIKE ?
    `
      )
      .all(`%${centerId}%`) as any[]
    return rows.map((r) => this.mapRow(r))
  }

  create(teacher: Teacher): void {
    const validTeacher = teacherSchema.parse(teacher)
    this.executeWithSync('create', validTeacher, () => {
      this.db
        .prepare(
          `
        INSERT INTO teachers (
          id, name_ar, name_en, phone, subject, center_ids, service_type,
          salary_type, fixed_salary, per_session_rate, revenue_share_percent,
          tax_deduction_percent, status, created_at, updated_at, device_id, version, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          validTeacher.id,
          validTeacher.name.ar,
          validTeacher.name.en,
          validTeacher.phone,
          validTeacher.subject,
          JSON.stringify(validTeacher.centerId),
          validTeacher.serviceType,
          validTeacher.salaryType,
          validTeacher.fixedSalary ?? null,
          validTeacher.perSessionRate ?? null,
          validTeacher.revenueSharePercent ?? null,
          validTeacher.taxDeductionPercent ?? null,
          validTeacher.status,
          validTeacher.createdAt.toISOString(),
          validTeacher.updatedAt.toISOString(),
          validTeacher.deviceId,
          validTeacher.version,
          validTeacher.deleted ? 1 : 0
        )
    })
  }

  update(teacher: Teacher): void {
    const validTeacher = teacherSchema.parse(teacher)
    this.executeWithSync('update', validTeacher, () => {
      this.db
        .prepare(
          `
        UPDATE teachers SET
          name_ar = ?, name_en = ?, phone = ?, subject = ?, center_ids = ?, service_type = ?,
          salary_type = ?, fixed_salary = ?, per_session_rate = ?, revenue_share_percent = ?,
          tax_deduction_percent = ?, status = ?, updated_at = ?, device_id = ?, version = ?, deleted = ?
        WHERE id = ?
      `
        )
        .run(
          validTeacher.name.ar,
          validTeacher.name.en,
          validTeacher.phone,
          validTeacher.subject,
          JSON.stringify(validTeacher.centerId),
          validTeacher.serviceType,
          validTeacher.salaryType,
          validTeacher.fixedSalary ?? null,
          validTeacher.perSessionRate ?? null,
          validTeacher.revenueSharePercent ?? null,
          validTeacher.taxDeductionPercent ?? null,
          validTeacher.status,
          validTeacher.updatedAt.toISOString(),
          validTeacher.deviceId,
          validTeacher.version,
          validTeacher.deleted ? 1 : 0,
          validTeacher.id
        )
    })
  }

  private mapRow(row: any): Teacher {
    return {
      id: row.id,
      name: { ar: row.name_ar, en: row.name_en },
      phone: row.phone,
      subject: row.subject,
      centerId: JSON.parse(row.center_ids),
      serviceType: row.service_type as ServiceLineType,
      salaryType: row.salary_type as SalaryMode,
      fixedSalary: row.fixed_salary ?? undefined,
      perSessionRate: row.per_session_rate ?? undefined,
      revenueSharePercent: row.revenue_share_percent ?? undefined,
      taxDeductionPercent: row.tax_deduction_percent ?? undefined,
      status: row.status as EntityStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deviceId: row.device_id,
      version: row.version,
      deleted: Boolean(row.deleted)
    }
  }
}
