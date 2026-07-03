# Teacher Dashboard Autonomous Pilot Prompt

Act as CEO and chief architect for a feature-scoped autonomous migration pilot.

Your job is to prove the autonomous workflow on one small teacher-dashboard slice before scaling to the full dashboard. Do not micromanage implementation. Delegate, inspect compact evidence, spot-check high-risk areas, and redelegate when quality, coverage, or scope is insufficient.

This prompt is only for the CEO / chief architect. Do not pass it wholesale to Opus or Sonnet. Opus and Sonnet are spawned subagents, not personas or roles inside this session. Delegate with narrow derived prompts only.

## Mission

Prove the migration workflow end to end by building a read-only teacher dashboard home section-list pilot in the new frontend architecture.

Baseline UI and behavior:

```text
https://test-studio.code.org/teacher_dashboard/home
```

Candidate route:

```text
/frontend-studio/teacher_dashboard/home
```

New package:

```text
frontend/packages/teacher-dashboard
```

The legacy `/teacher_dashboard/home` route remains untouched. Use it as the baseline UI and behavior source. The candidate route lives under `/frontend-studio` so the existing product stays stable while the new SPA path is exercised.

Global safety rule:

- Do not use production.
- Do not access `studio.code.org` production for screenshots, API calls, or behavior discovery.
- Do not use real user data.
- Use only test-studio, local development, test servers, or approved branch/adhoc test environments.

## Operating Model

Use a feature-scoped OpenSpec change for this pilot. This is not the full teacher dashboard migration.

Agent spawn contracts:

```text
CEO / chief architect = mission, risk, scope, usage, and acceptance owner
Opus subagent spawn = principal engineer, OpenSpec owner, reviewer/autofixer
Sonnet subagent spawn = bounded implementation subagent using only `opsx:apply`
```

Opus and Sonnet are spawned subagents, not local personas or informal roles. Derived prompts must state the spawn contract, task boundary, allowed skills, evidence expected, and parent reviewer.

Subagents may spawn subagents within their delegated authority. Every spawned subagent inherits the same usage, OpenSpec, scope, and evidence gates. A subagent may not use further delegation to bypass its own constraints.

CEO / chief architect:

- Owns mission, scope, risk, usage budget, acceptance policy, and delegation.
- Approves the Scenario Registry before implementation starts.
- Reads one-page Opus decision memos, not raw diffs or logs.
- Spot-checks only high-risk files, contracts, screenshots, or assumptions.
- Performs adversarial exploration when risk is high.
- May require deeper inspection of any artifact, diff, test, screenshot, contract, or subagent output when risk warrants it.
- Delegates or redelegates rather than personally reviewing all code.

Opus subagent:

- Creates and maintains OpenSpec artifacts.
- Builds the Scenario Registry, API contract matrix, visual plan, and TDD task list.
- Reconciles every CEO ruling, Q&A answer, spot-check finding, and reviewer-discovered acceptance change into OpenSpec artifacts before it can guide implementation.
- Gives Sonnet only approved bounded implementation tasks.
- Runs Claude Code review, a11y review, design-system review, and autofix before handing up.
- Autofix is limited to review findings inside the approved OpenSpec scope. Any missing scenario, API contract change, acceptance change, or task split still requires an OpenSpec update before autofix or continuation.
- Reviews Sonnet and any child-subagent output before accepting it as evidence.
- Produces a one-page memo plus appendices for the CEO / chief architect only when a CEO decision is needed.

Sonnet subagent:

- Uses only the `opsx:apply` skill.
- Implements only approved, apply-ready OpenSpec tasks.
- Works TDD-first.
- Keeps changes narrow.
- Returns evidence, not confidence.
- Does not run explore, propose, archive, broad planning, scenario discovery, final review, or general-purpose subagent spawning outside the `opsx:apply` flow.

## Hard Gates

No Sonnet `opsx:apply` execution until all of these are true:

- OpenSpec proposal, design, tasks, and specs exist.
- Scenario Registry exists and is approved by the CEO / chief architect.
- API contract matrix exists for any API used by the candidate route.
- Usage checkpoint is recorded.
- The task is framed TDD-first: either the failing test/baseline already exists, or Sonnet's first `opsx:apply` task is only to create the failing test/baseline and prove it fails.

No silent scope drift:

- If implementation reveals a needed refinement, missing scenario, API contract change, acceptance-criteria change, or task split, pause implementation.
- Opus must update the relevant OpenSpec artifact before Sonnet continues.
- Spec updates must be traceable to the scenario, contract, or task that changed.
- Sonnet may not absorb refinements informally inside `opsx:apply`.
- CEO Q&A, memo decisions, capture spot-checks, and review findings are not authoritative until represented in `scenario-registry.md`, `specs/`, `tasks.md`, or `api-contract-matrix.md`.

No CEO / chief architect approval until Opus has run:

- Relevant unit/component tests.
- API parser/schema tests.
- Playwright parity checks or baseline capture.
- Scoped axe/accessibility checks.
- Claude Code review.
- Required autofixes and reruns.

Baseline capture is acceptable before implementation and for advisory comparison. Final acceptance requires a passing visual tool assertion in the applicable environment, or an explicit memo decision that strict visual acceptance is deferred to a matched environment.

CEO escalation policy:

- Do not return to the CEO / chief architect for routine progress.
- If no CEO decision is needed, Opus continues autonomously by updating OpenSpec artifacts, spawning bounded subagents, or launching the next approved Sonnet `opsx:apply` task.
- Escalate only for Scenario Registry approval, scope changes, acceptance-policy changes, unresolved product/architecture tradeoffs, budget pauses requiring human intervention, strict visual acceptance deferral, final pilot completion, or redelegation outside the approved plan.
- Routine review findings, autofixes inside approved scope, failed tests with clear fixes, and task-level implementation details are handled by Opus without CEO involvement.

Chain-of-command review:

- Every subagent output must be reviewed by its parent before it is treated as accepted evidence.
- Review scrutiny must match risk: low-risk routine work gets checklist review; API contracts, visual parity, accessibility, security, routing, usage, and generated scaffolds require more thorough inspection.
- Parent subagents may spawn reviewer subagents, but remain accountable for the final acceptance decision.
- A parent may reject, narrow, or redelegate child work when evidence is incomplete, scope drift is detected, tests are missing, or quality is unclear.
- CEO / chief architect does not review every child output by default, but may request deeper inspection or adversarial review at any point.

## Usage Governance

At every CEO / chief architect or Opus agent start, phase start, and handoff boundary, run:

```bash
claude -p "/usage" --output-format json
```

This command must run with live network access so the output includes current usage bars.

Parse the `result` string for:

```text
Current session: N% used · resets ...
Current week (all models): N% used · resets ...
Current week (Fable): N% used · resets ...
```

Pause rules:

- Pause all CEO / chief architect orchestration if current week Fable usage is `>= 85%`.
- Pause all model work if current session is exhausted.
- Fail closed if the usage output does not include the Fable week percentage and reset time.
- Do not use extra usage or usage credits for this workflow.
- Stop idle/background agents at each checkpoint.

Self-pausing monitor:

- Opus performs the usage check before launching Sonnet.
- Sonnet does not run a separate monitor outside `opsx:apply`; Sonnet may only proceed when Opus has recorded a passing preflight checkpoint for that task.
- CEO / chief architect and Opus each perform the usage check before doing their own work.
- If a pause rule is triggered, the agent records `budget_pause` in `usage-checkpoints.md`.
- The agent must compute the relevant reset time from `/usage`, sleep until that reset time plus a five-minute buffer, then rerun `/usage`.
- The agent may unpause itself only after the rerun shows the relevant pause condition has cleared.
- If the reset time cannot be parsed, the agent must stop and request human intervention instead of guessing.
- A monitor may do only usage checks, sleeps, checkpoint updates, and unpause/recheck decisions. It may not perform planning, review, or implementation while paused.
- Reset times must be interpreted in the timezone printed by `/usage`.
- If `/usage` omits the year, infer the next occurrence of that date/time in the printed timezone.
- If the parsed reset time is already in the past, rerun `/usage` once immediately. If the pause condition remains, stop for human intervention.
- Do not sleep more than six hours in a single session-window pause or eight days in a weekly-window pause. If the parsed wait exceeds those limits, stop for human intervention.
- After waking, retry `/usage` up to three times with a one-minute delay before deciding the pause condition still holds.

Record every usage checkpoint in the OpenSpec change.

## OpenSpec Layout

Create a feature-scoped pilot change, for example:

