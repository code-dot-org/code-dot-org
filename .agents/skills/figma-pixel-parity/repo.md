# Library bindings

- Figma file key: `DGekOeToRVifvFAhfqpeC1`
- Figma file URL: https://www.figma.com/design/DGekOeToRVifvFAhfqpeC1/CodeAI-Design-System--CADS-
- Library: only components published from "CodeAI Design System (CADS)". `search_design_system` also returns same-named sets from "(OLD) DSCO Components", "DO NOT USE — USE DSCO COMPONENTS", "CodeAI Design System" (no "(CADS)"), and the Ant Design and Lo-fi kits. Those are not the spec.
- Page listing: `get_metadata` with no node id returns only the pages loaded in Figma desktop, not all 59. Start from the table below; to list every page, read `figma.root.children` with `use_figma`.
- Component sets: confirm the node is a component set before use; if a row is wrong, find the right node and fix the row. Rows were matched by name; a row whose component has been through this workflow is confirmed. The component set is the assembled component designers place. Related sets are its parts; a building block such as Chip or Text Input Building Block holds the interaction states, so pull it too.

  | Library export | Component set | Related sets |
  |---|---|---|
  | `alert` | Alert `2133:4160` | |
  | `breadcrumbs` | Breadcrumbs `16381:3339` | Breadcrumb Link `6862:5619`, Breadcrumb Separator `2434:9333`, Breadcrumb Overflow `17408:6606` |
  | `button` (MUI `Button`) | Button `15724:18791` | |
  | `checkbox` | Checkbox `13257:1875` | Checkbox + Label `252:2038` |
  | `chips` | Chip Group `15953:3568` | Chip `5881:2187` |
  | `closeButton` | Close Icon Button `6368:7269` | |
  | `dialog` | Dialog `3453:3938` | |
  | `dropdown` | Dropdown `15857:100676` | Dropdown Button `964:10677`, Dropdown Menu List `971:4280`, Dropdown Menu Item `896:3791`, menuOptGroup `16847:69853`, menuSeparator `16847:69841` |
  | `footer` | Footer `16661:1389` | |
  | `formFieldWrapper` | Field Wrapper `15857:99804` | |
  | `header` | Global Header `17240:2903` | Progress Widget `17307:1036`, Progress Bubbles `17307:1165` |
  | `link` | Link `3480:5546` | |
  | `modal` | Modal `2190:8284` | |
  | `notification-banner` | Notification Banner `10618:632` | |
  | `popover` | Popover `16426:681` | Popover Core `16421:393` |
  | `radioButton` | Radio Button `13257:411` | Radio Button + Label `4675:6352` |
  | `segmentedButtons` | Segmented Button Group `8027:2099` | Segmented Button Item `8000:4554` |
  | `slider` | Slider `16344:15611` | Slider Bar `16342:13347`, Slider Knob `16336:13274`, Slider Stepper `16344:14959` |
  | `tabs` | Tab Group `16496:3371` | Tab Item `6240:7203` |
  | `tags` | Tag `16433:2625` | |
  | `textField` | Text Input `16176:4884` | Text Input Building Block `16146:3517` |
  | `toast` | Toast `10587:14942` | |
  | `toggle` | Toggle `8841:5569` | Toggle + Label `327:2151` |
  | `tooltip` | Tooltip `1990:7125` | |

  Figma components with no library export yet:

  | Component | Component set | Related sets |
  |---|---|---|
  | AI Chat | AI Chat Input `17228:10734` | AI Chat Message `17228:10789`, AI Chat File Chip `17228:10810`, Chat File Remove Button `17228:10910` |
  | Drawer | Drawer `10708:17779` | |
  | Icon Toggle | Icon Toggle `3710:461` | Icon Toggle + Label `3514:2239` |
  | Icon Tooltip | Icon Tooltip `17051:27346` | |
  | Pagination | Pagination `17007:19104` | |
