# Design: observability-dashboards-migration

## Context

Today the infrastructure repo owns `observability/dashboards/grafana`: a private TypeScript package on `@grafana/grafana-foundation-sdk` (^0.0.12, the Grafana 12+ standalone track) whose `src/index.ts` registry builds 12 dashboards and 3 alert groups into gitignored `dist/*.json`. `opentofu/modules/grafana` reads each file via `file()` into `grafana_dashboard` resources and loads `dist/alerts/*.json` into rule groups; applies are run by hand from a laptop (the infra repo has no Tofu CI). `src/lib/config.ts` hardcodes the deployment bindings — AMG workspace URL, four datasource UIDs, Sentry org slug, numeric Sentry project IDs — and its own comments call them temporary.

Every signal those dashboards query originates in this monorepo: `apps/src/metrics/MetricsReporter.ts` (→ `@code-dot-org/core/plugins/observability`) emits ~30 metric names as bare string literals at call sites (`'PythonLab.PyodideLoadTime'`, the `Aichat.*` / `MusicAI.*` / `SoundCache.*` families); `Lab2MetricsReporter.ts` defines the `appName`/`channelId`/`currentLevelId` log attributes that the infra repo's `lab2.ts` re-lists by hand; `cookbooks/cdo-otel-collector` defines the `rack_calls_total` spanmetrics the Rails dashboards chart; `dashboard/engines/observability` configures the Rails-side OTel/Sentry emitters.

This is the monitoring-mixin problem (monitoring.mixins.dev): dashboards and alerts should be packaged with, and parameterized by, the code that emits their signals — "labels should be configuration you can feed into the dashboards," not literals baked into them. Ecosystem context that shaped the design: Grafana's as-code CLI churned twice in a year (Grizzly removed, grafanactl archived 2026-06, `gcx` current); Git Sync went GA with Grafana 13 but Amazon Managed Grafana lags too far behind to use it; the Foundation SDK is public-preview with compile-time types as its core pitch.

Constraint inventory: `apps/` consumes `frontend/packages/*` via `portal:` protocol (catalog imports are free); the monorepo already publishes public images to `ghcr.io/code-dot-org` and `@code-dot-org/*` packages to public npm (public releases are established practice); the infra repo is OpenTofu ≥ 1.8 (1.11 installed); the monorepo is public/OSS and must not encode any private consumer in source; GitHub Actions has no credential-less cross-repo event (`registry_package` fires in the publishing repo and is suppressed for `GITHUB_TOKEN` publishes), so cross-repo triggering requires a token — held as an obscured secret — or polling.

## Goals / Non-Goals

**Goals:**

- Dashboards and alerts authored in this monorepo, next to their emitters, reviewed in the same PRs.
- One typed signal catalog that both emit sites and dashboard builders import; the emitter↔dashboard contract becomes a compile-time check.
- Generic, deployment-agnostic artifact: nothing Code.org-infrastructure-specific (UIDs, workspace URLs, org IDs, consumer repo names) in monorepo source or in the published artifact.
- Distribution as a public, provenance-attested OCI artifact; the infrastructure repo (and any fork) consumes by pull-and-verify.
- Push latency without push authority: a notify push may start the consumer's workflow but carries nothing the consumer trusts.
- Retire laptop applies: infra reconcile workflow with a human gate (environment required reviewers) and a cron backstop.
- A surface an observability agent can safely author against: typed builders, catalog, snapshot tests, lint — errors surface at compile/CI time, not in production Grafana.

**Non-Goals:**

- No change to what telemetry is emitted or how (MetricsReporter, core plugin, OTel collector, Rails engine untouched).
- No Grafana workspace migration, no Git Sync, no gcx adoption, no Grafana version changes.
- No k8s/grafana-operator deployment path yet (see horizon note in Decisions D8).
- No porting of the Tofu-owned datasources, folders, or notification policies into the artifact — they stay infra-repo Tofu.
- No backfill of catalog adoption across every emit site in one change; adoption is incremental.

## Decisions

**D1 — Location: a new `frontend/packages/observability-dashboards` workspace package (name final at implementation; must not collide with `core/plugins/observability` or the Rails `observability` engine).**
`frontend/` gives turborepo, lint-config, typecheck, vitest, and CI for free, and — decisively — `apps/` can only import workspace code via `portal:` links into `frontend/packages/*`, which the catalog requires. The convention objection ("frontend package observing Rails") is already bent by precedent: `frontend/packages/e2e-tests` exercises the full Rails stack. Alternative considered: top-level `observability/` dir mirroring the infra repo — more honest scope, but a third JS workspace with bespoke tooling and no `portal:` reachability.

