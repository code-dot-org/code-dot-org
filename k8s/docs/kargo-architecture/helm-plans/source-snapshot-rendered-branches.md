# Source Snapshot (Helm) + Rendered Branches

**Short name:** Source snapshot + render

**Catchy description:** Freeze the deploy source package once per release, keep environment policy in GitOps, and let Kargo render stage-specific outputs from that frozen snapshot into reviewable rendered branches.

## Detailed Technical Description of Plan
This plan sits between live-source rendering and a richer OCI release artifact: CI freezes the deploy package once, writes that snapshot into `warehouses/codeai/freight/git-<full-commit-sha>/`, mirrors the exact same contents to `current/`, and then Kargo renders every downstream stage from that frozen release record. Promotion does not chase the moving `code-dot-org` branch tip. It reads `warehouses/codeai/freight/current/freight.yaml`, resolves the release identity and package type from there, and uses GitOps-side env policy to materialize the stage-specific output into a rendered branch. That gives you a release object that is still plain Git, still reviewable, and still easy to audit by path, but without the ambiguity of reconstructing release truth from live source during promotion.

The Helm form shares the same Freight contract and keeps the snapshot focused on chart source under `helm/`, so promotion is mostly `helm-template` plus the usual values files from `k8s-gitops`. The important implementation detail is that the snapshot stays literal while the stage branch becomes the only mutable review surface.

The tricky part is not the rendering step itself; it is keeping the snapshot contract disciplined. `current/` must remain an exact mirror of the historical `git-<full-commit-sha>/` directory in the same commit, because promotion reads only `current/` while humans and audit tooling may inspect the historical release directory. That makes this plan easier to reason about than the live-source plans, which must sparse-checkout the huge monorepo at the promoted commit, but less compact than the thin-lock family because it duplicates the deploy package into GitOps-adjacent Freight. In practice, this is the plan to choose when you want frozen release inputs and rendered-branch reviewability without introducing a second artifact system.

- **Type:** Helm
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## What Freight Looks Like
This plan promotes one frozen Git snapshot per release. The snapshot already contains the exact Helm chart source Kargo should render from.

```text
warehouses/codeai/freight/git-<full-commit-sha>/
  freight.yaml
  helm/
    Chart.yaml
    values.yaml
    templates/...
warehouses/codeai/freight/current/
  freight.yaml
  helm/
    Chart.yaml
    values.yaml
    templates/...
```

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packageType: helm
```

## Warehouse artifact
On each successful build, publish one freight directory:

```text
warehouses/
  codeai/
    freight/
      current/
        freight.yaml
        helm/
          Chart.yaml
          values.yaml
          templates/...
      git-<full-commit-sha>/
        freight.yaml
        helm/
          Chart.yaml
          values.yaml
          templates/...
