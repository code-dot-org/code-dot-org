# Tasks: observability-dashboards-migration

## 1. Package scaffold (monorepo)

- [ ] 1.1 Decide final package name (design open question) and scaffold `frontend/packages/<name>` per `docs/conventions/packages.md`: tsconfig, lint-config, turbo targets, `@grafana/grafana-foundation-sdk` pinned exactly after checking AMG's Grafana version
- [ ] 1.2 Port `src/lib/**` from `infrastructure/observability/dashboards/grafana` (builders, alerting, browsers, sentry/*, cloudwatch/*, lab2) unchanged except import paths
- [ ] 1.3 Port `src/dashboards/**` (backend/rails + frontend/labs trees, runbooks) and the `src/index.ts` registry; build must reproduce the infra repo's current `dist/` byte-for-byte before any parameterization (golden parity check)

## 2. Parameterization

- [ ] 2.1 Replace literal datasource UIDs with `type: datasource` template variables across all dashboards; document the variable names as the artifact's datasource contract
- [ ] 2.2 Replace remaining bindings (Sentry org slug, numeric project IDs, runbook/Grafana base URL) with named `${placeholder}` tokens; delete `lib/config.ts`
- [ ] 2.3 Emit `manifest.json` (schema version, source SHA, placeholder inventory, SDK version) and `catalog.json` in the build output
- [ ] 2.4 Review the parity diff (variable/placeholder substitutions only) and snapshot the parameterized output as golden files with a vitest snapshot suite
- [ ] 2.5 Add a dev-bound preview build target (placeholders resolved with dev values) for local import/`gcx dev serve` smoke checks

## 3. Signal catalog

- [ ] 3.1 Define the registry types (metric: name/kind/unit/dimensions/owner; log-attribute and app-slug tables) and populate from the current dashboard + emit-site inventory (~30 metrics, Lab2 attributes)
- [ ] 3.2 Constrain metric-backed panel builders to accept catalog entries only; unregistered signals fail typecheck/build
- [ ] 3.3 Adopt catalog constants at 2–3 pilot emit sites in `apps/src` (e.g. `pythonlab/pyodideWorkerManager.ts`) proving byte-identical emission via existing unit tests; file follow-up for incremental adoption of the rest
- [ ] 3.4 Replace the hand-copied Lab2 attribute list in the ported `lab2.ts` with catalog imports

## 4. Release pipeline (monorepo)

- [ ] 4.1 Add the release workflow: on merge touching the package, build → `oras push` public artifact (`dashboards/`, `alerts/`, `catalog.json`, `runbooks/`, `manifest.json`) to ghcr tagged `:main`; semver tag on release
- [ ] 4.2 Attach provenance via `actions/attest-build-provenance`; verify with `gh attestation verify` as a workflow self-check
- [ ] 4.3 Add the `notify-consumer` job: repo guard, `actions/create-github-app-token` (consumer owner/repo from secrets), `gh workflow run reconcile.yml`; notify failure must not fail the release
- [ ] 4.4 Confirm fork behavior: workflow no-ops cleanly without canonical secrets
- [ ] 4.5 Add CODEOWNERS entries for the package's alert sources requiring infra/on-call review

## 5. GitHub App + secrets (org admin)

- [ ] 5.1 Create the notify-push GitHub App: `actions: write` only, installed on the infrastructure repo only
- [ ] 5.2 Store App id/key and consumer owner/repo as monorepo Actions secrets; document rotation

## 6. Reconcile workflow (infrastructure repo)

- [ ] 6.1 Add `reconcile.yml`: `workflow_dispatch` + daily cron, `concurrency: grafana-apply`; pull channel tag via oras, `gh attestation verify --repo code-dot-org/code-dot-org`, early-exit on digest match against a repo Actions variable
- [ ] 6.2 Rework `opentofu/modules/grafana` dashboards/alerts wiring to consume artifact JSON with `templatefile()` binding; binding values (UIDs, Sentry IDs, base URL) become Tofu variables; fail on unresolved placeholders
- [ ] 6.3 Phase 1: workflow posts `tofu plan` to the run summary; humans compare against the legacy path and apply locally
- [ ] 6.4 Cutover PR: flip `dashboards.tf`/`alerts.tf` to artifact-sourced JSON, delete `observability/dashboards/grafana`, apply; verify all 12 dashboards + 3 alert groups render and fire identically in AMG
- [ ] 6.5 Phase 2: OIDC role + AMG token in infra CI; prod apply behind a GitHub environment with required reviewers; retire laptop applies
- [ ] 6.6 Update infra repo README/AGENTS docs: authoring now happens in the monorepo; infra owns binding + promotion

## 7. Verification and docs

- [ ] 7.1 End-to-end drill: merge a trivial panel change in the monorepo → artifact publishes → notify push → reconcile plan shows exactly that panel diff → gated apply lands it in AMG
- [ ] 7.2 Rollback drill: repin previous digest, reconcile, confirm AMG reverts
- [ ] 7.3 Package README: authoring guide (add a signal, add a dashboard, add an alert), artifact/placeholder contract, consumer quickstart for forks