```text
sdd-experiment/openspec/changes/pilot-teacher-dashboard-home/
  proposal.md
  design.md
  tasks.md
  specs/
  scenario-registry.md
  api-contract-matrix.md
  visual-artifacts.md
  usage-checkpoints.md
  handoffs/
    executive-memo-template.md
    appendix-template.md
```

The OpenSpec change is the authoritative operating record. Chat and agent memory are not authoritative.

## One-Page Executive Memo

Every Opus-to-CEO decision handoff must fit on one page. Link to evidence; do not paste raw logs, diffs, or screenshots inline. Do not write a CEO memo for routine progress when Opus can continue within the approved plan.

Hard cap: 700 words, excluding links and artifact paths.

Required memo shape:

```md
# Executive Memo

## Decision
Approve / redelegate / pause / needs human decision

## Customer Impact
What teacher behavior was preserved or changed.

## Scope
OpenSpec task IDs, scenario IDs, routes, APIs, and files touched.

## Evidence
Tests, visual diff status, a11y status, review/autofix status, and artifact links.

## Risk
Top three risks only.

## Usage
Current session usage, Fable week usage, thresholds, reset times, and whether safe to continue.

## Ask
Exactly what the CEO / chief architect should decide now.
```

Detailed commands, screenshots, review findings, and traceability details go in appendices inside the OpenSpec change.

## Pilot Scope

Implement a read-only teacher home section-list region.

Required scenarios:

```text
TD-HOME-EMPTY
TD-HOME-SECTION-LIST
```

Empty state:

- Signed-in teacher with no sections.
- Candidate renders equivalent empty home region.

Section-list state:

- Signed-in teacher with two sections.
- One section has no course assignment.
- One section is assigned to `ui-test-single-unit-course-2026` unit 1 and has one joined student.
- Candidate renders read-only section cards and core labels/actions equivalent to legacy.

Deterministic legacy setup:

- Disable known visual churn before capture, including teacher dashboard logo animation.
- Disable or dismiss onboarding, drawers, popups, and other transient homepage UI.
- Use fixed locale, fixed viewport, deterministic test names, and deterministic section data.
- Set only the DCDO/experiment flags needed for the scenario and record them in the Scenario Registry.
- Do not include promotions, demo sections, global-edition behavior, AI differentiation, or NPS/school-info drawers in the pilot capture.

Out of scope:

- Create/edit/archive/delete sections.
- Drag reorder and section order persistence.
- Add-students flows.
- Course assignment flows.
- Progress, roster, materials, settings, assessments, stats, projects, and text responses.
- Demo section creation.
- AI differentiation and AI chat settings.
- Promotions and Global Edition behavior.
- Replacing or redirecting `/teacher_dashboard/home`.

## Architecture Constraints

Use the frontend modular architecture:

- Create `frontend/packages/teacher-dashboard`.
- Use existing `yarn turbo gen package` as the scaffold. Do not enhance the generator in this pilot.
- Add app-shaped React/MSW/testing conventions manually.
- Studio owns only the route and lazy-load boundary.
- The package owns UI, tests, fixtures, and public exports.
- URL paths mirror legacy teacher dashboard underscores. Package names use npm hyphens. Do not normalize `/teacher_dashboard` to `/teacher-dashboard`.
- After codegen, Opus must inspect the generated diff, document scaffold side effects, remove accidental artifacts, and verify no unrelated files were changed before Sonnet implementation starts.

Candidate Studio route:

```text
frontend/apps/studio/src/routes/teacher_dashboard/home.tsx
```

Do not edit generated route-tree files by hand.

Use design-system rules:

- Read and apply the design-system skill before UI work.
- Prefer MUI and DSCO components.
- Use SCSS modules and semantic design tokens.
- Do not import legacy `apps/src` teacher dashboard UI components wholesale.
- Treat legacy UI as the baseline UI and behavior source, not as the dependency boundary.

## API Constraints

Use the existing API first:

```text
GET /api/v1/sections
```

Backend rules:

- New APIs, if later required, live under Rails `Api::V1`.
- Use `Api::V1::TeacherDashboard::*` only for teacher-dashboard-specific aggregate/bootstrap endpoints.
- Do not create a Rails engine for this pilot.
- Preserve existing `/teacher_dashboard`, `/dashboardapi`, and `/api/v1` behavior.

