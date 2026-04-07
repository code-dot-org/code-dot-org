# Primitive Color Audit - Component Library

**Date:** 2026-04-07
**Goal:** Replace all primitive color usages with semantic colors from `colors.css`.
**Action needed:** For each entry below, check the corresponding component in Figma to determine the correct semantic color replacement.

---

## How to Read This Spec

- **Primitive colors** = CSS variables from `primitiveColors.css` (e.g., `--brand-teal-50`, `--neutral-gray-80`)
- **Semantic colors** = CSS variables from `colors.css` (e.g., `--background-brand-teal-primary`, `--text-neutral-disabled`)
- Each entry shows: file, line number, CSS property, current primitive value, and component/state context
- The "Suggested Semantic" column is a best guess -- **verify in Figma before applying**

---

## 1. `src/chips/chip.module.scss` (21 usages)

| Line | CSS Property       | Primitive Color        | Context (selector/state)        | Suggested Semantic (verify in Figma) |
| ---- | ------------------ | ---------------------- | ------------------------------- | ------------------------------------ |
| 24   | `background-color` | `--neutral-base-white` | `.chip` default                 | `--background-neutral-primary` ?     |
| 25   | `border`           | `--neutral-base-black` | `.chip` default                 | `--borders-neutral-primary` ?        |
| 26   | `color`            | `--neutral-base-black` | `.chip` default text            | `--text-neutral-primary` ?           |
| 47   | `border`           | `--brand-teal-50`      | `.chip` checked                 | `--borders-brand-teal-primary` ?     |
| 48   | `background-color` | `--brand-teal-50`      | `.chip` checked                 | `--background-brand-teal-primary` ?  |
| 49   | `color`            | `--neutral-base-white` | `.chip` checked text            | `--text-neutral-white-fixed` ?       |
| 54   | `background-color` | `--neutral-gray-10`    | `.chip` hover                   | ?                                    |
| 57   | `background-color` | `--brand-teal-70`      | `.chip` checked + hover         | `--background-brand-teal-strong` ?   |
| 63   | `background-color` | `--neutral-gray-10`    | `.chip` active/pressed          | ?                                    |
| 64   | `outline`          | `--brand-teal-50`      | `.chip` active/pressed          | `--borders-brand-teal-primary` ?     |
| 68   | `background-color` | `--brand-teal-70`      | `.chip` checked + active        | `--background-brand-teal-strong` ?   |
| 69   | `outline`          | `--brand-teal-50`      | `.chip` checked + active        | `--borders-brand-teal-primary` ?     |
| 76   | `outline`          | `--brand-teal-50`      | `.chip` focus-visible           | `--borders-brand-teal-primary` ?     |
| 82   | `color`            | `--neutral-gray-20`    | `.chip` disabled text           | `--text-neutral-disabled` ?          |
| 83   | `border-color`     | `--neutral-gray-20`    | `.chip` disabled border         | `--borders-neutral-disabled` ?       |
| 87   | `background-color` | `--neutral-base-white` | `.chip` disabled + hover        | `--background-neutral-primary` ?     |
| 91   | `background-color` | `--neutral-base-white` | `.chip` disabled + active       | `--background-neutral-primary` ?     |
| 97   | `background-color` | `--neutral-gray-20`    | `.chip` disabled + checked bg   | ?                                    |
| 98   | `color`            | `--neutral-base-white` | `.chip` disabled + checked text | `--text-neutral-white-fixed` ?       |
| 112  | `border-color`     | `--neutral-base-black` | `.chips-black .chip`            | `--borders-neutral-strong` ?         |
| 120  | `border-color`     | `--neutral-gray-40`    | `.chips-gray .chip`             | `--borders-neutral-primary` ?        |

---

## 2. `src/dropdown/simpleDropdown/simpleDropdown.module.scss` (20 usages)

