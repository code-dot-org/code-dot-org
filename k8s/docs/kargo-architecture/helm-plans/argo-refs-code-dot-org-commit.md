# Argo Refs code-dot-org Commit

**Short name:** Argo refs commit

**Catchy description:** Write one tiny release record to `warehouses/codeai/`,
then let Argo CD deploy Helm source pinned to a `code-dot-org`
commit.

## Detailed Technical Description of Plan
This plan is the simplest source-driven Kargo design in iteration 7. Kargo does
not snapshot a release package or render review output into Freight; instead it
promotes a tiny Git build-lock record from `k8s-gitops` that names one exact
`code-dot-org` commit and one exact image tag/digest. The build-lock is the
release record, and `current.yaml` is just a stable parse path to that same
record. The whole point is to keep Freight small, deterministic, and easy to
audit while still letting the real deploy source live in `code-dot-org`.

In the Helm variant, Argo points directly at `code-dot-org`
`k8s/helm` at the pinned commit and uses `k8s-gitops` only for env values and
deployment metadata. The build-lock file and the deployment refs must stay in
sync, the GH action must keep the image tag and the lock file in sync, and
Kargo confirms `packaging.kind: helm` and `sourcePath: k8s/helm` before it
mutates GitOps.

- **Type:** Source-driven plan family
- **Pattern:** Source-driven
- **Rendered manifests pattern:** No

## Shared architecture summary
This is a Helm-only plan family.

The release identity model is:

- Kargo promotes a thin Git build-lock record from `k8s-gitops`
- that build lock pins the image and the real `code-dot-org` commit
- Argo later deploys source-oriented truth that ultimately points at that
  commit, instead of Kargo snapshotting or rendering the package into Git

The key distinction is:

- **Helm variant:** Argo entrypoint is `code-dot-org` at a pinned commit.

Pick this implementation path for the first pass; do not add a second packaging
model in this file.

## What Freight Looks Like
This plan promotes only a tiny Git lock file. Kargo never snapshots the package
itself; it promotes one release record that pins the real source commit and
image.

Canonical Freight shape:

```text
warehouses/codeai/builds/
  current.yaml
  git-<full-commit-sha>.yaml
```

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

The exact same schema is stored in:

- `git-<full-commit-sha>.yaml` for historical auditability
- `current.yaml` for a stable promotion-time parse path

## Warehouse artifact
On each successful `staging` build, the GH action writes:

```text
warehouses/
  codeai/
    builds/
      current.yaml
      git-<full-commit-sha>.yaml
```

The file is intentionally small and reviewable. It is the only Warehouse input
for this plan family.

## Freight
Freight is **Git-only**.

The CodeAI Warehouse watches:

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

Each new `git-<full-commit-sha>.yaml` commit becomes a new piece of Freight.

Pros:
- extremely simple
- Warehouse discovery is fast and deterministic
- `$gitcommit` is the single release coordinate

Cons:
- Kargo does not natively know about the image repo or packaging repo
- rendered manifest diffs are not first-class unless added later

## Shared Kargo project
Stages:
- `staging`: direct from Warehouse
- `test`: from `staging`, then automated tests
- `levelbuilder`: from `test`
- `review-infra-changes`: from `test`, PR-oriented gate for production changes
- `production`: from `review-infra-changes`

Shared promotion behavior:
1. Clone `k8s-gitops` at the exact promoted Freight commit to a read-only path
   such as `./freight`.
2. Clone `k8s-gitops` `main` to a writable path such as `./gitops`.
3. Parse `./freight/warehouses/codeai/builds/current.yaml`.
4. Update the target deployment to point at the promoted `gitCommit` and image.
5. Commit and push.

`review-infra-changes` should push to a generated branch and open a PR instead
of pushing directly to `main`.

## Stage-by-stage promotion flow
- `staging`: promote the chosen `gitCommit` and image into the staging
  deployment target
- `test`: copy the exact same release into the test deployment target, then run
  automated checks
- `levelbuilder`: copy the same release after `test`
- `review-infra-changes`: prepare the production update on a PR branch
- `production`: merge or apply the already-reviewed production update

`test` is where automated checks run. The release should not advance to
`levelbuilder` or `review-infra-changes` until those checks pass.

## Shared GH runner sketch
The GH action is intentionally small for the Helm path:

1. Build and stitch the multiplatform image.
2. Keep publishing immutable `git-<full-commit-sha>` tags.
3. Write `warehouses/codeai/builds/git-<full-commit-sha>.yaml`.
4. Copy the same contents to `warehouses/codeai/builds/current.yaml`.
5. Commit and push both files together.

The hard part is keeping the stable alias and the historical file identical in
the same commit.

