# `componentLibrary/tooltip`

## Which one to use

| Component                          | Built on                        | Notes                                 |
| ---------------------------------- | ------------------------------- | ------------------------------------- |
| MUI `Tooltip`                      | MUI `Tooltip` + `CdoTheme`      | Use this for new code.                |
| [`WithTooltip`](./WithTooltip.tsx) | our own SCSS + positioning code | Still what most of the codebase uses. |

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
Lab ones included. This is the first step of the migration; `WithTooltip` and
its callers are unchanged.

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

MUI defaults to `placement="bottom"`, where the legacy tooltip defaulted to
`direction="onTop"`. A call site moved over from the legacy tooltip that never
set a direction needs an explicit `placement="top"`, or the tooltip quietly
moves.

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

## `WithTooltip`

This package exports following styled React
components: [WithTooltip](./WithTooltip.tsx), [LegacyTooltip](./_Tooltip.tsx), [TooltipOverlay](./_Tooltip.tsx).

`WithTooltip` is a recommended way to use a tooltip. It wraps `TooltipOverlay` and `LegacyTooltip` components and provides a
way to add tooltip to any element, handles all the logic behind showing and hiding, positioning and accessibility of the
tooltip.

**_Here's a recommended way_** to use `WithTooltip` component and adding Tooltips where needed in general:

```javascript
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

const ComponentWithTooltip = () => (
  <WithTooltip tooltipProps={tooltipProps}>
    <button>Hover over me</button>
  </WithTooltip>
);
```

Please note that it's required that `children` prop/component of `WithTooltip` component will be a single element
and will support adding `aria-describedBy` attribute to it.

---

For guidelines on how to use these components and the features they
offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go
to [Design System / Tooltip / WithTooltip](http://localhost:6006/?path=/story/designsystem-tooltip-withtooltip--default-tooltip).

---

##### Custom usage of `LegacyTooltip` and `TooltipOverlay` components is not recommended, but still possible.

If you'll need to use `LegacyTooltip` and `TooltipOverlay` for some custom behavior, you can do it, just remember that you'll
need to handle all the logic with showing and hiding, positioning and some accessibility aspects of the tooltip
yourself.

In order to add tooltip to some element, you need to wrap it with TooltipOverlay component and add LegacyTooltip component
inside it. You'll need to provide `tooltipId` prop to LegacyTooltip component and `aria-describedby` prop to the element
you want to add tooltip to.

You can import it like this:

```javascript
import {
  LegacyTooltip,
  TooltipOverlay,
} from '@code-dot-org/component-library/tooltip';
import moduleStyles from './styles.module.scss'; // some scss module with tooltip positioning styles

const ComponentWithTooltip = () => {
  // Handle showing and hiding of the tooltip via state or with the help of scss styles
  return (
    <TooltipOverlay>
      <button aria-describedby="tooltip1">Hover over me</button>
      <LegacyTooltip
        tooltipId="tooltip1"
        text="This is a tooltip"
        className={moduleStyles.customTooltipStyles}
      />
    </TooltipOverlay>
  );
};
```
