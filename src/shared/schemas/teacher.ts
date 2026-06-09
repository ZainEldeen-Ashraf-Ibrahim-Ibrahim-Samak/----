import { z } from 'zod'
import { auditableEntitySchema } from './base'
import { SalaryMode, EntityStatus, ServiceLineType } from '../constants'

export const teacherSchema = auditableEntitySchema
  .extend({
    name: z.object({
      ar: z.string().min(1),
      en: z.string().min(1)
    }),
    phone: z.string(),
    subject: z.string(),
    centerId: z.array(z.string().uuid()),
    serviceType: z.nativeEnum(ServiceLineType),
    salaryType: z.nativeEnum(SalaryMode),
    fixedSalary: z.number().int().nonnegative().optional(), // Minor units
    perSessionRate: z.number().int().nonnegative().optional(), // Minor units
    revenueSharePercent: z.number().min(0).max(100).optional(),
    taxDeductionPercent: z.number().min(0).max(100).optional(),
    status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE)
  })
  .refine(
    (data) => {
      if (data.salaryType === SalaryMode.FIXED && data.fixedSalary === undefined) return false
      if (data.salaryType === SalaryMode.PER_SESSION && data.perSessionRate === undefined)
        return false
      if (data.salaryType === SalaryMode.REVENUE_SHARE && data.revenueSharePercent === undefined)
        return false
      return true
    },
    {
      message: 'Required salary field missing for the selected salary type'
    }
  )

export type Teacher = z.infer<typeof teacherSchema>
