# admin-frontend-shell

## Why

The React admin pages need a home before any feature can be ported: an
app-shaped package following the `users` template, and a lazy, auth-gated
mount in the studio host so admin code never ships in student bundles.
Doing the shell as its own change lets feature chunks land as pages inside
a proven frame.

## What Changes

- New `frontend/packages/admin` (`@code-dot-org/admin`): app-shaped
  package per the users README pattern — standalone Vite dev server, MSW
  fixtures, `./mocks` subpath, Vitest, default export `AdminApp` (landing
  page + internal navigation), no lab registration.
- New studio host routes `apps/studio/src/routes/admin/*`: `beforeLoad`
  gate rejecting non-admin AuthOutcomes, `React.lazy` import of
  `@code-dot-org/admin`, Suspense + error component.
- Landing page replacing `admin_reports#directory` as the navigation hub
  (links only; target pages arrive in later changes, absent ones link to
  the legacy HAML page).
- No Rails changes beyond what admin-api-foundation provides; no feature
  pages; no prod enablement of frontend-studio (out of scope).

## Capabilities

### New Capabilities

- `admin-spa-shell`: the admin package, its studio mount, lazy loading,
  and client-side admin gating.
- `admin-navigation`: the admin landing/directory page and its
  legacy-fallback linking behavior.

### Modified Capabilities

<!-- none -->

## Impact

- frontend/packages/admin (new package; generator + packages.md
  conventions apply, yarn.lock regenerated and committed).
- frontend/apps/studio: routes/admin/*.tsx, routeTree.gen regeneration.
- Depends on: studio host auth bootstrap (exists), admin-api-foundation
  only at runtime for future pages (shell itself works against MSW).
- Downstream: every admin feature chunk mounts pages inside this shell.