```

Recommended `freight.yaml`:

```yaml
schemaVersion: v1
revision: <full-commit-sha>
tag: git-<full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packageType: helm
createdAt: 2026-03-22T12:34:56Z
```

Common rules:
- use `git-<full-commit-sha>` as the operator-facing release/tag shape
- keep the full 40-character SHA in structured metadata
- snapshot only the deploy package, not the whole monorepo
- keep env-specific policy out of the snapshot and in `k8s-gitops`
- do not mutate or normalize the package in CI; the snapshot is a literal source-package copy
- `packageType: helm` means the payload lives in `helm/`
- write both the historical `git-<full-commit-sha>/` directory and the stable `current/` directory in the same commit

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
3. Set the image reference to `ghcr.io/code-dot-org/code-dot-org` and the tag to the release ID from Freight.

## Stage-by-stage promotion flow
- `staging`: render staging output from the frozen package snapshot to `stage/staging`
- `test`: render test output from the same snapshot to `stage/test` and run automated tests
- `levelbuilder`: render levelbuilder output from the same snapshot after `test`
- `review-infra-changes`: render production output to a generated branch against `stage/production` and open a PR
- `production`: merge the reviewed production render, then sync Argo to `stage/production`

This is effectively the rendered-branches review model, but with a frozen source snapshot instead of a live-source read from `code-dot-org` during promotion.

## `review infra changes` stage behavior
This stage is the same across stages that use this plan:
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

## Proposed Helm directory structure
### `code-dot-org`

Helm keeps the checked-in chart as the deploy source of truth:

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

## Does it break or awkwardize Skaffold or local dev in any way?
No.

Common rule:
- local dev keeps using source packaging in `code-dot-org`
- the warehouse snapshot is only a CI/promotion artifact

Helm-specific note:
- Skaffold keeps using `code-dot-org/k8s/helm`

## Pros
- combines the strongest review model with a frozen, explicit release input
- avoids promotion-time reconstruction from the live monorepo
- keeps release truth legible in Git
- works with the Helm packaging model
- keeps the long-lived architecture clear without inventing extra artifact layers

## Cons
- duplicates the deploy package into `k8s-gitops`
- creates more Git storage churn than thin-lock plans
- requires rendered branch plumbing and Argo changes

Helm-specific downside:
- narrower and more transitional than the long-lived packaging model

## Migration notes
- This merged plan supersedes both the old `Immutable Package Snapshot + Rendered Branches` plan and the old `Source Snapshot` family plan.
- If the team wants the lowest-friction first form, start with the Helm-shaped source snapshot.
- The core architectural move is the same: freeze the source package once, keep env policy in GitOps, and render from the snapshot during promotion.

## Additional implementation notes
- Keep the image only in `freight.yaml`, not baked into copied source files.
- Prefer directory-rendered output over single-file output for PR readability.
- If Git storage churn later becomes painful, the next refinement to evaluate is storing the snapshot package in OCI while keeping the same architectural shape.

## Iteration 7 notes
- Keep the concrete `freight.yaml` contract with `packageType`, and make the payload directory match it.
- Keep this as the "copy the package into Freight" side of the comparison with [Argo Refs code-dot-org Commit](./argo-refs-code-dot-org-commit.md).
- Keep the legacy-gitflow gate module linked into this plan.

# Code changes
## `k8s-gitops` changes

### Common
- Add `warehouses/codeai/freight/`
- Add rendered stage branches and rendered output paths
- Rewrite CodeAI Kargo stages around snapshot-driven rendering
- Keep `review-infra-changes` as a PR gate on rendered output
- Point Argo apps at rendered stage branches using `apps/codeai/deployments/<deployment>/deploy`

### Helm-specific
- Keep env values and deployment metadata in `apps/codeai/...`
- Render from Helm snapshots using GitOps-side values

## `code-dot-org` changes

### Common
- Update the warehouse writeback workflow to snapshot the deploy package into the freight dir
- Stop direct environment writeback as the primary release mechanism

### Helm-specific
- Snapshot `k8s/helm` into `warehouses/codeai/freight/git-<full-commit-sha>/helm/`

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)
- [Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-reviewmd)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan reuses:
- [Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-reviewmd)
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)

## Helm implementation starting point

Treat the checked-in `code-dot-org/k8s/helm/` tree as the starting point, not a frozen contract. The implementor may modify or reshape `k8s/helm/` if this plan benefits from it, but should preserve current behavior unless the change materially improves the plan.

## `codeai/applicationset.yaml` sketch

This plan should keep using `apps/codeai/deployments/*/deployment.yaml` on `main` as the generator input, but Argo should deploy from the rendered `deploy/` dir on each stage branch:

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

Each Freight commit should introduce exactly one new `warehouses/codeai/freight/git-<full-commit-sha>/` directory and also refresh the stable `warehouses/codeai/freight/current/` mirror. Promotion reads only `current/`, while humans and audit tooling use the historical `git-<full-commit-sha>/` directories.

## Hard parts

The hard parts in this plan are:

1. keep the historical `git-<full-commit-sha>/` directory and the stable `current/` mirror identical in the same Freight commit
2. keep the frozen snapshot small and literal, without smuggling env-specific config into it

The first part is the actual implementation risk. Promotion-side lookup is made deterministic on purpose: Stages always read `warehouses/codeai/freight/current/`.

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

## GH runner sketch

This runner does more than the build-lock plans:

1. Build and stitch the app image.
2. Resolve the final image digest.
3. Check out `k8s-gitops` `main`.
4. Create `warehouses/codeai/freight/git-<full-commit-sha>/`.
5. Refresh `warehouses/codeai/freight/current/` with the same package contents.
6. Copy the full checked-in `code-dot-org/k8s/helm/` tree literally into `warehouses/codeai/freight/git-<full-commit-sha>/helm/`.
7. Write `freight.yaml` with `revision`, image ref/digest, and `packageType`.
8. Copy the same `freight.yaml` to `warehouses/codeai/freight/current/freight.yaml`.
9. Commit and push the historical directory and the `current/` mirror together.

This is the pivotal architectural move in the plan: freeze the deploy package once in CI, then promote only from that frozen package.

The promotion-time hardness is now explicit but simpler than a helper: the GH runner must keep the historical `git-<full-commit-sha>/` directory and the stable `current/` mirror identical in the same commit so Stages can always read:
- `warehouses/codeai/freight/current/freight.yaml`
- `warehouses/codeai/freight/current/helm/`

### Testing Plan

Recommended automation:
- Extend [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or call a small reusable workflow from it for repo-specific contract and render smoke checks.
- Use existing Drone results on the promoted `gitCommit` as the app/unit/UI gate before downstream promotion.
- Use Kargo `verification` with `AnalysisTemplate`s for post-sync rollout/health/smoke checks in `test`.

Simple tests to automate:
- In `k8s.yml`, after the snapshot-writing step, build the proposed `warehouses/codeai/freight/git-<full-commit-sha>/` directory in a temp workspace and fail unless `current/` is byte-for-byte identical to the historical directory.
- In the same workflow, parse `warehouses/codeai/freight/current/freight.yaml` and fail unless it contains `revision`, `tag`, `image.ref`, `image.digest`, `packageType`, and `createdAt`.
- For the Helm variant, run `helm template` from `warehouses/codeai/freight/current/helm` using deployment metadata from `apps/codeai/deployments/<deployment>/deployment.yaml`, envType values from `apps/codeai/envTypes/<envType>.values.yaml`, and deployment values from `apps/codeai/deployments/<deployment>/values.yaml`.
- In the same workflow, check out `k8s-gitops` read-only and validate [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml) deploys `apps/codeai/deployments/{{path.basename}}/deploy` from `stage/{{path.basename}}` and that every deployment metadata file carries `envType`.

# gate-promotion-on-legacy-gitflow-branches.md

# Gate Promotion On Legacy Gitflow Branches

**Short name:** Legacy gitflow gate

**Purpose:** During the coexistence period, do not let Kargo promote a release
to the next environment until the same `git-<full-commit-sha>` has already been merged
into the matching legacy gitflow branch.

This is a **module**, not a complete release architecture. It layers onto plans
that already have an explicit release identity and normal Kargo promotion flow.

## Detailed Technical Description of Module
This module is a coexistence gate, not a release-truth source. Its job is to
make Kargo promotion respect the legacy Gitflow branch narrative while the old
fleet and the k8s fleet run in parallel. The release itself still comes from
the consuming plan's Freight model, but before a downstream stage is allowed to
advance, the plan must prove that the same `git-<full-commit-sha>` has already
been merged into the corresponding legacy branch. That keeps the k8s rollout
from getting ahead of the legacy system's release progression signal.

The implementation deliberately uses per-branch metadata files under
`warehouses/codeai/legacy-gitflow/<env>/merged/` instead of scanning commit
history or inferring branch state from Freight. `current.yaml` records the
latest observed legacy branch tip, while `merged/git-<full-commit-sha>.yaml`
is the actual yes/no gate. A promotion step clones `k8s-gitops` `main`, reads
the legacy branch's `merged/` record at gate time, and fails fast if the file is
missing. That means the gate always reflects the current legacy branch state,
not only the frozen Freight checkout.

What makes this module different from the other shared modules is that it does
not tell a plan how to discover Freight or how to render manifests. It only
adds a pre-promotion dependency that must pass before the plan's normal sync,
verification, or review flow can continue. In practice, this means the module
is usually inserted near the top of a downstream promotion stage, before any
rendering work, so the plan can stop immediately if the matching legacy merge
record is absent.

## What this module is for

Use this when:
- the legacy fleet and the k8s fleet will run in parallel for a while
- the legacy system still treats merges into `staging`, `test`,
  `levelbuilder`, or `production` as the release progression signal
- you want k8s promotion to follow the same release narrative instead of
  drifting ahead or sideways

Do **not** use this as the only promotion gate. It complements normal
verification and review. It does not replace them.

## File layout

These files live alongside the plan's normal release metadata for convenience,
but they are **not Freight inputs**.

```text
warehouses/codeai/
  legacy-gitflow/
    staging/
      current.yaml
      merged/
        git-<full-commit-sha>.yaml
    test/
      current.yaml
      merged/
        git-<full-commit-sha>.yaml
    levelbuilder/
      current.yaml
      merged/
        git-<full-commit-sha>.yaml
    production/
      current.yaml
      merged/
        git-<full-commit-sha>.yaml
```

`current.yaml` answers:
- what revision is this legacy branch at right now?

`merged/git-<full-commit-sha>.yaml` answers:
- was this exact release ever merged into this legacy branch?

That second question is the real promotion gate.

## File contents

Recommended `current.yaml`:

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
mergedAt: 2026-03-22T12:34:56Z
```

Recommended `merged/git-<full-commit-sha>.yaml`:

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
mergedAt: 2026-03-22T12:34:56Z
```

Use the path to carry the target branch identity. Do not duplicate the branch
name inside each file.

## Why this layout is better than one flat directory

This is better than a single directory such as:

```text
legacy-gitflow/
  git-<full-commit-sha>.yaml
```

with `branch: test` inside the file because:
- promotion can check file existence directly:
  `legacy-gitflow/test/merged/git-<full-commit-sha>.yaml`
- no file scanning is required
- the path is already the environment/stage key
- `current.yaml` and `merged/` stay colocated per legacy branch

## How these files get written

GitHub Actions triggered by merges into the legacy branches should update them.

On merge into `test`, the workflow should:
1. write `legacy-gitflow/test/current.yaml`
2. write `legacy-gitflow/test/merged/git-<full-commit-sha>.yaml`

Do the same for `staging`, `levelbuilder`, and `production`.

## Important rule: do not make this a Warehouse subscription

These files may live under `warehouses/codeai/` because that is a convenient
place for release-adjacent metadata, but they should **not** be subscribed as
Freight.

Why:
- a legacy merge is not a new k8s release artifact
- gate decisions should read the latest observed legacy state
- if the gate read only the frozen Freight commit, it could miss later legacy
  merges and get stuck incorrectly

So the promotion step should read the current metadata repo head at gate time,
not only the Freight checkout.

## How the gate works

For a release with tag `git-0cc4cd87f40ae606d1822d5652b552f8c50a4668`:

- `staging -> test` requires:
  `legacy-gitflow/test/merged/git-0cc4cd87f40ae606d1822d5652b552f8c50a4668.yaml`
- `test -> levelbuilder` requires:
  `legacy-gitflow/levelbuilder/merged/git-0cc4cd87f40ae606d1822d5652b552f8c50a4668.yaml`
- `review-infra-changes -> production` or `test -> production` requires:
  `legacy-gitflow/production/merged/git-0cc4cd87f40ae606d1822d5652b552f8c50a4668.yaml`

This means:
- k8s can lag legacy without getting stuck forever
- older releases still pass if they were merged earlier
- the gate is based on historical merge fact, not only current branch head

## Relationship to normal test verification

This module does **not** replace the plan's normal `test` stage verification.

Plans using this module should still:
- sync `test`
- run Drone unit tests
- run Drone UI tests
- run Kargo or cluster smoke checks

Downstream promotion should require both:
- the same release passed `test` verification
- the matching legacy branch has a `merged/git-<full-commit-sha>.yaml` record

## Where this fits in a plan

This module is best described as:
- a migration-era coexistence gate
- a downstream-stage promotion rule
- an overlay on top of the plan's real Freight/release architecture

It is **not**:
- a packaging model
- a Freight shape
- a replacement for rendered Git review

## Iteration 5 compatibility

Compatible live iteration 5 plans:
- [Common-Case Freight + Rendered Branches](../iteration-5/common-case-rendered-branches.md)
- [GitOps Truth with Generated Mirror](../iteration-5/gitops-truth-generated-mirror.md)
- [Helm Source Snapshot](../iteration-5/helm-source-snapshot.md)
- [Image Provenance + Rendered Branches](../iteration-5/image-provenance-rendered-branches.md)
- [ Base Snapshot](../iteration-5/-base-snapshot.md)
- [ Split Overlays](../iteration-5/-split-overlays.md)
- [Multi-Warehouse Base + Overlay](../iteration-5/multi-warehouse-base-overlay.md)
- [OCI Package Pair (Helm or ) + Rendered Branches](../iteration-5/oci-package-pair-rendered-branches.md)
- [Rendered Branches from a Thin Lock](../iteration-5/rendered-branches.md)
- [Pre-Rendered Release Bundle](../iteration-5/rendered-release-bundle.md)
- [Source Snapshot (Helm or ) + Rendered Branches](../iteration-5/source-snapshot-rendered-branches.md)
- [Thin Build Lock](../iteration-5/thin-build-lock.md)

Incompatible live iteration 5 plans:
- none

# Sketch of Pivotal Implementation Details

## Metadata files written by legacy-branch workflows

```text
warehouses/codeai/legacy-gitflow/
  staging/
    current.yaml
    merged/git-<full-commit-sha>.yaml
  test/
    current.yaml
    merged/git-<full-commit-sha>.yaml
  levelbuilder/
    current.yaml
    merged/git-<full-commit-sha>.yaml
  production/
    current.yaml
    merged/git-<full-commit-sha>.yaml
```

Suggested `current.yaml`:

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
mergedAt: 2026-03-22T12:34:56Z
```

Suggested `merged/git-<full-commit-sha>.yaml`:

```yaml
revision: <full-commit-sha>
tag: git-<full-commit-sha>
mergedAt: 2026-03-22T12:34:56Z
```

## Concrete shared gate check contract

This module should be implemented the same way in every consuming plan:

- clone `k8s-gitops` `main` to `./gate`
- set `legacyEnv` to the downstream legacy branch name
- set `releaseTag` to the release being promoted, for example `git-<full-commit-sha>`
- parse:
  `./gate/warehouses/codeai/legacy-gitflow/${{ vars.legacyEnv }}/merged/${{ vars.releaseTag }}.yaml`
- if that file is missing, `yaml-parse` fails and the promotion stops
- if the file exists, expose:
  - `revision`
  - `tag`
  - `mergedAt`

The cleanest place to run this is near the start of the downstream promotion
Stage, before any render or sync work.

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: review-infra-changes
  namespace: kargo-project-codeai
spec:
  vars:
    - name: legacyEnv
      value: production
    - name: releaseTag
      value: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: https://github.com/code-dot-org/k8s-gitops.git
            checkout:
              - branch: main
                path: ./gate

        - uses: yaml-parse
          as: legacy-merge
          config:
            path: ./gate/warehouses/codeai/legacy-gitflow/${{ vars.legacyEnv }}/merged/${{ vars.releaseTag }}.yaml
            outputs:
              - name: revision
                fromExpression: revision
              - name: tag
                fromExpression: tag
              - name: mergedAt
                fromExpression: mergedAt
```

There is no plan-specific glue here. Missing file means terminal gate failure.
Existing file means the gate has passed and the consuming plan may continue.

## GH runner sketch

This module needs one lightweight metadata writer flow for the legacy branches.

On merge into `staging`, `test`, `levelbuilder`, or `production`, the GH
workflow should:

1. Derive `git-<full-commit-sha>` from the merged commit SHA.
2. Check out `k8s-gitops` `main`.
3. Write `warehouses/codeai/legacy-gitflow/<branch>/current.yaml`.
4. Write `warehouses/codeai/legacy-gitflow/<branch>/merged/git-<full-commit-sha>.yaml`.
5. Commit and push those metadata files.

This is intentionally not Freight publication. It is only release-adjacent gate
metadata.

# rendered-stage-branches-and-pr-review.md

# Rendered Stage Branches and PR Review

**Short name:** Rendered branch review

**Purpose:** Reuse one common GitOps and Kargo shape for plans that want humans
to review rendered output instead of only ref changes.

## Detailed Technical Description of Module
This module defines the rendered-output half of the release system. Its job is
to make `k8s-gitops` hold two different kinds of truth at the same time without
confusing them: `main` keeps deployment metadata, environment policy, and any
shared render templates, while `stage/<deployment>` branches hold the generated
manifest output that Argo CD actually deploys. The important design point is
that the review surface is no longer “did a ref move?” but “did the rendered
deployment tree change the way we expected?” That makes the module a review
mechanism, not a Freight mechanism.

The implementation hinge is the `apps/codeai/deployments/<deployment>/deploy/`
path. On `main`, that path name may describe a
template directory that promotion copies into a temp workspace; on
`stage/*`, the same path name refers to generated output. The module therefore
requires each plan to be explicit about what is source-owned versus what is
rendered. Kargo reads deployment metadata from `main`, renders into the stage
branch, opens a PR for `review-infra-changes`, and only then lets production
advance. The tricky part is keeping the branch-local output shape stable so
Argo can deploy it directly while still allowing plans to vary in how the
render step assembles Helm or  inputs.

What makes this module different from the build-lock, live-source-checkout, and
gate modules is that it owns the output contract, not the release identity or
the source checkout mechanics. Those other modules answer “what release is
this?” or “where does source come from?” This one answers “where does rendered
truth live, and how do humans review it safely?” If a plan uses this module
correctly, the implementor can change the rendering strategy later without
changing the core GitOps review model.

This module is shared by:
- Common-Case Freight + Rendered Branches
- Source Snapshot (Helm ) + Rendered Branches
- Rendered Branches from a Thin Lock
- OCI Release Capsule

## Branch layout

```text
stage/staging
stage/test
stage/levelbuilder
stage/production
```

Each branch contains the rendered deployment output, typically rooted at:

```text
apps/codeai/deployments/<deployment>/deploy/
```

## `k8s-gitops` layout this module assumes

`main` should keep environment policy and Kargo/Argo metadata, while rendered
stage branches keep generated deploy output.

Common shape on `main`:

```text
apps/codeai/
```

Helm-shaped plans typically keep:

```text
apps/codeai/
  envTypes/
    <envType>.values.yaml
  deployments/
    <deployment>/
      deployment.yaml
      values.yaml
```

-shaped plans typically keep:

```text
apps/codeai/
  envTypes/
    <envType>/
  deployments/
    <deployment>/
      deployment.yaml
  kargo/
    templates/
      deploy/
        kustomization.yaml
```

For -shaped rendered plans, `main` keeps deployment metadata, env
policy, and any reusable temp-wrapper templates such as
`apps/codeai/kargo/templates/deploy/`. The rendered `deploy/` tree exists only
on `stage/*`, where it is generated output that Argo deploys.

Rendered stage branches typically keep:

```text
apps/codeai/deployments/<deployment>/deploy/
```

## Argo ApplicationSet sketch

The common move is: Argo should deploy rendered output from `k8s-gitops`, not
render live source itself. To avoid losing namespace/env metadata, keep using
the existing `apps/codeai/deployments/*/deployment.yaml` files on `main` as the
generator source. `{{path.basename}}` is the deployment name; `{{envType}}`
comes from the generated `deployment.yaml`.

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
      labels:
        app.kubernetes.io/managed-by: kargo
        kargo.akuity.io/project: kargo-project-codeai
    spec:
      project: default
      sources:
        - repoURL: https://github.com/code-dot-org/k8s-gitops.git
          targetRevision: stage/{{path.basename}}
          path: apps/codeai/deployments/{{path.basename}}/deploy
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - ServerSideApply=true
```

