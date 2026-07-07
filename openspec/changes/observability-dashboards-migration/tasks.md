# Tasks: observability-dashboards-migration

## 1. Package scaffold (monorepo)

Port source: the `code-dot-org/infrastructure` repo, path `observability/dashboards/grafana` (local checkout at `~/git-workspaces/infrastructure` on the primary dev machine; otherwise clone it). Its `dist/` is gitignored — run `yarn build` there first to produce the parity baseline.

- [ ] 1.1 Scaffold `frontend/packages/telemetry-catalog` (zero-dependency) and `frontend/packages/grafana-dashboards` (depends on telemetry-catalog + `@grafana/grafana-foundation-sdk`) per `docs/conventions/packages.md`: tsconfig, lint-config, turbo targets. Pin the SDK exactly; ask the user which Grafana version the AMG workspace runs if not determinable, and pick the matching SDK track (standalone `0.0.x` for Grafana ≥ 12, `NN-N-latest` dist-tag otherwise)
- [ ] 1.2 Port `src/lib/**` from the port source (builders, alerting, browsers, sentry/*, cloudwatch/*, lab2) into `grafana-dashboards` unchanged except import paths
- [ ] 1.3 Port `src/dashboards/**` (backend/rails + frontend/labs trees, runbooks) and the `src/index.ts` registry; build must reproduce the infra repo's freshly built `dist/` byte-for-byte before any parameterization (golden parity check: `diff -r`)

## 2. Parameterization

- [ ] 2.1 Replace literal datasource UIDs with `type: datasource` template variables across all dashboards, using the contract names from design D3 (`DS_PROMETHEUS`, `DS_SENTRY`, `DS_INFINITY_SENTRY`, `DS_CLOUDWATCH`)
- [ ] 2.2 Replace remaining bindings (Sentry org slug, numeric project IDs, runbook/Grafana base URL) with `%%NAME%%` placeholder tokens per design D3 (NOT `${...}` — collides with Grafana's own variable syntax); delete `lib/config.ts`
- [ ] 2.3 Emit `manifest.json` (schema version, source SHA, placeholder inventory, SDK version) and `catalog.json` in the build output
- [ ] 2.4 Review the parity diff (variable/placeholder substitutions only) and snapshot the parameterized output as golden files with a vitest snapshot suite
- [ ] 2.5 Add a dev-bound preview build target (placeholders resolved with dev values) for local import/`gcx dev serve` smoke checks

## 3. Signal catalog

- [ ] 3.1 In `telemetry-catalog`: define the registry types (metric: name/kind/unit/dimensions/owner; log-attribute and app-slug tables) and populate from the current dashboard + emit-site inventory (~30 metrics, Lab2 attributes)
- [ ] 3.2 In `grafana-dashboards`: change `sentryMetricsTarget` and the panel kits' `metric` parameter from inline `{name, type, unit}` objects to the `CatalogMetric` entry type and remove the inline/raw-string forms from the public API, so unregistered signals fail typecheck (design D2)
- [ ] 3.3 Adopt catalog constants at 2–3 pilot emit sites in `apps/src` (e.g. `pythonlab/pyodideWorkerManager.ts`) proving byte-identical emission via existing unit tests; file follow-up for incremental adoption of the rest
- [ ] 3.4 Replace the hand-copied Lab2 attribute list in the ported `lab2.ts` with catalog imports

## 4. Release pipeline (monorepo)

- [ ] 4.1 Add the release workflow: on merge touching the packages, build → `oras push` public artifact (single `bundle.tar.gz` layer containing `dashboards/`, `alerts/`, `catalog.json`, `runbooks/`, `manifest.json`, per design D4) to ghcr tagged `:main`; semver tag on release
- [ ] 4.2 Attach provenance via `actions/attest-build-provenance`; verify with `gh attestation verify` as a workflow self-check
- [ ] 4.3 Add the `notify-consumer` job: repo guard, `actions/create-github-app-token` (consumer owner/repo from secrets), `gh workflow run reconcile.yml`; notify failure must not fail the release
- [ ] 4.4 Confirm fork behavior: workflow no-ops cleanly without canonical secrets
- [ ] 4.5 Add CODEOWNERS entries for the package's alert sources requiring infra/on-call review

## 5. GitHub App + secrets (EXTERNAL: org admin — cannot be done from this codebase; hand a checklist to the user)

- [ ] 5.1 Create the notify-push GitHub App: `actions: write` only, installed on the infrastructure repo only
- [ ] 5.2 Store App id/key and consumer owner/repo as monorepo Actions secrets; document rotation

## 6. Reconcile workflow (EXTERNAL: implements in the `code-dot-org/infrastructure` repo, not this codebase — when applying here, treat as blocked pending work in that repo)

- [ ] 6.1 Add `reconcile.yml`: `workflow_dispatch` + daily cron, `concurrency: grafana-apply`; pull channel tag via oras, `gh attestation verify --repo code-dot-org/code-dot-org`, early-exit on digest match against a repo Actions variable
- [ ] 6.2 Rework `opentofu/modules/grafana` dashboards/alerts wiring to consume artifact JSON with chained `replace()` placeholder binding per design D3 (NOT `templatefile()` — Grafana's own `${...}` syntax breaks it); binding values (UIDs, Sentry IDs, base URL) become Tofu variables; fail on unresolved `%%…%%` tokens
- [ ] 6.3 Phase 1: workflow posts `tofu plan` to the run summary; humans compare against the legacy path and apply locally
- [ ] 6.4 Cutover PR: flip `dashboards.tf`/`alerts.tf` to artifact-sourced JSON, delete `observability/dashboards/grafana`, apply; verify all 12 dashboards + 3 alert groups render and fire identically in AMG
- [ ] 6.5 Phase 2: OIDC role + AMG token in infra CI; prod apply behind a GitHub environment with required reviewers; retire laptop applies
- [ ] 6.6 Update infra repo README/AGENTS docs: authoring now happens in the monorepo; infra owns binding + promotion

## 7. Verification and docs

- [ ] 7.1 End-to-end drill: merge a trivial panel change in the monorepo → artifact publishes → notify push → reconcile plan shows exactly that panel diff → gated apply lands it in AMG
- [ ] 7.2 Rollback drill: repin previous digest, reconcile, confirm AMG reverts
- [ ] 7.3 Package README: authoring guide (add a signal, add a dashboard, add an alert), artifact/placeholder contract, consumer quickstart for forks
