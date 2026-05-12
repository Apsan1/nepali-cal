// =============================================================================
// @nepali-cal/core — conversion.ts
//
// Pure, side-effect-free BS↔AD conversion functions.
// Every function is individually tree-shakeable.
//
// ALGORITHM
//   All conversions are anchor-relative day offsets:
//
//   BS → AD:
//     1. Count total days from epoch-BS (2000-01-01) to target-BS
//        by walking the calendar data table year-by-year, month-by-month.
//     2. Add that offset to epoch-AD (1943-04-14 UTC).
//
//   AD → BS:
//     1. Compute signed day difference between input-AD and epoch-AD.
//     2. Walk the calendar data table, consuming months until the
//        remaining days fit inside a single month.
// =============================================================================

import {
  BS_CALENDAR_DATA,
  BS_EPOCH,
  BS_MIN_YEAR,
  BS_MAX_YEAR,
  NEPAL_UTC_OFFSET_MINUTES,
} from './data'

import {
  BSDate,
  ADDate,
  DayOfWeek,
  FiscalYear,
  FiscalQuarter,
  CalendarDay,
  NepaliRangeError,
  NepaliInvalidDateError,
} from './types'

// =============================================================================
// Validation
// =============================================================================

/**
 * Returns true if (year, month, day) is a valid, in-range BS date.
 * Never throws — use validateBSDate if you want an exception on failure.
 */
export function isValidBSDate(year: number, month: number, day: number): boolean {
  if (
    !Number.isInteger(year)  ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) return false

  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) return false
  if (month < 1 || month > 12) return false

  const monthData = BS_CALENDAR_DATA[year]
  if (!monthData) return false

  const maxDay = monthData[month - 1] ?? 0
  return day >= 1 && day <= maxDay
}

/**
 * Throws NepaliInvalidDateError or NepaliRangeError if the date is bad.
 * Returns void on success.
 */
export function validateBSDate(year: number, month: number, day: number): void {
  if (
    !Number.isInteger(year)  ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new NepaliInvalidDateError(
      `All date components must be integers — got: year=${year}, month=${month}, day=${day}`
    )
  }

  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
    throw new NepaliRangeError(
      `BS year ${year} is outside the supported range ${BS_MIN_YEAR}–${BS_MAX_YEAR}`
    )
  }

  if (month < 1 || month > 12) {
    throw new NepaliInvalidDateError(
      `BS month must be 1–12, got ${month}`
    )
  }

  const monthData = BS_CALENDAR_DATA[year]
  // monthData is always defined here because we already checked year bounds above
  const maxDay = monthData![month - 1] ?? 0

  if (day < 1 || day > maxDay) {
    throw new NepaliInvalidDateError(
      `BS day ${day} is invalid for ${year}/${month} — valid range is 1–${maxDay}`
    )
  }
}

// =============================================================================
// Month / year helpers
// =============================================================================

/**
 * Number of days in the given BS month.
 *
 * @throws NepaliRangeError   if year is outside 1970–2100
 * @throws NepaliInvalidDateError if month is outside 1–12
 */
export function bsMonthDays(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new NepaliInvalidDateError(`BS month must be 1–12, got ${month}`)
  }
  const data = BS_CALENDAR_DATA[year]
  if (!data) {
    throw new NepaliRangeError(
      `BS year ${year} is outside the supported range ${BS_MIN_YEAR}–${BS_MAX_YEAR}`
    )
  }
  return data[month - 1]
}

/**
 * Total days in the given BS year (sum of all 12 months).
 *
 * @throws NepaliRangeError if year is outside 1970–2100
 */
export function bsYearDays(year: number): number {
  const data = BS_CALENDAR_DATA[year]
  if (!data) {
    throw new NepaliRangeError(
      `BS year ${year} is outside the supported range ${BS_MIN_YEAR}–${BS_MAX_YEAR}`
    )
  }
  // Explicit loop — avoids creating an intermediate array via reduce
  let total = 0
  for (let i = 0; i < 12; i++) total += data[i]
  return total
}

// =============================================================================
// BS → AD
// =============================================================================

