We are currently working on a destroy/apply project. If you just compacted,
re-read `AGENTS.md` and `CHECKLIST.md` and continue on.

- When making Helm chart changes you intend to `tofu apply`, bump the chart version or Helm may report no diff.

## Logged tofu

- In this directory, use `bin/logged-tofu <apply|destroy> [extra tofu args...]` for logged OpenTofu applies and destroys unless the user explicitly says otherwise.
- Do not use `bin/logged-tofu` for `plan`. Run `tofu plan` directly when a plain plan is what you need.
- `bin/logged-tofu` runs `bin/argo-trace` for the same operation as a sidecar logger and writes `logs/argocd-<action>-<timestamp>.log.md`. That tracer is not an implementation detail; treat that md log as a primary debugging tool and mirror its output raw in chat when it emits updates.
- While `bin/logged-tofu` is running, relay each new `bin/argo-trace` message to the user verbatim in chat as soon as it arrives.
- `bin/logged-tofu` now writes three first-class logs per run:
  - `logs/tofu-<timestamp>-<action>.log`
  - `tofu.log`
  - `logs/argocd-<action>-<timestamp>.log.md`
- When starting a logged run, print the exact `tail -n +1 -f ...` commands for all three logs in chat.
- `bin/logged-tofu` starts and stops its sidecar watchers itself. `bin/logged-tofu-stop` is only for stale cleanup after an interrupted run.

## Freeze Argo

- If the user asks to freeze or pause Argo control-plane action while keeping it around for inspection, run:
  `kubectl -n argocd scale statefulset/argocd-application-controller deployment/argocd-applicationset-controller --replicas=0`
- To resume, run:
  `kubectl -n argocd scale statefulset/argocd-application-controller deployment/argocd-applicationset-controller --replicas=1`

## Reading runs

- For human-facing progress, read `logs/argocd-<action>-<timestamp>.log.md` first. That file is the primary progress view.
- For deep debugging, start with these two paths in this order:
  - `logs/argocd-<action>-<timestamp>.log.md`
  - `bin/argo-trace`
- Think from those two files first. Use the tracer output as the clearest view of what Argo is blocked on. Use the tracer source to prove why the tree looks the way it does. Do not treat its output as magic.
- In chat, mirror that `.log.md` output raw. Add interpretation only after the raw block, and only if needed to explain what changed or why it matters.
- Use the per-run `logs/tofu-*.log` only for proof, low-level provider errors, shell output, or other debug spew the md log does not carry.
- Do not diagnose from `tofu.log` unless you need long-run history. Prefer the latest per-run files.

## Destroy rules

- After any `tofu destroy`, immediately run `bin/check-phase-deployment-status`.
- Namespace-only residue is expected here because Argo uses `CreateNamespace=true`. Treat that as non-gating.
- Any non-namespace residue is a destroy failure until explained.
- Fix ordering, ownership, health, dry-run, or dependency issues first. Do not reach for teardown hooks or cleanup scripts as a first answer.
- For the Apr. 6 Crossplane destroy regression, start from `TODO.destroy.failed.apr6.md`.

## Cleanup rules

- Do not clean up residue unless the user explicitly asks.
- If the user asks for cleanup, delete only exact proven phase-owned residue. Do not broaden scope by guesswork.
- After cleanup, verify again with `bin/check-phase-deployment-status`.

## Sanity check

- If phase 3 looks clean, sanity-check with `tofu apply` in `../cluster-infra` before trusting the baseline. If that apply wants to recreate previous-phase objects, treat that as proof of over-deletion.

## Testing

### Testing scripts used in deploying the cluster

- If you modify `bin/argo-trace`, run before commit:
  `ruby test/argo-trace/argocd_progress_trace_test.rb`
- For live `bin/argo-trace` stress coverage, run:
  `ruby test/argo-trace-stress-test/run.rb`
- `test/argo-trace/fixtures/argocd_progress_trace/` holds the unit-test fixture
  payloads for `bin/argo-trace`.
- `test/argo-cli-trace/fixtures/argo-cli-data/` holds saved `argocd --core`
  YAML responses for the new `argo-cli-trace` work.
- `test/argo-cli-trace/expected-output-from-argo-cli-given-data-responses.txt`
  is the expected rendered tree for that saved Argo CLI dataset.
- If you modify `bin/logged-tofu`, run before commit:
  `ruby test/logged_tofu_test.rb`
- If you modify `bin/wait-for-200`, run before commit:
  `ruby test/wait_for_200_test.rb`

### Smoke testing a cluster is working once its up

- once a cluster is up, you can use these smoke tests to test it:
  `./cluster-smoke-tests/test-external-secrets.sh`
  `./cluster-smoke-tests/test-ingress.sh`
  `./cluster-smoke-tests/test-nlb.sh`
  `./cluster-smoke-tests/test-gateway-http.sh`
