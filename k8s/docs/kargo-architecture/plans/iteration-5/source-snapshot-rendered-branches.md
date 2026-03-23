# Source Snapshot (Helm or Kustomize) + Rendered Branches

**Short name:** Source snapshot + render

**Catchy description:** Freeze the deploy source package once per release, keep environment policy in GitOps, and let Kargo render stage-specific outputs from that frozen snapshot into reviewable rendered branches.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
On each successful build, publish one freight directory:

```text
warehouses/
  codeai/
    freight/
      git-<full-commit-sha>/
        freight.yaml
        helm/         # Helm
        # or:
        kustomize/    # Kustomize
          kustomization.yaml
```

Recommended `freight.yaml`:

```yaml
schemaVersion: v1
revision: <full-commit-sha>
tag: git-<full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packageType: helm # or kustomize
treeHash: sha256:...
createdAt: 2026-03-22T12:34:56Z
```

Common rules:
- use `git-<full-commit-sha>` as the operator-facing release/tag shape
- keep the full 40-character SHA in structured metadata
- snapshot only the deploy package, not the whole monorepo
- keep env-specific policy out of the snapshot and in `k8s-gitops`
- do not mutate or normalize the package in CI; the snapshot is a literal source-package copy
- `packageType: helm` means the payload lives in `helm/`
- `packageType: kustomize` means the payload lives in `kustomize/`

### Helm-specific snapshot payload

```text
warehouses/codeai/freight/git-<full-commit-sha>/
  freight.yaml
  helm/
    Chart.yaml
    values.yaml
    templates/...
```

The snapshot is copied from `code-dot-org/k8s/helm` at the release commit.

### Kustomize-specific snapshot payload

```text
warehouses/codeai/freight/git-<full-commit-sha>/
  freight.yaml
  kustomize/
    kustomization.yaml
    ...
```

The snapshot is copied from the durable shared source tree in `code-dot-org`. The only warehouse-level contract is that `kustomize/kustomization.yaml` exists; any nested base/components layout under that root is up to the Kustomize package itself.

One reasonable source shape is:

```text
k8s/kustomize/
  kustomization.yaml
  base/
  components/
```

## Freight
Freight is **Git-only** on `warehouses/codeai/freight/`.

Suggested Warehouse shape:

```yaml
git:
  repoURL: https://github.com/code-dot-org/k8s-gitops.git
  branch: main
  includePaths:
    - warehouses/codeai/freight
```

Each Freight contains:
- the frozen source snapshot
- the image ref + digest
- the package type
- the release identity

The Freight shape stays stable across stages. Stages only change the rendered environment view.

### Helm-specific interpretation
The frozen package is the full Helm chart source.

### Kustomize-specific interpretation
The frozen package is the shared base/components tree, combined during promotion with GitOps-side overlays.

## Kargo project
Promotion should render from the snapshot, not mutate live source.

Recommended stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Common promotion pattern:
1. Clone `k8s-gitops` at the freight commit to `./src`.
2. Clone the target rendered stage branch to `./out`.
3. Read `warehouses/codeai/freight/git-<full-commit-sha>/freight.yaml`.
4. Render the target stage from the frozen package plus GitOps env policy.
5. Commit and push rendered output to the stage branch.
6. In `review-infra-changes`, open a PR instead of pushing directly to the production branch.

Preferred rendered branch shape:

```text
stage/staging
stage/test
stage/levelbuilder
stage/production
```

### Helm-specific render path
1. Run `helm-template` against `./src/warehouses/codeai/freight/git-<full-commit-sha>/helm/`.
2. Supply env values from:
   - `apps/codeai/envTypes/<env>.values.yaml`
   - `apps/codeai/deployments/<env>/values.yaml`

### Kustomize-specific render path
1. Assemble a temp source tree from:
   - `./src/warehouses/codeai/freight/git-<full-commit-sha>/kustomize/`
   - `./src/apps/codeai/overlays/<stage>/`
