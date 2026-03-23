# Common-Case Freight + Rendered Branches

**Short name:** Common-case render

**Catchy description:** Stop manufacturing a fake build-lock commit. Let Kargo assemble the real monorepo commit and the real image into one Freight, then render stage branches from sparse checkouts of the huge repo with Kustomize.

## Detailed Technical Description of Plan
This plan is the “use the real artifacts, not a synthetic release record” option. Kargo watches the actual app image in GHCR and the real `code-dot-org` Git history, then creates one Freight item only when those two match on the same `git-<full-commit-sha>` identity. That means the release coordinate is not a warehouse file in `k8s-gitops`; it is the pairing of the published image and the source commit that produced it. The Warehouse logic is therefore the heart of the plan: if the image tag and Git commit do not line up exactly, there is no promotion candidate.

On the GH action side, Kustomize builds and publishes the immutable `git-<full-commit-sha>` image tag, and it writes no package artifact and no Git Freight record.

Promotion then uses that single Freight item to render deploy output into long-lived stage branches in `k8s-gitops`. The critical implementation detail is that render-time input comes from a sparse checkout of `code-dot-org` at the promoted commit, not from the moving `staging` branch tip. Kargo clones `k8s-gitops` once for env policy and metadata, clones `code-dot-org` once for the source package, renders the stage-specific output, and commits that rendered output to `stage/<deployment>`. The review stage is not a special case in architecture, only in Git behavior: production output gets rendered to a generated branch and opened as a PR against `stage/production` so humans review the actual manifests before production sync.

This plan differs from the thin-lock and snapshot families in where trust lives. The thin-lock family trusts a tiny build-lock file, and the snapshot family trusts a frozen copy of the package. Common-Case trusts the live source commit plus the live image tag, so the tricky part is making promotion deterministic without snapshotting anything into Freight. The hard implementation points are the exact `git-<full-commit-sha>` pairing rule, the sparse checkout at the promoted source commit, and the Kustomize temporary-wrapper flow that assembles render input from `k8s-gitops` envType components plus the shared deploy template before `kustomize-set-image` runs.

