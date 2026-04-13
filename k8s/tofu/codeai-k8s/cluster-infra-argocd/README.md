# cluster-infra-argocd

Bootstraps ArgoCD and the app-of-apps, then hands Kubernetes-side resources off to Argo from `k8s-gitops`.

Includes:
- AWS Load Balancer Controller
- External Secrets Operator
- External Secrets per-environment SecretStores and envtype fanout
- ExternalDNS
- Dex (SSO for K8s)
- ArgoCD
- Kargo writeback git credentials and webhook secrets in Kubernetes

## Pre-requisites

Apply `../cluster/` and `../cluster-infra/` first.

## Usage

Prerequisite: `../cluster/` and `../cluster-infra/` must already have been applied.

```bash
tofu init
AWS_PROFILE=codeorg-admin tofu apply
```

## Watching Argo

`bin/argo-trace` prints the live Argo/Kubernetes dependency tree to
stdout.

- One snapshot, suitable for `watch`:
  `bin/argo-trace`
- Watch at a fixed cadence:
  `bin/argo-trace --poll-every 1m`
- Follow one specific root:
  `bin/argo-trace --root-name app-of-apps --poll-every 30s`

`bin/logged-tofu apply` and `bin/logged-tofu destroy` already run this tracer as
a sidecar, capture that stdout in `logs/argocd-<action>-<timestamp>.log.md`,
and print the md log path at the start of the run.

## Testing

### Testing scripts used in deploying the cluster

- If you modify `bin/argo-trace`, run before commit:
  `ruby test/argo-trace/argocd_progress_trace_test.rb`
- For the live `bin/argo-trace` stress harness, run:
  `ruby test/argo-trace-stress-test/run.rb`
  Fixtures live in
  [`k8s-gitops/argo-trace-stress-test/`](https://github.com/code-dot-org/k8s-gitops/tree/main/argo-trace-stress-test).
- `test/argo-trace/fixtures/argocd_progress_trace/` holds the unit-test fixture
  payloads for `bin/argo-trace`.
- `test/argo-cli-trace/fixtures/argo-cli-data/` holds saved `argocd --core`
  YAML responses for `argo-cli-trace`.
- `test/argo-cli-trace/expected-output-from-argo-cli-given-data-responses.txt`
  is the expected rendered tree for that saved Argo CLI dataset.
- If you modify `bin/logged-tofu`, run before commit:
  `ruby test/logged_tofu_test.rb`
- If you modify `bin/wait-for-200`, run before commit:
  `ruby test/wait_for_200_test.rb`
- `bin/wait-for-200` smoke:
  `bin/wait-for-200 --timeout-seconds 30 https://studio.code.org`

### Smoke testing a cluster is working once its up

- once a cluster is up, you can use these smoke tests to test it:
  `./cluster-smoke-tests/test-external-secrets.sh`
  `./cluster-smoke-tests/test-ingress.sh`
  `./cluster-smoke-tests/test-nlb.sh`
  `./cluster-smoke-tests/test-gateway-http.sh`
