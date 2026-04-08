# Rendered Branches from a Thin Lock

**Short name:** Rendered branches

**Catchy description:** Keep the warehouse artifact tiny, but make every promotion render full stage-specific manifests into stage branches so humans review the real output, not just a ref change.

## Detailed Technical Description of Plan
This plan keeps the release signal intentionally small: a single Git build-lock record in `k8s-gitops` identifies the exact `code-dot-org` commit and image tag to promote, but it does not store rendered manifests as Freight. Kargo uses that lock only as the release coordinate. The real work happens during promotion, where Kargo checks out the exact source commit, combines it with the latest GitOps environment policy, and writes stage-specific rendered output into `k8s-gitops` stage branches. Argo CD then deploys from those rendered branches, so the thing humans review is the actual manifest output that will hit the cluster.

The technical trick is that the plan supports both Helm and Kustomize without changing the release model. For Helm, promotion renders directly from `code-dot-org/k8s/helm` using values from `k8s-gitops/apps/codeai/envTypes/` and `apps/codeai/deployments/<deployment>/values.yaml`. For Kustomize, promotion starts from the checked-in `code-dot-org/k8s/kustomize/` tree plus the GitOps envType components and a reusable deploy-wrapper template in `k8s-gitops`; the wrapper is copied into a temp work dir, rewritten for the target deployment, and then built into the rendered branch. The important distinction is that Helm and Kustomize differ only in how the package is materialized at promotion time, not in how Freight is identified or how the stage branches are consumed.

The tricky parts are the ones that make the reviewable-output model honest. Promotion has to render from the exact promoted commit, not from the moving branch tip, and it has to write into a stage-specific branch/path that Argo can watch directly. `review-infra-changes` is the key control point: production output is rendered to a PR branch, reviewed as generated manifests, and only then merged into `stage/production`. That makes this plan fundamentally different from the thin-lock or source-snapshot families: the lock is tiny, but the review surface is the full rendered manifest tree, so the implementation must preserve a clean split between source checkout, GitOps policy, and generated output.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## What Freight Looks Like
This plan promotes a tiny Git lock file, then does the real rendering work
during promotion.

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

## Warehouse artifact
Same release record shape as Argo Refs code-dot-org Commit:

```text
warehouses/
  codeai/
    builds/
      current.yaml
      git-<full-commit-sha>.yaml
```

The lock file contains:
- `$gitcommit`
- image ref + digest
- packaging kind
- source path

The canonical lock-file schema lives in
[Git Build-Lock Freight Record](../modules/git-build-lock-freight-record.md)
and must be followed exactly.

## Freight
Freight is **Git-only** from `warehouses/codeai/builds/`.

The build lock is just the trigger. Promotion does the expensive work.

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Promotion pattern:
1. Clone `k8s-gitops` at the exact promoted Freight commit to `./freight`.
2. Clone `k8s-gitops` `main` to `./meta`.
3. Parse `./freight/warehouses/codeai/builds/current.yaml`.
4. Clone `code-dot-org` at `$gitcommit` to `./src`.
5. Clone the target stage branch to `./out`.
6. Render the stage’s manifests from source + env config.
7. Commit and push rendered output.
8. Let Argo CD deploy from the long-lived stage branch tip.

This is the closest CodeAI analogue to `kargo-advanced`.

## Stage-by-stage promotion flow
- `staging`: render manifests for the staging env and commit to a staging output branch/path
- `test`: render manifests for the test env from the same freight and run automated tests
- `levelbuilder`: render levelbuilder manifests from the same freight after `test`
- `review-infra-changes`: render production manifests to a generated branch and open a PR
- `production`: merge or fast-forward the reviewed rendered output

This model keeps freight stable but changes how each stage materializes it.

## Helm / Kustomize structure
This plan works with both Helm and Kustomize.

### Helm shape
Render from:
- `code-dot-org/k8s/helm`
- plus env values in `k8s-gitops/apps/codeai/...`

