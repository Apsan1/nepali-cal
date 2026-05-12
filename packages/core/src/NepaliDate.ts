// =============================================================================
// @nepali-cal/core — NepaliDate.ts
//
// The primary OOP interface for Bikram Sambat dates.
// Immutable — every method that produces a new date returns a new instance.
// =============================================================================

import {
  bsToAD,
  bsToADPlain,
  adToBS,
  bsDayOfWeek,
  bsMonthDays,
  bsYearDays,
  addDays,
  addMonths,
  addYears,
  diffDays,
  diffMonths,
  diffYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  fiscalYear,
  todayBS,
  isValidBSDate,
  validateBSDate,
  bsDateEquals,
  bsDateBefore,
  bsDateAfter,
  bsDateBetween,
  buildCalendarGrid,
} from './conversion'

import {
  BSDate,
  ADDate,
  DayOfWeek,
  FiscalYear,
  FiscalQuarter,
  CalendarDay,
  NepaliInvalidDateError,
} from './types'

import { BS_CALENDAR_DATA } from './data'

// ---------------------------------------------------------------------------
// Internal unit types (not exported — keep the public API surface clean)
// ---------------------------------------------------------------------------

type AddSubtractUnit = 'days' | 'months' | 'years'
type DiffUnit        = 'days' | 'months' | 'years'

// =============================================================================
// NepaliDate class
// =============================================================================

/**
 * An immutable Bikram Sambat date.
 *
 * Months are **1-indexed** (1 = Baisakh … 12 = Chaitra).
 * This is intentional — it avoids the 0-indexed trap of the JS Date API.
 *
 * @example
 *   // Construction
 *   const d = new NepaliDate(2082, 1, 15)
 *   const d2 = new NepaliDate({ year: 2082, month: 1, day: 15 })
 *   const d3 = new NepaliDate('2082-01-15')
 *   const today = NepaliDate.today()
 *   const fromAD = NepaliDate.fromAD(new Date('2025-04-14'))
 *
 *   // Arithmetic (immutable — returns new instances)
 *   d.add(30, 'days')
 *   d.subtract(1, 'months')
 *   d.add(2, 'years')
 *
 *   // Comparison
 *   d.isBefore(d2)
 *   d.equals(d2)
 *   d.diff(d2, 'days')
 *
 *   // Conversion
 *   d.toAD()          // JS Date, midnight UTC
 *   d.toADPlain()     // { year, month, day } plain object
 *   d.toString()      // "2082-01-15"
 *   d.toJSON()        // "2082-01-15"  (used by JSON.stringify)
 */
export class NepaliDate {
  readonly year:  number
  readonly month: number // 1–12
  readonly day:   number

  // =========================================================================
  // Constructors
  //
  // TypeScript overloads let callers choose the most convenient form.
  // The single implementation below handles all three cases.
  // =========================================================================

  /** Create from explicit year, month, day (all integers, month 1-indexed). */
  constructor(year: number, month: number, day: number)
  /** Create from a plain BSDate object. */
  constructor(bsDate: BSDate)
  /** Create from an ISO-style BS date string: "YYYY-MM-DD", "YYYY/MM/DD", or "YYYY.MM.DD". */
  constructor(isoString: string)
  constructor(
    arg0: number | BSDate | string,
    arg1?: number,
    arg2?: number,
  ) {
    if (typeof arg0 === 'number') {
      // NepaliDate(year, month, day)
      this.year  = arg0
      this.month = arg1!
      this.day   = arg2!
    } else if (typeof arg0 === 'string') {
      // NepaliDate('2082-01-15')
      const parsed = NepaliDate.parse(arg0)
      if (parsed === null) {
        throw new NepaliInvalidDateError(
          `Cannot parse "${arg0}" as a BS date. ` +
          `Expected format: YYYY-MM-DD (e.g. "2082-01-15")`
        )
      }
      this.year  = parsed.year
      this.month = parsed.month
      this.day   = parsed.day
    } else {
      // NepaliDate({ year, month, day })
      this.year  = arg0.year
      this.month = arg0.month
      this.day   = arg0.day
    }

    // Always validate — constructors should never produce an invalid object
    validateBSDate(this.year, this.month, this.day)
  }

  // =========================================================================
  // Static factories
  // =========================================================================

  /**
   * Today's date in BS using Asia/Kathmandu timezone (UTC+5:45).
   * SSR-safe — does not use Intl or OS locale.
   */
  static today(): NepaliDate {
    return new NepaliDate(todayBS())
  }

  /**
   * Convert a JavaScript Date to NepaliDate.
   *
   * @param date           Any JS Date object.
   * @param useLocalTime   When true, treats the Date's *local* time components
   *                       as the date to convert (useful for browser inputs).
   *                       Defaults to false (UTC components).
   */
  static fromAD(date: Date, useLocalTime = false): NepaliDate {
    const utcDate = useLocalTime
      ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      : new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

    return new NepaliDate(adToBS(utcDate))
  }

