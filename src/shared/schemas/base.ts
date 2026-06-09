import { z } from 'zod'

export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const syncAuditSchema = z.object({
  deviceId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  deleted: z.boolean().default(false)
})

export const auditableEntitySchema = baseEntitySchema.merge(syncAuditSchema)

export type BaseEntity = z.infer<typeof baseEntitySchema>
export type SyncAudit = z.infer<typeof syncAuditSchema>
export type AuditableEntity = z.infer<typeof auditableEntitySchema>
