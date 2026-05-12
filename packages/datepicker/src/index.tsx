'use client'

/**
 * @nepali-cal/datepicker — React Components
 *
 * CalendarGrid   — the raw 7×N grid of day cells
 * CalendarHeader — month/year title + nav arrows
 * Calendar       — CalendarHeader + CalendarGrid + optional footer
 * DatePicker     — Calendar in a popover, triggered by a button
 * DateRangePicker— Dual-calendar range selection
 * NepaliInput    — Text input with optional inline calendar
 */

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
    type ReactNode,
    type CSSProperties,
    type KeyboardEvent,
} from 'react'
import type {
    BSDateValue,
    CalendarGridProps,
    CalendarHeaderProps,
    CalendarProps,
    DatePickerProps,
    DateRangePickerProps,
    DateRangeValue,
    NepaliInputProps,
    DayRenderMeta,
    PopoverPlacement,
} from './components';
import { useThemeVars } from './hooks/useTheme'
import {
    useCalendar,
    buildCalendarGrid,
    bsToAD,
    adToBS,
    bsMonthDays,
    todayBS,
    resolveDisabled,
} from './hooks/useCalendar'

// ─── locale data ──────────────────────────────────────────────────

const MONTHS_EN = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan',
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
    'Poush', 'Magh', 'Falgun', 'Chaitra',
]
const MONTHS_NE = [
    'बैशाख', 'जेठ', 'असार', 'श्रावण',
    'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर',
    'पुष', 'माघ', 'फाल्गुन', 'चैत्र',
]
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const DAYS_NE = ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श']
const DAYS_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toDevanagari(n: number | string): string {
    return String(n).replace(/[0-9]/g, d => '०१२३४५६७८९'[+d])
}

function formatDate(
    date: BSDateValue | null,
    fmt: string,
    locale: 'en' | 'ne' = 'en'
): string {
    if (!date) return ''
    const { year, month, day } = date
    const dow = bsToAD(year, month, day).getUTCDay()
    const monthNames = locale === 'ne' ? MONTHS_NE : MONTHS_EN
    const n = (v: number, pad = 0) =>
        locale === 'ne'
            ? toDevanagari(pad ? String(v).padStart(pad, '0') : v)
            : pad ? String(v).padStart(pad, '0') : String(v)

    return fmt
        .replace('YYYY', n(year))
        .replace('YY', n(year % 100, 2))
        .replace('MMMM', monthNames[month - 1])
        .replace('MMM', monthNames[month - 1].slice(0, 3))
        .replace('MM', n(month, 2))
        .replace('M', n(month))
        .replace('dddd', DAYS_FULL_EN[dow])
        .replace('ddd', DAYS_EN[dow])
        .replace('DD', n(day, 2))
        .replace('D', n(day))
}

function parseInputToBS(str: string): BSDateValue | null {
    const s = str.trim().replace(/[/\.]/g, '-')
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (!m) return null
    const [, y, mo, d] = m.map(Number)
    if (mo < 1 || mo > 12) return null
    if (d < 1 || d > bsMonthDays(y, mo)) return null
    return { year: y, month: mo, day: d }
}

function bsEqual(a: BSDateValue | null | undefined, b: BSDateValue | null | undefined): boolean {
    if (!a || !b) return false
    return a.year === b.year && a.month === b.month && a.day === b.day
}

function bsBefore(a: BSDateValue, b: BSDateValue): boolean {
    if (a.year !== b.year) return a.year < b.year
    if (a.month !== b.month) return a.month < b.month
    return a.day < b.day
}

function bsBetween(d: BSDateValue, from: BSDateValue, to: BSDateValue): boolean {
    const [start, end] = bsBefore(from, to) ? [from, to] : [to, from]
    return !bsBefore(d, start) && !bsBefore(end, d)
}

// ─── CalendarHeader ───────────────────────────────────────────────

