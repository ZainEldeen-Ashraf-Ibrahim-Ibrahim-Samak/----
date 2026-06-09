import { z } from 'zod'
import { auditableEntitySchema } from './base'

export const centerSchema = auditableEntitySchema.extend({
  name: z.object({
    ar: z.string().min(1),
    en: z.string().min(1)
  }),
  address: z.string(),
  phone: z.string(),
  rentAmount: z.number().int().nonnegative(), // Minor units
  rentDueDay: z.number().int().min(1).max(31),
  landlordName: z.string(),
  landlordPhone: z.string(),
  isActive: z.boolean().default(true)
})

export type Center = z.infer<typeof centerSchema>
