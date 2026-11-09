# Spec: core-api-surface

## ADDED Requirements

### Requirement: Single manifest per package

`frontend/packages/core` SHALL contain exactly one `package.json`, at the
package root. Nested manifests that shadow the package name or advertise
export subpaths without corresponding source MUST NOT exist.

#### Scenario: Tooling resolves the manifest

- **WHEN** any tool resolves the nearest `package.json` from a file under
  `src/api/`
- **THEN** it finds the root manifest whose exports all correspond to
  built entries

### Requirement: No orphaned or duplicate API surface

Every exported API domain, hook, and context in core SHALL have at least
one consumer or be removed; every dashboard endpoint SHALL have exactly
one client implementation. Specifically: the `lessons` domain, the
raw-ky `getCurrent` duplicate, and the unconsumed
`ApiClientContext`/`ApiClientProvider`/`useApiClient` exports are
removed (the context layer may return with its first consumer).

#### Scenario: Grep audit of exports

- **WHEN** exports of `@code-dot-org/core/api` are cross-referenced
  against workspace imports
- **THEN** no exported symbol has zero consumers outside core's own
  tests

### Requirement: Transport labels match behavior

The replay transport SHALL reject blob requests with an explicit
unsupported-operation error; it MUST NOT silently record or return
non-blob data for a blob request. The transport's mode union SHALL
contain only modes `bootstrapApiClient` can select: `'record'` is
removed (its recording behavior is subsumed by `auto`, which records
on cache miss; re-recording = clear the IndexedDB namespace).

#### Scenario: Blob request under replay

- **WHEN** a consumer calls `requestBlob` while the replay transport is
  active
- **THEN** the call either returns a recorded blob or throws an
  explicit unsupported-operation error — never a silent type mismatch

### Requirement: CSRF token stays on-origin

The ky transport SHALL attach `X-CSRF-Token` only to same-origin (or
configured API-origin) requests. Cross-origin absolute URLs MUST NOT
receive the token header.

#### Scenario: Absolute third-party URL

- **WHEN** a consumer issues a POST to an absolute URL on another origin
  through the transport
- **THEN** the request carries no `X-CSRF-Token` header
