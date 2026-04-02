# Implementation notes

This file records places where the runnable split does not follow
`k8s/docs/reorg/after.md` literally.

## Current notes

- The former standalone early-bootstrap root was collapsed into
  `phase2/modules/non-aws-bootstrap`. `phase2` is therefore no longer a
  pure AWS-only root.
- `phase2/modules/non-aws-bootstrap/kargo-git-credentials.tf` still uses
  `bootstrapped-aws-secret` to create or seed Secrets Manager secrets when the
  optional bootstrap values are set.
- `phase3` remains the remaining Kubernetes-side add-on root.
- `gateway-api-crds.tf` lives in `phase3`, not `phase1`. The current split
  keeps it with the remaining Kubernetes-side add-ons.
- Dex no longer threads the Argo CD client secret through OpenTofu. Phase3 now
  uses ESO for that shared secret, and Dex consumes it with `secretEnv`.
- Phase2 now mirrors the Dex Google service-account key into AWS Secrets
  Manager so the static phase3 Dex chart can pull both Google secrets through
  ESO. The old mixed root wrote that key directly into a Kubernetes Secret.
- `external-dns` is split across phases:
  - `phase2`: AWS IA wrapper for IRSA role and policy, plus the annotated
    service account
  - `phase3`: direct `helm_release`
- `aws-load-balancer-controller` is split the same way:
  - `phase2`: AWS IA wrapper for IRSA role and policy, plus the annotated
    service account
  - `phase3`: direct `helm_release`
- Phase2 now also precreates the `kargo-system-resources` namespace and its
  IRSA-annotated ESO service account so the phase3 Kargo webhook charts can
  stay static.
- The AWS IA telemetry CloudFormation stack is omitted. For `external-dns` this
  is done with `observability_tag = null`. The older
  `aws-load-balancer-controller` wrapper version used here does not expose that
  argument.
- `phase3` remains OpenTofu-managed Kubernetes, despite the architectural label
  "K8S, either Crossplane or ACK" in `after.md`.
- `phase2/modules/non-aws-bootstrap/kargo-github-webhook.tf` reads the
  webhook secret value back from AWS Secrets Manager using the secret name
  exported by the AWS-side part of `phase2`. In the old mixed root, that
  value came from the sibling bootstrap module in
  `kargo-github-webhook-secret.tf`. The created GitHub webhook is the same.