/**
 * Convert a BS date to a JavaScript Date representing midnight UTC
 * of the equivalent Gregorian day.
 *
 * @throws NepaliRangeError        if year is outside 1970–2100
 * @throws NepaliInvalidDateError  if month or day is structurally invalid
 *
 * @example
 *   bsToAD(2082, 1, 1)   // Date { 2025-04-14T00:00:00.000Z }
 *   bsToAD(2081, 1, 1)   // Date { 2024-04-13T00:00:00.000Z }
 */
export function bsToAD(year: number, month: number, day: number): Date {
  validateBSDate(year, month, day)

  const epoch = BS_EPOCH.bs
  let dayOffset = 0

  // Count whole years from epoch year up to (not including) target year
  for (let y = epoch.year; y < year; y++) {
    dayOffset += bsYearDays(y)
  }

  // Count whole months within the target year up to (not including) target month
  // When target year === epoch year, start from epoch month; otherwise start from 1
  const startMonth = (year === epoch.year) ? epoch.month : 1
  for (let m = startMonth; m < month; m++) {
    dayOffset += bsMonthDays(year, m)
  }

  // Add remaining days (day - 1 because epoch day is already day 1)
  dayOffset += day - epoch.day

  // Apply offset to epoch AD date
  const result = new Date(BS_EPOCH.ad.getTime())
  result.setUTCDate(result.getUTCDate() + dayOffset)
  return result
}

/**
 * Convert a BS date to a plain ADDate object (fully serialisable).
 *
 * @example
 *   bsToADPlain(2082, 1, 1)  // { year: 2025, month: 4, day: 14 }
 */
export function bsToADPlain(year: number, month: number, day: number): ADDate {
  const ad = bsToAD(year, month, day)
  return {
    year:  ad.getUTCFullYear(),
    month: ad.getUTCMonth() + 1,
    day:   ad.getUTCDate(),
  }
}

// =============================================================================
// AD → BS
// =============================================================================

/**
 * Convert a JavaScript Date to a BS date.
 * Uses UTC date components — the caller is responsible for timezone
 * conversion before passing the Date in (see todayBS() for an example).
 *
 * @throws NepaliRangeError if the AD date is outside the conversion range
 *
 * @example
 *   adToBS(new Date('2025-04-14T00:00:00Z'))  // { year: 2082, month: 1, day: 1 }
 *   adToBS(new Date('2024-04-13T00:00:00Z'))  // { year: 2081, month: 1, day: 1 }
 */
export function adToBS(date: Date): BSDate {
  const epochMs = BS_EPOCH.ad.getTime()
  const inputMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )

  // Signed day difference from epoch AD to input AD
  let remaining = Math.round((inputMs - epochMs) / 86_400_000)

  // Start position: epoch BS date — use explicit number type to prevent literal narrowing
  let year:  number = BS_EPOCH.bs.year
  let month: number = BS_EPOCH.bs.month
  let day:   number = BS_EPOCH.bs.day  // = 1

  if (remaining === 0) {
    return { year, month, day }
  }

  if (remaining > 0) {
    // Forward from epoch: consume full months
    let daysInMonth = bsMonthDays(year, month)

    while (remaining >= daysInMonth) {
      remaining -= daysInMonth
      month += 1

      if (month > 12) {
        month = 1
        year += 1
        if (!BS_CALENDAR_DATA[year]) {
          throw new NepaliRangeError(
            `The AD date ${date.toISOString().slice(0, 10)} maps to BS year ${year}, ` +
            `which is beyond the supported maximum of ${BS_MAX_YEAR}`
          )
        }
      }

      daysInMonth = bsMonthDays(year, month)
    }

    // remaining < daysInMonth — we are inside this month
    day = remaining + 1
  } else {
    // Backward from epoch: walk backwards through months
    while (remaining < 0) {
      month -= 1

      if (month < 1) {
        month = 12
        year -= 1
        if (!BS_CALENDAR_DATA[year]) {
          throw new NepaliRangeError(
            `The AD date ${date.toISOString().slice(0, 10)} maps to BS year ${year}, ` +
            `which is before the supported minimum of ${BS_MIN_YEAR}`
          )
        }
      }

      remaining += bsMonthDays(year, month)
    }

    // remaining is now 0-based within the month
    day = remaining + 1
  }

  return { year, month, day }
}

