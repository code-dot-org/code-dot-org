# Rendered Branches from a Thin Lock

**Short name:** Rendered branches

**Catchy description:** Keep the warehouse artifact tiny, but make every promotion render full stage-specific manifests into stage branches so humans review the real output, not just a ref change.

## Detailed Technical Description of Plan
This plan keeps the release signal intentionally small: a single Git build-lock record in `k8s-gitops` identifies the exact `code-dot-org` commit and image tag to promote, but it does not store rendered manifests as Freight. Kargo uses that lock only as the release coordinate. The real work happens during promotion, where Kargo checks out the exact source commit, combines it with the latest GitOps environment policy, and writes stage-specific rendered output into `k8s-gitops` stage branches. Argo CD then deploys from those rendered branches, so the thing humans review is the actual manifest output that will hit the cluster.

This plan is Helm-only. Promotion renders directly from `code-dot-org/k8s/helm` using values from `k8s-gitops/apps/codeai/envTypes/` and `apps/codeai/deployments/<deployment>/values.yaml`. The important distinction is that the release identity stays tiny and stable while the rendered manifest tree becomes the review surface at promotion time.

The tricky parts are the ones that make the reviewable-output model honest. Promotion has to render from the exact promoted commit, not from the moving branch tip, and it has to write into a stage-specific branch/path that Argo can watch directly. `review-infra-changes` is the key control point: production output is rendered to a PR branch, reviewed as generated manifests, and only then merged into `stage/production`. That makes this plan fundamentally different from the thin-lock or source-snapshot families: the lock is tiny, but the review surface is the full rendered manifest tree, so the implementation must preserve a clean split between source checkout, GitOps policy, and generated output.