| Line | CSS Property       | Primitive Color        | Context (selector/state)     | Suggested Semantic (verify in Figma)     |
| ---- | ------------------ | ---------------------- | ---------------------------- | ---------------------------------------- |
| 185  | `border-color`     | `--neutral-gray-40`    | disabled state               | `--borders-neutral-disabled` ?           |
| 260  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 265  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 266  | `border-color`     | `--neutral-base-white` | dark variant border          | `--borders-neutral-inverse` ?            |
| 267  | `background-color` | `--neutral-base-black` | dark variant bg              | `--background-neutral-primary-inverse` ? |
| 272  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 277  | `color`            | `--neutral-base-white` | dark variant hover text      | `--text-neutral-inverse` ?               |
| 278  | `background-color` | `--neutral-gray-90`    | dark variant hover bg        | ?                                        |
| 282  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 288  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 292  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 298  | `color`            | `--neutral-gray-90`    | dark variant disabled text   | `--text-neutral-disabled` ?              |
| 299  | `border-color`     | `--neutral-gray-90`    | dark variant disabled border | `--borders-neutral-disabled` ?           |
| 303  | `color`            | `--neutral-gray-90`    | dark variant disabled text   | `--text-neutral-disabled` ?              |
| 308  | `color`            | `--neutral-gray-70`    | dark variant placeholder     | `--text-neutral-placeholder` ?           |
| 313  | `color`            | `--neutral-base-white` | dark variant label           | `--text-neutral-inverse` ?               |
| 389  | `color`            | `--sentiment-error-50` | error text                   | `--text-error-primary`                   |
| 451  | `color`            | `--sentiment-error-50` | error text                   | `--text-error-primary`                   |
| 512  | `color`            | `--sentiment-error-50` | error text                   | `--text-error-primary`                   |
| 573  | `color`            | `--sentiment-error-50` | error text                   | `--text-error-primary`                   |

---

## 3. `src/button/genericButton.module.scss` (13 usages)

All in `.button-white` variant (secondary and tertiary):

| Line | CSS Property       | Primitive Color            | Context (selector/state)                | Suggested Semantic (verify in Figma) |
| ---- | ------------------ | -------------------------- | --------------------------------------- | ------------------------------------ |
| 212  | `border`           | `--neutral-base-white`     | `.button-white` secondary default       | ?                                    |
| 213  | `background-color` | `--neutral-base-black`     | `.button-white` secondary default       | ?                                    |
| 214  | `color`            | `--neutral-base-white`     | `.button-white` secondary default text  | ?                                    |
| 218  | `background-color` | `--neutral-gray-80`        | `.button-white` secondary hover         | ?                                    |
| 219  | `border`           | `--neutral-base-white`     | `.button-white` secondary hover         | ?                                    |
| 220  | `color`            | `--neutral-base-white`     | `.button-white` secondary hover text    | ?                                    |
| 225  | `border`           | `--neutral-base-white`     | `.button-white` secondary active        | ?                                    |
| 230  | `border-color`     | `--neutral-gray-80`        | `.button-white` secondary disabled      | ?                                    |
| 231  | `color`            | `--neutral-gray-80`        | `.button-white` secondary disabled text | ?                                    |
| 307  | `color`            | `--neutral-base-white`     | `.button-white` tertiary default text   | ?                                    |
| 311  | `background-color` | `--neutral-white-alpha-30` | `.button-white` tertiary hover          | ?                                    |
| 315  | `background-color` | `--neutral-white-alpha-30` | `.button-white` tertiary active         | ?                                    |
| 316  | `color`            | `--neutral-gray-20`        | `.button-white` tertiary active text    | ?                                    |

**Note:** The `.button-white` variant is for buttons on dark backgrounds. These may intentionally use fixed/primitive colors, but verify in Figma.

---

## 4. `src/tabs/tabs.module.scss` (13 usages)

All in `.tabs-dark` variant (both primary and secondary):

| Line | CSS Property       | Primitive Color     | Context (selector/state)           | Suggested Semantic (verify in Figma) |
| ---- | ------------------ | ------------------- | ---------------------------------- | ------------------------------------ |
| 106  | `color`            | `--neutral-gray-20` | primary dark tab text              | `--text-neutral-inverse` ?           |
| 132  | `color`            | `--neutral-gray-80` | primary dark tab disabled text     | `--text-neutral-disabled` ?          |
| 201  | `border-color`     | `--neutral-gray-80` | secondary dark underline           | `--borders-neutral-primary` ?        |
| 205  | `color`            | `--neutral-gray-20` | secondary dark tab text            | `--text-neutral-inverse` ?           |
| 206  | `background-color` | `--neutral-gray-95` | secondary dark tab bg              | ?                                    |
| 207  | `border`           | `--neutral-gray-80` | secondary dark tab border          | ?                                    |
| 211  | `background-color` | `--neutral-gray-90` | secondary dark tab hover bg        | ?                                    |
| 212  | `border`           | `--neutral-gray-80` | secondary dark tab hover border    | ?                                    |
| 233  | `border`           | `--neutral-gray-80` | secondary dark tab active border   | ?                                    |
| 240  | `border`           | `--neutral-gray-80` | secondary dark tab selected border | ?                                    |
| 246  | `color`            | `--neutral-gray-80` | secondary dark tab disabled text   | `--text-neutral-disabled` ?          |
| 247  | `background-color` | `--neutral-gray-95` | secondary dark tab disabled bg     | ?                                    |
| 248  | `border`           | `--neutral-gray-80` | secondary dark tab disabled border | ?                                    |