**D2 — The signal catalog is a typed registry, not just shared string constants.**
Entries carry `{name, kind (counter|gauge|timing), unit, dimensions, owner}` for metrics, plus log-attribute and app-slug tables (the Lab2 attribute set currently duplicated in `lab2.ts`). Emit sites import names from the catalog; dashboard builders accept only catalog entries. A registry (vs bare constants) is what makes agent-authored dashboards checkable — the builder can typecheck that a panel charts a real signal with the right unit. Catalog also ships in the artifact as `catalog.json` so non-JS consumers (Ruby, future alerting) can read it. Adoption at emit sites is mechanical and incremental; new signals must go through the catalog from day one.

**D3 — Binding via Grafana datasource variables first, placeholders second.**
Dashboards declare `type: datasource` template variables for Prometheus/Sentry/Infinity/CloudWatch refs — the Grafana-native portability mechanism, zero rebinding needed. The residue that variables cannot express — Sentry numeric project IDs inside Infinity query bodies, the absolute `runbook_url` host for alert annotations — uses `${placeholder}` tokens resolved by the consumer at plan time (`templatefile()` in Tofu). The infra repo's `config.ts` values become Tofu variables. Alternative rejected: build-time `build(config)` injection — it forces the consumer to run node and means no generic artifact ever exists.

**D4 — Distribution: public OCI artifact on `ghcr.io/code-dot-org`, never committed `dist/`.**
Committing generated JSON was rejected as a smell (generated artifacts are releases, not source). Publishing publicly from the OSS repo is a release, same act as our public npm packages — not a private binding. Artifact layout: `dashboards/*.json`, `alerts/*.json`, `catalog.json`, `runbooks/**`, `manifest.json` (schema version, source SHA, placeholder inventory). Tags: `:main` on every merge (staging channel), semver on release (prod channel), digest-addressable. Signed with GitHub artifact attestations (`actions/attest-build-provenance`) — the GHA-native cosign equivalent; consumers verify with `gh attestation verify --repo code-dot-org/code-dot-org`. Alternatives rejected: npm package consumed by infra (drags node into infra CI); Tofu `git::` module source (go-getter clones the multi-GB monorepo per init); committed-dist vendoring (the smell).

**D5 — Notify push: GitHub App token dispatch, consumer bound only in secrets.**
After publish, a `notify-consumer` job (guarded by `if: github.repository == 'code-dot-org/code-dot-org'`) mints an installation token via `actions/create-github-app-token` and runs `gh workflow run reconcile.yml -R "$CONSUMER"`. The App: `actions: write` permission only (the floor for workflow dispatch — no narrower scope exists; notably `repository_dispatch` would require `contents: write`, which is worse), installed on the single consumer repo, token expires in ~1h. The consumer repo identity lives exclusively in Actions secrets — OSS source names no private consumer; forks either no-op or bind their own consumer secrets and get the identical pipeline (open-core behavior, not a Code.org-shaped hole). The push carries no trusted payload: blast radius of a stolen token is "start a pull-and-verify workflow," a no-op. Alternatives: org webhook → relay Lambda (zero repo footprint, but a hosted service to babysit — deferred until wanted); `repository_dispatch` (worse token); polling only (fallback that exists anyway as the cron).

