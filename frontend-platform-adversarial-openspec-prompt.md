# Frontend Platform Adversarial OpenSpec Prompt

Planning only. New OpenSpec exploration/proposal for general `frontend/`
platform improvements.

Do not implement product code. Do not scaffold packages. Do not use
openspec-apply. Do not modify existing product behavior.

Create a separate planning branch/PR if one is not already active for this
work. This should not be mixed into any Teacher Dashboard migration PR.

Use OpenSpec skills:

1. Start with openspec-explore.
2. Produce a thorough adversarial exploration report about general
   improvements to make in the repo-root `frontend/` directory.
3. Then use openspec-propose to create one or more concrete OpenSpec changes
   for the best improvements.

## Delegation

You own the judgment, synthesis, and OpenSpec proposals. Delegate mechanical
repo archaeology and empirical checks to Sonnet subagents, then scrutinize
their evidence before using it.

Always delegate exploratory testing and measurement work to Sonnet. This
includes bundle-size inspection, route load-time checks, webpack/build
strategy inventory, Studio route smoke tests, and any Playwright MCP
exploration needed to confirm current behavior in data.

Sonnet reports must cite commands, URLs, artifacts, and file references.
Treat subagent conclusions as inputs, not authority.

## Scope

Focus on repo-root `frontend/`:

- `frontend/apps/studio`
- `frontend/packages/*`
- package conventions
- generator conventions and templates
- core API/mocks/transports
- MSW/dev-shell patterns
- e2e-tests
- design-system integration
- module boundaries
- testing/release workflow
- platform architecture

Also explore the existing legacy frontend architecture enough to compare and
contrast:

- root `apps/`
- legacy webpack bundle
- Rails/HAML bootstrap patterns where relevant
- how current product surfaces cross the `apps/`, `dashboard/`, and
  `frontend/` boundary

Read the PRFAQ strategy doc:

`~/Downloads/PRFAQ_ Introducing the Next Generation Frontend Platform for Code.org's Learning Platform.md`

Interpret the PRFAQ with these human corrections:

- Vite + TanStack Router is the current intended next-generation frontend
  direction for this repo.
- Next.js/SSR language in the PRFAQ is historical unless repo evidence proves
  otherwise.
- Offline-first is a platform capability, but do not force product offline
  requirements into every module.

Do not make product-specific changes. This is platform improvement planning.
Do not propose speculative wishlist items. Every proposed change should be
concrete, reviewable, and backed by repo evidence.

## Adversarial Exploration

Treat every material input as a hypothesis until it is supported by evidence:
PRFAQ claims, existing docs, generator conventions, package examples,
prior assumptions, Sonnet reports, measurements, exploratory-test results, and
your own architectural instincts. For each material claim, try to falsify it
against repo evidence.

Label each claim exactly one of:

- Implemented
- Partial
- Aspirational
- Stale
- Contradicted
- Unverified

Do not present aspirational PRFAQ claims as facts. Reframe unsupported,
stale, or contradicted claims into concrete investigation or platform
improvement proposals.

Ground the review in data:

- current files and docs
- empirical exploratory testing delegated to Sonnet
- generator templates
- existing package examples
- Studio route files and source, not only docs
- core API/mocks/transports
- MSW/dev-shell patterns
- e2e/visual/a11y testing
- CI/workflow files where relevant
- design-system usage and migration docs
- legacy `apps/` and Rails/HAML integration points where migration claims
  depend on legacy behavior
- existing `apps/` webpack strategy, bundle boundaries, and load-time
  characteristics where they affect the frontend platform plan

Inspect at minimum:

- PRFAQ at the provided path
- `frontend/README.md` and `frontend/AGENTS.md`
- `frontend/docs/conventions/*`
- `frontend/apps/studio` docs, route files, package.json, bootstrap, and mocks
- `frontend/turbo/generators/config.ts` and templates
- `frontend/packages/core` API, mocks, transports, and architecture docs
- `frontend/packages/e2e-tests` README/config/workflows
- design-system README/CONTRIBUTING/MIGRATION_STATUS and relevant skills/docs
- representative packages: one lab, one migrated/legacy lab, one utility
  package, and one app-shaped feature package if present
- small Rails/apps bootstrap samples where migration claims depend on legacy
  behavior
- Sonnet-produced measurements for bundle size, load timing, webpack strategy,
  and exploratory route behavior

## Exploration Report

The exploration report should include:

- evidence inspected, with file references
- current-state architecture map
- future-state platform intent after PRFAQ corrections
- current-state vs future-state compare/contrast table
- assumption audit: claim, evidence, verdict label
- friction map: what blocks module authors today
- failure modes if current conventions remain unchanged
- gap analysis
- repo-backed improvement buckets
- recommended sequencing
- risks and non-goals

## Proposal Guidance

Create OpenSpec changes only for improvements that are specific enough to
implement later.

Keep proposals separate by concern. Do not bundle unrelated platform work into
one mega-change.

For each proposed change, include clear goals/non-goals, affected frontend
areas, implementation strategy, tests/validation, risks, and
migration/compatibility notes.

Mark unknowns as `BLOCKED-EVIDENCE` only when a concrete source check or
decision is needed.

Keep implementation future-facing but compatible with current repo
conventions.

Potential areas to consider, but do not force:

- truth-labeled frontend platform roadmap
- app-shaped feature package conventions
- generator/template/docs/example consistency
- core API/domain conventions
- MSW fixture/scenario architecture
- replay/offline/test capability tiers
- standalone dev-shell ergonomics
- Studio route/lazy-loading conventions
- Studio production/routing readiness
- module-level observability
- e2e/visual/a11y testing patterns
- design-system/MUI/DSCO migration guidance
- release/dry-run workflow and package-level validation
- legacy-to-frontend migration patterns

## Output

- Exploration report under `sdd-experiment/openspec/` or another appropriate
  planning path.
- One or more OpenSpec changes for concrete frontend platform improvements.
- Draft PR containing planning artifacts only.

Final report:

- what evidence you inspected
- current-state vs future-state summary
- assumption-audit highlights with verdict labels
- improvement buckets found
- OpenSpec changes created
- what you intentionally did not propose
- remaining ambiguities
- confirmation that no product code was implemented
