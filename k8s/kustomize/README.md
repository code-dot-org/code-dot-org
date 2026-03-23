# Code.org Kustomize Package

This package is the source-oriented deploy entrypoint for CodeAI.

## Layout

- `base/`: shared deployable resources published for Argo CD consumption
- `components/`: reusable package-local components
- `local/`: local-development helper entrypoints only
- `overlays/`: existing local/server-shaped helpers retained for parity and migration
- `bin/`: helper scripts used by CI validation and release metadata writeback

Argo CD should consume the remote `base/` path pinned to an exact `code-dot-org`
commit from `k8s-gitops/apps/codeai/deployments/<deployment>/deploy/`.
