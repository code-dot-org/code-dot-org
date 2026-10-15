# `componentLibrary/tabs`

## Consuming This Component

This package exports one styled React component: [Tabs](Tabs.tsx). You can import it like this:

```javascript
import Tabs from '@code-dot-org/component-library/tabs';
```

## Overflowing tab strips

By default the tab strip lays out at its natural width and a narrow container clips or
wraps it. Pass `scrollable` to make the strip a horizontal scroller instead:

```javascript
<Tabs scrollable name="account-settings" tabs={tabs} /* ... */ />
```

The native scrollbar is hidden. In its place, whichever edge is hiding tabs fades the
clipped tab out through a `mask-image`, tracked in CSS alone: scroll-driven animations
(`animation-timeline: scroll(self inline)` + `animation-range`) widen each fade zone
over the first/last 2rem of the strip's own scroll range.

Scroll-state container queries (`@container scroll-state(scrollable: right)`) express the
same thing at a higher level, but as of 2026 they are Chromium-only (133+) while scroll
timelines have shipped cross-browser — switching would regress Firefox and Safari.

No JS is involved and `scrollable` adds only a class, no extra DOM. Browsers without
scroll timelines (Chrome <115) degrade to a scrollable strip with no edge cue.

The fade suits touch scrolling and keyboard (every tab button is natively focusable,
Tab walks through them, and focusing a clipped tab scrolls it into view). A mouse has
no way to scroll the strip — the scrollbar is hidden and wheels scroll vertically — so
desktop layouts should keep the strip from clipping in the first place: `min-width:
max-content` on the tabs container behind a `(hover: hover) and (pointer: fine)` media
query lets the window's own scrollbar take over, and with no clipping there is no fade.

Because the fade is a mask, it works over any page background. Its edges are physical
left/right: RTL is not handled.

For guidelines on how to use these components and the features they offer, [visit Storybook](https://code-dot-org.github.io/dsco_)
(link to be updated once code-dot-org storybook will be public.).
Or run storybook locally and go to [Design System / Tabs](http://localhost:9001/?path=/story/designsystem-tabs--default-tabs).
