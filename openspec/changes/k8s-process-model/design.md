# k8s-process-model — design

## Context

Current state (branch `update-k8s-config-2`): the web Deployment runs
`bin/dashboard-server` (values.yaml default command) — rerun wrapping
`rails server` plus an apps watcher — with `tty: true` in
`k8s/helm/templates/dashboard/_dashboard.yaml` and startup/readiness/liveness
probes on `/health_check` (startupProbe failureThreshold 300 × 1s). The
worker Deployment runs `zsh -c "cd dashboard && bundle exec bin/delayed_job
run"` (values.yaml `activeJobWorker.args`) and has no probes. No
docker-entrypoint script exists. `dashboard/config/puma.rb` exists and is
production-shaped: workers from `CDO.dashboard_workers` (`:auto` fallback),
`threads 1, 5`.

Reference conventions: the Rails generated Dockerfile's
`bin/docker-entrypoint` (prep-then-`exec "$@"`), Kamal roles (one image, web
and job roles differ by command), and the general k8s rule that PID 1 must
receive and act on SIGTERM.

## Goals / Non-Goals

**Goals:**
- Every container execs its real process as PID 1; SIGTERM drains cleanly.
- One entrypoint owns one-shot prep; commands stay overridable per role.
- Logging to stdout without a tty; kubelet can observe both roles.

**Non-Goals:**
- Image contents, stages, jemalloc — that is `docker-rails-way-image`.
- Replacing delayed_job with Solid Queue (Rails 8 default) — future change.
- The dev inner loop — that is `dashboard-devcontainer`.
- Horizontal autoscaling policy; only the per-pod process contract.

## Decisions

1. **Entrypoint owns one-shot prep; CMD is the process.** `bin/docker-entrypoint`
   does env fixup, runs a `db:prepare`-equivalent only when `$1` is the web
   server command, then `exec "$@"`. Workers run the same entrypoint
   harmlessly and never race migrations. Alternative: initContainers or the
   existing separate setup-db job for all prep — keeps entrypoint trivial but
   means two mechanisms; the Rails-template shape is one script everyone
   recognizes.
2. **Exec-form CMD + WORKDIR, not `zsh -c` chains.** Signal delivery is the
   reason: with `zsh -c`, PID 1 is zsh, which does not forward SIGTERM, so
   delayed_job dies by SIGKILL mid-job at grace-period expiry. `WORKDIR
   dashboard` replaces the `cd`; exec-form makes the real process PID 1.
   Alternative: `exec` inside a shell string — works but is one forgotten
   `exec` away from regressing; exec-form cannot regress.
3. **delayed_job stays.** Solid Queue is the Rails 8 default and the likely
   destination, but a queue-backend migration is orthogonal to the process
   contract and explicitly out of scope. `bin/delayed_job run` (foreground,
   non-daemonizing) is the container-correct invocation we already have.
4. **Probes: keep web, add worker exec liveness.** The web probe stack on
   `/health_check` is already right (startupProbe absorbs slow boots).
   Workers have no port, so liveness is an exec probe checking the
   delayed_job process/pid. Alternative: a heartbeat file touched per job
   loop — better fidelity, more moving parts; start with process presence.
5. **One image, two commands.** Web and worker Deployments differ only in
   command — the Kamal-roles shape, standard across k8s Rails shops.
   Alternative (separate worker image) rejected: doubles build/publish paths
   for zero isolation gain; `activejob-only.values.yaml` already selects by
   values, not image.
6. **Worker `terminationGracePeriodSeconds` from job runtime.** delayed_job
   finishes its current job on SIGTERM; the grace period must exceed the max
   expected job runtime or eviction still hard-kills. Set from observed job
   durations, not the 30s default.

## Risks / Trade-offs

- [Dashboard logging assumes a tty in unknown places] → audit the code paths
  behind the `tty: true` comment; fix the logger to write to stdout
  unconditionally in k8s before removing the flag.
- [rerun-based hot reload disappears from the k8s dev path] → the dev inner
  loop moves to the devcontainer (separate `dashboard-devcontainer`
  proposal); skaffold sync remains available meanwhile.
- [Entrypoint `db:prepare` overlaps the existing setup-db job] → decide
  idempotence rules: both must be safe to run concurrently or the job is
  retired in this change; `db:prepare` is advisory-locked, but verify against
  our seed steps.
- [Grace period set too low] → start conservative, measure real job
  durations, tune down; a too-high value only slows rollouts.

## Migration Plan

Land the entrypoint and CMD in the image (depends on `docker-rails-way-image`
targets), then switch helm values per environment: worker path first
(activejob-only profile already isolates it), then web. Rollback = revert
helm values to the previous command/args; the old image still honors them.
No data migration.

## Open Questions

- Helm resource sizing derives from EC2-era ratios (5.81GiB/worker,
  `_dashboard.yaml` lines 15-29). Re-profile puma workers/threads and memory
  requests with jemalloc (from `docker-rails-way-image`) before the
  autoscaler calcifies these numbers — here or a follow-up?
- Exact worker liveness mechanism: pid presence vs `delayed_job status`-style
  check — which is cheap enough per probe interval?
