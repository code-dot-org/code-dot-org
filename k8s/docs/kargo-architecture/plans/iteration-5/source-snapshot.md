# Source Snapshot (Helm Chart or Kustomize Base)

**Short name:** Source snapshot

**Catchy description:** Freeze the deploy package once per release, keep environment policy in GitOps, and let Kargo render promoted output from a small immutable source snapshot instead of reconstructing release truth from the live monorepo.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
On each successful build, publish one release directory:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
        ... package snapshot ...
```

Recommended `release.yaml`:

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packaging:
  kind: helm # or kustomize
  packagePath: chart # or base
  componentsPath: components # kustomize only
  treeHash: sha256:...
```

Common rules:
- use `git-<full-commit-sha>` as the operator-facing release/tag shape
- keep the full 40-character SHA in structured metadata
- snapshot only the deploy package, not the whole monorepo
- keep env-specific policy out of the snapshot and in `k8s-gitops`

### Helm-specific snapshot payload

```text
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
  chart/
    Chart.yaml
    values.yaml
    templates/...
```

The snapshot is copied from `code-dot-org/k8s/helm` at the release commit.

### Kustomize-specific snapshot payload

```text
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
  base/
  components/
```

The snapshot is copied from the durable shared source tree in `code-dot-org`, for example:

```text
k8s/kustomize/
  base/
  components/
```

## Freight
Freight is **Git-only** on `warehouses/codeai/releases/`.

Each Freight contains:
- the frozen package snapshot
- the image ref + digest
- the release identity

The Freight shape stays stable across stages. Stages only change the rendered environment view.

### Helm-specific interpretation
The frozen package is the full Helm chart source.

### Kustomize-specific interpretation
The frozen package is the shared base/components tree, combined during promotion with GitOps-side overlays.

## Kargo project
Promotion should render from the snapshot, not mutate live source.

Common pattern:
1. Clone `k8s-gitops` at the freight commit to `./src`.
2. Clone the target rendered stage branch or rendered path workspace to `./out`.
3. Read `warehouses/codeai/releases/git-<full-commit-sha>/release.yaml`.
4. Render the target stage from the frozen package plus GitOps env policy.
5. Commit and push rendered output.
6. In `review-infra-changes`, open a PR instead of pushing directly to the production branch.

Recommended stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

### Helm-specific render path
1. Run `helm-template` against `./src/warehouses/codeai/releases/git-<full-commit-sha>/chart/`.
2. Supply env values from:
   - `apps/codeai/envTypes/<env>.values.yaml`
   - `apps/codeai/deployments/<env>/values.yaml`

### Kustomize-specific render path
1. Assemble a temp source tree from:
   - `./src/warehouses/codeai/releases/git-<full-commit-sha>/base`
   - `./src/warehouses/codeai/releases/git-<full-commit-sha>/components`
   - `./src/apps/codeai/overlays/<stage>/`
2. Set the image digest/tag in the assembled source tree or overlay.
3. Run `kustomize-build`.

## Stage-by-stage promotion flow
- `staging`: render staging output from the frozen package snapshot
- `test`: render test output from the same snapshot and run automated tests
- `levelbuilder`: render levelbuilder output from the same snapshot after `test`
- `review-infra-changes`: render production output to a generated branch and open a PR
- `production`: merge or fast-forward the already-reviewed production render

## `review infra changes` stage behavior
This stage is the same for both variants:
1. Render production manifests from the frozen package plus production env policy.
2. Commit to a generated branch.
3. Open a PR against the rendered production branch.
4. Wait for merge before production sync.

The review surface is the rendered deploy output, not raw source refs.

## `test` stage automation behavior
After syncing the rendered `test` output, run verification before downstream promotion.

Good fits:
- Kargo `verification` / `AnalysisTemplate`s for smoke checks
- external integration tests after sync
- stage promotion rules that ensure downstream stages follow the exact Freight already verified in `test`

