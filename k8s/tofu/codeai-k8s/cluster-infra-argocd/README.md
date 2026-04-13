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

- `bin/argo-trace` prints the live Argo/Kubernetes dependency tree to
stdout.

- `bin/watch-argo-trace` runs argo-trace in a loop, watching its output using `watch`, use this as your human default go to command to watch the cluster.

## Testing

### Testing scripts used in deploying the cluster

- If you modify `bin/argo-trace`, run before commit:
  `ruby test/argo-trace/argo_trace_test.rb`
- `test/argo-trace/fixtures/argo-cli-data/` holds saved `argocd --core`
  YAML responses for `argo-trace`.
- `test/argo-trace/expected-output-from-argo-trace-given-data-responses.txt`
  is the expected rendered tree for that saved Argo CLI dataset.
- If you modify `bin/log-cluster-events`, run before commit:
  `ruby test/log_cluster_events_test.rb`
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
