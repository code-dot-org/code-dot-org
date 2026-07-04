# Proposal: frontend-app-package-conventions

Evidence base: studio/users audit in
`openspec/frontend-platform-exploration-report.md`, verified 2026-07-04.
Platform-generic: the Teacher Dashboard migration (planned separately in
this planning area) is a future consumer, not part of this change.

## Why

`docs/conventions/packages.md` defines two package kinds — libraries and
labs — but the packages now arriving are a third kind: app-shaped
features (account settings, teacher tools) that own routed pages, call
many API domains, and need auth. The one existing example
(`packages/users`) has a README sketching a contract (props-in page
component, host-owned URL state, `./mocks` persona scenarios, shared
QueryClient) that nothing implements or enforces, and the lab precedent
shows what unconventioned integration costs: oceans needed a studio-side
wrapper, a manual CSS import, and a host vite-config shim. Sixteen
teacher-dashboard surfaces are about to need this contract; writing it
after they land means writing it three divergent times.

## What Changes

- A new conventions section (or `docs/conventions/app-packages.md`)
  defining the app-shaped package contract, promoting the users README's
  sketch from aspiration to convention:
  - package exports page-level components taking a minimal typed props
    surface; URL/router state stays host-owned (components receive
    values + callbacks, never import the router);
  - React/MUI/core externalized as peers (lab rule reused verbatim);
  - API access through `@code-dot-org/core/api`; the client injection
    mechanism is decided here (module singleton, today's de facto
    pattern, vs the context layer deleted-pending-consumer in
    `frontend-core-api-hygiene`) — one mechanism, stated;
  - `./mocks` subpath exporting persona scenarios (signed-out /
    student / teacher), same registry machinery as lab fixtures;
  - standalone dev shell (`index.html` + `main.tsx` + `initializeCore`)
    with `?scenario=` persona selection, mirroring the lab shell rule;
  - vitest + axe baseline (the users scaffold's setup is already the
    template);
  - host accommodation budget: what a package may require of studio
    (route file, workspace dep, provider) and what it may not (vite
    config edits, wrapper components — the oceans smells, named).
- Generator support: `yarn turbo gen app-package` scaffolding the above,
  built on the existing generator + the conformance check from
  `frontend-generator-catalog-alignment`.
- A studio route-integration recipe documenting how an app package
  mounts: route file shape, lazy boundary, auth expectation (consumes
  whatever gating primitive `frontend-studio-production-readiness`
  lands; until then, the signed-out outcome contract).
- `packages/users` brought into conformance as the reference
  implementation to the extent of its current scaffold (structure,
  mocks subpath stub, dev shell) — not by implementing account-settings
  product features.

## Capabilities

### New Capabilities

- `app-package-contract`: a third package kind with a written,
  generator-backed, reference-implemented integration contract.

### Modified Capabilities

(none)

## Impact

`frontend/docs/conventions/**`, `frontend/turbo/generators/**`,
`frontend/packages/users` (scaffold conformance only),
`frontend/apps/studio` (route recipe doc; no product routes). Sequence
after `frontend-generator-catalog-alignment` (generator base) and
`frontend-core-api-hygiene` (client-injection decision input). The
Teacher Dashboard change-set consumes this; nothing here depends on it.
