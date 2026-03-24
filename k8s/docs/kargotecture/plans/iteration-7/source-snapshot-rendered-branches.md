# Source Snapshot (Helm or Kustomize) + Rendered Branches

**Short name:** Source snapshot + render

**Catchy description:** Freeze the deploy source package once per release, keep environment policy in GitOps, and let Kargo render stage-specific outputs from that frozen snapshot into reviewable rendered branches.

## Detailed Technical Description of Plan
This plan is the middle ground between live-source rendering and a richer OCI release artifact: CI freezes the deploy package once, writes that snapshot into `warehouses/codeai/freight/git-<full-commit-sha>/`, mirrors the exact same contents to `current/`, and then Kargo renders every downstream stage from that frozen release record. Promotion does not chase the moving `code-dot-org` branch tip. It reads `warehouses/codeai/freight/current/freight.yaml`, resolves the release identity and package type from there, and uses GitOps-side env policy to materialize the stage-specific output into a rendered branch. That gives you a release object that is still plain Git, still reviewable, and still easy to audit by path, but without the ambiguity of reconstructing release truth from live source during promotion.

The Helm and Kustomize forms share the same Freight contract but differ in how the snapshot is consumed. In the Helm form, the snapshot is just the chart source under `helm/`, so promotion is mostly `helm-template` plus the usual values files from `k8s-gitops`. In the Kustomize form, the snapshot is the durable `k8s/kustomize/` tree, but promotion still does not render from that tree directly. Instead, Kargo assembles a temporary deploy wrapper from `k8s-gitops/apps/codeai/kargo/templates/deploy/`, layers in the envType `Component` files from `apps/codeai/envTypes/<envType>/`, and points that wrapper at the frozen `base/` and `components/` payload in the snapshot before running `kustomize-build`. The important implementation detail is that the snapshot stays literal while the stage branch becomes the only mutable review surface.

The tricky part is not the rendering step itself; it is keeping the snapshot contract disciplined. `current/` must remain an exact mirror of the historical `git-<full-commit-sha>/` directory in the same commit, because promotion reads only `current/` while humans and audit tooling may inspect the historical release directory. That makes this plan easier to reason about than the live-source plans, which must sparse-checkout the huge monorepo at the promoted commit, but less compact than the thin-lock family because it duplicates the deploy package into GitOps-adjacent Freight. In practice, this is the plan to choose when you want frozen release inputs and rendered-branch reviewability without introducing a second artifact system.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## What Freight Looks Like
This plan promotes one frozen Git snapshot per release. The snapshot already
contains the exact deploy package Kargo should render from.

```text
warehouses/codeai/freight/git-<full-commit-sha>/
  freight.yaml
  helm/
# or
  kustomize/
    kustomization.yaml
warehouses/codeai/freight/current/
  freight.yaml
  helm/
# or
  kustomize/
    kustomization.yaml
```

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packageType: helm # or kustomize
```

## Warehouse artifact
On each successful build, publish one freight directory:

```text
warehouses/
  codeai/
    freight/
      current/
        freight.yaml
        helm/         # Helm
        # or:
        kustomize/    # Kustomize
          kustomization.yaml
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
- write both the historical `git-<full-commit-sha>/` directory and the stable `current/`
  directory in the same commit

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
    base/
    components/
    overlays/
    bin/
