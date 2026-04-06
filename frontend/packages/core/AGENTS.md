# @code-dot-org/core

## Architecture

See [docs/architecture.md](./docs/architecture.md) for singletons, boot sequence, and browser-only constraints.

## Keeping documentation up to date

When making changes, check if the following docs need updates:

- **[docs/architecture.md](./docs/architecture.md)** — Update when changing:

  - `SiteConfig` construction, properties, or export shape
  - `DashboardApiClient` configuration or HTTP transport setup
  - `initializeCodeStudioConfig` boot behavior or `window.__CODE_STUDIO__` contract
  - `localization` singleton initialization or event contract
  - Any file in `src/config/`, `src/api/dashboard/`, or `src/localization/`

- **[README.md](./README.md)** — Update when changing:

  - The public import API (new exports, removed exports, renamed symbols)
  - The `./api` sub-path export surface
  - Boot requirements visible to consumers

- **This file (AGENTS.md)** — Update when adding new singletons, sub-path exports, or browser-only constraints that agents would otherwise violate.
