# Docs journeys reconciliation

Scope: `frontend/packages/e2e-tests/docs-journeys/**` specs, `.docs-evidence/students/**`
and `.docs-evidence/developers/**`. Config already serial (`workers: 1`,
`fullyParallel: false`).

## Tallies

| Run | Total | Passed | Skipped | Failed |
|---|---|---|---|---|
| Before (initial full run) | 39 | 28 | 11 | 0 |
| After (final full run, repeated 3x, consistent) | 43 | 31 | 12 | 0 |

The total test count rose by 4 because `ai-features.spec.ts` was silently
registering **zero** tests (see below); fixing that syntax added 4 `skipped`
tests that were already present in source but invisible to the runner.

Net change in real coverage: 2 tests in `labs-learning.spec.ts` and 1 in
`projects-and-sharing.spec.ts` went from fixme/no-body to real, passing,
screenshot-producing tests. 6 tests in `labs-learning.spec.ts` stay fixme'd for
reasons independent of worker parallelism.

## Fixme resolution (per test)

`frontend/packages/e2e-tests/docs-journeys/labs-learning.spec.ts`:

- **`run, reset, start-over, show-code buttons` → un-fixme'd as `run, reset, and show-code buttons`.**
  The original body was empty (just a comment; never had real assertions).
  Implemented against `/courses/coursea-2017/units/1/lessons/6/levels/2`
  (Course A, `course_version_id: 78`, the first real Maze puzzle — lesson 6
  level 1 is an intro video, per `dashboard/config/scripts_json/coursea-2017.script_json`).
  Verifies and screenshots `#runButton`, `#show-code-header`, and
  `#resetButton` (visible only after Run is clicked, per `GameButtons.jsx`).
  Dropped "start-over" from the title/scope: classic Blockly levels have no
  dedicated Start Over control (`msg.resetProgram()` renders "Reset", not
  "Start Over" — grepped `apps/i18n/common/en_us.json`); that control only
  exists in App Lab/Game Lab (lab2), whose own journeys stay fixme'd below.
  Had to extend the shared `dismissOverlays()` helper to also click away
  `#overlay` (`apps/src/templates/Overlay.jsx`, a click-to-dismiss backdrop
  tied to the instructions panel) — it was intercepting the Run click.
  Ran 3x serially: stable pass, ~7s each.
- **`instructions panel` → un-fixme'd, unchanged title.** Same maze level;
  verifies and screenshots `.uitest-instructionsTab`. Ran 3x serially: stable
  pass, ~6-7s each.
- **`video level loads`, `Dance Party workspace`, `Music Lab workspace`,
  `App Lab workspace`, `Game Lab workspace`, `Java Lab workspace` → kept
  fixme'd, reasons unchanged (Game Lab's reason tightened to name the same
  seed-data cause as App Lab).** These were never actually about parallel
  workers — their existing comments already state independent causes: a
  full-viewport screenshot violates the crop-only rule (video, Dance Party),
  Music Lab loads too slowly for a stable crop, App/Game Lab project URLs
  depend on seed data that isn't stable across environments, and Java Lab
  needs the `javabuilder` service, unavailable locally. I did not re-run
  these against the live dashboard — their bodies are empty stubs (same as
  the two above before the fix), and their stated causes are orthogonal to
  worker count, so serial mode doesn't change their status. **Flag for the
  orchestrator:** the task brief describes all 8 of these labs-learning/
  projects-and-sharing fixmes as parallel-worker timeouts; only 2 of the 8
  actually were (or rather, had no real body to time out at all — see next
  section). The other 6 have distinct, already-documented product/env causes.

`frontend/packages/e2e-tests/docs-journeys/projects-and-sharing.spec.ts`:

- **`remix button crop` → un-fixme'd.** Body was empty (comment: "Artist
  project creation times out inconsistently in local dev"). Implemented
  mirroring the already-passing `share dialog crop` test: `/projects/artist/new`
  → wait for `**/edit` → screenshot `.project_remix` (verified real, stable
  class in `apps/src/code-studio/components/header/ProjectRemix.jsx`, same
  pattern as `.project_share`). Ran 3x serially: stable pass, ~4s each. This
  also fixes `students/projects/sharing-and-publishing.json`'s VERIFIED grade
  (see Evidence below) — its `remix-button` screenshot now has a real,
  passing test behind it.

