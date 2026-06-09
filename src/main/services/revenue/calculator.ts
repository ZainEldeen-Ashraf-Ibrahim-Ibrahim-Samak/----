import { Teacher } from '../../../shared/schemas/teacher'
import { SalaryMode } from '../../../shared/constants'

export interface SessionCalculationInput {
  studentCount: number
  pricePerStudent: number // Minor units
}

export interface SessionCalculationResult {
  totalRevenue: number // Minor units
  teacherEarning: number // Minor units
  ownerNet: number // Minor units
}

export function calculateSessionRevenue(
  teacher: Teacher,
  input: SessionCalculationInput
): SessionCalculationResult {
  const totalRevMinor = input.studentCount * input.pricePerStudent
  let teacherEarnMinor = 0

  if (teacher.salaryType === SalaryMode.FIXED) {
    // Fixed salary is not per-session typically, but if logged per session:
    // It depends on business logic. Usually it's just 0 per session and paid monthly,
    // or the fixed amount is paid per session (perSessionRate).
    teacherEarnMinor = 0 // Handled in monthly payroll
  } else if (teacher.salaryType === SalaryMode.PER_SESSION) {
    teacherEarnMinor = teacher.perSessionRate || 0
  } else if (teacher.salaryType === SalaryMode.REVENUE_SHARE) {
    const share = (teacher.revenueSharePercent || 0) / 100
    teacherEarnMinor = Math.round(totalRevMinor * share)
  }

  // Tax deduction applies to teacher earning
  if (teacher.taxDeductionPercent && teacherEarnMinor > 0) {
    const tax = Math.round(teacherEarnMinor * (teacher.taxDeductionPercent / 100))
    teacherEarnMinor -= tax
  }

  const ownerNetMinor = totalRevMinor - teacherEarnMinor

  return {
    totalRevenue: totalRevMinor,
    teacherEarning: teacherEarnMinor,
    ownerNet: ownerNetMinor
  }
}
