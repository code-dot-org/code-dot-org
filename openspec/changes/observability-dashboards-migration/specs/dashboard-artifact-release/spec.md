# dashboard-artifact-release

## ADDED Requirements

### Requirement: Public attested OCI artifact
Monorepo CI SHALL, on merge to the default branch, build the package and publish a public OCI artifact to the organization registry containing generated dashboards, alert groups, `catalog.json`, runbooks, and a manifest recording schema version, source SHA, and the placeholder inventory, with GitHub artifact attestations (SLSA provenance) attached. Generated output SHALL NOT be committed to the repository.

#### Scenario: Merge publishes staging channel
- **WHEN** a PR touching the package merges to the default branch
- **THEN** CI publishes the artifact tagged for the staging channel with a provenance attestation verifiable via `gh attestation verify`

#### Scenario: Release publishes prod channel
- **WHEN** a semver release of the package is cut
- **THEN** CI publishes the artifact under that immutable version tag with attestation

### Requirement: Release pipeline is fork-safe and consumer-agnostic
The release workflow SHALL contain no private consumer identifiers in source; publish and notify steps SHALL no-op cleanly on forks, and a fork SHALL be able to bind its own registry and consumer via its own secrets.

#### Scenario: Fork runs the workflow
- **WHEN** the workflow runs in a fork without the canonical repository's secrets
- **THEN** publish and notify steps are skipped without failure

### Requirement: Notify push after publish
After publishing, CI SHALL dispatch the configured consumer's reconcile workflow using a GitHub App installation token with `actions: write` permission installed only on the consumer repository, where the consumer identity is bound exclusively via Actions secrets and the dispatch carries no payload the consumer trusts.

#### Scenario: Successful publish triggers consumer
- **WHEN** the artifact publish completes on the canonical repository
- **THEN** the consumer repository's reconcile workflow is dispatched via a short-lived App token

#### Scenario: Notify failure does not block release
- **WHEN** the dispatch fails or no consumer is configured
- **THEN** the publish itself still succeeds and the consumer's scheduled backstop picks up the new artifact
