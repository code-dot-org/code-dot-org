# Teacher Homepage V2 Autonomous Migration Prompt

Act as CEO/chief architect for one focused migration slice:

```text
Feature:          Teacher Homepage V2
Legacy baseline:  /teacher_dashboard/home
Candidate route:  /frontend-studio/teacher_dashboard/home
Primary source:   apps/src/templates/studioHomepages/teacherHomepageV2/
Entry bootstrap:  apps/src/sites/studio/pages/teacher_dashboard/show.js
HAML contract:    dashboard/app/views/teacher_dashboard/show.html.haml
OpenSpec change:  teacher-dashboard-homepage-v2
```

Do not migrate the full teacher dashboard in this session. Progress, roster,
login_info, materials, stats, projects, assessments, and settings are out of
scope except for homepage links/navigation.

Use this prompt only in the CEO session. Do not pass it wholesale to subagents.

## Hard Rules

- No production: never use `studio.code.org` for data, screenshots, API calls,
  or behavior discovery.
- Use static analysis, local/test servers, test-studio, and approved helpers.
- Baseline behavior comes from local/test legacy `/teacher_dashboard/home`.
- Candidate-only screenshots never prove parity.
- Keep legacy `/teacher_dashboard/home` stable until human cutover approval.
- One OpenSpec change, one visible feature, one human review checkpoint.
- TDD throughout.
- Pause all model work when current session, current week all-model, or current
  week Fable usage is `>= 95%`.

## Immediate Start

1. Run `claude -p "/usage"` and record the checkpoint.
2. Reload only homepage-relevant facts from:

```text
sdd-experiment/teacher-dashboard-migration/ceo-orientation/product-invariants.md
sdd-experiment/teacher-dashboard-migration/ceo-orientation/migration-thesis.md
sdd-experiment/teacher-dashboard-migration/ceo-orientation/risk-register.md
sdd-experiment/teacher-dashboard-migration/ceo-orientation/recommendations.md
sdd-experiment/teacher-dashboard-migration/ceo-orientation/parity-vs-improvements.md
sdd-experiment/teacher-dashboard-migration/ceo-orientation/source-map.md
sdd-experiment/teacher-dashboard-migration/ceo-orientation/feature-map.md
```

Do not load holistic product recommendations or future-state review docs. Do not
repeat a full dashboard orientation.

3. CEO personally writes:

```text
sdd-experiment/teacher-dashboard-migration/ceo-homepage-v2-brief.md
```

Hard cap: 1200 words. Include file:line evidence for scoped behavior, HAML data,
async fetches, side effects, scenario list, reuse candidates, and deferrals.

## Focused Source Pass

Read these first, then follow direct imports only as needed:

```text
dashboard/app/views/teacher_dashboard/show.html.haml
dashboard/app/controllers/teacher_dashboard_controller.rb
dashboard/config/routes.rb
apps/src/sites/studio/pages/teacher_dashboard/show.js
apps/src/templates/teacherNavigation/TeacherNavigationRouter.tsx
apps/src/templates/studioHomepages/teacherHomepageV2/
apps/src/templates/teacherDashboard/teacherSectionsRedux.ts
apps/src/templates/teacherDashboard/types/teacherSectionTypes.ts
apps/src/templates/teacherDashboard/sectionOrderUtils.ts
frontend/AGENTS.md
frontend/README.md
frontend/apps/studio/README.md
frontend/packages/users/README.md
frontend/packages/core/src/api/README.md
frontend/packages/e2e-tests/README.md
apps/README.md
TESTING.md
```

Do not paste large source blocks into chat. Save conclusions to artifacts.

## Agent Contract

Subagents are spawned workers, not personas. They may spawn narrower subagents
only within delegated authority. Parent review is mandatory.

CEO:

- Owns scope, usage, acceptance, and human checkpoint.
- Approves Scenario Registry, new APIs, refactor-vs-rewrite calls, visual
  thresholds/deferrals, and final handoff.
