# Common-Case Freight + Rendered Branches Implementation Review

## Helm

- `code-dot-org` branch: `kargo/common-case-rendered-branches/helm`, PR `#71562`
- `k8s-gitops` branch: `kargo/common-case-rendered-branches/helm`, PR `#2`
- `code-dot-org` repo: `Cumulative Lines Added: 153 (added: 11, deleted: 142)` across 5 files
- `k8s-gitops` repo: `Cumulative Lines Added: 469 (added: 396, deleted: 73)` across 20 files
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` mostly removes writeback-oriented workflow behavior instead of adding new packaging machinery.
- `k8s-gitops` adds the image+git Warehouse, ApplicationSet changes, full rendered-branch stage flow, and a rollout analysis template for `test`.
- `review-infra-changes` renders to a PR branch, waits for review, and `production` updates Argo CD to the reviewed `stage/production` commit.

Missing or suspicious:
- Very little changed in `code-dot-org`, which is consistent with the design, but it means most of the implementation burden lands in `k8s-gitops`.

Final freight complexity:
- Low.
- Freight is the cleanest in the whole set: one Warehouse watches the real app image and the real `code-dot-org` branch, then pairs them with `freightCreationCriteria`.
- There is no synthetic lock file and no snapshot archive under `warehouses/codeai/`.

## Kustomize

- `code-dot-org` branch: `kargo/common-case-rendered-branches/kustomize`, PR `#71567`
- `k8s-gitops` branch: `kargo/common-case-rendered-branches/kustomize`, PR `#7`
- `code-dot-org` repo: `Cumulative Lines Added: 157 (added: 14, deleted: 143)` across 5 files
- `k8s-gitops` repo: `Cumulative Lines Added: 530 (added: 418, deleted: 112)` across 23 files
- `Implementation looks complete?` Mostly complete

What landed:
- `k8s-gitops` adds the same common-case Warehouse shape plus Kustomize envType components, a shared deploy wrapper template, rendered stage branches, and a service-health analysis template.
- Stages sparse-check out `k8s/kustomize`, copy GitOps-side env inputs, run `kustomize-build`, and publish rendered output to `stage/*`.
- `production` is intentionally thin: it points Argo CD at the reviewed render commit captured from `review-infra-changes`.

Missing or suspicious:
- The Kustomize flow depends on wrapper-template assembly in `k8s-gitops`, so the operational simplicity is still better than the other variants, but the implementation is not “small” in absolute terms.

Final freight complexity:
- Low.
- The Freight model is identical to Helm: native image+git pairing and no Git warehouse payload.
- The extra complexity is in render-time assembly, not in the Freight object.

## Overall

This is the cleanest implementation family after code lands. The branches keep Freight small and native, and the added complexity is concentrated in rendered-branch review flow rather than in release bookkeeping.
