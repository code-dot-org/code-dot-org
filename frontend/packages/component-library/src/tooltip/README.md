# `componentLibrary/tooltip`

## Which one to use

| Component                          | Built on                        | Notes                                 |
| ---------------------------------- | ------------------------------- | ------------------------------------- |
| [`Tooltip`](./Tooltip.tsx)         | MUI `Tooltip` + `CdoTheme`      | Use this for new code.                |
| [`WithTooltip`](./WithTooltip.tsx) | our own SCSS + positioning code | Still what most of the codebase uses. |

`Tooltip` is the first step of the tooltip migration to MUI. It is not yet a
drop-in replacement for `WithTooltip` — the spacing has not had a design pass
(see below) — so existing `WithTooltip` callsites stay put for now.

Earlier migrations (`Button`, `Breadcrumbs`, `Typography`) added theme overrides
and left it at that, so callers import from `@mui/material` directly. This one
also ships a small wrapper component, because `keyboardOnly` and `iconName` are
behavior, and a theme override can only supply styles.

Two naming wrinkles while both exist: `TooltipProps` refers to the **legacy**
component, so the new one's props are `CdoTooltipProps`; the legacy component is
exported as `LegacyTooltip`. Both become the obvious names once `WithTooltip`
retires.

## `Tooltip`

```javascript
import {Tooltip} from '@code-dot-org/component-library/tooltip';

const RunButton = () => (
  <Tooltip title="Runs your program" size="s">
    <IconButton aria-label="Run" onClick={run}>
      <FontAwesomeV6Icon iconName="play" iconStyle="solid" />
    </IconButton>
  </Tooltip>
);
```

Props are MUI's [`TooltipProps`](https://mui.com/material-ui/api/tooltip/) —
`title`, `placement`, `arrow`, `open`, and the rest — plus a few of ours:

- `size` (`'xs' | 's' | 'm' | 'l'`, default `'m'`) picks the design system size.
  MUI has no size prop of its own.
- `hasCaret` (`boolean`) is our name for MUI's `arrow` — the pointing caret. It
  defaults to `true` via the theme and, when set, wins over a caller's `arrow`.
  Pass `hasCaret={false}` to drop the caret.
- `iconName` (`string`) renders a leading Font Awesome icon before the text,
  sized per `size` by the theme. Omit it when there's no icon.
- `keyboardOnly` (default `false`) — see below.
- `data-theme` — pass it when the trigger sits inside a `data-theme` subtree.
  MUI renders the tooltip in a portal on `document.body`, so it does not
  otherwise inherit the surrounding theme.

Two MUI defaults are flipped, on this component only:

- `arrow` defaults to `true`. Design system tooltips have tails; MUI's do not.
- `describeChild` defaults to `true`, so the text becomes `aria-describedby` on
  the trigger rather than an `aria-label`. The trigger must carry its own
  accessible name — the tooltip no longer supplies one.

### `keyboardOnly`

```javascript
<Tooltip title="Delete this file" keyboardOnly>
```

The tooltip then appears only when the trigger is reached by keyboard. Hover and
touch do nothing. Use it for hints that would be noise for a mouse user — an
icon whose meaning is already clear in context — but are the only way a keyboard
user learns what the control does.

The implementation is two props, because MUI's `Tooltip` already checks
`:focus-visible` before opening on focus. Switching off the hover and touch
listeners is the whole behavior: a click that moves focus to the trigger leaves
the tooltip shut, a Tab to it opens it. Escape closes it either way.

`keyboardOnly` is applied after the caller's own props, so it beats an explicit
`disableHoverListener={false}` rather than being silently overridden.

### Styling

Styling lives in the `MuiTooltip` theme override
([src/themes/code.org/styleOverrides/tooltip.ts](../themes/code.org/styleOverrides/tooltip.ts)),
as it does for every other component migrated to MUI. Text metrics come from the
theme's `body1`–`body4` variants rather than being restated here.

Unlike those other migrations, every rule is marked with a `data-cdo-tooltip`
attribute that only this component sets. Sketch Lab already uses bare MUI
tooltips, and a global override would restyle them; the earlier migrations had no
such callsites to disturb, because nothing used MUI `Button` or `Breadcrumbs`
before their overrides landed.

`size` travels as a `data-size` attribute on the same element, rather than as a
prop the theme reads off `ownerState` the way `breadcrumbs.ts` does. MUI's
Tooltip copies props it doesn't recognise onto the trigger, so a `size` prop
lands on the trigger too — and an MUI trigger such as `IconButton` has its own
`size`, which ours would override and shrink. Breadcrumbs has no such trigger to
clone onto.

Both the mark and the flipped defaults are temporary. Once `WithTooltip` retires
and every tooltip in the repo is this one, the override can go global and the
attribute can go away.

Spacing between tooltip and trigger is left at MUI's defaults, which are a
little looser than the SCSS tooltip's. Worth a design pass before this replaces
`WithTooltip` outright.

### Right-to-left

`placement="bottom-start"` opens from the right edge in a right-to-left locale,
and the other three `-start`/`-end` placements mirror the same way. Plain `left`
and `right` do not, matching MUI: physical placements stay physical. The SCSS
tooltip mirrored its `onLeft`/`onRight` instead, so when moving a callsite over,
pick `-start`/`-end` if the side was meant to follow the text.

Nothing in the tooltip's own styles needs flipping. The padding is horizontally
symmetric, and the leading icon is placed with flexbox, which already follows
the text direction.

The mirroring is done in `Tooltip.tsx`, off `<html dir>`, which the server sets
from the locale. MUI can do this itself, but only from `theme.direction`, and
`CdoTheme` sets no direction — giving it one would mirror every MUI popper in
the app, which is a bigger change than this component wants to make. The
tooltip checks `theme.direction` first and stops mirroring if it is ever set, so
the two can't cancel out.

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