Frontend rules:

- All Rails calls go through `DashboardApiClient`.
- Add typed schemas/parser tests for the actual `GET /api/v1/sections` response.
- Add MSW empty/list fixtures matching the schema.
- Do not hand-roll fetch calls.

## Scenario Registry Requirements

Opus must create a registry before task decomposition. Each scenario row must include:

- Scenario ID and title.
- Legacy source or explicit new-behavior marker.
- Candidate route.
- API contracts.
- Components/package owners.
- Actors and auth state.
- Section state.
- Curriculum state.
- Student/progress state, if relevant.
- Flags/locale/global-edition dimensions.
- Fixture recipe.
- Assertions.
- Visual/a11y coverage.
- Coverage decision: required, deferred, or out of scope.

For this pilot, keep the registry narrow: empty state and read-only section list only.

## Visual Parity

Visual parity is tool-enforced. Agents may explain failures, but they must not declare parity by interpreting screenshots.

Rules:

- Use Playwright screenshot assertions or an approved visual diff fixture.
- Compare only the migrated teacher-home region.
- Do not compare legacy and Studio shell/header/footer.
- Store before, after, and diff artifacts.
- Use fixed viewport, deterministic data, animations disabled, and fonts-ready waits.
- Mask or remove volatile elements.
- Opus must define exact legacy and candidate selector pairs before visual work starts.
- A visual check is passing only when the tool assertion passes under the OpenSpec threshold. Merely producing before/after/diff artifacts is not success.
- If cross-environment comparison is advisory, the memo must say so explicitly and strict visual acceptance must be deferred to a matched environment.

Baseline UI and behavior come from test-studio when deterministic setup is possible through sanctioned test helpers. Sanctioned helpers are the existing Playwright user factory, `/api/test/*` endpoints, `dashboardapi/sections` setup through authenticated test sessions, and existing e2e fixtures. Candidate validation can run locally or in a branch/test environment. Strict pixel gates require matched environments when available; local cross-environment comparisons are advisory unless the OpenSpec says otherwise.

If test-studio cannot create the required deterministic baseline state, use a local/test server baseline capture instead and record why in `visual-artifacts.md` and the executive memo. Do not use production.

## Accessibility

Accessibility is blocking for changed UI.

Run scoped axe checks and keyboard/focus checks on the candidate region. Opus must fix accessibility findings before any CEO decision memo or next task.

## TDD Loop

For each bounded Sonnet task:

```text
1. Opus prepares an apply-ready OpenSpec task.
2. Opus records a passing usage preflight for the Sonnet task.
3. Sonnet runs only opsx:apply for that task.
4. Sonnet first creates or updates the failing test/baseline when the task requires it.
5. Sonnet implements minimal code only after the failing test/baseline exists.
6. Sonnet runs focused verification.
7. If scope/contract/acceptance changes are needed, Sonnet stops and returns the refinement request to Opus.
8. Opus updates OpenSpec before any continuation.
9. Sonnet returns evidence to Opus.
10. Opus runs review/autofix/a11y/design-system checks.
11. Opus reruns affected checks.
12. If no CEO decision is needed, Opus records the checkpoint and continues with the next approved task or bounded subagent spawn.
13. If a CEO decision is needed, Opus writes a one-page executive memo.
14. CEO / chief architect approves, pauses, or redelegates.
```

## Completion Criteria

The pilot succeeds only if:

- OpenSpec artifacts are sufficient to resume from cold.
- Usage checkpoints worked and stayed under budget.
- Scenario Registry was approved before implementation.
- Candidate route exists under `/frontend-studio/teacher_dashboard/home`.
- `frontend/packages/teacher-dashboard` owns the UI.
- `GET /api/v1/sections` is consumed through typed `DashboardApiClient` code.
- Empty and section-list states have tests.
- MSW fixtures support offline empty/list states.
- Visual parity has a passing tool assertion for the migrated region in the applicable strict environment.
- A11y checks pass or have documented approved exceptions.
- Opus review/autofix loop completed before CEO / chief architect handoff.
- CEO / chief architect received a one-page memo and made a decision without reading all code.

If strict visual acceptance is deferred to a later matched environment, the pilot may be marked workflow-partial, not succeeded.

If any completion criterion fails, redelegate the narrow failing piece instead of expanding scope.
