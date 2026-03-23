# OCI Release Capsule

- Short name: OCI Capsule
- Catchy description: Make one immutable registry object the center of release
  truth, then render from that object instead of chasing source at promotion
  time.

## Detailed Technical Description of Plan
This plan makes the release object itself an OCI artifact, not a Git commit or a
rendered branch. The app image and the capsule share the same `git-<full-commit-sha>`
identity, and the capsule carries the exact deploy package plus release
metadata. Promotion is therefore a two-step trust chain: first verify that the
promoted image and capsule belong to the same release identity, then unpack the
capsule and render from the package stored inside it. That is what makes this
plan different from the rendered-branch plans: the output is still reviewable,
but the thing Kargo promotes is an immutable registry object instead of a live
source checkout or a synthetic Git release record.

The capsule should be thought of as a frozen release bundle with a small,
explicit schema. `release.yaml` names the image ref, digest, package kind, and
package path; the `package/` tree contains Helm chart files; `metadata/`
carries provenance and SBOM data. Promotion must download the capsule, confirm
the tag/digest/package metadata match the Freight identity, and then render
from the exact path recorded in the capsule. The important tricky part is that
the capsule is not a generic blob archive: the package path inside the artifact
is part of the contract, so Helm must have a predictable internal layout that
downstream steps can trust.

For Helm, the capsule is mostly a frozen chart plus values. That means the
capsule still depends on `k8s-gitops` for environment shaping, but it does not
depend on live `code-dot-org` source at promotion time. The alternate
package-pair form in this doc is intentionally weaker and more incremental: it
keeps the same image+package pairing but splits the release witness into Git
plus OCI artifacts. The full capsule is the stronger, more opinionated version
when the team wants one registry-native release object to own both the deploy
payload and its provenance. For this handoff, the full capsule form is the
required implementation target. Treat the package-pair text below as future-only
context, not as a co-equal first-pass option.
- It is: Helm plan
- It uses: hybrid pattern

## What Freight Looks Like
This plan promotes the real application image and a matching OCI release
capsule. The capsule carries the deploy package plus release metadata.

```text
registry:
  ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  ghcr.io/code-dot-org/codeai-release-capsule:git-<full-commit-sha>

# inside the capsule
capsule/
  release.yaml
  package/
    helm/...
  metadata/
    provenance.json
    sbom.json
```

```yaml
gitCommit: <full-commit-sha>
image:
  repoURL: ghcr.io/code-dot-org/code-dot-org
  tag: git-<full-commit-sha>
  digest: sha256:...
package:
  kind: helm
  path: package/helm
metadata:
  sbomPath: metadata/sbom.json
  provenancePath: metadata/provenance.json
```

## Capsule build-context layout before packaging

```text
release-capsule-build/
  git-<full-commit-sha>/
    release.yaml
    package/
      helm/...
    metadata/
      sbom.json
      provenance.json
```

This CI build-context directory is packaged into a single OCI artifact such as
`ghcr.io/code-dot-org/codeai-release-capsule:git-<full-commit-sha>`.
It is not a Git warehouse path that Kargo watches.

The capsule contains the frozen deploy package and release metadata. It does
not need to contain the app image bytes themselves. Instead, `release.yaml`
records the exact image ref/digest that the capsule must be paired with.

### Helm capsule contents

```text
release.yaml
package/
  helm/
    Chart.yaml
    values.yaml
    templates/...
metadata/
  sbom.json
  provenance.json
```

The path inside the uploaded OCI artifact is part of the contract: the GH
action must lay out the artifact so that after `oci-download` and unpack,
Kargo finds the package exactly at `package.path` from the release metadata
(`package/helm` for the capsule Helm form).
Implementors should not use the checked-in `overlays/` or `bin/` subdirs in
Kargo or Argo production code paths. Those are currently local-dev/parity
support surfaces.

## Freight definition

Freight is anchored on the app image tag `git-<full-commit-sha>`. The matching OCI release
capsule uses the same tag. Promotion verifies that:
- image tag and capsule tag match
- `release.yaml` inside the capsule names the same `$gitcommit`
- image digest in the capsule matches the actual image digest from Freight

