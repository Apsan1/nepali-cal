/**
 * @nepali-cal/datepicker — Theme System
 *
 * Every visual property of the DatePicker is controlled through
 * a strongly-typed DatePickerTheme object. Pass it to the
 * `theme` prop, or use createTheme() to build one with type safety
 * and automatic fallback to defaults.
 *
 * The theme is split into logical sections:
 *   - root:        The popover/card container
 *   - header:      Month/year navigation bar
 *   - weekdays:    Day-of-week header row (Su Mo Tu ...)
 *   - day:         Individual day cells — all their states
 *   - footer:      Optional footer (Today button, system toggle)
 *   - trigger:     The button that opens the picker
 *   - input:       The text input variant
 *   - animation:   Transition durations and easings
 *   - typography:  Font families and sizes
 *
 * @example
 *   import { createTheme } from '@nepali-cal/datepicker'
 *
 *   const myTheme = createTheme({
 *     day: {
 *       selected: { background: '#3b82f6', color: '#fff', borderRadius: '50%' }
 *     },
 *     root: { borderRadius: '16px', shadow: '0 8px 32px rgba(0,0,0,0.12)' }
 *   })
 *
 *   <DatePicker theme={myTheme} />
 */

// ─── token primitives ────────────────────────────────────────────

export type CSSColor = string; // hex, rgb, hsl, css var, etc.
export type CSSSize = string; // px, rem, em, %
export type CSSRadius = string; // px, %, or shorthand
export type CSSShadow = string;
export type CSSFont = string;
export type CSSDuration = string; // ms or s
export type CSSEasing = string; // cubic-bezier or keyword
export type CSSBorder = string; // e.g. "1px solid #e2e8f0"

// ─── day cell state themes ───────────────────────────────────────

/**
 * Every visual property available for a single day cell state.
 * All fields are optional — unset fields fall back to the base state.
 */
export interface DayCellStyle {
  /** Cell background color */
  background?: CSSColor;
  /** Text/number color */
  color?: CSSColor;
  /** Border radius for the cell highlight shape */
  borderRadius?: CSSRadius;
  /** Full border shorthand */
  border?: CSSBorder;
  /** Font size of the day number */
  fontSize?: CSSSize;
  /** Font weight */
  fontWeight?: string | number;
  /** Font family */
  fontFamily?: CSSFont;
  /** Width of the highlight circle/square */
  width?: CSSSize;
  /** Height of the highlight circle/square */
  height?: CSSSize;
  /** Opacity */
  opacity?: number;
  /** Box shadow on the cell */
  boxShadow?: CSSShadow;
  /** Scale transform (e.g. 1.1 for slight zoom) */
  scale?: number;
  /** Custom dot indicator below the number */
  dotColor?: CSSColor;
  /** Text decoration */
  textDecoration?: string;
  /** Letter spacing */
  letterSpacing?: CSSSize;
  /** Line height */
  lineHeight?: string;
  /** Cursor style */
  cursor?: string;
}

/** All day cell states. Every state falls back to `base` if not set. */
export interface DayTheme {
  /** Default/resting state */
  base?: DayCellStyle;
  /** Hovered (not selected) */
  hover?: DayCellStyle;
  /** Today's date */
  today?: DayCellStyle;
  /** The selected date */
  selected?: DayCellStyle;
  /** Hovered while already selected */
  selectedHover?: DayCellStyle;
  /** Days in range (between from and to in range picker) */
  inRange?: DayCellStyle;
  /** The start of a range selection */
  rangeStart?: DayCellStyle;
  /** The end of a range selection */
  rangeEnd?: DayCellStyle;
  /** Days from the previous/next month shown in the grid */
  outsideMonth?: DayCellStyle;
  /** Disabled days */
  disabled?: DayCellStyle;
  /** Weekend days (Saturday in Nepal) */
  weekend?: DayCellStyle;
}

// ─── header ──────────────────────────────────────────────────────