/**
 * Convert a plain ADDate to a BSDate.
 *
 * @example
 *   adPlainToBS({ year: 2025, month: 4, day: 14 })  // { year: 2082, month: 1, day: 1 }
 */
export function adPlainToBS(ad: ADDate): BSDate {
  return adToBS(new Date(Date.UTC(ad.year, ad.month - 1, ad.day)))
}

// =============================================================================
// Day of week
// =============================================================================

/**
 * Day of week for a BS date.
 * Returns 0 (Sunday) … 6 (Saturday), matching JS Date.getUTCDay().
 * Saturday (6) is the Nepali weekend day.
 */
export function bsDayOfWeek(year: number, month: number, day: number): DayOfWeek {
  return bsToAD(year, month, day).getUTCDay() as DayOfWeek
}

// =============================================================================
// Date arithmetic
// =============================================================================

/**
 * Add (or subtract, if negative) a number of days to a BS date.
 * Crosses month and year boundaries correctly.
 *
 * @example
 *   addDays({ year: 2082, month: 1, day: 28 }, 5)
 *   // { year: 2082, month: 2, day: 1 }  (Baisakh 2082 has 31 days)
 */
export function addDays(date: BSDate, days: number): BSDate {
  const ad = bsToAD(date.year, date.month, date.day)
  ad.setUTCDate(ad.getUTCDate() + days)
  return adToBS(ad)
}

/**
 * Add (or subtract, if negative) a number of months to a BS date.
 * Day is clamped to the last day of the resulting month if needed.
 *
 * @example
 *   addMonths({ year: 2082, month: 11, day: 15 }, 3)
 *   // { year: 2083, month: 2, day: 15 }
 */
export function addMonths(date: BSDate, months: number): BSDate {
  let year  = date.year
  let month = date.month + months

  while (month > 12) { month -= 12; year += 1 }
  while (month < 1)  { month += 12; year -= 1 }

  if (!BS_CALENDAR_DATA[year]) {
    throw new NepaliRangeError(
      `addMonths result year ${year} is outside the supported range ${BS_MIN_YEAR}–${BS_MAX_YEAR}`
    )
  }

  const maxDay = bsMonthDays(year, month)
  const day    = Math.min(date.day, maxDay)

  return { year, month, day }
}

/**
 * Add (or subtract, if negative) a number of years to a BS date.
 * Day is clamped to the last day of the resulting month if needed.
 *
 * @example
 *   addYears({ year: 2080, month: 6, day: 15 }, 3)
 *   // { year: 2083, month: 6, day: 15 }
 */
export function addYears(date: BSDate, years: number): BSDate {
  const year = date.year + years

  if (!BS_CALENDAR_DATA[year]) {
    throw new NepaliRangeError(
      `addYears result year ${year} is outside the supported range ${BS_MIN_YEAR}–${BS_MAX_YEAR}`
    )
  }

  const maxDay = bsMonthDays(year, date.month)
  const day    = Math.min(date.day, maxDay)

  return { year, month: date.month, day }
}

// =============================================================================
// Difference
// =============================================================================

/**
 * Signed day difference: positive when b is after a, negative when before.
 *
 * @example
 *   diffDays({ year: 2082, month: 1, day: 1 }, { year: 2082, month: 1, day: 16 })
 *   // 15
 */
export function diffDays(a: BSDate, b: BSDate): number {
  const msA = bsToAD(a.year, a.month, a.day).getTime()
  const msB = bsToAD(b.year, b.month, b.day).getTime()
  return Math.round((msB - msA) / 86_400_000)
}

/**
 * Signed whole-month difference: positive when b is after a.
 * Partial months are truncated (not rounded).
 *
 * @example
 *   diffMonths({ year: 2082, month: 1, day: 1 }, { year: 2082, month: 4, day: 15 })
 *   // 3
 */
