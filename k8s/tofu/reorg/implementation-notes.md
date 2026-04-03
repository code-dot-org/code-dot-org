# Implementation notes

This file records places where the runnable split does not follow
`k8s/docs/reorg/after.md` literally.

## Current notes

- `phase2` publishes `codeai-cluster-config` in `kube-system` as the non-secret
  handoff object for later Helm / GitOps consumers. `phase3` now reads that
  `ConfigMap` instead of reading `phase2` remote-state outputs directly.
- `phase2/infra/kargo-secrets/kargo-git-credentials-bootstrap.tf` still uses
  `bootstrapped-aws-secret` to create or seed Secrets Manager secrets when the
  optional bootstrap values are set.
- `phase3` remains the remaining Kubernetes-side add-on root.
- `phase3/infra/ingress-and-gateway` vendors the upstream Gateway API CRDs in
  `crds/` and keeps them with the AWS Load Balancer Controller and the shared
  ALB `GatewayClass` resources. The current split still keeps that bundle in
  `phase3`, not `phase1`.
- The upstream Gateway API `standard-install.yaml` is kept intact under
  `phase3/infra/ingress-and-gateway/crds/` and tracked with a local
  `.gitattributes` Git LFS rule. `helm lint` complains because that upstream
  file also carries a `ValidatingAdmissionPolicy` and binding, but
  `helm template --include-crds` and the Helm release itself remain usable.
- Dex no longer threads the Argo CD client secret through OpenTofu. Phase3 now
  uses ESO for that shared secret, and Dex consumes it with `secretEnv`.
- Phase2 now mirrors the Dex Google service-account key into AWS Secrets
  Manager so the static phase3 Dex chart can pull both Google secrets through
  ESO. The old mixed root wrote that key directly into a Kubernetes Secret.
- `external-dns` is split across phases:
  - `phase2`: AWS IA wrapper for IRSA role and policy, plus the annotated
    service account
  - `phase3`: direct `helm_release`
- `ingress-and-gateway` is split the same way:
  - `phase2`: AWS IA wrapper for IRSA role and policy, plus the annotated
    service account
  - `phase3`: direct `helm_release` plus the shared gateway objects
- Phase3 now installs the External Secrets Operator chart itself. The old split
  installed ESO earlier in phase2 so Kargo shared-resources objects could live
  there.
- Phase3 now creates the Kargo shared-resources namespace, service account,
  SecretStore, and ExternalSecret via `infra/kargo-secrets`. Phase2 keeps only
  the AWS Secrets Manager bootstrap for the username and password.
- Phase2 now also precreates the `kargo-system-resources` namespace and its
  IRSA-annotated ESO service account so the phase3 Kargo webhook charts can
  stay static.
- The AWS IA telemetry CloudFormation stack is omitted. For `external-dns` this
  is done with `observability_tag = null`. The older
  `aws-load-balancer-controller` wrapper version used here does not expose that
  argument.
- `phase3` remains OpenTofu-managed Kubernetes, despite the architectural label
  "K8S, either Crossplane or ACK" in `after.md`.
- `phase2/infra/kargo-secrets/kargo-github-webhook.tf` reads the
  webhook secret value back from AWS Secrets Manager using the secret name
  exported by the AWS-side part of `phase2`. In the old mixed root, that
  value came from the sibling bootstrap module in
  `kargo-github-webhook-secret.tf`. The created GitHub webhook is the same.
