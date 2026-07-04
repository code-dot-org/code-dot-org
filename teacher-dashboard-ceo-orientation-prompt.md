# Teacher Dashboard CEO Orientation Prompt

Act as CEO and chief architect for the teacher dashboard migration.

This session is orientation only. Do not implement. Do not create feature
OpenSpecs. Do not launch Sonnet. Build the CEO's primary-source understanding,
write durable compressed memory, then stop. A later session will execute from
these artifacts.

## Output

Write all artifacts under:

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

These files are permanent memory. Chat is not.

## Safety And Usage

- No production. Do not use `studio.code.org`.
- Use static code analysis, local/test servers, test-studio, and approved test
  helpers only.
- Baseline UI and behavior come from legacy/test-studio or local legacy routes.
- Do not use real user data.
- At start and before long passes, run `claude -p "/usage"`.
- Record checkpoints in
  `sdd-experiment/teacher-dashboard-migration/usage-checkpoints.md`.
- If current session or Fable week is `>= 85%`, pause until reset plus five
  minutes. If reset parsing fails, stop for human intervention.

## CEO Orientation Work

Fable may delegate mechanical search, but not understanding. CEO must personally
inspect primary evidence for the product model.

Read and map:

- Teacher dashboard routes and redirects.
- Rails controllers, HAML views, script data, helpers, serializers, and models.
- React entries, routers, homepage, section list, navigation, and major feature
  components in `apps/`.
- Existing `frontend/` architecture and relevant packages.
- Existing APIs, `Api::V1` controllers, `/dashboardapi` routes, and data models.
- Redux/state, query hooks, flags, experiments, DCDO, locale, Global Edition,
  provider/LMS gates.
- Existing tests, factories, e2e helpers, Playwright fixtures, and MSW patterns.
- Representative baseline UI/behavior in test-studio or local legacy routes.

## Artifact Requirements

`orientation-index.md`:

- Table of contents for all orientation artifacts.
- Reload instructions for a fresh session.
- Links to highest-value source files and baseline artifacts.

`source-map.md`:

- Route -> controller/HAML/script data -> React entry -> component tree -> data
  source.
- Mark sources the CEO personally inspected.
- Mark feature-specific source slices for later reload.

`feature-map.md`:

- Initial feature inventory grouped by teacher workflow.
- Edge cases, flags, provider/LMS states, variants.
- Recommended first three features and why.

`product-invariants.md`:

- Nonnegotiable teacher-facing behavior.
- Visual, copy, navigation, auth, permission, data, accessibility, and backward
  compatibility invariants.
- Intentional legacy quirks to preserve unless later approved.

`migration-thesis.md`:

- Architecture thesis, package boundaries, refactor-first strategy, API strategy,
  when to create `Api::V1::TeacherDashboard::*`, and what to avoid.

`risk-register.md`:

- Ranked risks with source evidence.
- Include API drift, HAML bootstrap loss, visual mismatch, auth mismatch, hidden
  flags, scenario gaps, over-rewrite, accessibility regressions, context/usage.

`recommendations.md`:

- CEO-level recommendations for what to fix first.
- Codebase improvements: architecture, package boundaries, API shape, tests,
  migration helpers, shared components, stale patterns, technical debt.
- Product improvements: teacher UX, workflows, confusing legacy behavior,
  accessibility, reliability, performance, observability, and places where the
  product could improve beyond legacy.
- Migration-process improvements: prompt, testing, visual parity, MSW/offline,
  API strategy, review chain, usage/context management.
- Decisions to make before implementation starts.
- Time-sensitive guidance to preserve before the usage window closes.

`parity-vs-improvements.md`:

- Explicitly separate must-preserve parity from proposed codebase/product
  improvements.
- Mark each item as `parity requirement`, `approved intentional change`,
  `recommended product improvement`, `recommended codebase improvement`, or
  `open decision`.
- Product improvements are recommendations, not implementation scope, until
  approved by the human reviewer.
- Link each item to source evidence, baseline behavior, or risk.

`context-ledger.md`:

- What was loaded, why it mattered, what was summarized, and what can be ignored
  unless a feature needs it.

`reload-packet.md`:

- Dense 1-2 page handoff for the next Fable session: top invariants, feature
  order recommendation, risks, source slices, open questions, recommendations.

`open-questions.md`:

- Human/product/deeper-code questions. Do not block on questions answerable from
  source or test-studio.

## Context Discipline

- Read broadly once; preserve understanding in markdown.
- Prefer compact tables, source links, and precise invariants over pasted code.
- When context grows large, stop reading and compress into artifacts before
  continuing.
- Final act: verify artifacts are enough for a fresh Fable session without
  hidden context.

## Stop Condition

Stop after writing and self-reviewing orientation artifacts. Do not begin
OpenSpec planning or implementation.

Final answer reports artifact paths, usage pauses, top five risks, and top five
recommendations.
