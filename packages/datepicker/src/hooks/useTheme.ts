/**
 * useTheme — resolves a DatePickerTheme into inline CSS custom properties.
 *
 * Every theme token is mapped to a CSS variable that the component
 * styles reference. This means:
 *   - Zero runtime class generation
 *   - Works with any CSS-in-JS or plain CSS setup
 *   - Full SSR compatibility
 *   - Easy to inspect in DevTools
 *
 * Variable naming: --ncal-{section}-{property}
 *   e.g. --ncal-day-selected-bg, --ncal-root-radius, --ncal-header-title-color
 */

import { useMemo } from "react";
import type { CSSProperties } from "react";
import {
  DatePickerTheme,
  ThemePreset,
  THEME_PRESETS,
  DEFAULT_THEME,
  createTheme,
} from "../theme";

type CSSVars = Record<string, string>;

function v(val: string | number | undefined): string {
  return val !== undefined ? String(val) : "";
}

function resolveTheme(theme?: DatePickerTheme | ThemePreset): DatePickerTheme {
  if (!theme) return DEFAULT_THEME;
  if (typeof theme === "string") return THEME_PRESETS[theme] ?? DEFAULT_THEME;
  return createTheme(theme);
}

function themeToCSSVars(t: DatePickerTheme): CSSVars {
  const vars: CSSVars = {};
  const s = (key: string, val?: string | number) => {
    if (val !== undefined && val !== "") vars[key] = String(val);
  };

  // ── typography ──
  const ty = t.typography ?? {};
  s("--ncal-font-family", ty.fontFamily);
  s("--ncal-font-size", ty.baseFontSize);
  s("--ncal-day-font-family", ty.dayFontFamily);
  s("--ncal-title-font-family", ty.titleFontFamily);

  // ── root ──
  const r = t.root ?? {};
  s("--ncal-root-bg", r.background);
  s("--ncal-root-border", r.border);
  s("--ncal-root-radius", r.borderRadius);
  s("--ncal-root-shadow", r.shadow);
  s("--ncal-root-padding", r.padding);
  s("--ncal-root-min-width", r.minWidth);
  s("--ncal-root-max-width", r.maxWidth);
  s("--ncal-root-gap", r.gap);
  s("--ncal-grid-bg", r.gridBackground);
  s("--ncal-grid-padding", r.gridPadding);
  s("--ncal-day-gap", r.dayGap);

  // ── header ──
  const h = t.header ?? {};
  s("--ncal-header-bg", h.background);
  s("--ncal-header-padding", h.padding);
  s("--ncal-header-border", h.border);
  s("--ncal-header-title-color", h.titleColor);
  s("--ncal-header-title-size", h.titleFontSize);
  s("--ncal-header-title-weight", h.titleFontWeight);
  s("--ncal-header-title-family", h.titleFontFamily);
  s("--ncal-nav-btn-bg", h.navButtonBackground);
  s("--ncal-nav-btn-color", h.navButtonColor);
  s("--ncal-nav-btn-border", h.navButtonBorder);
  s("--ncal-nav-btn-radius", h.navButtonBorderRadius);
  s("--ncal-nav-btn-size", h.navButtonSize);
  s("--ncal-nav-btn-hover-bg", h.navButtonHoverBackground);
  s("--ncal-nav-btn-hover-color", h.navButtonHoverColor);
  s("--ncal-header-gap", h.gap);

  // ── weekdays ──
  const w = t.weekdays ?? {};
  s("--ncal-weekdays-bg", w.background);
  s("--ncal-weekdays-color", w.color);
  s("--ncal-weekdays-size", w.fontSize);
  s("--ncal-weekdays-weight", w.fontWeight);
  s("--ncal-weekdays-family", w.fontFamily);
  s("--ncal-weekdays-spacing", w.letterSpacing);
  s("--ncal-weekdays-padding", w.padding);
  s("--ncal-weekdays-weekend-color", w.weekendColor);
  s("--ncal-weekdays-transform", w.textTransform);

  // ── day base ──
  const d = t.day ?? {};
  const db = d.base ?? {};
  s("--ncal-day-bg", db.background);
  s("--ncal-day-color", db.color);
  s("--ncal-day-radius", db.borderRadius);
  s("--ncal-day-border", db.border);
  s("--ncal-day-size", db.fontSize);
  s("--ncal-day-weight", db.fontWeight);
  s("--ncal-day-family", db.fontFamily ?? ty.dayFontFamily);
  s("--ncal-day-width", db.width);
  s("--ncal-day-height", db.height);
  s("--ncal-day-opacity", db.opacity);
  s("--ncal-day-shadow", db.boxShadow);
  s("--ncal-day-dot-color", db.dotColor);
  s("--ncal-day-spacing", db.letterSpacing);
  s("--ncal-day-duration", t.animation?.dayHoverDuration);

  // ── day hover ──
  const dh = d.hover ?? {};
  s("--ncal-day-hover-bg", dh.background);
  s("--ncal-day-hover-color", dh.color);
  s("--ncal-day-hover-radius", dh.borderRadius ?? db.borderRadius);
  s("--ncal-day-hover-shadow", dh.boxShadow);

  // ── today ──
  const dt = d.today ?? {};
  s("--ncal-today-color", dt.color);
  s("--ncal-today-weight", dt.fontWeight);
  s("--ncal-today-bg", dt.background ?? "transparent");
  s("--ncal-today-radius", dt.borderRadius ?? db.borderRadius);
  s("--ncal-today-dot-color", dt.dotColor);
  s("--ncal-today-border", dt.border);

  // ── selected ──
  const ds = d.selected ?? {};
  s("--ncal-sel-bg", ds.background);
  s("--ncal-sel-color", ds.color);
  s("--ncal-sel-radius", ds.borderRadius);
  s("--ncal-sel-border", ds.border);
  s("--ncal-sel-weight", ds.fontWeight);
  s("--ncal-sel-shadow", ds.boxShadow);

  // ── selected hover ──
  const dsh = d.selectedHover ?? {};
  s("--ncal-sel-hover-bg", dsh.background);
  s("--ncal-sel-hover-color", dsh.color);

  // ── range ──
  const dr = d.inRange ?? {};
  s("--ncal-range-bg", dr.background);
  s("--ncal-range-color", dr.color);
  s("--ncal-range-radius", dr.borderRadius);

  const drs = d.rangeStart ?? {};
  s("--ncal-range-start-bg", drs.background);
  s("--ncal-range-start-color", drs.color);
  s("--ncal-range-start-radius", drs.borderRadius);

  const dre = d.rangeEnd ?? {};
  s("--ncal-range-end-bg", dre.background);
  s("--ncal-range-end-color", dre.color);
  s("--ncal-range-end-radius", dre.borderRadius);

  // ── outside month ──
  const dom = d.outsideMonth ?? {};
  s("--ncal-outside-color", dom.color);
  s("--ncal-outside-opacity", dom.opacity);

  // ── disabled ──
  const dd = d.disabled ?? {};
  s("--ncal-disabled-color", dd.color);
  s("--ncal-disabled-opacity", dd.opacity);
  s("--ncal-disabled-cursor", dd.cursor);

  // ── weekend ──
  const dw = d.weekend ?? {};
  s("--ncal-weekend-color", dw.color);

  // ── footer ──
  const f = t.footer ?? {};
  s("--ncal-footer-bg", f.background);
  s("--ncal-footer-border", f.border);
  s("--ncal-footer-padding", f.padding);
  s("--ncal-today-btn-bg", f.todayButtonBackground);
  s("--ncal-today-btn-color", f.todayButtonColor);
  s("--ncal-today-btn-border", f.todayButtonBorder);
  s("--ncal-today-btn-radius", f.todayButtonBorderRadius);
  s("--ncal-today-btn-size", f.todayButtonFontSize);
  s("--ncal-today-btn-padding", f.todayButtonPadding);
  s("--ncal-toggle-color", f.toggleColor);
  s("--ncal-toggle-size", f.toggleFontSize);

  // ── trigger ──
  const tr = t.trigger ?? {};
  s("--ncal-trigger-bg", tr.background);
  s("--ncal-trigger-border", tr.border);
  s("--ncal-trigger-radius", tr.borderRadius);
  s("--ncal-trigger-color", tr.color);
  s("--ncal-trigger-size", tr.fontSize);
  s("--ncal-trigger-family", tr.fontFamily);
  s("--ncal-trigger-padding", tr.padding);
  s("--ncal-trigger-hover-bg", tr.hoverBackground);
  s("--ncal-trigger-hover-border", tr.hoverBorderColor);
  s("--ncal-trigger-open-bg", tr.openBackground);
  s("--ncal-trigger-placeholder", tr.placeholderColor);
  s("--ncal-trigger-icon-color", tr.iconColor);
  s("--ncal-trigger-gap", tr.gap);
  s("--ncal-trigger-shadow", tr.shadow);
  s("--ncal-trigger-min-width", tr.minWidth);

  // ── input ──
  const inp = t.input ?? {};
  s("--ncal-input-bg", inp.background);
  s("--ncal-input-border", inp.border);
  s("--ncal-input-radius", inp.borderRadius);
  s("--ncal-input-color", inp.color);
  s("--ncal-input-size", inp.fontSize);
  s("--ncal-input-family", inp.fontFamily);
  s("--ncal-input-padding", inp.padding);
  s("--ncal-input-focus-border", inp.focusBorder);
  s("--ncal-input-focus-ring", inp.focusRing);
  s("--ncal-input-error-border", inp.errorBorder);
  s("--ncal-input-error-color", inp.errorColor);
  s("--ncal-input-placeholder", inp.placeholderColor);
  s("--ncal-input-width", inp.width);

  // ── animation ──
  const a = t.animation ?? {};
  s("--ncal-popover-duration", a.disabled ? "0ms" : a.popoverDuration);
  s("--ncal-popover-easing", a.popoverEasing);
  s("--ncal-month-duration", a.disabled ? "0ms" : a.monthDuration);

  return vars;
}

/** Returns { style: CSSProperties } containing all CSS vars for the theme */
export function useThemeVars(
  theme?: DatePickerTheme | ThemePreset,
): CSSProperties {
  return useMemo(() => {
    const resolved = resolveTheme(theme);
    return themeToCSSVars(resolved) as CSSProperties;
  }, [theme]);
}

/** Pure (non-hook) version — use in SSR contexts */
export function getThemeVars(
  theme?: DatePickerTheme | ThemePreset,
): CSSProperties {
  const resolved = resolveTheme(theme);
  return themeToCSSVars(resolved) as CSSProperties;
}
