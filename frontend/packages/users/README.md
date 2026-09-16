# @code-dot-org/users

The "My Account" feature module: the page where a signed-in user edits their
profile, login, school, role, and account actions. Consumed by the Studio app
(`apps/studio`), which lazy-loads it at `/users/edit`.

Two tabs are implemented: **Account Details** (profile, login, parent/guardian
email, account actions) and **Educator Profile** (school information and
educator role, educators only). **Communications** and **Integrations** are
still disabled placeholders, for legacy parity.

Each tab is its own form: one `FormProvider`, one `SaveBar`, one PATCH. School
information is a modal flow instead, because it needs a zip search and a
different endpoint (`PATCH /api/v1/user_school_infos`).

It is **app-shaped but not a lab** — it has a standalone dev server, MSW
fixtures, and a `./mocks` subpath like a lab, but it registers no lab entry and
has no channel/level model. See
[frontend/docs/conventions/packages.md](../../docs/conventions/packages.md#app-shaped-feature-packages).

## Public API

```typescript
// Default export — what Studio lazy-loads.
import UsersSettingsPage from '@code-dot-org/users';
// Same component, named.
import {UsersSettingsPage} from '@code-dot-org/users';
```

The default export is the page component (so `React.lazy(() => import('@code-dot-org/users'))`
works directly). It is also exported by name. The host passes `{tab, onTabChange}`
so tab selection lives in the host's router URL, not the component:

```tsx
<UsersSettingsPage
  tab={tab}
  onTabChange={next => navigate({search: {tab: next}})}
/>
```

Also exported: `UsersApiValidationError` (typed 422 field/form errors), the
`SaveState` union, and the `UserSettings` / `AuthenticationOptionSummary` /
`FieldErrors` / `UserType` types. Zod schemas and the API functions stay internal.

The current user comes from the shared TanStack Query cache via core's
`useCurrentUser`; the host primes it from its auth bootstrap, so the page issues
no extra `GET /api/v1/users/current`. Editable settings come from
`GET /api/v1/users/me/settings`. Mutations are package-local
(`the -dot-org/core users module`).

## Standalone dev server

```bash
VITE_API_MODE=msw yarn dev   # from frontend/packages/users/
```

Runs the page in isolation against MSW (`src/main.tsx` + `index.html`).
Without `VITE_API_MODE=msw` the mocks stay off and requests go to the real
backend at `localhost-studio.code.org:3000`. A
`?scenario=` switch picks the persona — `teacher` (default), `student`,
`sso-teacher` (SSO-only educator), `sso-student` (oauth-only student),
`minimal` (word/picture student with optional fields null and edits locked), or
`teacher-no-school` (educator with no school and no role) — and a corner
dropdown switches it live; the QA-only scenarios are in the dropdown too. Append `?devChrome=off` to suppress that
dropdown (tool-agnostic: visual-comparison runs, embeds, or a clean screenshot
opt in the same way). The host page's chrome (header/footer) is Studio's;
standalone only loads the design-system styling foundation so the page looks
like code.org.

## Mocks

```typescript
import {registerUsersFixtures} from '@code-dot-org/users/mocks';
```

Fixtures register through core's `registerMockFixture` registry (one scenario
per persona, with write-through state for the mutation flows). The standalone
host and this package's own tests consume them; `resetUsersFixtures()` clears
them between tests. Studio does not consume them — see below.

## Studio integration

Studio depends on this package (`workspace:*`) and declares the route
`apps/studio/src/routes/users/edit.tsx` (auth gate + `React.lazy` + `Suspense` +
`errorComponent`). Header, footer, and the auth/sign-in redirect are the host's
job. Studio does not mock this package's API: the route runs against the real
backend, and these fixtures are only for the standalone host and tests.

## Testing

```bash
yarn test        # vitest: API, reducers, the page against MSW, vitest-axe
yarn typecheck
```

Components are tested against the real `DashboardApiClient` transport over MSW
(no hand-mocked fetch). Accessibility is asserted with `vitest-axe` per scenario
and per modal; keyboard and screen-reader passes are e2e/manual (see the change's
a11y spec).