The exact labels/project can vary, but the important shift is:
- rendered branches become deploy truth
- `main` stays env-policy / metadata / Kargo config
- branch-local rendered output stays at `apps/codeai/deployments/<deployment>/deploy/`

One prerequisite is non-optional:
- every managed deployment must have a real
  `apps/codeai/deployments/<deployment>/deployment.yaml` file on `main`
- if `levelbuilder` and `production` still use `.disabled` placeholders,
  rename them before switching to this ApplicationSet shape

## Common `review-infra-changes` Stage sketch

This is the shared review gate pattern. Each consuming plan must provide its
own `requestedFreight` block and render inputs.

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: review-infra-changes
  namespace: kargo-project-codeai
spec:
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
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
              - branch: main
                path: ./src
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: git-clear
          config:
            path: ./out/${{ vars.renderPath }}

        # Plan-specific render logic goes here and should:
        # 1. read production deployment policy, not ctx.stage
        # 2. write only under ./out/${{ vars.renderPath }}

        - uses: git-commit
          config:
            path: ./out
            message: Review ${{ vars.renderDeployment }} render for PR

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
            title: Review ${{ vars.renderDeployment }} render

        - uses: git-wait-for-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

## What varies plan-to-plan

This module does not define Freight or rendering inputs. Each plan decides:
- where Freight comes from
- the exact `requestedFreight` block
- whether render input is live source, a frozen Git snapshot, or an OCI capsule
- whether the render engine is Helm or 
- whether staging/test sync directly after push or through a separate approval step