- Component source root: `frontend/packages/component-library/src/`
- Public import path: `@code-dot-org/component-library/<export>` (see the `exports` map in `frontend/packages/component-library/package.json`). Example: `import Checkbox from '@code-dot-org/component-library/checkbox';`.
- Prop catalog: No Figma prop snapshot and no generated manifest. The catalog is the exported `*Props` interface beside each component, plus its Storybook `Meta` in `src/<component>/stories/*.story.tsx`. DSCO vs MUI status is `frontend/packages/component-library/MIGRATION_STATUS.md`.
- Tokens: CSS custom properties, not MUI palette keys. Parity brand is `codeai-next`. Semantic color lives in `frontend/packages/component-library-styles/colors_codeAi.css` and is rescoped onto `[data-brand='codeai-next']` by `brandCodeAiNext.css` (generated; do not hand-edit). Roles are `--background-*`, `--text-*`, and `--border-*`. Primitives (`--neutral-*`, `--brand-*`, `--sentiment-*` in `primitiveColors_codeAi.css`) are the raw ramp; bind visible color to a semantic name. Shape, spacing, and elevation are `--shape-*`, `--spacing-p-*`, and `--shadow-*` in `shapeAndSpacingVariables.css`. Type is `--font-family-*`, `--font-weight-*`, and `--font-size-body-*` in `fontVariables.css`. The legacy names in `colors.css` (`--borders-*` and the old brand ramps) predate the Figma file. A match against the Figma file is only valid under `data-brand="codeai-next"`.
- Work directory: `.agents/skills/figma-pixel-parity/work/<Component>/`, gitignored. The recipe is `recipe.json`; captures are `<case-id>.figma.png` and `<case-id>.browser.png` beside it. None of it is committed.
- Recipe check: `node .agents/skills/figma-pixel-parity/validate-recipe.mjs <recipe.json>` from the repo root. It uses `ajv` from `frontend/node_modules`, so run `yarn install` in `frontend/` first.
- Capture URL: `http://localhost:6006/iframe.html?viewMode=story&id={storyId}&globals=brand:codeai-next&args={args}`. `{storyId}` is the `id` in the story's sidebar URL; `{args}` is `key:value;key:value`. Start the host with `yarn workspace @code-dot-org/design-system-storybook storybook` from `frontend/` (port 6006). Stories import component source, so this host sees unsaved source. `apps/` and Studio resolve the package `exports` map to `dist/`; run the library `build` before a capture there.
- Mode switch: Two independent attributes. Brand: `data-brand="codeai-next"` on `<html>` (Storybook toolbar global `brand`, default `codeai-next`, applied by `frontend/apps/design-system-storybook/decorators/BrandDecorator.tsx`). Light/Dark: `data-theme="Light"` or `data-theme="Dark"` on `<html>` or the nearest ancestor. `ThemeProvider` in `src/common/contexts/ThemeContext.tsx` writes that attribute on a wrapping `div`. Light is also the `:root` default. Storybook has no theme global; before a Dark capture, run `document.documentElement.dataset.theme = 'Dark'` in the story frame. Do not use `codeai-audit` (all pink) for a parity capture.
- Fonts that must load before a capture: Geist (`--font-family-main`), Space Grotesk (`--font-family-heading`), and Font Awesome 6 Pro for icons. Storybook preview already loads these (`@code-dot-org/fonts` via `loadFonts()` and `injectFontAwesome`). Wait until `document.fonts.ready` and the Font Awesome loader settle.
- Verify commands, from `frontend/`:
  - `yarn workspace @code-dot-org/component-library typecheck`
  - `yarn workspace @code-dot-org/component-library test`
  - `yarn workspace @code-dot-org/component-library lint`
  - `yarn workspace @code-dot-org/component-library stylelint`
  - `yarn workspace @code-dot-org/component-library build` when `apps/` or Studio must see the change
  - `yarn workspace @code-dot-org/design-system-storybook typecheck` when a story changed
- API audit command: None. Record the Figma-axis to prop mapping in `evidence.apiAudit`. `state` (default, hover, press, focus) is design-only. Disabled, selected, and checked are real props when the component has them.
- Notes:
  - Read `.agents/skills/design-system/SKILL.md` before writing a component. DSCO components are SCSS modules (`*.module.scss`) under `src/`. Migrated components (Button, IconButton, Typography, Breadcrumbs, Tooltip, and the dialog wrapper) are MUI. Import `MuiDialog` / `MuiCustomDialog` from `@code-dot-org/component-library/dialog`, not `Dialog` from `@mui/material`. MUI look comes from `src/themes/code.org/styleOverrides/`, which every brand theme deep-merges.
  - Do not paste Figma codegen: no Tailwind, no absolute-positioned frames, no inline `style` for color or hover. Interactive color goes in the stylesheet so `:hover`, `:active`, and `:focus-visible` can replace it.
  - MUI default height, padding, radius, ripple, shadow, and uppercase labels are not the design. Use the recipe geometry.
