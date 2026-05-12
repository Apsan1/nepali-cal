/**
 * @nepali-cal/datepicker — Component Props
 *
 * All component prop types are exported so consumers can
 * extend, wrap, or build on top of them with full type safety.
 */

import type {
  ReactNode,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
} from "react";
import type { DatePickerTheme, ThemePreset } from "../theme";

// ─── shared ──────────────────────────────────────────────────────

/** A BS date plain object — no class needed in props */
export interface BSDateValue {
  year: number;
  month: number;
  day: number;
}

/** AD date plain object */
export interface ADDateValue {
  year: number;
  month: number;
  day: number;
}

/** Calendar system toggle */
export type CalendarSystem = "BS" | "AD";

/** Language locale */
export type DatePickerLocale = "en" | "ne";

/** Week start day: 0=Sunday, 6=Saturday */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Popover placement relative to trigger */
export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "bottom-center"
  | "top-start"
  | "top-end"
  | "top-center";

// ─── disabled date matchers ───────────────────────────────────────

/** A function that returns true if a date should be disabled */
export type DateMatcher = (date: BSDateValue) => boolean;

/** Union of ways to specify disabled dates */
export type DisabledMatcher =
  | BSDateValue // exact date
  | BSDateValue[] // list of dates
  | { before: BSDateValue } // all dates before
  | { after: BSDateValue } // all dates after
  | { from: BSDateValue; to: BSDateValue } // date range
  | DateMatcher; // custom function

// ─── day render meta ──────────────────────────────────────────────

/** Everything you know about a day cell when rendering it */
export interface DayRenderMeta {
  /** The BS date for this cell */
  bsDate: BSDateValue;
  /** The equivalent AD date */
  adDate: ADDateValue;
  /** Day of week (0=Sunday, 6=Saturday) */
  dayOfWeek: number;
  /** Whether this day is today */
  isToday: boolean;
  /** Whether this is the selected date */
  isSelected: boolean;
  /** Whether this day is disabled */
  isDisabled: boolean;
  /** Whether this day is a Saturday (weekend in Nepal) */
  isWeekend: boolean;
  /** Whether this day belongs to adjacent months */
  isOutsideMonth: boolean;
  /** Whether this day is in a range selection */
  isInRange: boolean;
  /** Whether this is the start of a range */
  isRangeStart: boolean;
  /** Whether this is the end of a range */
  isRangeEnd: boolean;
}

// ─── event types ─────────────────────────────────────────────────

export type DayClickHandler = (date: BSDateValue, e: React.MouseEvent) => void;
export type DayHoverHandler = (
  date: BSDateValue | null,
  e?: React.MouseEvent,
) => void;
export type MonthChangeHandler = (year: number, month: number) => void;
export type OpenChangeHandler = (open: boolean) => void;

// ─── CalendarGrid props ───────────────────────────────────────────

export interface CalendarGridProps {
  /** BS year to display */
  year?: number;
  /** BS month to display (1=Baisakh … 12=Chaitra) */
  month?: number;
  /** Currently selected date */
  selected?: BSDateValue | null;
  /** Called on day click */
  onDayClick?: DayClickHandler;
  /** Called on day hover */
  onDayHover?: DayHoverHandler;
  /**
   * Custom day cell renderer.
   * Return null to use the default renderer.
   * Return a ReactNode to completely replace the day cell.
   *
   * @example
   *   renderDay={(day, meta) => (
   *     <div className={meta.isSelected ? 'selected' : ''}>
   *       {day.bsDate.day}
   *       {meta.isToday && <span>·</span>}
   *     </div>
   *   )}
   */
  renderDay?: (day: BSDateValue, meta: DayRenderMeta) => ReactNode | null;
  /**
   * Custom day cell content (lighter than renderDay —
   * wraps the default cell, injects extra content inside it).
   *
   * @example
   *   renderDayContent={(day, meta) => (
   *     <>
   *       {day.day}
   *       {meta.isToday && <TodayDot />}
   *     </>
   *   )}
   */
  renderDayContent?: (day: BSDateValue, meta: DayRenderMeta) => ReactNode;
  /** Disabled date matchers */
  disabled?: DisabledMatcher | DisabledMatcher[];
  /** Earliest selectable date */
  minDate?: BSDateValue;
  /** Latest selectable date */
  maxDate?: BSDateValue;
  /** Range start (for range pickers) */
  rangeFrom?: BSDateValue | null;
  /** Range end (for range pickers) */
  rangeTo?: BSDateValue | null;
  /** Hovered date for range preview */
  rangeHovered?: BSDateValue | null;
  /** Show days from adjacent months to fill the grid */
  showOutsideDays?: boolean;
  /** Language/locale */
  locale?: DatePickerLocale;
  /** Calendar system to display dates in */
  calendarSystem?: CalendarSystem;
  /** Day the week starts on */
  weekStartDay?: WeekStartDay;
  /** Show/hide the weekday header row */
  showWeekdays?: boolean;
  /** Theme override for just the grid */
  theme?: DatePickerTheme | ThemePreset;
  /** Custom class on the grid wrapper */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

// ─── CalendarHeader props ─────────────────────────────────────────

export interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear?: () => void;
  onNextYear?: () => void;
  /** Render a custom header entirely */
  renderHeader?: (props: {
    year: number;
    month: number;
    monthName: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
  }) => ReactNode;
  /** Render custom prev/next nav buttons */
  renderNavButton?: (
    direction: "prev" | "next",
    onClick: () => void,
  ) => ReactNode;
  /** Show double-arrow year navigation */
  showYearNav?: boolean;
  locale?: DatePickerLocale;
  theme?: DatePickerTheme | ThemePreset;
  className?: string;
}

