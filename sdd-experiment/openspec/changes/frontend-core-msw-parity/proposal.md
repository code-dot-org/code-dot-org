# Proposal: frontend-core-msw-parity

Evidence base: core mocks audit in
`openspec/frontend-platform-exploration-report.md`, verified 2026-07-04.

## Why

MSW mode is the platform's backend-free development story, but it fails
closed for half the API surface: only 5 of 10 wired domains have default
handlers (`channels`, `levels`, `preferences`, `projects`, `sources`),
while vitest runs `onUnhandledRequest: 'error'` — so any test or dev-shell
flow touching `users`, `courses`, `sections`, `metrics`, or `auth` throws
until each consumer hand-registers fixtures. Meanwhile mock URLs are
hand-mirrored string literals and mock bodies are hand-built with no
schema check, so both silently drift from the client they exist to mock.

## What Changes

- Default MSW handlers for the five uncovered wired domains, matching the
  existing pattern (fixture-registry dispatch first, behavioral default
  second). Default bodies are the minimal values that satisfy each
  domain's Zod schema: empty collections for list endpoints, the
  signed-out variant of the `is_signed_in` discriminated union for
  `users/current` (a signed-in teacher persona ships alongside as a
  registerable fixture), and a success acknowledgement (2xx, schema-
  minimal body) for write-shaped endpoints such as metrics.
- Shared URL constants: each domain's path literals move to one module
  consumed by both `<domain>.api.ts` and `<domain>.handlers.ts`, so an
  endpoint rename cannot desync the mock.
- Mock responses validate against the same Zod schemata the client
  parses: default handlers and `registerLabFixtures` desugaring run
  `.parse()` on what they emit (dev/test only), converting
  consumer-side parse failures into definition-site failures.
- `getLabFixtures.ts` asymmetry resolved by documenting, not wiring:
  oceans is fully client-side (no Rails API), so it gets an explicit
  annotation at the registration site stating the generic fallback is
  intended. Fabricating fixture data for symmetry is rejected; an
  owning-team ruling may wire real fixtures later.
- The scenario/fixture contract (`{labKey, tag}` scoping, sessionStorage
  write-through, `?cdoMockReset=1`, `onUnhandledRequest` policy split
  between worker `warn` and vitest `error`) is documented in one place in
  `src/api/mocks/README.md` — pieces exist; the policy split is currently
  discoverable only by reading both setup files.

## Capabilities

### New Capabilities

- `core-msw-parity`: every wired API domain is mockable by default, and
  mock definitions cannot drift from client URL or schema without a
  loud failure.

### Modified Capabilities

(none)

## Impact

`frontend/packages/core/src/api/**` (URL constant extraction touches each
domain's `.api.ts` + `.handlers.ts`), `apps/studio/src/modules/labs/
router/getLabFixtures.ts`, mocks README. Consumers get strictly more
default coverage; existing consumer-registered fixtures shadow defaults
by design, so no behavior change for them. Sequence after
`frontend-core-api-hygiene` (deletions shrink the surface this covers).
