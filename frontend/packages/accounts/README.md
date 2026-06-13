# @code-dot-org/accounts

The "My Account" feature module: the Account Details page where a signed-in user
edits their profile, login, language, and account actions. Consumed by the
Studio app (`apps/studio`), which lazy-loads it at `/users/edit`.

It is **app-shaped but not a lab** — it has a standalone dev server, MSW
fixtures, and a `./mocks` subpath like a lab, but it registers no lab entry and
has no channel/level model. See
[frontend/docs/conventions/packages.md](../../docs/conventions/packages.md#app-shaped-feature-packages).

## Public API

```typescript
// Default export — what Studio lazy-loads.
import AccountSettingsPage from '@code-dot-org/accounts';
// Same component, named.
import {AccountSettingsPage} from '@code-dot-org/accounts';
```

The default export is the page component (so `React.lazy(() => import('@code-dot-org/accounts'))`
works directly). It is also exported by name. The host passes `{tab, onTabChange}`
so tab selection lives in the host's router URL, not the component:

```tsx
<AccountSettingsPage
  tab={tab}
  onTabChange={next => navigate({search: {tab: next}})}
/>
```

Also exported: `AccountsApiValidationError` (typed 422 field/form errors), the
`SaveState` union, and the `AccountSettings` / `AuthenticationOptionSummary` /
`FieldErrors` / `UserType` types. Zod schemas and the API functions stay internal.

The current user comes from the shared TanStack Query cache via core's
`useCurrentUser`; the host primes it from its auth bootstrap, so the page issues
no extra `GET /api/v1/users/current`. Editable settings come from
`GET /api/v1/account/settings`. Mutations are package-local
(`src/api/accounts.api.ts`).

## Standalone dev server

```bash
yarn dev   # from frontend/packages/accounts/
```

Runs the page in isolation against MSW (`src/main.tsx` + `index.html`). A
`?scenario=` switch picks the persona — `teacher` (default), `student`,
`sso-teacher` (SSO-only educator), `sso-student` (oauth-only student), or
`minimal` (word/picture student with optional fields null and edits locked) —
and a corner dropdown switches it live. Append `?devChrome=off` to suppress that
dropdown (tool-agnostic: visual-comparison runs, embeds, or a clean screenshot
opt in the same way). The host page's chrome (header/footer) is Studio's;
standalone only loads the design-system styling foundation so the page looks
like code.org.

## Mocks

```typescript
import {registerAccountsFixtures} from '@code-dot-org/accounts/mocks';
```

Fixtures register through core's `registerMockFixture` registry (one scenario
per persona, with write-through state for the mutation flows). The standalone
host and Studio's MSW boot both consume them; `resetAccountsFixtures()` clears
them between tests.

## Studio integration

Studio depends on this package (`workspace:*`), declares the route
`apps/studio/src/routes/users/edit.tsx` (auth gate + `React.lazy` + `Suspense` +
`errorComponent`), and registers the fixtures in its MSW boot. The lab registry
is untouched. Header, footer, and the auth/sign-in redirect are the host's job.

## Testing

```bash
yarn test        # vitest: API, reducers, the page against MSW, vitest-axe
yarn typecheck
```

Components are tested against the real `DashboardApiClient` transport over MSW
(no hand-mocked fetch). Accessibility is asserted with `vitest-axe` per scenario
and per modal; keyboard and screen-reader passes are e2e/manual (see the change's
a11y spec).