export interface HeaderTheme {
  /** Header bar background */
  background?: CSSColor;
  /** Padding inside the header */
  padding?: CSSSize;
  /** Border bottom of the header */
  border?: CSSBorder;
  /** Month/year label text color */
  titleColor?: CSSColor;
  /** Month/year label font size */
  titleFontSize?: CSSSize;
  /** Month/year label font weight */
  titleFontWeight?: string | number;
  /** Month/year label font family */
  titleFontFamily?: CSSFont;
  /** Navigation arrow button background */
  navButtonBackground?: CSSColor;
  /** Navigation arrow button color */
  navButtonColor?: CSSColor;
  /** Navigation arrow button border */
  navButtonBorder?: CSSBorder;
  /** Navigation arrow button border radius */
  navButtonBorderRadius?: CSSRadius;
  /** Navigation arrow button size (width = height) */
  navButtonSize?: CSSSize;
  /** Navigation arrow button hover background */
  navButtonHoverBackground?: CSSColor;
  /** Navigation arrow button hover color */
  navButtonHoverColor?: CSSColor;
  /** Gap between title and nav buttons */
  gap?: CSSSize;
}

// ─── weekday header ───────────────────────────────────────────────

export interface WeekdaysTheme {
  /** Background of the weekday row */
  background?: CSSColor;
  /** Text color of day abbreviations */
  color?: CSSColor;
  /** Font size */
  fontSize?: CSSSize;
  /** Font weight */
  fontWeight?: string | number;
  /** Font family */
  fontFamily?: CSSFont;
  /** Letter spacing */
  letterSpacing?: CSSSize;
  /** Padding above/below the row */
  padding?: CSSSize;
  /** Color override for the weekend column (Saturday) */
  weekendColor?: CSSColor;
  /** Text transform */
  textTransform?: string;
}

// ─── calendar root ────────────────────────────────────────────────

export interface RootTheme {
  /** Popover card background */
  background?: CSSColor;
  /** Outer border */
  border?: CSSBorder;
  /** Border radius of the popover card */
  borderRadius?: CSSRadius;
  /** Box shadow of the popover card */
  shadow?: CSSShadow;
  /** Padding inside the popover card */
  padding?: CSSSize;
  /** Minimum width */
  minWidth?: CSSSize;
  /** Maximum width */
  maxWidth?: CSSSize;
  /** Gap between header, weekdays, and day grid */
  gap?: CSSSize;
  /** Background of the day grid section */
  gridBackground?: CSSColor;
  /** Padding around the day grid */
  gridPadding?: CSSSize;
  /** Gap between individual day cells in the grid */
  dayGap?: CSSSize;
}

// ─── footer ──────────────────────────────────────────────────────

export interface FooterTheme {
  /** Footer background */
  background?: CSSColor;
  /** Footer top border */
  border?: CSSBorder;
  /** Footer padding */
  padding?: CSSSize;
  /** "Today" button background */
  todayButtonBackground?: CSSColor;
  /** "Today" button color */
  todayButtonColor?: CSSColor;
  /** "Today" button border */
  todayButtonBorder?: CSSBorder;
  /** "Today" button border radius */
  todayButtonBorderRadius?: CSSRadius;
  /** "Today" button font size */
  todayButtonFontSize?: CSSSize;
  /** "Today" button padding */
  todayButtonPadding?: CSSSize;
  /** System toggle (BS/AD) text color */
  toggleColor?: CSSColor;
  /** System toggle font size */
  toggleFontSize?: CSSSize;
}

// ─── trigger button ───────────────────────────────────────────────

export interface TriggerTheme {
  /** Trigger button background */
  background?: CSSColor;
  /** Trigger border */
  border?: CSSBorder;
  /** Trigger border radius */
  borderRadius?: CSSRadius;
  /** Trigger text color */
  color?: CSSColor;
  /** Trigger font size */
  fontSize?: CSSSize;
  /** Trigger font family */
  fontFamily?: CSSFont;
  /** Trigger padding */
  padding?: CSSSize;
  /** Trigger hover background */
  hoverBackground?: CSSColor;
  /** Trigger hover border color */
  hoverBorderColor?: CSSColor;
  /** Trigger focus ring */
  focusRing?: CSSBorder;
  /** Trigger open state background */
  openBackground?: CSSColor;
  /** Trigger placeholder text color */
  placeholderColor?: CSSColor;
  /** Icon color */
  iconColor?: CSSColor;
  /** Gap between icon and text */
  gap?: CSSSize;
  /** Box shadow */
  shadow?: CSSShadow;
  /** Min width */
  minWidth?: CSSSize;
}