The rendered-output and live-checkout mechanics are shared with
[Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-review-md)
and [Live Source Checkout at Freight Commit](#live-source-checkout-at-freight-commit-md).
If legacy coexistence gating is needed, layer in
[Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branches-md).

- **Type:** Kustomize
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## What Freight Looks Like
This plan does not create any `warehouses/codeai/` release record. Kargo
discovers Freight directly from the real image and the real `code-dot-org`
commit and promotes that pair.

```text
warehouses/codeai/
  (unused)
```

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
spec:
  subscriptions:
    - image:
        repoURL: ghcr.io/code-dot-org/code-dot-org
        allowTagsRegexes:
          - ^git-[0-9a-f]{40}$
    - git:
        repoURL: https://github.com/code-dot-org/code-dot-org.git
        branch: staging
  freightCreationCriteria:
    expression: |
      imageFrom('ghcr.io/code-dot-org/code-dot-org').Tag ==
      'git-' + commitFrom('https://github.com/code-dot-org/code-dot-org.git').ID
```

## Warehouse artifact
This plan intentionally does **not** use a synthetic `warehouses/codeai/` tree.

Instead of teaching Kargo about a release by committing a release record into
`k8s-gitops`, let Kargo discover the release directly from the real artifacts:

- the built image in `ghcr.io/code-dot-org/code-dot-org`
- the matching `code-dot-org` commit on `staging`

Suggested Warehouse shape:

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai
spec:
  freightCreationPolicy: Automatic
  subscriptions:
    - image:
        repoURL: ghcr.io/code-dot-org/code-dot-org
        allowTagsRegexes:
          - ^git-[0-9a-f]{40}$
    - git:
        repoURL: https://github.com/code-dot-org/code-dot-org.git
        branch: staging
        commitSelectionStrategy: NewestFromBranch
  freightCreationCriteria:
    expression: |
      imageFrom('ghcr.io/code-dot-org/code-dot-org').Tag ==
      'git-' + commitFrom('https://github.com/code-dot-org/code-dot-org.git').ID
```

The `freightCreationCriteria` expression shown above is the intended contract for this plan, but the first implementation task should validate that exact syntax against the deployed Kargo version; if the syntax is not supported as written, the contractor should document the fallback before proceeding.

Operationally, `warehouses/codeai/` becomes “nothing.” The image and the source
commit are the release record.

## Freight
Freight is a **single multi-artifact Freight** from one Warehouse:

- one image revision
- one `code-dot-org` Git commit

Those two artifacts are promoted together as a unit.

The image must publish an immutable `git-<full-commit-sha>` tag in addition to any
human-friendly branch tags.

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Recommended stage rules:
- `staging`: direct from Warehouse
- `test`: from `staging`, ideally using `MatchUpstream`
- `levelbuilder`: from `test`, ideally using `MatchUpstream`
- `review-infra-changes`: from `test`, ideally using `MatchUpstream`
- `production`: from `review-infra-changes`

Recommended promotion task shape:
1. Clone `k8s-gitops` `main` to `./meta` for env policy and app metadata.
2. Clone `k8s-gitops` `stage/<deployment>` to `./out`.
3. Clone `code-dot-org` at the Freight commit to `./src` using sparse checkout.
4. `git-clear` `./out`.
5. Render the stage output from `./src` + `./meta`.
6. Commit and push `./out`.
7. Ask Argo CD to sync the stage app to the rendered branch commit.

This is basically Kargo’s documented **Common Case** plus the shared
[Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-review-md)
module plus the shared
[Live Source Checkout at Freight Commit](#live-source-checkout-at-freight-commit-md)
module.

## Stage-by-stage promotion flow
- `staging`: render the staging deployment from the exact Freight commit/image pair to `stage/staging`
- `test`: render `stage/test`, sync, then run verification against the exact same Freight already running in `staging`
- `levelbuilder`: render `stage/levelbuilder` from the exact Freight verified in `test`
- `review-infra-changes`: render production output to a generated branch, open a PR against `stage/production`, and wait for review/merge
- `production`: sync the already-reviewed `stage/production` branch after the PR merge

The crucial point is that the Freight shape does **not** change across stages.
Only the rendered view changes.

## `review infra changes` stage behavior
This stage should behave like a real Git review gate:
1. Clone `stage/production` to `./out`.
2. Render production manifests from the Freight commit and production env config.
3. Commit to a generated branch.
4. Open a PR against `stage/production`.
5. Wait for merge.

Use `git-wait-for-pr` by default.

`git-merge-pr` is a valid later optimization if the team wants “open a PR for
audit, but auto-merge when checks pass,” but it should not be the first design.

## `test` stage automation behavior
After `stage/test` is updated and synced, run verification before allowing
promotion onward.

Good fits:
- Kargo `verification` with `AnalysisTemplate`s for rollout, health, and smoke checks
- existing Drone unit/UI results for the same promoted `gitCommit`
- `MatchUpstream` so downstream stages always follow the exact Freight verified in `test`, not merely the newest discovered Freight

## Does it break/awkwardize skaffold or local-dev in any way?
No.

Local dev keeps using source packaging in `code-dot-org`, exactly where it lives
today. Promotion-time rendering is isolated to Kargo.

## Proposed Kustomize directory structure
### `code-dot-org`
```text
k8s/kustomize/
  base/
  components/
  overlays/
  bin/
```

Use `base/` and `components/` in Kargo/Argo production code paths. The
checked-in `overlays/` and `bin/` trees are currently local-dev/parity support.

### `k8s-gitops`
`main` keeps only env policy and Argo metadata:

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
```

For the Kustomize-shaped form, envType components live under
`apps/codeai/envTypes/<envType>/`, the generic temp-wrapper template lives at
`apps/codeai/kargo/templates/deploy/`, and `deploy/` is reserved for
rendered output on stage branches instead of committed source on `main`.

Rendered output lives on stage branches, not on `main`:

```text
stage/staging        -> apps/codeai/deployments/staging/deploy/
stage/test           -> apps/codeai/deployments/test/deploy/
stage/levelbuilder   -> apps/codeai/deployments/levelbuilder/deploy/
stage/production     -> apps/codeai/deployments/production/deploy/
```

That keeps the review surface honest and avoids feedback loops.

## Pros
- removes the synthetic warehouse writeback workflow entirely
- uses Kargo the way the current docs/examples actually want to be used
- keeps source of truth in `code-dot-org`
- preserves excellent reviewability through rendered output
- sparse checkout makes promotion-time monorepo reads realistic

## Cons
- requires immutable `git-<full-commit-sha>` image tags
- depends on two upstream artifacts becoming available in lockstep
- more Kargo expression logic than the thin-lock control plan
- still clones source during promotion instead of using a frozen package snapshot

## Migration notes
- Stop writing release records into `k8s-gitops`.
- Make the image build publish immutable `git-<full-commit-sha>` tags.
- Replace the current image-only Warehouse with the combined image+git Warehouse.
- Move Argo CD apps to rendered stage branches.
- Use sparse checkout aggressively so Kargo does not slurp the whole monorepo.

## Additional implementation notes
- This is the first plan in the set that really uses Kargo’s newer freight
  assembly features instead of building a sidecar release-record system.
- If the image+git pairing turns out to be awkward in practice, the next thing
  to try is not “go back to build locks.” It is “let the image carry the commit
  via OCI annotations and make the Warehouse image-only.”
- If coexistence with the legacy Gitflow rollout is still required, combine
  this plan with
  [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branches-md).

## Iteration 7 notes
- Keep this as the pure-Kargo benchmark.
- Use it to ask whether other plans are buying real repo-fit advantages or just adding machinery.

# Code changes
## `k8s-gitops` changes
- Delete the need for `warehouses/codeai/`
- Replace the current CodeAI Warehouse with a combined image+git Warehouse
- Rewrite Stages around rendered stage branches such as `stage/staging`
- Update Argo Applications to deploy from
  `apps/codeai/deployments/<deployment>/deploy` on rendered stage branches in
  `k8s-gitops`
- Add `apps/codeai/kargo/templates/deploy/kustomization.yaml` as the generic
  Kustomize temp-wrapper template copied into promotion work dirs
- Add `review-infra-changes` PR behavior against `stage/production`

## `code-dot-org` changes
- Remove `k8s-commit-to-kargo-warehouse.yml` from the release path
- Publish immutable `git-<full-commit-sha>` image tags

<a id="gate-promotion-on-legacy-gitflow-branches-md"></a>
# gate-promotion-on-legacy-gitflow-branches.md

## Gate Promotion On Legacy Gitflow Branches

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
- [Image Provenance + Rendered Branches](../iteration-5/image-provenance-rendered-branches.md)
- [Kustomize Base Snapshot](../iteration-5/kustomize-base-snapshot.md)
- [Kustomize Split Overlays](../iteration-5/kustomize-split-overlays.md)
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

<a id="rendered-stage-branches-and-pr-review-md"></a>
# rendered-stage-branches-and-pr-review.md

## Rendered Stage Branches and PR Review

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
path. On `main`, that path name may describe authored Kustomize inputs or a
template directory that promotion copies into a temp workspace; on
`stage/*`, the same path name refers to generated output. The module therefore
requires each plan to be explicit about what is source-owned versus what is
rendered. Kargo reads deployment metadata from `main`, renders into the stage
branch, opens a PR for `review-infra-changes`, and only then lets production
advance. The tricky part is keeping the branch-local output shape stable so
Argo can deploy it directly while still allowing plans to vary in how the
render step assembles Kustomize inputs.

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

Kustomize-shaped plans typically keep:

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

For Kustomize-shaped rendered plans, `main` keeps deployment metadata, env
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
- whether staging/test sync directly after push or through a separate approval step

<a id="live-source-checkout-at-freight-commit-md"></a>
# live-source-checkout-at-freight-commit.md

## Live Source Checkout at Freight Commit

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
plus sparse paths. For Kustomize that means narrowing the sparse checkout to
`k8s/kustomize`. The rendered-output branch checkout, if present, still comes
from `k8s-gitops` and is a separate concern. That split is what keeps the
module reusable: one plan may feed `sourceCommit` from a build-lock file,
another may feed it from live Freight discovery, but both use the same checkout
mechanics once the commit is known.

The tricky part is that this module only works if the consuming plan is strict
about provenance. If `sourceCommit` comes from the wrong branch, or if the
sparse checkout includes the wrong packaging tree, the render step can still
succeed while producing the wrong manifests. So the module's real rule is not
just "use sparse checkout"; it is "resolve the exact promoted commit first, then
render only the packaging subtree that belongs to that release." That makes it
different from the build-lock module, which defines how Freight is recorded, and
different from the rendered-branch module, which defines where the output ends
up after rendering.

This module is shared by:
- Common-Case Freight + Rendered Branches
- Rendered Branches from a Thin Lock

## Why this is the hard part

These plans are only sane if promotion reads the **exact promoted source
commit**, not the moving branch tip, while also avoiding a full clone of the
giant monorepo.

Fortunately, Kargo's `git-clone` step supports both:
- exact `checkout[].commit`
- exact sparse checkout paths

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
          - k8s/kustomize
```

In practice:
- `vars.sourceCommit` comes from the build-lock helper or from Git Freight
  itself
- for Kustomize-first phases, sparse checkout can be narrowed to just
  `k8s/kustomize`
- the rendered-output branch checkout still comes from the separate
  `k8s-gitops` clone described in
  [Rendered Stage Branches and PR Review](#rendered-stage-branches-and-pr-review-md)

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
