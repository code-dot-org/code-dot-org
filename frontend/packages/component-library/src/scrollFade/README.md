# `componentLibrary/scrollFade`

## Consuming This Component

This package exports one styled React component: [ScrollFade](ScrollFade.tsx).
You can import it like this:

```javascript
import ScrollFade from '@code-dot-org/component-library/scrollFade';
```

```tsx
<ScrollFade edges={['left', 'right']} fadeSize="1.5rem">
  {chips}
</ScrollFade>
```

`ScrollFade` must be given a size, or a flex or grid slot, before its content
can overflow. Each edge in `edges` fades while there is more content past it.
Edges are physical, so `left` means the left edge in RTL too. They also pick
the scroll axes: top or bottom scrolls vertically, left or right horizontally,
and the other axis is clipped. With no edges it does not scroll.
The ref is the scrolling element, for `scrollTo` and the like. The root never
scrolls, so `onScroll` and labels go in `scrollerProps`.

## Fading

The scroller's content fades to transparent through a `mask-image`, so the
fade needs no color and works over any background. Solid strips in the mask
keep the scrollbars unfaded. Put borders on the root, not the scroller.
Overlay scrollbars, like macOS's, take no space to measure, so
their thumb fades with the content at a fading edge.

The root clips its content to its own rounded corners.

Browser support: the unprefixed `mask-*` properties need Chrome 120+, Safari
15.4+ or Firefox 53+. The 100ms ease needs `@property` (Chrome 85+, Safari
16.4+, Firefox 128+); without it the fade still shows, at once. The focus ring
on the root needs `:has()`; without it the scroller draws the ring just inside its own edge.

A fade eases in over 100ms, or at once under `prefers-reduced-motion`.

The mask clips whatever lies outside the scroller, and fades anything at an
edge, focus rings included. Give focusable content some padding.

## Keyboard and screen readers

A scroller that overflows and holds no focusable content becomes a tab stop,
so keyboard users can scroll it. Its focus ring is drawn on the root, since
the mask would clip one on the scroller. Label it through `scrollerProps`:

```tsx
<ScrollFade scrollerProps={{'aria-label': 'Release notes'}}>…</ScrollFade>
```

A scroller with a label is announced as a region while it overflows, with or
without focusable content; the label is left off otherwise, since a generic
element cannot be named. An unlabelled tab stop logs a warning. A `tabIndex` or
`role` key in `scrollerProps`, even set to `undefined`, overrides the automatic
one. Disabled and hidden controls do not count as focusable content.

For guidelines on how to use this component and the features it
offers, [visit Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook/?path=/docs/designsystem-scrollfade--docs).
Or run storybook locally and go
to [Design System / ScrollFade](http://localhost:6006/?path=/docs/designsystem-scrollfade--docs).