export function diffMonths(a: BSDate, b: BSDate): number {
  return (b.year - a.year) * 12 + (b.month - a.month)
}

/**
 * Signed whole-year difference: positive when b is after a.
 */
export function diffYears(a: BSDate, b: BSDate): number {
  return Math.trunc(diffMonths(a, b) / 12)
}

// =============================================================================
// Comparison
// =============================================================================

/** True if a and b represent the exact same BS date. */
export function bsDateEquals(a: BSDate, b: BSDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

/** True if a is strictly before b. */
export function bsDateBefore(a: BSDate, b: BSDate): boolean {
  if (a.year  !== b.year)  return a.year  < b.year
  if (a.month !== b.month) return a.month < b.month
  return a.day < b.day
}

/** True if a is strictly after b. */
export function bsDateAfter(a: BSDate, b: BSDate): boolean {
  return bsDateBefore(b, a)
}

/**
 * True if date falls on or after start AND on or before end.
 * Range is inclusive on both ends.
 */
export function bsDateBetween(date: BSDate, start: BSDate, end: BSDate): boolean {
  return !bsDateBefore(date, start) && !bsDateAfter(date, end)
}

// =============================================================================
// Period boundaries
// =============================================================================

/** First day of the month containing date. */
export function startOfMonth(date: BSDate): BSDate {
  return { year: date.year, month: date.month, day: 1 }
}

/** Last day of the month containing date. */
export function endOfMonth(date: BSDate): BSDate {
  return {
    year:  date.year,
    month: date.month,
    day:   bsMonthDays(date.year, date.month),
  }
}

/** First day (1 Baisakh) of the BS year containing date. */
export function startOfYear(date: BSDate): BSDate {
  return { year: date.year, month: 1, day: 1 }
}

/** Last day (last day of Chaitra) of the BS year containing date. */
export function endOfYear(date: BSDate): BSDate {
  return {
    year:  date.year,
    month: 12,
    day:   bsMonthDays(date.year, 12),
  }
}

// =============================================================================
// Fiscal year
// =============================================================================

/**
 * Nepal fiscal year information for a given BS date.
 *
 * The Nepali fiscal year runs from 1 Shrawan (month 4) of one BS year
 * to the last day of Ashadh (month 3) of the next BS year.
 *
 * Quarters:
 *   Q1 — Shrawan–Ashwin    (months 4–6)
 *   Q2 — Kartik–Poush      (months 7–9)
 *   Q3 — Magh–Chaitra      (months 10–12)
 *   Q4 — Baisakh–Ashadh    (months 1–3, belonging to the *next* FY label)
 *
 * @example
 *   fiscalYear({ year: 2082, month: 5, day: 1 })
 *   // { start: {2082,4,1}, end: {2083,3,32}, label: '2082/83', quarter: 1 }
 *
 *   fiscalYear({ year: 2082, month: 2, day: 1 })
 *   // quarter: 4, label: '2081/82'  ← Jestha 2082 still in FY 2081/82
 */
export function fiscalYear(date: BSDate): FiscalYear {
  // Months 1–3 (Baisakh–Ashadh) are the tail of the *previous* fiscal year
  const fyStartYear: number = date.month >= 4 ? date.year : date.year - 1
  const fyEndYear:   number = fyStartYear + 1

  const start: BSDate = { year: fyStartYear, month: 4, day: 1 }
  const end:   BSDate = { year: fyEndYear,   month: 3, day: bsMonthDays(fyEndYear, 3) }

  let quarter: FiscalQuarter
  const m = date.month
  if      (m >= 4  && m <= 6)  quarter = 1
  else if (m >= 7  && m <= 9)  quarter = 2
  else if (m >= 10 && m <= 12) quarter = 3
  else                          quarter = 4  // months 1–3

  const endYearShort = String(fyEndYear).slice(-2)
  const label        = `${fyStartYear}/${endYearShort}`

  return { start, end, label, quarter }
}

// =============================================================================
// Today (Nepal timezone)
// =============================================================================

/**
 * Today's date in BS, using the Asia/Kathmandu timezone (UTC+5:45).
 * Safe for both browser and Node.js — no Intl or OS dependency.
 */
export function todayBS(): BSDate {
  const nowMs     = Date.now()
  const nepalMs   = nowMs + Number(NEPAL_UTC_OFFSET_MINUTES) * 60_000
  const nepalDate = new Date(nepalMs)

  // Build a "fake UTC" date using Nepal local time components
  const localDate = new Date(Date.UTC(
    nepalDate.getUTCFullYear(),
    nepalDate.getUTCMonth(),
    nepalDate.getUTCDate()
  ))

  return adToBS(localDate)
}

/**
 * Today's AD date (midnight UTC) as seen from Nepal timezone.
 * Equivalent to bsToAD(todayBS()).
 */
export function todayAD(): Date {
  const bs = todayBS()
  return bsToAD(bs.year, bs.month, bs.day)
}

// =============================================================================
// Calendar grid
// =============================================================================

/**
 * Build the full calendar grid for a given BS year/month.
 *
 * Returns a flat array of CalendarDay cells — always a multiple of 7
 * (complete weeks). Leading and trailing cells from adjacent months
 * fill the first and last partial weeks.
 *
 * @param year         BS year to render
 * @param month        BS month to render (1–12)
 * @param weekStartDay Which day the week starts on (0=Sunday … 6=Saturday)
 *
 * @example
 *   buildCalendarGrid(2082, 1, 0)  // 35 or 42 CalendarDay objects
 */
export function buildCalendarGrid(
  year: number,
  month: number,
  weekStartDay: DayOfWeek = 0,
): CalendarDay[] {
  const today        = todayBS()
  const daysInMonth  = bsMonthDays(year, month)
  const firstDOW     = bsDayOfWeek(year, month, 1)

  // How many cells to show from the previous month before the 1st
  const leadingCount = (firstDOW - weekStartDay + 7) % 7

  const cells: CalendarDay[] = []

  // ── Leading cells (previous month) ──────────────────────────────
  if (leadingCount > 0) {
    let prevYear  = year
    let prevMonth = month - 1
    if (prevMonth < 1) { prevMonth = 12; prevYear -= 1 }

    const prevMonthDays = bsMonthDays(prevYear, prevMonth)

    for (let i = leadingCount - 1; i >= 0; i--) {
      const d   = prevMonthDays - i
      const dow = bsDayOfWeek(prevYear, prevMonth, d) as DayOfWeek
      const ad  = bsToADPlain(prevYear, prevMonth, d)

      cells.push({
        bsDate:        { year: prevYear, month: prevMonth, day: d },
        adDate:        ad,
        dayOfWeek:     dow,
        isToday:       bsDateEquals({ year: prevYear, month: prevMonth, day: d }, today),
        isCurrentMonth: false,
        isWeekend:     dow === 6,
      })
    }
  }

  // ── Current month cells ──────────────────────────────────────────
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = bsDayOfWeek(year, month, d) as DayOfWeek
    const ad  = bsToADPlain(year, month, d)

    cells.push({
      bsDate:        { year, month, day: d },
      adDate:        ad,
      dayOfWeek:     dow,
      isToday:       bsDateEquals({ year, month, day: d }, today),
      isCurrentMonth: true,
      isWeekend:     dow === 6,
    })
  }

  // ── Trailing cells (next month) — fill to a multiple of 7 ────────
  const totalCells  = Math.ceil(cells.length / 7) * 7
  let nextYear  = year
  let nextMonth = month + 1
  if (nextMonth > 12) { nextMonth = 1; nextYear += 1 }

  let trail = 1
  while (cells.length < totalCells) {
    const dow = bsDayOfWeek(nextYear, nextMonth, trail) as DayOfWeek
    const ad  = bsToADPlain(nextYear, nextMonth, trail)

    cells.push({
      bsDate:        { year: nextYear, month: nextMonth, day: trail },
      adDate:        ad,
      dayOfWeek:     dow,
      isToday:       bsDateEquals({ year: nextYear, month: nextMonth, day: trail }, today),
      isCurrentMonth: false,
      isWeekend:     dow === 6,
    })
    trail += 1
  }

  return cells
}