```

The snapshot is copied literally from the checked-in `code-dot-org/k8s/kustomize/`
tree, including `overlays/` and `bin/`. CI must preserve that full tree in the
Freight snapshot so the release record is a literal source-package copy rather
than a normalized subset. Promotion-time production code paths should still use
only `kustomize/base/` and `kustomize/components/`; the copied `overlays/` and
`bin/` subtrees are part of the snapshot contract, but not release-promotion
inputs.

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
The frozen package is the shared base/components tree, combined during
promotion with GitOps-side envType Components and a copied temp-wrapper
template.

## Kargo project
Promotion should render from the snapshot, not mutate live source.

Recommended stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Common promotion pattern:
1. Clone `k8s-gitops` at the exact Freight commit to a read-only path such as `./freight`.
2. Clone `k8s-gitops` `main` to `./meta` so env policy comes from the latest writable branch tip.
3. Clone the target rendered stage branch to `./out`.
4. Read `warehouses/codeai/freight/current/freight.yaml` from `./freight`.
5. Render the target stage from the frozen package plus GitOps env policy from `./meta`.
6. Commit and push rendered output to the stage branch.
7. In `review-infra-changes`, open a PR instead of pushing directly to the production branch.

Preferred rendered branch shape:

```text
stage/staging
stage/test
stage/levelbuilder
stage/production
```

### Helm-specific render path
1. Run `helm-template` against `./freight/warehouses/codeai/freight/current/helm/`.
2. Supply env values from:
   - `apps/codeai/envTypes/<envType>.values.yaml`
   - `apps/codeai/deployments/<deployment>/values.yaml`

### Kustomize-specific render path
1. Assemble a temp source tree from:
   - `./freight/warehouses/codeai/freight/current/kustomize/`
   - `./meta/apps/codeai/envTypes/<envType>/`
   - any referenced `./meta/apps/codeai/envTypes/components/` subcomponents
   - `./meta/apps/codeai/kargo/templates/deploy/`
2. Update the copied temp wrapper with `deployment.yaml.namespace`,
   `resources: ../../source/base`, and
   `components: ../../envTypes/<envType>`.
3. Set the promoted image tag in the assembled temp wrapper with
   `kustomize-set-image`, matching the real base image name `code-dot-org`.
4. Run `kustomize-build`.

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
- Kargo `verification` / `AnalysisTemplate`s for rollout, health, and smoke checks
- existing Drone unit/UI results for the same promoted `gitCommit`
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
  overlays/
  bin/
```

Use only `base/` and `components/` in Kargo/Argo production code paths. The
checked-in `overlays/` and `bin/` trees are currently local-dev/parity support.

### `k8s-gitops`

#### Common

```text
apps/codeai/
  envTypes/
  deployments/
    <deployment>/
      deployment.yaml
      values.yaml
  kargo/
    templates/
      deploy/
        kustomization.yaml
warehouses/codeai/freight/git-<full-commit-sha>/
  freight.yaml
```

#### Helm-specific

```text
apps/codeai/
  envTypes/
    <envType>.values.yaml
  deployments/
    <deployment>/
      deployment.yaml
      values.yaml
warehouses/codeai/freight/git-<full-commit-sha>/
  helm/
```

#### Kustomize-specific

