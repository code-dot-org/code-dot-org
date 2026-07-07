# Proposal: observability-dashboards-migration

## Why

Grafana dashboards and alerts for app-level behavior are authored in the infrastructure repo (`infrastructure/observability/dashboards/grafana`), while every signal they watch — metric names, log attributes, app slugs — is emitted from this monorepo. The contract between emitter and dashboard is ~40 bare string literals duplicated across two repos with no shared owner: rename a metric here and the dashboard flatlines silently there. Colocating dashboard authoring with the code that emits the telemetry makes observability part of the definition of done (one PR adds the metric and the panel), keeps the infrastructure repo about cloud infrastructure, and gives a future observability agent a typed, verifiable surface to write dashboards against.

## What Changes

- Move the Foundation SDK dashboard/alert source tree from `infrastructure/observability/dashboards/grafana` into a new `frontend/packages/` workspace package.
- Extract a typed signal catalog (metric names, units, dimensions, Lab2 log attributes, app slugs) importable by both the dashboard builders and the `apps/` emit sites (via existing `portal:` links).
- Strip deployment bindings from dashboard source: datasource UIDs, AMG workspace URL, and Sentry org/project IDs move behind Grafana datasource template variables where supported, and `templatefile()`-style placeholders for the residue. Generic JSON only; binding values stay in the infrastructure repo.
- Publish generated dashboards as a **public OCI artifact** on `ghcr.io/code-dot-org` from monorepo CI on merge, with GitHub artifact attestations (SLSA provenance). Generated `dist/` is never committed.
- Add a **notify push**: after publish, monorepo CI dispatches the infrastructure repo's reconcile workflow via a GitHub App token (`actions: write`, single-repo installation). The target repo is bound only via Actions secrets — no private consumer named in OSS source; forks get a clean no-op or can bind their own consumer.
- Infrastructure repo gains a pull-based **reconcile workflow**: `workflow_dispatch` + daily cron backstop → pull artifact by tag → `gh attestation verify` → bind config → `tofu plan` → environment-gated `tofu apply`. The Tofu grafana module keeps datasources, folders, and notification routing; per-dashboard `file()` resources are replaced by artifact-sourced JSON.
- **BREAKING** (infra repo): `dashboards/grafana/` source tree is deleted from the infrastructure repo once the monorepo package is the source of truth; interim dual-authoring is not supported.

## Capabilities

### New Capabilities

- `signal-catalog`: typed registry of app telemetry signals (metrics, log attributes, app slugs) shared by emitters in `apps/`/`frontend/` and dashboard builders; single source of truth for the emitter↔dashboard contract.
- `dashboard-authoring`: Foundation SDK dashboard and alert-rule builders in `frontend/`, parameterized mixin-style (no hardcoded datasource UIDs, workspace URLs, or org identifiers), with golden-file snapshot tests and lint gates.
- `dashboard-artifact-release`: CI pipeline that builds, attests, and publishes the generic dashboard artifact publicly, then fires the notify push; fork-safe and consumer-agnostic.
- `dashboard-reconcile`: the consumer contract — how a private deployment (first customer: our infrastructure repo) pulls, verifies, binds, and applies the artifact. Implementation lands in the infrastructure repo; the artifact/interface contract is specified here.

### Modified Capabilities

_None — no existing openspec specs in this repo cover observability._

## Impact

- **This repo**: new `frontend/packages/` package (name decided in design); emit sites in `apps/src` incrementally adopt catalog constants (no behavior change); new GitHub Actions release workflow; drone unaffected.
- **Infrastructure repo**: `observability/dashboards/grafana` deleted; `opentofu/modules/grafana` dashboards/alerts wiring reworked to consume the artifact; new `reconcile.yml` workflow; new GitHub App (notify push) and OIDC/apply credentials (phase 2).
- **Dependencies**: `@grafana/grafana-foundation-sdk` moves into the frontend workspace; `oras`/`gh attestation` in CI; no runtime app dependencies change.
- **People**: dashboard/alert review moves to monorepo PRs (CODEOWNERS on the package); infra on-call keeps a gate via the prod environment required-reviewer approval on apply.
