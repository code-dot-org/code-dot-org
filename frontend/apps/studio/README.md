# @code-dot-org/studio

The shared React/TypeScript activity launcher for the CodeAI browser PWA and
installed mobile app. Both use the same application, catalog, TanStack Router
and design-system theme. Core initializes consent, localization and
observability before rendering. This entry does not fetch authentication or
require Rails.

```text
Studio React application
  |-- Browser: manifest + service worker cache
  `-- Mobile: Capacitor packages Studio's dist/
```

From `frontend/`:

```bash
yarn build --filter @code-dot-org/studio
yarn workspace @code-dot-org/studio dev
yarn workspace @code-dot-org/studio preview
yarn workspace @code-dot-org/studio test
```

The production PWA caches the local launcher HTML, JavaScript, styles, fonts
and icons. Its home screen can reopen offline after the first successful
load. Catalog images and hosted activities still require connectivity; this
does not provide offline curriculum. Service workers are disabled in Vite dev
mode, so use `preview` after a build to test caching.

The shared consent store defaults to strictly necessary categories when no
OneTrust source is supplied. This static host supplies no OneTrust or
observability configuration and does not enable optional telemetry.

Capacitor consumes `dist/` directly and the entry skips service-worker
registration on native platforms. Android integration and its website
navigation policy live in [Mobile](../mobile). The native completion URL
remains `/#finished=<course>`; TanStack Router reads that fragment and handles
Back to the launcher. The additional site-controls build retains the assets
used by the Android prototype's injected debug controls.

Local labs and a complete offline course player are future work.
