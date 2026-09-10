# engineering-platform report

## Pages written

| Path | Type | Grade |
|---|---|---|
| `docs/developers/platform/system-overview.md` | concept | OBSERVED |
| `docs/developers/platform/conventions-and-layering.md` | concept | STRONGLY SUPPORTED |
| `docs/developers/platform/background-jobs.md` | concept | STRONGLY SUPPORTED |
| `docs/developers/platform/email-pipeline.md` | concept | OBSERVED |
| `docs/developers/platform/observability.md` | concept | STRONGLY SUPPORTED |
| `docs/developers/platform/availability-and-configuration.md` | concept | STRONGLY SUPPORTED |
| `docs/developers/platform/frontend-build.md` | concept | STRONGLY SUPPORTED |

## Hubs written

| Path | Notes |
|---|---|
| `docs/developers/index.md` | Rewrote stub into full developers hub |
| `docs/developers/platform/index.md` | New platform hub |
| `docs/developers/labs/index.md` | New stub hub (not my content) |
| `docs/developers/projects/index.md` | New stub hub |
| `docs/developers/integrations/index.md` | New stub hub |
| `docs/developers/ai/index.md` | New stub hub |
| `docs/developers/professional-learning/index.md` | New stub hub |

## Proposed edits to existing top-level docs (not made)

| File | What is stale | One-line fix |
|---|---|---|
| `docs/students/labs/internet-simulator.md` | Frontmatter contains Applies-to inside YAML block | Move the Applies-to line below the closing --- |
| `TESTING.md` | References PhantomJS and Sauce Labs | Replace with Playwright and headless Chrome |
| `docs/pegasus-dashboard-integration.md` | Pegasus-centric, partly superseded | Mark deprecated or fold relevant facts into system overview link |

## Contradictions

- Sentry live production status depends on an uncommitted DSN secret; page states this honestly as flag-gated.
- DCDO default-value conflicts documented as-is; no single source of truth for defaults exists.

## Inventory items

All 20 covered. dev-pegasus mentioned as context, not standalone page (pegasus out of scope per AGENTS.md).

## Assumed link paths

- /developers/operations/ -- delivery-and-operations domain (not yet written)
- /developers/platform/authentication/ -- exists

## Build status

- evidence:check PASS
- build BLOCKED by pre-existing YAML error in docs/students/labs/internet-simulator.md (not this domain)
