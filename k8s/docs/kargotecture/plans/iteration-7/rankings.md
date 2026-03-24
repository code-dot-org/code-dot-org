# Iteration 7 Rankings

This is a fresh ranking of the five iteration 7 finalists.

This pass is intentionally anchored to:
- long-term operational simplicity
- a clear, understandable system
- a real rendered diff review before production
- the iteration 5 three-expert signal as continuity context, not as a veto

The key interpretation rule for this iteration is:

- if two plans can both give us the final rendered review gate we want, prefer
  the one that leaves behind the simpler 10-year operating model

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

## Best for

- Best for KISS:
  [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)
- Best for reviewability:
  [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- Best for future Kustomize:
  [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
- Best for Kargo Native:
  [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)

## Plan list

1. [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md)
2. [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md)
3. [Rendered Branches from a Thin Lock](./rendered-branches.md)
4. [Argo Refs code-dot-org Commit](./argo-refs-code-dot-org-commit.md)
5. [OCI Release Capsule](./oci-release-capsule.md)

## Iteration 5 expert continuity

Iteration 5 already produced an unusually strong consensus cluster:

- Jesse normalized ranking:
  `Source Snapshot + Render` `#1`, `Common-Case + Render` `#2`,
  `Rendered Branches` `#3`
- Original architect normalized ranking:
  `Common-Case + Render` `#1`, `Rendered Branches` `#2`,
  `Source Snapshot + Render` `#3`
- Advisor rerank:
  `Source Snapshot + Render` `#1`, `Common-Case + Render` `#2`,
  `Rendered Branches` `#3`

That means the real unresolved choice was never "which family wins?"

It was:
- `Common-Case` vs `Source Snapshot` for the best long-lived foundation
- with `Rendered Branches from a Thin Lock` as the strongest explicit-control
  variant

Iteration 7 keeps that same top-three cluster.
The main change is that this pass breaks the tie in favor of
`Common-Case Freight + Rendered Branches` because it preserves the mandatory
rendered review gate while deleting more synthetic release machinery than the
snapshot family.

## Why the top few landed where they did

- `Common-Case Freight + Rendered Branches` won because it keeps the rendered
  diff gate before production, uses the real release artifacts instead of a
  synthetic lock or snapshot archive, and leaves behind the cleanest long-lived
  operating model.
- `Source Snapshot (Helm or Kustomize) + Rendered Branches` landed a very close
  second because it gives the cleanest frozen-input review story and the
  clearest explicit release payload, but it permanently carries a package-copy
  system inside GitOps.
- `Rendered Branches from a Thin Lock` stayed in the finalist tier because the
  review surface is still excellent, but the tiny lock record becomes permanent
  system furniture without beating the winner on simplicity.
- `Argo Refs code-dot-org Commit` fell behind the rendered-branch leaders
  because it gives up the thing we explicitly want most: final review of the
  rendered Helm/Kustomize output before production.
- `OCI Release Capsule` remained the strongest immutable-artifact alternative,
  but it still adds more release-system machinery than the simpler rendered-Git
  winners.

## What changed since the prior iteration

- This pass does not treat the current repo layout as the ranking anchor.
  Current repos were used as feasibility context only.
- The ranking is re-centered on the 10-year operating model:
  simpler, clearer, more elegant, and still able to produce a true final diff
  review before production.
- That shift moves the source-driven `Argo Refs` family down, because it does
  not make rendered review first-class.
- It also moves `Common-Case + Render` slightly ahead of
  `Source Snapshot + Render`: once both satisfy reviewability, removing
  synthetic release artifacts matters more.

## Weighted rankings

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Common-Case Freight + Rendered Branches](./common-case-rendered-branches.md) | 4 | 5 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **42.6** |
| 2 | [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md) | 4 | 5 | 5 | 4 | 5 | 3 | 3 | 5 | 5 | 4 | **41.5** |
| 3 | [Rendered Branches from a Thin Lock](./rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 4 | **39.1** |
| 4 | [Argo Refs code-dot-org Commit](./argo-refs-code-dot-org-commit.md) | 4 | 2 | 4 | 4 | 5 | 3 | 4 | 3 | 3 | 4 | **33.8** |
| 5 | [OCI Release Capsule](./oci-release-capsule.md) | 2 | 4 | 4 | 3 | 5 | 3 | 2 | 4 | 5 | 3 | **31.2** |
