# Studio Architecture

## Rails integration

Studio is an SPA shell served by Rails. The request flow:

```
Browser → Rails catch-all route (get "app(/*path)")
        → AppController#index
        → dashboard/app/views/app/index.html.haml
            - injects Vite bundle via vite_typescript_tag 'application.tsx'
            - provides #vite-root mount point
        → entrypoints/application.tsx (React app boots)
```

In **Vite Rails mode** (preferred), `vite-plugin-rails` proxies asset requests from Rails to the Vite dev server on port 3036. Access the app at `http://localhost-studio.code.org:3000/app`.

In **standalone mode**, the Vite dev server runs independently of Rails at `http://localhost:3036/app`. This is an intentional architectural constraint — Studio is designed to be independently deployable and testable without the backend.

In production, Vite build output is served as static files from `public/frontend-studio/` (configured in `config/vite.json`).

> **Note:** Studio currently returns 404 in production — it is pre-production / experimental only.

## Init ordering

`entrypoints/application.tsx` must call `initializeCodeStudioConfig()` before rendering the router.

```
initializeCodeStudioConfig()   ← must be first
createRoot(...).render(
  <RouterProvider router={router} />   ← labs mount inside here
)
```

## Route tree (auto-generated)

TanStack Router's Vite plugin (`tanstackRouter({ autoCodeSplitting: true })`) scans `src/routes/` and writes `src/routeTree.gen.ts` on every build and `yarn dev` start. **Never edit `routeTree.gen.ts` by hand** — changes are overwritten. Add or rename files in `src/routes/` to change the route tree.

## Lab lazy-load boundary

Each lab is a separate Vite chunk, loaded only when the user navigates to `/app/projects/:labType/:channelId/edit`:

```
Studio bundle (loaded on first visit to /app)
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
| React/React-DOM aliases pinned to workspace root           | Multiple React instances; hooks throw                   |
| `entrypoints/application.tsx` mounts to `#vite-root`       | Rails template provides this div; mismatch = blank page |

See [AGENTS.md](../AGENTS.md) for update triggers.
