# `codeai-k8s`

## Summary

Split the old `codeai-k8s` roots into three ordered roots:

- `cluster`
- `cluster-infra`
- `cluster-infra-argocd`

Phase 0 remains `../codeai-k8s-dex`.

Apply order:

1. `cluster`
2. `cluster-infra`
3. `cluster-infra-argocd`

The old `k8s/tofu/codeai-k8s-pre-reorg` tree stays unchanged.

## Intent

- `cluster`: EKS cluster bootstrap only
- `cluster-infra`: AWS-side substrate plus a small internal non-AWS bootstrap module
- `cluster-infra-argocd`: remaining Kubernetes-side cluster add-ons

This is still a copy-and-refactor of the old roots. Preserve comments, headers,
locals, variable descriptions, and resource text verbatim wherever sane.

## State keys

- `codeai-k8s/cluster.tfstate`
- `codeai-k8s/cluster-infra.tfstate`
- `codeai-k8s/cluster-infra-argocd.tfstate`

## Phase outline

### `cluster`

Derived from `codeai-k8s-pre-reorg/eks-cluster`.

Contains:

- EKS cluster
- networking
- cluster-shape outputs needed by later roots

Does not contain:

- Route53
- ACM
- ExternalDNS
- ESO
- Gateway API CRDs

### `cluster-infra`

Consumes `cluster` remote state.

The root itself contains AWS-side resources:

- Route53 zone + delegation
- ACM wildcard certificate + validation records
- ExternalDNS IAM / IRSA
- AWS Load Balancer Controller IAM / IRSA
- Dex Google client secret bootstrap in Secrets Manager
- ESO IAM roles
- Kargo SecretStore IAM
- Kargo GitHub webhook bootstrap secret

It also invokes `modules/non-aws-bootstrap`, which contains:

- External Secrets Operator Helm install
- Kargo shared-resources namespace, service account, and SecretStore
- Kargo git credentials `ExternalSecret`
- Kargo GitHub organization webhook
- optional bootstrap writes for the Kargo git credentials in Secrets Manager

### `cluster-infra-argocd`

Consumes `cluster` and `cluster-infra` remote state.

Contains the remaining Kubernetes-side add-ons:

- Gateway API CRDs
- ExternalDNS plain Helm install
- ArgoCD
- Argo CD app-of-apps bootstrap
- AWS Load Balancer Controller plain Helm install
- Dex and its K8S glue
- ESO per-env K8S resources
- frontend pod security group policy
- AWS ALB GatewayClass resources
- Kargo GitHub webhook SecretStore and `ExternalSecret`

## Notes

Record every place where runnable parity wins over a literal reading of
`k8s/docs/reorg/after.md` in `implementation-notes.md`.

## Validation

- `tofu fmt -check -recursive k8s/tofu/codeai-k8s`
- in `cluster`: `tofu init -backend=false && tofu validate`
- in `cluster-infra`: `tofu init -backend=false && tofu validate`
- in `cluster-infra-argocd`: `tofu init -backend=false && tofu validate`

Then confirm:

- `cluster` is cluster bootstrap only
- `cluster-infra` contains the AWS-side root plus its internal bootstrap module
- `cluster-infra-argocd` is the remaining K8S-side add-on root
- `k8s/tofu/codeai-k8s-pre-reorg` remains unchanged
