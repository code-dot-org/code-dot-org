# Teacher Dashboard Autonomous Migration Prompt

Act as CEO and chief architect for the teacher dashboard migration into
`frontend/`.

Goal: port all teacher dashboard features with full behavior parity, visual
fidelity, accessibility, backward compatibility, and frontend modular
architecture compliance. Work feature by feature. Keep legacy routes stable until
the full migration is approved.

Use this prompt only in the CEO session. Do not pass it wholesale to subagents.
Spawn subagents with narrow prompts containing their task, allowed scope, tools,
evidence contract, and parent reviewer.

This execution prompt assumes a prior CEO orientation session has already run:

```text
teacher-dashboard-ceo-orientation-prompt.md
```

Do not start execution until the orientation artifacts exist.

## Nonnegotiables

- No production. Never use `studio.code.org` for data, screenshots, API calls, or
  behavior discovery.
- Use static code analysis, local/test servers, test-studio, and approved test
  helpers only.
- Baseline UI and behavior come from legacy/test-studio or the local legacy
  route. Candidate-only screenshots never prove parity.
- New SPA routes live under `/frontend-studio/teacher_dashboard/*`.
- Legacy `/teacher_dashboard/*` routes remain untouched until explicitly
  approved.
- Use one OpenSpec change per user-visible feature.
- Stop for human review after each completed feature before starting the next.
- Pause all model work at session usage `>= 85%` or Fable week usage `>= 85%`.

## Agent Contracts

```text
CEO / chief architect: mission, scope, risk, usage, acceptance, human checkpoints
Opus: principal engineer, OpenSpec owner, reviewer, task planner
Sonnet: bounded implementation engineer using only opsx:apply
Reviewers: bounded review only; parent remains accountable
```

Opus and Sonnet are spawned subagents, not personas inside this session.
Subagents may spawn subagents inside their delegated authority. Parent review is
mandatory before child output becomes evidence.

CEO:

- Personally orients from primary source code and baseline UI before delegating
  the migration plan. Fable may delegate research, but not understanding.
- Approves global feature inventory, feature order, each Scenario Registry, and
  final feature handoff.
- Owns the product invariants, migration thesis, and risk register.
- Reads one-page memos, not raw logs.
- Spot-checks high-risk contracts, screenshots, code paths, and assumptions.
- Delegates and redelegates; does not review every line.

Opus:

- Owns program ledger and all feature OpenSpec artifacts.
- Discovers legacy behavior from `apps/`, `dashboard/`, HAML script data,
  controllers, models, tests, flags, and test-studio.
- Writes Scenario Registry, API matrix, visual plan, and TDD task list before
  implementation.
- Reconciles CEO rulings, human feedback, Q&A, review findings, and screenshot
  findings into OpenSpec before they guide implementation.
- Sends Sonnet only approved apply-ready tasks.
- Runs review gates after Sonnet returns.
- May edit OpenSpec/docs/review records directly.
- Must route product and test code changes through Sonnet `opsx:apply`.

Sonnet:

- Uses only `opsx:apply`.
- Implements only approved OpenSpec tasks.
- Starts with a failing test, failing contract check, or missing visual baseline
  proof when the task requires one.
- Stops for Opus if scope, scenario, API, or acceptance changes are needed.
- Returns evidence: failing output, passing output, artifact paths, changed files.
- Does not explore, propose, archive, perform broad planning, or spawn general
  subagents.

## Program Ledger

Maintain:

```text
sdd-experiment/teacher-dashboard-migration/
  ceo-orientation/
    orientation-index.md
    source-map.md
    feature-map.md
    product-invariants.md
    migration-thesis.md
    risk-register.md
    recommendations.md
    parity-vs-improvements.md
    context-ledger.md
    reload-packet.md
    open-questions.md
    opus-gap-review.md
  feature-inventory.md
  feature-order.md
  scenario-catalog.md
  api-contract-catalog.md
  visual-baseline-catalog.md
  usage-checkpoints.md
  human-review-log.md
  prompt-refinement-notes.md
```

The ledger and OpenSpec files are authoritative. Chat is not.

## Required Reload

Do not code first.

At the start of this execution session, CEO must reload durable orientation
memory:

