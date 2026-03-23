# Kargo Systems Plans

This report summarizes the final live iteration 5 plan set after two cleanup
merges:

- [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md)
- [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/oci-package-pair-rendered-branches.md)

The detailed plans live in:
- [`k8s/docs/kargo-architecture/plans/iteration-5/`](./plans/iteration-5/)

The ranking files live in:
- [Jesse normalized ranking](./plans/iteration-5/rankings.md)
- [OG normalized ranking](./plans/iteration-5/rankings-original-architect.md)
- [Advisor synthesis](./plans/iteration-5/rankings-advisor.md)

## Best-Of Callouts

- **Best for KISS:** [Thin Build Lock](./plans/iteration-5/thin-build-lock.md)
- **Best for reviewability:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md)
- **Best for future Kustomize:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md)
- **Best for Kargo Native:** [Common-Case Freight + Rendered Branches](./plans/iteration-5/common-case-rendered-branches.md)

## Recommendation Frame

- **Best foundation for this repo:** [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md)
- **Best pure-Kargo reference design:** [Common-Case Freight + Rendered Branches](./plans/iteration-5/common-case-rendered-branches.md)
- **Best explicit control variant:** [Rendered Branches from a Thin Lock](./plans/iteration-5/rendered-branches.md)
- **Best boring fallback/control plan:** [Thin Build Lock](./plans/iteration-5/thin-build-lock.md)

Interpretation:
- If you want the best multi-year answer for this repo, choose **Source Snapshot + Render**.
- If you want the cleanest pure-Kargo design to compare everything else against, choose **Common-Case + Render**.
- If you want the strongest explicit review/control variant, keep **Rendered Branches** in view.
- If you want the safest low-magic fallback, keep **Thin Build Lock** in reserve.

## Ranked Ideas

This ranked list follows the advisor synthesis ordering.

For the two merged plans, `Kargo Weighted` and `AppDev Weighted` are
mechanically normalized from Jesse's and OG's predecessor rows:
- field-by-field average
- then fresh weighted recomputation

### 1. [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md)
`Kargo Weighted: **40.9**`

Freeze the real source package once per release, keep env policy in GitOps, and render stage-specific output from that frozen snapshot into rendered branches. This is the cleanest long-lived foundation for `code-dot-org` after removing the false distinction between the old snapshot variants.

### 2. [Common-Case Freight + Rendered Branches](./plans/iteration-5/common-case-rendered-branches.md)
`Kargo Weighted: **39.6**`

Let Kargo assemble one Freight from the real image and the real monorepo commit, then render stage branches from sparse checkouts. This remains the best pure-Kargo design and the best reference shape for Kargo-native elegance.

### 3. [Rendered Branches from a Thin Lock](./plans/iteration-5/rendered-branches.md)
`Kargo Weighted: **39.1**`

Keep a thin release record, but render real stage output into reviewable branches. This is still the strongest explicit control design, even though it pays both the synthetic-lock tax and the live-source tax.

### 4. [Thin Build Lock](./plans/iteration-5/thin-build-lock.md)
`Kargo Weighted: **36.3**`

The best boring fallback. It is simple, explicit, and migration-friendly, but it gives up too much rendered reviewability to be the main long-term answer.

### 5. [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/oci-package-pair-rendered-branches.md)
`Kargo Weighted: **31.3**`

Publish the app container image and the deploy package as separate OCI artifacts, pair them in a small Git release record, and render after `oci-download`. This is the most coherent OCI-hosted alternative, but it is still more artifact-heavy and more exotic than the Git-snapshot winner.

### 6. [Pre-Rendered Release Bundle](./plans/iteration-5/rendered-release-bundle.md)
`Kargo Weighted: **32.0**`

Excellent reviewability and immutability, but it freezes environment rendering too early and makes env-side change handling too rigid.

### 7. [Image Provenance + Rendered Branches](./plans/iteration-5/image-provenance-rendered-branches.md)
`Kargo Weighted: **31.8**`

Interesting frontier idea. It is clever and Kargo-light, but too magical to be the default foundation for this repo.

### 8. [Kustomize Split Overlays](./plans/iteration-5/kustomize-split-overlays.md)
`Kargo Weighted: **29.4**`

Reasonable if the team fully commits to a Kustomize split, but weaker reviewability and lower clarity keep it out of the finalist set.

