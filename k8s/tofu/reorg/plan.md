# Reorg `codeai-k8s`

## Summary

Split the old `codeai-k8s` roots into three ordered roots:

- `phase1`
- `phase2`
- `phase3`

Phase 0 remains `../codeai-k8s-dex`.

Apply order:

1. `phase1`
2. `phase2`
3. `phase3`

The old `k8s/tofu/codeai-k8s*` trees stay unchanged.

## Intent

- `phase1`: EKS cluster bootstrap only
- `phase2`: AWS-side substrate plus a small internal non-AWS bootstrap module
- `phase3`: remaining Kubernetes-side cluster add-ons

This is still a copy-and-refactor of the old roots. Preserve comments, headers,
locals, variable descriptions, and resource text verbatim wherever sane.

## State keys

- `codeai-k8s/reorg/phase1.tfstate`
- `codeai-k8s/reorg/phase2.tfstate`
- `codeai-k8s/reorg/phase3.tfstate`

## Phase outline

### `phase1`

Derived from `codeai-k8s/eks-cluster`.

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

### `phase2`

Consumes `phase1` remote state.

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

### `phase3`

Consumes `phase1` and `phase2` remote state.

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

- `tofu fmt -check -recursive k8s/tofu/reorg`
- in `phase1`: `tofu init -backend=false && tofu validate`
- in `phase2`: `tofu init -backend=false && tofu validate`
- in `phase3`: `tofu init -backend=false && tofu validate`

Then confirm:

- `phase1` is cluster bootstrap only
- `phase2` contains the AWS-side root plus its internal bootstrap module
- `phase3` is the remaining K8S-side add-on root
- `k8s/tofu/codeai-k8s*` remains unchanged
