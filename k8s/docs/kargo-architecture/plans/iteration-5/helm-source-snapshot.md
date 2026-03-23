# Helm Source Snapshot

This plan has been merged conceptually with [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md), which is now the cleaner snapshot-family reference plan. This file remains as the Helm-specific predecessor.

**Short name:** Chart snapshot

**Catchy description:** Snapshot the exact Helm chart source that matches `$gitcommit`, publish it into the warehouse, and let Kargo promote an immutable chart snapshot instead of pointing Argo back at the source repo.

- **Type:** Helm plan
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Usually yes

## Warehouse artifact
On each build:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
        chart/
          Chart.yaml
          values.yaml
          templates/...
```

Recommended `release.yaml`:

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <gitcommit>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
chartPath: chart
chartTreeHash: sha256:...
```

The snapshot should be copied from `code-dot-org/k8s/helm` at `$gitcommit`.

## Freight
Freight is **Git-only** on `warehouses/codeai/releases/`.

The chart snapshot and the image metadata are stored together in one Git release bundle.

## Kargo project
Promotion should render, not mutate source.

Pattern:
1. Clone `k8s-gitops` freight commit.
2. Read `release.yaml`.
3. Use `helm-template` against `warehouses/codeai/releases/git-<full-commit-sha>/chart/`.
4. Supply env values from `apps/codeai/envTypes/` and `apps/codeai/deployments/<env>/values.yaml`.
5. Commit rendered output to the stage path/branch.
6. In `review-infra-changes`, open a PR for production output.

## Stage-by-stage promotion flow
- `staging`: render from chart snapshot + staging values
- `test`: render from the same chart snapshot + test values, then run tests
- `levelbuilder`: render from the same chart snapshot + levelbuilder values
- `review-infra-changes`: render production manifests to a PR branch
- `production`: merge reviewed render

## Helm / Kustomize structure
This plan keeps Helm first-class.

### `code-dot-org`
No structural change is required for v1:

```text
k8s/helm/
  Chart.yaml
  values.yaml
  staging.values.yaml
  test.values.yaml
  levelbuilder.values.yaml
  production.values.yaml
```

### `k8s-gitops`
Keep env values under:

```text
apps/codeai/envTypes/
apps/codeai/deployments/<env>/values.yaml
```

Add:

```text
apps/codeai/rendered/<stage>/
warehouses/codeai/releases/git-<full-commit-sha>/chart/
```

## Does it break/awkwardize skaffold or local-dev in any way?
No. Skaffold still uses the source chart in `code-dot-org/k8s/helm`. The warehouse snapshot is a CI/promotion artifact.

## Pros
- immutable chart input
- clean promotion story without teaching Kargo to fetch source repo packaging live
- easy to compare chart-source diffs between releases
- good bridge from current Helm to a more artifact-based model

## Cons
- Helm-only
- duplicates chart content into `k8s-gitops`
- still needs rendered-output infra if you want good reviewability

## Migration notes
- This is a strong intermediate architecture if CodeAI stays Helm for a while.
- If later moving to Kustomize, this plan becomes a migration stepping stone, not an end state.

## Additional implementation notes
- Bake the image only into `release.yaml`, not directly into the copied chart, so the snapshot remains closer to upstream source.
- If you want a single-file rendered output, keep a directory output anyway for PR readability.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/releases/`
- Add rendered output paths or branches
- Replace image-only Kargo stages with Helm render stages based on chart snapshots
- Keep env values and env deployment metadata in `apps/codeai/...`

## `code-dot-org` changes
- Update the warehouse writeback workflow to snapshot `k8s/helm` into the release dir
- Stop direct environment writeback

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
