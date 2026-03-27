---
name: design-system
description: Guidelines for using and contributing to the @code-dot-org/component-library design system and the DSCO-to-MUI migration. Use when working on React UI in apps/ or frontend/.
---

# Design System (`@code-dot-org/component-library`)

## Overview
- Our design system has two types of components:
  - **DSCO components**: our custom React components in `frontend/packages/component-library/` (TypeScript).
  - **MUI components**: from `@mui/material`, with custom style overrides in `frontend/packages/component-library/src/themes/.../styleOverrides/` to match our design system look and feel.
- Shared styles (colors, typography, mixins) live in `frontend/packages/component-library-styles/`.
- **Always prefer design system components** over custom or legacy alternatives (e.g. `apps/src/sharedComponents/`, `apps/src/legacySharedComponents/`). Only create custom UI components when no design system equivalent exists.

## Available Components
Accordion, ActionBlock, Alert, Breadcrumbs, Button/LinkButton, Carousel, Checkbox, Chips, Dialog, Divider, Dropdown (action, checkbox, icon, simple), FontAwesomeV6Icon, Header, HeroBanner, Image, Link, List, Modal, NotificationBanner, Popover, RadioButton, SegmentedButtons, Slider, Snackbar, Tabs, Tags, TextField, Toggle, Tooltip, Typography, Video, and more.

## Import Pattern & Component Status
- Import pattern: `import Checkbox from '@code-dot-org/component-library/checkbox';` for DSCO Components
- MUI components (e.g. Typography, Button) are imported directly from `@mui/material` (e.g. `import { Typography as MuiTypography } from '@mui/material';`) and customized via style overrides in the theme.
- Each DSCO component has a JSDoc status header (`Stable`, `Ready for dev`, `WIP`, `DEPRECATED`) -- check it before using.
- For full API reference, check the component source or Storybook at https://code-dot-org.github.io/code-dot-org/component-library-storybook and official MUI docs at https://mui.com/material-ui/all-components/.

## Styling
- Use **SCSS modules** (`.module.scss`) for all component styling. Never use inline styles or global styles.
- **Color priority**: always use semantic colors (`@code-dot-org/component-library-styles/colors.scss`) first, then primitive colors (`primitiveColors.scss`) second, then other colors only as last resort.
- Semantic colors are CSS variables (e.g., `var(--text-neutral-primary)`) that support light/dark theming via the `data-theme` attribute.
- **Never rely on stylesheet load order** for specificity. Always use CSS selector specificity rules.
- Override component styles via parent element selectors or component-specific class selectors in SCSS modules.

## Typography
- Use MUI's `<Typography>` component (DSCO Typography is deprecated). Font variables are in `@code-dot-org/component-library-styles/fontVariables.css`.

## Contributing
- When building new design system components, see `frontend/packages/component-library/CONTRIBUTING.md` and `README.md` for the full contribution process and best practices.
- When making major changes to `frontend/packages/component-library/` or `frontend/packages/component-library-styles/`, update this skill file and any relevant component library docs (README, CONTRIBUTING, MIGRATION_STATUS) to keep them in sync.

## DSCO-to-MUI Migration (in progress)
- We are gradually migrating from our custom design system (DSCO / `@code-dot-org/component-library`) to MUI (`@mui/material`). Before using a DSCO component, check whether it has been deprecated (look for `@deprecated` or `DEPRECATED` status in its JSDoc header) and whether MUI style overrides already exist for it in `frontend/packages/component-library/src/themes/code.org/styleOverrides/`.
- **Migration status doc**: see `frontend/packages/component-library/MIGRATION_STATUS.md` for the full per-component migration status table.
- **Decision guide for which component to use**: if a DSCO component is deprecated or has MUI style overrides in the theme, use the MUI equivalent. Otherwise, continue using the DSCO component until its MUI migration is ready.
- **Already migrated (deprecated)**: Typography, Button/LinkButton/GenericButton, Breadcrumbs. Use MUI equivalents directly.
- **MUI style overrides**: located in `frontend/packages/component-library/src/themes/.../styleOverrides/`. These customize MUI components (Typography, Button, IconButton, Link, Breadcrumbs) to match our design system. When migrating a DSCO component to MUI, add or update the corresponding style override file here.
- **MUI theme**: our custom MUI theme (`CdoTheme`) lives in `frontend/packages/component-library/src/themes/code.org/` and is applied via `<ThemeProvider theme={CdoTheme}>`. It defines custom typography variants, button sizes/colors, and uses CSS variables for light/dark theme support.
- **MUI type augmentation**: custom MUI types (extra button sizes, colors, typography variants, etc.) are declared in `frontend/packages/component-library/types/mui.d.ts` and must be manually synced to `apps/src/types/mui.d.ts`.