```text
apps/codeai/
  envTypes/
    <envType>/
    components/
  deployments/
    <deployment>/
      deployment.yaml
  kargo/
    templates/
      deploy/
        kustomization.yaml
warehouses/codeai/freight/git-<full-commit-sha>/
  kustomize/
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

## Iteration 7 notes
- Keep the concrete `freight.yaml` contract with `packageType`, and make the payload directory match it.
- Keep this as the "copy the package into Freight" side of the comparison with the Kustomize variant of [Argo Refs code-dot-org Commit](./argo-refs-code-dot-org-commit.md).
- Keep the legacy-gitflow gate module linked into this plan.

# Code changes
## `k8s-gitops` changes

### Common
- Add `warehouses/codeai/freight/`
- Add rendered stage branches and rendered output paths
- Rewrite CodeAI Kargo stages around snapshot-driven rendering
- Keep `review-infra-changes` as a PR gate on rendered output
- Point Argo apps at rendered stage branches using
  `apps/codeai/deployments/<deployment>/deploy`

### Helm-specific
- Keep env values and deployment metadata in `apps/codeai/...`
- Render from Helm snapshots using GitOps-side values

### Kustomize-specific
- Add `apps/codeai/kargo/templates/deploy/kustomization.yaml` as the generic
  Kustomize temp-wrapper template copied into promotion work dirs
- Rewrite stages to assemble `kustomize + envType Component + temp wrapper`,
  then render

## `code-dot-org` changes

### Common
- Update the warehouse writeback workflow to snapshot the deploy package into the freight dir
- Stop direct environment writeback as the primary release mechanism

### Helm-specific
- Snapshot `k8s/helm` into `warehouses/codeai/freight/git-<full-commit-sha>/helm/`

### Kustomize-specific
- Snapshot the checked-in `k8s/kustomize/` tree from `code-dot-org` into `warehouses/codeai/freight/git-<full-commit-sha>/kustomize/`
- Keep local overlays and `bin/` in source repo for Skaffold/local dev
- Treat the existing `k8s-gitops/apps/codeai/envTypes/*/kustomization.yaml`
  files as the starting GitOps-side Kustomize Component inputs. `production`
  currently also layers in `envTypes/components/autoscaling`.

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan reuses:
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)

## Helm implementation starting point

Treat the checked-in `code-dot-org/k8s/helm/` tree as the starting point, not a
frozen contract. The implementor may modify or reshape `k8s/helm/` if this plan
benefits from it, but should preserve current behavior unless the change
materially improves the plan.

## Kustomize implementation starting point

Treat the checked-in `code-dot-org/k8s/kustomize/` tree as the starting point,
not a frozen contract. The implementor may modify or reshape `k8s/kustomize/`
as needed for this plan, especially the base/components layout, before
snapshotting it.

Use the current `k8s-gitops/apps/codeai/envTypes/<envType>/kustomization.yaml`
files as the starting envType Component contract. `production` may
additionally layer in `apps/codeai/envTypes/components/autoscaling/`.

Rendered-family Kustomize stages should not read a committed
`apps/codeai/deployments/<deployment>/deploy/` tree from `main`. Instead, keep
a generic deploy-dir template at `apps/codeai/kargo/templates/deploy/`, copy
that directory into a temp work dir during promotion, then update the copied
`kustomization.yaml` `namespace`, `resources`, and `components` before running
`kustomize-set-image`.

Do not treat `code-dot-org/k8s/kustomize/overlays/*` as the production deploy
contract unless the plan explicitly chooses to adopt them. Those directories are
currently local-dev/parity support, as is `code-dot-org/k8s/kustomize/bin/`.

## `codeai/applicationset.yaml` sketch

This plan should keep using `apps/codeai/deployments/*/deployment.yaml` on
`main` as the generator input, but Argo should deploy from the rendered
`deploy/` dir on each stage branch:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: codeai
  namespace: argocd
spec:
  generators:
    - git:
        repoURL: https://github.com/code-dot-org/k8s-gitops.git
        revision: main
        files:
          - path: apps/codeai/deployments/*/deployment.yaml
  template:
    metadata:
      name: codeai-{{path.basename}}
    spec:
      sources:
        - repoURL: https://github.com/code-dot-org/k8s-gitops.git
          targetRevision: stage/{{path.basename}}
          path: apps/codeai/deployments/{{path.basename}}/deploy
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
```

## Warehouse sketch

The Warehouse is Git-only on the frozen package snapshot tree:

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai-freight
  namespace: kargo-project-codeai
spec:
  subscriptions:
    - git:
        repoURL: https://github.com/code-dot-org/k8s-gitops.git
        branch: main
        includePaths:
          - warehouses/codeai/freight