### 9. [Multi-Warehouse Base + Overlay](./plans/iteration-5/multi-warehouse-base-overlay.md)
`Kargo Weighted: **27.7**`

Strong ambitious-Kustomize idea, but it pays too much second-system and cognitive complexity for phase-1 foundation work.

### 10. [GitOps Truth with Generated Mirror](./plans/iteration-5/gitops-truth-generated-mirror.md)
`Kargo Weighted: **20.2**`

The most radical ownership flip in the set. It creates too much local-dev and process risk to be a sensible default.

## Top 6 Freight Shapes

This section is the simple version: what Kargo is really promoting in the top 6 plans, and how those plans differ.

### 1. [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md)
This plan saves a frozen copy of the real source package for every release, then promotes that frozen source snapshot. The important difference is that promotion does not need to go back to the giant live monorepo later; Kargo renders each stage from the saved snapshot.

```text
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
  chart/        # Helm
  # or:
  base/         # Kustomize
  components/
```

```yaml
releaseId: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  digest: sha256:...
packaging:
  kind: helm-or-kustomize
  packagePath: chart-or-base
```

### 2. [Common-Case Freight + Rendered Branches](./plans/iteration-5/common-case-rendered-branches.md)
This plan does not write a release record into `warehouses/codeai/` at all. Kargo watches the real image and the real `code-dot-org` branch directly, pairs them into one Freight, then renders stage output from that pair. It is the most Kargo-native option, but it still reads live source during promotion.

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
        allowTagsRegexes:
          - ^git-[0-9a-f]{40}$
    - git:
        repoURL: https://github.com/code-dot-org/code-dot-org.git
        branch: staging
  freightCreationCriteria:
    expression: |
      imageTag == 'git-' + gitCommit
```

### 3. [Rendered Branches from a Thin Lock](./plans/iteration-5/rendered-branches.md)
This plan writes only a tiny release note into GitOps, then Kargo uses that note to fetch source and render the real manifests. Compared to `Common-Case`, it is less native but more explicit. Compared to `Source Snapshot + Render`, it saves less up front and does more work later.

```text
warehouses/codeai/builds/
  git-<full-commit-sha>.yaml
```

```yaml
releaseId: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  digest: sha256:...
packaging:
  kind: helm-or-kustomize
  sourcePath: k8s/helm
```

### 4. [Thin Build Lock](./plans/iteration-5/thin-build-lock.md)
This is the simplest option. Freight is only a tiny lock file that says “deploy commit X with image Y.” Kargo promotes by changing refs in GitOps, and Argo later pulls source from `code-dot-org`. The tradeoff is that humans mostly review pointer changes, not final rendered output.

```text
warehouses/codeai/builds/
  git-<full-commit-sha>.yaml
```

```yaml
releaseId: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  digest: sha256:...
packaging:
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/helm
```

### 5. [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/oci-package-pair-rendered-branches.md)
This plan keeps only a small Git release record in `warehouses/codeai/`, but stores the real deploy package in OCI. Kargo reads the record, downloads the exact package artifact, and renders from that. The key difference is that it preserves the rendered-branches review model while moving the package itself out of Git.

```text
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
```

```yaml
releaseId: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  digest: sha256:...
package:
  ref: ghcr.io/code-dot-org/codeai-packages@sha256:...
  digest: sha256:...
  kind: helm-chart # or generic-bundle
  format: helm-chart-tgz # or kustomize-tar
```

### 6. [Pre-Rendered Release Bundle](./plans/iteration-5/rendered-release-bundle.md)
This plan renders everything once in CI, publishes those rendered outputs into the release artifact, and then lets Kargo promote copies of the finished outputs. It is the strongest “review the exact deployable thing” idea, but it hard-freezes environment rendering too early.

```text
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
  rendered/
    staging/
    test/
    levelbuilder/
    production/
```

```yaml
releaseId: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  digest: sha256:...
render:
  tool: helm-template-or-kustomize-build
```

## Cross-Cutting Add-Ons

### PR-based `review-infra-changes`
For any rendered-output plan, make `review-infra-changes` open a PR from a generated branch instead of writing straight to `main`.

### Image digest recording
Even when human-readable tags remain in comments or docs, store the image digest in the release record. This is the low-magic provenance baseline.

### GHCR-packaged snapshot variation
If Git storage churn later becomes painful, the strongest refinement path is to keep the same snapshot architecture but store the frozen package in OCI instead of Git.

### Kustomize refactor direction
If Kustomize becomes the durable packaging model, the long-lived shared tree should become:

```text
code-dot-org/k8s/kustomize/
  base/
  components/
  local/
    overlays/
