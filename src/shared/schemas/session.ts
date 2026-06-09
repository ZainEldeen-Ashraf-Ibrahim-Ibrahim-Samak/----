import { z } from 'zod'
import { auditableEntitySchema } from './base'
import { PaymentStatus } from '../constants'

export const sessionSchema = auditableEntitySchema.extend({
  centerId: z.string().uuid(),
  teacherId: z.string().uuid(),
  date: z.date(),
  startTime: z.string(),
  durationMinutes: z.number().int().positive(),
  subject: z.string(),
  studentCount: z.number().int().nonnegative(),
  pricePerStudent: z.number().int().nonnegative(), // Minor units
  totalRevenue: z.number().int().nonnegative(), // Computed
  teacherEarning: z.number().int().nonnegative(), // Computed
  ownerNet: z.number().int(), // Computed (can be negative theoretically, but typically non-negative)
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  collectedAt: z.date().optional(),
  notes: z.string().optional()
})

export type Session = z.infer<typeof sessionSchema>
