# k8s-process-model — tasks

## 1. Logging groundwork

- [ ] 1.1 Audit dashboard code paths behind the "stdout logging assumes a
      tty" comment in `_dashboard.yaml`; list every tty-conditional
- [ ] 1.2 Make the logger write to stdout unconditionally under k8s
      (STDOUT sync, no tty check)

## 2. Entrypoint

- [ ] 2.1 Add `bin/docker-entrypoint` (Rails template shape): env fixup,
      `db:prepare`-equivalent gated on the web server command, `exec "$@"`
- [ ] 2.2 Decide idempotence vs the existing setup-db job: both safe to run
      concurrently, or retire the job here
- [ ] 2.3 Wire `ENTRYPOINT`/default `CMD` and `WORKDIR dashboard` into
      `k8s/docker/code-dot-org.dockerfile` (on `docker-rails-way-image`
      targets)

## 3. Helm: web

- [ ] 3.1 Change the default command in `k8s/helm/values.yaml` to exec-form
      `["bundle", "exec", "puma", "-C", "config/puma.rb"]`
- [ ] 3.2 Remove `tty: true` from
      `k8s/helm/templates/dashboard/_dashboard.yaml`
- [ ] 3.3 Confirm existing `/health_check` probes unchanged; note startup
      timing delta (puma vs dashboard-server) in the PR

## 4. Helm: worker

- [ ] 4.1 Replace `activeJobWorker.args` zsh wrapper with exec-form
      `["bundle", "exec", "bin/delayed_job", "run"]` in `values.yaml` and
      `activejob-only.values.yaml`
- [ ] 4.2 Add exec liveness probe to
      `active-job-worker-deployment.yaml`
- [ ] 4.3 Measure max expected job runtime; set
      `terminationGracePeriodSeconds` from it

## 5. Verification

- [ ] 5.1 Web: process tree shows puma as PID 1, no shell/rerun ancestor;
      `/health_check` returns 200
- [ ] 5.2 Worker: `kubectl delete pod` during a long job — job completes,
      clean exit before grace expiry (watch for SIGKILL in events)
- [ ] 5.3 Logs: `kubectl logs` streams unbuffered request/app logs with no
      tty allocated
- [ ] 5.4 Liveness: kill delayed_job inside the container; kubelet restarts
      it
- [ ] 5.5 Concurrent start: scale workers up while web boots; no migration
      race
