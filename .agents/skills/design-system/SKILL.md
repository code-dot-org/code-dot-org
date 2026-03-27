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

## Which Component to Use
- **Use MUI** for: Typography, Button/LinkButton/GenericButton, Breadcrumbs, IconButton. These have been migrated — their DSCO equivalents are deprecated.
- **Use DSCO** for: everything else (Checkbox, Dialog, Dropdown, Tabs, TextField, Toggle, etc.). Browse `frontend/packages/component-library/src/` to discover available components.
- **Unsure?** Check `frontend/packages/component-library/MIGRATION_STATUS.md` for the full per-component status, or look for `@deprecated` / `DEPRECATED` in the component's JSDoc header.
- DSCO import: `import Checkbox from '@code-dot-org/component-library/checkbox';`
- MUI import: `import {Typography as MuiTypography} from '@mui/material';` — style overrides are applied automatically via the theme.
- For API reference: [DSCO Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook) | [MUI docs](https://mui.com/material-ui/all-components/)

## Typography
- Use MUI's `<Typography>` component. DSCO Typography is deprecated.
- Our MUI theme defines custom variants that map to our design system type scale. The theme is applied at the app level via `<ThemeProvider theme={CdoTheme}>` — you don't need to wrap components yourself.
- Font variables are in `@code-dot-org/component-library-styles/fontVariables.css`.

## Styling
- Use **SCSS modules** (`.module.scss`) for all component styling. Never use inline styles or global styles.
- **Color priority**: always use semantic colors (`@code-dot-org/component-library-styles/colors.scss`) first, then primitive colors (`primitiveColors.scss`) second, then other colors only as last resort.
- Semantic colors are CSS variables (e.g., `var(--text-neutral-primary)`) that support light/dark theming via the `data-theme` attribute.
- **Never rely on stylesheet load order** for specificity. Always use CSS selector specificity rules.
- Override component styles via parent element selectors or component-specific class selectors in SCSS modules.

## Contributing & Extending the Design System
- For building new DSCO components, see `frontend/packages/component-library/CONTRIBUTING.md` and `README.md`.
- **MUI style overrides** live in `frontend/packages/component-library/src/themes/`. When migrating a DSCO component to MUI, add or update the corresponding style override file here.
- `CdoTheme` **MUI theme**: `frontend/packages/component-library/src/themes/code.org/`. Defines custom typography variants, button sizes/colors, and CSS variables for light/dark theme support.
- **MUI type augmentation**: custom types (extra button sizes, colors, typography variants) are declared in `frontend/packages/component-library/types/mui.d.ts` and must be manually synced to `apps/src/types/mui.d.ts`.
- When making major changes to `frontend/packages/component-library/` or `frontend/packages/component-library-styles/`, update this skill file and any relevant component library docs (README, CONTRIBUTING, MIGRATION_STATUS) to keep them in sync.
