# `componentLibrary/footer`

## Status

This footer has no users in the legacy dashboard or in the `apps/` directory.

The legacy dashboard is the current production site at studio.code.org. It builds its footer from HAML (a Rails template format) and injected JavaScript. The `apps/` directory holds the older lab code. Neither uses this footer today.

This footer does run in `frontend/apps/studio`, an experimental app.

## What This Means For You

You do not need to update this footer when you change the legacy dashboard footer.

You can ignore this footer for now.

If a change is easy to make in both footers, make it in both. This keeps the two footers close. It does not block your other work.

## Consuming This Component

This package exports one component: [Footer](Footer.tsx). Import it like this:

```javascript
import Footer from '@code-dot-org/component-library/footer';
```

## Plan

The team will compare this footer against the legacy dashboard footer before this component goes to Production. This comparison is the parity analysis. The parity analysis will list the work that remains. Until the parity analysis is done, do not treat this footer as a replacement for the legacy dashboard footer.

## More Information

See [Storybook](https://code-dot-org.github.io/code-dot-org/component-library-storybook) for usage examples.

Ask questions in `#ask-design-system`.
