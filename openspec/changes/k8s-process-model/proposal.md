# k8s-process-model

## Why

The helm chart runs dev-mode processes in k8s. The default command in
`k8s/helm/values.yaml` is `["bin/dashboard-server"]` — a dev tool that wraps
`rails server` in `rerun` file-watching and spawns an apps watcher — and the
dashboard template sets `tty: true` because "dashboard stdout logging assumes
a tty". The ActiveJob worker runs
`zsh -c "cd dashboard && bundle exec bin/delayed_job run"`: PID 1 is zsh,
which does not forward SIGTERM, so on pod eviction delayed_job is hard-killed
at grace-period expiry mid-job. There is no docker-entrypoint script anywhere,
and the worker Deployment has no probes. Containers should run one directly
exec'd process that owns PID 1, handles signals, and logs to stdout.

## What Changes

- Add `bin/docker-entrypoint` following the Rails template convention: env
  fixup, `db:prepare`-equivalent only when the container command is the web
  server, then `exec "$@"`. Workers run the same entrypoint harmlessly and
  never race migrations.
- **BREAKING** Web command becomes exec-form
  `["bundle", "exec", "puma", "-C", "config/puma.rb"]` with WORKDIR at
  `dashboard/`. `bin/dashboard-server` (rerun, apps watcher) leaves the k8s
  path entirely.
- **BREAKING** Worker command becomes exec-form
  `["bundle", "exec", "bin/delayed_job", "run"]` — no shell wrapper, signals
  reach the daemon.
- Remove `tty: true` from the dashboard template by making stdout logging
  tty-independent.
- Add a worker liveness probe (exec probe on the delayed_job process) and set
  `terminationGracePeriodSeconds` informed by max expected job runtime.
- Keep the one-image-two-commands split: web and worker Deployments differ
  only in command. Do NOT split into separate images.

## Capabilities

### New Capabilities

- `container-process-contract`: what process each container runs, how it
  starts, how it dies, and how kubelet observes it.

### Modified Capabilities

None (no existing specs).

## Impact

- New `bin/docker-entrypoint` (or `k8s/docker/` equivalent)
- `k8s/docker/code-dot-org.dockerfile` (ENTRYPOINT/CMD)
- `k8s/helm/values.yaml` (command/args defaults),
  `k8s/helm/activejob-only.values.yaml`
- `k8s/helm/templates/dashboard/_dashboard.yaml` (tty, probes, grace period),
  `k8s/helm/templates/dashboard/active-job-worker-deployment.yaml`
- Dashboard logging code paths that assume a tty
- Depends on the `docker-rails-way-image` targets.