```

Each Freight commit should introduce exactly one new
`warehouses/codeai/freight/git-<full-commit-sha>/` directory and also refresh the stable
`warehouses/codeai/freight/current/` mirror. Promotion reads only `current/`,
while humans and audit tooling use the historical `git-<full-commit-sha>/` directories.

## Hard parts

The hard parts in this plan are:

1. keep the historical `git-<full-commit-sha>/` directory and the stable `current/`
   mirror identical in the same Freight commit
2. keep the frozen snapshot small and literal, without smuggling env-specific
   config into it

The first part is the actual implementation risk. Promotion-side lookup is
made deterministic on purpose: Stages always read
`warehouses/codeai/freight/current/`.

## Example `staging` Stage

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: staging
  namespace: kargo-project-codeai
spec:
  requestedFreight:
    - origin:
        kind: Warehouse
        name: codeai-freight
      sources:
        direct: true
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
    - name: targetBranch
      value: stage/${{ ctx.stage }}
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: ${{ vars.gitopsRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-freight')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: freight
          config:
            path: ./freight/warehouses/codeai/freight/current/freight.yaml
            outputs:
              - name: packageType
                fromExpression: packageType
              - name: imageRef
                fromExpression: image.ref
              - name: releaseId
                fromExpression: tag

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ ctx.stage }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        - uses: helm-template
          config:
            path: ./freight/warehouses/codeai/freight/current/helm
            releaseName: codeai
            outPath: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy
            valuesFiles:
              - ./meta/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}.values.yaml
              - ./meta/apps/codeai/deployments/${{ ctx.stage }}/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ outputs.freight.releaseId }}

        - uses: git-commit
          config:
            path: ./out
            message: Render ${{ ctx.stage }} from ${{ outputs.freight.releaseId }}

        - uses: git-push
          config:
            path: ./out
            branch: ${{ vars.targetBranch }}
```

For the Kustomize-shaped variant, replace the `helm-template` step with
the concrete Kustomize render path below.

## Example `staging` Stage for Kustomize

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: staging
  namespace: kargo-project-codeai
spec:
  requestedFreight:
    - origin:
        kind: Warehouse
        name: codeai-freight
      sources:
        direct: true
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: targetBranch
      value: stage/${{ ctx.stage }}
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: ${{ vars.gitopsRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-freight')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: freight
          config:
            path: ./freight/warehouses/codeai/freight/current/freight.yaml
            outputs:
              - name: packageType
                fromExpression: packageType
              - name: releaseId
                fromExpression: tag

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ ctx.stage }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        - uses: copy
          config:
            inPath: ./freight/warehouses/codeai/freight/current/kustomize
            outPath: ./work/deployments/source

        - uses: copy
          config:
            inPath: ./meta/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}
            outPath: ./work/deployments/envTypes/${{ outputs['deployment-meta'].envType }}

        - uses: copy
          config:
            inPath: ./meta/apps/codeai/envTypes/components
            outPath: ./work/deployments/envTypes/components

        - uses: copy
          config:
            inPath: ./meta/apps/codeai/kargo/templates/deploy
            outPath: ./work/deployments/${{ ctx.stage }}/deploy

        # The temp wrapper template provides apiVersion/kind and one
        # `images` entry whose match key is `code-dot-org`.
        - uses: yaml-update
          config:
            path: ./work/deployments/${{ ctx.stage }}/deploy/kustomization.yaml
            updates:
              - key: namespace
                value: ${{ outputs['deployment-meta'].namespace }}
              - key: resources
                value:
                  - ../../source/base
              - key: components
                value:
                  - ../../envTypes/${{ outputs['deployment-meta'].envType }}

        - uses: kustomize-set-image
          config:
            path: ./work/deployments/${{ ctx.stage }}/deploy
            images:
              - image: code-dot-org
                newName: ${{ vars.imageRepo }}
                tag: ${{ outputs.freight.releaseId }}

        - uses: kustomize-build
          config:
            path: ./work/deployments/${{ ctx.stage }}/deploy
            outPath: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        - uses: git-commit
          config:
            path: ./out
            message: Render ${{ ctx.stage }} from ${{ outputs.freight.releaseId }}

        - uses: git-push
          config:
            path: ./out
            branch: ${{ vars.targetBranch }}
