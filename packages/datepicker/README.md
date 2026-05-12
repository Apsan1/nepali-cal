# @nepali-cal/datepicker

Fully customizable Nepali (Bikram Sambat) DatePicker system for React. Supports BS/AD calendar conversion, range selection, input mode, theming, and composable calendar primitives.

Built on top of `@nepali-cal/core`.

---

## Installation

```bash
pnpm add @nepali-cal/datepicker @nepali-cal/core
```

## Styles

You must import styles manually:

```ts
import "@nepali-cal/datepicker/styles";
```

---

## Features

- Bikram Sambat (BS) calendar support
- Gregorian (AD) conversion support
- Fully controlled & uncontrolled modes
- Date range selection
- Input-based date entry
- Popover-based picker
- Custom render APIs
- Theme variables support
- Week-start customization
- Min/Max date constraints
- External styling via data attributes
- No runtime dependencies except React

---

## Core Components

### 1. Calendar

Base calendar component.

```tsx
import { Calendar } from "@nepali-cal/datepicker";
```

#### Props

| Prop            | Type           | Description             |
| --------------- | -------------- | ----------------------- |
| selected        | BSDateValue    | Selected date           |
| onDayClick      | (date) => void | Day click handler       |
| minDate         | BSDateValue    | Minimum selectable date |
| maxDate         | BSDateValue    | Maximum selectable date |
| locale          | 'en' or 'ne'   | Language                |
| showFooter      | boolean        | Footer visibility       |
| showTodayButton | boolean        | Show Today button       |
| weekStartDay    | 0-6            | Start weekday           |
| theme           | object         | CSS variables           |

---

### 2. DatePicker

Popover-based single date picker.

```tsx
import { DatePicker } from "@nepali-cal/datepicker";
```

#### Basic Usage

```tsx
<DatePicker onChange={(date) => console.log(date)} />
```

#### Controlled Usage

```tsx
<DatePicker value={value} onChange={setValue} />
```

#### Props

| Prop          | Type         | Description       |
| ------------- | ------------ | ----------------- |
| value         | BSDateValue  | Controlled value  |
| defaultValue  | BSDateValue  | Initial value     |
| onChange      | fn           | Change handler    |
| placeholder   | string       | Input placeholder |
| minDate       | BSDateValue  | Min date          |
| maxDate       | BSDateValue  | Max date          |
| locale        | 'en' or 'ne' | Language          |
| displayFormat | string       | Format pattern    |
| closeOnSelect | boolean      | Auto close        |
| placement     | string       | Popover position  |
| theme         | object       | CSS variables     |
| renderTrigger | fn           | Custom trigger    |

---

### 3. DateRangePicker

Dual calendar range selection.

```tsx
import { DateRangePicker } from "@nepali-cal/datepicker";
```

#### Usage

```tsx
<DateRangePicker onChange={({ from, to }) => console.log(from, to)} />
```

#### Props

| Prop           | Type         |
| -------------- | ------------ |
| value          | { from, to } |
| onChange       | fn           |
| numberOfMonths | number       |
| placeholder    | { from, to } |
| minDate        | BSDateValue  |
| maxDate        | BSDateValue  |

---

### 4. NepaliInput

Text input with optional calendar.

```tsx
import { NepaliInput } from "@nepali-cal/datepicker";
```

#### Usage

```tsx
<NepaliInput onChange={(date) => console.log(date)} />
```

---

## Calendar Grid System

### CalendarGrid

Low-level day grid renderer.

```tsx
<CalendarGrid
  year={2081}
  month={5}
  onDayClick={...}
/>
```

Supports:

- Custom day render
- Range highlighting
- Disabled dates
- Outside month rendering
- Hover state
- Week start control

---

### CalendarHeader

Month/year navigation header.

```tsx
<CalendarHeader
  year={2081}
  month={5}
  onPrevMonth={...}
  onNextMonth={...}
/>
```

Supports:

- Custom header rendering
- Custom nav buttons
- Year navigation toggle

---

## Types

### BSDateValue

```ts
type BSDateValue = {
  year: number;
  month: number;
  day: number;
};
```

---

### DateRangeValue

```ts
type DateRangeValue = {
  from: BSDateValue | null;
  to: BSDateValue | null;
};
```

---

## Core Utilities (from @nepali-cal/core)

```ts
import {
  todayBS,
  bsToAD,
  bsMonthDays,
  buildCalendarGrid,
} from "@nepali-cal/core";
```

### todayBS()

Returns current BS date.

---

### bsToAD()

Converts BS → AD.

---

### bsMonthDays(year, month)

Returns number of days in BS month.

---

### buildCalendarGrid()

Generates calendar grid structure.

---

## Theming

Uses CSS variables injected via `theme` prop.

```tsx
<DatePicker
  theme={{
    "--ncal-primary": "#000",
    "--ncal-bg": "#fff",
  }}
/>
```

---

## Styling System

All components expose `data-ncal-*` attributes:

### Examples

```css
[data-ncal-trigger] {
  padding: 8px;
}

[data-ncal-day] {
  border-radius: 6px;
}

[data-selected] {
  background: black;
  color: white;
}
```

---

## Calendar Systems

Supports:

- `BS` (Bikram Sambat)
- `AD` (Gregorian view inside BS grid)

Toggle available in Calendar footer.

---

## Localization

```ts
locale: "en" | "ne";
```

- English labels
- Nepali (Devanagari) numerals + month names

---

## Range Selection Behavior

- First click → start date
- Second click → end date
- Reverse selection auto-corrected
- Hover preview supported

---

## Input Format

```
YYYY-MM-DD (BS format)
```

Example:

```
2062-05-05
```

---

## Accessibility

- `aria-label` on trigger
- `aria-current="date"` for today
- Keyboard navigation support on buttons
- Dialog role on popover

---

## Exports

```ts
import {
  DatePicker,
  DateRangePicker,
  Calendar,
  NepaliInput,
  CalendarGrid,
  CalendarHeader,
} from "@nepali-cal/datepicker";
```

Styles:

```ts
import "@nepali-cal/datepicker/styles";
```