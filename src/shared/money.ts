export class Money {
  // Minor units (e.g. piastres/cents)
  private readonly amountInMinor: number

  constructor(amountInMinor: number) {
    if (!Number.isInteger(amountInMinor)) {
      throw new Error('Money amount must be an integer in minor units')
    }
    this.amountInMinor = amountInMinor
  }

  static fromMajor(amountInMajor: number): Money {
    return new Money(Math.round(amountInMajor * 100))
  }

  static fromMinor(amountInMinor: number): Money {
    return new Money(amountInMinor)
  }

  static zero(): Money {
    return new Money(0)
  }

  getAmountMinor(): number {
    return this.amountInMinor
  }

  getAmountMajor(): number {
    return this.amountInMinor / 100
  }

  add(other: Money): Money {
    return new Money(this.amountInMinor + other.getAmountMinor())
  }

  subtract(other: Money): Money {
    return new Money(this.amountInMinor - other.getAmountMinor())
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amountInMinor * factor))
  }

  format(locale: 'en-US' | 'ar-EG' = 'ar-EG', currency: string = 'EGP'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.getAmountMajor())
  }
}