```

with long-lived deploy overlays in `k8s-gitops`.

## Detailed Plans and Rankings

- Jesse normalized ranking: [`k8s/docs/kargo-architecture/plans/iteration-5/rankings.md`](./plans/iteration-5/rankings.md)
- OG normalized ranking: [`k8s/docs/kargo-architecture/plans/iteration-5/rankings-original-architect.md`](./plans/iteration-5/rankings-original-architect.md)
- Advisor synthesis: [`k8s/docs/kargo-architecture/plans/iteration-5/rankings-advisor.md`](./plans/iteration-5/rankings-advisor.md)
- Merged winner plan: [`k8s/docs/kargo-architecture/plans/iteration-5/source-snapshot-rendered-branches.md`](./plans/iteration-5/source-snapshot-rendered-branches.md)
- Merged OCI alternative: [`k8s/docs/kargo-architecture/plans/iteration-5/oci-package-pair-rendered-branches.md`](./plans/iteration-5/oci-package-pair-rendered-branches.md)
- Latest detailed plans: [`k8s/docs/kargo-architecture/plans/iteration-5/`](./plans/iteration-5/)

## Weighted Rankings Table

This table uses the advisor category scores for the per-axis columns.

For the merged plans:
- `Kargo Weighted` and `AppDev Weighted` are mechanical normalized values from predecessor rows
- `Advisor Weighted` is the fresh from-scratch advisor score on the current live plan row as it exists now

`Average Weighted` is the arithmetic mean of `Kargo Weighted`, `AppDev Weighted`, and `Advisor Weighted`, calculated in Python.

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Kargo Weighted | AppDev Weighted | Advisor Weighted | Average Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md) | 4 | 5 | 5 | 5 | 5 | 3 | 3 | 5 | 5 | 5 | **40.9** | **38.4** | **42.6** | **40.6** |
| 2 | [Common-Case Freight + Rendered Branches](./plans/iteration-5/common-case-rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 4 | **39.6** | **39.6** | **39.6** | **39.6** |
| 3 | [Rendered Branches from a Thin Lock](./plans/iteration-5/rendered-branches.md) | 3 | 5 | 5 | 4 | 5 | 4 | 4 | 5 | 3 | 4 | **39.1** | **39.1** | **39.1** | **39.1** |
| 4 | [Thin Build Lock](./plans/iteration-5/thin-build-lock.md) | 5 | 2 | 4 | 5 | 5 | 2 | 5 | 4 | 2 | 4 | **36.3** | **32.5** | **36.3** | **35.0** |
| 5 | [OCI Package Pair (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/oci-package-pair-rendered-branches.md) | 2.5 | 4 | 4 | 4 | 5 | 2.5 | 2 | 3.5 | 5 | 3 | **31.3** | **29.4** | **32.4** | **31.0** |
| 6 | [Pre-Rendered Release Bundle](./plans/iteration-5/rendered-release-bundle.md) | 2 | 5 | 4 | 4 | 5 | 2 | 2 | 5 | 5 | 2 | **32.0** | **31.7** | **32.0** | **31.9** |
| 7 | [Image Provenance + Rendered Branches](./plans/iteration-5/image-provenance-rendered-branches.md) | 2 | 5 | 4 | 4 | 5 | 2 | 3 | 2 | 4 | 2 | **31.8** | **28.0** | **31.0** | **30.3** |
| 8 | [Kustomize Split Overlays](./plans/iteration-5/kustomize-split-overlays.md) | 3 | 3 | 5 | 1 | 3 | 3 | 2 | 3 | 3 | 3 | **29.4** | **29.4** | **29.4** | **29.4** |
| 9 | [Multi-Warehouse Base + Overlay](./plans/iteration-5/multi-warehouse-base-overlay.md) | 1 | 4 | 5 | 1 | 4 | 5 | 1 | 2 | 5 | 3 | **27.7** | **28.5** | **28.5** | **28.2** |
| 10 | [GitOps Truth with Generated Mirror](./plans/iteration-5/gitops-truth-generated-mirror.md) | 1 | 4 | 4 | 3 | 1 | 2 | 1 | 2 | 3 | 1 | **20.2** | **20.2** | **20.2** | **20.2** |