// ─── text input ───────────────────────────────────────────────────

export interface InputTheme {
  /** Input background */
  background?: CSSColor;
  /** Input border */
  border?: CSSBorder;
  /** Input border radius */
  borderRadius?: CSSRadius;
  /** Input text color */
  color?: CSSColor;
  /** Input font size */
  fontSize?: CSSSize;
  /** Input font family */
  fontFamily?: CSSFont;
  /** Input padding */
  padding?: CSSSize;
  /** Focus border */
  focusBorder?: CSSBorder;
  /** Focus ring */
  focusRing?: CSSBorder;
  /** Error border */
  errorBorder?: CSSBorder;
  /** Error text color */
  errorColor?: CSSColor;
  /** Placeholder color */
  placeholderColor?: CSSColor;
  /** Width */
  width?: CSSSize;
}

// ─── animation ───────────────────────────────────────────────────

export interface AnimationTheme {
  /** Duration of the popover open/close */
  popoverDuration?: CSSDuration;
  /** Easing for popover open */
  popoverEasing?: CSSEasing;
  /** Duration of month change transition */
  monthDuration?: CSSDuration;
  /** Duration of day hover state */
  dayHoverDuration?: CSSDuration;
  /** Whether to disable all animations */
  disabled?: boolean;
}

// ─── typography ───────────────────────────────────────────────────

export interface TypographyTheme {
  /** Base font family (applied to all text unless overridden) */
  fontFamily?: CSSFont;
  /** Day number font family */
  dayFontFamily?: CSSFont;
  /** Month/year title font family */
  titleFontFamily?: CSSFont;
  /** Base font size */
  baseFontSize?: CSSSize;
}

// ─── full theme ───────────────────────────────────────────────────

export interface DatePickerTheme {
  root?: RootTheme;
  header?: HeaderTheme;
  weekdays?: WeekdaysTheme;
  day?: DayTheme;
  footer?: FooterTheme;
  trigger?: TriggerTheme;
  input?: InputTheme;
  animation?: AnimationTheme;
  typography?: TypographyTheme;
}

// ─── preset names ────────────────────────────────────────────────

export type ThemePreset =
  | "default"
  | "minimal"
  | "rounded"
  | "sharp"
  | "dark"
  | "light"
  | "nepali"
  | "glass";

// ─── createTheme() ───────────────────────────────────────────────

/**
 * Deep-merges your partial theme over the default theme.
 * Only the fields you provide are overridden.
 *
 * @example
 *   const myTheme = createTheme({
 *     day: {
 *       selected: { background: '#6366f1', borderRadius: '50%' },
 *       today: { color: '#6366f1', fontWeight: 700 },
 *     },
 *     root: { borderRadius: '20px', shadow: '0 20px 60px rgba(0,0,0,0.15)' },
 *   })
 */
export function createTheme(overrides: DatePickerTheme = {}): DatePickerTheme {
  return deepMerge(DEFAULT_THEME, overrides);
}

/**
 * Extend an existing preset with overrides.
 *
 * @example
 *   const myTheme = extendTheme('rounded', {
 *     day: { selected: { background: '#f59e0b' } }
 *   })
 */
export function extendTheme(
  base: ThemePreset | DatePickerTheme,
  overrides: DatePickerTheme = {},
): DatePickerTheme {
  const baseTheme = typeof base === "string" ? THEME_PRESETS[base] : base;
  return deepMerge(baseTheme, overrides);
}

// ─── deep merge utility ───────────────────────────────────────────

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base } as T;
  for (const key in override) {
    const k = key as keyof T;
    const ov = override[k];
    const bv = base[k];
    if (ov !== undefined && ov !== null) {
      if (
        typeof ov === "object" &&
        !Array.isArray(ov) &&
        typeof bv === "object"
      ) {
        result[k] = deepMerge(bv as object, ov as object) as T[keyof T];
      } else {
        result[k] = ov as T[keyof T];
      }
    }
  }
  return result;
}

// ─── default theme ────────────────────────────────────────────────

