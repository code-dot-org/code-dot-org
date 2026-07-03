# CEO Decision 01 — Registry Gate (response to memo-01-planning)

Date: 2026-07-03. Usage checkpoint 4 (PASS) covers this decision.

## Rulings

1. Scenario Registry: APPROVED as written. Two scenarios (TD-HOME-EMPTY,
   TD-HOME-SECTION-LIST), read-only scope, out-of-scope list verbatim.
   Implementation may proceed after Phase 2 completes.

2. Visual environment: APPROVED option (b). The strict, tool-enforced
   gate is candidate self-consistency (`toHaveScreenshot`,
   `maxDiffPixelRatio <= 0.01`, `--repeat-each` flake gate) against the
   deterministic MSW shell. Legacy-vs-candidate comparison is ADVISORY,
   captured from test-studio with sanctioned fixtures and reviewed by
   the CEO. Strict cross-stack visual acceptance is explicitly DEFERRED;
   the Phase 5 verdict will apply the workflow-partial rule honestly —
   do not reframe the deferral as a pass.

3. Visual infra: use the NATIVE `toHaveScreenshot` fallback. Do NOT
   merge or cherry-pick `@code-dot-org/playwright-support` — it lives on
   unmerged branch work and pulling it in expands pilot scope and risk.
   Record this in tasks.md task 0 and design.md R1 as resolved.

## Assumption confirmations (memo open questions 3-7)

- Pilot renders teaching (non-hidden) sections only; archived view out
  of scope. CONFIRMED.
- Avatar (color/emoji) in scope as a read-only card label. CONFIRMED.
- Course name renders as a static read-only label, no dropdown
  interactivity. CONFIRMED.
- Thin `createTeacherWithSections` e2e wrapper composing existing
  sanctioned endpoints: ACCEPTABLE. It is needed only for the advisory
  legacy capture; keep it in the advisory-capture workstream.
- Standalone MSW dev shell as the deterministic visual/dev target:
  CONFIRMED.

## Directed cleanups (Phase 2, Opus)

- tasks.md 3.2 contains a leftover self-correction artifact
  ("`src/EmptyHome*.tsx`? no —"); fix the file list.
- Assign the advisory legacy capture (test-studio, sanctioned fixtures,
  masked per visual-artifacts.md) explicitly to Opus in Phase 4; it is
  not a Sonnet task.

## Phase 2 authorization

Opus is authorized to: run usage preflight; scaffold
`frontend/packages/teacher-dashboard` via `yarn turbo gen package`;
inspect the generated diff; document scaffold side effects; remove
accidental artifacts; verify no unrelated files changed; apply the
directed cleanups; finalize tasks.md; and commit (a) the OpenSpec
planning artifacts and (b) the inspected scaffold as separate commits on
`stephen/pilot-teacher-dashboard-home`. No Sonnet implementation until
Opus records a passing usage preflight for task 1.
