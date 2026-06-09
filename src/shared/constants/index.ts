export enum SalaryMode {
  FIXED = 'fixed',
  PER_SESSION = 'per-session',
  REVENUE_SHARE = 'revenue-share'
}

export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

export enum PaymentStatus {
  COLLECTED = 'collected',
  PENDING = 'pending',
  PARTIAL = 'partial'
}

export enum AlertType {
  RENT_DUE = 'rent_due',
  INSTALLMENT_DUE = 'installment_due',
  GAM3EYYA_DUE = 'gam3eyya_due',
  SUBSCRIPTION_DUE = 'subscription_due'
}

export enum ServiceLineType {
  IN_CENTER = 'in-center',
  STUDIO = 'studio',
  MOBILE = 'mobile',
  MULTIPLE = 'multiple'
}

export enum StudioRateType {
  HOURLY = 'hourly',
  HALF_DAY = 'half-day',
  FULL_DAY = 'full-day',
  INTERNAL = 'internal'
}
