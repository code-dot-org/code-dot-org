# Theming Architecture

This document explains how theming works across the Code.org platform. There are two independent theming dimensions:

1. **Brand** — which product the user is on. Determines the MUI theme and CSS color ramp.
2. **Mode** — Light or Dark appearance. Controlled per-component-tree via `ThemeProvider`.

These two dimensions are orthogonal: any brand can be combined with any mode.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  createReactRoot() (apps/src/util/createReactRoot.tsx)      │
│                                                             │
│  1. Reads brand from <html data-brand>, set server-side      │
│     by application.html.haml via Cdo::Brand  ──→  brand.ts   │
│  2. Selects MUI theme  ──→  CdoTheme or CodeaiTheme          │
│  3. Wraps component tree:                                   │
│                                                             │
│     <SiteConfigProvider config={{brand}}>                   │
│       <MuiThemeProvider theme={theme}>                      │
│         {component}                                         │
│       </MuiThemeProvider>                                   │
│     </SiteConfigProvider>                                   │
│                                                             │
│  Components deeper in the tree may also mount:              │
│                                                             │
│     <ThemeProvider>        ← Light/Dark mode (from contexts)│
│       <div data-theme="Light|Dark">                         │
│         {children}                                          │
│       </div>                                                │
│     </ThemeProvider>                                        │
└─────────────────────────────────────────────────────────────┘
```

## CSS Variable Resolution

All colors flow through a two-tier CSS variable system defined in `@code-dot-org/component-library-styles`:

```
primitiveColors.css          Fixed base palette (theme-independent)
        ↓
    colors.css               Semantic tokens that change per mode and brand
```

Until the CodeAI brand cutover, a brand override layer sits on top
(imported via `brandOverrides.css`, see the header comment there for the
full picture):

```
brandLegacyShim.css          CADS token names, mapped to legacy values
                             (so migrated code renders under legacy brands)
brandCodeAiNext.css          CADS primitives + semantic tokens, scoped to
                             [data-brand='codeai-next'] (generated from
                             primitiveColors_codeAi.css + colors_codeAi.css)
brandCodeAiAudit.css         The same CADS tokens with every primitive
                             replaced by a pink of the same ramp position,
                             scoped to [data-brand='codeai-audit'] (generated
                             from the same two canonical files)
brandLegacyAliases.css       Legacy token names, mapped to CADS values under
                             both CADS brands (so unmigrated code renders
                             under codeai-next, and pink under codeai-audit)
```

Only `brandLegacyShim.css` and `brandLegacyAliases.css` know that legacy
token names exist; both are deleted once call sites use CADS names. The
audit brand survives that deletion unchanged.

### Selectors

| Selector                                                                           | When active                    |
| ---------------------------------------------------------------------------------- | ------------------------------ |
| `:root, [data-theme='Light']`                                                      | Light mode (default)           |
| `[data-theme='Dark']`                                                              | Dark mode                      |
| `[data-brand='codeai-next']:root, [data-brand='codeai-next'] [data-theme='Light']` | CodeAI (CADS) ramp, light mode |
| `[data-brand='codeai-next'] [data-theme='Dark']`                                   | CodeAI (CADS) ramp, dark mode  |
| `[data-brand='codeai-audit']:root, …`                                              | Pink audit ramp                |

Components should use **semantic** variables (e.g. `var(--background-neutral-primary)`) instead of primitive ones. The correct value is resolved automatically based on the active `data-theme` and `data-brand` attributes. Note that the `code` and `codeai` brands both resolve to the legacy (colors.css) ramp; only `codeai-next` carries the CADS ramp until cutover.

### Component-level brand overrides

The token bridge substitutes values token-for-token, so a component whose
legacy tokens map cleanly onto CADS ones needs no changes. When the CADS
design for a component diverges structurally — different shape, border,
typography treatment, or a different token than the bridge's global mapping
picks — add a brand-scoped block at the bottom of the component's SCSS
module (see `tags/tags.module.scss` for the reference example):

```scss
[data-brand='codeai-next'] {
  .myComponent {
    background: var(--background-brand-light);
    border: 1px solid var(--border-brand-mid);
  }
}
```

Rules for these blocks:

- Scope on `[data-brand='codeai-next']` so every legacy brand renders
  byte-identically until cutover. At cutover the selector is deleted, not
  the declarations.
- Reference **CADS semantic tokens** only (the names in
  `colors_codeAi.css`). They are theme-aware under `codeai-next`, so Dark
  mode needs no extra rules; do not hardcode hex values or reach for
  primitives.
- `[data-brand]` sits on `<html>`, above any CSS module, so the attribute
  selector composes with local class names without `:global`.
- The CADS shape (`--shape-*`) and spacing (`--spacing-p-*`) ramps are the
  exception to brand scoping: they are brand- and mode-invariant, defined
  at `:root` in `component-library-styles/shapeAndSpacingVariables.css`.
  Reference them with a fallback (e.g. `var(--shape-sm, 0.375rem)`) for
  surfaces that don't load the token entry points.

---

## Brand System

### How brand is determined

Brand resolution happens server-side, in `Cdo::Brand.current_brand_code`
(`lib/cdo/brand.rb`): DCDO `default-brand` (falling back to `codeai-next`)
unless `brand-router-enabled` is on, in which case a `?brand=` URL param or
the `brand` cookie can override it per request. The result is written to
`data-brand` on `<html>` by `application.html.haml`.

`apps/src/util/brand.ts`'s `getCurrentBrand()` just reads that attribute
client-side, returning one of `'code' | 'codeai' | 'codeai-next' |
'codeai-audit'`, defaulting to `'codeai-next'` if the attribute is absent or
unrecognized.

The brand cookie is set by navigating with `?brand=codeai` and cleared with `?brand-reset=1`.

### How brand affects rendering

| Mechanism                | What it does                                                           |
| ------------------------ | ---------------------------------------------------------------------- |
| `data-brand` on `<html>` | Activates the CSS variable overrides in the `brandOverrides.css` layer |
| `MuiThemeProvider`       | Swaps between `CdoTheme`, `CodeaiTheme`, and `CodeaiAuditTheme`        |
| `SiteConfigProvider`     | Exposes brand to React components via `useBrand()` hook                |

### Accessing brand in components

```tsx
import {useBrand} from '@cdo/apps/util/SiteConfigContext';

