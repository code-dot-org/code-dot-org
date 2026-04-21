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
│  1. Resolves brand from cookie  ──→  brand.ts               │
│  2. Sets <html data-brand="codeai">  (CSS variable swap)    │
│  3. Selects MUI theme  ──→  CdoTheme or CodeaiTheme         │
│  4. Wraps component tree:                                   │
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

### Selectors

| Selector                                                                | When active              |
| ----------------------------------------------------------------------- | ------------------------ |
| `:root, [data-theme='Light']`                                           | Light mode (default)     |
| `[data-theme='Dark']`                                                   | Dark mode                |
| `[data-brand='codeai']:root, [data-brand='codeai'][data-theme='Light']` | CodeAI brand, light mode |
| `[data-brand='codeai'][data-theme='Dark']`                              | CodeAI brand, dark mode  |

Components should use **semantic** variables (e.g. `var(--background-neutral-primary)`) instead of primitive ones. The correct value is resolved automatically based on the active `data-theme` and `data-brand` attributes.

---

## Brand System

### How brand is determined

Brand is resolved at page load in `apps/src/util/brand.ts`:

1. Check the `brand-router-enabled` DCDO flag — if off, always return `'code'` (default).
2. Read the `brand` cookie (set server-side by `application_controller#persist_brand_params`).
3. Return `'codeai'` if the cookie matches, otherwise `'code'`.

The brand cookie is set by navigating with `?brand=codeai` and cleared with `?brand-reset=1`.

### How brand affects rendering

| Mechanism                | What it does                                                    |
| ------------------------ | --------------------------------------------------------------- |
| `data-brand` on `<html>` | Activates CSS variable overrides in `colors.css`                |
| `MuiThemeProvider`       | Swaps between `CdoTheme` and `CodeaiTheme` (palette difference) |
| `SiteConfigProvider`     | Exposes brand to React components via `useBrand()` hook         |

### Accessing brand in components

```tsx
import {useBrand} from '@cdo/apps/util/SiteConfigContext';

const MyComponent = () => {
  const brand = useBrand(); // 'code' | 'codeai'
  // ...
};
```

For non-React code, the brand can be read from the DOM:

```ts
document.documentElement.dataset.brand; // 'codeai' | undefined
```

### MUI Themes

| Theme         | File                  | Description                                  |
| ------------- | --------------------- | -------------------------------------------- |
| `CdoTheme`    | `./code.org/index.ts` | Default Code.org theme with purple palette   |
| `CodeaiTheme` | `./codeai/index.ts`   | Deep-merges CdoTheme, overrides palette only |

`CodeaiTheme` inherits all typography and component style overrides from `CdoTheme` via `createTheme(CdoTheme, { palette: ... })`. Only the palette differs.

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
