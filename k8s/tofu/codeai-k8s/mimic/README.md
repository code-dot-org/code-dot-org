# mimic

Bootstraps the non-production `mimic/` Argo tree from `k8s-gitops`.

This is a small test root for Argo app-of-apps experiments. It mirrors the real
bootstrap pattern, but points at:

- `mimic/apps/app-of-apps/bootstrap.yaml`
- `mimic/apps/app-of-apps/app-of-apps.yaml`

## Pre-requisites

Apply `../cluster/` and `../cluster-infra-argocd/` first.

## Usage

```bash
tofu init
AWS_PROFILE=codeorg-admin tofu apply
```
