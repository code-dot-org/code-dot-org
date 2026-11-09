# Design: frontend-app-package-conventions

## Context

Package kinds today: libraries (preserveModules, subpath exports) and
labs (app-config vite, default-export component, `./mocks`, standalone
shell, generator-registered in studio). App-shaped features fit neither:
they own multiple routed pages, need auth and many API domains, and are
composed by the host router rather than a `$labType` slot. The users
README already encodes the intended contract; the TD migration's 16
surfaces are the volume consumer.

## Goals / Non-Goals

**Goals:**

- One documented, scaffoldable contract for app-shaped packages before
  the first volume consumer lands.
- Host accommodation is bounded and named — no per-package studio vite
  edits or wrapper components.

**Non-Goals:**

- No product feature implementation (users stays a conformant scaffold).
- No teacher-dashboard specifics (that change-set holds its own specs).
- No routing redesign in studio; the contract targets today's TanStack
  file routes.

## Decisions

- **Props-in, router-out.** Page components receive typed values and
  callbacks; only the host imports TanStack APIs. Keeps packages
  portable across hosts (standalone shell, future embedding) and
  testable without a router. This is the users README's design,
  promoted.
- **Client injection: module singleton, documented, context deferred.**
  Every real consumer today uses the `DashboardApiClient` singleton;
  the context layer had zero consumers and is being removed by
  `frontend-core-api-hygiene`. The convention states the singleton is
  the mechanism; if a genuine multi-client need appears (e.g. two
  backends in one page), the context layer returns as a spec change —
  not silently.
- **Personas as named fixture scenarios over the existing registry.**
  Reuses `registerMockFixture`/scenario-store machinery instead of a
  second mock system; `?scenario=` in the dev shell maps to
  `setActiveScenario`, exactly as labs' `:channelId` tag does — one
  mental model.
- **Host accommodation budget is part of the contract.** Allowed: one
  route file, one workspace dep, documented providers. Disallowed
  without a convention change: studio vite-config edits, host wrapper
  components, manual CSS imports (each named with its oceans
  precedent). This is what keeps the plug-in story honest as
  migrations arrive.

## Risks / Trade-offs

- Convention-before-second-consumer risk: the contract may need
  revision when TD's real surfaces stress it; mitigated by scoping to
  what the users sketch + lab precedent already justify, and by the TD
  change-set being spec-driven (revisions land as spec deltas, not
  folklore).
- The generator gains a third template to keep conformant; covered by
  the conformance CI check from `frontend-generator-catalog-alignment`.
- Auth contract is thin until the gating primitive exists; stated
  explicitly (signed-out outcome only) rather than invented here.
