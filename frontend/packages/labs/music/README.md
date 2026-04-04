# @code-dot-org/music-lab

Music Lab is a standalone React app delivering Code.org's Music Lab curriculum experience. It is consumed by the Studio app (`apps/studio`), which lazy-loads it as a separate bundle at the route `/app/projects/music/:channelId/edit`.

## Dashboard API

Use `DashboardApiClient` from `@code-dot-org/core/api` for all Rails backend calls. `initializeCodeStudioConfig()` is called by Studio before the lab renders, so the client is ready on first render — no manual init needed inside the lab.

```typescript
import {DashboardApiClient} from '@code-dot-org/core/api';

const levelProps = await DashboardApiClient.labs.levels.getLevelProperties({
  levelId,
});
```

## Site configuration

`CodeStudioConfig` from `@code-dot-org/core` provides environment-aware values (dashboard URL, brand, etc.). Do not use `import.meta.env` — it produces per-environment bundles.

```typescript
import {CodeStudioConfig} from '@code-dot-org/core';

const url = CodeStudioConfig.dashboardApiUrl;
```

## Standalone dev server

The package includes `src/main.tsx` and `index.html` for running in isolation:

```bash
yarn dev   # from frontend/packages/labs/music/
```

This starts Vite at `http://localhost-studio.code.org:5173`. The dev server requires `initializeCodeStudioConfig()` to be called — see `src/main.tsx`.

## Studio integration

Music Lab exports a single default React component. Studio registers it as a lazy-loaded route entry. See [docs/architecture.md](./docs/architecture.md) for the registration pattern and init ordering constraints.
