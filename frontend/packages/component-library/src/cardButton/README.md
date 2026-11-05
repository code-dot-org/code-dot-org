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
unless `iconStyle` says otherwise. For a custom leading visual, such as an
avatar, pass `startContent`; it replaces `startIcon`, is never smaller than the
icon box, and keeps its own colors in every state.

## Selection

`selected` gives the card selected chrome. On a button, a boolean `selected`
also sets `aria-pressed`, which is right for a toggle or a single-select group
of cards. Leave `selected` undefined on plain action or navigation cards, and on
links, which never get `aria-pressed`.

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

## Known difference from Figma

Chrome rounds font ascent and descent to whole pixels; Figma does not. Where the
rounded sum is odd (Geist at 16px, Font Awesome at 18px and 20px), Chrome draws
the glyphs 1px higher than Figma inside the same line box. Boxes, padding and
colors are exact.