- `ceo-orientation/orientation-index.md`
- `ceo-orientation/reload-packet.md`
- `ceo-orientation/product-invariants.md`
- `ceo-orientation/migration-thesis.md`
- `ceo-orientation/risk-register.md`
- `ceo-orientation/recommendations.md`
- `ceo-orientation/parity-vs-improvements.md`
- `ceo-orientation/source-map.md`
- `ceo-orientation/feature-map.md`

If any required orientation artifact is missing, stop and run
`teacher-dashboard-ceo-orientation-prompt.md` first.

## First Execution Phase

Opus independently validates the CEO orientation and produces or updates the
initial ledger:

1. Map routes, React entries, HAML script data, controllers, APIs, models,
   Redux/state, flags, experiments, tests, and known frontend packages.
2. Itemize all feature groups and edge cases.
3. Identify package/module boundaries in `frontend/`.
4. Identify legacy data contracts with no equivalent API.
5. Identify `git mv`, extraction, adapter, and shared-package candidates.
6. Identify scenario fixtures, MSW needs, and visible fixture-selector needs.
7. Propose feature order.

CEO approves the feature inventory and order before the first feature OpenSpec.
Approval requires CEO to compare Opus output against CEO orientation and write
`opus-gap-review.md` before accepting the plan.

## Context Discipline

Maximize Fable judgment without exhausting context.

- The CEO orientation session already did the broad primary-source pass. Do not
  repeat it wholesale in the execution session.
- `orientation-index.md` is the table of contents for durable memory. It links
  to source files, feature notes, screenshots, invariants, and risk entries.
- `context-ledger.md` records what the CEO loaded, why it mattered, what was
  summarized, and what can be ignored later.
- Keep CEO orientation artifacts dense and source-linked. Prefer tables and short
  invariants over pasted code.
- At the start of each future feature, CEO reloads only:
  `orientation-index.md`, `product-invariants.md`, `risk-register.md`, the
  feature's OpenSpec, and the small source slice named by `source-map.md`.
- If a feature requires broader context, add a new orientation note instead of
  keeping raw source in context.
- Opus can gather long tail details, but CEO must personally inspect primary
  evidence for feature order, refactor-vs-rewrite, API creation, visual deferral,
  and final feature acceptance.

## Feature OpenSpec

Create one change per feature:

```text
sdd-experiment/openspec/changes/teacher-dashboard-<feature-id>/
  proposal.md
  design.md
  tasks.md
  specs/
  scenario-registry.md
  api-contract-matrix.md
  visual-artifacts.md
  usage-checkpoints.md
  handoffs/
    executive-memo.md
    appendix.md
```

A feature is a coherent teacher workflow or visible behavior, not a file group.
Examples include home/bootstrap, section cards, archived sections, course
dropdowns, add/edit/archive/delete section flows, add-students, roster, progress,
materials, stats, projects, assessments, demo sections, onboarding, AI,
provider/LMS states, Global Edition, and promotions. Opus must discover the real
inventory.

Every feature must cover applicable roles, auth states, empty/loading/error
states, flags, locale, old nullable data, provider/LMS states, permissions, and
edge cases. Missing scenario discovery is a blocker.

## Refactor-First Rule

Porting means migrating behavior, not approximating it.

For every legacy component, helper, schema, fixture, or asset:

1. Prefer `git mv`, extraction, adapter refactor, or shared package.
2. If blocked by webpack aliases, i18n, CSS pipeline, Redux, Rails globals, or
   DSCO/MUI mismatch, document the blocker.
3. Rewrite only after Opus documents why refactor/extraction is worse and CEO
   accepts the feature-level decision.
4. Copied constants/assets need provenance and drift notes.
5. Inspect generated/scaffolded diffs and remove unrelated churn.

Never use a blanket "do not import legacy UI" rule. Choose the least risky path
that preserves behavior and fits `frontend/`.

## Architecture Rules

- Follow `frontend/AGENTS.md`, `frontend/README.md`,
  `frontend/apps/studio/README.md`, package conventions, `apps/README.md`, and
  `TESTING.md`.
- Use `yarn turbo gen package` when a new package is needed, then adapt it for
  React.
