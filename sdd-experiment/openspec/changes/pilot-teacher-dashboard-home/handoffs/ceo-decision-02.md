# CEO Decision 02 — Scaffold Gate (response to memo-02-scaffold)

Date: 2026-07-03. Usage checkpoint 6 is the recorded PASS preflight for
Sonnet task 1.

## Rulings

1. Sonnet start: APPROVED at task 1 with the proposed batching —
   Session A (1.1-1.4, 2.1-2.2), Session B (3.1-3.2, 4.1-4.2),
   Session C (5.1, 6.1), Session D (7.1, 8.1). Each session is one
   bounded `/opsx:apply` engagement.
2. Pre-existing e2e-tests lint defect (header.spec.ts importing
   `../pages/teacher-dashboard` with no index.ts, from staging commit
   efa54994177): ACKNOWLEDGED. Not pilot scope; do not fix it here.
   All pilot gates are package/filter-scoped until it is fixed
   upstream. It will be reported to the human owner in the final
   summary.
3. CEO spot-check of commits 29a417eecb6 and 6090f872010: clean; no
   unrelated files; ailab reformat correctly reverted.

## Policy adaptation (recorded for transparency)

The TDD loop's per-task memo (step 12) is amortized per SESSION, not
per checklist item: after Sessions A-C, Opus returns a SHORT interim
review verdict (diff inspected, evidence checked, go/no-go, preflight
row for the next session) instead of a full executive memo. Full
executive memo resumes at Phase 4 handoff. Rationale: four full memos
would spend usage without changing any decision; the CEO decision
points remain.

Preflight ownership: the CEO or Opus may record the per-session
preflight row, whichever agent is at the boundary. The hard gate stands:
no Sonnet session starts without a recorded PASS row naming it.
