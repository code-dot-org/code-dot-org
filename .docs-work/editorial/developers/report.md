# Developer docs editorial review

Reviewer: editorial-reviewer (Opus 4.6)
Date: 2026-09-10
Scope: all 47 pages under `docs/developers/` and 37 evidence files under `.docs-evidence/developers/`.
Skills loaded: gitlab-docs, google-developer-docs, mdn-web-docs.

## Summary

The developer documentation is well-structured and factually rigorous. Navigation is clean, evidence parity holds, all internal and cross-audience links resolve, and the build and evidence check both pass. The edits below address a schema bug, one stale number, one cross-page factual inconsistency, and systematic voice improvements across 20+ pages.

## Edits by page

### Schema and evidence

- `.docs-evidence/schema.json`: added `AMBIGUOUS` to the `result` enum. The grade was defined in `domains.md` and documented on `verification.md` but missing from the schema, so any evidence file using AMBIGUOUS would fail validation.

### Platform

- `platform/system-overview.md`: controller count corrected from 235 to 241 (verified via `find`). Removed self-referential "This page describes..." clause.
- `platform/authentication.md`: removed trailing "This page covers each layer and how they compose."
- `platform/email-pipeline.md`: removed trailing "This page describes both end to end."
- `platform/background-jobs.md`: removed trailing "This page describes both and how to add a new job."
- `platform/observability.md`: removed "This page describes..." opening clause; changed "This page covers only" to "The sections below cover only."
- `platform/availability-and-configuration.md`: replaced "This page describes each one..." with a concrete enumeration of the four systems.
- `platform/frontend-build.md`: removed trailing "This page describes both, the design system, and the localization layout."
- `platform/index.md`: no change (opening is already question-oriented).

### Operations

- `operations/delivery.md`: removed trailing "This page describes the branch model..."
- `operations/logs-and-observability.md`: (a) fixed production log entry to mention both Honeybadger and Sentry (was "errors and traces in Sentry" only, contradicting observability.md which correctly documents dual-vendor reporting); (b) removed self-referential "This page tells you..." clause.
- `operations/staff-tools.md`: removed trailing "This page lists the internal tools..."
- `operations/testing.md`: no change (opening is reader-oriented).
- `operations/test-api-and-local-accounts.md`: no change.
- `operations/local-development.md`: no change.
- `operations/index.md`: removed "This section covers" prefix.

### Integrations

- `integrations/lti-integration.md`: removed trailing "This page covers..."
- `integrations/roster-sync-architecture.md`: no change.
- `integrations/school-and-district-data-model.md`: no change.
- `integrations/index.md`: replaced "The integrations section covers..." with direct statement.

### AI

- `ai/ai-subsystem.md`: replaced "This page describes the AI subsystem that powers..." with "The AI subsystem powers..."
- `ai/index.md`: replaced "The AI section documents..." with direct statement.

### Professional learning

- `professional-learning/verification-and-permissions.md`: removed trailing "This page documents the grant paths..."
- `professional-learning/pd-object-model.md`: no change (opening is direct).
- `professional-learning/surveys-and-foorm.md`: no change.
- `professional-learning/index.md`: replaced "The professional learning section covers..." with direct statement.

### Labs

- `labs/how-a-level-loads.md`: no change.
- `labs/blockly-fork.md`: no change.
- `labs/add-a-lab.md`: no change.
- `labs/index.md`: replaced "The labs section covers..." with a definition of what a lab is.

### Projects

- `projects/project-storage.md`: no change.
- `projects/sharing-and-abuse.md`: no change.
- `projects/publishability-tiers.md`: no change.
- `projects/sandboxed-preview-domain.md`: no change.
- `projects/index.md`: replaced "The projects section covers..." with concrete statement.

### Curriculum

- `curriculum/curriculum-authoring.md`: replaced "This page maps..." self-reference with passive construction.
- `curriculum/curriculum-pipeline.md`: no change (opening is direct).
- `curriculum/data-model-and-seeding.md`: no change.
- `curriculum/levelbuilder-environment.md`: no change.
- `curriculum/index.md`: no change (already reader-oriented).

### Documentation (runbook)

- `documentation/agent-orchestration.md`: replaced "This page describes the model so..." with "A future maintainer can continue..."
- `documentation/verification.md`: removed trailing "This page describes what the grades mean..."
- `documentation/corpus-and-conventions.md`: no change.
- `documentation/periodic-reconciliation.md`: no change.
- `documentation/update-after-deploy.md`: no change.
- `documentation/index.md`: no change.

### Root hub

- `developers/index.md`: no change.

## Contradictions reconciled

1. **Honeybadger omitted from production logs.** `logs-and-observability.md` said production errors go to "Sentry" only. `observability.md` correctly documents dual-vendor reporting (Honeybadger unconditional, Sentry flag-gated). Fixed the logs page to name both vendors. Source: `dashboard/engines/observability/lib/observability/errors.rb` dual-notifies both.

## Stale claims corrected

1. **Controller count.** `system-overview.md` said 235 controllers; actual count is 241 (`find dashboard/app/controllers -name '*.rb' | wc -l`). All other numeric claims (350 models, 940 migrations, 3133-line schema, 52 services, 14 policies, 13 queries, 1 form, 16 jobs, 638-line Ability, 5 OmniAuth providers, 19 packages, 3 apps) confirmed accurate.

## Claims removed for lack of evidence

None. All factual claims checked against evidence files and code.

## Schema fix

`AMBIGUOUS` grade was missing from `.docs-evidence/schema.json` enum despite being documented in `domains.md` and `verification.md`. Any evidence file using AMBIGUOUS would have failed `evidence:check`. Added.

## Merges and renames

None. No pages were merged, renamed, or deleted.

## Possible product issues (not docs bugs)

1. **`principal_approval_url` route deleted.** `pd-object-model.md` documents that four mailer templates reference `pd_application_principal_approval_url`, a route helper that no longer exists. Rendering any of those mailers would raise `NoMethodError`. The page correctly flags this as a known hazard.

2. **DCDO key typo pinned in production.** `how-a-level-loads.md` and `availability-and-configuration.md` both document `lab2-fetch-level-proper0ties-by-lesson-id` (note the `0`). The typo is real and in production use. The docs correctly describe this as pinned.

3. **`TestLogsController` in production routes.** `test-api-and-local-accounts.md` correctly notes that `Api::V1::TestLogsController` is reachable in all environments including production, unlike the rest of the test API. The controller has no authentication.

## Build and evidence check

```
npm run build: 142 pages, 0 errors
npm run evidence:check: passed
```