**D6 — Consumer reconcile: `workflow_dispatch` + daily cron backstop → pull → verify → bind → plan → gated apply.**
One infra-repo workflow, `concurrency: grafana-apply`. Steps: `oras pull` the channel tag → `gh attestation verify` → compare digest against a repo Actions variable (`LAST_APPLIED_*`, cheap idempotent ticks) → `templatefile()` binding → `tofu plan` → apply, with the prod job behind a GitHub **environment with required reviewers** (the native human gate; the notify-push App cannot approve it — approvals are reviewer-identity-bound). Phased: Phase 1 keeps human-run `tofu apply` locally after the workflow posts the plan (today's trust model, zero new credentials); Phase 2 adds OIDC + AMG token to CI and applies on approval. Review gates land in two places: CODEOWNERS on the package's `alerts/` in the monorepo (alert changes reviewed where authored), environment approval on prod applies.

**D7 — Alerts and runbooks travel with dashboards.**
They share the lib, the registry, and the signal catalog; splitting them would recreate the two-repo drift for the most safety-critical half. On-call governance is preserved by D6's two gates. Runbook markdown ships in the artifact; `runbook_url` uses the placeholder mechanism.

**D8 — Horizon, explicitly not now: Kargo/ArgoCD + grafana-operator.**
When the shadow EKS stack takes prod tenants, the natural end state is Kargo watching the same public artifact, ArgoCD applying grafana-operator CRs against AMG (external-instance support), and the Tofu grafana module shrinking to workspace + IAM. Nothing in this design is throwaway on that path — the artifact and attestation are exactly what that world consumes; only the reconciler changes. Flux proper is rejected (second GitOps engine next to ArgoCD).

## Risks / Trade-offs

- [Foundation SDK is public preview; versioning already forked once (Grafana-pinned vs standalone `0.0.x` tracks)] → pin exactly in the package, snapshot tests catch output drift on bumps, and the artifact's `manifest.json` records the SDK version. The move itself doesn't deepen the dependency — we already run it in the infra repo.
- [AMG version skew vs SDK's "best with Grafana ≥ 12"] → dashboards are already authored on this SDK against this AMG workspace and render today; verify AMG's Grafana version at implementation and pin the SDK track accordingly.
- [Two-repo migration window: dashboards exist in both repos mid-flight] → hard cutover per D-BREAKING: infra repo source tree is deleted in the same window the first artifact-driven apply lands; no dual-authoring period. Sequence in tasks.md.
- [Placeholder-templated JSON isn't directly importable into Grafana for preview] → prefer datasource variables (importable as-is) so placeholders are minimal; CI renders a dev-bound preview build for local `gcx dev serve`/import smoke checks.
- [Cron/dispatch reconcile has no drift *detection* surface (apply logs scroll unread)] → plan output posted to the workflow summary; drift correction still happens on every tick; real drift detection arrives with the D8 operator end state.
- [`actions: write` grants cancel/re-run on the consumer repo, not just dispatch] → accepted residue: single-repo App installation, short-lived tokens, and the dispatched workflow is pull-and-verify (attacker no-op). If ever unacceptable, move `reconcile.yml` to a dedicated trigger-only repo.
- [Alert review leaves the infra repo] → CODEOWNERS requires infra/on-call review on `alerts/**` in the monorepo; prod environment approval remains as the second gate.
- [Public artifact could be consumed by strangers / impersonated] → consumption is the point (open core); impersonation is blocked by registry auth on push plus attestation verification on pull.
- [`schedule:` jitter (15–60 min) and 60-day auto-disable] → cron is only the backstop (notify push is the primary trigger); the infra repo is active, so auto-disable is moot.

## Migration Plan

1. Package lands in `frontend/` generating byte-comparable JSON to the infra repo's current `dist/` (golden parity check, modulo the variable/placeholder substitutions, which are diffed and reviewed once).
2. Release workflow publishes `:main` + semver artifacts with attestations; no consumer yet.
3. Infra repo `reconcile.yml` Phase 1: pull, verify, bind, plan-only; humans compare plan against the legacy path, then apply locally.
4. First artifact-driven apply to prod folders; delete `observability/dashboards/grafana` from the infra repo in the same PR that flips `dashboards.tf`/`alerts.tf` to artifact-sourced JSON.
5. Notify-push App installed; dispatch wired; cron drops to daily backstop.
6. Phase 2: OIDC + AMG token in infra CI, environment-gated auto-apply; laptop applies retired.

Rollback at any step: the Tofu state is the deployment truth — repin the previous digest (or restore the legacy `file()` wiring pre-step-4) and apply.

## Open Questions

- Final package name (`observability-dashboards` vs `grafana-dashboards` vs a split `telemetry-catalog` + `grafana-dashboards`); collision with existing `observability` names is the constraint.
- Whether the Rails-side spanmetrics names (`rack_calls_total`, from `cookbooks/cdo-otel-collector`) join the catalog in v1 or a follow-up.
- Renovate vs nothing for surfacing new SDK versions to the package.
- Whether the staging channel (`:main`) auto-applies to a `Managed-Staging/` folder tree in the single AMG workspace from day one or waits for Phase 2 credentials.
