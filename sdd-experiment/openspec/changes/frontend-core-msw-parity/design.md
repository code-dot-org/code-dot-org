# Design: frontend-core-msw-parity

## Context

Core owns the MSW system (fixture registry + scenario store + default
handlers); labs contribute fixture data through a `./mocks` subpath. The
architecture is sound — the gaps are coverage (5/10 domains) and the two
unguarded duplication axes (URL literals, response shapes).

## Goals / Non-Goals

**Goals:**

- `VITE_API_MODE=msw` boots any current studio flow (root auth fetch
  included) with zero consumer-registered fixtures.
- Mock/client drift fails at mock-definition or handler-execution time
  in dev/test, never at consumer parse time.

**Non-Goals:**

- No new scenario capabilities (personas beyond signed-in/out belong to
  consuming packages).
- No contract testing against real Rails responses (the Zod parse at the
  real boundary already serves as the runtime tripwire; recording
  infrastructure is out of scope).
- No replay-transport work (`frontend-core-api-hygiene`).

## Decisions

- **Schema-validate mock output with the client's own schemata, gated to
  dev/test.** The schemata already exist per domain; reusing them makes
  the mock provably parseable by construction. Gating avoids shipping
  parse cost in the (already dev-only) worker path twice.
- **URL constants per domain module, not a route manifest.** A single
  global route table invites merge conflicts and imports across domains;
  per-domain `<domain>.urls.ts` keeps the change mechanical and the
  coupling local.
- **`users/current` default persona is signed-out.** Fail-safe default:
  flows that require auth surface immediately in MSW mode; the
  signed-in persona is one `registerMockFixture` call away and shipped
  alongside.
- **Oceans: document the fallback rather than fabricate fixtures.**
  Oceans is fully client-side (no Rails API); a comment at the
  registration site stating that is truthful. Fabricating fixture data
  to satisfy symmetry would be the wishlist behavior this planning pass
  avoids.

## Risks / Trade-offs

- Default handlers can mask a missing consumer fixture (test passes on
  defaults that don't match the consumer's intent); mitigated by the
  vitest `onUnhandledRequest: 'error'` policy staying intact — defaults
  are explicit handlers, not catch-alls, and the docs task spells out
  shadowing order.
- Zod-parsing handler output adds noise if schemata are stricter than
  fixtures in the wild; acceptable — that noise is exactly the drift
  signal this change exists to create.
