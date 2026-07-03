# Executive Memo 01 — Planning: pilot-teacher-dashboard-home

## Decision

Recommend APPROVE the Scenario Registry (two scenarios) and the visual plan as
written. Recon is complete, the OpenSpec artifact set is authored and internally
consistent, and the scope is a genuinely read-only, preprod-only slice. Two
items need a CEO ruling before implementation (see Ask).

## Customer Impact

Near zero. The candidate route
`/frontend-studio/teacher_dashboard/home` is served by a controller that returns
404 in production; it is preprod/local only. The legacy
`/teacher_dashboard/home` and all its code are untouched, no redirect is added,
and the pilot is read-only (no mutation of sections, courses, or students). No
real user data — test teachers/sections are created via sanctioned helpers on
test-studio.

## Scope

In: a new package `frontend/packages/teacher-dashboard` rendering the empty and
section-list states; a Studio route + lazy boundary; an additive
`GET /api/v1/sections` list method on the core `sections` domain with schema,
parser tests, and MSW fixtures; two Playwright scenarios with scoped axe and
keyboard checks. Out (verbatim in proposal.md): create/edit/archive/delete
sections; drag reorder/order persistence; add-students; course-assignment flows;
progress/roster/materials/settings/assessments/stats/projects/text-responses;
demo section creation; AI differentiation/chat; promotions; Global Edition.

## Evidence

Recon (six streams, appendix-01) confirms the plan is buildable as specified:

- Legacy region bounds and consumed fields are known; tightest bound is
  `<ol id="ui-test-section-list">`; empty state is `EmptyHomepage`/`EmptyState`.
- `GET /api/v1/sections` returns a bare array of `summarize_without_students`
  objects; signed-out → 403 empty, student/empty teacher → `200 []`. Full schema
  and consumed-field mapping are in api-contract-matrix.md.
- The core `sections` domain exists but has NO list method — the pilot adds one.
  The existing `ConciseSectionSchema` models a DIFFERENT payload
  (`concise_summarize`) and must not be reused.
- Studio routing (TanStack, generated tree), the `/frontend-studio` mount,
  `DashboardApiClient`, the schema/parser/test trio, and MSW conventions are all
  in place and documented. The generator scaffold is fully documented (Phase-2,
  Opus-owned; not run).
- Sanctioned fixtures exist for both scenarios (`signInAsNewUser`,
  `/dashboardapi/sections`, `/api/test/create_student_section_assigned_to_course_and_unit`,
  `/join/:code`); the course `ui-test-single-unit-course-2026` is confirmed on
  test-studio.

## Risk

- R1 — Visual infra (`@code-dot-org/playwright-support`) is NOT on this branch;
  it lives on unmerged branches. Mitigation: Opus merges it in Phase 2, or uses
  the native `toHaveScreenshot` fallback. Blocks the visual gate, nothing else.
- R2 — Cross-stack pixel parity (webpack/DSCO legacy vs Vite/MUI candidate) is
  not meaningful. Mitigation: strict gate = candidate self-consistency (MSW +
  `prove-visual`, `maxDiffPixelRatio ≤ 0.01`); legacy comparison is advisory,
  strict cross-stack acceptance deferred.
- R3 — Scope creep from the mutation-entangled legacy card. Mitigation: tasks
  assert the ABSENCE of mutating controls; read-only labels only.

## Usage

At planning start: session 7%, week-all 45%, week-Fable 7% (resets: session
Jul 3 7:30am, week Jul 6 9am PT). Well under all pause thresholds. Safe to
continue. Recorded in usage-checkpoints.md (rows 1-2); a handoff row is appended
with this memo.

## Ask

Decide now:

1. APPROVE / revise the two-scenario Scenario Registry and the read-only scope.
2. RULE on the visual environment decision: confirm the strict gate is candidate
   self-consistency with legacy parity ADVISORY (cross-stack strict acceptance
   deferred), OR direct a stricter cross-stack approach.
3. AUTHORIZE the Phase-2 prerequisite: Opus to merge/cherry-pick
   `@code-dot-org/playwright-support`, or accept the native-`toHaveScreenshot`
   fallback.
