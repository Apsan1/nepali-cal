# @nepali-cal/core

Core engine for Nepali (Bikram Sambat) calendar operations with full BS ↔ AD conversion, date utilities, and calendar grid generation.

Zero-dependency date computation layer used by `@nepali-cal/datepicker`.

---

## Installation

```bash
pnpm add @nepali-cal/core
```

---

## Features

- BS ↔ AD conversion engine
- Full NepaliDate class abstraction
- Date arithmetic (days, months, years)
- Range and comparison utilities
- Calendar grid generator
- Fiscal year utilities
- Validation helpers
- Raw calendar dataset access

---

## Usage

### Basic Import

```ts
import { NepaliDate } from "@nepali-cal/core";
```

### Functional API

```ts
import { bsToAD, adToBS, todayBS } from "@nepali-cal/core";
```

---

## Core Class

### NepaliDate

Primary date abstraction.

```ts
const date = new NepaliDate(2062, 5, 5);
```

---

## Conversion API

### BS → AD

```ts
import { bsToAD } from "@nepali-cal/core";

const ad = bsToAD(2062, 5, 5);
```

---

### AD → BS

```ts
import { adToBS } from "@nepali-cal/core";

const bs = adToBS(2005, 8, 21);
```

---

### Plain Conversions

- `bsToADPlain`
- `adPlainToBS`

Used for lightweight object transforms.

---

## Date Utilities

### Today

```ts
import { todayBS, todayAD } from "@nepali-cal/core";

const bsToday = todayBS();
const adToday = todayAD();
```

---

### Day of Week

```ts
import { bsDayOfWeek } from "@nepali-cal/core";

const dow = bsDayOfWeek(2062, 5, 5);
```

---

## Month & Year Utilities

### Month days

```ts
import { bsMonthDays } from "@nepali-cal/core";

bsMonthDays(2062, 5);
```

---

### Year days

```ts
import { bsYearDays } from "@nepali-cal/core";

bsYearDays(2062);
```

---

## Date Arithmetic

```ts
import { addDays, addMonths, addYears } from "@nepali-cal/core";
```

### Example

```ts
addDays({ year: 2062, month: 5, day: 5 }, 10);
```

---

## Differences

```ts
import { diffDays, diffMonths, diffYears } from "@nepali-cal/core";
```

---

## Comparison

```ts
import {
  bsDateEquals,
  bsDateBefore,
  bsDateAfter,
  bsDateBetween,
} from "@nepali-cal/core";
```

### Example

```ts
bsDateBetween(date, start, end);
```

---

## Period Utilities

```ts
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "@nepali-cal/core";
```

---

## Fiscal Year

```ts
import { fiscalYear } from "@nepali-cal/core";
```

Returns fiscal metadata for a given BS date.

---

## Validation

```ts
import { isValidBSDate, validateBSDate } from "@nepali-cal/core";
```

---

## Calendar Grid

### buildCalendarGrid

Generates UI-ready calendar cells.

```ts
import { buildCalendarGrid } from "@nepali-cal/core";

const grid = buildCalendarGrid(2062, 5, 0);
```

Used internally by `@nepali-cal/datepicker`.

---

## Types

```ts
import type {
  BSDate,
  ADDate,
  CalendarDay,
  DateRange,
  Locale,
  CalendarSystem,
} from "@nepali-cal/core";
```

---

## Errors

```ts
import { NepaliRangeError, NepaliInvalidDateError } from "@nepali-cal/core";
```

Used for runtime validation failures.

---

## Raw Calendar Data (Advanced)

```ts
import {
  BS_CALENDAR_DATA,
  BS_EPOCH,
  BS_MIN_YEAR,
  BS_MAX_YEAR,
} from "@nepali-cal/core";
```

Low-level dataset used for conversion engine.

---

## API Surface Overview

### Conversion Layer

- bsToAD
- adToBS
- bsToADPlain
- adPlainToBS

### Manipulation

- addDays / addMonths / addYears
- diffDays / diffMonths / diffYears

### Comparison

- bsDateEquals
- bsDateBefore
- bsDateAfter
- bsDateBetween

### Boundaries

- startOfMonth / endOfMonth
- startOfYear / endOfYear

### Metadata

- bsMonthDays
- bsYearDays
- bsDayOfWeek
- fiscalYear

### Utilities

- todayBS
- todayAD
- buildCalendarGrid

### Types

- BSDate / ADDate
- CalendarDay
- DateRange
- Locale / CalendarSystem

---

## Integration with @nepali-cal/datepicker

This package is the underlying engine for:

- Calendar rendering
- Date selection logic
- Range computation
- Validation
- Grid generation

---

## Notes

- Fully deterministic (no runtime dependencies)
- Safe for server + client usage
- Designed for tree-shaking (modular exports)
- Stable API surface intended for versioning

---

## License

MIT License