```

## Example `review-infra-changes` Stage

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: review-infra-changes
  namespace: kargo-project-codeai
spec:
  requestedFreight:
    - origin:
        kind: Warehouse
        name: codeai-freight
      sources:
        stages:
          - test
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: targetBranch
      value: stage/production
    - name: renderDeployment
      value: production
    - name: renderPath
      value: apps/codeai/deployments/production/deploy
    - name: releaseName
      value: codeai
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: ${{ vars.gitopsRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-freight')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: freight
          config:
            path: ./freight/warehouses/codeai/freight/current/freight.yaml
            outputs:
              - name: releaseId
                fromExpression: tag

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ vars.renderDeployment }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: git-clear
          config:
            path: ./out/${{ vars.renderPath }}

        - uses: helm-template
          config:
            path: ./freight/warehouses/codeai/freight/current/helm
            releaseName: ${{ vars.releaseName }}
            outPath: ./out/${{ vars.renderPath }}
            valuesFiles:
              - ./meta/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}.values.yaml
              - ./meta/apps/codeai/deployments/${{ vars.renderDeployment }}/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ outputs.freight.releaseId }}

        - uses: git-commit
          config:
            path: ./out
            message: Review production render for ${{ outputs.freight.releaseId }}

        - uses: git-push
          as: push
          config:
            path: ./out
            generateTargetBranch: true

        - uses: git-open-pr
          as: open-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            sourceBranch: ${{ outputs.push.branch }}
            targetBranch: ${{ vars.targetBranch }}
            title: Review CodeAI production render for ${{ outputs.freight.releaseId }}

        - uses: git-wait-for-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

## Example `review-infra-changes` Stage for Kustomize

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: review-infra-changes
  namespace: kargo-project-codeai
spec:
  requestedFreight:
    - origin:
        kind: Warehouse
        name: codeai-freight
      sources:
        stages:
          - test
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: targetBranch
      value: stage/production
    - name: renderDeployment
      value: production
    - name: renderPath
      value: apps/codeai/deployments/production/deploy
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: ${{ vars.gitopsRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-freight')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: freight
          config:
            path: ./freight/warehouses/codeai/freight/current/freight.yaml
            outputs:
              - name: releaseId
                fromExpression: tag

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ vars.renderDeployment }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType

        - uses: git-clear
          config:
            path: ./out/${{ vars.renderPath }}

        - uses: copy
          config:
            inPath: ./freight/warehouses/codeai/freight/current/kustomize
            outPath: ./work/deployments/source

        - uses: copy
          config:
            inPath: ./meta/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}
            outPath: ./work/deployments/envTypes/${{ outputs['deployment-meta'].envType }}

        - uses: copy
          config:
            inPath: ./meta/apps/codeai/envTypes/components
            outPath: ./work/deployments/envTypes/components

        - uses: copy
          config:
            inPath: ./meta/apps/codeai/kargo/templates/deploy
            outPath: ./work/deployments/${{ vars.renderDeployment }}/deploy

        # The temp wrapper template provides apiVersion/kind and one
        # `images` entry whose match key is `code-dot-org`.
        - uses: yaml-update
          config:
            path: ./work/deployments/${{ vars.renderDeployment }}/deploy/kustomization.yaml
            updates:
              - key: namespace
                value: ${{ outputs['deployment-meta'].namespace }}
              - key: resources
                value:
                  - ../../source/base
              - key: components
                value:
                  - ../../envTypes/${{ outputs['deployment-meta'].envType }}

        - uses: kustomize-set-image
          config:
            path: ./work/deployments/${{ vars.renderDeployment }}/deploy
            images:
              - image: code-dot-org
                newName: ${{ vars.imageRepo }}
                tag: ${{ outputs.freight.releaseId }}

        - uses: kustomize-build
          config:
            path: ./work/deployments/${{ vars.renderDeployment }}/deploy
            outPath: ./out/${{ vars.renderPath }}

        - uses: git-commit
          config:
            path: ./out
            message: Review production render for ${{ outputs.freight.releaseId }}

        - uses: git-push
          as: push
          config:
            path: ./out
            generateTargetBranch: true

        - uses: git-open-pr
          as: open-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            sourceBranch: ${{ outputs.push.branch }}
            targetBranch: ${{ vars.targetBranch }}
            title: Review CodeAI production render for ${{ outputs.freight.releaseId }}

        - uses: git-wait-for-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

## GH runner sketch

This runner does more than the build-lock plans:

1. Build and stitch the app image.
2. Resolve the final image digest.
3. Check out `k8s-gitops` `main`.
4. Create `warehouses/codeai/freight/git-<full-commit-sha>/`.
5. Refresh `warehouses/codeai/freight/current/` with the same package contents.
6. Copy the full checked-in `code-dot-org/k8s/kustomize/` tree literally when
   the plan is Kustomize-shaped, including `overlays/` and `bin/`, and copy the
   full checked-in `code-dot-org/k8s/helm/` tree literally when the plan is
   Helm-shaped. Do not trim the Kustomize snapshot to only `base/` and
   `components/`.
7. Copy either:
   - `k8s/helm/` to `warehouses/codeai/freight/git-<full-commit-sha>/helm/`
   - or `k8s/kustomize/` to `warehouses/codeai/freight/git-<full-commit-sha>/kustomize/`
8. Write `freight.yaml` with `revision`, image ref/digest, and `packageType`.
9. Copy the same `freight.yaml` to `warehouses/codeai/freight/current/freight.yaml`.
10. Commit and push the historical directory and the `current/` mirror together.

This is the pivotal architectural move in the plan: freeze the deploy package
once in CI, then promote only from that frozen package.

The promotion-time hardness is now explicit but simpler than a helper:
the GH runner must keep the historical `git-<full-commit-sha>/` directory and the stable
`current/` mirror identical in the same commit so Stages can always read:
- `warehouses/codeai/freight/current/freight.yaml`
- `warehouses/codeai/freight/current/helm/` or `.../kustomize/`
- for Kustomize, that copied snapshot must include `base/`, `components/`,
  `overlays/`, and `bin/` exactly as checked in, even though promotion only
  consumes `base/` and `components/`

### Testing Plan

Recommended automation:
- Extend [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or call a small reusable workflow from it for repo-specific contract and render smoke checks.
- Use existing Drone results on the promoted `gitCommit` as the app/unit/UI gate before downstream promotion.
- Use Kargo `verification` with `AnalysisTemplate`s for post-sync rollout/health/smoke checks in `test`.

Simple tests to automate:
- In `k8s.yml`, after the snapshot-writing step, build the proposed `warehouses/codeai/freight/git-<full-commit-sha>/` directory in a temp workspace and fail unless `current/` is byte-for-byte identical to the historical directory.
- In the same workflow, parse `warehouses/codeai/freight/current/freight.yaml` and fail unless it contains `revision`, `tag`, `image.ref`, `image.digest`, `packageType`, and `createdAt`.
- For the Helm variant, run `helm template` from `warehouses/codeai/freight/current/helm` using deployment metadata from `apps/codeai/deployments/<deployment>/deployment.yaml`, envType values from `apps/codeai/envTypes/<envType>.values.yaml`, and deployment values from `apps/codeai/deployments/<deployment>/values.yaml`.
- For the Kustomize variant, run `kustomize build` from a temp tree assembled from `warehouses/codeai/freight/current/kustomize`, `apps/codeai/envTypes/<envType>/` as a Component, any referenced `apps/codeai/envTypes/components/` subcomponents such as `autoscaling`, and a copied `apps/codeai/kargo/templates/deploy/` dir whose `kustomization.yaml` `namespace`, `resources`, and `components` fields are updated before `kustomize-set-image` rewrites `code-dot-org` to `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`. The snapshot itself must still contain the full checked-in `overlays/` and `bin/` directories, but production promotion code must not consume them. Do not trim the snapshot tree differently in a later implementation.
- In the same workflow, check out `k8s-gitops` read-only and validate [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml) deploys `apps/codeai/deployments/{{path.basename}}/deploy` from `stage/{{path.basename}}` and that every deployment metadata file carries `envType`.

Avoid as baseline coverage:
- A fake controller harness whose only job is to re-test Kargo Git checkout behavior. The useful Kustomize smoke test now is just: snapshot the checked-in `k8s/kustomize/` tree, then build it locally with the current envType Component inputs plus the copied deploy-template dir.
