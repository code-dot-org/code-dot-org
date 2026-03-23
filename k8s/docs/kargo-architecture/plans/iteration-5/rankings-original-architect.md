# Original Architect's Rankings

This file is normalized from the original architect's latest iteration 5 table
after two cleanup merges:

- [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./oci-package-pair-rendered-branches.md)

Because the original architect was unavailable for a fresh rescoring pass, both
merged rows are derived mechanically:
- field-by-field average of the old `Immutable Package Snapshot + Rendered Branches` row
- and the old `Source Snapshot` row
- field-by-field average of the old `OCI Chart Release Pair` row
- and the old `OCI Bundle Pointer` row
- then fresh weighted total calculations

## Best-Of Callouts

- **Best for KISS:** [Thin Build Lock](./thin-build-lock.md)
- **Best for reviewability:** [Rendered Branches from a Thin Lock](./rendered-branches.md)
- **Best for future Kustomize:** [Multi-Warehouse Base + Overlay](./multi-warehouse-base-overlay.md)
- **Best for Kargo Native:** [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)

## Weights

| Axis | Weight |
| --- | ---: |
| KISS / operational simplicity | 3.0 |
| Reviewability | 2.0 |
| Future Kustomize fit | 0.7 |
| Current Helm fit | 0.3 |
| Does it break/awkwardize skaffold or local-dev in any way? | 1.0 |
| Kargo-native fit | 1.0 |
| Migration complexity | 0.2 |
| Promotion clarity | 0.3 |
| Artifact integrity / immutability | 0.3 |
| Day-2 operability | 0.8 |

## Original Architect Weighted Rankings

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **39.6** |
| 2 | [Rendered Branches](./rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 4 | **39.1** |
| 3 | [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md) | 3.5 | 4.5 | 4.5 | 4 | 5 | 3 | 3 | 4.5 | 4.5 | 4 | **38.4** |
| 4 | [Thin Build Lock](./thin-build-lock.md) | 4 | 2 | 4 | 5 | 5 | 2 | 5 | 4 | 2 | 3 | **32.5** |
| 5 | [Pre-Rendered Release Bundle](./rendered-release-bundle.md) | 2 | 5 | 4 | 4 | 5 | 2 | 2 | 4 | 5 | 2 | **31.7** |
| 6 | [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./oci-package-pair-rendered-branches.md) | 2 | 4 | 2.5 | 4 | 5 | 2.5 | 2 | 3.5 | 5 | 2.5 | **29.4** |
| 7 | [Kustomize Split Overlays](./kustomize-split-overlays.md) | 3 | 3 | 5 | 1 | 3 | 3 | 2 | 3 | 3 | 3 | **29.4** |
| 8 | [Multi-Warehouse Base + Overlay](./multi-warehouse-base-overlay.md) | 1 | 4 | 5 | 1 | 4 | 5 | 1 | 2 | 5 | 3 | **28.5** |
| 9 | [Image Provenance + Rendered Branches](./image-provenance-rendered-branches.md) | 1 | 5 | 4 | 4 | 5 | 2 | 3 | 2 | 4 | 2 | **28.0** |
| 10 | [GitOps Truth with Generated Mirror](./gitops-truth-generated-mirror.md) | 1 | 4 | 4 | 3 | 1 | 2 | 1 | 2 | 3 | 1 | **20.2** |

## Top-Level Differences From Jesse's Table

- **Common-Case + Render** still leads this normalized table because the original architect continued to price repo-fit and explicitness highly, while the mechanical merge of the two snapshot rows softens that camp's edge.
- **Rendered Branches from a Thin Lock** remains very strong because it preserves the rendered-review surface while staying explicit, even though it still pays both the build-lock tax and the live-source tax.
- **Source Snapshot (Helm or Kustomize) + Rendered Branches** remains in the finalist tier, but the mechanical merge lands it at `#3` rather than `#1`.
- **Thin Build Lock** remains the best pure KISS fallback, but not the best overall answer.
- **OCI Package Pair (Helm or Kustomize) + Rendered Branches** becomes the single OCI-hosted alternative. Even after the cleanup merge, it still reads as a credible side-path, not a top-tier default.
- **Image Provenance + Render** stays low because it still hides too much release truth in image metadata while also requiring source reconstruction.

## What This Mechanical Merge Means

- This is a principled normalization, not a fresh original-architect rescoring pass.
- Both merged rows are conservative because they average predecessor rows that were scored under different framings.
- It should therefore be read as: "where the original architect's published table lands after a principled merge," not as a replacement for a truly fresh human rerank.