- **Type:** Helm
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## What Freight Looks Like
This plan promotes a tiny Git lock file, then does the real rendering work during promotion.

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
  kind: helm
  sourcePath: k8s/helm
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
[Git Build-Lock Freight Record](#git-build-lock-freight-recordmd)
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

## Helm structure
This plan works with Helm.

### Helm shape
Render from:
- `code-dot-org/k8s/helm`
- plus env values in `k8s-gitops/apps/codeai/...`

### Suggested `k8s-gitops` addition

```text
apps/codeai/
  deployments/
    <deployment>/
      deployment.yaml
      values.yaml
  envTypes/
    <envType>.values.yaml
```

Argo apps should point at rendered stage paths or rendered stage branches.

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local Skaffold still uses source packaging in `code-dot-org`. Rendering happens only in Kargo promotion.

## Pros
- much stronger reviewability
- Argo deploys exactly what Kargo rendered
- maps closely to upstream Kargo’s rendered-branch pattern

## Cons
- more moving parts than Thin Lock
- requires rendered-output paths/branches and corresponding Argo changes
- stage output is derived, not hand-edited

## Migration notes
- Add rendered output locations and move Argo apps to them.
- Introduce `helm-template` promotion steps.
- Add PR-based `review-infra-changes`.

## Additional implementation notes
- For Helm, prefer `helm-template` to render into a directory so diffs stay readable.
- This is likely to score very highly on reviewability.

## Iteration 7 notes
- Keep this as the strongest explicit-control / rendered-review variant.
- This is the natural answer if the team wants strong PR review of real output without snapshotting the package into Freight.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/builds/`
- Add `apps/codeai/deployments/<deployment>/deploy/` on long-lived
  `stage/<deployment>` branches
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
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)
- [Git Build-Lock Freight Record](#git-build-lock-freight-recordmd)
- [Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-reviewmd)
- [Live Source Checkout at Freight Commit](#live-source-checkout-at-freight-commitmd)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan reuses:
- [Git Build-Lock Freight Record](#git-build-lock-freight-recordmd)
- [Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-reviewmd)
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)
- [Live Source Checkout at Freight Commit](#live-source-checkout-at-freight-commitmd)

## Helm implementation starting point

Treat the checked-in `code-dot-org/k8s/helm/` tree as the starting point, not a
frozen contract. The implementor may modify or reshape `k8s/helm/` if this plan
benefits from it, but should preserve current behavior unless the change
materially improves the plan.

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

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

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

The exact live-source sparse checkout pattern is still shared in
[Live Source Checkout at Freight Commit](#live-source-checkout-at-freight-commitmd).

## GH runner sketch

The runner is the same thin build-lock writer used by Argo Refs code-dot-org Commit:

1. Build and stitch the image.
2. Publish immutable `git-<full-commit-sha>` tag.
3. Write `warehouses/codeai/builds/git-<full-commit-sha>.yaml`.
4. Do not render in CI.
5. Let Kargo do the rendering during promotion.

The workflow only emits image tags and build-lock metadata; the rendered branch is produced later by promotion.

That is the key difference from `Source Snapshot`: this plan keeps CI cheap and pushes the expensive render/source read into Kargo promotion time.

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

Avoid as baseline coverage:
- A live Kargo controller harness whose main purpose is proving sparse checkout behaves inside the controller. If upstream later documents a first-class promotion-template test or preflight for this pattern, prefer that over custom harness code.

# git-build-lock-freight-record.md
# Git Build-Lock Freight Record

**Short name:** Build-lock freight

**Purpose:** Reuse one tiny Git release record shape across plans that want
Kargo to discover Freight from `k8s-gitops`, but do the real deployment work
later.

## Detailed Technical Description of Module
This module is the smallest possible release contract for the thin-lock family:
it says, in Git, exactly which `code-dot-org` commit and image digest Kargo
should promote, and nothing more. The file is not a rendered manifest, not a
snapshot of the package, and not a deployment target. It is a release witness.
That distinction matters because the downstream plan is free to decide whether
the promoted release will later mutate Helm values or render full stage output.
The build-lock itself stays intentionally boring so
the promotion logic can be deterministic and easy to audit.

The module uses two paths for the same payload on purpose. `git-<full-commit-sha>.yaml`
is the immutable historical record, while `current.yaml` is the stable parse
path Kargo reads at promotion time. The key implementation detail is that CI
must write both files atomically in one commit, because promotion should never
have to guess whether `current.yaml` and the historical lock disagree. That
makes the module different from the rendered-review module, which owns output
branches, and from the live-source checkout module, which owns how to fetch the
source tree once the lock has already identified it.

The other subtlety is that this module deliberately carries just enough extra
metadata to let a downstream plan choose the right deployment strategy without
changing Freight shape. `packaging.kind` and `sourcePath` are not the release
record itself; they are hints for the stage that consumes it. A plan can use
those hints to decide whether to update Helm refs or render source into a
branch, but the shared contract remains the same: one exact source commit, one
exact image, one stable `current.yaml` parse path.

This module is shared by:
- Argo Refs code-dot-org Commit
- Rendered Branches from a Thin Lock

## Canonical file paths

```text
warehouses/codeai/builds/
  current.yaml
  git-<full-commit-sha>.yaml
```

## Recommended file contents

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packaging:
  kind: helm
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/helm
createdAt: 2026-03-22T12:34:56Z
```

Use this as the lowest-common-denominator contract:
- `gitCommit` is the real source identity
- `image.ref` and `image.digest` pin the built image
- `packaging.kind` tells the stage whether it should later run Helm
- `sourcePath` tells the stage where to clone/render from if it needs live source

## Warehouse sketch

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai-builds
  namespace: kargo-project-codeai
spec:
  subscriptions:
    - git:
        repoURL: https://github.com/code-dot-org/k8s-gitops.git
        branch: main
        includePaths:
          - warehouses/codeai/builds
```

This keeps Freight discovery:
- deterministic
- Git-native
- independent of Argo env files

Both files carry the same schema:
- `git-<full-commit-sha>.yaml` is the historical audit record
- `current.yaml` is the stable promotion-time parse path

`current.yaml` is intentionally not treated as a dangerous mutable "latest"
pointer because promotion always checks out an exact promoted Git Freight
commit. The promoted commit pins the exact `current.yaml` contents.

## GH runner sketch

This is the shared CI shape for build-lock plans:

1. Build and publish the app image tagged `git-<full-commit-sha>`.
2. Resolve the final pushed image digest after the multiplatform image exists.
3. Check out `k8s-gitops` `main`.
4. Write `warehouses/codeai/builds/git-<full-commit-sha>.yaml`.
5. Copy the same contents to `warehouses/codeai/builds/current.yaml`.
6. Commit and push both files in the same commit.

In practice, this means the current
`k8s-commit-to-kargo-warehouse.yml` workflow stops editing
`apps/codeai/deployments/*/values.yaml` and starts writing this build-lock file
instead.

## Hard part: keep history and the stable parse path in sync

The tricky part is no longer promotion-time lookup. It is making the CI write
path explicit enough that an implementation agent does not accidentally update
the historical file and `current.yaml` in different commits.

The required rule is:

1. CI writes `git-<full-commit-sha>.yaml` and `current.yaml` atomically in one commit.
2. Promotion only parses `warehouses/codeai/builds/current.yaml`.
3. Humans and audit tooling read `git-<full-commit-sha>.yaml`.

That is the implementation tradeoff:
- keep the historical per-release file for legibility
- add one stable path so promotion does not need unsupported custom Kargo steps

One more rule is just as important:

1. read `current.yaml` from an exact checkout of the promoted Freight commit
2. make mutable GitOps edits against a separate checkout of `main`

Do not branch or push from the promoted Freight commit directly. That would
turn older promotions into stale-base Git edits instead of replaying the chosen
release onto the latest writable GitOps branch.

## What varies plan-to-plan

The build-lock record is intentionally boring. What changes by plan is what the
promotion stage does after parsing it:

- Argo Refs code-dot-org Commit (Helm variant): update env refs only
- Rendered Branches from a Thin Lock: clone source, render, and commit output

# gate-promotion-on-legacy-gitflow-branches.md
# Gate Promotion On Legacy Gitflow Branches

**Short name:** Legacy gitflow gate

**Purpose:** During the coexistence period, do not let Kargo promote a release
to the next environment until the same `git-<full-commit-sha>` has already
been merged into the matching legacy gitflow branch.

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
- [Multi-Warehouse Base + Overlay](../iteration-5/multi-warehouse-base-overlay.md)
- [OCI Package Pair + Rendered Branches](../iteration-5/oci-package-pair-rendered-branches.md)
- [Rendered Branches from a Thin Lock](../iteration-5/rendered-branches.md)
- [Pre-Rendered Release Bundle](../iteration-5/rendered-release-bundle.md)
- [Source Snapshot + Rendered Branches](../iteration-5/source-snapshot-rendered-branches.md)
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
path. On `main`, that path name may describe authored inputs or a template
directory that promotion copies into a temp workspace; on `stage/*`, the same
path name refers to generated output. The module therefore requires each plan to
be explicit about what is source-owned versus what is rendered. Kargo reads
deployment metadata from `main`, renders into the stage branch, opens a PR for
`review-infra-changes`, and only then lets production advance.

What makes this module different from the build-lock, live-source-checkout, and
gate modules is that it owns the output contract, not the release identity or
the source checkout mechanics. Those other modules answer “what release is
this?” or “where does source come from?” This one answers “where does rendered
truth live, and how do humans review it safely?” If a plan uses this module
correctly, the implementor can change the rendering strategy later without
changing the core GitOps review model.

This module is shared by:
- Common-Case Freight + Rendered Branches
- Source Snapshot + Rendered Branches
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
- whether staging/test sync directly after push or through a separate approval step

# live-source-checkout-at-freight-commit.md
# Live Source Checkout at Freight Commit

**Short name:** Live source checkout

**Purpose:** Reuse the exact promotion-time checkout pattern for plans that
render from the real `code-dot-org` repository instead of from a frozen package
snapshot.

## Detailed Technical Description of Module
This module is the shared promotion-time source checkout contract for plans
that render from live `code-dot-org` source. Its job is narrowly defined: take
an already-chosen release identity, resolve the exact source commit behind it,
and clone only the packaging tree needed for rendering. The module is not about
Freight discovery, and it is not about rendered-output storage. It exists to
make sure Kargo renders from the exact promoted commit instead of the moving
branch tip, while keeping the checkout small enough that the huge monorepo does
not become the bottleneck.

The key implementation detail is the separation between commit resolution and
checkout shape. A consuming plan must provide `sourceCommit` from its own
Freight model, then use Kargo's `git-clone` step with an exact commit checkout
plus sparse paths. For Helm that means narrowing the sparse checkout to
`k8s/helm`. The rendered-output branch checkout, if present, still comes from
`k8s-gitops` and is a separate concern. That split is what keeps the module
reusable: one plan may feed `sourceCommit` from a build-lock file, another may
feed it from live Freight discovery, but both use the same checkout mechanics
once the commit is known.

The tricky part is that this module only works if the consuming plan is strict
about provenance. If `sourceCommit` comes from the wrong branch, or if the
sparse checkout includes the wrong packaging tree, the render step can still
succeed while producing the wrong manifests. So the module's real rule is not
just "use sparse checkout"; it is "resolve the exact promoted commit first, then
render only the packaging subtree that belongs to that release." That makes it
different from the build-lock module, which defines how Freight is recorded,
and different from the rendered-branch module, which defines where the output
ends up after rendering.

This module is shared by:
- Common-Case Freight + Rendered Branches
- Rendered Branches from a Thin Lock

## Why this is the hard part

These plans are only sane if promotion reads the **exact promoted source
commit**, not the moving branch tip, while also avoiding a full clone of the
giant monorepo.

Fortunately, Kargo's `git-clone` step supports both:
- exact `checkout[].commit`
- exact `checkout[].sparse`

So the right shape is:
- resolve the exact source commit first
- sparse check out only the packaging tree that render needs

## Generic checkout sketch

```yaml
- uses: git-clone
  config:
    repoURL: ${{ vars.sourceRepo }}
    checkout:
      - as: source
        commit: ${{ vars.sourceCommit }}
        path: ./src
        sparse:
          - k8s/helm
```

In practice:
- `vars.sourceCommit` comes from the build-lock helper or from Git Freight
  itself
- for Helm-first phases, sparse checkout can be narrowed to just `k8s/helm`
- the rendered-output branch checkout still comes from the separate
  `k8s-gitops` clone described in
  [Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-reviewmd)

## Plan-specific source-commit inputs

Rendered Branches from a Thin Lock:

```yaml
vars:
  - name: sourceCommit
    value: ${{ outputs['build-lock'].gitCommit }}
```

Common-Case Freight + Rendered Branches:

```yaml
vars:
  - name: sourceCommit
    value: ${{ commitFrom(vars.sourceRepo, warehouse("codeai")).ID }}
```

## Why this should stay a module

The checkout mechanics are identical. What differs between plans is only:
- where `sourceCommit` comes from
- whether the plan has synthetic Freight writeback at all
