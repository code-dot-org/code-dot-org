# admin-reports design

## Context

admin_reports_controller renders level_completions (with CSV variant),
level_answers (reads the replica), and debug HAML pages. Queries are
heavyweight aggregate reads; the ReadOnly replica usage is a
correctness-critical property to preserve (writes under a reader
connection 500 — see the 2026-07 ScriptLevelsController incident).

## Goals / Non-Goals

**Goals:**
- Replica usage preserved verbatim in extracted query objects; no write
  path anywhere in these endpoints.
- SPA pages parity with filters the HAML pages offer; server-side
  pagination where legacy pages truncate.

**Non-Goals:**
- No new analytics; no CSV reimplementation; no charting beyond what
  the legacy pages render.

## Decisions

1. **Query extraction with the replica boundary inside the query
   object**, so both legacy and API paths keep identical connection
   behavior during coexistence.
2. **Long-running report queries get explicit timeouts** and the API
   returns 504-style envelope errors rather than hanging the SPA;
   legacy pages currently just block.
3. **Debug page** ports as a JSON endpoint of the same fields; it is a
   diagnostic convenience, not a contract.

## Risks / Trade-offs

- [Aggregate queries slow under API timeout budgets] → same queries the
  HAML pages run today; timeout + envelope is strictly more graceful
  than the legacy blocking behavior.

## Migration Plan

Additive; flip links per-report once outputs are compared side-by-side
with legacy pages on seeded data. Rollback = flip links back.

## Open Questions

- Whether pd_progress.csv (referenced from views) is still used at all —
  check before porting anything around it; candidate for removal at
  decommission instead.
