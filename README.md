# nepali-cal

Monorepo for a modular Nepali calendar system with BS/AD conversion engine and a fully customizable React DatePicker.

---

## Packages

- `@nepali-cal/core`
  Calendar engine (Bikram Sambat ↔ Gregorian conversion, date utilities, NepaliDate class). [Read More](./packages/core/README.md)

- `@nepali-cal/datepicker`  
  React DatePicker UI built on top of core

---

## Features

### Core

- BS ↔ AD conversion
- NepaliDate class abstraction
- Date utilities (formatting, parsing, calculations)
- Zero runtime dependencies

### Datepicker

- React-based UI
- Fully customizable theme system
- Headless-friendly architecture
- Tailwind preset support
- CSS-based styling override support

---

## Installation

**pnpm** is the recommended package manager for this monorepo. To install dependencies, run:

```bash
pnpm install
```
