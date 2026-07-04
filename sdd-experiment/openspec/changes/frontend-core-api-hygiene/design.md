# Design: frontend-core-api-hygiene

## Context

Core's API layer is well-built where it is real (Transport abstraction,
Zod boundary validation, CSRF refresh flow) and misleading where it is
not. The phantom surface predates current conventions and reads as
shipped capability to authors and to tooling that resolves the nearest
`package.json`.

## Goals / Non-Goals

**Goals:**

- One implementation per endpoint; one manifest per package; zero
  exported dead surface.
- Replay transport behavior matches its labels.

**Non-Goals:**

- No retry/pagination convention design (real gap, but it needs a
  consuming module to drive requirements; deferred until the first
  consumer — likely the app-package work — surfaces one).
- No new transports, no offline write queue.
- No mock-layer changes (that is `frontend-core-msw-parity`).

## Decisions

- **Delete over deprecate.** Everything removed has zero consumers by
  grep; core is `private: true`, unpublished, so there is no external
  compatibility surface. Rejected: deprecation comments — they add a
  release cycle for no consumer.
- **`getCurrent` consolidation keeps the Transport-based path** (the
  `users.api.ts` implementation) because it carries the ApiError
  normalization and CSRF machinery; the raw-ky variant is the one
  deleted.
- **Context layer: remove now, re-add with its first consumer.** The
  app-package-conventions proposal explicitly considers context-based
  client injection; if adopted there, it re-lands consumed and tested.
  Exported-but-unconsumed React surface is how the users README problem
  happened.
- **Blob replay: explicit throw over silent fix-forward.** Fixing
  requires an IndexedDB blob serialization design nothing needs yet;
  an `unsupported` error is honest and cheap, and upgrading later is
  non-breaking.

## Risks / Trade-offs

- Unmerged branches (accounts/users work) may consume surface this
  change deletes; mitigation: grep the open PR stack before merge and
  sequence behind any consumer that materializes.
- The CSRF same-origin guard could break a legitimate cross-origin
  authenticated call if one exists; audit callers first (none found in
  frontend/; legacy uses its own CSRF paths).
