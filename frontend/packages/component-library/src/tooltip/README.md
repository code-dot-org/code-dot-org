# `componentLibrary/tooltip`

There is one tooltip: MUI's, styled by `CdoTheme`. The DSCO components
(`WithTooltip`, `LegacyTooltip`, `TooltipOverlay`) are gone; this directory
ships only `keyboardOnlyTooltipProps`.

Import `Tooltip` straight from `@mui/material`; the `MuiTooltip` entry in
[`styleOverrides/tooltip.ts`](../themes/code.org/styleOverrides/tooltip.ts) (on
`CdoTheme`) styles and configures it, the way `Button` and `Breadcrumbs` work.

```tsx
import {Tooltip} from '@mui/material';

const RunButton = () => (
  <Tooltip title="Runs your program">
    <IconButton aria-label="Run" onClick={run}>
      <FontAwesomeV6Icon iconName="play" iconStyle="solid" />
    </IconButton>
  </Tooltip>
);
```

The override is **global** — it styles every MUI tooltip in the app, the Sketch
Lab ones included.

A component that takes tooltip settings as data rather than rendering the
tooltip itself (`_Tab`, `apps` `WithConditionalTooltip`) types them as
`Omit<TooltipProps, 'children'>` from `@mui/material` — it supplies the child
itself. There is no design-system descriptor type any more.

### What the theme sets

The theme sets two defaults via `defaultProps`:

- `arrow` defaults to `true` — design system tooltips have a tail. Pass
  `arrow={false}` to drop it.
- `describeChild` defaults to `true`, so the text becomes `aria-describedby` on
  the trigger rather than an `aria-label`. **The trigger must carry its own
  accessible name** — the tooltip doesn't supply one.

The bubble is one fixed size (the CADS spec drops size options). Text metrics
come from the theme's `body3` variant; the border-radius and shadow from the
CADS `--shape-sm` and `--shadow-md` tokens.

### Keyboard-only tooltips

```tsx
import {keyboardOnlyTooltipProps} from '@code-dot-org/component-library/tooltip';

<Tooltip title="Delete this file" {...keyboardOnlyTooltipProps}>
```

Spreading `keyboardOnlyTooltipProps` (`disableHoverListener` +
`disableTouchListener`) makes the tooltip open only when the trigger is tabbed
to, never on hover or touch. MUI already gates focus-opening on
`:focus-visible`, so switching off hover and touch is the whole behavior. Use it
for a hint a mouse user doesn't need but a keyboard user has no other way to get.

### A leading icon

Compose a leading icon into `title`; the theme sizes it:

```tsx
<Tooltip
  title={
    <>
      <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
      More information
    </>
  }
>
```

### Placement

Placement stays MUI's centered `bottom`. Pass `placement="bottom-start"` (or
another `-start`/`-end`) when the bubble should line up with the trigger edge;
the theme pins the caret to that edge. A call site moved over from the legacy
tooltip that never set a direction still needs an explicit `placement="top"` if
it used to sit above the trigger.

In a right-to-left locale, `-start`/`-end` placements mirror and plain
`left`/`right` stay put, matching MUI. This comes free once `CdoTheme` is given
a `direction` — a follow-up, since setting it flips every MUI popper in the app
and those haven't been checked in RTL yet.

### `data-theme`

MUI renders the tooltip in a portal on `document.body`, so it doesn't inherit a
surrounding `data-theme` subtree. Pass it through `slotProps` when needed:

```tsx
<Tooltip title="…" slotProps={{tooltip: {'data-theme': 'Dark'}}}>
```

(Or, as a follow-up, the bubble could use `-fixed` tokens and stop caring about
the surrounding theme at all.)
