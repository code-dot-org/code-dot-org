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
  second). `users/current` gets signed-out and signed-in personas since
  studio's root route fetches it on every navigation.
- Shared URL constants: each domain's path literals move to one module
  consumed by both `<domain>.api.ts` and `<domain>.handlers.ts`, so an
  endpoint rename cannot desync the mock.
- Mock responses validate against the same Zod schemata the client
  parses: default handlers and `registerLabFixtures` desugaring run
  `.parse()` on what they emit (dev/test only), converting
  consumer-side parse failures into definition-site failures.
- `getLabFixtures.ts` asymmetry resolved: oceans is either registered
  with a fixtures entry or its generic-fallback behavior is documented at
  the registration site (today the omission is silent and undocumented).
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