// ─── Calendar props ───────────────────────────────────────────────

export interface CalendarProps extends CalendarGridProps {
  /** Initial month/year to display */
  defaultMonth?: { year: number; month: number };
  /** Called when month changes */
  onMonthChange?: MonthChangeHandler;
  /** Show the header navigation bar */
  showHeader?: boolean;
  /** Show year navigation arrows */
  showYearNav?: boolean;
  /** Show the footer */
  showFooter?: boolean;
  /** Show BS/AD toggle in footer */
  showSystemToggle?: boolean;
  /** Show "Today" button in footer */
  showTodayButton?: boolean;
  /** Custom footer content */
  renderFooter?: (props: { goToToday: () => void }) => ReactNode;
  /** Custom header */
  renderHeader?: CalendarHeaderProps["renderHeader"];
  /** Custom nav button */
  renderNavButton?: CalendarHeaderProps["renderNavButton"];
  theme?: DatePickerTheme | ThemePreset;
  className?: string;
  style?: CSSProperties;
}

// ─── DatePicker trigger props ─────────────────────────────────────

export interface TriggerRenderProps {
  /** Currently selected date (null if none) */
  value: BSDateValue | null;
  /** Formatted display string */
  displayValue: string;
  /** Whether the popover is open */
  isOpen: boolean;
  /** Toggle open/close */
  onClick: () => void;
  /** Whether the picker is disabled */
  disabled: boolean;
}

// ─── DatePicker props ─────────────────────────────────────────────

export interface DatePickerProps {
  // ── Value ──
  /** Controlled selected date */
  value?: BSDateValue | null;
  /** Uncontrolled default value */
  defaultValue?: BSDateValue | null;
  /** Called when selection changes */
  onChange?: (date: BSDateValue | null) => void;

  // ── Trigger ──
  /** Placeholder when no date is selected */
  placeholder?: string;
  /** Disable the entire picker */
  disabled?: boolean;
  /**
   * Render a custom trigger element.
   * When provided, the default button is replaced entirely.
   *
   * @example
   *   renderTrigger={({ displayValue, onClick, isOpen }) => (
   *     <button onClick={onClick} className="my-btn">
   *       {displayValue || 'Select date'}
   *     </button>
   *   )}
   */
  renderTrigger?: (props: TriggerRenderProps) => ReactNode;
  /** Format string for the trigger display (uses @nepali-cal/format tokens) */
  displayFormat?: string;

  // ── Calendar ──
  /** Initial month to open to (defaults to selected or today) */
  defaultMonth?: { year: number; month: number };
  /** Disabled date matchers */
  disabledDateMatcher?: DisabledMatcher | DisabledMatcher[];
  /** Min selectable date */
  minDate?: BSDateValue;
  /** Max selectable date */
  maxDate?: BSDateValue;
  /** Show adjacent month days */
  showOutsideDays?: boolean;
  /** Locale */
  locale?: DatePickerLocale;
  /** Calendar system displayed inside the calendar */
  calendarSystem?: CalendarSystem;
  /** Week start day */
  weekStartDay?: WeekStartDay;
  /** Custom day renderer */
  renderDay?: CalendarGridProps["renderDay"];
  /** Custom day content */
  renderDayContent?: CalendarGridProps["renderDayContent"];

  // ── Popover ──
  /** Popover placement relative to trigger */
  placement?: PopoverPlacement;
  /** Close popover on date select */
  closeOnSelect?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: OpenChangeHandler;

  // ── Theme ──
  /**
   * Theme object for full visual customization.
   * Use createTheme() or extendTheme() to build one.
   * Or pass a preset name: 'default' | 'minimal' | 'rounded' | 'sharp' | 'dark' | 'light' | 'nepali' | 'glass'
   */
  theme?: DatePickerTheme | ThemePreset;

  // ── Misc ──
  className?: string;
  style?: CSSProperties;
  /** HTML id for the trigger element */
  id?: string;
  /** aria-label for the trigger */
  "aria-label"?: string;
}

// ─── DateRangePicker props ────────────────────────────────────────

export interface DateRangeValue {
  from: BSDateValue | null;
  to: BSDateValue | null;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  defaultValue?: Partial<DateRangeValue>;
  onChange?: (range: DateRangeValue) => void;
  placeholder?: { from?: string; to?: string };
  disabled?: boolean;
  locale?: DatePickerLocale;
  calendarSystem?: CalendarSystem;
  minDate?: BSDateValue;
  maxDate?: BSDateValue;
  weekStartDay?: WeekStartDay;
  showOutsideDays?: boolean;
  displayFormat?: string;
  /** Show 1 or 2 calendar months side by side */
  numberOfMonths?: 1 | 2;
  placement?: PopoverPlacement;
  open?: boolean;
  onOpenChange?: OpenChangeHandler;
  closeOnSelect?: boolean;
  renderDay?: CalendarGridProps["renderDay"];
  renderDayContent?: CalendarGridProps["renderDayContent"];
  theme?: DatePickerTheme | ThemePreset;
  className?: string;
  style?: CSSProperties;
}

// ─── NepaliInput props ────────────────────────────────────────────

export interface NepaliInputProps {
  value?: BSDateValue | null;
  defaultValue?: BSDateValue | null;
  onChange?: (date: BSDateValue | null) => void;
  placeholder?: string;
  disabled?: boolean;
  locale?: DatePickerLocale;
  /** Show calendar popover on focus */
  withCalendar?: boolean;
  /** CalendarProps to pass to the inline calendar */
  calendarProps?: Partial<CalendarProps>;
  theme?: DatePickerTheme | ThemePreset;
  className?: string;
  style?: CSSProperties;
  /** Additional props passed to the underlying <input> */
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  >;
}
