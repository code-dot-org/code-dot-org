# Studio Architecture

## Rails integration

Studio is an SPA shell served under the `/frontend-studio/` URL prefix in every mode. The request flow:

```
Browser → Rails catch-all route (get "frontend-studio(/*path)")
        → FrontendStudioController#index
        → dashboard/app/views/frontend_studio/index.html.haml
            - injects Vite bundle via vite_typescript_tag 'application.tsx'
            - provides #vite-root mount point
        → entrypoints/application.tsx (React app boots)
```

The `/frontend-studio` prefix has one source of truth: `config/vite.json`'s `publicOutputDir`. `vite-plugin-ruby` reads it and sets Vite's `base` to `/frontend-studio/`, which determines (a) where Vite's dev server serves the SPA, (b) the URL prefix Vite bakes into asset references in the production manifest, and (c) the directory `public/frontend-studio/` where the production build lands. The Rails catch-all route and the TanStack Router `basepath` both use the same string.

In **Vite Rails mode** (preferred), `vite-plugin-rails` proxies asset requests from Rails to the Vite dev server on port 3036. Access the app at `http://localhost-studio.code.org:3000/frontend-studio/`.

In **standalone mode**, the Vite dev server runs independently of Rails at `http://localhost:3036/frontend-studio/`. Studio is designed to be independently deployable and testable without the backend.

Deployed environments do not build Studio. `package:studio` unpacks a prebuilt tarball into `dashboard/public/studio-package` and points the `dashboard/public/frontend-studio` symlink at it, so `ActionDispatch::Static` serves the files. Rails reads the Vite manifest from that same served directory (`VITE_RUBY_PUBLIC_DIR` in `dashboard/config/application.rb`), so the asset tags it renders always name files that are on disk. See the [README](../README.md) for how the tarball is built and shipped.

The catch-all answers 404 for any path with a file extension. Such a path always asks for a file from the package — a hashed bundle under `assets/`, or a file Vite copies to the root like `favicon.svg` — so a miss is a bad URL, never a client route. Serving the HTML shell instead would let the CDN cache a page under a `.js` address.

> **Note:** In production the app answers only while the `frontend_studio_enabled` feature flag is on. It is a DCDO flag, off in production by default, so production returns 404 until someone turns it on. The same flag turns the app off again without a deploy.

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

Route files in `src/routes/` declare canonical paths (e.g. `/projects/$labType/$channelId/edit`) with no surrounding prefix. `src/modules/router/index.ts` configures TanStack Router with `basepath: '/frontend-studio'`, which strips that prefix during URL matching and prepends it when constructing internal links. The basepath string is intentionally hardcoded — keeping it in lockstep with `config/vite.json`'s `publicOutputDir` and the Rails `frontend-studio(/*path)` route is required for the SPA to boot at all in any mode.

When a legacy Rails route eventually migrates to render the Vite shell at its canonical path, the migration will involve adding a Rails route + a separate Vite mount point under the canonical URL, not changing the basepath here.

## Route tree (auto-generated)

TanStack Router's Vite plugin (`tanstackRouter({ autoCodeSplitting: true })`) scans `src/routes/` and writes `src/routeTree.gen.ts` on every build and `yarn dev` start. **Never edit `routeTree.gen.ts` by hand** — changes are overwritten. Add or rename files in `src/routes/` to change the route tree.

## Lab lazy-load boundary

Each lab is a separate Vite chunk, loaded only when the user navigates to `/frontend-studio/projects/:labType/:channelId/edit`:

```
Studio bundle (loaded on first visit to /frontend-studio)
└── projects/$labType/$channelId/edit route loader
    └── getLabEntrypoint(labType)
        └── lazy(() => import('@code-dot-org/music-lab'))  ← separate chunk, fetched on demand
```

The route loader calls `getLabEntrypoint` to resolve the lazy component, then throws `notFound()` if the lab type is unregistered. The route component wraps the result in `<Suspense>`.

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