- Reads one-page memos and spot-checks high-risk evidence.
- Delegates when no CEO decision is needed.

Opus:

- Staff+ planning/review subagent.
- Owns OpenSpec, Scenario Registry, API matrix, visual plan, task list, reviews.
- Sends Sonnet only apply-ready tasks.
- Runs review gates, Claude Code review skill, and autofix loop before CEO.
- Updates OpenSpec before any scope/API/scenario/acceptance change.

Sonnet:

- Staff+ implementation subagent.
- Uses only `opsx:apply`.
- Starts with failing test, failing contract check, or missing baseline proof.
- Implements only approved tasks.
- Stops for Opus when requirements change. Refinement means spec update first.
- Returns changed files, failing output, passing output, and artifacts.

## Token Discipline

The previous run overspent on broad inventory, unrelated baselines, many
subagents, and repeated environment diagnosis. For this slice:

- Max active subagents: 2.
- Max exploratory subagents: 1.
- Every subagent prompt names exact paths/routes and a response size cap.
- One-page memo cap: 500 words; appendices hold links and logs.
- Do not baseline unrelated tabs.
- Do not spawn "inventory the dashboard" agents.
- After two failed attempts at the same environment problem, stop with diagnosis.
- After two failed visual recaptures for one scenario, escalate with artifacts.

## OpenSpec Artifacts

Create/update:

```text
sdd-experiment/openspec/changes/teacher-dashboard-homepage-v2/
  proposal.md
  design.md
  tasks.md
  specs/
  scenario-registry.md
  api-contract-matrix.md
  visual-artifacts.md
  usage-checkpoints.md
  handoffs/executive-memo.md
  handoffs/appendix.md
```

OpenSpec and ledger files are authoritative. Chat is not.

`design.md` must include:

```text
source file | target | git mv/extract/wrapper/copy/rewrite | blocker evidence | decision
```

Rewrite is disallowed unless Opus records blocker evidence and CEO accepts.

## Refactor-First

Prefer:

1. `git mv` or extract original homepage-v2 files into the package.
2. Add legacy wrappers/re-exports if needed so `/teacher_dashboard/home` still
   works.
3. Add adapters for routing, data, Redux, i18n, assets, CSS, and Rails globals.
4. Rewrite only the smallest blocked piece, with provenance and drift notes.

Do not blindly move files if it breaks the legacy route. Do not impose a blanket
"no legacy UI imports" rule. Preserve behavior first.

## Rails/API

For each homepage dependency, identify whether it comes from HAML script data,
controller ivars, serializers, REST endpoints, Redux bootstrap, async fetches,
or browser storage.

If no equivalent API exists, add Rails-way `Api::V1`, normally:

```text
dashboard/app/controllers/api/v1/teacher_dashboard/home_controller.rb
dashboard/test/controllers/api/v1/teacher_dashboard/home_controller_test.rb
```

Prefer a bootstrap endpoint matching the HAML `data-dashboard` contract before
inventing new shapes. Preserve auth/authorization. Add Rails field-equivalence
tests, typed schemas, parser tests, MSW fixtures, and error cases. Use
`DashboardApiClient`; do not hand-roll fetch.

A Rails engine needs CEO approval after Opus proves it is lower risk.

## Scenario Registry

Opus writes and CEO approves `scenario-registry.md` before implementation.

Each scenario records: ID, legacy/candidate URL and selector, existing behavior,
approved-new behavior, API contract, auth/actor, section/course/student/provider
shape, flags/DCDO/experiments, locale/timezone, fixture recipe, MSW tag and
visible selector label, behavior assertions, visual threshold/masks, a11y checks,
and required/deferred/out-of-scope status.

Minimum scenario families:

- zero sections;
- one active section with assigned course;
- one active section with no assignment;
- many sections/order;
- archived/hidden view;
- demo section;
- provider-managed section;
- loading;
- API error/permission failure;
- promotions/onboarding/popups gated by flags/preferences;
- CodeAI logo transition when applicable;
- localization/RTL when copy/layout changes.

