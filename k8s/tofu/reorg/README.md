# OpenTofu reorg

This directory is a copy-and-refactor of `../codeai-k8s`.

Do not edit `../codeai-k8s` here. The old roots remain the current source of truth
until this reorg is complete and validated.

Apply order:

1. `phase1`
2. `phase2`
3. `phase3`

Phase 0 is still `../codeai-k8s-dex` and must already have been applied.

The intended split is:

- `phase2`: AWS-side substrate plus a small internal non-AWS bootstrap module
- `phase3`: remaining Kubernetes-side cluster add-ons, including app-of-apps bootstrap

For places where the split cannot follow `k8s/docs/reorg/after.md` literally, see:

- `./implementation-notes.md`
