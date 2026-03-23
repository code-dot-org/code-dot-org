# OCI Release Capsule Implementation Review

## Helm

- `code-dot-org` branch: `kargo/oci-release-capsule/helm`, PR `#71563`
- `k8s-gitops` branch: `kargo/oci-release-capsule/helm`, PR `#6`
- `code-dot-org` repo: `Cumulative Lines Added: 524 (added: 388, deleted: 136)` across 10 files
- `k8s-gitops` repo: `Cumulative Lines Added: 1340 (added: 1277, deleted: 63)` across 35 files
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` adds a dedicated release-capsule publishing workflow and a build-context script.
- `k8s-gitops` adds an image+capsule Warehouse with tag-matching criteria, rendered deploy trees, and production-stage logic that downloads the capsule, validates `release.yaml`, opens a PR, waits for merge, and then updates Argo CD.
- Legacy gitflow metadata is also wired in.

Missing or suspicious:
- The implementation does not keep a separate `review-infra-changes` stage file. The Helm branch folds review behavior into `production`, which is workable but diverges from the iteration 7 plan shape.
- Test verification is lighter than the plan narrative. The core render path exists, but the verification story is not as explicit as the Kustomize branch.

Final freight complexity:
- High.
- Freight is a real two-artifact pair: the app image plus `ghcr.io/code-dot-org/codeai-release-capsule`, matched by tag in the Warehouse.
- On top of that, production still checks legacy-gitflow metadata and validates in-capsule metadata before rendering.

## Kustomize

- `code-dot-org` branch: `kargo/oci-release-capsule/kustomize`, PR `#71569`
- `k8s-gitops` branch: `kargo/oci-release-capsule/kustomize`, PR `#8`
- `code-dot-org` repo: `Cumulative Lines Added: 890 (added: 799, deleted: 91)` across 10 files
- `k8s-gitops` repo: `Cumulative Lines Added: 1261 (added: 1207, deleted: 54)` across 26 files
- `Implementation looks complete?` Mostly complete

What landed:
- `code-dot-org` adds the richest implementation-specific tooling in the set: capsule build logic, a release-verifier service contract, and tests for that verifier.
- `k8s-gitops` adds the verifier deployment/service/configmap, a smoke analysis template, release metadata templates, rendered-branch flow, and the full stage ladder.
- `production` re-validates the approved release by calling an in-cluster verifier service before stamping metadata.

Missing or suspicious:
- The Warehouse only subscribes to the app image, not the capsule. That means the final implementation is not a native paired Freight model the way the plan doc described; the capsule is looked up and verified later.
- Several `deploy/README.md` placeholders suggest the steady-state rendered output lives on stage branches, but the on-`main` deploy tree is still mostly scaffolding.

Final freight complexity:
- Very high.
- The effective release contract spans image Freight, out-of-band capsule verification, release metadata files, verifier service state, and legacy-gitflow records.
- This is the strongest provenance story, but it is clearly the most operationally heavy implementation.

## Overall

These branches prove the capsule idea can be built, but they also prove why it scored lower on KISS. Even when the main path works, the system ends up carrying more moving parts than the rendered-Git winners.
