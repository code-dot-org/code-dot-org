# @code-dot-org/core

## Architecture

See [docs/architecture.md](./docs/architecture.md) for singletons, boot sequence, and browser-only constraints.

## Keeping documentation up to date

When making changes, check if the following docs need updates:

- **[docs/architecture.md](./docs/architecture.md)** — Update when changing:

  - `SiteConfig` construction, properties, or export shape
  - `DashboardApiClient` configuration or HTTP transport setup
  - `initializeCore` / `initializeCodeStudioConfig` boot behavior or `window.__CODE_STUDIO__` contract
  - `CorePlugin` interface or plugin lifecycle
  - `localization` singleton initialization or event contract
  - Any file in `src/config/`, `src/api/dashboard/`, or `src/plugins/`

- **[README.md](./README.md)** — Update when changing:

  - The public import API (new exports, removed exports, renamed symbols)
  - The `./api`, `./localization`, or `./observability` sub-path export surface
  - Boot requirements visible to consumers
  - Plugin registration patterns

- **This file (AGENTS.md)** — Update when adding new singletons, sub-path exports, plugins, or browser-only constraints that agents would otherwise violate.

## Plugin vs. new package

Before building, decide where the integration belongs. Use a plugin in core when:

- The npm dependency is absent or lightweight (loaded externally, or small enough to be an optional peer dep without misleading consumers of core).
- The integration needs `onCoreReady` — it reads `SiteConfig` fields (environment, brand, dashboardApiUrl) to configure itself at boot.
- Fewer than ~4 plugins are expected total; bundle discipline (never re-export from `src/index.ts`) is sufficient to keep things tree-shakeable.

Create a new `frontend/packages/*` package instead when:

- The npm dependency is large and would appear in core's `package.json` even as optional (e.g. `@sentry/browser` ~100 KB). A package boundary gives a hard guarantee: forks that don't install the package never see the dep.
- The integration is architecturally independent of core's boot lifecycle.
- The integration is genuinely reusable without core at all.

When in doubt, start as a plugin and promote to a package later if the dep weight or independence makes the boundary necessary.

## Adding a new plugin

1. Create `src/plugins/<name>/index.ts` — export the plugin object and any public API.
2. Add the sub-path entry to `package.json` `exports` (types + import + require).
3. Add the entry to `vite.config.ts` `build.lib.entry` array.
4. Do **not** re-export from `src/index.ts` — this would defeat sub-path tree-shaking.
5. Update `docs/architecture.md` and `README.md`.
