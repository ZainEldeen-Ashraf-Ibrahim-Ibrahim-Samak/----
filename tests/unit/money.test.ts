import { describe, it, expect } from 'vitest'
import { Money } from '../../src/shared/money'

describe('Money utility', () => {
  it('initializes from minor and major units', () => {
    expect(Money.fromMinor(100).getAmountMinor()).toBe(100)
    expect(Money.fromMajor(1).getAmountMinor()).toBe(100)
    expect(Money.fromMajor(1.5).getAmountMinor()).toBe(150)
  })

  it('rejects non-integer minor units', () => {
    expect(() => new (Money as any)(10.5)).toThrow('integer')
  })

  it('adds and subtracts correctly', () => {
    const a = Money.fromMajor(10)
    const b = Money.fromMajor(5.5)

    expect(a.add(b).getAmountMajor()).toBe(15.5)
    expect(a.subtract(b).getAmountMajor()).toBe(4.5)
  })

  it('multiplies and rounds to nearest minor unit', () => {
    const a = Money.fromMajor(10)
    expect(a.multiply(0.33).getAmountMajor()).toBe(3.3)
  })

  it('formats EGP correctly', () => {
    const m = Money.fromMajor(1234.5)
    const formatted = m.format('en-US', 'EGP')
    expect(formatted).toMatch(/EGP/)
    expect(formatted).toMatch(/1,234\.50/)
  })
})
