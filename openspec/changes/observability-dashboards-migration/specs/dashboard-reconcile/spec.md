# dashboard-reconcile

Consumer contract for private deployments of the public dashboard artifact. The first consumer is the code-dot-org infrastructure repo; its workflow implementation lands there, against this contract.

## ADDED Requirements

### Requirement: Pull-based verified reconcile
The consumer SHALL deploy dashboards only by pulling the artifact from the registry and verifying its provenance attestation against the canonical source repository before use; content arriving via dispatch payloads SHALL NOT be trusted.

#### Scenario: Attestation verification gate
- **WHEN** the reconcile workflow pulls an artifact whose attestation is missing or does not verify against the canonical repository
- **THEN** the workflow fails before binding or applying anything

### Requirement: Dispatch trigger with scheduled backstop
The reconcile workflow SHALL be triggerable via `workflow_dispatch` (the notify push) and SHALL also run on a daily schedule so missed dispatches converge, with concurrency control serializing applies and a digest comparison making unchanged ticks a no-op.

#### Scenario: No-op tick
- **WHEN** the scheduled run pulls a digest equal to the last-applied digest
- **THEN** the workflow exits early without planning or applying

### Requirement: Consumer-side binding
The consumer SHALL bind all deployment-specific values — datasource UIDs, Grafana workspace URL, Sentry organization and project IDs, runbook URL host — at reconcile time from its own configuration, resolving every placeholder listed in the artifact manifest.

#### Scenario: Unresolved placeholder
- **WHEN** the artifact manifest lists a placeholder the consumer configuration does not bind
- **THEN** the reconcile fails before apply

### Requirement: Gated apply
Production applies SHALL require human approval via a GitHub environment with required reviewers; the notify-push App identity SHALL NOT be able to satisfy that approval.

#### Scenario: Prod apply awaits approval
- **WHEN** a reconcile reaches the production apply step
- **THEN** the job pauses until a designated human reviewer approves

### Requirement: Infrastructure repo cutover
Once artifact-driven applies are live, the infrastructure repo SHALL cease to hold dashboard/alert source: its Foundation SDK tree is deleted and its Tofu module consumes artifact-sourced JSON, while retaining ownership of datasources, folders, and notification routing.

#### Scenario: Single source of truth after cutover
- **WHEN** a dashboard change is needed after cutover
- **THEN** the only authoring path is the monorepo package, and the infrastructure repo change is limited to binding or promotion
