# Studio Architecture

## Rails integration

Studio is an SPA shell whose Vite assets are served under `/frontend-studio/`. The Dashboard can serve the shell at that mount for standalone development, and at the public `/projects/build-lab/...` route for Build Lab. The request flow is:

```
Browser → Rails catch-all route (`frontend-studio(/*path)` or `projects/build-lab(/*path)`)
        → FrontendStudioController#index
        → dashboard/app/views/frontend_studio/index.html.haml
            - injects Vite bundle via vite_typescript_tag 'application.tsx'
            - provides #vite-root mount point
        → entrypoints/application.tsx (React app boots)
```

The `/frontend-studio` prefix has one source of truth: `config/vite.json`'s `publicOutputDir`. `vite-plugin-ruby` reads it and sets Vite's `base` to `/frontend-studio/`, which determines (a) where Vite's dev server serves assets, (b) the URL prefix Vite bakes into asset references in the production manifest, and (c) the directory `public/frontend-studio/` where the production build lands. It is an asset and standalone-shell mount, not the public Build Lab URL.

In **Vite Rails mode** (preferred), `vite-plugin-rails` proxies asset requests from Rails to the Vite dev server on port 3036. Access the app at `http://localhost-studio.code.org:3000/frontend-studio/`.

In **standalone mode**, the Vite dev server runs independently of Rails at `http://localhost:3036/frontend-studio/`. Studio is designed to be independently deployable and testable without the backend.

In production, Vite build output is served as static files from `public/frontend-studio/`.

> **Note:** Studio currently returns 404 in production — it is pre-production / experimental only.

## Init ordering

`entrypoints/application.tsx` must call `initializeCore()` before rendering the router.

```
initializeCore()        ← must be first
await enableMocks()     ← if VITE_API_MODE=msw, starts the MSW worker
createRoot(...).render(
  <RouterProvider router={router} />   ← labs mount inside here
)
```

`enableMocks` is a no-op unless `VITE_API_MODE=msw`. When active, the service
worker (`public/mockServiceWorker.js`) must be running before any fetch
fires, so the await is load-bearing. Per-lab fixtures register lazily from
the route loader (`getLabFixtures` + `registerLabFixtures` +
`setActiveScenario`) using the URL's `channelId` slot as the fixture tag to
select what kind of level data should be mocked.

## Routing

Route files in `src/routes/` declare public paths (e.g. `/projects/$labType/$channelId/edit`) with no surrounding prefix. `src/modules/router/index.ts` uses `/frontend-studio` as the basepath only for the standalone shell; when Rails serves Build Lab at `/projects/build-lab/...`, the router uses the public path directly.

Build Lab creation is the first Studio-owned project lifecycle path. The
`/projects/build-lab/new` route calls `POST /api/v1/build_lab/projects`, then
redirects to the shared `$labType/$channelId/edit` route. The API creates the
channel with the existing `ChannelToken` and `Projects` storage services; the
lab initializes and saves its `main.json` source after it mounts.

## Route tree (auto-generated)

TanStack Router's Vite plugin (`tanstackRouter({ autoCodeSplitting: true })`) scans `src/routes/` and writes `src/routeTree.gen.ts` on every build and `yarn dev` start. **Never edit `routeTree.gen.ts` by hand** — changes are overwritten. Add or rename files in `src/routes/` to change the route tree.

## Lab lazy-load boundary

Each lab is a separate Vite chunk, loaded when the user navigates to a public `/projects/:labType/:channelId/edit` or `/view` route, or the equivalent standalone `/frontend-studio/projects/...` route:

```
Studio bundle (loaded on first visit to /frontend-studio)
└── projects/$labType/$channelId/{edit,view} route loader
    └── getLabEntrypoint(labType)
        └── lazy(() => import('@code-dot-org/music-lab'))  ← separate chunk, fetched on demand
```

The route loader calls `getLabEntrypoint` to resolve the lazy component, then throws `notFound()` if the lab type is unregistered. The route component wraps the result in `<Suspense>`.

The route also passes the URL's `$channelId` to the lab entrypoint. Labs that
own project documents use that identifier to read and write channel sources;
the identifier is a host contract, not a route-global singleton.

## React singleton

Labs externalize React and expect the host to provide it. Studio's `vite.config.ts` pins `react` and `react-dom` to the workspace root `node_modules/` via resolver aliases:

```typescript
resolve: {
  alias: {
    react: path.resolve(workspaceRoot, 'node_modules/react'),
    'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
  },
}
```

This prevents multiple React instances when a lab chunk is loaded, which would break hooks.

## Constraints and failure modes

| Constraint                                                 | Failure if violated                                     |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| `routeTree.gen.ts` not edited by hand                      | Hand edits overwritten by next build                    |
| Lab registered in both `labs.ts` and `getLabEntrypoint.ts` | Route throws `notFound()`                               |
| Lab registered in `getLabFixtures.ts` (MSW mode only)      | Fixture tag is ignored; MSW handlers use defaults       |
| React/React-DOM aliases pinned to workspace root           | Multiple React instances; hooks throw                   |
| `entrypoints/application.tsx` mounts to `#vite-root`       | Rails template provides this div; mismatch = blank page |

See [AGENTS.md](../AGENTS.md) for update triggers.