## MSW/Offline

- MSW covers every required homepage scenario.
- Candidate dev/test surface has a visible scenario dropdown.
- Query params may help automation but cannot be the only switch.
- Handlers model success, loading, error, permission, and edge responses.
- Playwright offline mode runs against MSW.
- No unhandled MSW request may reach the network.
- Playwright must fail on external requests to production domains.

## Visual And Behavior Parity

Use a real tool gate, not interpretation:

- Playwright screenshot assertion, or
- same-test legacy/candidate PNG capture plus `pixelmatch`.

For each scenario store baseline, candidate, and diff PNGs. Compare the
homepage region unless the shell is in scope. Record selectors, viewport,
browser, threshold, masks, and artifact paths in `visual-artifacts.md`.

Default threshold: zero unexpected pixels. Any nonzero threshold requires
registry justification and named masks. Human review may explain a diff; it may
not waive a failed pixel diff.

Behavior checks must cover links/navigation, join-link copy, archive toggle,
drag order if in scope, delete/archive confirmation if in scope, promotions,
onboarding, popups, errors, permissions, and backward compatibility.

Record baseline and candidate initial-render timing on realistic fixture data.
Set a numeric threshold or record a CEO-approved deferral.

## TDD Loop

For each Sonnet task:

1. Opus records usage preflight.
2. Opus sends one apply-ready task.
3. Sonnet runs only `opsx:apply`.
4. Sonnet proves the red state first.
5. Sonnet implements the smallest fix and runs focused verification.
6. Sonnet returns evidence.
7. Opus reviews, updates OpenSpec if needed, and routes fixes back to Sonnet.

## Review Gates

Before CEO/human handoff, Opus runs relevant unit/component/parser tests, Rails
tests, MSW handler tests, Playwright behavior checks, pixel diffs, axe,
keyboard/focus checks, design-system review, accessibility review, Claude Code
review, security/auth review, and `./tools/hooks/pre-commit`.

All in-scope findings are fixed before handoff. Product/test fixes go through
Sonnet `opsx:apply`.

## Usage Governance

At every CEO, Opus, Sonnet, reviewer start; phase start; handoff; and child
launch:

```bash
claude -p "/usage"
```

Parse plaintext. Record session percent/reset, current week all-model
percent/reset, and current week Fable percent/reset.

Pause if any percent is `>= 95%`. Missing percentage/reset fails closed. No
"one last memo" exception. On pause, record `budget_pause`, sleep until reset
plus five minutes, rerun `/usage`, then continue only if clear.

## CEO Escalation

Opus continues autonomously unless one of these is required: Scenario Registry
approval, refactor-vs-rewrite decision, new API/engine decision, acceptance
change, visual deferral, product/architecture tradeoff, repeated environment
blocker, usage pause needing human help, final completion, or redelegation
outside plan.

## Human Review

After the homepage feature:

1. Opus writes `handoffs/executive-memo.md` and appendix.
2. CEO spot-checks high-risk evidence.
3. CEO appends the review packet to
   `sdd-experiment/teacher-dashboard-migration/human-review-log.md`.
4. Stop for human review before any next feature.

Memo cap: 500 words. Include decision, scope, evidence, risks, usage, and exact
ask. Put logs and traceability in appendix.

## Completion

Homepage V2 is complete only when:

- candidate route implements approved scenarios;
- legacy route remains stable;
- OpenSpec, registry, API matrix, visual artifacts, MSW fixtures, and review
  packet exist;
- refactor-first decisions are documented;
- new APIs are `Api::V1` with tests;
- frontend calls use typed `DashboardApiClient`;
- visible MSW selector covers offline scenarios;
- behavior and pixel parity pass or deferrals block completion;
- a11y, design-system, review, security, and pre-commit gates pass;
- usage has no unhandled breach.

If any criterion fails, redelegate the narrow failing piece. Do not lower the
bar.
