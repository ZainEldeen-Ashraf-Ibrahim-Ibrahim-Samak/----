import { describe, it, expect } from 'vitest'
import { calculateSessionRevenue } from '../../src/main/services/revenue/calculator'
import { Teacher } from '../../src/shared/schemas/teacher'
import { SalaryMode, EntityStatus, ServiceLineType } from '../../src/shared/constants'

describe('Revenue Calculator', () => {
  const baseTeacher: Teacher = {
    id: 't1',
    name: { ar: 'Test', en: 'Test' },
    phone: '123',
    subject: 'Math',
    centerId: ['c1'],
    serviceType: ServiceLineType.IN_CENTER,
    salaryType: SalaryMode.REVENUE_SHARE,
    status: EntityStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deviceId: 'd1',
    version: 1,
    deleted: false
  }

  it('calculates revenue share correctly', () => {
    const teacher = { ...baseTeacher, revenueSharePercent: 50 }
    const result = calculateSessionRevenue(teacher, { studentCount: 10, pricePerStudent: 10000 })
    // Total = 100000 minor units
    expect(result.totalRevenue).toBe(100000)
    expect(result.teacherEarning).toBe(50000)
    expect(result.ownerNet).toBe(50000)
  })

  it('calculates per session rate correctly', () => {
    const teacher = { ...baseTeacher, salaryType: SalaryMode.PER_SESSION, perSessionRate: 20000 }
    const result = calculateSessionRevenue(teacher, { studentCount: 5, pricePerStudent: 10000 })
    // Total = 50000 minor units
    expect(result.totalRevenue).toBe(50000)
    expect(result.teacherEarning).toBe(20000)
    expect(result.ownerNet).toBe(30000)
  })

  it('applies tax deduction correctly', () => {
    const teacher = { ...baseTeacher, revenueSharePercent: 50, taxDeductionPercent: 10 }
    const result = calculateSessionRevenue(teacher, { studentCount: 10, pricePerStudent: 10000 })
    // Total = 100000
    // Share = 50000
    // Tax = 5000 -> Net = 45000
    expect(result.teacherEarning).toBe(45000)
    expect(result.ownerNet).toBe(55000) // Owner keeps the rest
  })
})
