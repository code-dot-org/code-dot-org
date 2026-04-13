- When making Helm chart changes you intend to `tofu apply`, bump the chart version or Helm may report no diff.

## Cluster log helper

- When starting an apply or destroy, whether via `tofu apply`, `tofu destroy`, or by manually adding or removing app-of-apps from Argo and watching, run `bin/log-cluster-events start` before you begin.
- No matter what happens, when the watched run is done, run `bin/log-cluster-events stop`.
- `bin/log-cluster-events start` accepts an optional label. If omitted, it uses `session`.
- `bin/log-cluster-events` does not run OpenTofu. Start logging first, then run `tofu apply` or `tofu destroy` separately.
- `bin/log-cluster-events` runs `bin/argo-trace` as a sidecar logger and writes `logs/argo-trace-<label>-<timestamp>.log.md`. That tracer is not an implementation detail; treat that md log as a primary debugging tool and mirror its output raw in chat when it emits updates.
- While `bin/log-cluster-events` is active, relay each new `bin/argo-trace` message to the user verbatim in chat as soon as it arrives.
- `bin/log-cluster-events` now writes three first-class logs per session:
  - `logs/cluster-<timestamp>-<label>.log`
  - `cluster.log`
  - `logs/argo-trace-<label>-<timestamp>.log.md`
- When running `bin/log-cluster-events start`, ALWAYS print the verbatim `tail -n +1 -f ...` commands for all three logs to the chat with user once they are sent to you.
- Stop the sidecar watchers with `bin/log-cluster-events stop`.

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
- Use the per-run `logs/cluster-*.log` only for proof, low-level provider errors, shell output, or other debug spew the md log does not carry.
- Do not diagnose from `cluster.log` unless you need long-run history. Prefer the latest per-run files.

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
  `ruby test/argo-trace/argo_trace_test.rb`
- `test/argo-trace/fixtures/argo-cli-data/` holds saved `argocd --core`
  YAML responses for the new `argo-trace` work.
- `test/argo-trace/expected-output-from-argo-trace-given-data-responses.txt`
  is the expected rendered tree for that saved Argo CLI dataset.
- If you modify `bin/log-cluster-events`, run before commit:
  `ruby test/log_cluster_events_test.rb`
- If you modify `bin/wait-for-200`, run before commit:
  `ruby test/wait_for_200_test.rb`

### Smoke testing a cluster is working once its up

- once a cluster is up, you can use these smoke tests to test it:
  `./cluster-smoke-tests/test-external-secrets.sh`
  `./cluster-smoke-tests/test-ingress.sh`
  `./cluster-smoke-tests/test-nlb.sh`
  `./cluster-smoke-tests/test-gateway-http.sh`