### Kustomize shape
Render from:
- `code-dot-org/k8s/kustomize/...`
- plus envType Components and render templates in `k8s-gitops`

The copied `apps/codeai/kargo/templates/deploy/kustomization.yaml` is a shared
contract for this plan family. Contractors should start from that canonical
wrapper and mutate it in place for the target deployment; they should not
invent plan-local wrapper contents.

### Suggested `k8s-gitops` addition

```text
apps/codeai/
  deployments/
    <deployment>/
      deployment.yaml
      values.yaml
  envTypes/
    <envType>/
  kargo/
    templates/
      deploy/
        kustomization.yaml
```

Argo apps should point at rendered stage paths or rendered stage branches.

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local Skaffold still uses source packaging in `code-dot-org`. Rendering happens only in Kargo promotion.

## Pros
- much stronger reviewability
- Argo deploys exactly what Kargo rendered
- supports both Helm now and Kustomize later
- maps closely to upstream Kargo’s rendered-branch pattern

## Cons
- more moving parts than Thin Lock
- requires rendered-output paths/branches and corresponding Argo changes
- stage output is derived, not hand-edited

## Migration notes
- Add rendered output locations and move Argo apps to them.
- Introduce `helm-template` or `kustomize-build` promotion steps.
- Add PR-based `review-infra-changes`.

## Additional implementation notes
- For Helm, prefer `helm-template` to render into a directory so diffs stay readable.
- For Kustomize, prefer `kustomize-build` with directory output.
- This is likely to score very highly on reviewability.

