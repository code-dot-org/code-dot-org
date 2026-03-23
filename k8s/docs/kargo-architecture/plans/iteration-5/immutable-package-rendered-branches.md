# Immutable Package Snapshot + Rendered Branches

**Short name:** Snapshot + render

**Catchy description:** Publish an immutable packaging snapshot for each `$gitcommit`, then let Kargo render stage-specific outputs from that frozen package into reviewable stage branches.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
On each successful `staging` build, the GH action writes:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
        package/
          ... packaging snapshot ...
```

The `package/` subtree is:
- for Helm: a snapshot of `code-dot-org/k8s/helm/`
- for Kustomize: a snapshot of `code-dot-org/k8s/kustomize/base/` plus `components/`

Suggested `release.yaml`:

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <gitcommit>
packaging:
  kind: helm # or kustomize
  packagePath: package
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
snapshotTreeHash: sha256:...
createdAt: 2026-03-22T12:34:56Z
```

This is the “one release directory per release” model, but it keeps rendering in Kargo instead of CI.

## Freight
Freight is **Git-only** on:

```yaml
git:
  repoURL: https://github.com/code-dot-org/k8s-gitops.git
  branch: main
  includePaths:
    - warehouses/codeai/releases
```

The freight contains:
- the immutable package snapshot
- the image metadata
- the release identity

Pros:
- one coherent release artifact
- no pairing ambiguity
- package input is frozen and reviewable

Cons:
- larger Git payload than thin-lock plans
- duplicates packaging source into `k8s-gitops`

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Promotion task pattern:
1. Clone `k8s-gitops` at the freight commit to `./src`.
2. Parse `warehouses/codeai/releases/git-<full-commit-sha>/release.yaml`.
3. Clone the stage output branch/path to `./out`.
4. For Helm:
   - run `helm-template` on `./src/warehouses/codeai/releases/git-<full-commit-sha>/package`
   - pass env values from `apps/codeai/...`
5. For Kustomize:
   - assemble the snapshot package with the target overlay from `apps/codeai/overlays/<stage>/`
   - run `kustomize-build`
6. Commit and push rendered output.
7. In `review-infra-changes`, use a generated branch and PR.

This is effectively “Rendered Branches,” but with a frozen package artifact instead of pulling live source from `code-dot-org` during promotion.

## Stage-by-stage promotion flow
- `staging`: render staging output from the immutable package snapshot
- `test`: render test output from the same snapshot and run automated tests
- `levelbuilder`: render levelbuilder output from the same snapshot
- `review-infra-changes`: render production output from the same snapshot to a PR branch
- `production`: merge the reviewed rendered output

The nature of freight stays the same across stages. Each stage simply renders a different env view of the same release snapshot.

## Helm / Kustomize structure
This plan is intentionally agnostic and supports a migration path.

### `code-dot-org`
Helm can stay as-is in the short term:

```text
k8s/helm/
```

If Kustomize becomes primary, use a cleaner tree:

```text
k8s/kustomize/
  base/
  components/
  local/
    overlays/
```

### `k8s-gitops`
Keep env config in GitOps:

```text
apps/codeai/
  envTypes/
  deployments/
  overlays/        # for Kustomize plans
  rendered/
    staging/
    test/
    levelbuilder/
    production/
warehouses/codeai/
  releases/
    git-<full-commit-sha>/
      release.yaml
      package/
```

This plan does not require all env overlays to move immediately. Helm can use current `envTypes/` and deployment values, while Kustomize can add `apps/codeai/overlays/`.

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local dev continues to use source packaging in `code-dot-org`. The warehouse snapshot is release-time artifact state only.

## Pros
- combines the best review story with strong release immutability
- works now for Helm and later for Kustomize
- avoids live source-repo reads during promotion
- makes release artifacts explicit and auditable

## Cons
- more Git storage churn than thin-lock designs
- somewhat heavier CI writeback
- more complex than Thin Build Lock

## Migration notes
- This is a strong “best later, but still plausible now” design.
- It can be rolled out in Helm mode first, then used as the same architectural shape during a later Kustomize migration.

## Additional implementation notes
- If this wins, it likely obsoletes both `Helm Source Snapshot` and `Kustomize Base Snapshot` as separate end-state architectures; those remain useful stepping stones.
- Prefer rendered output directories over single-file manifests for PR readability.
- If the package snapshot gets too large, revisit the `OCI Bundle Pointer` plan as an optimization, not as the primary architecture.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/releases/`
- Add or keep env config under `apps/codeai/...`
- Add `apps/codeai/rendered/<stage>/`
- Replace current CodeAI Kargo stages with snapshot-driven render stages
- Point Argo apps at rendered outputs

## `code-dot-org` changes
- Update the GH action to snapshot the package tree into `warehouses/codeai/releases/git-<full-commit-sha>/package/`
- Keep source packaging in `code-dot-org/k8s/...` for Skaffold and normal source review
- No immediate need to restructure Helm; Kustomize restructuring can happen later without changing the core release model
