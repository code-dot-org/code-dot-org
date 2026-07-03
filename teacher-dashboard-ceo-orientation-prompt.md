# Teacher Dashboard CEO Orientation Prompt

Act as CEO and chief architect for the teacher dashboard migration.

This session is orientation only. Do not implement. Do not create feature
OpenSpecs. Do not launch Sonnet. The goal is for the CEO to personally build a
primary-source understanding of Teacher Dashboard, write durable compressed
memory, and stop. A later session will execute the migration from those artifacts.

## Output Directory

Write all orientation artifacts here:

```text
sdd-experiment/teacher-dashboard-migration/ceo-orientation/
```

Required files:

```text
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
```

These files are the permanent memory for the next session. Chat is not.

## Safety

- No production.
- Do not use `studio.code.org`.
- Use static code analysis, local/test servers, test-studio, and approved test
  helpers only.
- Baseline UI and behavior come from legacy/test-studio or the local legacy
  route.
- Do not use real user data.
- Stop at session usage `>= 85%` or Fable week usage `>= 85%`.

## Usage Check

At start, and before any long browser or source-reading pass, run:

```bash
claude -p "/usage"
```

Record checkpoints in:

```text
sdd-experiment/teacher-dashboard-migration/usage-checkpoints.md
```

If current session or Fable week is `>= 85%`, pause until reset plus five
minutes. If reset parsing fails, stop for human intervention.

## CEO Orientation Work

Fable may delegate mechanical search, but not understanding. The CEO must
personally inspect primary evidence for the product model.

Read and map:

- Teacher dashboard routes and redirects.
- Rails controllers, HAML views, script data, helpers, and serializers.
- React entries, routers, top-level homepage, section list, navigation, and major
  feature components in `apps/`.
- Existing `frontend/` architecture and relevant packages.
- Existing APIs, `Api::V1` controllers, `/dashboardapi` routes, and data models.
- Redux/state, query hooks, flags, experiments, DCDO, locale, Global Edition, and
  provider/LMS gates.
- Existing tests, factories, e2e helpers, Playwright fixtures, and MSW patterns.
- Representative baseline UI/behavior in test-studio or local legacy routes.

## Artifact Requirements

`orientation-index.md`:

- Table of contents for all orientation artifacts.
- How to reload context in the next session.
- Links to the highest-value source files and baseline artifacts.

`source-map.md`:

- Route -> controller/HAML/script data -> React entry -> component tree -> data
  source map.
- Mark primary sources the CEO personally inspected.
- Mark likely feature-specific source slices for later reload.

`feature-map.md`:

- Complete initial feature inventory.
- Group features by teacher workflow.
- Include edge cases, flags, provider/LMS states, and known variants.
- Note likely first three features and why.

`product-invariants.md`:

- Nonnegotiable teacher-facing behaviors.
- Visual, copy, navigation, auth, permission, data, accessibility, and
  backward-compatibility invariants.
- Legacy quirks that appear intentional and must be preserved unless later
  approved.

`migration-thesis.md`:

- Architectural thesis for the migration.
- Package/module boundaries likely to work.
- Refactor-first strategy.
- API strategy, including when to create `Api::V1::TeacherDashboard::*`.
- What to avoid.

`risk-register.md`:

- Ranked risks with evidence.
- Include API drift, HAML bootstrap loss, visual mismatch, auth mismatch,
  hidden flags, scenario gaps, over-rewrite, accessibility regressions, and
  context/usage risks.

`recommendations.md`:

- CEO-level recommendations for what to fix first.
- Codebase improvements: architecture, package boundaries, API shape, test
  structure, migration helpers, shared components, stale patterns, and technical
  debt discovered during orientation.
- Product improvements: teacher UX, workflows, confusing legacy behavior,
  accessibility, reliability, performance, observability, and places where the
  product could be better than a literal legacy copy.
- Migration-process improvements: prompt, testing, visual parity process,
  MSW/offline mode, API strategy, review chain, and usage/context management.
- Decisions that should be made before implementation starts.
- Time-sensitive guidance to preserve before the usage window closes.

`parity-vs-improvements.md`:

- Explicitly separate must-preserve parity requirements from proposed codebase
  and product improvements.
- For each item, mark one of: `parity requirement`, `approved intentional
  change`, `recommended product improvement`, `recommended codebase improvement`,
  or `open decision`.
- Product improvements are recommendations, not implicit implementation scope,
  until approved by the human reviewer.
- Link each item to source evidence, baseline behavior, or a specific risk.

`context-ledger.md`:

- What was loaded into context.
- Why it mattered.
- What was summarized into durable artifacts.
- What can be ignored unless a feature needs it.

`reload-packet.md`:

- Dense 1-2 page handoff for the next Fable session.
- Include top invariants, feature order recommendation, risk hotspots, source
  slices, open questions, and the most important recommendations.

`open-questions.md`:

- Questions that require human, product, or deeper code investigation.
- Do not block on questions that can be answered from source or test-studio.

## Context Discipline

- Read broadly once; preserve understanding in markdown.
- Prefer compact tables, source links, and precise invariants over pasted code.
- Do not keep raw source in chat when a source map plus conclusion will do.
- When context grows large, stop reading and compress into the artifact before
  continuing.
- The final act of this session is to verify the artifacts are complete enough
  for a fresh Fable session to continue without relying on hidden context.

## Stop Condition

Stop after writing and self-reviewing the orientation artifacts. Do not begin
OpenSpec planning or implementation.

Final answer must report:

- Artifact paths.
- Whether any usage pause occurred.
- Top five risks.
- Top five recommendations.
