# admin-frontend-shell design

## Context

The studio host (frontend/apps/studio, Vite + TanStack Router, served by
Rails at /frontend-studio, 404 in prod) resolves auth once per navigation
in the root route's beforeLoad via GET /api/v1/users/current; the payload
carries `user_type: 'student' | 'teacher' | 'admin'`. packages/users is
the sanctioned template for an app-shaped feature package (own dev
server, MSW, lazy-loaded by a studio route) but is itself still a
scaffold — admin will co-evolve the pattern.

## Goals / Non-Goals

**Goals:**
- Admin chunk loads only for admins; students/teachers never download it.
- Feature chunks after this one are "add a page + a route", nothing more.
- Package developable standalone against MSW (no Rails running).

**Non-Goals:**
- No feature pages, no admin API consumption beyond the smoke endpoint.
- No production enablement of frontend-studio.
- No shared "client extension" refactor of DashboardApiClient — admin
  query modules follow whatever pattern core has when each feature chunk
  lands.

## Decisions

1. **Mount inside the studio host, not a separate Rails shell.** One SPA,
   one auth bootstrap, one router; the admin audience tolerates the
   frontend-studio prefix. A dedicated /admin shell was considered
   (decouples from studio-in-prod) but rejected per review: prod
   enablement is being handled by other means.

2. **Client gate = route beforeLoad on AuthOutcome.** Non-admin (or
   signed-out, or error) outcomes redirect to studio root before any
   admin component renders. This is UX only; the server enforces
   require_admin on every API call regardless. user_type === 'admin' is
   the discriminator; the finer-grained permissions array is not needed
   for a single-tier admin surface.

3. **React.lazy per the labs/users pattern**, so the admin bundle is a
   separate chunk fetched on first navigation to /admin. Route files stay
   thin (gate + lazy + Suspense + errorComponent), the package owns all
   UI.

4. **Landing page links, not embeds.** The directory page mirrors
   admin_reports#directory as a link hub. Targets not yet ported link to
   the legacy HAML URL (absolute /admin/... path, full page navigation) —
   the two surfaces coexist through the whole migration, so the hub must
   span both.

5. **Design system first**: DSCO component-library components per the
   component hierarchy (browser semantics > DSCO > MUI > custom); CSS
   modules for overrides.

## Risks / Trade-offs

- [users package pattern is unproven (scaffold)] → admin becomes the
  pathfinder; deviations get fed back into packages.md conventions rather
  than silently forked.
- [Route gate races auth error states] → AuthOutcome has no loading
  state by design (resolved before render); error outcome falls back to
  redirect, and the API 401/403 remains the real guard.
- [Legacy links from SPA hub confuse the back button] → acceptable;
  full-page navigations between surfaces are the strangler-pattern norm.

## Migration Plan

Pure addition behind the existing dev/preprod-only frontend-studio
route. Rollback = revert. No data or Rails changes.

## Open Questions

- Whether the admin package primes shared TanStack Query caches the way
  the users README envisions (host-primed current user) — decide when the
  first data-fetching page lands.
