# `componentLibrary/progressWidget`

The site header's progress widget: a lesson menu button, a save status icon,
one `ProgressBubble` per level, and an action slot for the Continue button.

```javascript
import ProgressWidget, {
  ProgressBubble,
} from '@code-dot-org/component-library/progressWidget';
```

Both components only draw. Labels, tooltips and handlers arrive as props;
the caller maps its own level data onto `levelType` and `status`.

Rules for callers:

- Pass the bubbles as direct children of `ProgressWidget`. Below 992px the
  widget shows only the bubble marked `aria-current` (set by `isActive`); if
  none is, it shows them all.
- `ariaLabel` must carry what the color and star show, e.g. "Level 4,
  assessment, completed": they are not announced.
- A tooltip that repeats `ariaLabel` is not read twice; one that adds to it
  is read as a description.
- An `onClick` that calls `preventDefault` on a link bubble should first let
  modified clicks (Cmd, Ctrl, middle button) through to the `href`.
- A save status other than `'none'` needs `saveStatusLabel`. Failed and
  offline saves are announced; saving and saved are not, because autosave
  repeats them constantly.
- The bubbles are 12px, under the 24px minimum target size; the lesson menu
  is the larger route to every level.

Design: CADS Figma file, "Header" page, "Progress Widget" and
"Progress Bubbles" components.
