# Executive Memo 02 — Scaffold: pilot-teacher-dashboard-home

## Decision

Phase 2 complete. Scaffold is committed, inspected, and gate-green.
Recommend: authorize Sonnet to start at task 1 via `/opsx:apply
pilot-teacher-dashboard-home` (cwd `sdd-experiment/`), with the batching below.
One pre-existing repo defect to note (not pilot-caused, not fixed here).

## Customer Impact

Still near zero. New code is an empty private workspace package plus one
dependency line in the preprod-only Studio app. No route exists yet; legacy
untouched; nothing reaches production.

## Scope

Done this phase: directed cleanups from ceo-decision-01 (tasks.md 3.2 artifact
fixed; playwright-support ruling recorded as resolved in tasks.md 0.1,
design.md R1, visual-artifacts.md; advisory legacy capture explicitly
Opus-owned in Phase 4); planning artifacts committed (`29a417eecb6`);
`frontend/packages/teacher-dashboard` scaffolded via `yarn turbo gen package`,
inspected, adjusted, and committed as a second commit. Task 0.1 checked off.
Not done (deliberately): any task 1.x+ work.

## Evidence

- Scaffold side effects found and handled: (1) studio package.json workspace
  dep — intended, kept; (2) yarn.lock +30 lines — required, kept; (3) three
  ailab files reformatted by the generator's workspace-wide `lint:fix` —
  unrelated drift, REVERTED; (4) generated `eslint.config.mjs` had two
  import-order errors because the generator's own autofix step aborted — fixed
  with package-scoped lint:fix; (5) dist/node_modules/.turbo untracked by
  ignore rules. No other tracked file changed.
- Post-codegen adjustments per task 0.1: vitest config extends the lint-config
  react preset (jsdom); `@code-dot-org/core: workspace:*` dependency;
  `@vitejs/plugin-react` + `jsdom` devDeps; studio dep confirmed
  generator-added.
- Gates: `yarn turbo run build typecheck lint test
  --filter=@code-dot-org/teacher-dashboard --force` → 13/13 green (package
  1/1 test; core 143/143). Studio consumer check `build typecheck` → 13/13
  green. Workspace-wide `release:dryrun` is NOT green — blocked by a
  PRE-EXISTING e2e-tests lint error (`header.spec.ts` imports
  `../pages/teacher-dashboard`, a directory with no index.ts; introduced by
  staging commit `efa54994177`, before this branch). Details in appendix-02.
- `openspec validate --strict` re-run after cleanups: valid.

## Risk

- Pre-existing e2e-tests lint break fails any workspace-wide lint/dryrun.
  Mitigation: Sonnet must use package/filter-scoped gates (tasks.md verification
  updated by instruction below); upstream fix belongs to staging, not the pilot.
- Sonnet scope creep in the entangled card UI. Mitigation: tasks assert absence
  of mutating controls; refinement-request rule stands.
- MSW handler wiring in core touches shared mocks. Mitigation: task 2.2 is
  additive-only with named files.

## Usage

Phase 2 handoff: session 25%, week-all 48%, week-Fable 9% (resets Jul 3
7:30am / Jul 6 9am PT). All thresholds clear. Checkpoint row 6 is the explicit
PASS preflight for Sonnet task 1 per the hard gate: Sonnet MAY START.

## Ask

1. Approve Sonnet start at task 1 with this batching (each an `/opsx:apply`
   session, cwd `sdd-experiment/`):
   - Session A: tasks 1.1-1.4 + 2.1-2.2 (core schema/parser/hook + fixtures/
     handler — one coherent TDD arc, all in core + package fixtures).
   - Session B: tasks 3.1-3.2 + 4.1-4.2 (component TDD, both states — same
     files, same test file, natural single arc).
   - Session C: tasks 5.1 + 6.1 (route + dev shell — first session needing
     `yarn dev` verification).
   - Session D: task 7.1 (Playwright visual/axe/keyboard) then 8.1 gates.
   Rationale: batch by shared file surface and verification loop; four sessions
   bound blast radius per session and give three review points between arcs.
2. Acknowledge the pre-existing e2e-tests lint defect (fix belongs upstream;
   pilot uses filter-scoped gates until then).
