# `componentLibrary/cardButton`

A clickable card for actions, navigation and choices that need more presence
than a Button: a leading icon, a title, optional supporting text and an
optional trailing icon. Built on MUI
[`ButtonBase`](https://mui.com/material-ui/api/button-base/), so it is a real
`<button>` (or `<a>` with `href`) with MUI's keyboard focus handling.

Figma: Card Button `17848:283` in "CodeAI Design System (CADS)".

```jsx
import CardButton from '@code-dot-org/component-library/cardButton';

<CardButton
  title="Help me create a plan for my idea"
  startIcon={{iconName: 'lightbulb'}}
  endIcon={{iconName: 'chevron-right'}}
  onClick={startPlan}
/>;
```

## Layout and size

- `layout="horizontal"` (default): a list row. Icon, text, optional end icon.
- `layout="vertical"`: a centered tile for side-by-side choices. It has no end
  icon; an `endIcon` passed to a vertical card is not rendered.
- `size`: `medium` (default) or `small`.

The card hugs its content, like a Button. Pass `fullWidth` to fill the
container, e.g. for a stack of rows or equal-width tiles in a grid.

## Icons and start content

`startIcon` and `endIcon` take `FontAwesomeV6Icon` props and render solid
unless `iconStyle` or `iconFamily` says otherwise. For a custom leading visual, such as an
avatar, pass `startContent`; it replaces `startIcon`, is never smaller than the
icon box, keeps its own colors in every state, and fades when the card is
disabled.

## Selection

`selected` gives the card selected chrome. Leave it undefined on plain action
or navigation cards. A boolean `selected` also tells assistive technology:

- On a button it sets `aria-pressed`, for a toggle or a set of mode buttons.
- On a link it sets `aria-current` when true, for the current item in a list
  of links.

```jsx
<div role="group" aria-label="Mode">
  {modes.map(mode => (
    <CardButton
      key={mode.value}
      layout="vertical"
      title={mode.title}
      startIcon={{iconName: mode.icon}}
      selected={value === mode.value}
      onClick={() => setValue(mode.value)}
    />
  ))}
</div>
```

A single choice that is part of a form is a radio group. Pass `role="radio"`
and `aria-checked`; with a `role`, the card sets no state attribute of its own.
The radio group pattern gives the group one tab stop and moves between cards
with the arrow keys; the container owns that.

```jsx
<div role="radiogroup" aria-label="Mode">
  {modes.map(mode => (
    <CardButton
      key={mode.value}
      role="radio"
      aria-checked={value === mode.value}
      selected={value === mode.value}
      tabIndex={value === mode.value ? 0 : -1}
      title={mode.title}
      onClick={() => setValue(mode.value)}
    />
  ))}
</div>
```

## Figma mapping

| Figma property                    | Code                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `layout`                          | `layout`                                                                     |
| `size`                            | `size`                                                                       |
| `selected`                        | `selected`                                                                   |
| `state`                           | Design only. Hover, pressed and focus come from CSS; disabled is `disabled`. |
| `title`, `description`            | `title`, `description`                                                       |
| `showDescription`                 | Presence of `description`                                                    |
| `startIcon`, `startIconName`      | `startIcon`                                                                  |
| `hasStartContent`, `startContent` | `startContent`                                                               |
| `endIcon`, `endIconName`          | `endIcon`                                                                    |