**Root-cause note:** all 9 of the labs-learning/projects-and-sharing fixmes
had *empty test bodies* (`() => { /* comment only */ }`), not stale
selectors in working code. There was nothing to "un-fixme and see if it still
times out" — I had to write new real bodies from scratch, verified against
the live local dashboard (course/level discovery via
`quick_assign_course_offerings`, DOM inspection for real selectors) rather
than against any prior implementation, because none existed (these files are
untracked/new this session, `git log` on them is empty).

`frontend/packages/e2e-tests/docs-journeys/ai-features.spec.ts` (not in the
brief's original list of 8, found via the same `test.fixme` grep):

- **Bug fixed, not a coverage change.** All 4 calls used
  `test.fixme(title, "reason string")`. Playwright's `test.fixme(title, body)`
  requires `body` to be a callback (`frontend/node_modules/playwright/types/test.d.ts:4695`);
  passing a string silently registers **zero tests** — `--list` on this file
  alone reported "Total: 0 tests in 0 files", and the file contributed
  nothing to either tally above. Rewrote each call as
  `test.fixme(title, () => { /* same reason, now a comment */ })` so they
  show up as `skipped` (4 tests) instead of vanishing. No evidence file
  references `ai-features.spec.ts`, so this didn't move any grade — flagging
  it because it's a real, currently-shipped bug independent of this task.

`give-feedback.spec.ts:10` and `view-progress.spec.ts:74` use `test.skip`, not
`test.fixme` — out of scope for this task's fixme sweep, left untouched.

## Evidence cross-check (`.docs-evidence/students/`, `.docs-evidence/developers/`)

11 files in `students/` carry `verification.result: "VERIFIED"`; 0 files in
`developers/` do (all `STRONGLY_SUPPORTED` or `OBSERVED` — nothing to check
there).

- **`students/learning/working-on-a-level.json` — downgraded VERIFIED →
  STRONGLY_SUPPORTED.** Its 5 screenshots (`run-button`, `reset-button`,
  `start-over`, `instructions-panel`, `show-code-toggle`) all cited
  `labs-learning.spec.ts` as the journey; before this pass, all 5 rested on
  empty fixme'd tests. After the fix, 4 of 5 are now real and passing;
  `start-over` still has no backing test anywhere (classic Maze has no such
  control — see above), so the grade can't return to VERIFIED. Added a note
  explaining the partial resolution.
- **`students/projects/sharing-and-publishing.json` — left at VERIFIED, now
  actually earned.** Its `remix-button` screenshot previously rested on the
  fixme'd `remix button crop` test; that test now passes for real. (Note:
  this file's own `verification.notes` already says "Lowest: STRONGLY_SUPPORTED"
  while `result` says VERIFIED — a pre-existing internal contradiction I did
  not touch, since it's unrelated to fixme status and outside this task's
  stated criterion; flagging it here in case the orchestrator wants it
  reconciled globally.)
- **`students/projects/managing-your-projects.json` — no change.** Journey
  is `projects-and-sharing.spec.ts`, but the operative coverage
  ("find-your-projects") maps to `student project list loads`, which was
  never fixme'd. No screenshots array to worry about.
- All other 8 VERIFIED files (`your-progress`, `start-your-course`,
  `join-a-section`, `sign-in`, `create-an-account`, `manage-your-settings`,
  `try-an-hour-of-code`, `get-your-certificate`) cite journeys with no
  fixme'd tests at all (`student-screenshots`, `assign-course`,
  `join-section`, `sign-in-student`, `create-student-account`,
  `hour-of-code`) — no change needed.

## Teacher / district-administrator cases for the orchestrator

Did not open or edit anything under `.docs-evidence/teachers/` or
`.docs-evidence/district-administrators/` (out of scope, other agents own
those). Checked which files there reference the 3 specs touched in this
pass:

- `teachers/student-projects-and-sharing.json` (VERIFIED) references
  `projects-and-sharing.spec.ts`, but its cited coverage
  ("see-student-projects") maps to `teacher sees student projects tab`,
  which was never fixme'd — **no action needed**, listed for completeness
  only.
- No teacher/district-administrator file references `labs-learning.spec.ts`
  or `ai-features.spec.ts`.

## Verification

- 3 full serial suite runs (before, after code changes, after lint fixes):
  0 failures each time; tallies stable at 31 passed / 12 skipped / 43 total
  on the last two.
- Each newly un-fixme'd test also run 3x in isolation (`-g` filter): stable.
- `npx tsc --noEmit` and `npx eslint` clean on all 3 edited spec files.
- `npm run evidence:check` (docs/site): "Evidence check passed."