## Iteration 7 notes
- Keep this as the strongest explicit-control / rendered-review variant.
- This is the natural answer if the team wants strong PR review of real output without snapshotting the package into Freight.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/builds/`
- Add `apps/codeai/deployments/<deployment>/deploy/` on long-lived
  `stage/<deployment>` branches
- Add `apps/codeai/kargo/templates/deploy/kustomization.yaml` as the generic
  Kustomize temp-wrapper template copied into promotion work dirs
- Rewrite CodeAI stages to:
  - parse build lock
  - clone `code-dot-org` at `$gitcommit`
  - render stage manifests
  - commit rendered output
- Update Argo Applications to point at rendered output
- Add `review-infra-changes` PR stage

## `code-dot-org` changes
- Rewrite `k8s-commit-to-kargo-warehouse.yml` to write build locks only
- No required packaging-tree change for the first version

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
- [Git Build-Lock Freight Record](../modules/git-build-lock-freight-record.md)
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Live Source Checkout at Freight Commit](../modules/live-source-checkout-at-freight-commit.md)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan reuses:
- [Git Build-Lock Freight Record](../modules/git-build-lock-freight-record.md)
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
- [Live Source Checkout at Freight Commit](../modules/live-source-checkout-at-freight-commit.md)

## Helm implementation starting point

Treat the checked-in `code-dot-org/k8s/helm/` tree as the starting point, not a
frozen contract. The implementor may modify or reshape `k8s/helm/` if this plan
benefits from it, but should preserve current behavior unless the change
materially improves the plan.

## Kustomize implementation starting point

Treat the checked-in `code-dot-org/k8s/kustomize/` tree as the starting point,
not a frozen contract. The implementor may modify or reshape `k8s/kustomize/`
as needed for this plan, especially the base/components layout.

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

The Warehouse is the shared Git-only build-lock form. The interesting work in
this plan starts after the lock file is parsed.

## Hard parts

This plan has two real hard parts:

1. keep the promoted build-lock parse path deterministic with `current.yaml`
   while still preserving one historical `git-<full-commit-sha>.yaml` per release
2. check out the exact promoted `code-dot-org` commit sparsely enough that the
   huge monorepo does not make promotion too expensive

Both are shown explicitly below.

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
        name: codeai-builds
      sources:
        direct: true
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: sourceRepo
      value: https://github.com/code-dot-org/code-dot-org.git
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
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-builds')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: build-lock
          config:
            path: ./freight/warehouses/codeai/builds/current.yaml
            outputs:
              - name: releaseId
                fromExpression: releaseId
              - name: gitCommit
                fromExpression: gitCommit

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ ctx.stage }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ outputs['build-lock'].gitCommit }}
                path: ./src
                sparse:
                  - k8s/helm
                  - k8s/kustomize

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        # For Helm:
        - uses: helm-template
          config:
            path: ./src/k8s/helm
            releaseName: codeai
            outPath: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy
            valuesFiles:
              - ./meta/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}.values.yaml
              - ./meta/apps/codeai/deployments/${{ ctx.stage }}/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ outputs['build-lock'].releaseId }}

        - uses: git-commit
          config:
            path: ./out
            message: Render ${{ ctx.stage }} for ${{ outputs['build-lock'].releaseId }}

        - uses: git-push
          config:
            path: ./out
            branch: ${{ vars.targetBranch }}
```

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
        name: codeai-builds
      sources:
        direct: true
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: sourceRepo
      value: https://github.com/code-dot-org/code-dot-org.git
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
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-builds')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: build-lock
          config:
            path: ./freight/warehouses/codeai/builds/current.yaml
            outputs:
              - name: releaseId
                fromExpression: releaseId
              - name: gitCommit
                fromExpression: gitCommit

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ ctx.stage }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ outputs['build-lock'].gitCommit }}
                path: ./src
                sparse:
                  - k8s/kustomize

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        - uses: copy
          config:
            inPath: ./src/k8s/kustomize
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
                tag: ${{ outputs['build-lock'].releaseId }}

        - uses: kustomize-build
          config:
            path: ./work/deployments/${{ ctx.stage }}/deploy
            outPath: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        - uses: git-commit
          config:
            path: ./out
            message: Render ${{ ctx.stage }} for ${{ outputs['build-lock'].releaseId }}

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
        name: codeai-builds
      sources:
        stages:
          - test
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: sourceRepo
      value: https://github.com/code-dot-org/code-dot-org.git
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
    - name: targetBranch
      value: stage/production
    - name: renderDeployment
      value: production
    - name: renderPath
      value: apps/codeai/deployments/production/deploy
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: ${{ vars.gitopsRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-builds')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: build-lock
          config:
            path: ./freight/warehouses/codeai/builds/current.yaml
            outputs:
              - name: releaseId
                fromExpression: releaseId
              - name: gitCommit
                fromExpression: gitCommit

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ vars.renderDeployment }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ outputs['build-lock'].gitCommit }}
                path: ./src
                sparse:
                  - k8s/helm

        - uses: git-clear
          config:
            path: ./out/${{ vars.renderPath }}

        - uses: helm-template
          config:
            path: ./src/k8s/helm
            releaseName: codeai
            outPath: ./out/${{ vars.renderPath }}
            valuesFiles:
              - ./meta/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}.values.yaml
              - ./meta/apps/codeai/deployments/${{ vars.renderDeployment }}/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ outputs['build-lock'].releaseId }}

        - uses: git-commit
          config:
            path: ./out
            message: Review production render for ${{ outputs['build-lock'].releaseId }}

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
            title: Review CodeAI production render for ${{ outputs['build-lock'].releaseId }}

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
        name: codeai-builds
      sources:
        stages:
          - test
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: sourceRepo
      value: https://github.com/code-dot-org/code-dot-org.git
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
    - name: targetBranch
      value: stage/production
    - name: renderDeployment
      value: production
    - name: renderPath
      value: apps/codeai/deployments/production/deploy
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: ${{ vars.gitopsRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.gitopsRepo, warehouse('codeai-builds')).ID }}
                path: ./freight
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: yaml-parse
          as: build-lock
          config:
            path: ./freight/warehouses/codeai/builds/current.yaml
            outputs:
              - name: releaseId
                fromExpression: releaseId
              - name: gitCommit
                fromExpression: gitCommit

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./meta/apps/codeai/deployments/${{ vars.renderDeployment }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ outputs['build-lock'].gitCommit }}
                path: ./src
                sparse:
                  - k8s/kustomize

        - uses: git-clear
          config:
            path: ./out/${{ vars.renderPath }}

        - uses: copy
          config:
            inPath: ./src/k8s/kustomize
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
                tag: ${{ outputs['build-lock'].releaseId }}

        - uses: kustomize-build
          config:
            path: ./work/deployments/${{ vars.renderDeployment }}/deploy
            outPath: ./out/${{ vars.renderPath }}

        - uses: git-commit
          config:
            path: ./out
            message: Review production render for ${{ outputs['build-lock'].releaseId }}

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
            title: Review CodeAI production render for ${{ outputs['build-lock'].releaseId }}

        - uses: git-wait-for-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

