# delivery-and-operations plan

Revision: 9793f8d36ae. Date: 2026-09-09.

## Engineer's moments

1. "I just cloned the repo and need to run the app." -- local setup
2. "My PR is red on Drone. Which suite failed and how do I rerun one test?" -- testing
3. "I need to create a test account locally." -- test API and local accounts
4. "How does a commit reach production?" -- delivery pipeline
5. "Something is broken in production and I need to find logs." -- operations
6. "A teacher wrote in and I need to look up or fix their account." -- staff tools
7. "Someone told me to update the docs. Where do I start?" -- documentation runbook

## Pages

### `docs/developers/operations/`

| Path | Type | Question | Inventory IDs | Applies to |
|---|---|---|---|---|
| `index.md` | concept | Hub: what this section covers, links to pages | all | -- |
| `local-development.md` | task | How to run the two servers, `use_my_apps`, `locals.yml`, common fixes | `dev-local-setup`, `dev-caching-and-assets` | -- |
| `testing.md` | reference | The suites, one-file commands, what CI runs where, tag vocabulary | `dev-testing-suites`, `dev-cucumber-ui-suite`, `dev-playwright-e2e` | -- |
| `test-api-and-local-accounts.md` | reference | The test-only API, `createUser`, rails runner, `test_logs` exception | `test-only-api`, `staff-ui-test-logs` | development and test envs |
| `delivery.md` | concept | Branches, Drone, GHA, Chef/EC2 today, k8s next, adhoc, DTS | `dev-build-hooks`, `dev-drone-ci`, `dev-github-actions`, `dev-deploy-targets`, `dev-adhoc-environments` | -- |
| `logs-and-observability.md` | reference | Where logs go, how to access them, links to platform observability | `dev-observability`, `browser-telemetry-ingest` | -- |
| `staff-tools.md` | reference | Admin account tools, moderation, reports, NPS, who can reach each | `account-impersonation`, `account-repair-tools`, `account-permission-grant-tools`, `staff-section-lookup-undelete`, `project-featured-gallery-curation`, `project-abuse-moderation`, `student-work-evaluation-samples`, `staff-level-completion-reports`, `staff-user-progress-tools`, `staff-nps-admin` | internal staff |

### `docs/developers/documentation/`

| Path | Type | Question | Inventory IDs | Applies to |
|---|---|---|---|---|
| `index.md` | concept | Hub: how the corpus is organized | -- | -- |
| `corpus-and-conventions.md` | concept | Audience roots, topic pages, frontmatter, evidence grades, stylebooks | -- | -- |
| `verification.md` | concept | Journeys, docsScreenshot, evidence files, grades | -- | -- |
| `update-after-deploy.md` | task | Find affected pages, reinvestigate, refresh screenshots, open a PR | -- | -- |
| `periodic-reconciliation.md` | task | Checks: vanished sources, failing journeys, orphan images, dangling links | -- | -- |
| `agent-orchestration.md` | concept | Roles, .docs-work/, disposability, evidence grades | -- | -- |

## Inventory not covered

- `dev-openspec-workflow`: personal workflow excluded from `.git/info/exclude`; undocumented by design.

## Terminology observed

- UI: "Section code" in join flow. Admin routes all under `/admin/`.
- Drone pipelines: `unit`, `ui`, `cache-staging-build`.
- GHA: `Frontend-CI` is the hub; `workflow_call` for package CIs.
- Branches: `staging` (main), `levelbuilder`, `test`, `production`, `dts_candidate_<date>`.
