# OpenTofu `codeai-k8s`

This directory is a copy-and-refactor of `../codeai-k8s-pre-reorg`.

Do not edit `../codeai-k8s-pre-reorg` here. The old roots remain the current source of truth
until this split is complete and validated.

Apply order:

1. `cluster`
2. `cluster-infra`
3. `cluster-infra-argocd`

The prerequisite root is still `../codeai-k8s-dex` and must already have been applied.

The intended split is:

- `cluster-infra`: AWS-side substrate plus a small internal non-AWS bootstrap module
- `cluster-infra-argocd`: remaining Kubernetes-side cluster add-ons, including app-of-apps bootstrap

For places where the split cannot follow `k8s/docs/reorg/after.md` literally, see:

- `./implementation-notes.md`
