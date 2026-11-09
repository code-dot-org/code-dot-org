# Spec: studio-production-readiness

## ADDED Requirements

### Requirement: Production serving is gated on an enumerated list

The studio shell SHALL NOT be served in production until every gate in
this capability is satisfied: auth primitive (below), entry bundle
budget (below), required browser-level CI (per `studio-e2e-gate`),
production observability config provisioned and verified, and a product
ruling on the index route. The current hard gates
(`frontend_studio_controller.rb` production 404; `package.rake` studio
skips) SHALL remain in place until then and be removed only by a
dedicated cutover change that records the rollout shape.

#### Scenario: Premature cutover attempt

- **WHEN** a change proposes removing the production 404 while any gate
  above is unsatisfied
- **THEN** this spec is the review basis for rejecting it, gate by gate

### Requirement: Auth outcome is cached and gateable

The shell SHALL fetch the auth outcome at most once per page load
(revalidating when the window regains focus), not on every navigation;
and SHALL provide a `requireAuth` route primitive so feature routes
declare their signed-out behavior (redirect to the Rails sign-in URL
or an explicit signed-out render). Routes without the primitive
default to public.

#### Scenario: Five navigations, one fetch

- **WHEN** a signed-in user navigates across five routes without
  focus loss or sign-out
- **THEN** `/api/v1/users/current` is requested at most once

#### Scenario: Gated route while signed out

- **WHEN** a signed-out user opens a route declaring `requireAuth`
- **THEN** the declared signed-out behavior occurs (no gated content
  renders)

### Requirement: Entry bundle is budgeted

Studio's build SHALL enforce a size budget on the entry chunk (raw and
gzip), failing the build when exceeded. Vendor code SHALL be split from
the entry such that the budget is meaningfully below today's measured
3,384 kB raw / 1,799 kB gzip single chunk; the budget value is fixed at
implementation from the post-split measurement and recorded in the
build config with its rationale.

#### Scenario: Dependency bloats the entry

- **WHEN** a change grows the entry chunk past the budget
- **THEN** the build fails with the measured and budgeted sizes named

### Requirement: Production runtime config is verified

The production readiness check SHALL verify the `app-config` meta-tag
path end to end for production: Sentry DSN provisioned
(`frontend_studio_sentry_dsn`), hostname→environment mapping in
`SiteConfig` correct for the production host, and the basepath lockstep
(`config/vite.json`, router basepath, Rails route) covered by a test.

#### Scenario: Basepath drift

- **WHEN** any of the three basepath declarations changes without the
  others
- **THEN** a test fails naming the three sites
