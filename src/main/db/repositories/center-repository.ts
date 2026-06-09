import { BaseRepository } from './base-repository'
import { Center, centerSchema } from '../../../shared/schemas/center'

export class CenterRepository extends BaseRepository<Center> {
  protected entityName = 'center'

  getById(id: string): Center | null {
    const row = this.db.prepare('SELECT * FROM centers WHERE id = ? AND deleted = 0').get(id) as any
    if (!row) return null
    return this.mapRow(row)
  }

  listActive(): Center[] {
    const rows = this.db
      .prepare('SELECT * FROM centers WHERE is_active = 1 AND deleted = 0')
      .all() as any[]
    return rows.map((r) => this.mapRow(r))
  }

  create(center: Center): void {
    const validCenter = centerSchema.parse(center)
    this.executeWithSync('create', validCenter, () => {
      this.db
        .prepare(
          `
        INSERT INTO centers (
          id, name_ar, name_en, address, phone, rent_amount, rent_due_day, 
          landlord_name, landlord_phone, is_active, created_at, updated_at, 
          device_id, version, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          validCenter.id,
          validCenter.name.ar,
          validCenter.name.en,
          validCenter.address,
          validCenter.phone,
          validCenter.rentAmount,
          validCenter.rentDueDay,
          validCenter.landlordName,
          validCenter.landlordPhone,
          validCenter.isActive ? 1 : 0,
          validCenter.createdAt.toISOString(),
          validCenter.updatedAt.toISOString(),
          validCenter.deviceId,
          validCenter.version,
          validCenter.deleted ? 1 : 0
        )
    })
  }

  update(center: Center): void {
    const validCenter = centerSchema.parse(center)
    this.executeWithSync('update', validCenter, () => {
      this.db
        .prepare(
          `
        UPDATE centers SET
          name_ar = ?, name_en = ?, address = ?, phone = ?, rent_amount = ?, rent_due_day = ?, 
          landlord_name = ?, landlord_phone = ?, is_active = ?, updated_at = ?, 
          device_id = ?, version = ?, deleted = ?
        WHERE id = ?
      `
        )
        .run(
          validCenter.name.ar,
          validCenter.name.en,
          validCenter.address,
          validCenter.phone,
          validCenter.rentAmount,
          validCenter.rentDueDay,
          validCenter.landlordName,
          validCenter.landlordPhone,
          validCenter.isActive ? 1 : 0,
          validCenter.updatedAt.toISOString(),
          validCenter.deviceId,
          validCenter.version,
          validCenter.deleted ? 1 : 0,
          validCenter.id
        )
    })
  }

  private mapRow(row: any): Center {
    return {
      id: row.id,
      name: { ar: row.name_ar, en: row.name_en },
      address: row.address,
      phone: row.phone,
      rentAmount: row.rent_amount,
      rentDueDay: row.rent_due_day,
      landlordName: row.landlord_name,
      landlordPhone: row.landlord_phone,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deviceId: row.device_id,
      version: row.version,
      deleted: Boolean(row.deleted)
    }
  }
}