  /**
   * Parse a BS date string.
   * Accepted separators: `-`, `/`, `.`
   * Returns **null** (never throws) if the string is unparseable or invalid.
   *
   * @example
   *   NepaliDate.parse('2082-01-15')  // NepaliDate
   *   NepaliDate.parse('2082/1/15')   // NepaliDate
   *   NepaliDate.parse('bad')         // null
   */
  static parse(str: string): NepaliDate | null {
    const normalised = str.trim().replace(/[/.]/g, '-')
    const match = normalised.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (!match || !match[1] || !match[2] || !match[3]) return null

    const year  = parseInt(match[1], 10)
    const month = parseInt(match[2], 10)
    const day   = parseInt(match[3], 10)

    if (!isValidBSDate(year, month, day)) return null

    // Use the numeric constructor path directly to avoid re-parsing
    return new NepaliDate(year, month, day)
  }

  // =========================================================================
  // Conversion
  // =========================================================================

  /** Convert to a JS Date representing midnight UTC of the equivalent AD day. */
  toAD(): Date {
    return bsToAD(this.year, this.month, this.day)
  }

  /** Convert to a plain ADDate object — fully serialisable. */
  toADPlain(): ADDate {
    return bsToADPlain(this.year, this.month, this.day)
  }

  /** Return a plain BSDate object — fully serialisable. */
  toPlain(): BSDate {
    return { year: this.year, month: this.month, day: this.day }
  }

  // =========================================================================
  // Getters / computed properties
  // =========================================================================

  /** Day of week: 0 = Sunday … 6 = Saturday. */
  get dayOfWeek(): DayOfWeek {
    return bsDayOfWeek(this.year, this.month, this.day)
  }

  /** Number of days in this date's month (varies year-to-year in BS). */
  get daysInMonth(): number {
    return bsMonthDays(this.year, this.month)
  }

  /** Total days in this date's BS year (365 or 366). */
  get daysInYear(): number {
    return bsYearDays(this.year)
  }

  /**
   * 1-based ordinal day of the year.
   * Day 1 = 1 Baisakh, last day = last day of Chaitra.
   */
  get dayOfYear(): number {
    const data = BS_CALENDAR_DATA[this.year]!
    let total = 0
    for (let m = 0; m < this.month - 1; m++) {
      total += (data[m] as number)
    }
    return total + this.day
  }

  /** True if this date is today in Nepal (Asia/Kathmandu clock). */
  get isToday(): boolean {
    return bsDateEquals(this.toPlain(), todayBS())
  }

  /** True if today is a Saturday — the Nepali weekend day. */
  get isWeekend(): boolean {
    return this.dayOfWeek === 6
  }

  /**
   * True if the date is structurally valid and within the supported range.
   * This is always true for instances created via the constructor (which validates
   * on construction), but is useful when you hold a BSDate and want to guard.
   */
  get isValid(): boolean {
    return isValidBSDate(this.year, this.month, this.day)
  }

  /** The fiscal quarter this date falls in (1–4, Nepal fiscal year). */
  get fiscalQuarter(): FiscalQuarter {
    return fiscalYear(this.toPlain()).quarter
  }

  // =========================================================================
  // Arithmetic  (all return new NepaliDate — immutable)
  // =========================================================================

  /**
   * Add a positive or negative amount of the given unit.
   *
   * @example
   *   new NepaliDate(2082, 1, 1).add(30, 'days')
   *   new NepaliDate(2082, 1, 1).add(-1, 'months')
   */
  add(amount: number, unit: AddSubtractUnit): NepaliDate {
    switch (unit) {
      case 'days':
        return new NepaliDate(addDays(this.toPlain(), amount))
      case 'months':
        return new NepaliDate(addMonths(this.toPlain(), amount))
      case 'years':
        return new NepaliDate(addYears(this.toPlain(), amount))
    }
  }

  /**
   * Subtract a positive amount of the given unit.
   * Equivalent to add(-amount, unit).
   */
  subtract(amount: number, unit: AddSubtractUnit): NepaliDate {
    return this.add(-amount, unit)
  }

  // =========================================================================
  // Comparison
  // =========================================================================

  /** True if this date represents the same BS day as other. */
  equals(other: NepaliDate | BSDate): boolean {
    const b = other instanceof NepaliDate ? other.toPlain() : other
    return bsDateEquals(this.toPlain(), b)
  }

  /** True if this date is strictly before other. */
  isBefore(other: NepaliDate | BSDate): boolean {
    const b = other instanceof NepaliDate ? other.toPlain() : other
    return bsDateBefore(this.toPlain(), b)
  }

