# @code-dot-org/teacher-dashboard

Teacher Dashboard UI modules, extracted from `apps/` into a standalone Turborepo
package. The Studio host lazy-loads exports from this package; a standalone Vite
dev server can render the same pages against MSW for offline development.

## Exports

| Path      | Description                             |
| --------- | --------------------------------------- |
| `.`       | Root public API                         |
| `./home`  | Homepage leaf components                |
| `./mocks` | Dev/test MSW personas and fixture seeds |

React, MUI, the design system, and TanStack Query are `peerDependencies` -- the
host provides them so the lazy chunk shares one React and QueryClient instance.