export function CalendarHeader({
    year, month,
    onPrevMonth, onNextMonth, onPrevYear, onNextYear,
    renderHeader, renderNavButton,
    showYearNav = false,
    locale = 'en',
}: CalendarHeaderProps) {
    const monthNames = locale === 'ne' ? MONTHS_NE : MONTHS_EN
    const monthName = monthNames[month - 1]
    const yearLabel = locale === 'ne' ? toDevanagari(year) : String(year)

    if (renderHeader) {
        return <>{renderHeader({ year, month, monthName, onPrevMonth, onNextMonth })}</>
    }

    const NavBtn = ({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) =>
        renderNavButton ? (
            <>{renderNavButton(dir, onClick)}</>
        ) : (
            <button data-ncal-nav-btn onClick={onClick} aria-label={dir === 'prev' ? 'Previous' : 'Next'}>
                {dir === 'prev' ? '‹' : '›'}
            </button>
        )

    return (
        <div data-ncal-header>
            <div data-ncal-nav>
                {showYearNav && onPrevYear && <NavBtn dir="prev" onClick={onPrevYear} />}
                <NavBtn dir="prev" onClick={onPrevMonth} />
            </div>
            <div data-ncal-header-title>
                {monthName} {yearLabel}
            </div>
            <div data-ncal-nav>
                <NavBtn dir="next" onClick={onNextMonth} />
                {showYearNav && onNextYear && <NavBtn dir="next" onClick={onNextYear} />}
            </div>
        </div>
    )
}

// ─── CalendarGrid ─────────────────────────────────────────────────

export function CalendarGrid({
    year, month,
    selected,
    onDayClick, onDayHover,
    renderDay, renderDayContent,
    disabled: disabledProp,
    minDate, maxDate,
    rangeFrom, rangeTo, rangeHovered,
    showOutsideDays = true,
    locale = 'en',
    calendarSystem = 'BS',
    weekStartDay = 0,
    showWeekdays = true,
    className, style,
}: CalendarGridProps) {
    const startDay = weekStartDay ?? 0
    const cells = useMemo(
        () => buildCalendarGrid(year ?? new Date().getFullYear(), month ?? new Date().getMonth() + 1, startDay),
        [year, month, startDay]
    )

    const dayNames = locale === 'ne' ? DAYS_NE : DAYS_EN
    const orderedDayNames = Array.from({ length: 7 }, (_, i) => dayNames[(i + weekStartDay) % 7])

    function isDisabled(date: BSDateValue): boolean {
        if (minDate && bsBefore(date, minDate)) return true
        if (maxDate && bsBefore(maxDate, date)) return true
        return resolveDisabled(date, disabledProp)
    }

    function isInRange(date: BSDateValue): boolean {
        const effectiveTo = !rangeTo && rangeHovered ? rangeHovered : rangeTo
        if (!rangeFrom || !effectiveTo) return false
        return bsBetween(date, rangeFrom, effectiveTo)
    }

    function isRangeStart(date: BSDateValue): boolean {
        const effectiveTo = !rangeTo && rangeHovered ? rangeHovered : rangeTo
        if (!rangeFrom) return false
        if (!effectiveTo) return bsEqual(date, rangeFrom)
        return bsEqual(date, bsBefore(rangeFrom, effectiveTo) ? rangeFrom : effectiveTo)
    }

    function isRangeEnd(date: BSDateValue): boolean {
        const effectiveTo = !rangeTo && rangeHovered ? rangeHovered : rangeTo
        if (!rangeFrom || !effectiveTo) return false
        return bsEqual(date, bsBefore(rangeFrom, effectiveTo) ? effectiveTo : rangeFrom)
    }

    function getDayLabel(cell: ReturnType<typeof buildCalendarGrid>[0]): string | number {
        if (calendarSystem === 'AD') return cell.adDate.day
        return locale === 'ne' ? toDevanagari(cell.bsDate.day) : cell.bsDate.day
    }

    return (
        <div className={className} style={style}>
            {showWeekdays && (
                <div data-ncal-weekdays>
                    {orderedDayNames.map((name, i) => {
                        const dow = (i + weekStartDay) % 7
                        return (
                            <div
                                key={i}
                                data-ncal-weekday
                                {...(dow === 6 ? { 'data-weekend': '' } : {})}
                            >
                                {name}
                            </div>
                        )
                    })}
                </div>
            )}
            <div data-ncal-grid>
                {cells.map((cell, i) => {
                    const disabled = isDisabled(cell.bsDate)
                    const selFlag = bsEqual(cell.bsDate, selected)
                    const inRange = isInRange(cell.bsDate)
                    const rStart = isRangeStart(cell.bsDate)
                    const rEnd = isRangeEnd(cell.bsDate)

                    const meta: DayRenderMeta = {
                        bsDate: cell.bsDate,
                        adDate: cell.adDate,
                        dayOfWeek: cell.dayOfWeek,
                        isToday: cell.isToday,
                        isSelected: selFlag,
                        isDisabled: disabled,
                        isWeekend: cell.isWeekend,
                        isOutsideMonth: !cell.isCurrentMonth,
                        isInRange: inRange,
                        isRangeStart: rStart,
                        isRangeEnd: rEnd,
                    }

                    if (!showOutsideDays && !cell.isCurrentMonth) {
                        return (
                            <div
                                key={i}
                                data-ncal-day
                                data-outside=""
                                data-hide-outside=""
                                aria-hidden
                            />
                        )
                    }

                    if (renderDay) {
                        const custom = renderDay(cell.bsDate, meta)
                        if (custom !== null) {
                            return (
                                <div
                                    key={i}
                                    onClick={disabled ? undefined : (e) => onDayClick?.(cell.bsDate, e)}
                                    onMouseEnter={(e) => onDayHover?.(cell.bsDate, e)}
                                    onMouseLeave={() => onDayHover?.(null)}
                                >
                                    {custom}
                                </div>
                            )
                        }
                    }

                    return (
                        <button
                            key={i}
                            data-ncal-day
                            {...(cell.isToday ? { 'data-today': '' } : {})}
                            {...(selFlag ? { 'data-selected': '' } : {})}
                            {...(disabled ? { 'data-disabled': '' } : {})}
                            {...(!cell.isCurrentMonth ? { 'data-outside': '' } : {})}
                            {...(cell.isWeekend ? { 'data-weekend': '' } : {})}
                            {...(inRange ? { 'data-in-range': '' } : {})}
                            {...(rStart ? { 'data-range-start': '' } : {})}
                            {...(rEnd ? { 'data-range-end': '' } : {})}
                            disabled={disabled}
                            onClick={(e) => onDayClick?.(cell.bsDate, e)}
                            onMouseEnter={(e) => onDayHover?.(cell.bsDate, e)}
                            onMouseLeave={() => onDayHover?.(null)}
                            aria-label={formatDate(cell.bsDate, 'DD MMMM YYYY', locale)}
                            aria-current={cell.isToday ? 'date' : undefined}
                            tabIndex={disabled ? -1 : 0}
                        >
                            {renderDayContent
                                ? renderDayContent(cell.bsDate, meta)
                                : getDayLabel(cell)
                            }
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Calendar ─────────────────────────────────────────────────────

export function Calendar({
    defaultMonth,
    month: controlledMonth,
    year: controlledYear,
    onMonthChange,
    showHeader = true,
    showYearNav = false,
    showFooter = false,
    showSystemToggle = false,
    showTodayButton = true,
    renderFooter,
    renderHeader,
    renderNavButton,
    theme,
    className,
    style,
    locale = 'en',
    calendarSystem: initialSystem = 'BS',
    ...gridProps
}: CalendarProps) {
    const themeVars = useThemeVars(theme)
    const [system, setSystem] = useState<'BS' | 'AD'>(initialSystem)

    const { year, month, prevMonth, nextMonth, prevYear, nextYear, goToToday } = useCalendar({
        initialYear: defaultMonth?.year ?? gridProps.selected?.year,
        initialMonth: defaultMonth?.month ?? gridProps.selected?.month,
        controlledYear,
        controlledMonth,
        weekStartDay: gridProps.weekStartDay,
        onMonthChange,
    })

    return (
        <div
            data-ncal-calendar
            data-ncal
            style={{ ...themeVars, ...style }}
            className={className}
            data-ncal-root
        >
            {showHeader && (
                <CalendarHeader
                    year={year}
                    month={month}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    onPrevYear={prevYear}
                    onNextYear={nextYear}
                    renderHeader={renderHeader}
                    renderNavButton={renderNavButton}
                    showYearNav={showYearNav}
                    locale={locale}
                />
            )}

            <CalendarGrid
                year={year}
                month={month}
                locale={locale}
                calendarSystem={system}
                {...gridProps}
            />

            {(showFooter || showTodayButton || showSystemToggle || renderFooter) && (
                <div data-ncal-footer>
                    {renderFooter ? (
                        renderFooter({ goToToday })
                    ) : (
                        <>
                            {showSystemToggle && (
                                <button
                                    data-ncal-system-toggle
                                    onClick={() => setSystem(s => s === 'BS' ? 'AD' : 'BS')}
                                >
                                    {system === 'BS' ? 'Show AD' : 'Show BS'}
                                </button>
                            )}
                            {showTodayButton && (
                                <button data-ncal-today-btn onClick={goToToday}>
                                    Today
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Popover ──────────────────────────────────────────────────────

function usePopover(
    controlled?: boolean,
    onOpenChange?: (open: boolean) => void
) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlled !== undefined ? controlled : internalOpen
    const containerRef = useRef<HTMLDivElement>(null)

    const open = useCallback(() => { setInternalOpen(true); onOpenChange?.(true) }, [onOpenChange])
    const close = useCallback(() => { setInternalOpen(false); onOpenChange?.(false) }, [onOpenChange])
    const toggle = useCallback(() => isOpen ? close() : open(), [isOpen, open, close])

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) close()
        }
        const keyHandler = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') close()
        }
        document.addEventListener('mousedown', handler)
        document.addEventListener('keydown', keyHandler)
        return () => {
            document.removeEventListener('mousedown', handler)
            document.removeEventListener('keydown', keyHandler)
        }
    }, [isOpen, close])

    return { isOpen, open, close, toggle, containerRef }
}

// ─── DatePicker ───────────────────────────────────────────────────

export function DatePicker({
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = 'Select date',
    disabled = false,
    renderTrigger,
    displayFormat = 'DD MMMM YYYY',
    defaultMonth,
    minDate, maxDate,
    showOutsideDays = true,
    locale = 'en',
    calendarSystem,
    weekStartDay = 0,
    renderDay,
    renderDayContent,
    placement = 'bottom-start',
    closeOnSelect = true,
    open: controlledOpen,
    onOpenChange,
    theme,
    className,
    style,
    id,
    'aria-label': ariaLabel,
}: DatePickerProps) {
    const themeVars = useThemeVars(theme)
    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState<BSDateValue | null>(defaultValue ?? null)
    const value = isControlled ? controlledValue : internalValue

    const { isOpen, toggle, close, containerRef } = usePopover(controlledOpen, onOpenChange)

    const handleDayClick = useCallback((date: BSDateValue) => {
        if (!isControlled) setInternalValue(date)
        onChange?.(date)
        if (closeOnSelect) close()
    }, [isControlled, onChange, close, closeOnSelect])

    const displayValue = formatDate(value ?? null, displayFormat, locale)

    const triggerProps = {
        value: value ?? null,
        displayValue,
        isOpen,
        onClick: toggle,
        disabled,
    }

    return (
        <div
            ref={containerRef}
            style={style ? { ...style, ...themeVars } : themeVars}
            className={className}
            data-ncal
            data-ncal-datepicker
        >
            {renderTrigger ? (
                renderTrigger(triggerProps)
            ) : (
                <button
                    id={id}
                    type="button"
                    data-ncal-trigger
                    {...(isOpen ? { "data-open": "" } : {})}
                    {...(disabled ? { "data-disabled": "" } : {})}
                    disabled={disabled}
                    onClick={toggle}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-label={ariaLabel ?? (value ? displayValue : placeholder)}
                    aria-controls={isOpen ? `${id}-popover` : undefined}
                    aria-describedby={isOpen ? `${id}-description` : undefined}
                >
                    <span data-ncal-trigger-icon>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </span>

                    {value ? (
                        <span data-ncal-trigger-value>{displayValue}</span>
                    ) : (
                        <span data-ncal-trigger-placeholder>{placeholder}</span>
                    )}
                </button>
            )}

            {isOpen && (
                <div
                    data-ncal-popover
                    data-placement={placement}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Date picker"
                >
                    <Calendar
                        selected={value ?? undefined}
                        onDayClick={handleDayClick}
                        defaultMonth={defaultMonth ?? (value ? { year: value.year, month: value.month } : undefined)}
                        minDate={minDate}
                        maxDate={maxDate}
                        showOutsideDays={showOutsideDays}
                        locale={locale}
                        calendarSystem={calendarSystem}
                        weekStartDay={weekStartDay}
                        renderDay={renderDay}
                        renderDayContent={renderDayContent}
                        showFooter
                        showTodayButton
                        theme={theme}
                        /* pass through optional controlled year/month as undefined to satisfy props */
                        year={undefined}
                        month={undefined}
                    />
                </div>
            )}
        </div>
    )
}

// ─── DateRangePicker ──────────────────────────────────────────────

export function DateRangePicker({
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = { from: 'Start date', to: 'End date' },
    disabled = false,
    locale = 'en',
    calendarSystem,
    minDate, maxDate,
    weekStartDay = 0,
    showOutsideDays = true,
    displayFormat = 'DD MMM YYYY',
    numberOfMonths = 2,
    placement = 'bottom-start',
    open: controlledOpen,
    onOpenChange,
    closeOnSelect = true,
    renderDay, renderDayContent,
    theme,
    className, style,
}: DateRangePickerProps) {
    const themeVars = useThemeVars(theme)
    const isControlled = controlledValue !== undefined
    const [internalFrom, setInternalFrom] = useState<BSDateValue | null>(defaultValue?.from ?? null)
    const [internalTo, setInternalTo] = useState<BSDateValue | null>(defaultValue?.to ?? null)

    const from = isControlled ? controlledValue.from : internalFrom
    const to = isControlled ? controlledValue.to : internalTo

    const [hovered, setHovered] = useState<BSDateValue | null>(null)
    const [selecting, setSelecting] = useState(false)

    const { isOpen, toggle, close, containerRef } = usePopover(controlledOpen, onOpenChange)

    const handleDayClick = useCallback((date: BSDateValue) => {
        if (!from || (from && to)) {
            const newFrom = date
            if (!isControlled) { setInternalFrom(newFrom); setInternalTo(null) }
            setSelecting(true)
            setHovered(null)
            onChange?.({ from: newFrom, to: null })
        } else {
            const [newFrom, newTo] = bsBefore(date, from) ? [date, from] : [from, date]
            if (!isControlled) { setInternalFrom(newFrom); setInternalTo(newTo) }
            setSelecting(false)
            setHovered(null)
            onChange?.({ from: newFrom, to: newTo })
            if (closeOnSelect) close()
        }
    }, [from, to, isControlled, onChange, close, closeOnSelect])

    const today = useMemo(() => todayBS(), [])

    const calendarMonths = useMemo(() => {
        const base = from ?? today
        return Array.from({ length: numberOfMonths }, (_, i) => {
            let m = base.month + i
            let y = base.year
            while (m > 12) { m -= 12; y++ }
            return { year: y, month: m }
        })
    }, [from, today, numberOfMonths])

    const fromLabel = from ? formatDate(from, displayFormat, locale) : placeholder.from
    const toLabel = to ? formatDate(to, displayFormat, locale) : placeholder.to

    return (
        <div
            ref={containerRef}
            style={style ? { ...style, ...themeVars } : themeVars}
            className={className}
            data-ncal
            data-ncal-range-picker
        >
            {/* Trigger */}
            <button
                data-ncal-trigger
                {...(isOpen ? { 'data-open': '' } : {})}
                {...(disabled ? { 'data-disabled': '' } : {})}
                disabled={disabled}
                onClick={toggle}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <span data-ncal-trigger-icon>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </span>
                {from
                    ? <span data-ncal-trigger-value>{fromLabel}</span>
                    : <span data-ncal-trigger-placeholder>{fromLabel}</span>
                }
                <span data-ncal-trigger-arrow>→</span>
                {to
                    ? <span data-ncal-trigger-value>{toLabel}</span>
                    : <span data-ncal-trigger-placeholder>{toLabel}</span>
                }
            </button>

            {isOpen && (
                <div data-ncal-popover data-placement={placement} role="dialog" aria-modal="true">
                    <div data-ncal-range-wrapper>
                        <div
                            data-ncal-range-calendars
                            data-layout={numberOfMonths === 1 ? 'column' : 'row'}
                        >
                            {calendarMonths.map(({ year, month }, i) => (
                                <Calendar
                                    key={i}
                                    defaultMonth={{ year, month }}
                                    selected={undefined}
                                    onDayClick={handleDayClick}
                                    onDayHover={(d) => selecting && setHovered(d ?? null)}
                                    rangeFrom={from ?? undefined}
                                    rangeTo={to ?? undefined}
                                    rangeHovered={hovered ?? undefined}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    showOutsideDays={showOutsideDays}
                                    locale={locale}
                                    calendarSystem={calendarSystem}
                                    weekStartDay={weekStartDay}
                                    renderDay={renderDay}
                                    renderDayContent={renderDayContent}
                                    showFooter={false}
                                    theme={theme}
                                />
                            ))}
                        </div>
                        <div data-ncal-range-footer>
                            <button
                                data-ncal-range-clear
                                onClick={() => {
                                    if (!isControlled) { setInternalFrom(null); setInternalTo(null) }
                                    setSelecting(false); setHovered(null)
                                    onChange?.({ from: null, to: null })
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── NepaliInput ──────────────────────────────────────────────────

export function NepaliInput({
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = 'YYYY-MM-DD',
    disabled = false,
    locale = 'en',
    withCalendar = true,
    calendarProps = {},
    theme,
    className, style,
    inputProps = {},
}: NepaliInputProps) {
    const themeVars = useThemeVars(theme)
    const isControlled = controlledValue !== undefined
    const [raw, setRaw] = useState(
        controlledValue
            ? `${controlledValue.year}-${String(controlledValue.month).padStart(2, '0')}-${String(controlledValue.day).padStart(2, '0')}`
            : ''
    )
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (controlledValue) {
            const s = `${controlledValue.year}-${String(controlledValue.month).padStart(2, '0')}-${String(controlledValue.day).padStart(2, '0')}`
            setRaw(s)
        }
    }, [controlledValue])

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setRaw(val)
        setError(null)
        const parsed = parseInputToBS(val)
        if (parsed) {
            if (!isControlled) { }
            onChange?.(parsed)
        }
    }

    const handleBlur = () => {
        const parsed = parseInputToBS(raw)
        if (parsed) {
            const s = `${parsed.year}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`
            setRaw(s)
            setError(null)
        } else if (raw.length > 0) {
            setError('Invalid BS date (YYYY-MM-DD)')
        }
        setTimeout(() => setIsOpen(false), 150)
    }

    const handleDayClick = (date: BSDateValue) => {
        const s = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
        setRaw(s)
        setError(null)
        if (!isControlled) { }
        onChange?.(date)
        setIsOpen(false)
    }

    return (
        <div
            ref={containerRef}
            data-ncal-input-wrapper
            data-ncal
            style={style ? { ...style, ...themeVars } : themeVars}
            className={className}
        >
            <input
                {...inputProps}
                data-ncal-input
                {...(error ? { 'data-error': '' } : {})}
                type="text"
                value={raw}
                onChange={handleChange}
                onFocus={() => withCalendar && setIsOpen(true)}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={10}
                aria-invalid={!!error}
                aria-describedby={error ? 'ncal-input-err' : undefined}
            />
            {error && (
                <span data-ncal-input-error-msg id="ncal-input-err" role="alert">
                    {error}
                </span>
            )}
            {withCalendar && isOpen && (
                <div data-ncal-popover data-placement="bottom-start">
                    <Calendar
                        selected={controlledValue ?? parseInputToBS(raw) ?? undefined}
                        onDayClick={handleDayClick}
                        locale={locale}
                        showFooter
                        showTodayButton
                        theme={theme}
                        {...calendarProps}
                    />
                </div>
            )}
        </div>
    )
}