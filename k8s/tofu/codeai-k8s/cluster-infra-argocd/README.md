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
  `bin/argo-trace --operation destroy`
- Watch at a fixed cadence:
  `bin/argo-trace --operation destroy --poll-every 1m`
- Follow one specific root:
  `bin/argo-trace --root-name app-of-apps --operation apply --poll-every 30s`

`bin/logged-tofu apply` and `bin/logged-tofu destroy` already run this tracer as
a sidecar, capture that stdout in `logs/argocd-<action>-<timestamp>.log.md`,
and print the md log path at the start of the run.

## Testing

### Testing scripts used in deploying the cluster

- If you modify `bin/argo-trace`, run before commit:
  `ruby test/argocd_progress_trace_test.rb`
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