2. Set the image digest/tag in the assembled source tree or overlay.
3. Run `kustomize-build`.

## Stage-by-stage promotion flow
- `staging`: render staging output from the frozen package snapshot to `stage/staging`
- `test`: render test output from the same snapshot to `stage/test` and run automated tests
- `levelbuilder`: render levelbuilder output from the same snapshot after `test`
- `review-infra-changes`: render production output to a generated branch against `stage/production` and open a PR
- `production`: merge the reviewed production render, then sync Argo to `stage/production`

This is effectively the rendered-branches review model, but with a frozen source snapshot instead of a live-source read from `code-dot-org` during promotion.

## `review infra changes` stage behavior
This stage is the same for both packaging variants:
1. Render production manifests from the frozen source snapshot plus production env policy.
2. Commit to a generated branch.
3. Open a PR against `stage/production`.
4. Wait for merge before production sync.

The review surface is the rendered deploy output, not raw source refs.

## `test` stage automation behavior
After syncing `stage/test`, run verification before downstream promotion.

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
  freight.yaml
```

#### Helm-specific

```text
apps/codeai/
  envTypes/
    <env>.values.yaml
  deployments/
    <env>/
      values.yaml
warehouses/codeai/freight/git-<full-commit-sha>/
  helm/
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
warehouses/codeai/freight/git-<full-commit-sha>/
  kustomize/
    kustomization.yaml
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
- combines the strongest review model with a frozen, explicit release input
- avoids promotion-time reconstruction from the live monorepo
- keeps release truth legible in Git
- works now for Helm and later for Kustomize
- keeps the long-lived architecture clear without inventing extra artifact layers

## Cons
- duplicates the deploy package into `k8s-gitops`
- creates more Git storage churn than thin-lock plans
- requires rendered branch plumbing and Argo changes

Helm-specific downside:
- narrower and more transitional than the Kustomize-shaped form

Kustomize-specific downside:
- requires a real long-lived base/components/overlay structure decision

## Migration notes
- This merged plan supersedes both the old `Immutable Package Snapshot + Rendered Branches` plan and the old `Source Snapshot` family plan.
- If the team wants the lowest-friction first form, start with the Helm-shaped source snapshot.
- If the team wants to optimize more aggressively for the long-term packaging model, adopt the Kustomize-shaped variant.
- In both cases, the core architectural move is the same: freeze the source package once, keep env policy in GitOps, and render from the snapshot during promotion.

## Additional implementation notes
- Keep the image only in `freight.yaml`, not baked into copied source files.
- Prefer directory-rendered output over single-file output for PR readability.
- If Git storage churn later becomes painful, the next refinement to evaluate is storing the snapshot package in OCI while keeping the same architectural shape.

# Code changes
## `k8s-gitops` changes

### Common
- Add `warehouses/codeai/freight/`
- Add rendered stage branches and rendered output paths
- Rewrite CodeAI Kargo stages around snapshot-driven rendering
- Keep `review-infra-changes` as a PR gate on rendered output
- Point Argo apps at rendered stage branches or equivalent rendered paths

### Helm-specific
- Keep env values and deployment metadata in `apps/codeai/...`
- Render from Helm snapshots using GitOps-side values

### Kustomize-specific
- Add `apps/codeai/overlays/`
- Rewrite stages to assemble `kustomize + overlay`, then render

## `code-dot-org` changes

### Common
- Update the warehouse writeback workflow to snapshot the deploy package into the freight dir
- Stop direct environment writeback as the primary release mechanism

### Helm-specific
- Snapshot `k8s/helm` into `warehouses/codeai/freight/git-<full-commit-sha>/helm/`

### Kustomize-specific
- Create and maintain the durable `k8s/kustomize/` tree rooted by `kustomization.yaml`
- Keep local overlays in source repo for Skaffold/local dev
- Snapshot that Kustomize package into `warehouses/codeai/freight/git-<full-commit-sha>/kustomize/`

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
