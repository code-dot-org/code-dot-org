# Kargo Systems Plans

This report summarizes the final live iteration 7 finalist set:

- [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71562) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71567))
- [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71566) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71570))
- [Rendered Branches from a Thin Lock](./plans/iteration-7/rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71565) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71568))
- [Argo Refs code-dot-org Commit](./plans/iteration-7/argo-refs-code-dot-org-commit.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71561) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71564))
- [OCI Release Capsule](./plans/iteration-7/oci-release-capsule.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71563) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71569))

The detailed plans live in:
- [`k8s/docs/kargo-architecture/plans/iteration-7/`](./plans/iteration-7/)

The ranking file lives in:
- [Iteration 7 rankings](./plans/iteration-7/rankings.md)

This report intentionally mirrors the synthesis style of
[report-iteration-5.md](./report-iteration-5.md).

## Best-Of Callouts

- **Best for KISS:** [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71562) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71567))
- **Best for reviewability:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71566) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71570))
- **Best for future Kustomize:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71566) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71570))
- **Best for Kargo Native:** [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71562) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71567))

## Recommendation Frame

- **Best foundation for the 10-year system:** [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71562) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71567))
- **Best frozen-input foundation:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71566) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71570))
- **Best explicit control variant:** [Rendered Branches from a Thin Lock](./plans/iteration-7/rendered-branches.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71565) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71568))
- **Best source-driven fallback:** [Argo Refs code-dot-org Commit](./plans/iteration-7/argo-refs-code-dot-org-commit.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71561) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71564))
- **Best immutable artifact-forward alternative:** [OCI Release Capsule](./plans/iteration-7/oci-release-capsule.md) ([Helm](https://github.com/code-dot-org/code-dot-org/pull/71563) | [Kustomize](https://github.com/code-dot-org/code-dot-org/pull/71569))

Interpretation:
- If you want the simplest elegant long-lived system that still gives a true
  final rendered diff review before production, choose
  **Common-Case Freight + Rendered Branches**.
- If you want the clearest frozen-input release object and are willing to keep a
  package snapshot/archive system in Git, choose
  **Source Snapshot + Rendered Branches**.
- If you want the strongest explicit-control version of the rendered-review
  family, keep **Rendered Branches from a Thin Lock** in view.
- If you want the simplest source-driven path and are willing to give up the
  rendered final review surface, **Argo Refs code-dot-org Commit** is the
  fallback, not the main answer.

## Iteration 5 Expert Continuity

Iteration 5 is still highly relevant because three separate scoring voices all
converged on the same top cluster:

- Jesse normalized ranking:
  `Source Snapshot + Render` `#1`,
  `Common-Case + Render` `#2`,
  `Rendered Branches` `#3`
- Original architect normalized ranking:
  `Common-Case + Render` `#1`,
  `Rendered Branches` `#2`,
  `Source Snapshot + Render` `#3`
- Advisor rerank:
  `Source Snapshot + Render` `#1`,
  `Common-Case + Render` `#2`,
  `Rendered Branches` `#3`

So the important fact is not that iteration 7 found a totally new winner.
It did not.

The important fact is that iteration 7 keeps the same consensus top family and
then breaks the `Common-Case` vs `Source Snapshot` tie using a simpler rule:

- both satisfy the mandatory rendered diff review requirement
- `Common-Case` leaves behind less synthetic release machinery

That is why this report puts `Common-Case Freight + Rendered Branches` first,
while still keeping `Source Snapshot + Rendered Branches` extremely close.

## Ranked Ideas

### 1. [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md)
`Iteration 7 Weighted: **42.6**`

Let Kargo assemble one Freight from the real image and the real source commit,
then render stage-specific output into long-lived stage branches. This is the
cleanest long-lived answer because it keeps the rendered review gate we want
while removing both the synthetic build-lock layer and the package snapshot
archive layer.

### 2. [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md)
`Iteration 7 Weighted: **41.5**`

Freeze the deploy package once per release, then render every stage from that
frozen snapshot into rendered branches. This remains the strongest explicit
release-payload design and the cleanest frozen-input review model, but it keeps
more system furniture than the winner.

### 3. [Rendered Branches from a Thin Lock](./plans/iteration-7/rendered-branches.md)
`Iteration 7 Weighted: **39.1**`

Keep a tiny build-lock record, but make every promotion render real
stage-specific output into stage branches. This is still the strongest
explicit-control variant, but the build-lock stays as permanent machinery
without buying enough extra simplicity over `Common-Case`.

### 4. [Argo Refs code-dot-org Commit](./plans/iteration-7/argo-refs-code-dot-org-commit.md)
`Iteration 7 Weighted: **33.8**`

Write one tiny release record and let Argo deploy source pinned to the promoted
commit. This is attractive on pure source-driven simplicity, but it gives up
the final rendered review surface that the higher-ranked plans preserve.

### 5. [OCI Release Capsule](./plans/iteration-7/oci-release-capsule.md)
`Iteration 7 Weighted: **31.2**`

Make one immutable OCI artifact the center of release truth, then render from
that artifact. This is the strongest artifact-integrity story in the set, but
it is still more exotic and more operationally heavy than the simpler rendered
Git winners.

## Top 5 Freight Shapes

This is the simple version: what Kargo is really promoting in the five
finalists, and how those shapes differ.

### 1. [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md)
This plan does not write a release record into `warehouses/codeai/` at all.
Kargo watches the real image and the real `code-dot-org` branch, pairs them
into one Freight, and renders stage output from that pair.

```text
warehouses/codeai/
  (unused)
```

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
spec:
  subscriptions:
    - image:
        repoURL: ghcr.io/code-dot-org/code-dot-org
    - git:
        repoURL: https://github.com/code-dot-org/code-dot-org.git
        branch: staging
  freightCreationCriteria:
    expression: imageTag == 'git-' + gitCommit
```

### 2. [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md)
This plan saves a frozen copy of the deploy package for every release, then
promotes that frozen source snapshot into rendered stage branches.

```text
warehouses/codeai/freight/git-<full-commit-sha>/
  freight.yaml
  helm/
  # or:
  kustomize/
warehouses/codeai/freight/current/
  freight.yaml
  helm/
  # or:
  kustomize/
```

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packageType: helm # or kustomize
```

### 3. [Rendered Branches from a Thin Lock](./plans/iteration-7/rendered-branches.md)
This plan writes only a tiny release note into GitOps, then Kargo uses that
note to fetch source and render the real manifests.

```text
warehouses/codeai/builds/
  current.yaml
  git-<full-commit-sha>.yaml
```

```yaml
releaseId: git-<full-commit-sha>
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packaging:
  kind: helm # or kustomize
  sourcePath: k8s/helm # or k8s/kustomize
```

### 4. [Argo Refs code-dot-org Commit](./plans/iteration-7/argo-refs-code-dot-org-commit.md)
This is the smallest release record in the finalist set. Kargo promotes only a
thin Git lock, and Argo later deploys source-oriented truth pinned to that
commit.

```text
warehouses/codeai/builds/
  current.yaml
  git-<full-commit-sha>.yaml
```

```yaml
releaseId: git-<full-commit-sha>
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packaging:
  kind: helm # or kustomize
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
```

### 5. [OCI Release Capsule](./plans/iteration-7/oci-release-capsule.md)
This plan promotes the app image and a matching OCI release capsule. The
capsule carries the deploy package plus release metadata.

```text
registry:
  ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  ghcr.io/code-dot-org/codeai-release-capsule:git-<full-commit-sha>
```

```yaml
gitCommit: <full-commit-sha>
image:
  repoURL: ghcr.io/code-dot-org/code-dot-org
  tag: git-<full-commit-sha>
  digest: sha256:...
package:
  kind: helm # or kustomize
  path: package/helm # or package/kustomize
```

## Cross-Cutting Add-Ons

### PR-based `review-infra-changes`
For any rendered-output plan, keep `review-infra-changes` as a PR gate against
the production rendered branch. That is the most honest form of final infra
review in this whole doc set.

### Image digest recording
Even when a plan stays Git-centric, keep the image digest in the promoted
record. This is the minimum viable integrity baseline.

### OCI as later hardening, not phase-1 architecture
If the eventual winner later needs stronger immutable payload handling, OCI
looks better as a phase-2 refinement than as the first architecture move.

### Kustomize refactor direction
If Kustomize becomes the durable packaging model, the shared long-lived app
package should continue to converge toward:

```text
code-dot-org/k8s/kustomize/
  base/
  components/
  local/
    overlays/
```

with environment policy and deploy wrappers living in `k8s-gitops`.

## Detailed Plans and Rankings

- Iteration 7 rankings:
  [`k8s/docs/kargo-architecture/plans/iteration-7/rankings.md`](./plans/iteration-7/rankings.md)
- Iteration 7 notes:
  [`k8s/docs/kargo-architecture/plans/iteration-7/NOTES.md`](./plans/iteration-7/NOTES.md)
- Finalist plans:
  [`k8s/docs/kargo-architecture/plans/iteration-7/`](./plans/iteration-7/)

## Weighted Rankings Table

| Rank | Plan | Helm PR | Kustomize PR | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Common-Case Freight + Rendered Branches](./plans/iteration-7/common-case-rendered-branches.md) | [PR #71562](https://github.com/code-dot-org/code-dot-org/pull/71562) | [PR #71567](https://github.com/code-dot-org/code-dot-org/pull/71567) | 4 | 5 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **42.6** |
| 2 | [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-7/source-snapshot-rendered-branches.md) | [PR #71566](https://github.com/code-dot-org/code-dot-org/pull/71566) | [PR #71570](https://github.com/code-dot-org/code-dot-org/pull/71570) | 4 | 5 | 5 | 4 | 5 | 3 | 3 | 5 | 5 | 4 | **41.5** |
| 3 | [Rendered Branches from a Thin Lock](./plans/iteration-7/rendered-branches.md) | [PR #71565](https://github.com/code-dot-org/code-dot-org/pull/71565) | [PR #71568](https://github.com/code-dot-org/code-dot-org/pull/71568) | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 4 | **39.1** |
| 4 | [Argo Refs code-dot-org Commit](./plans/iteration-7/argo-refs-code-dot-org-commit.md) | [PR #71561](https://github.com/code-dot-org/code-dot-org/pull/71561) | [PR #71564](https://github.com/code-dot-org/code-dot-org/pull/71564) | 4 | 2 | 4 | 4 | 5 | 3 | 4 | 3 | 3 | 4 | **33.8** |
| 5 | [OCI Release Capsule](./plans/iteration-7/oci-release-capsule.md) | [PR #71563](https://github.com/code-dot-org/code-dot-org/pull/71563) | [PR #71569](https://github.com/code-dot-org/code-dot-org/pull/71569) | 2 | 4 | 4 | 3 | 5 | 3 | 2 | 4 | 5 | 3 | **31.2** |
