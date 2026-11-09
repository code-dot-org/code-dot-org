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
the scroll axes: top or bottom scrolls vertically, left or right horizontally.
The ref is the scrolling element, for `scrollTo` and the like.

## Fading

The scroller's content fades to transparent through a `mask-image`, so the
fade needs no color and works over any background. Solid strips in the mask
keep the scrollbars unfaded. Put borders on the root, not the scroller.
Overlay scrollbars, like macOS's, take no space to measure, so
their thumb fades with the content at a fading edge.

The root clips its content to its own rounded corners.

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

A labelled tab stop is announced as a region. An unlabelled one logs a
warning. A `tabIndex` or `role` in `scrollerProps` overrides the automatic
one.

For guidelines on how to use this component and the features it
offers, [visit Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook/?path=/docs/designsystem-scrollfade--docs).
Or run storybook locally and go
to [Design System / ScrollFade](http://localhost:6006/?path=/docs/designsystem-scrollfade--docs).
