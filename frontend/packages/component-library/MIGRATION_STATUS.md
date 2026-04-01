# DSCO to MUI Migration Status

This document tracks the migration progress of DSCO (Design System Code.org) components to MUI (Material UI) equivalents.

## Migration States

| State           | Description                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Migrated**    | MUI equivalent exists with style overrides in `src/themes/code.org/styleOverrides/`. DSCO component is deprecated. Use MUI directly. |
| **In Progress** | MUI style overrides exist, but consumer migration is not yet complete. DSCO component is still active.                               |
| **MUI-native**  | Component already built on MUI primitives. No separate DSCO implementation to migrate.                                               |
| **Not Started** | No MUI equivalent yet. Continue using the DSCO component.                                                                            |
| **N/A**         | No direct MUI equivalent exists or component is utility/infrastructure.                                                              |

## Component Migration Status

| DSCO Component        | Status         | MUI Equivalent         | Style Overrides                         | Notes                                                                                                                                                        |
| --------------------- | -------------- | ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `typography`          | **Migrated**   | `Typography`           | `styleOverrides/typography.ts`          | Deprecated. Use `Typography` from `@mui/material`.                                                                                                           |
| `button`              | **Migrated**   | `Button`               | `styleOverrides/button.tsx`             | Deprecated. All `/apps` consumers migrated. Use `Button` from `@mui/material`. Codemod: `yarn codemod:buttons`. See `src/button/BUTTON_MIGRATION_TO_MUI.md`. |
| `link`                | Not Started    | `Link`                 | `styleOverrides/link.ts` (partial)      | Basic overrides exist (variant + font weight) but not complete. Migration not started.                                                                       |
| `breadcrumbs`         | **Migrated**   | `Breadcrumbs`          | `styleOverrides/breadcrumbs.ts`         | Deprecated. Use `Breadcrumbs` from `@mui/material`. Custom size prop augmented (`xs`, `s`, `m`, `l`).                                                        |
| `closeButton`         | Not Started    | `IconButton`           | —                                       | MUI `IconButton` with `xmark` icon can be used. Migration not started.                                                                                       |
| `notification-banner` | **MUI-native** | —                      | `styleOverrides/notificationBanner.tsx` | Already built on MUI `Paper`, `Stack`, `Typography`, `IconButton`. No migration needed.                                                                      |
| `snackbar`            | **MUI-native** | `Snackbar`             | —                                       | No DSCO wrapper exported. Use `Snackbar` from `@mui/material` directly.                                                                                      |
| `accordion`           | Not Started    | `Accordion`            | —                                       |                                                                                                                                                              |
| `actionBlock`         | Not Started    | —                      | —                                       | Custom component, no direct MUI equivalent.                                                                                                                  |
| `alert`               | Not Started    | `Alert`                | —                                       |                                                                                                                                                              |
| `carousel`            | N/A            | —                      | —                                       | Uses Swiper. No MUI equivalent.                                                                                                                              |
| `checkbox`            | Not Started    | `Checkbox`             | —                                       |                                                                                                                                                              |
| `chips`               | Not Started    | `Chip`                 | —                                       |                                                                                                                                                              |
| `dialog`              | Not Started    | `Dialog`               | —                                       |                                                                                                                                                              |
| `divider`             | Not Started    | `Divider`              | —                                       |                                                                                                                                                              |
| `dropdown`            | Not Started    | `Select` / `Menu`      | —                                       | Base dropdown component.                                                                                                                                     |
| `actionDropdown`      | Not Started    | `Menu` / `MenuItem`    | —                                       | Dropdown with action items.                                                                                                                                  |
| `checkboxDropdown`    | Not Started    | `Select` + `Checkbox`  | —                                       | Dropdown with checkbox options.                                                                                                                              |
| `iconDropdown`        | Not Started    | `Menu` / `IconButton`  | —                                       | Icon-triggered dropdown.                                                                                                                                     |
| `simpleDropdown`      | Not Started    | `Select`               | —                                       | Simple select-style dropdown.                                                                                                                                |
| `fontAwesomeV6Icon`   | N/A            | —                      | —                                       | Icon utility, not a MUI concern.                                                                                                                             |
| `formFieldWrapper`    | N/A            | `FormControl`          | —                                       | Utility wrapper. Consider MUI `FormControl` + `FormLabel`.                                                                                                   |
| `header`              | N/A            | —                      | —                                       | App-specific layout component.                                                                                                                               |
| `heroBanner`          | N/A            | —                      | —                                       | App-specific layout component.                                                                                                                               |
| `image`               | N/A            | —                      | —                                       | No direct MUI equivalent.                                                                                                                                    |
| `list`                | Not Started    | `List`                 | —                                       |                                                                                                                                                              |
| `modal`               | Not Started    | `Modal` / `Dialog`     | —                                       |                                                                                                                                                              |
| `popover`             | Not Started    | `Popover`              | —                                       |                                                                                                                                                              |
| `radioButton`         | Not Started    | `Radio` / `RadioGroup` | —                                       |                                                                                                                                                              |
| `segmentedButtons`    | Not Started    | `ToggleButtonGroup`    | —                                       |                                                                                                                                                              |
| `slider`              | Not Started    | `Slider`               | —                                       |                                                                                                                                                              |
| `tabs`                | Not Started    | `Tabs` / `Tab`         | —                                       |                                                                                                                                                              |
| `tags`                | Not Started    | `Chip`                 | —                                       |                                                                                                                                                              |
| `textField`           | Not Started    | `TextField`            | —                                       |                                                                                                                                                              |
| `toggle`              | Not Started    | `Switch`               | —                                       |                                                                                                                                                              |
| `tooltip`             | Not Started    | `Tooltip`              | —                                       |                                                                                                                                                              |
| `video`               | N/A            | —                      | —                                       | No MUI equivalent.                                                                                                                                           |