## Shared testing and gating summary
Recommended automation:
- Extend [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or call a small reusable workflow from it for repo-specific contract and smoke checks.
- Use existing Drone results on the promoted `gitCommit` as the app/unit/UI
  gate before downstream promotion.
- Use Kargo `verification` with `AnalysisTemplate`s for lightweight post-sync
  rollout, health, and smoke checks where that fits the variant.

Simple shared tests to automate:
- In `k8s.yml`, after the workflow step that writes
  `warehouses/codeai/builds/`, generate the proposed `current.yaml` and
  `git-<full-commit-sha>.yaml`, parse both, and fail unless they have identical contents.
- In the same workflow, assert the produced image tag matches `git-<full-commit-sha>` and
  the lock file `image.ref` uses that same tag.

This plan family also reuses
[Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)
for migration-era gating.

## Shared core tradeoff
This is the core tradeoff of the whole family:

- Argo deploys source-oriented truth that points at a pinned
  `code-dot-org` commit
- Kargo promotes a tiny release record instead of rendered output

That makes the plan simple and migration-friendly, but less reviewable than the
rendered-branch plans.

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)
- [Git Build-Lock Freight Record](#git-build-lock-freight-recordmd)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan reuses:
- [Git Build-Lock Freight Record](#git-build-lock-freight-recordmd)
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)

This plan:
- promotes the same thin build-lock Freight
- parses the same stable `current.yaml` path
- relies on the same stage ladder and GH runner shape
- deploys Helm refs after that lock is parsed

## Helm implementation starting point

Treat the checked-in `code-dot-org/k8s/helm/` tree as the starting point, not a
frozen contract. The implementor may modify or reshape `k8s/helm/` if this plan
benefits from it, but should preserve current behavior unless the change
materially improves the plan.

## Shared Warehouse sketch

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

## Shared hard part

The hard part in this plan family is no longer lookup. It is keeping the
historical `git-<full-commit-sha>.yaml` file and the stable `current.yaml` parse path
identical in one commit, while still replaying promotions onto writable
`k8s-gitops` `main`.

The build-lock contract is:

- Helm stages are only valid when the lock says `packaging.kind: helm` and
  `packaging.sourcePath: k8s/helm`

For iteration 7, enforce that with repo contract tests in `k8s.yml` instead of
inventing a custom pre-mutation Kargo helper just for this family.

## Helm variant
This is the lower-migration variant.

### `code-dot-org`
No structural change is required for the first implementation.

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

### `k8s-gitops`
Keep:

```text
apps/codeai/deployments/<deployment>/
  deployment.yaml
  values.yaml
```

Add:

```text
warehouses/codeai/builds/
  current.yaml
  git-<full-commit-sha>.yaml
```

### Concrete file examples

#### Changed existing file: `apps/codeai/deployments/<deployment>/deployment.yaml`

This variant should rename the existing `branch` key to `targetRevision`. That
key then carries the promoted full commit SHA instead of an environment branch
name such as `staging`.

Example:

```yaml
envType: staging
namespace: staging
targetRevision: 0cc4cd87f40ae606d1822d5652b552f8c50a4668
```

#### Changed existing file: `apps/codeai/deployments/<deployment>/values.yaml`

Kargo only updates the `image` field.

Example:

```yaml
image: ghcr.io/code-dot-org/code-dot-org:git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
autoscaling:
  maxReplicas: 1
locals.yml:
  stack_name: staging
```

If the team later prefers digest-first deploy refs, the same file can instead
carry a digest-pinned image string.

#### Changed existing file: `apps/codeai/applicationset.yaml`

Argo must read `targetRevision` from `deployment.yaml`.

Example source stanza:

```yaml
sources:
  - repoURL: https://github.com/code-dot-org/code-dot-org.git
    targetRevision: '{{targetRevision}}'
    path: k8s/helm
    helm:
      releaseName: '{{path.basename}}'
      valueFiles:
        - $values/apps/codeai/envTypes/{{envType}}.values.yaml
        - $values/apps/codeai/deployments/{{path.basename}}/values.yaml
  - repoURL: https://github.com/code-dot-org/k8s-gitops.git
    targetRevision: main
    ref: values
```

### Example `staging` Stage

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
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: https://github.com/code-dot-org/k8s-gitops.git
            checkout:
              - commit: ${{ commitFrom('https://github.com/code-dot-org/k8s-gitops.git', warehouse('codeai-builds')).ID }}
                path: ./freight
              - branch: main
                path: ./gitops

        - uses: yaml-parse
          as: build-lock
          config:
            path: ./freight/warehouses/codeai/builds/current.yaml
            outputs:
              - name: releaseId
                fromExpression: releaseId
              - name: gitCommit
                fromExpression: gitCommit
              - name: imageRef
                fromExpression: image.ref
              - name: packagingKind
                fromExpression: packaging.kind
              - name: sourcePath
                fromExpression: packaging.sourcePath

        - uses: yaml-update
          config:
            path: ./gitops/apps/codeai/deployments/staging/deployment.yaml
            updates:
              - key: targetRevision
                value: ${{ outputs['build-lock'].gitCommit }}

        - uses: yaml-update
          config:
            path: ./gitops/apps/codeai/deployments/staging/values.yaml
            updates:
              - key: image
                value: ${{ outputs['build-lock'].imageRef }}

        - uses: git-commit
          config:
            path: ./gitops
            message: Promote staging to ${{ outputs['build-lock'].releaseId }}

        - uses: git-push
          config:
            path: ./gitops
```

### Example `review-infra-changes` Stage

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
  promotionTemplate:
    spec:
      steps:
        - uses: git-clone
          config:
            repoURL: https://github.com/code-dot-org/k8s-gitops.git
            checkout:
              - commit: ${{ commitFrom('https://github.com/code-dot-org/k8s-gitops.git', warehouse('codeai-builds')).ID }}
                path: ./freight
              - branch: main
                path: ./gitops
        - uses: yaml-parse
          as: build-lock
          config:
            path: ./freight/warehouses/codeai/builds/current.yaml
            outputs:
              - name: releaseId
                fromExpression: releaseId
              - name: gitCommit
                fromExpression: gitCommit
              - name: imageRef
                fromExpression: image.ref
              - name: packagingKind
                fromExpression: packaging.kind
              - name: sourcePath
                fromExpression: packaging.sourcePath
        - uses: yaml-update
          config:
            path: ./gitops/apps/codeai/deployments/production/deployment.yaml
            updates:
              - key: targetRevision
                value: ${{ outputs['build-lock'].gitCommit }}
        - uses: yaml-update
          config:
            path: ./gitops/apps/codeai/deployments/production/values.yaml
            updates:
              - key: image
                value: ${{ outputs['build-lock'].imageRef }}
        - uses: git-commit
          config:
            path: ./gitops
            message: Review production update for ${{ outputs['build-lock'].releaseId }}
        - uses: git-push
          as: push
          config:
            path: ./gitops
            generateTargetBranch: true
        - uses: git-open-pr
          config:
            repoURL: https://github.com/code-dot-org/k8s-gitops.git
            sourceBranch: ${{ outputs.push.branch }}
            targetBranch: main
            title: Review CodeAI production release
```

### Variant-specific notes
- Local Skaffold remains basically unchanged.
- This is the best boring fallback and the easier migration path.
- Infra review is weaker here because reviewers mostly approve ref changes, not
  rendered manifests.

### Helm migration notes
- Rename `apps/codeai/deployments/production/deployment.yaml.disabled` to
  `apps/codeai/deployments/production/deployment.yaml`.
- Rename `apps/codeai/deployments/levelbuilder/deployment.yaml.disabled` to
  `apps/codeai/deployments/levelbuilder/deployment.yaml`.
- Rename `apps/codeai/deployments/*/deployment.yaml` key `branch` to
  `targetRevision`.
- Fix `apps/codeai/applicationset.yaml` to use `{{targetRevision}}` instead of
  `{{sourceRevision}}`.
- Update the current writeback workflow to write warehouse files instead of env
  `values.yaml`.

### Helm Testing Plan

Shared checks still apply. For the Helm variant, also:
- In `k8s.yml`, validate every `warehouses/codeai/builds/current.yaml` and
  `git-<full-commit-sha>.yaml` written for the Helm variant has `packaging.kind: helm`
  and `packaging.sourcePath: k8s/helm`.
- In `k8s.yml`, validate every
  `apps/codeai/deployments/<deployment>/deployment.yaml` has `envType`,
  `namespace`, and `targetRevision`.
- In the same workflow, validate every
  `apps/codeai/deployments/<deployment>/values.yaml` updates `image`
  correctly.
- In the same workflow, validate
  [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml)
  uses `targetRevision: '{{targetRevision}}'` for the Helm source.
- In the same workflow, run one local `helm template` smoke render using:
  - `apps/codeai/envTypes/{{envType}}.values.yaml`
  - `apps/codeai/deployments/{{path.basename}}/values.yaml`

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
- [Multi-Warehouse Base + Overlay](../iteration-5/multi-warehouse-base-overlay.md)
- [Rendered Branches from a Thin Lock](../iteration-5/rendered-branches.md)
- [Pre-Rendered Release Bundle](../iteration-5/rendered-release-bundle.md)
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
the promoted release will later mutate Helm values or render source into a
branch. The build-lock itself stays intentionally boring so the promotion logic
can be deterministic and easy to audit.

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
branch. The shared contract remains the same: one exact source commit, one
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
- `packaging.kind` tells the stage that this plan is the Helm variant
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
