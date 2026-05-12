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

import {
  bsToAD,
  adToBS,
  todayBS,
  bsMonthDays,
  buildCalendarGrid,
} from "@nepali-cal/core";

// ─── inline BS engine (no external dep needed at hook level) ──────
// The full engine lives in @nepali-cal/core; we re-export the pieces
// needed here so this hook stays self-contained for bundlers.

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
