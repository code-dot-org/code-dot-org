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

| DSCO Component        | Status         | MUI Equivalent         | Style Overrides                         | Notes                                                                                                                                                |
| --------------------- | -------------- | ---------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typography`          | **Migrated**   | `Typography`           | `styleOverrides/typography.ts`          | Deprecated. Use `Typography` from `@mui/material`.                                                                                                   |
| `button`              | **Migrated**   | `Button`, `IconButton` | `styleOverrides/button.tsx`             | Deprecated. Use `Button`, `IconButton` from `@mui/material`. Codemod available: `yarn codemod:buttons`. See `src/button/BUTTON_MIGRATION_TO_MUI.md`. |
| `link`                | Not Started    | `Link`                 | `styleOverrides/link.ts` (partial)      | Basic overrides exist (variant + font weight) but not complete. Migration not started.                                                               |
| `breadcrumbs`         | **Migrated**   | `Breadcrumbs`          | `styleOverrides/breadcrumbs.ts`         | Deprecated. Use `Breadcrumbs` from `@mui/material`. Custom size prop augmented (`xs`, `s`, `m`, `l`).                                                |
| `closeButton`         | Not Started    | `CloseButton`          | -                                       | MUI `IconButton` style overrides exist. Migration not started.                                                                                       |
| `notification-banner` | **MUI-native** | —                      | `styleOverrides/notificationBanner.tsx` | Already built on MUI `Paper`, `Stack`, `Typography`, `IconButton`. No migration needed.                                                              |
| `snackbar`            | **MUI-native** | `Snackbar`             | —                                       | No DSCO wrapper exported. Use `Snackbar` from `@mui/material` directly.                                                                              |
| `accordion`           | Not Started    | `Accordion`            | —                                       |                                                                                                                                                      |
| `actionBlock`         | Not Started    | —                      | —                                       | Custom component, no direct MUI equivalent.                                                                                                          |
| `alert`               | Not Started    | `Alert`                | —                                       |                                                                                                                                                      |
| `carousel`            | N/A            | —                      | —                                       | Uses Swiper. No MUI equivalent.                                                                                                                      |
| `checkbox`            | Not Started    | `Checkbox`             | —                                       |                                                                                                                                                      |
| `chips`               | Not Started    | `Chip`                 | —                                       |                                                                                                                                                      |
| `dialog`              | Not Started    | `Dialog`               | —                                       |                                                                                                                                                      |
| `divider`             | Not Started    | `Divider`              | —                                       |                                                                                                                                                      |
| `dropdown`            | Not Started    | `Select` / `Menu`      | —                                       | Base dropdown component.                                                                                                                             |
| `actionDropdown`      | Not Started    | `Menu` / `MenuItem`    | —                                       | Dropdown with action items.                                                                                                                          |
| `checkboxDropdown`    | Not Started    | `Select` + `Checkbox`  | —                                       | Dropdown with checkbox options.                                                                                                                      |
| `iconDropdown`        | Not Started    | `Menu` / `IconButton`  | —                                       | Icon-triggered dropdown.                                                                                                                             |
| `simpleDropdown`      | Not Started    | `Select`               | —                                       | Simple select-style dropdown.                                                                                                                        |
| `fontAwesomeV6Icon`   | N/A            | —                      | —                                       | Icon utility, not a MUI concern.                                                                                                                     |
| `formFieldWrapper`    | N/A            | `FormControl`          | —                                       | Utility wrapper. Consider MUI `FormControl` + `FormLabel`.                                                                                           |
| `header`              | N/A            | —                      | —                                       | App-specific layout component.                                                                                                                       |
| `heroBanner`          | N/A            | —                      | —                                       | App-specific layout component.                                                                                                                       |
| `image`               | N/A            | —                      | —                                       | No direct MUI equivalent.                                                                                                                            |
| `list`                | Not Started    | `List`                 | —                                       |                                                                                                                                                      |
| `modal`               | Not Started    | `Modal` / `Dialog`     | —                                       |                                                                                                                                                      |
| `popover`             | Not Started    | `Popover`              | —                                       |                                                                                                                                                      |
| `radioButton`         | Not Started    | `Radio` / `RadioGroup` | —                                       |                                                                                                                                                      |
| `segmentedButtons`    | Not Started    | `ToggleButtonGroup`    | —                                       |                                                                                                                                                      |
| `slider`              | Not Started    | `Slider`               | —                                       |                                                                                                                                                      |
| `tabs`                | Not Started    | `Tabs` / `Tab`         | —                                       |                                                                                                                                                      |
| `tags`                | Not Started    | `Chip`                 | —                                       |                                                                                                                                                      |
| `textField`           | Not Started    | `TextField`            | —                                       |                                                                                                                                                      |
| `toggle`              | Not Started    | `Switch`               | —                                       |                                                                                                                                                      |
| `tooltip`             | Not Started    | `Tooltip`              | —                                       |                                                                                                                                                      |
| `video`               | N/A            | —                      | —                                       | No MUI equivalent.                                                                                                                                   |

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

1. Create MUI style overrides in `src/themes/code.org/styleOverrides/`.
2. Add the overrides to `STYLE_OVERRIDES` in `styleOverrides/index.ts`.
3. Add any necessary type augmentations to `types.d.ts`.
4. Mark the DSCO component as `@deprecated` with a clear migration path.
5. Update this document.
6. Optionally, create a codemod in `codemods/` for automated migration of consumers.