The exact live-source sparse checkout pattern is still shared in
[Live Source Checkout at Freight Commit](../modules/live-source-checkout-at-freight-commit.md).

## GH runner sketch

The runner is the same thin build-lock writer used by Argo Refs code-dot-org Commit:

1. Build and stitch the image.
2. Publish immutable `git-<full-commit-sha>` tag.
3. Write `warehouses/codeai/builds/git-<full-commit-sha>.yaml`.
4. Do not render in CI.
5. Let Kargo do the rendering during promotion.

Helm and Kustomize are identical on the CI side; the workflow only emits image
tags and build-lock metadata, and the variants diverge later at promotion time
through `packaging.kind` and `sourcePath`.

That is the key difference from `Source Snapshot`: this plan keeps CI cheap and
pushes the expensive render/source read into Kargo promotion time.

### Testing Plan

Recommended automation:
- Extend [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or call a small reusable workflow from it for repo-specific contract and render smoke checks.
- Use existing Drone results on the promoted `gitCommit` as the app/unit/UI gate before downstream promotion.
- Use Kargo `verification` with `AnalysisTemplate`s for post-sync rollout/health/smoke checks in `test`.

Simple tests to automate:
- In `k8s.yml`, after the build-lock writeback step, parse `warehouses/codeai/builds/current.yaml` and `git-<full-commit-sha>.yaml` and fail unless they are schema-valid and identical.
- In the same workflow, check out `k8s-gitops` read-only and validate [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml) reads `apps/codeai/deployments/*/deployment.yaml` from `main` and deploys `apps/codeai/deployments/{{path.basename}}/deploy` from `stage/{{path.basename}}`.
- In the same workflow, validate every deployment dir on `main` has `deployment.yaml`, and that rendered-review plans reserve `deploy/` as the render target path.
- For the Helm variant, run `helm template` from [/Users/seth/.codex/worktrees/684f/code-dot-org/k8s/helm](/Users/seth/.codex/worktrees/684f/code-dot-org/k8s/helm) using deployment metadata from `apps/codeai/deployments/<deployment>/deployment.yaml`, envType values from `apps/codeai/envTypes/<envType>.values.yaml`, and deployment values from `apps/codeai/deployments/<deployment>/values.yaml`, writing to a temp `apps/codeai/deployments/<deployment>/deploy/` tree.
- For the Kustomize variant, run `kustomize build` from a temp tree assembled from the checked-in `k8s/kustomize/` source, `apps/codeai/envTypes/<envType>/` as a Component, any referenced `apps/codeai/envTypes/components/` subcomponents such as `autoscaling`, and a copied `apps/codeai/kargo/templates/deploy/` dir whose `kustomization.yaml` `namespace`, `resources`, and `components` fields are updated before `kustomize-set-image` rewrites `code-dot-org` to `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`. Do not use `k8s/kustomize/overlays` or `bin/` in production code paths.

Avoid as baseline coverage:
- A live Kargo controller harness whose main purpose is proving sparse checkout behaves inside the controller. If upstream later documents a first-class promotion-template test or preflight for this pattern, prefer that over custom harness code.