**Note:** The `.tabs-dark` variants are specifically for dark backgrounds. These may intentionally use primitive colors rather than theme-aware ones since they need to look correct on dark surfaces regardless of the active theme.

---

## 5. `src/dropdown/customDropdown.module.scss` (12 usages)

| Line | CSS Property       | Primitive Color        | Context (selector/state)     | Suggested Semantic (verify in Figma)     |
| ---- | ------------------ | ---------------------- | ---------------------------- | ---------------------------------------- |
| 415  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 428  | `border-color`     | `--sentiment-error-50` | error state border           | `--borders-error-primary`                |
| 433  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 434  | `border-color`     | `--neutral-base-white` | dark variant border          | ?                                        |
| 435  | `background-color` | `--neutral-base-black` | dark variant bg              | `--background-neutral-primary-inverse` ? |
| 438  | `color`            | `--neutral-base-white` | dark variant hover text      | `--text-neutral-inverse` ?               |
| 445  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 446  | `background-color` | `--neutral-gray-90`    | dark variant hover bg        | ?                                        |
| 452  | `color`            | `--neutral-base-white` | dark variant text            | `--text-neutral-inverse` ?               |
| 458  | `color`            | `--neutral-gray-90`    | dark variant disabled text   | `--text-neutral-disabled` ?              |
| 459  | `border-color`     | `--neutral-gray-90`    | dark variant disabled border | `--borders-neutral-disabled` ?           |
| 463  | `color`            | `--neutral-gray-90`    | dark variant disabled hover  | `--text-neutral-disabled` ?              |

---

## 6. `src/slider/slider.module.scss` (12 usages)

All in dark/white variant disabled states:

| Line | CSS Property       | Primitive Color     | Context (selector/state)             | Suggested Semantic (verify in Figma) |
| ---- | ------------------ | ------------------- | ------------------------------------ | ------------------------------------ |
| 9    | SCSS var           | `--neutral-gray-60` | `$slider-white-track-empty-color`    | ?                                    |
| 10   | SCSS var           | `--neutral-gray-80` | `$slider-white-track-disabled-color` | ?                                    |
| 416  | `background-color` | `--neutral-gray-80` | white slider disabled track          | ?                                    |
| 420  | `background-color` | `--neutral-gray-80` | white slider disabled track          | ?                                    |
| 424  | `background-color` | `--neutral-gray-80` | white slider disabled track          | ?                                    |
| 433  | `background-color` | `--neutral-gray-80` | white slider disabled mark           | ?                                    |
| 437  | `background-color` | `--neutral-gray-80` | white slider disabled mark           | ?                                    |
| 441  | `background-color` | `--neutral-gray-80` | white slider disabled mark           | ?                                    |
| 457  | `color`            | `--neutral-gray-80` | white slider disabled label          | `--text-neutral-disabled` ?          |
| 465  | `border-color`     | `--neutral-gray-80` | white slider disabled thumb          | ?                                    |
| 470  | `border-color`     | `--neutral-gray-80` | white slider disabled thumb          | ?                                    |
| 475  | `border-color`     | `--neutral-gray-80` | white slider disabled thumb          | ?                                    |

---

## 7. ~~`src/popover/popover.module.scss` (8 usages)~~ DONE

- `--neutral-base-white` (7x) replaced with `--background-neutral-primary`
- `--brand-purple-50` replaced with `--text-brand-purple-primary`

---

## 8. ~~`src/closeButton/closeButton.module.scss` (7 usages)~~ DONE

- `--brand-teal-50` replaced with `--borders-brand-teal-primary`
- `--neutral-gray-60` replaced with `--text-neutral-quaternary`
- `--neutral-gray-40` replaced with `--text-neutral-placeholder`

---

## 9. `src/textField/textfield.module.scss` (5 usages)

