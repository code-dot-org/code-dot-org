# Argo Refs code-dot-org Commit Implementation Review

## Helm

- `code-dot-org` branch: `kargo/argo-refs-code-dot-org-commit/helm`, PR `#71561`
- `k8s-gitops` branch: `kargo/argo-refs-code-dot-org-commit/helm`, PR `#1`
- `code-dot-org` repo: `Cumulative Lines Added: 457 (added: 364, deleted: 93)` across 8 files
- `k8s-gitops` repo: `Cumulative Lines Added: 319 (added: 256, deleted: 63)` across 21 files
- `Legacy gitflow gate implemented?` Yes
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` adds the expected GH workflow plumbing plus dedicated helpers for writing the build lock and legacy gitflow metadata.
- `k8s-gitops` adds the thin-lock Warehouse at `warehouses/codeai/builds`, a full stage ladder, updated deployment metadata, and an ApplicationSet wired to GitOps-managed deploy refs.
- `review-infra-changes` opens a PR and `production` merges that PR and updates Argo CD.

Missing or suspicious:
- The `test` stage updates GitOps and Argo, but it does not add an explicit Kargo `verification` block or an analysis template. That keeps it short, but it means test automation is lighter than the plan doc implied.

Final freight complexity:
- Low to medium.
- Freight itself stays small: one Git build-lock record under `warehouses/codeai/builds/current.yaml` plus per-release history files.
- The complexity is mostly outside Freight, in the fact that Argo deploys source-oriented truth and Kargo only moves the lock.

## Kustomize

- `code-dot-org` branch: `kargo/argo-refs-code-dot-org-commit/kustomize`, PR `#71564`
- `k8s-gitops` branch: `kargo/argo-refs-code-dot-org-commit/kustomize`, PR `#3`
- `code-dot-org` repo: `Cumulative Lines Added: 447 (added: 370, deleted: 77)` across 11 files
- `k8s-gitops` repo: `Cumulative Lines Added: 539 (added: 464, deleted: 75)` across 27 files
- `Legacy gitflow gate implemented?` Yes
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` adds Kustomize-specific helper scripts and adjusts local overlay support.
- `k8s-gitops` adds per-deployment `deploy/kustomization.yaml` entrypoints, envType Kustomize components, a test verification template, the Warehouse, and the full stage ladder.
- `test` has a real `verification` block, `review-infra-changes` opens a PR, and `production` merges the PR.

Missing or suspicious:
- The deploy truth is more complex than the plan headline suggests because the thin build lock, envType components, and deploy-entrypoint Kustomizations all have to stay aligned.

Final freight complexity:
- Low to medium.
- Freight is still just the thin Git build-lock record under `warehouses/codeai/builds/`.
- The implementation complexity moved into GitOps-side Kustomize wiring rather than into Freight itself.

## Overall

This implementation family stayed faithful to the thin-lock idea. The final system looks small in Freight and larger in deploy wiring. The Helm branch is the lighter migration path; the Kustomize branch is more complete from a Kargo-verification standpoint.