## Proposed Helm / Kustomize directory structure
### `code-dot-org`

#### Helm-specific
No required structural change for v1:

```text
k8s/helm/
  Chart.yaml
  values.yaml
  staging.values.yaml
  test.values.yaml
  levelbuilder.values.yaml
  production.values.yaml
```

#### Kustomize-specific
This variant assumes a durable shared Kustomize tree:

```text
k8s/kustomize/
  base/
  components/
  local/
    overlays/
```

### `k8s-gitops`

#### Common

```text
apps/codeai/
  rendered/
    staging/
    test/
    levelbuilder/
    production/
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
```

#### Helm-specific

```text
apps/codeai/
  envTypes/
    <env>.values.yaml
  deployments/
    <env>/
      values.yaml
warehouses/codeai/releases/git-<full-commit-sha>/
  chart/
```

#### Kustomize-specific

```text
apps/codeai/
  overlays/
    staging/
    test/
    levelbuilder/
    production/
  envTypes/
    staging/
    test/
    levelbuilder/
    production/
warehouses/codeai/releases/git-<full-commit-sha>/
  base/
  components/
```

## Does it break/awkwardize skaffold or local-dev in any way?
No.

Common rule:
- local dev keeps using source packaging in `code-dot-org`
- the warehouse snapshot is only a CI/promotion artifact

Helm-specific note:
- Skaffold keeps using `code-dot-org/k8s/helm`

Kustomize-specific note:
- if Helm is retired for local dev, Skaffold needs a durable source-based Kustomize path

## Pros
- freezes a small, explicit deploy package once per release
- avoids promotion-time reconstruction from the live monorepo
- keeps release truth legible in Git
- preserves strong reviewability when paired with rendered outputs
- works as a stable architecture family across Helm-now and Kustomize-later

## Cons
- duplicates the deploy package into `k8s-gitops`
- creates more Git storage churn than thin-lock plans
- requires rendered-output plumbing if you want the best review surface

Helm-specific downside:
- narrower and more transitional

Kustomize-specific downside:
- requires a real long-lived base/components/overlay structure decision

## Migration notes
- This merged plan subsumes the older separate `Helm Source Snapshot` and `Kustomize Base Snapshot` plan docs.
- If the team wants the lowest-friction first form, start with the Helm-shaped package snapshot.
- If the team wants to optimize more aggressively for the long-term packaging model, adopt the Kustomize-shaped variant.
- In both cases, the core architectural move is the same: freeze the source package once, keep env policy in GitOps, and render from the snapshot during promotion.

## Additional implementation notes
- Keep the image only in `release.yaml`, not baked into copied source files.
- Prefer directory-rendered output over single-file output for PR readability.
- If Git storage churn later becomes painful, the next refinement to evaluate is storing the snapshot package in OCI while keeping the same architectural shape.

# Code changes
## `k8s-gitops` changes

### Common
- Add `warehouses/codeai/releases/`
- Add rendered output paths or rendered stage branches
- Rewrite CodeAI Kargo stages around snapshot-driven rendering
- Keep `review-infra-changes` as a PR gate on rendered output

### Helm-specific
- Keep env values and deployment metadata in `apps/codeai/...`
- Render from chart snapshots using GitOps-side values

### Kustomize-specific
- Add `apps/codeai/overlays/`
- Rewrite stages to assemble `base + components + overlay`, then render

## `code-dot-org` changes

### Common
- Update the warehouse writeback workflow to snapshot the deploy package into the release dir
- Stop direct environment writeback as the primary release mechanism

### Helm-specific
- Snapshot `k8s/helm` into `warehouses/codeai/releases/git-<full-commit-sha>/chart/`

### Kustomize-specific
- Create and maintain the durable `k8s/kustomize/base` + `components` tree
- Keep local overlays in source repo for Skaffold/local dev
- Snapshot `base/` and `components/` into the release dir
