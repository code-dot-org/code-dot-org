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
│  2. Selects MUI theme  ──→  CodeaiTheme or CodeaiAuditTheme  │
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

`codeai-next` is the sitewide default brand. Its CADS tokens currently
still ship as a brand-scoped override layer on top of the legacy ramp —
`brandOverrides.css` (imported once, right after `colors.css`) layers:

```
brandLegacyShim.css          CADS token names, mapped to legacy values
brandCodeAiNext.css          CADS primitives + semantic tokens, scoped to
                             [data-brand='codeai-next'] (generated from
                             colors_codeAi.css by
                             scripts/generateBrandCodeAiNext.mjs)
brandCodeAiNextAliases.css   Legacy token names, mapped to CADS values
brandCodeAiAudit.css         All-pink tokens for [data-brand='codeai-audit']
```

A follow-up change collapses this bridge: the CADS files move to `:root`
and the brand-scoped layers are deleted (see the `brandOverrides.css`
header for the plan).

### Selectors

| Selector                              | When active               |
| ------------------------------------- | ------------------------- |
| `:root, [data-theme='Light']`         | Light mode (default)      |
| `[data-theme='Dark']`                 | Dark mode                 |
| `[data-brand='codeai-next']:root, …`  | CADS ramp (default brand) |
| `[data-brand='codeai-audit']:root, …` | Pink audit ramp           |

Components should use **semantic** variables (e.g. `var(--background-neutral-primary)`) instead of primitive ones. The correct value is resolved automatically based on the active `data-theme` and `data-brand` attributes.

### Component-level brand overrides

Components write base styles against semantic tokens directly — there is
no per-brand fork to maintain. Earlier in the rebrand, components whose
CADS design diverged structurally from the legacy one carried a
`[data-brand='codeai-next']`-scoped SCSS block alongside their base
styles; those blocks are unwrapped into the base rules now that
codeai-next is the sitewide default. New work should not reintroduce the
pattern.

---

## Brand System

### How brand is determined

Brand resolution happens server-side, in `Cdo::Brand.current_brand_code`
(`lib/cdo/brand.rb`): the constant `codeai-next` unless
`brand-router-enabled` is on, in which case a `?brand=codeai-audit` URL
param or the `brand` cookie can override it per request. The result is
written to `data-brand` on `<html>` by `application.html.haml`.

`apps/src/util/brand.ts`'s `getCurrentBrand()` just reads that attribute
client-side, returning one of `'codeai-next' | 'codeai-audit'`, defaulting
to `'codeai-next'` if the attribute is absent or unrecognized.

The brand cookie is set by navigating with `?brand=codeai-audit` and cleared with `?brand-reset=1`.

### How brand affects rendering

| Mechanism                | What it does                                                           |
| ------------------------ | ---------------------------------------------------------------------- |
| `data-brand` on `<html>` | Activates the CSS variable overrides in the `brandOverrides.css` layer |
| `MuiThemeProvider`       | Swaps between `CodeaiTheme` and `CodeaiAuditTheme`                     |
| `SiteConfigProvider`     | Exposes brand to React components via `useBrand()` hook                |

### Accessing brand in components

```tsx
import {useBrand} from '@cdo/apps/util/SiteConfigContext';

const MyComponent = () => {
  const brand = useBrand(); // 'codeai-next' | 'codeai-audit'
  // ...
};
```

For non-React code, the brand can be read from the DOM:

```ts
document.documentElement.dataset.brand; // 'codeai-next' | 'codeai-audit' | undefined
```

### MUI Themes

| Theme              | File                      | Description                                                                               |
| ------------------ | ------------------------- | ----------------------------------------------------------------------------------------- |
| `CodeaiTheme`      | `./codeai/index.ts`       | Default theme, CADS brand-purple palette. Also exported as `CdoTheme` (deprecated alias). |
| `CodeaiAuditTheme` | `./codeai-audit/index.ts` | Hot-pink palette pairing with the pink audit CSS ramp                                     |

`CodeaiAuditTheme` inherits all typography and component style overrides from `CodeaiTheme` via `createTheme(CodeaiTheme, { palette: ... })`. Only the palette differs.

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