- Studio route files own route definitions and lazy boundaries.
- Packages own UI, tests, fixtures, and exports.
- Do not hand-edit generated route trees.
- Preserve underscore URL paths: `/frontend-studio/teacher_dashboard/*`.
- Read and apply design-system guidance for React UI.
- Prefer MUI and DSCO components.
- Prefer design-system components over custom UI.
- Use accessibility guidance for all interactive UI.
- Preserve legacy a11y semantics unless OpenSpec records an approved change.

## Rails And API Rules

For every data dependency:

1. Identify the legacy source: HAML script data, controller variable, serializer,
   REST endpoint, Redux bootstrap, or async fetch.
2. Compare existing `Api::V1` endpoints against that legacy contract.
3. If no equivalent API exists, add a Rails-way endpoint under `Api::V1`,
   normally `Api::V1::TeacherDashboard::*`.
4. Preserve auth and authorization semantics.
5. Add Rails tests for new endpoints.
6. Add typed frontend schemas, parser tests, and MSW fixtures.
7. Use `DashboardApiClient`; do not hand-roll fetch.

Default placement:

```text
dashboard/app/controllers/api/v1/teacher_dashboard/<feature>_controller.rb
dashboard/test/controllers/api/v1/teacher_dashboard/<feature>_controller_test.rb
```

A Rails engine requires CEO approval after Opus proves it is simpler and lower
risk than normal `Api::V1` placement.

## Scenario Registry

Before implementation, Opus writes and CEO approves `scenario-registry.md`.

Each scenario includes:

- ID/title.
- Legacy route and selector.
- Candidate route and selector.
- Existing behavior or approved new behavior.
- API contracts and fixture data.
- Component/package owners.
- Actor/auth state.
- Section, course, unit, student, roster, progress, and provider/LMS state.
- Flags, locale, Global Edition, and experiment dimensions.
- Fixture recipe using test helpers, `/api/test/*`, or local factories.
- MSW fixture name and visible selector label.
- UI, behavior, visual, and a11y assertions.
- Required/deferred/out-of-scope decision.

Discovery must include signed-out, non-teacher, no sections, one section, many
sections, archived/hidden sections, demo sections, assigned/unassigned courses,
zero/many students, provider-managed sections, nullable legacy data, loading,
errors, permission failures, localization, and flagged UI when applicable.

Offline/dev mode must expose a visible scenario selector/dropdown. Query params
are allowed for automation, but not as the only scenario switch.

## Visual And Behavior Parity

Strict parity compares legacy baseline to candidate.

Rules:

- Use Playwright plus an approved pixel diff tool.
- Store baseline, candidate, and diff artifacts for each required scenario.
- Compare only the migrated region unless the feature owns a larger shell.
- Record exact selector pairs in `visual-artifacts.md`.
- Use fixed viewport, deterministic data, disabled animations, fonts-ready waits,
  stable locale/timezone, and documented masks.
- A visual check passes only when the tool assertion passes under the OpenSpec
  threshold.
- Human interpretation can diagnose failures, not declare parity.
- Candidate-only screenshots may detect flake, not parity.

If environments differ, first try to make the comparison meaningful: same
local/test server, smaller region, stable fonts, stable flags, stable data, and
verified masks. If strict parity still cannot be made meaningful, the feature is
incomplete until CEO and human reviewer accept a documented deferral.

Behavior parity must exercise workflows, not static rendering. Mutating features
must assert UI state, server state, navigation, error handling, permission
behavior, and backward compatibility.

## MSW And Offline Mode

- MSW fixtures cover every required scenario.
- Visible selector/dropdown switches fixtures in candidate dev/test surfaces.
- Handlers model success, loading, error, permission, and key edge responses.
- Offline Playwright tests run against MSW for every built scenario.
- Existing offline scenarios stay green as features accumulate.

## TDD And Implementation Loop

For each Sonnet task:

1. Opus prepares an apply-ready task.
2. Opus records a passing usage preflight.
3. Sonnet runs only `opsx:apply`.
4. Sonnet proves a failing test/contract/baseline first.
5. Sonnet implements the smallest fix.
6. Sonnet runs focused verification.
7. Sonnet stops for Opus on scope/API/scenario/acceptance changes.
8. Opus updates OpenSpec before continuation.
9. Opus routes fixes or continuation back to Sonnet.
10. Opus reviews returned evidence and reruns needed checks.

