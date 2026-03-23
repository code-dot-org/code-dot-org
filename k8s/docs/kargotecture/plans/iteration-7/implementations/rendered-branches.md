# Rendered Branches from a Thin Lock Implementation Review

## Helm

- `code-dot-org` branch: `kargo/rendered-branches/helm`, PR `#71565`
- `k8s-gitops` branch: `kargo/rendered-branches/helm`, PR `#4`
- `code-dot-org` repo: `Cumulative Lines Added: 285 (added: 213, deleted: 72)` across 4 files
- `k8s-gitops` repo: `Cumulative Lines Added: 569 (added: 469, deleted: 100)` across 23 files
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` keeps the app-side changes minimal and mostly workflow-driven.
- `k8s-gitops` adds the thin-lock Warehouse, rendered stage branches, ApplicationSet changes, and the full five-stage ladder.
- `review-infra-changes` opens a PR against `stage/production`, and `production` acts as a final legacy-gate approval hop after reviewed output already exists on the production stage branch.

Missing or suspicious:
- `test` renders and pushes, but it does not add explicit Kargo verification or an analysis template.
- `production` is intentionally narrow; it does not perform an explicit Argo update step because the reviewed `stage/production` branch is treated as deploy truth.

Final freight complexity:
- Medium.
- Freight itself is still small: one thin build-lock record under `warehouses/codeai/builds/`.
- The end-state system is more complex than Argo Refs because it adds rendered stage branches and PR review on top of that thin lock.

## Kustomize

- `code-dot-org` branch: `kargo/rendered-branches/kustomize`, PR `#71568`
- `k8s-gitops` branch: `kargo/rendered-branches/kustomize`, PR `#9`
- `code-dot-org` repo: `Cumulative Lines Added: 440 (added: 342, deleted: 98)` across 9 files
- `k8s-gitops` repo: `Cumulative Lines Added: 600 (added: 498, deleted: 102)` across 24 files
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` adds Kustomize base/parity tweaks.
- `k8s-gitops` adds envType patches, a shared deploy wrapper template, the thin-lock Warehouse, and rendered-branch stage flow.
- The render path is the expected one: parse build lock, clone source at the pinned commit, assemble a deploy wrapper, build Kustomize output, and publish to `stage/*`.

Missing or suspicious:
- `production` is literally a no-op stage with `steps: []`. That may be intentional if merge-to-`stage/production` is the real deployment event, but it still reads as less finished than the top-ranked branches.
- `test` also lacks an explicit verification block.

Final freight complexity:
- Medium.
- Freight stays thin and synthetic, but the deploy system is no longer thin once rendered branches, wrapper assembly, and legacy gating are added.

## Overall

These branches make the thin-lock rendered-review idea real. The result is substantially more reviewable than Argo Refs, but the implementation confirms the ranking outcome: the build lock stays as permanent system furniture even after the rendered-branch machinery is added.