export const DEFAULT_THEME: Required<DatePickerTheme> = {
  typography: {
    fontFamily: "inherit",
    dayFontFamily: "inherit",
    titleFontFamily: "inherit",
    baseFontSize: "14px",
  },
  root: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    shadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    padding: "0",
    minWidth: "280px",
    maxWidth: "320px",
    gap: "0",
    gridBackground: "transparent",
    gridPadding: "8px 12px 12px",
    dayGap: "2px",
  },
  header: {
    background: "transparent",
    padding: "12px 12px 8px",
    border: "none",
    titleColor: "#0f172a",
    titleFontSize: "14px",
    titleFontWeight: "600",
    titleFontFamily: "inherit",
    navButtonBackground: "transparent",
    navButtonColor: "#64748b",
    navButtonBorder: "1px solid #e2e8f0",
    navButtonBorderRadius: "6px",
    navButtonSize: "28px",
    navButtonHoverBackground: "#f1f5f9",
    navButtonHoverColor: "#0f172a",
    gap: "8px",
  },
  weekdays: {
    background: "transparent",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "500",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    padding: "4px 0 6px",
    weekendColor: "#94a3b8",
    textTransform: "uppercase",
  },
  day: {
    base: {
      background: "transparent",
      color: "#1e293b",
      borderRadius: "6px",
      border: "none",
      fontSize: "13px",
      fontWeight: "400",
      fontFamily: "inherit",
      width: "100%",
      height: "32px",
      opacity: 1,
      boxShadow: "none",
      scale: 1,
      dotColor: "transparent",
      textDecoration: "none",
      letterSpacing: "normal",
      lineHeight: "1",
      cursor: "pointer",
    },
    hover: {
      background: "#f1f5f9",
      color: "#0f172a",
      scale: 1,
    },
    today: {
      color: "#3b82f6",
      fontWeight: "600",
      dotColor: "#3b82f6",
    },
    selected: {
      background: "#0f172a",
      color: "#ffffff",
      borderRadius: "6px",
      fontWeight: "500",
    },
    selectedHover: {
      background: "#1e293b",
      color: "#ffffff",
    },
    inRange: {
      background: "#eff6ff",
      color: "#1d4ed8",
      borderRadius: "0",
    },
    rangeStart: {
      background: "#0f172a",
      color: "#ffffff",
      borderRadius: "6px 0 0 6px",
    },
    rangeEnd: {
      background: "#0f172a",
      color: "#ffffff",
      borderRadius: "0 6px 6px 0",
    },
    outsideMonth: {
      color: "#cbd5e1",
      opacity: 0.6,
    },
    disabled: {
      color: "#e2e8f0",
      cursor: "not-allowed",
      opacity: 0.4,
    },
    weekend: {
      color: "#94a3b8",
    },
  },
  footer: {
    background: "transparent",
    border: "1px solid #f1f5f9",
    padding: "8px 12px",
    todayButtonBackground: "transparent",
    todayButtonColor: "#64748b",
    todayButtonBorder: "1px solid #e2e8f0",
    todayButtonBorderRadius: "6px",
    todayButtonFontSize: "12px",
    todayButtonPadding: "4px 10px",
    toggleColor: "#64748b",
    toggleFontSize: "12px",
  },
  trigger: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#0f172a",
    fontSize: "14px",
    fontFamily: "inherit",
    padding: "8px 12px",
    hoverBackground: "#f8fafc",
    hoverBorderColor: "#cbd5e1",
    focusRing: "2px solid #3b82f6",
    openBackground: "#f8fafc",
    placeholderColor: "#94a3b8",
    iconColor: "#64748b",
    gap: "8px",
    shadow: "none",
    minWidth: "200px",
  },
  input: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#0f172a",
    fontSize: "14px",
    fontFamily: "inherit",
    padding: "8px 12px",
    focusBorder: "1px solid #3b82f6",
    focusRing: "0 0 0 3px rgba(59,130,246,0.15)",
    errorBorder: "1px solid #ef4444",
    errorColor: "#ef4444",
    placeholderColor: "#94a3b8",
    width: "100%",
  },
  animation: {
    popoverDuration: "150ms",
    popoverEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
    monthDuration: "180ms",
    dayHoverDuration: "80ms",
    disabled: false,
  },
};

// ─── built-in presets ─────────────────────────────────────────────

