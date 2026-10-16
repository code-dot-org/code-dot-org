# dashboard-authoring

## ADDED Requirements

### Requirement: Foundation SDK builders live in the monorepo
The monorepo SHALL contain a frontend workspace package holding the Grafana Foundation SDK dashboard and alert-rule builders currently in the infrastructure repo, preserving the existing dashboard inventory (rack, active-job, auth, and lab overview/drilldown dashboards; auth, rack-api, and genai-curriculum alert groups) and their runbooks.

#### Scenario: Migration parity
- **WHEN** the package builds the migrated dashboard set
- **THEN** output is semantically equivalent to the infrastructure repo's generated JSON, with differences limited to the documented datasource-variable and placeholder substitutions

### Requirement: No deployment bindings in source
Dashboard and alert sources SHALL contain no deployment-specific values: no datasource UIDs, no Grafana workspace URLs, no Sentry organization slugs or numeric project IDs, and no consumer repository identifiers.

#### Scenario: Datasource indirection
- **WHEN** a panel queries Prometheus, Sentry, Infinity, or CloudWatch
- **THEN** the generated JSON references a datasource template variable rather than a literal UID

#### Scenario: Residual bindings are placeholders
- **WHEN** a value cannot be expressed as a Grafana variable (Sentry numeric project ID in a query body, absolute runbook URL host)
- **THEN** the generated JSON carries a named placeholder token, and the artifact manifest lists every placeholder a consumer must bind

### Requirement: Generated output is tested
The package SHALL verify generated output in CI with golden-file snapshot tests and SHALL fail if generation drifts from the committed snapshots.

#### Scenario: SDK bump changes output
- **WHEN** a dependency or refactor changes any generated dashboard JSON
- **THEN** the snapshot test fails and the diff is visible in the PR

### Requirement: Alert changes require owner review
Alert-rule sources SHALL be covered by CODEOWNERS entries requiring review from the infrastructure/on-call owners.

#### Scenario: Alert PR review gate
- **WHEN** a PR modifies files under the package's alert sources
- **THEN** GitHub requires an approval from the designated owners before merge
