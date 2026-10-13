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

Below 992px the widget shows only the bubble marked `aria-current`, which
`ProgressBubble` sets when `isActive` is true.

Design: CADS Figma file, "Header" page, "Progress Widget" and
"Progress Bubbles" components.
