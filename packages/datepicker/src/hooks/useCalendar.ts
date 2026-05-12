/**
 * useCalendar — core calendar state hook.
 *
 * Manages month navigation, day grid generation, disabled-date
 * resolution, and today detection. Consumed by CalendarGrid.
 */

import { useState, useCallback, useMemo } from "react";
import type {
  BSDateValue,
  DisabledMatcher,
  DateMatcher,
  WeekStartDay,
} from "../components";

// ─── inline BS engine (no external dep needed at hook level) ──────
// The full engine lives in @nepali-cal/core; we re-export the pieces
// needed here so this hook stays self-contained for bundlers.

const BS_DATA: Record<number, number[]> = {
  2070: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2087: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2088: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2089: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2090: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2092: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2093: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2094: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2096: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 30, 29, 30, 30],
  2099: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2100: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
};

const EPOCH_BS = { year: 2000, month: 1, day: 1 };
const EPOCH_AD = new Date(Date.UTC(1943, 3, 14));

export function bsMonthDays(year: number, month: number): number {
  return (BS_DATA[year] ?? BS_DATA[2082])[month - 1];
}

function bsYearDays(year: number): number {
  return (BS_DATA[year] ?? BS_DATA[2082]).reduce((a, b) => a + b, 0);
}

export function bsToAD(year: number, month: number, day: number): Date {
  let days = 0;
  let y = EPOCH_BS.year,
    m = EPOCH_BS.month;
  while (y < year) {
    days += bsYearDays(y);
    y++;
  }
  while (m < month) {
    days += bsMonthDays(year, m);
    m++;
  }
  days += day - EPOCH_BS.day;
  const r = new Date(EPOCH_AD.getTime());
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

export function adToBS(date: Date): BSDateValue {
  const epochMS = EPOCH_AD.getTime();
  const inputMS = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  let remaining = Math.round((inputMS - epochMS) / 86_400_000);
  let year = EPOCH_BS.year,
    month = EPOCH_BS.month,
    day = EPOCH_BS.day;

  if (remaining >= 0) {
    let dim = bsMonthDays(year, month);
    while (remaining >= dim) {
      remaining -= dim;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      dim = bsMonthDays(year, month);
    }
    day = day + remaining;
    if (day > bsMonthDays(year, month)) {
      remaining = day - bsMonthDays(year, month) - 1;
      day = 1;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      day += remaining;
    }
  } else {
    while (remaining < 0) {
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      remaining += bsMonthDays(year, month);
    }
    day = remaining + 1;
  }
  return { year, month, day };
}

export function todayBS(): BSDateValue {
  const now = new Date();
  const nepalMs =
    now.getTime() + now.getTimezoneOffset() * 60_000 + 345 * 60_000;
  return adToBS(new Date(nepalMs));
}

export function bsDOW(year: number, month: number, day: number): number {
  return bsToAD(year, month, day).getUTCDay();
}

// ─── CalendarDay ──────────────────────────────────────────────────

export interface CalendarDayCell {
  bsDate: BSDateValue;
  adDate: { year: number; month: number; day: number };
  dayOfWeek: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
}

// ─── disabled resolution ──────────────────────────────────────────

function bsDateMs(d: BSDateValue): number {
  return bsToAD(d.year, d.month, d.day).getTime();
}

function bsEqual(a: BSDateValue, b: BSDateValue): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function resolveDisabled(
  date: BSDateValue,
  matchers?: DisabledMatcher | DisabledMatcher[],
): boolean {
  if (!matchers) return false;
  const list = Array.isArray(matchers) ? matchers : [matchers];
  const ms = bsDateMs(date);

  for (const m of list) {
    if (typeof m === "function") {
      if ((m as DateMatcher)(date)) return true;
      continue;
    }
    if (Array.isArray(m)) {
      if (m.some((d) => bsEqual(d, date))) return true;
      continue;
    }
    if (typeof m === "object") {
      if ("year" in m && "month" in m && "day" in m) {
        if (bsEqual(m as BSDateValue, date)) return true;
        continue;
      }
      if ("before" in m) {
        if (ms < bsDateMs((m as { before: BSDateValue }).before)) return true;
        continue;
      }
      if ("after" in m) {
        if (ms > bsDateMs((m as { after: BSDateValue }).after)) return true;
        continue;
      }
      if ("from" in m && "to" in m) {
        const { from, to } = m as { from: BSDateValue; to: BSDateValue };
        if (ms >= bsDateMs(from) && ms <= bsDateMs(to)) return true;
        continue;
      }
    }
  }
  return false;
}

// ─── grid generation ──────────────────────────────────────────────

export function buildCalendarGrid(
  year: number,
  month: number,
  weekStartDay: WeekStartDay = 0,
): CalendarDayCell[] {
  const today = todayBS();
  const daysInMonth = bsMonthDays(year, month);
  const firstDOW = bsDOW(year, month, 1);
  const leadingDays = (firstDOW - weekStartDay + 7) % 7;

  const cells: CalendarDayCell[] = [];

  // Leading cells from previous month
  let prevYear = year,
    prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }
  const prevMonthDays = bsMonthDays(prevYear, prevMonth);
  for (let i = leadingDays - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const ad = bsToAD(prevYear, prevMonth, d);
    cells.push({
      bsDate: { year: prevYear, month: prevMonth, day: d },
      adDate: {
        year: ad.getUTCFullYear(),
        month: ad.getUTCMonth() + 1,
        day: ad.getUTCDate(),
      },
      dayOfWeek: bsDOW(prevYear, prevMonth, d),
      isToday: bsEqual({ year: prevYear, month: prevMonth, day: d }, today),
      isCurrentMonth: false,
      isWeekend: bsDOW(prevYear, prevMonth, d) === 6,
    });
  }

  // Current month cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = bsDOW(year, month, d);
    const ad = bsToAD(year, month, d);
    cells.push({
      bsDate: { year, month, day: d },
      adDate: {
        year: ad.getUTCFullYear(),
        month: ad.getUTCMonth() + 1,
        day: ad.getUTCDate(),
      },
      dayOfWeek: dow,
      isToday: bsEqual({ year, month, day: d }, today),
      isCurrentMonth: true,
      isWeekend: dow === 6,
    });
  }

  // Trailing cells to complete the grid (multiple of 7)
  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextYear = year,
    nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }
  let trail = 1;
  while (cells.length < totalCells) {
    const ad = bsToAD(nextYear, nextMonth, trail);
    cells.push({
      bsDate: { year: nextYear, month: nextMonth, day: trail },
      adDate: {
        year: ad.getUTCFullYear(),
        month: ad.getUTCMonth() + 1,
        day: ad.getUTCDate(),
      },
      dayOfWeek: bsDOW(nextYear, nextMonth, trail),
      isToday: bsEqual({ year: nextYear, month: nextMonth, day: trail }, today),
      isCurrentMonth: false,
      isWeekend: bsDOW(nextYear, nextMonth, trail) === 6,
    });
    trail++;
  }

  return cells;
}