| Line | CSS Property       | Primitive Color        | Context (selector/state)     | Suggested Semantic (verify in Figma) |
| ---- | ------------------ | ---------------------- | ---------------------------- | ------------------------------------ |
| 77   | `border-color`     | `--neutral-base-white` | dark variant default border  | ?                                    |
| 86   | `border-color`     | `--neutral-base-white` | dark variant hover border    | ?                                    |
| 91   | `border-color`     | `--neutral-gray-80`    | dark variant focus border    | ?                                    |
| 97   | `border-color`     | `--neutral-gray-70`    | dark variant disabled border | ?                                    |
| 98   | `background-color` | `--neutral-gray-90`    | dark variant disabled bg     | ?                                    |

---

## 10. ~~`src/segmentedButtons/segmentedButtons.module.scss` (3 usages)~~ DONE

All 3 usages of `--brand-teal-65` replaced with `--background-brand-teal-primary`.

---

## 11. ~~`src/video/video.module.scss` (2 usages)~~ DONE

- `--neutral-base-white` replaced with `--background-neutral-primary`
- `--brand-purple-50` replaced with `--background-brand-purple-primary`

---

## 12. ~~`src/dialog/dialog.module.scss` (2 usages)~~ DONE

- `--brand-teal-50` replaced with `--background-brand-teal-primary`
- `--neutral-base-white` replaced with `--background-neutral-primary`

---

## 13. ~~`src/dialog/customDialog.module.scss` (1 usage)~~ DONE

`--neutral-black-alpha-90` replaced with semantic equivalent.

---

## Other Non-Semantic Colors: Hardcoded `rgb()`/`rgba()` in Shadows

These are all used in `box-shadow` declarations. There are no semantic shadow tokens currently, so these may be acceptable to leave as-is. Listed for completeness:

| File                                      | Line  | Value                                     | Context              |
| ----------------------------------------- | ----- | ----------------------------------------- | -------------------- |
| `src/popover/popover.module.scss`         | 70    | `rgba(0 0 0 / 0.19)`                      | popover shadow       |
| `src/dialog/dialog.module.scss`           | 12    | `rgb(0 0 0 / 0.3)`                        | dialog shadow        |
| `src/dialog/dialog.module.scss`           | 57    | `rgb(0 0 0 / 0.2)`                        | dialog header shadow |
| `src/modal/modal.module.scss`             | 14    | `rgb(0 0 0 / 0.3)`                        | modal shadow         |
| `src/actionBlock/actionBlock.module.scss` | 93    | `rgba(0 0 0 / 0.2)`                       | action block shadow  |
| `src/video/video.module.scss`             | 123   | `rgb(255 255 255 / 0.23)`                 | video button inset   |
| `src/video/video.module.scss`             | 124   | `rgb(0 0 0 / 0.07)`                       | video button inset   |
| `src/video/video.module.scss`             | 125   | `rgb(0 0 0 / 0.2)`                        | video button shadow  |
| `src/dropdown/customDropdown.module.scss` | 89-90 | `rgb(0 0 0 / 0.1)`, `rgb(0 0 0 / 0.05)`   | dropdown shadow      |
| `src/dropdown/customDropdown.module.scss` | 92-93 | `rgb(0 0 0 / 0.1)`, `rgb(0 0 0 / 0.05)`   | dropdown shadow      |
| `src/tooltip/tooltip.module.scss`         | 67-68 | `rgb(0 0 0 / 0.12)`, `rgba(0 0 0 / 0.12)` | tooltip shadow       |

---

## Summary Statistics

| Category                        | Count    | Files        |
| ------------------------------- | -------- | ------------ |
| Primitive color variable usages | 119      | 13 files     |
| Hardcoded rgb/rgba in shadows   | ~14      | 7 files      |
| **Total non-semantic usages**   | **~133** | **17 files** |
| Semantic color usages (correct) | 543      | 28 files     |

### Common Patterns

Most primitive color usages fall into these categories:

1. **Dark/white variant styling** (buttons, dropdowns, tabs, textfield, slider) - components that have explicit light/dark surface variants use primitives for the "dark" variant
2. **Brand teal for interactive states** (chips, segmentedButtons, closeButton, dialog) - focus, checked, selected states using `--brand-teal-50/65/70`
3. **Neutral base for surfaces** (popover, chips, video) - using `--neutral-base-white` for backgrounds
4. **Error states** (dropdowns) - using `--sentiment-error-50` instead of `--text-error-primary`
