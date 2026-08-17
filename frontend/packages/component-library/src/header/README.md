# `componentLibrary/header`

## Status

This header has no users in the legacy dashboard or in the `apps/` directory.

The legacy dashboard is the current production site at studio.code.org. It builds its header from HAML (a Rails template format) and injected JavaScript. The `apps/` directory holds the older lab code. Neither uses this header today.

This header does run in `frontend/apps/studio`, an experimental app.

## What This Means For You

You do not need to update this header when you change the legacy dashboard header.

You can ignore this header for now.

If a change is easy to make in both headers, make it in both. This keeps the two headers close. It does not block your other work.

## Consuming This Component

This package exports one component: [Header](Header.tsx). Import it like this:

```javascript
import Header from '@code-dot-org/component-library/header';
```

## Plan

The team will compare this header against the legacy dashboard header before this component goes to Production. This comparison is the parity analysis. The parity analysis will list the work that remains. Until the parity analysis is done, do not treat this header as a replacement for the legacy dashboard header.

## More Information

See [Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook) for usage examples.

Ask questions in `#ask-design-system`.
