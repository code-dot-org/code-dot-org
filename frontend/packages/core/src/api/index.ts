// Runtime API surface. Wraps the data-only barrel (`./data`) with the
// singletons that need the page's site config:
//
//   - `bootstrapApiClient` reads `import.meta.env` and instantiates the
//     transport based on the `VITE_API_MODE` setting.
//   - `DashboardApiClient` is the module-level singleton produced by
//     calling `bootstrapApiClient()` at module load.
//
// Both touch site config / the URL at import time. Tests or tools that
// only need types/schemas/constants should import from
// `@code-dot-org/core/api/data` instead — that path is DOM-free.

import DashboardApiClient from './dashboard/SingletonDashboardApiClient';

export * from './data';
export * from './bootstrapApiClient';
export {DashboardApiClient};