  /** True if this date is strictly after other. */
  isAfter(other: NepaliDate | BSDate): boolean {
    const b = other instanceof NepaliDate ? other.toPlain() : other
    return bsDateAfter(this.toPlain(), b)
  }

  /**
   * True if this date falls on or between start and end (inclusive).
   * Order of start/end does not matter — the range is normalised internally.
   */
  isBetween(start: NepaliDate | BSDate, end: NepaliDate | BSDate): boolean {
    const s = start instanceof NepaliDate ? start.toPlain() : start
    const e = end   instanceof NepaliDate ? end.toPlain()   : end
    // Normalise so that s ≤ e
    const [lo, hi] = bsDateBefore(s, e) ? [s, e] : [e, s]
    return bsDateBetween(this.toPlain(), lo, hi)
  }

  /** True if this date is in the same calendar month as other. */
  isSameMonth(other: NepaliDate | BSDate): boolean {
    return this.year === other.year && this.month === other.month
  }

  /** True if this date is in the same BS year as other. */
  isSameYear(other: NepaliDate | BSDate): boolean {
    return this.year === other.year
  }

  /**
   * Signed difference in the requested unit.
   * Positive when other is after this, negative when before.
   *
   * @example
   *   a.diff(b, 'days')    // exact day count
   *   a.diff(b, 'months')  // whole months (truncated)
   *   a.diff(b, 'years')   // whole years  (truncated)
   */
  diff(other: NepaliDate | BSDate, unit: DiffUnit = 'days'): number {
    const a = this.toPlain()
    const b = other instanceof NepaliDate ? other.toPlain() : other

    switch (unit) {
      case 'days':   return diffDays(a, b)
      case 'months': return diffMonths(a, b)
      case 'years':  return diffYears(a, b)
    }
  }

  // =========================================================================
  // Period boundaries  (all return new NepaliDate)
  // =========================================================================

  /** First day of this date's month (day = 1). */
  startOfMonth(): NepaliDate {
    return new NepaliDate(startOfMonth(this.toPlain()))
  }

  /** Last day of this date's month. */
  endOfMonth(): NepaliDate {
    return new NepaliDate(endOfMonth(this.toPlain()))
  }

  /** 1 Baisakh of this date's BS year. */
  startOfYear(): NepaliDate {
    return new NepaliDate(startOfYear(this.toPlain()))
  }

  /** Last day of Chaitra of this date's BS year. */
  endOfYear(): NepaliDate {
    return new NepaliDate(endOfYear(this.toPlain()))
  }

  // =========================================================================
  // Fiscal year
  // =========================================================================

  /**
   * Nepal fiscal year information for this date.
   * The fiscal year runs from 1 Shrawan to last day of Ashadh.
   */
  fiscalYear(): FiscalYear {
    return fiscalYear(this.toPlain())
  }

  // =========================================================================
  // Calendar grid
  // =========================================================================

  /**
   * Generate a flat array of CalendarDay cells for this date's month.
   * Always returns a multiple of 7 (complete rows).
   * Leading/trailing cells from adjacent months fill partial rows.
   *
   * @param weekStartDay  0 = Sunday (default), 6 = Saturday
   *
   * @example
   *   new NepaliDate(2082, 1, 1).calendarGrid()
   *   // CalendarDay[] with 35 or 42 entries
   */
  calendarGrid(weekStartDay: DayOfWeek = 0): CalendarDay[] {
    return buildCalendarGrid(this.year, this.month, weekStartDay)
  }

  // =========================================================================
  // Serialisation
  // =========================================================================

  /**
   * ISO-style string: "YYYY-MM-DD" with zero-padded month and day.
   *
   * @example
   *   new NepaliDate(2082, 1, 5).toString()  // "2082-01-05"
   */
  toString(): string {
    const mm = String(this.month).padStart(2, '0')
    const dd = String(this.day).padStart(2, '0')
    return `${this.year}-${mm}-${dd}`
  }

  /**
   * Called by JSON.stringify — returns the same format as toString().
   *
   * @example
   *   JSON.stringify({ date: new NepaliDate(2082, 1, 5) })
   *   // '{"date":"2082-01-05"}'
   */
  toJSON(): string {
    return this.toString()
  }

  /**
   * Numeric value — milliseconds since Unix epoch of the equivalent AD date.
   * Enables NepaliDate instances to be used in numeric comparisons:
   *
   * @example
   *   +new NepaliDate(2082, 1, 1) < +new NepaliDate(2082, 2, 1)  // true
   */
  valueOf(): number {
    return this.toAD().getTime()
  }

  /** Return a new NepaliDate with the same year, month, and day. */
  clone(): NepaliDate {
    return new NepaliDate(this.year, this.month, this.day)
  }
}