## Future alternate implementation: OCI Package Pair
This section is kept for context only. It is not part of the required first
implementation for this plan.

The same OCI-forward family can also be implemented as a looser pair instead of
one capsule:

- app image: `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`
- package artifact:
  - Helm subvariant: `oci://ghcr.io/code-dot-org/codeai-chart:0.0.0-git.<full-commit-sha>`
- small Git witness:

```text
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
```

```yaml
releaseId: git-<full-commit-sha>
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
package:
  ref: ghcr.io/code-dot-org/codeai-chart@sha256:...
  digest: sha256:...
  kind: helm-chart
  format: helm-chart-tgz
  path: . # helm chart root
```

Use the pair form if the team wants:
- a smaller adoption step
- a more explicit Git witness
- less custom OCI capsule tooling

Use the capsule form if the team wants:
- one richer OCI release object
- one place for package metadata, provenance, and SBOM
- the cleaner long-term OCI-native story

For the required implementation in this repo, use the capsule form.

### Package Pair contents

Helm pair form:

```text
image:
  ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>

package artifact:
  oci://ghcr.io/code-dot-org/codeai-chart:0.0.0-git.<full-commit-sha>

git witness:
  warehouses/codeai/releases/git-<full-commit-sha>/release.yaml
```

The Helm package-pair form follows the same packaging rule as the capsule
form: the package input comes from the chart bundled into the artifact.
The path inside the uploaded artifact is part of the contract here too: the GH
action must publish the package so that after download and unpack, Kargo finds
the package at the exact `package.path` recorded in the witness.
Implementors should not use the checked-in `overlays/` or `bin/` subdirs in
Kargo or Argo production code paths.

### Package Pair promotion skeleton

The pair form uses the same rendered-output destination as the capsule form,
but promotion resolves two release objects instead of one:

1. Clone `k8s-gitops` for env policy and rendered output.
2. Resolve the promoted image Freight.
3. Read the Git witness at `warehouses/codeai/releases/git-<full-commit-sha>/release.yaml`.
4. Verify:
   - promoted image tag matches witness `releaseId`
   - witness `gitCommit` matches the `git-<full-commit-sha>` identity
   - witness `image.digest` matches the promoted image digest
   - witness `package.ref`, `package.digest`, and `package.path` are present
5. Download the package artifact named by the witness:
   - Helm: OCI Helm chart ref

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
path. On `main`, that path name may describe authored Helm inputs or a template
directory that promotion copies into a temp workspace; on `stage/*`, the same
path name refers to generated output. The module therefore requires each plan
to be explicit about what is source-owned versus what is rendered. Kargo reads
deployment metadata from `main`, renders into the stage branch, opens a PR for
`review-infra-changes`, and only then lets production advance. The tricky part
is keeping the branch-local output shape stable so Argo can deploy it directly
while still allowing plans to vary in how the render step assembles Helm inputs.

What makes this module different from the build-lock, live-source-checkout, and
gate modules is that it owns the output contract, not the release identity or
the source checkout mechanics. Those other modules answer “what release is
this?” or “where does source come from?” This one answers “where does rendered
truth live, and how do humans review it safely?” If a plan uses this module
correctly, the implementor can change the rendering strategy later without
changing the core GitOps review model.

This module is shared by:
- Common-Case Freight + Rendered Branches
- Source Snapshot (Helm) + Rendered Branches
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

For Helm-shaped rendered plans, `main` keeps deployment metadata, env policy,
and any reusable temp-wrapper templates such as `apps/codeai/kargo/templates/deploy/`.
The rendered `deploy/` tree exists only on `stage/*`, where it is generated
output that Argo deploys.

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
- whether the render engine is Helm
- whether staging/test sync directly after push or through a separate approval step

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
- [OCI Package Pair (Helm) + Rendered Branches](../iteration-5/oci-package-pair-rendered-branches.md)
- [Rendered Branches from a Thin Lock](../iteration-5/rendered-branches.md)
- [Pre-Rendered Release Bundle](../iteration-5/rendered-release-bundle.md)
- [Source Snapshot (Helm) + Rendered Branches](../iteration-5/source-snapshot-rendered-branches.md)
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
