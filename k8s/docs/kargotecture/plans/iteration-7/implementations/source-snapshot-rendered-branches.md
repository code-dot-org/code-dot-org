# Source Snapshot (Helm or Kustomize) + Rendered Branches Implementation Review

## Helm

- `code-dot-org` branch: `kargo/source-snapshot-rendered-branches/helm`, PR `#71566`
- `k8s-gitops` branch: `kargo/source-snapshot-rendered-branches/helm`, PR `#5`
- `code-dot-org` repo: `Cumulative Lines Added: 218 (added: 164, deleted: 54)` across 6 files
- `k8s-gitops` repo: `Cumulative Lines Added: 517 (added: 424, deleted: 93)` across 25 files
- `Legacy gitflow gate implemented?` Yes
- `Implementation looks complete?` Partial

What landed:
- `code-dot-org` adds workflow changes plus a small amount of Helm package shaping.
- `k8s-gitops` adds the freight Warehouse, ApplicationSets, envType values files, rendered-branch stages, and the expected snapshot-oriented render path from `warehouses/codeai/freight/current/helm`.
- The legacy-gitflow coexistence module is now present end-to-end: `code-dot-org` writes merged gate markers and downstream stages parse them before promotion.
- `review-infra-changes` exists and follows the rendered-branch review pattern.

Missing or suspicious:
- `production.yaml` is effectively unfinished. It declares `requestedFreight` from `review-infra-changes` and nothing else.
- The Helm Warehouse only subscribes to `warehouses/codeai/freight/current`, not the broader `freight/` tree, which makes the historical snapshot story feel less explicit than the plan doc.
- `test` renders and updates Argo but does not add an explicit verification block.

Final freight complexity:
- Medium to high.
- Freight is Git-only, but it is much heavier than the thin-lock or common-case variants because it duplicates the package into both a historical release directory and a stable `current/` mirror.
- The result is very explicit, but no longer especially small.

## Kustomize

- `code-dot-org` branch: `kargo/source-snapshot-rendered-branches/kustomize`, PR `#71570`
- `k8s-gitops` branch: `kargo/source-snapshot-rendered-branches/kustomize`, PR `#10`
- `code-dot-org` repo: `Cumulative Lines Added: 165 (added: 121, deleted: 44)` across 3 files
- `k8s-gitops` repo: `Cumulative Lines Added: 542 (added: 455, deleted: 87)` across 26 files
- `Legacy gitflow gate implemented?` Yes
- `Implementation looks complete?` Partial

What landed:
- `k8s-gitops` carries most of the implementation: a Git Warehouse over `warehouses/codeai/freight`, deploy-entrypoint Kustomizations, envType patches, a shared wrapper template, and rendered-branch stages.
- Staging/test/levelbuilder render from the frozen snapshot under `warehouses/codeai/freight/current/kustomize`.
- The downstream stages now also enforce the legacy-gitflow merged-marker gate before promotion.
- `review-infra-changes` exists and follows the expected rendered-branch flow.

Missing or suspicious:
- `production.yaml` only clones and parses Freight; it never performs a final sync/update action.
- There is no explicit Kargo verification block in `test`.
- The branch proves the main render loop, but the final promotion handoff still reads as unfinished.

Final freight complexity:
- Medium to high.
- Freight is a full frozen package snapshot mirrored through `current/`, which is much richer than a thin lock and much less native than common-case Freight.
- The implementation confirms the design tradeoff: reviewability stays high, but the release object is now permanent system furniture.

## Overall

These branches demonstrate the snapshot design, but they also show the cost of that explicitness. The frozen-input story is strong; the implementation polish is weaker than the top-ranked common-case branches, especially around the final production hop.
