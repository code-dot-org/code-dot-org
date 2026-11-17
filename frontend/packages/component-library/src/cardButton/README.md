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
  icon; passing `endIcon` with it is a type error.
- `size`: `medium` (default) or `small`.

The card hugs its content, like a Button. Pass `fullWidth` to fill the
container, e.g. for a stack of rows or equal-width tiles in a grid.

## Icons and start content

`startIcon` and `endIcon` take `FontAwesomeV6Icon` props and render solid
unless `iconStyle` or `iconFamily` says otherwise. Icons are not mirrored in
right-to-left layouts; pass `chevron-left` instead of `chevron-right` there.

`startIconColor` recolors the start icon, e.g. to tell cards in a group apart.
It takes any CSS color; prefer a semantic token such as
`var(--text-success-primary)`, and keep 3:1 contrast against the card. Selected
and disabled cards ignore it and use their own icon color.

For a custom leading visual, such as an avatar, pass `startContent` in place of
`startIcon`. It is never smaller than the icon box, keeps its own colors in
every state, and fades when the card is disabled. It must be decorative and
non-interactive: an interactive element inside a `<button>` is invalid.

## Accessible name

The title is the card's accessible name and the description is its accessible
description, so a list of cards reads as its titles. Passing `aria-label` or
`aria-labelledby` replaces both.

## Links

`href` renders an `<a>`. A disabled card drops `href`, `target` and `rel` and
renders a disabled `<button>`, which assistive technology cannot activate.

## Selection

`selected` gives the card selected chrome. Leave it undefined on plain action
or navigation cards. A boolean `selected` also tells assistive technology:

- On a button it sets `aria-pressed`, for a toggle or a set of mode buttons.
- On a link it sets `aria-current="true"` when true, for the current item in a
  list of links. Pass `aria-current="page"` or `"step"` to be more specific;
  an explicit `aria-pressed` or `aria-current` always wins.
  A disabled link keeps the link semantics above, even though it renders a button.

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
The group has one tab stop, the checked card or the first card when none is
checked, and the arrow keys move and check. The container owns that:

```jsx
const ARROW_STEP = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1};

function ModePicker({modes, value, setValue}) {
  const refs = useRef([]);
  const checked = modes.findIndex(mode => mode.value === value);
  const tabStop = checked === -1 ? 0 : checked;

  const onKeyDown = event => {
    const step = ARROW_STEP[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (tabStop + step + modes.length) % modes.length;
    setValue(modes[next].value);
    refs.current[next].focus();
  };

  return (
    <div role="radiogroup" aria-label="Mode" onKeyDown={onKeyDown}>
      {modes.map((mode, i) => (
        <CardButton
          key={mode.value}
          ref={el => (refs.current[i] = el)}
          role="radio"
          aria-checked={i === checked}
          selected={i === checked}
          tabIndex={i === tabStop ? 0 : -1}
          title={mode.title}
          onClick={() => setValue(mode.value)}
        />
      ))}
    </div>
  );
}
```

Right-to-left layouts swap `ArrowLeft` and `ArrowRight`.

## Figma mapping

| Figma property                    | Code                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `layout`                          | `layout`                                                                     |
| `size`                            | `size`                                                                       |
| `selected`                        | `selected`                                                                   |
| `state`                           | Design only. Hover, pressed and focus come from CSS; disabled is `disabled`. |
| `title`, `description`            | `title`, `description`                                                       |
| `showDescription`                 | Presence of `description`                                                    |
| `startIcon`, `startIconName`      | `startIcon`; color override is `startIconColor` (code only)                  |
| `hasStartContent`, `startContent` | `startContent`                                                               |
| `endIcon`, `endIconName`          | `endIcon`                                                                    |
