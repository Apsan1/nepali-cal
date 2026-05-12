// =============================================================================
// @nepali-cal/core — index.ts
//
// Public API surface.  Everything re-exported here is the stable,
// versioned contract consumers depend on.
//
// Import patterns:
//   import { NepaliDate }            from '@nepali-cal/core'
//   import { bsToAD, adToBS }        from '@nepali-cal/core'
//   import type { BSDate, ADDate }   from '@nepali-cal/core'
// =============================================================================

// ── Main class ──────────────────────────────────────────────────────────────
export { NepaliDate } from './NepaliDate'

// ── Conversion — BS ↔ AD ────────────────────────────────────────────────────
export {
  bsToAD,
  bsToADPlain,
  adToBS,
  adPlainToBS,
} from './conversion'

// ── Conversion — day of week ─────────────────────────────────────────────────
export { bsDayOfWeek } from './conversion'

// ── Month / year info ────────────────────────────────────────────────────────
export {
  bsMonthDays,
  bsYearDays,
} from './conversion'

// ── Arithmetic ───────────────────────────────────────────────────────────────
export {
  addDays,
  addMonths,
  addYears,
} from './conversion'

// ── Difference ───────────────────────────────────────────────────────────────
export {
  diffDays,
  diffMonths,
  diffYears,
} from './conversion'

// ── Comparison ───────────────────────────────────────────────────────────────
export {
  bsDateEquals,
  bsDateBefore,
  bsDateAfter,
  bsDateBetween,
} from './conversion'

// ── Period boundaries ────────────────────────────────────────────────────────
export {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from './conversion'

// ── Fiscal year ──────────────────────────────────────────────────────────────
export { fiscalYear } from './conversion'

// ── Validation ───────────────────────────────────────────────────────────────
export {
  isValidBSDate,
  validateBSDate,
} from './conversion'

// ── Today helpers ────────────────────────────────────────────────────────────
export {
  todayBS,
  todayAD,
} from './conversion'

// ── Calendar grid ────────────────────────────────────────────────────────────
export { buildCalendarGrid } from './conversion'

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  BSDate,
  ADDate,
  DayOfWeek,
  CalendarSystem,
  Locale,
  FiscalQuarter,
  FiscalYear,
  CalendarDay,
  DateRange,
} from './types'

// Error classes are value exports (not type-only) — consumers can instanceof-check them
export { NepaliRangeError, NepaliInvalidDateError } from './types'

// ── Raw calendar data (advanced / library authors) ───────────────────────────
export {
  BS_CALENDAR_DATA,
  BS_EPOCH,
  BS_MIN_YEAR,
  BS_MAX_YEAR,
  NEPAL_UTC_OFFSET_MINUTES,
} from './data'