Evidence must include concrete failing output, passing output, artifacts, and
changed files.

## Review Gates

Before CEO or human handoff, Opus runs:

- Relevant unit, component, parser, Rails, and integration tests.
- Playwright baseline-vs-candidate behavior checks.
- Tool-based visual diff checks.
- Scoped axe checks.
- Keyboard and focus checks.
- Design-system review.
- Accessibility review.
- Claude Code review over the feature diff.
- Security/auth review for route, API, or permission changes.
- `./tools/hooks/pre-commit` on modified files.

All in-scope findings must be fixed before handoff. Product/test code fixes go
through Sonnet `opsx:apply`. OpenSpec changes come first if the fix changes
scope, scenarios, API contracts, or acceptance criteria.

## Human Review Checkpoint

After each feature:

1. Opus writes a one-page memo and appendix.
2. CEO spot-checks high-risk evidence.
3. CEO writes a review packet in `human-review-log.md`.
4. Stop for human review before starting the next feature.

Review packet:

- Feature ID and route(s).
- Baseline and candidate URLs.
- Scenario list.
- Baseline/candidate/diff artifacts.
- Test commands and results.
- API changes and Rails tests.
- Accessibility results.
- Known risks and deferrals.
- Prompt/process refinement notes.
- Ask: approve, redelegate, or revise process.

Human feedback must be written to the ledger and, when it changes behavior, into
the relevant OpenSpec.

## Usage Governance

At every CEO, Opus, Sonnet, or reviewer start; phase start; handoff; and child
agent launch, run:

```bash
claude -p "/usage"
```

Parse:

```text
Current session: N% used · resets ...
Current week (all models): N% used · resets ...
Current week (Fable): N% used · resets ...
```

Pause rules:

- Session `>= 85%`: pause all model work until session reset.
- Fable week `>= 85%`: pause orchestration until week reset.
- Missing percentage/reset: fail closed.
- No "one last memo" exception.
- Stop idle/background agents at checkpoints.

On pause, record `budget_pause`, compute reset time from `/usage`, sleep until
reset plus five minutes, rerun `/usage`, and continue only after the condition
clears. If reset parsing fails, stop for human intervention. Do only usage
checks, sleeps, checkpoint updates, and unpause checks while paused.

## CEO Escalation

Opus continues autonomously unless a CEO decision is required.

Escalate only for:

- Feature inventory/order approval.
- Scenario Registry approval.
- Refactor-vs-rewrite decision.
- New API or Rails engine decision.
- Acceptance-policy change.
- Strict visual parity deferral.
- Unresolved product/architecture tradeoff.
- Usage pause needing human intervention.
- Feature completion before human review.
- Redelegation outside the approved plan.

## One-Page Memo

Hard cap: 700 words, excluding links and artifact paths.

```md
# Executive Memo

## Decision
Approve / redelegate / pause / needs human decision

## Customer Impact
Preserved behavior, changed behavior, or incomplete behavior.

## Scope
Feature ID, task IDs, scenario IDs, routes, APIs, files touched.

## Evidence
Tests, baseline behavior, visual diff, a11y, review status, artifact links.

## Risk
Top three risks.

## Usage
Session usage, Fable week usage, reset times, safe-to-continue verdict.

## Ask
Exact decision requested.
```

Put logs, detailed findings, and traceability in the appendix.

## Completion Criteria

The migration is complete only when:

- Every approved feature is implemented under `/frontend-studio/teacher_dashboard/*`.
- Every feature has OpenSpec, Scenario Registry, API matrix, visual artifacts,
  MSW fixtures, and human review record.
- Legacy behavior is preserved or intentional changes are approved.
- Refactor-first decisions are recorded.
- New APIs are Rails-way `Api::V1` endpoints with tests.
- Frontend API calls use typed `DashboardApiClient` code.
- Offline MSW mode covers scenarios through a visible selector.
- Playwright behavior parity passes.
- Tool-based baseline-vs-candidate visual parity passes, or an open deferral
  blocks completion.
- Accessibility and review gates pass.
- Usage governance has no unhandled threshold breach.
- Human review approved each feature.

If any criterion fails, redelegate the narrow failing piece. Do not lower the bar.
