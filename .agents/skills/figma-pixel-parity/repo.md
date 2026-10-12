# Library bindings

The skill reads this file only.

- Figma file key: `DGekOeToRVifvFAhfqpeC1`
- Figma file URL: https://www.figma.com/design/DGekOeToRVifvFAhfqpeC1/CodeAI-Design-System--CADS-
- Shared link node: `94:3010` (from `node-id=94-3010`). A starting point in the file. Each component still needs its own public component-set node.
- Component source root: `frontend/packages/component-library/src/`
- Public import path: `@code-dot-org/component-library/<export>` (see the `exports` map in `frontend/packages/component-library/package.json`). Example: `import Checkbox from '@code-dot-org/component-library/checkbox';`.
- Prop catalog (manifest, exported types, or Storybook meta): No Figma prop snapshot and no generated manifest. The catalog is the exported `*Props` interface beside each component, plus its Storybook `Meta` in `src/<component>/stories/*.story.tsx`. DSCO vs MUI status is `frontend/packages/component-library/MIGRATION_STATUS.md`.
- Token system (CSS variables, theme keys, or both) and the naming rule: CSS custom properties, not MUI palette keys. Parity brand is `codeai-next`. Semantic color lives in `frontend/packages/component-library-styles/colors_codeAi.css` and is rescoped onto `[data-brand='codeai-next']` by `brandCodeAiNext.css` (generated; do not hand-edit). Roles are `--background-*`, `--text-*`, and `--border-*`. Primitives (`--neutral-*`, `--brand-*`, `--sentiment-*` in `primitiveColors_codeAi.css`) are the raw ramp; bind visible color to a semantic name. Shape, spacing, and elevation are `--shape-*`, `--spacing-p-*`, and `--shadow-*` in `shapeAndSpacingVariables.css`. Type is `--font-family-*`, `--font-weight-*`, and `--font-size-body-*` in `fontVariables.css`. The legacy names in `colors.css` (`--borders-*` and the old brand ramps) are the pre-CADS set. A CADS match is only valid under `data-brand="codeai-next"`.
- Where visual recipes live (default `docs/visual-recipes/<Component>.json`): `.agents/skills/figma-pixel-parity/visual-recipes/<Component>.json`, with captures in that component's directory. Commit a recipe with the component change it documents.
- Fixture URL pattern (`{Component}`, `{id}`, and `{mode}` placeholders): No parity fixture exists yet. Before the first capture, add one that meets the contract in `references/correction-loop.md`. Host it in design-system Storybook and use `http://localhost:6006/iframe.html?viewMode=story&id=parity--case&globals=brand:codeai-next&args=component:{Component};caseId:{id};mode:{mode}`. `{mode}` is `Light` or `Dark`. Start the host with `yarn workspace @code-dot-org/design-system-storybook storybook` from `frontend/` (port 6006). Stories import component source, so this host sees unsaved source. `apps/` and Studio resolve the package `exports` map to `dist/`; run the library `build` before a capture there.
- Mode switch (class, attribute, or theme provider): Two independent switches. Brand: `data-brand="codeai-next"` on `<html>` (Storybook toolbar global `brand`, default `codeai-next`, applied by `frontend/apps/design-system-storybook/decorators/BrandDecorator.tsx`). Light/dark: `data-theme="Light"` or `data-theme="Dark"` on the nearest ancestor. `ThemeProvider` in `src/common/contexts/ThemeContext.tsx` writes that attribute on a wrapping `div`. Light is also the `:root` default. Storybook has no theme toolbar global, so the fixture must set `data-theme` itself. Do not use `codeai-audit` (all pink) for a parity capture.
- Fonts that must load before a capture: Geist (`--font-family-main`), Space Grotesk (`--font-family-heading`), and Font Awesome 6 Pro for icons. Storybook preview already loads these (`@code-dot-org/fonts` via `loadFonts()` and `injectFontAwesome`). Wait until `document.fonts.ready` and the Font Awesome loader settle. A fallback face is a false typography mismatch.
- Verify commands (typecheck, build, tests): From `frontend/`:
  - `yarn workspace @code-dot-org/component-library typecheck`
  - `yarn workspace @code-dot-org/component-library test`
  - `yarn workspace @code-dot-org/component-library lint`
  - `yarn workspace @code-dot-org/component-library stylelint`
  - `yarn workspace @code-dot-org/component-library build` when `apps/` or Studio must see the change
  - `yarn workspace @code-dot-org/design-system-storybook typecheck` when the fixture or a story changed
- API audit command, if one exists: None. Record the Figma-axis to prop mapping in `evidence.apiAudit`. `state` (default, hover, press, focus) is design-only. Disabled, selected, and checked are real props when the component has them.
- Notes (styling system, what must not be copied from Figma output):
  - Read `.agents/skills/design-system/SKILL.md` before writing a component. DSCO components are SCSS modules (`*.module.scss`) under `src/`. Migrated components (Button, IconButton, Typography, Breadcrumbs, Tooltip, and the dialog wrapper) are MUI. Import `MuiDialog` / `MuiCustomDialog` from `@code-dot-org/component-library/dialog`, not `Dialog` from `@mui/material`. MUI look comes from `src/themes/code.org/styleOverrides/`, which every brand theme deep-merges.
  - Do not paste Figma codegen: no Tailwind, no absolute-positioned frames, no inline `style` for color or hover. Interactive color goes in the stylesheet so `:hover`, `:active`, and `:focus-visible` can replace it.
  - MUI default height, padding, radius, ripple, shadow, and uppercase labels are not the design. Use the recipe geometry.
  - `apps/` will not see a package edit until `yarn workspace @code-dot-org/component-library build`.
