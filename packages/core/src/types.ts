// =============================================================================
// @nepali-cal/core — types.ts
//
// All shared types for the core package.
// Re-exported from index.ts for consumers.
// =============================================================================

// ---------------------------------------------------------------------------
// Plain data shapes
// Plain objects — no class, no methods, fully serialisable (JSON-safe).
// ---------------------------------------------------------------------------

/** A Bikram Sambat date. Month is 1-indexed (1 = Baisakh, 12 = Chaitra). */
export interface BSDate {
  readonly year: number
  readonly month: number // 1–12
  readonly day: number
}

/** A Gregorian date. Month is 1-indexed (1 = January, 12 = December). */
export interface ADDate {
  readonly year: number
  readonly month: number // 1–12
  readonly day: number
}

// ---------------------------------------------------------------------------
// Scalar aliases — document intent at call sites
// ---------------------------------------------------------------------------

/** 0 = Sunday … 6 = Saturday  (matches JS Date.getUTCDay()) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 'BS' = Bikram Sambat, 'AD' = Anno Domini (Gregorian) */
export type CalendarSystem = 'BS' | 'AD'

/** Display locale — 'en' = English, 'ne' = Nepali (Devanagari) */
export type Locale = 'en' | 'ne'

/** Fiscal quarter in the Nepali fiscal year (Shrawan-based) */
export type FiscalQuarter = 1 | 2 | 3 | 4

// ---------------------------------------------------------------------------
// Composite types
// ---------------------------------------------------------------------------

/**
 * Nepal fiscal year information.
 * The fiscal year runs from 1 Shrawan (month 4) to the last day of
 * Ashadh (month 3) of the following BS year.
 */
export interface FiscalYear {
  /** First day of the fiscal year (always 1 Shrawan) */
  readonly start: BSDate
  /** Last day of the fiscal year (last day of Ashadh) */
  readonly end: BSDate
  /** Human-readable label, e.g. "2081/82" */
  readonly label: string
  /** Quarter the source date falls in (1–4) */
  readonly quarter: FiscalQuarter
}

/**
 * A single cell in a calendar grid.
 * Grids include leading/trailing days from adjacent months so each
 * row is always exactly 7 cells wide.
 */
export interface CalendarDay {
  /** The BS date for this cell */
  readonly bsDate: BSDate
  /** The equivalent Gregorian date */
  readonly adDate: ADDate
  /** Day of week for this cell */
  readonly dayOfWeek: DayOfWeek
  /** True if this cell represents today (Asia/Kathmandu clock) */
  readonly isToday: boolean
  /** True if this cell belongs to the month being rendered */
  readonly isCurrentMonth: boolean
  /** True if dayOfWeek === 6 (Saturday — the Nepali weekend day) */
  readonly isWeekend: boolean
}

/** A generic date range — works for both BSDate and NepaliDate */
export interface DateRange<T> {
  readonly from: T
  readonly to: T
}

// ---------------------------------------------------------------------------
// Custom error classes
//
// Named with the "Nepali" prefix so they don't shadow built-in globals.
// The built-in `RangeError` and `TypeError` remain fully accessible.
// ---------------------------------------------------------------------------

/** Thrown when a BS date falls outside the supported range (1970–2100 BS). */
export class NepaliRangeError extends Error {
  readonly code = 'NEPALI_RANGE_ERROR' as const

  constructor(message: string) {
    super(message)
    this.name = 'NepaliRangeError'
    // Restore prototype chain (needed when targeting ES5)
    Object.setPrototypeOf(this, NepaliRangeError.prototype)
  }
}

/** Thrown when a date value is structurally invalid (bad month, bad day, NaN, etc.). */
export class NepaliInvalidDateError extends Error {
  readonly code = 'NEPALI_INVALID_DATE' as const

  constructor(message: string) {
    super(message)
    this.name = 'NepaliInvalidDateError'
    Object.setPrototypeOf(this, NepaliInvalidDateError.prototype)
  }
}