export const THEME_PRESETS: Record<ThemePreset, DatePickerTheme> = {
  default: DEFAULT_THEME,

  minimal: createTheme({
    root: {
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      shadow: "0 2px 8px rgba(0,0,0,0.06)",
      gridPadding: "6px 10px 10px",
    },
    header: {
      navButtonBorder: "none",
      navButtonBorderRadius: "4px",
      titleFontSize: "13px",
    },
    day: {
      base: { fontSize: "13px", height: "30px", borderRadius: "4px" },
      selected: { background: "#111827", borderRadius: "4px" },
      today: { color: "#2563eb", fontWeight: "600" },
      hover: { background: "#f9fafb" },
    },
    footer: { border: "none" },
  }),

  rounded: createTheme({
    root: {
      borderRadius: "20px",
      shadow: "0 8px 32px rgba(0,0,0,0.10)",
      gridPadding: "8px 14px 14px",
    },
    header: {
      navButtonBorderRadius: "50%",
      navButtonBorder: "none",
      navButtonHoverBackground: "#f0f0f0",
      padding: "14px 14px 8px",
    },
    day: {
      base: { height: "34px", borderRadius: "50%", fontSize: "13px" },
      selected: { background: "#0ea5e9", borderRadius: "50%" },
      today: { color: "#0ea5e9", fontWeight: "700", dotColor: "#0ea5e9" },
      hover: { background: "#f0f9ff" },
      inRange: { borderRadius: "0" },
      rangeStart: { borderRadius: "50% 0 0 50%", background: "#0ea5e9" },
      rangeEnd: { borderRadius: "0 50% 50% 0", background: "#0ea5e9" },
    },
    footer: { border: "none", padding: "10px 14px" },
  }),

  sharp: createTheme({
    root: {
      borderRadius: "0",
      border: "2px solid #000000",
      shadow: "4px 4px 0 #000000",
    },
    header: {
      border: "0 0 2px 0 solid #000000",
      navButtonBorder: "2px solid #000000",
      navButtonBorderRadius: "0",
      titleFontWeight: "800",
      titleFontSize: "13px",
    },
    day: {
      base: {
        borderRadius: "0",
        fontSize: "13px",
        height: "32px",
        fontWeight: "500",
      },
      selected: { background: "#000000", borderRadius: "0" },
      today: {
        fontWeight: "800",
        color: "#000",
        border: "2px solid #000000",
        borderRadius: "0",
      },
      hover: { background: "#f5f5f5" },
      inRange: { background: "#e5e5e5", borderRadius: "0" },
      rangeStart: { borderRadius: "0", background: "#000" },
      rangeEnd: { borderRadius: "0", background: "#000" },
    },
    footer: { border: "2px 0 0 0 solid #000000" },
    trigger: {
      borderRadius: "0",
      border: "2px solid #000000",
      shadow: "2px 2px 0 #000000",
    },
  }),

  dark: createTheme({
    root: {
      background: "#1a1a2e",
      border: "1px solid #2d2d44",
      borderRadius: "14px",
      shadow: "0 8px 40px rgba(0,0,0,0.5)",
    },
    header: {
      titleColor: "#e2e8f0",
      navButtonColor: "#94a3b8",
      navButtonBorder: "1px solid #2d2d44",
      navButtonHoverBackground: "#2d2d44",
      navButtonHoverColor: "#e2e8f0",
    },
    weekdays: { color: "#475569" },
    day: {
      base: {
        color: "#e2e8f0",
        fontSize: "13px",
        height: "32px",
        borderRadius: "6px",
      },
      hover: { background: "#2d2d44", color: "#f1f5f9" },
      today: { color: "#818cf8", fontWeight: "600", dotColor: "#818cf8" },
      selected: {
        background: "#4f46e5",
        color: "#ffffff",
        borderRadius: "6px",
      },
      selectedHover: { background: "#4338ca" },
      outsideMonth: { color: "#334155", opacity: 0.5 },
      disabled: { color: "#334155", opacity: 0.3 },
      inRange: {
        background: "rgba(79,70,229,0.2)",
        color: "#a5b4fc",
        borderRadius: "0",
      },
      rangeStart: { background: "#4f46e5", borderRadius: "6px 0 0 6px" },
      rangeEnd: { background: "#4f46e5", borderRadius: "0 6px 6px 0" },
      weekend: { color: "#64748b" },
    },
    footer: {
      background: "transparent",
      border: "1px solid #2d2d44",
      todayButtonColor: "#94a3b8",
      todayButtonBorder: "1px solid #2d2d44",
      toggleColor: "#64748b",
    },
    trigger: {
      background: "#1a1a2e",
      border: "1px solid #2d2d44",
      borderRadius: "8px",
      color: "#e2e8f0",
      hoverBackground: "#2d2d44",
      hoverBorderColor: "#3d3d54",
      placeholderColor: "#475569",
      iconColor: "#64748b",
    },
  }),

  light: createTheme({
    root: {
      background: "#fafafa",
      border: "1px solid #ebebeb",
      borderRadius: "12px",
      shadow: "0 4px 20px rgba(0,0,0,0.06)",
    },
    day: {
      selected: { background: "#18181b", borderRadius: "6px" },
      today: { color: "#18181b", fontWeight: "700", dotColor: "#18181b" },
      hover: { background: "#f4f4f5" },
    },
  }),

  nepali: createTheme({
    root: {
      background: "#fffbf5",
      border: "1px solid #e8d5b0",
      borderRadius: "12px",
      shadow: "0 4px 24px rgba(180,100,30,0.10)",
    },
    header: {
      titleColor: "#7c3d12",
      titleFontWeight: "700",
      navButtonColor: "#92400e",
      navButtonBorder: "1px solid #e8d5b0",
      navButtonHoverBackground: "#fef3c7",
      navButtonHoverColor: "#7c3d12",
    },
    weekdays: {
      color: "#b45309",
      fontWeight: "600",
    },
    day: {
      base: {
        color: "#451a03",
        fontSize: "13px",
        height: "32px",
        borderRadius: "6px",
      },
      hover: { background: "#fef3c7", color: "#7c3d12" },
      today: { color: "#b45309", fontWeight: "700", dotColor: "#d97706" },
      selected: {
        background: "#b45309",
        color: "#ffffff",
        borderRadius: "6px",
      },
      selectedHover: { background: "#92400e" },
      outsideMonth: { color: "#d6b896", opacity: 0.6 },
      weekend: { color: "#d97706" },
      inRange: { background: "#fef3c7", color: "#92400e", borderRadius: "0" },
      rangeStart: { background: "#b45309", borderRadius: "6px 0 0 6px" },
      rangeEnd: { background: "#b45309", borderRadius: "0 6px 6px 0" },
    },
    footer: {
      border: "1px solid #e8d5b0",
      todayButtonColor: "#92400e",
      todayButtonBorder: "1px solid #e8d5b0",
      toggleColor: "#b45309",
    },
    trigger: {
      background: "#fffbf5",
      border: "1px solid #e8d5b0",
      color: "#7c3d12",
      borderRadius: "8px",
      placeholderColor: "#d6b896",
      iconColor: "#b45309",
    },
  }),

  glass: createTheme({
    root: {
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(255,255,255,0.5)",
      borderRadius: "16px",
      shadow:
        "0 8px 32px rgba(31,38,135,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
    },
    header: {
      navButtonBackground: "rgba(255,255,255,0.5)",
      navButtonBorder: "1px solid rgba(255,255,255,0.5)",
      navButtonBorderRadius: "8px",
    },
    day: {
      base: { borderRadius: "8px", height: "32px", fontSize: "13px" },
      hover: { background: "rgba(255,255,255,0.6)" },
      selected: {
        background: "rgba(99,102,241,0.85)",
        color: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
      },
      today: { color: "#6366f1", fontWeight: "600", dotColor: "#6366f1" },
      inRange: {
        background: "rgba(99,102,241,0.12)",
        borderRadius: "0",
        color: "#4338ca",
      },
      rangeStart: {
        background: "rgba(99,102,241,0.85)",
        borderRadius: "8px 0 0 8px",
      },
      rangeEnd: {
        background: "rgba(99,102,241,0.85)",
        borderRadius: "0 8px 8px 0",
      },
    },
    trigger: {
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(255,255,255,0.5)",
      borderRadius: "10px",
      shadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
  }),
};
