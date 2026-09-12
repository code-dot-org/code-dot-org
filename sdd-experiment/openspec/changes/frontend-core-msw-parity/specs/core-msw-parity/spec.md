# Spec: core-msw-parity

## ADDED Requirements

### Requirement: Every wired domain has a default handler

Each API domain wired into `createApiClient` SHALL ship a default MSW
handler in core, such that `VITE_API_MODE=msw` serves every domain
without consumer-registered fixtures. `users/current` SHALL default to a
signed-out response with a signed-in persona available.

#### Scenario: Studio boots in MSW mode

- **WHEN** studio runs with `VITE_API_MODE=msw` and no fixtures
  registered
- **THEN** the root route's auth fetch resolves (signed-out) and no
  unhandled-request error fires on any wired domain

#### Scenario: Vitest touches a wired domain

- **WHEN** a package test calls any wired domain through the real client
  against the MSW node server
- **THEN** the request is handled without the test registering fixtures

### Requirement: Mock URLs share the client's source of truth

Domain URL paths SHALL be defined once per domain and imported by both
the api implementation and its handlers. A handler MUST NOT carry a
hand-copied path literal for an endpoint the client defines.

#### Scenario: Endpoint path renamed

- **WHEN** a domain's endpoint path constant changes
- **THEN** client and handler move together with no second edit site

### Requirement: Mock responses are schema-valid

Default handlers and fixture desugaring SHALL validate emitted bodies
against the same Zod schemata the client parses, in dev and test builds.
A mock that the client cannot parse MUST fail at the mock, not at the
consumer.

#### Scenario: Handler drifts from schema

- **WHEN** a default handler's body no longer satisfies the domain
  schema
- **THEN** the handler itself throws in dev/test with the Zod error,
  before any consumer assertion runs

### Requirement: Fixture registration is symmetric or documented

Every lab in `AVAILABLE_LABS` SHALL either appear in the studio fixtures
loader or carry an adjacent statement of why it opts out. Silent
omission MUST NOT be possible to copy as a pattern.

#### Scenario: Reading the fixtures loader

- **WHEN** a new lab author opens `getLabFixtures.ts`
- **THEN** each available lab is either wired or explicitly annotated
  (oceans: fully client-side, generic fallback intended)
