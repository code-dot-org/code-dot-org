# @code-dot-org/teacher-dashboard

Teacher dashboard feature module — sections overview, roster, and progress
tools for teachers. Foundation stage only (see
`sdd-experiment/openspec/changes/teacher-dashboard-foundation/`): the package
is scaffolded and wired to the real sections API through MSW, but the page
itself is a placeholder. Styled shell, navigation, and tabs land in feature 1.

It is **app-shaped but not a lab**, following the `@code-dot-org/users`
pattern: a standalone dev server, MSW fixtures, and a `./mocks` subpath, but
no lab registry entry.

## Public API

```typescript
// Default export — what a host lazy-loads.
import TeacherDashboardPage from '@code-dot-org/teacher-dashboard';
// Same component, named.
import {TeacherDashboardPage} from '@code-dot-org/teacher-dashboard';
```

`TeacherDashboardPage` reads sections from `GET /api/v1/teacher_dashboard/sections`
via `useTeacherDashboardSections` (`@code-dot-org/core/api`) and the shared
`DashboardApiClient`. It expects a `QueryClientProvider` ancestor — the host
owns that, matching the users convention — and renders a plain list of
section names, or an empty-state message when the teacher has none.

## Standalone dev server

```bash
yarn dev   # from frontend/packages/teacher-dashboard/
```

Runs the page against MSW only — there is no Rails backend to point it at.
A `?scenario=` param picks which sections fixture is active — `sections-empty`,
`sections-one`, `sections-many-ordered` (default), or `sections-archived-mixed`
— and a corner dropdown switches it live (full navigation, no rebuild). Append
`?devChrome=off` to hide the dropdown for screenshots.

The scenario tags and labels are declared in `src/mocks/scenarios.ts`, hand-kept
in sync with the tags registered in
`@code-dot-org/core/api/mocks/sections.handlers.ts`. Core's mock registry has
no API to enumerate registered tags for a lab key, so the selector cannot read
them live from core; see the comment in `scenarios.ts` for the exact gap.

## Mocks

```typescript
import {
  SECTIONS_SCENARIOS,
  TEACHER_DASHBOARD_LAB_KEY,
} from '@code-dot-org/teacher-dashboard/mocks';
```

The actual fixture data and MSW handlers live in
`@code-dot-org/core/api/mocks/sections.handlers.ts` — this package only
exports the tag/label metadata for its own selector and tests.

## Testing

```bash
yarn test        # vitest: the page and selector against MSW, vitest-axe
yarn typecheck
```