## Style Overrides Reference

All MUI style overrides live in `src/themes/code.org/styleOverrides/` and are aggregated in `index.ts`:

```typescript
export const STYLE_OVERRIDES: Components<Theme> = {
  MuiTypography: TYPOGRAPHY_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiBreadcrumbs: BREADCRUMBS_OVERRIDES,
  MuiButtonBase: BUTTON_BASE_OVERRIDES,
  MuiButton: BUTTON_OVERRIDES,
  MuiIconButton: ICON_BUTTON_OVERRIDES,
};
```

## Type Augmentations

Custom MUI type augmentations are defined in `src/themes/code.org/types.d.ts` and must be manually synced to `apps/src/types/mui.d.ts` (TypeScript module augmentation doesn't cross package boundaries in this monorepo).

## How to Migrate a Component

1. **Discuss with the design team** — Before starting a new component migration, coordinate with the design team (including Moshe and Mark) to align on visual expectations and any design adjustments needed for the MUI equivalent.
2. Create MUI style overrides in `src/themes/code.org/styleOverrides/`.
3. Add the overrides to `STYLE_OVERRIDES` in `styleOverrides/index.ts`.
4. Add any necessary type augmentations to `types.d.ts`.
5. Mark the DSCO component as `@deprecated` with a clear migration path.
6. Update this document.
7. Optionally, create a codemod in `codemods/` for automated migration of consumers.

## Migration Strategy

Each DSCO component follows a 4-step migration lifecycle:

1. **Create MUI style overrides** — Match the DSCO component's visual appearance using MUI theme overrides in `src/themes/code.org/styleOverrides/`. This ensures MUI components look identical to their DSCO counterparts so consumers can swap with no visual regressions.

2. **Migrate `/apps` consumers** — Replace all DSCO imports in `/apps` with MUI equivalents. Use a codemod where possible (see `codemods/`). Once all `/apps` consumers are migrated, add an ESLint `no-restricted-imports` rule to prevent new usage of the deprecated DSCO component.

3. **Inside-out replacement** — Replace DSCO Button/Typography usage _inside_ other DSCO components that haven't been migrated yet. This breaks internal dependency chains so deprecated components aren't kept alive by other DSCO components that still import them.

4. **Delete DSCO source** — Once all consumers (both `/apps` and internal DSCO components) are migrated, remove the DSCO component source code entirely.

## Building New MUI Components

When creating a completely new MUI component for the design system (i.e. not migrating an existing DSCO component), discuss it with the design team (Moshe and Mark) before starting implementation. This ensures the component follows existing design system patterns and that we maintain a high-quality, high-integrity design system.

## Internal Dependency Blockers

The following DSCO components use `Button` or `Typography` internally, blocking full removal of those deprecated components. These need the "inside-out replacement" (step 3 above) before we can delete the DSCO source.

> **Typography**: All internal consumers have been migrated to MUI `Typography`. The DSCO Typography source can now be deleted once any remaining `/apps` consumers are confirmed migrated.
>
> **TODO**: Investigate `frontend/packages/component-library-styles/typography.module.scss`. This file provides SCSS mixins (`heading-xxl`, `body-one`, `body-two`, etc.) and CSS module classes that are still **widely consumed** (~100+ files): ~23 SCSS files in `component-library/src/`, ~62 files in `apps/src/`, and indirectly via `component-library-styles/mixins.scss` (which uses the `body-two`/`body-three`/`body-four` mixins for field helper styles). There is also a manual copy at `shared/css/typography.scss`. Determine whether these SCSS mixins can be replaced by MUI Typography theme overrides or if they must coexist, and plan accordingly.

### Button internal consumers (8)

| DSCO Component     | Migration Status |
| ------------------ | ---------------- |
| `Dialog`           | Not Started      |
| `Modal`            | Not Started      |
| `Slider`           | Not Started      |
| `HeroBanner`       | N/A              |
| `ActionBlock`      | Not Started      |
| `CustomDropdown`   | Not Started      |
| `CheckboxDropdown` | Not Started      |
| `Video`            | N/A              |

### Typography internal consumers (11) — **All Done**

| DSCO Component         | Migration Status   |
| ---------------------- | ------------------ |
| `Checkbox`             | **Done**           |
| `RadioButton`          | **Done**           |
| `Toggle`               | **Done**           |
| `Accordion`            | **Done**           |
| `ActionBlock`          | **Done**           |
| `FullWidthActionBlock` | **Done**           |
| `Dialog`               | **Done**           |
| `HeroBanner`           | **Done** (was N/A) |
| `Modal`                | **Done**           |
| `Popover`              | **Done**           |
| `SimpleList`           | **Done**           |
| `Video`                | **Done** (was N/A) |
