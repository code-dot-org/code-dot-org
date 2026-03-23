# Plan Rankings

This file is normalized from Jesse's latest iteration 5 ranking after two
cleanup merges:

- [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./oci-package-pair-rendered-branches.md)

Because Jesse was unavailable for a fresh rescoring pass, both merged rows are
derived mechanically:
- field-by-field average of the old `Immutable Package Snapshot + Rendered Branches` row
- and the old `Source Snapshot` row
- field-by-field average of the old `OCI Chart Release Pair` row
- and the old `OCI Bundle Pointer` row
- then fresh weighted total calculations

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

## Best-Of Callouts

- **Best for KISS:** [Thin Build Lock](./thin-build-lock.md)
- **Best for reviewability:** [Rendered Branches from a Thin Lock](./rendered-branches.md)
- **Best for future Kustomize:** [Multi-Warehouse Base + Overlay](./multi-warehouse-base-overlay.md)
- **Best for Kargo Native:** [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)

## Iteration 5 Ranking

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md) | 4 | 4.5 | 4.5 | 4.5 | 5 | 3.5 | 3 | 4.5 | 4.5 | 4.5 | **40.9** |
| 2 | [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **39.6** |
| 3 | [Rendered Branches](./rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 4 | **39.1** |
| 4 | [Thin Build Lock](./thin-build-lock.md) | 5 | 2 | 4 | 5 | 5 | 2 | 5 | 4 | 2 | 4 | **36.3** |
| 5 | [Pre-Rendered Release Bundle](./rendered-release-bundle.md) | 2 | 5 | 4 | 4 | 5 | 2 | 2 | 5 | 5 | 2 | **32.0** |
| 6 | [Image Provenance + Rendered Branches](./image-provenance-rendered-branches.md) | 2 | 5 | 4 | 4 | 5 | 2 | 3 | 2 | 4 | 3 | **31.8** |
| 7 | [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./oci-package-pair-rendered-branches.md) | 2.5 | 4 | 2.5 | 4 | 5 | 2.5 | 2 | 3.5 | 5 | 3 | **31.3** |
| 8 | [Kustomize Split Overlays](./kustomize-split-overlays.md) | 3 | 3 | 5 | 1 | 3 | 3 | 2 | 3 | 3 | 3 | **29.4** |
| 9 | [Multi-Warehouse Base + Overlay](./multi-warehouse-base-overlay.md) | 1 | 4 | 5 | 1 | 4 | 5 | 1 | 2 | 5 | 2 | **27.7** |
| 10 | [GitOps Truth with Generated Mirror](./gitops-truth-generated-mirror.md) | 1 | 4 | 4 | 3 | 1 | 2 | 1 | 2 | 3 | 1 | **20.2** |

## What Changed In This Normalized View

- The old `Immutable Package Snapshot + Rendered Branches` and old `Source Snapshot` rows are replaced by one merged source-snapshot/rendered-branches row.
- The old `OCI Chart Release Pair` and old `OCI Bundle Pointer` rows are replaced by one merged OCI-package-pair/rendered-branches row.
- Those merged rows are mechanical averages, not fresh Jesse rescoring passes.
- Even under that conservative merge rule, the merged source-snapshot plan lands at `#1`.
- `Common-Case + Render` remains the best pure-Kargo reference design.
- `Rendered Branches` remains the strongest explicit control variant.

## Top-Level Comparison Notes

- **Source Snapshot (Helm or Kustomize) + Rendered Branches** wins this normalized table because it inherits the strongest parts of both predecessor rows: frozen source input, rendered review surface, and no promotion-time reread of the giant monorepo.
- **Common-Case Freight + Rendered Branches** remains the best pure-Kargo shape, but it still pays the live-source-read and image+git-pairing costs.
- **Rendered Branches from a Thin Lock** remains excellent, but it is now more clearly a control/compatibility variant than the long-lived winner.
- **Thin Build Lock** remains the best boring fallback, but not the best foundation.
- **OCI Package Pair (Helm or Kustomize) + Rendered Branches** is now the single coherent OCI-hosted package alternative. It stays mid-pack because it improves the old split pair's clarity, but still pays the exotic-artifact tax.

## Gaps To Explore Next

- Whether storing the source snapshot in OCI rather than Git would preserve the merged winner's strengths while reducing Git churn.
- Whether a tiny package-mirror repo or dedicated release-stream repo could beat the merged winner without adding more long-term repo ownership pain.