// ─── hook ─────────────────────────────────────────────────────────

export interface UseCalendarOptions {
  initialYear?: number;
  initialMonth?: number;
  controlledYear?: number;
  controlledMonth?: number;
  weekStartDay?: WeekStartDay;
  onMonthChange?: (year: number, month: number) => void;
}

export interface UseCalendarReturn {
  year: number;
  month: number;
  cells: CalendarDayCell[];
  prevMonth: () => void;
  nextMonth: () => void;
  prevYear: () => void;
  nextYear: () => void;
  goTo: (year: number, month: number) => void;
  goToToday: () => void;
  daysInMonth: number;
  today: BSDateValue;
}

export function useCalendar({
  initialYear,
  initialMonth,
  controlledYear,
  controlledMonth,
  weekStartDay = 0,
  onMonthChange,
}: UseCalendarOptions = {}): UseCalendarReturn {
  const today = useMemo(() => todayBS(), []);

  const [internalYear, setInternalYear] = useState(initialYear ?? today.year);
  const [internalMonth, setInternalMonth] = useState(
    initialMonth ?? today.month,
  );

  const year = controlledYear ?? internalYear;
  const month = controlledMonth ?? internalMonth;

  const navigate = useCallback(
    (deltaMonths: number) => {
      let newM = (controlledMonth ?? internalMonth) + deltaMonths;
      let newY = controlledYear ?? internalYear;
      while (newM > 12) {
        newM -= 12;
        newY++;
      }
      while (newM < 1) {
        newM += 12;
        newY--;
      }
      setInternalYear(newY);
      setInternalMonth(newM);
      onMonthChange?.(newY, newM);
    },
    [
      controlledYear,
      controlledMonth,
      internalYear,
      internalMonth,
      onMonthChange,
    ],
  );

  const goTo = useCallback(
    (y: number, m: number) => {
      setInternalYear(y);
      setInternalMonth(m);
      onMonthChange?.(y, m);
    },
    [onMonthChange],
  );

  const cells = useMemo(
    () => buildCalendarGrid(year, month, weekStartDay),
    [year, month, weekStartDay],
  );

  return {
    year,
    month,
    cells,
    prevMonth: useCallback(() => navigate(-1), [navigate]),
    nextMonth: useCallback(() => navigate(1), [navigate]),
    prevYear: useCallback(() => {
      setInternalYear((y) => y - 1);
      onMonthChange?.(year - 1, month);
    }, [year, month, onMonthChange]),
    nextYear: useCallback(() => {
      setInternalYear((y) => y + 1);
      onMonthChange?.(year + 1, month);
    }, [year, month, onMonthChange]),
    goTo,
    goToToday: useCallback(() => goTo(today.year, today.month), [goTo, today]),
    daysInMonth: bsMonthDays(year, month),
    today,
  };
}
