# Proposal: frontend-studio-production-readiness

Evidence base: studio audit + measurements in
`openspec/frontend-platform-exploration-report.md`, verified 2026-07-04.

## Why

Studio's distance to production is currently encoded as two hard-coded
skips (`frontend_studio_controller.rb:4` returns 404 in production;
`lib/rake/package.rake:80,97` skips the studio package on production and
levelbuilder tiers) plus an undocumented set of everything-else: a
placeholder index route, display-only auth with no gating primitive, a
per-navigation auth fetch, no browser-level CI signal, no production
Sentry DSN, and a 3.4 MB (1.8 MB gzip) main chunk that Vite itself warns
about. The serving plumbing (S3 package keyed by turbo hash, Rails
static symlink, basepath lockstep) already exists and runs on preprod
tiers — the gap is a defined, checkable gate list, and without one the
production decision will be made by removing two lines and hoping.

## What Changes

- A readiness spec (`studio-production-readiness` capability)
  enumerating the gates between 404-in-prod and served-in-prod. This
  change implements the platform-owned gates and pins the rest as
  checkable requirements:
  - **Auth primitive** (implemented here): root-route auth outcome is
    cached per session instead of re-fetched every navigation
    (`__root.tsx` `beforeLoad` today), and a `requireAuth` route helper
    exists for feature routes to declare gating; signed-out behavior
    per route is explicit.
  - **Bundle budget** (implemented here): studio's entry chunk gets a
    size budget enforced at build time (starting point: the measured
    3,384 kB raw / 1,799 kB gzip main chunk shrinks via manualChunks/
    vendor splitting until the shell entry is under the budget; budget
    value fixed at design from the split results). The legacy endpoint
    of unbudgeted growth is in production today: 13.4 MiB of JS on a
    public level page.
  - **CI signal gate**: the studio smoke suite from
    `frontend-e2e-studio-gate` green and required.
  - **Config gate**: `frontend_studio_sentry_dsn` provisioned for
    production; the meta-tag/`SiteConfig` path verified against the
    prod hostname map.
  - **Serving gates** (pinned, not implemented here): removal of the
    controller 404 and the package.rake skips happens only when every
    prior gate is checked; rollout shape (percentage, flag, or
    path-scoped) recorded at that time.
  - **Product gate** (pinned): what `/frontend-studio/` renders in
    production — real index vs redirect — `BLOCKED-EVIDENCE: product
    decision; the placeholder `Hello "/"!` route is not shippable`.
- The gate list lives in the spec so "is studio production-ready?" is
  answerable by checking requirements, not by archaeology.

## Capabilities

### New Capabilities

- `studio-production-readiness`: an enumerated, checkable definition of
  production-ready for the studio shell, with the auth-caching/gating
  primitive and entry bundle budget implemented.

### Modified Capabilities

(none)

## Impact

`frontend/apps/studio` (auth module, router, vite manualChunks, budget
check), spec-only pins on `dashboard/app/controllers/
frontend_studio_controller.rb` + `lib/rake/package.rake` (not edited by
this change), config provisioning for the Sentry DSN. Depends on
`frontend-e2e-studio-gate` (the CI gate it references) and benefits from
`frontend-core-msw-parity` (personas for signed-in smoke). The
production cutover itself is a later change once gates are green.
