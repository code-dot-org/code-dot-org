# Implementation notes

This file records places where the runnable split does not follow
`k8s/docs/reorg/after.md` literally.

## Current notes

- `cluster-infra` publishes `codeai-cluster-config` in `kube-system` as the
  non-secret handoff object for later Helm / GitOps consumers.
  `cluster-infra-argocd` now reads that `ConfigMap` instead of reading
  `cluster-infra` remote-state outputs directly.
- `cluster-infra/infra/kargo-secrets/kargo-git-credentials-bootstrap.tf` still
  uses
  `bootstrapped-aws-secret` to create or seed Secrets Manager secrets when the
  optional bootstrap values are set.
- `cluster-infra-argocd` remains the remaining Kubernetes-side add-on root.
- `cluster-infra-argocd/infra/ingress-and-gateway` vendors the upstream Gateway
  API CRDs in
  `crds/` and keeps them with the AWS Load Balancer Controller and the shared
  ALB `GatewayClass` resources. The current split still keeps that bundle in
  `cluster-infra-argocd`, not `cluster`.
- The upstream Gateway API `standard-install.yaml` is kept intact under
  `cluster-infra-argocd/infra/ingress-and-gateway/crds/` and tracked with a local
  `.gitattributes` Git LFS rule. `helm lint` complains because that upstream
  file also carries a `ValidatingAdmissionPolicy` and binding, but
  `helm template --include-crds` and the Helm release itself remain usable.
- Dex no longer threads the Argo CD client secret through OpenTofu.
  `cluster-infra-argocd` now uses ESO for that shared secret, and Dex consumes
  it with `secretEnv`.
- `cluster-infra` now mirrors the Dex Google service-account key into AWS
  Secrets Manager so the static `cluster-infra-argocd` Dex chart can pull both
  Google secrets through ESO. The old mixed root wrote that key directly into a
  Kubernetes Secret.
- `external-dns` is split across roots:
  - `cluster-infra`: AWS IA wrapper for IRSA role and policy, plus the annotated
    service account
  - `cluster-infra-argocd`: direct `helm_release`
- `ingress-and-gateway` is split the same way:
  - `cluster-infra`: AWS IA wrapper for IRSA role and policy, plus the annotated
    service account
  - `cluster-infra-argocd`: direct `helm_release` plus the shared gateway objects
- `cluster-infra-argocd` now installs the External Secrets Operator chart
  itself. The old split installed ESO earlier in `cluster-infra` so Kargo
  shared-resources objects could live
  there.
- `cluster-infra-argocd` now creates the Kargo shared-resources namespace,
  service account, SecretStore, and ExternalSecret via `infra/kargo-secrets`.
  `cluster-infra` keeps only the AWS Secrets Manager bootstrap for the username
  and password.
- `cluster-infra` now also precreates the `kargo-system-resources` namespace
  and its IRSA-annotated ESO service account so the
  `cluster-infra-argocd` Kargo webhook charts can stay static.
- The AWS IA telemetry CloudFormation stack is omitted. For `external-dns` this
  is done with `observability_tag = null`. The older
  `aws-load-balancer-controller` wrapper version used here does not expose that
  argument.
- `cluster-infra-argocd` remains OpenTofu-managed Kubernetes, despite the
  architectural label "K8S, either Crossplane or ACK" in `after.md`.
- `cluster-infra/infra/kargo-secrets/kargo-github-webhook.tf` reads the
  webhook secret value back from AWS Secrets Manager using the secret name
  exported by the AWS-side part of `cluster-infra`. In the old mixed root, that
  value came from the sibling bootstrap module in
  `kargo-github-webhook-secret.tf`. The created GitHub webhook is the same.
