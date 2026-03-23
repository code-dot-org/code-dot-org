# Advisor Rankings

This is a fresh advisor reranking of the live iteration 5 plan set after two
cleanup merges:

- [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./oci-package-pair-rendered-branches.md)

This pass is scored from scratch against the live merged plan set as it exists today.
It does not inherit predecessor scores mechanically, even though the merged
rows land in roughly the same score bands.

`Jesse Weighted` and `OG Weighted` for both merged rows are normalized
mechanically from predecessor rows:
- field-by-field average
- then fresh weighted recomputation

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
- **Best for reviewability:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- **Best for future Kustomize:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- **Best for Kargo Native:** [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)

## Leading Plans

These are the four live finalists.

### 1. [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
Best overall foundation. It freezes the real source package once, keeps release truth explicit, preserves the rendered review surface, and avoids promotion-time reconstruction from the giant live monorepo.

### 2. [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)
Best pure-Kargo answer. If Kargo-native elegance dominated all other concerns, this would still be the winner.

### 3. [Rendered Branches from a Thin Lock](./rendered-branches.md)
Best explicit control variant. It keeps the review surface strong, but it still pays both the synthetic build-lock tax and the live-source read tax.

### 4. [Thin Build Lock](./thin-build-lock.md)
Best boring fallback. It remains the cleanest minimum-viable control plan, but it gives up too much rendered reviewability to be the main long-lived answer.

## Fresh Ranking

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Jesse Weighted | OG Weighted | Advisor Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md) | 4 | 5 | 5 | 5 | 5 | 3 | 3 | 5 | 5 | 5 | **40.9** | **38.4** | **42.6** |
| 2 | [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **39.6** | **39.6** | **39.6** |
| 3 | [Rendered Branches from a Thin Lock](./rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 4 | **39.1** | **39.1** | **39.1** |
| 4 | [Thin Build Lock](./thin-build-lock.md) | 5 | 2 | 4 | 5 | 5 | 2 | 5 | 4 | 2 | 4 | **36.3** | **32.5** | **36.3** |
| 5 | [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./oci-package-pair-rendered-branches.md) | 2.5 | 4 | 4 | 4 | 5 | 2.5 | 2 | 3.5 | 5 | 3 | **31.3** | **29.4** | **32.4** |
| 6 | [Pre-Rendered Release Bundle](./rendered-release-bundle.md) | 2 | 5 | 4 | 4 | 5 | 2 | 2 | 5 | 5 | 2 | **32.0** | **31.7** | **32.0** |
| 7 | [Image Provenance + Rendered Branches](./image-provenance-rendered-branches.md) | 2 | 5 | 4 | 4 | 5 | 2 | 3 | 2 | 4 | 2 | **31.8** | **28.0** | **31.0** |
| 8 | [Kustomize Split Overlays](./kustomize-split-overlays.md) | 3 | 3 | 5 | 1 | 3 | 3 | 2 | 3 | 3 | 3 | **29.4** | **29.4** | **29.4** |
| 9 | [Multi-Warehouse Base + Overlay](./multi-warehouse-base-overlay.md) | 1 | 4 | 5 | 1 | 4 | 5 | 1 | 2 | 5 | 3 | **27.7** | **28.5** | **28.5** |
| 10 | [GitOps Truth with Generated Mirror](./gitops-truth-generated-mirror.md) | 1 | 4 | 4 | 3 | 1 | 2 | 1 | 2 | 3 | 1 | **20.2** | **20.2** | **20.2** |

## Why This Balance

- The merged source-snapshot/rendered-branches plan wins because it now says the simplest honest thing: freeze the real source package once, render from it, and stop rereading the giant monorepo during promotion.
- That merged winner is clearer than the old split between “immutable package snapshot” and “source snapshot.” In the actual Helm-today usage, those were functionally the same architecture with different framing.
- `Common-Case + Render` stays near the top because it is still the cleanest Kargo-native shape and the best reference design for how Kargo wants to be used.
- `Rendered Branches` remains the best explicit control variant, but now more clearly reads as the control/fallback branch of the family, not the main long-lived answer.
- `Thin Build Lock` moves into the finalist set because the duplicate snapshot slot is gone. It remains the best phase-1 control plan, but not the best foundation.
- `OCI Package Pair (Helm or Kustomize) + Rendered Branches` becomes the single coherent OCI-hosted package alternative. It is the best non-finalist OCI idea, but still too exotic to displace the top 4.
- `Pre-Rendered Release Bundle` remains respectable, but still freezes environment rendering too early to be a default.
- `Image Provenance + Render` remains intentionally pushed down. It is still a good research spur, but too magical for the main recommendation set.

## Bottom Line

- **Best foundation for this repo:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- **Best pure-Kargo reference design:** [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)
- **Best control fallback:** [Thin Build Lock](./thin-build-lock.md)
