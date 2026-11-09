# Proposal: frontend-core-api-hygiene

Evidence base: core audit in
`openspec/frontend-platform-exploration-report.md`, all items re-verified
against the tree 2026-07-04.

## Why

`@code-dot-org/core` is the layer every new module builds on, and it ships
dead and phantom surface that misleads both tooling and readers: a second
divergent `package.json` buried at `src/api/` (same package name, four
export subpaths with no source, plus aws-sdk/newrelic/statsig/redux deps
the real build never uses — any tool resolving the nearest manifest gets
the wrong answer), an orphaned API domain, a duplicate client path that
bypasses the Transport abstraction, an exported React context with zero
consumers, and a replay transport whose blob path silently does the wrong
thing.

## What Changes

- Delete `frontend/packages/core/src/api/package.json` (stale duplicate
  manifest; verified: none of `src/metrics`, `src/audio`,
  `src/textToSpeech`, `src/redux` exist).
- Delete the orphaned `lessons` domain
  (`src/api/dashboard/lessons/`; `createLessonsApi` imported nowhere;
  its two methods duplicate `levels.api.ts` URL logic).
- Consolidate `src/api/dashboard/users/getCurrent.ts` (raw-`KyInstance`
  path) into `users.api.ts#getCurrent` so exactly one implementation
  fetches `/api/v1/users/current`; migrate its one factory consumer.
- Remove `ApiClientContext`/`ApiClientProvider`/`useApiClient`
  (`src/api/contexts/`, zero consumers). The app-package conventions
  change has ruled for the module singleton as the injection mechanism,
  so removal is unconditional; the context layer returns only via a
  future spec change with a real consumer.
- `replayTransport`: blob requests throw an explicit
  unsupported-in-replay error (`requestBlob` currently passes a blob
  flag `requestWithMeta` ignores — a silent type mismatch); and
  `'record'` is removed from the transport's mode union. Rationale:
  `auto` mode already records on cache miss
  (`replayTransport.ts:23-30`), so standalone record is redundant —
  re-recording is achieved by clearing the IndexedDB namespace and
  running `auto`. `bootstrapApiClient` never selected `record`, so no
  consumer changes.
- Tighten `users.schemata.ts:18`: `user_type` enum admits `'admin'`,
  which Rails never renders from the `current` action (admin is a
  separate flag) — align the schema with the wire contract.
- Add a same-origin guard on CSRF header injection in `kyTransport.ts`
  (today `X-CSRF-Token` is attached to all non-GET requests including
  absolute cross-origin URLs).

## Capabilities

### New Capabilities

- `core-api-surface`: the shipped core API surface contains only
  implemented, consumed, single-sourced code; capability labels
  (replay/record) match behavior.

### Modified Capabilities

(none)

## Impact

`frontend/packages/core` only; consumers unaffected by construction (all
deleted surface has zero imports — verified by grep; the `getCurrent`
consolidation has one internal consumer). The transports/api README
corrections land in `frontend-docs-truth-pass`; this change owns code.
Coordinate merge order with that change only for README hunk adjacency.
Security-review sign-off wanted for the CSRF header guard.
