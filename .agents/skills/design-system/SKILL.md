---
name: design-system
description: Guidelines for using and contributing to the @code-dot-org/component-library design system and the DSCO-to-MUI migration. Use when working on React UI in apps/ or frontend/.
---

# Design System (`@code-dot-org/component-library`)

## Overview
- Our design system has two types of components:
  - **DSCO components**: our custom React components in `frontend/packages/component-library/` (TypeScript).
  - **MUI components**: from `@mui/material`, with custom style overrides in `frontend/packages/component-library/src/themes/.../styleOverrides/` to match our design system look and feel.
- Shared styles (colors, typography, shape and spacing, mixins) live in `frontend/packages/component-library-styles/`.
- **Always prefer design system components** over custom or legacy alternatives (e.g. `apps/src/sharedComponents/`, `apps/src/legacySharedComponents/`). Only create custom UI components when no design system equivalent exists.

## Which Component to Use
- **Use MUI** for: Typography, Button/LinkButton/GenericButton, IconButton, Breadcrumbs, Tooltip, Dialog. These have been migrated — their DSCO equivalents are deprecated. Dialog is the exception to importing from `@mui/material`: use the package's MUI wrapper, `import {MuiDialog, MuiCustomDialog} from '@code-dot-org/component-library/dialog';`, never `Dialog` from `@mui/material` or the deprecated `Dialog`/`CustomDialog`/default exports of the same path.
- **Use DSCO** for: everything else (Checkbox, Dropdown, Modal, Tabs, TextField, Toggle, etc.). Browse `frontend/packages/component-library/src/` to discover available components.
- **Unsure?** Check `frontend/packages/component-library/MIGRATION_STATUS.md` for the full per-component status, or look for `@deprecated` / `DEPRECATED` in the component's JSDoc header. A `@deprecated` on a single prop marks that prop, not the component.
- Several directories ship a `README.md` next to the source (`src/form/`, `src/tooltip/`, `src/dialog/`) that says more than the status table does.
- The `form` kit (`FormProvider`, `Field`, `SaveBar`, save-state reducer) composes a page-level, single-PATCH settings form; assemble only the pieces you need.
- DSCO import: `import Checkbox from '@code-dot-org/component-library/checkbox';`
- MUI import: `import {Typography as MuiTypography} from '@mui/material';` — style overrides are applied automatically via the theme.
- For API reference: [DSCO Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook) | [MUI docs](https://mui.com/material-ui/all-components/)

## Typography
- Use MUI's `<Typography>` component. DSCO Typography is deprecated.
- Our MUI themes define custom variants that map to our design system type scale. A theme is applied at the app level (see Themes and brands) — you don't need to wrap components yourself.
- Font variables are in `@code-dot-org/component-library-styles/fontVariables.css`.

## Themes and brands
- **`CodeaiTheme` is the live theme.** `CdoTheme` is the legacy Code.org theme; `CodeaiAuditTheme` is a QA utility — all pink, so surfaces that bypass the token system stand out. Neither is served in production; assume CodeAI unless you know otherwise.
- The theme follows the `data-brand` attribute Rails sets on `<html>`. `apps/` and `frontend/` each resolve it and agree on the default; see `src/themes/`.
- A shell that reads `data-brand` itself must pass it through `resolveBrand` before setting the attribute and picking the theme; otherwise an unrecognized value puts the tokens and the palette on different brands.
- Only `code.org/` holds `styleOverrides/` and `muiAugmentation.ts`. The brand themes come from `createBrandTheme`, which deep-merges those in and changes only the palette — so typography, component overrides and type augmentation are shared by every theme despite living under `code.org/`. An override you add lands in all three; check it in each.
- Semantic color tokens resolve through **both** `data-brand` and `data-theme` (light/dark). A token that reads correctly in the default pair can fail in another — check every brand and theme the surface can actually reach.
- The per-brand token files (`brandCodeAiNext.css` and friends) are generated. Edit the canonical source named in the file header and re-run its script; never hand-edit the generated file.

## Styling
- Use **SCSS modules** (`.module.scss`) for all component styling. Never use inline styles or global styles.
- **Color priority**: always use semantic colors (`@code-dot-org/component-library-styles/colors.css`) first, then primitive colors (`primitiveColors.css`) second, then other colors only as last resort.
- Semantic colors are CSS variables from `component-library-styles`, not from the MUI themes. Use the semantic names at call sites; to change what one renders, edit the CADS source that generates the live brand rather than the `:root` defaults (see Themes and brands).
- Radii and spacing come from `shapeAndSpacingVariables.css`; both it and the color files are imported globally by `createReactRoot`.
- **Never rely on stylesheet load order** for specificity. Always use CSS selector specificity rules.
- Override component styles via parent element selectors or component-specific class selectors in SCSS modules.

## Contributing & Extending the Design System
- For building new DSCO components, see `frontend/packages/component-library/CONTRIBUTING.md` and `README.md`.
- **MUI style overrides** live in `frontend/packages/component-library/src/themes/`. When migrating a DSCO component to MUI, add or update the corresponding style override file here.
- **MUI type augmentation**: custom button sizes, colors, typography variants and the `MuiFooter` slot are declared in `src/themes/code.org/muiAugmentation.ts` — under `code.org/`, but in force for every theme. `code.org/index.ts` re-exports them (`export type *`), so a consumer importing from the package picks them up without declaring anything: `apps/` uses custom variants such as `body3` with no local copy. `frontend/apps/studio/src/types/mui.d.ts` is the exception — it re-declares the Typography variants locally, and only those.
- `apps/` resolves the package through its `exports` map to `dist/`, not to the source. Run `yarn build` in `frontend/packages/component-library` before expecting a dev server to see an edit to the package.
- When making major changes to `frontend/packages/component-library/` or `frontend/packages/component-library-styles/`, update this skill file and any relevant component library docs (README, CONTRIBUTING, MIGRATION_STATUS) to keep them in sync.
