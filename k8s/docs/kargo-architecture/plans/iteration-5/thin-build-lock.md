# Thin Build Lock

**Short name:** Thin lock

**Catchy description:** Write one tiny release record to `warehouses/codeai/`, then let Kargo promote that immutable release ID by updating environment refs instead of copying packaging source around.

- **Type:** Packaging-agnostic
- **Pattern:** Source-driven
- **Rendered manifests pattern:** No

## Warehouse artifact
On each successful `staging` build, the GH action writes one file:

```text
warehouses/
  codeai/
    builds/
      git-<full-commit-sha>.yaml
```

Suggested file content:

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <gitcommit>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packaging:
  kind: helm # or kustomize
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/helm # or k8s/kustomize
createdAt: 2026-03-22T12:34:56Z
```

The file is the only warehouse input. It is intentionally small and reviewable.

## Freight
Freight is **Git-only**.

The CodeAI Warehouse watches:

```yaml
git:
  repoURL: https://github.com/code-dot-org/k8s-gitops.git
  branch: main
  includePaths:
    - warehouses/codeai/builds
```

Each new `git-<full-commit-sha>.yaml` commit becomes a new piece of freight.

Pros:
- extremely simple
- warehouse discovery is fast and deterministic
- `$gitcommit` is the single release coordinate

Cons:
- Kargo does not natively know about the image repo or chart repo
- rendered manifest diffs are not first-class unless added later

## Kargo project
Stages:
- `staging`: direct from Warehouse
- `test`: from `staging`, then automated tests
- `levelbuilder`: from `test`
- `review-infra-changes`: from `test`, PR-oriented gate for production changes
- `production`: from `review-infra-changes`

Promotion task behavior:
1. Clone `k8s-gitops`.
2. Parse `warehouses/codeai/builds/git-<full-commit-sha>.yaml`.
3. Update the target env’s `apps/codeai/deployments/<env>/deployment.yaml` so `branch: <gitcommit>`.
4. Update the target env’s `values.yaml` so the image is `ghcr.io/...:git-<full-commit-sha>` or the image digest.
5. Commit and push.

`review-infra-changes` should push to a generated branch and open a PR instead of pushing directly to `main`.

## Stage-by-stage promotion flow
- `staging`: write `branch: <gitcommit>` and image ref into `deployments/staging/`
- `test`: copy the same two values into `deployments/test/`
- `levelbuilder`: copy the same two values into `deployments/levelbuilder/`
- `review-infra-changes`: prepare the production update on a PR branch, including any env-specific `values.yaml` changes
- `production`: merge/apply the already-reviewed production PR or commit the same refs after approval

`test` is where automated tests run. The release should not advance to `levelbuilder` or `review-infra-changes` until those tests pass.

## Helm / Kustomize structure
This plan works with either packaging style.

### `code-dot-org`
No structural change is required.

Helm can stay:

```text
k8s/helm/
  Chart.yaml
  values.yaml
  staging.values.yaml
  test.values.yaml
  levelbuilder.values.yaml
  production.values.yaml
```

Future Kustomize can also stay in `code-dot-org` as long as Argo can point at a commit SHA via `branch:`.

### `k8s-gitops`
Keep:

```text
apps/codeai/deployments/<env>/
  deployment.yaml
  values.yaml
```

Add:

```text
warehouses/codeai/builds/
  git-<full-commit-sha>.yaml
```

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local Skaffold continues to use `code-dot-org/k8s/helm` or future local Kustomize directly. This plan only changes how promoted environments are pointed at source commits.

## Pros
- simplest warehouse artifact
- easiest migration from today
- clean use of `$gitcommit` as the release ID
- no need to package charts or render manifests in CI

## Cons
- weakest reviewability of infra drift
- production review mostly sees config ref changes, not rendered manifests
- relies on Argo rendering from source repo at deploy time

## Migration notes
- Fix `apps/codeai/applicationset.yaml` to use `{{branch}}` instead of `{{sourceRevision}}`.
- Make environment deployments use commit SHAs consistently.
- Update the current writeback workflow to write warehouse files instead of env `values.yaml`.

## Additional implementation notes
- Prefer storing the image digest in the lock file even if `values.yaml` keeps the readable tag.
- The PR opened by `review-infra-changes` should quote both old and new `$gitcommit`.
- This plan is the best “minimum viable Kargo” baseline and a strong control option in rankings.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/builds/`
- Replace the current image-only CodeAI Warehouse with a Git Warehouse on `warehouses/codeai/builds/`
- Replace current stage templates so they parse the build file and update `deployment.yaml` + `values.yaml`
- Add a `review-infra-changes` Stage
- Update `apps/codeai/applicationset.yaml` to read `branch`

## `code-dot-org` changes
- Rewrite `k8s-commit-to-kargo-warehouse.yml` to write `warehouses/codeai/builds/git-<full-commit-sha>.yaml`
- Stop direct writes to `apps/codeai/deployments/*/values.yaml`

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