const MyComponent = () => {
  const brand = useBrand(); // 'code' | 'codeai' | 'codeai-next' | 'codeai-audit'
  // ...
};
```

For non-React code, the brand can be read from the DOM:

```ts
document.documentElement.dataset.brand; // 'code' | 'codeai' | 'codeai-next' | 'codeai-audit' | undefined
```

### MUI Themes

| Theme              | File                      | Description                                           |
| ------------------ | ------------------------- | ----------------------------------------------------- |
| `CdoTheme`         | `./code.org/index.ts`     | Default Code.org theme                                |
| `CodeaiTheme`      | `./codeai/index.ts`       | CADS brand-purple palette (used for `codeai-next`)    |
| `CodeaiAuditTheme` | `./codeai-audit/index.ts` | Hot-pink palette pairing with the pink audit CSS ramp |

`CodeaiTheme` and `CodeaiAuditTheme` inherit all typography and component style overrides from `CdoTheme` via `createTheme(CdoTheme, { palette: ... })`. Only the palette differs.

Entry points under `frontend/` (which cannot import `apps/src/util/brand.ts`) select the MUI theme with `getMuiThemeForBrand(document.documentElement.dataset.brand)`, exported from this package. Every entry point that loads `brandOverrides.css` should also call this, so CSS tokens and MUI palette-driven components stay in sync under the same brand — see `frontend/apps/studio/src/routes/__root.tsx` and `frontend/packages/markdown/demo/main.tsx`.

MUI components access theme values via the standard `useTheme()` hook from `@mui/material/styles`.

---

## Light/Dark Mode System

### ThemeContext

Defined in `frontend/packages/component-library/src/common/contexts/ThemeContext.tsx`.

Provides:

- `theme` — current value: `'Light'` or `'Dark'`
- `toggleTheme()` — switch between Light and Dark
- `setTheme(theme)` — set a specific mode

The provider renders a `<div data-theme="Light|Dark">` wrapper. CSS variables inside that subtree automatically resolve to the correct mode's values.

### Where ThemeProvider is mounted

`ThemeProvider` is mounted inside specific app trees that support dark mode, not globally. Currently used in:

- **Lab2** (`apps/src/lab2/views/Lab2.tsx`) — wraps the entire lab UI
- Labs that support dark mode: **pythonlab**, **weblab2**, **sketchlab**

Pages that don't mount a `ThemeProvider` default to Light mode (via the `:root` CSS selector).

### How mode is determined

In Lab2, the initial mode is resolved by `useInitialLabTheme`:

1. Check if the lab supports theme preference (pythonlab, weblab2, sketchlab).
2. If the user is signed in, fetch their saved preference via `UserPreferences.getGlobalTheme()`.
3. Otherwise, use the theme from app options or fall back to the first supported theme.

Users can switch modes at runtime via a dropdown (powered by `useThemeSetting`), which calls `setTheme()` and persists the preference.

### Using theme in components

```tsx
import {useTheme} from '@code-dot-org/component-library/common/contexts';

const MyComponent = () => {
  const {theme, toggleTheme} = useTheme();
  // theme is 'Light' or 'Dark'
};
```

For components that may render outside a `ThemeProvider` (e.g. portals/tooltips), use the optional form:

```tsx
const {theme} = useTheme(true); // theme may be undefined
```

### Styling for Light/Dark mode

Components should use semantic CSS variables — they resolve automatically:

```scss
.myComponent {
  // These values change automatically based on [data-theme]
  background-color: var(--background-neutral-primary);
  color: var(--text-neutral-primary);
}
```

If you need mode-specific overrides beyond what semantic tokens provide, target the `data-theme` attribute:

```scss
[data-theme='Dark'] .myComponent {
  // dark-mode-specific override
}
```

---

## Summary: What controls what

| Attribute / Provider     | Set by                     | Affects                                | Scope          |
| ------------------------ | -------------------------- | -------------------------------------- | -------------- |
| `data-brand` on `<html>` | `createReactRoot`          | CSS color ramp (brand palette)         | Entire page    |
| `MuiThemeProvider`       | `createReactRoot`          | MUI style overrides, component palette | React subtree  |
| `SiteConfigProvider`     | `createReactRoot`          | `useBrand()` hook                      | React subtree  |
| `data-theme` on `<div>`  | `ThemeProvider` (contexts) | CSS semantic tokens (Light/Dark)       | Component tree |
| `useTheme()` hook        | `ThemeProvider` (contexts) | React component logic                  | Component tree |
