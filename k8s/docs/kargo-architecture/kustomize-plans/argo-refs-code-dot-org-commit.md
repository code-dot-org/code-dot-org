# Argo Refs code-dot-org Commit

**Short name:** Argo refs commit

**Catchy description:** Write one tiny release record to `warehouses/codeai/`,
then let Argo CD deploy Kustomize source pinned to a `code-dot-org` commit.

## Detailed Technical Description of Plan
This plan is the simplest source-driven Kargo design in iteration 7. Kargo does
not snapshot a release package or render review output into Freight; instead it
promotes a tiny Git build-lock record from `k8s-gitops` that names one exact
`code-dot-org` commit and one exact image tag/digest. The build-lock is the
release record, and `current.yaml` is just a stable parse path to that same
record. The whole point is to keep Freight small, deterministic, and easy to
audit while still letting the real deploy source live in `code-dot-org`.

Argo points at `k8s-gitops/apps/codeai/deployments/<deployment>/deploy/`, where
the deploy tree is built from the checked-in `code-dot-org/k8s/kustomize/`
package plus the envType `Component`s under `apps/codeai/envTypes/<envType>/`.
That is the main conceptual difference from the rendered-branch plans: here the
GitOps repo does not store rendered output, it stores the deploy entrypoint and
env policy that tell Argo how to materialize source at the right commit.

The tricky part is that the plan looks deceptively simple until you try to make
promotion and deploy truth line up. The build-lock file must be written
atomically as both `git-<full-commit-sha>.yaml` and `current.yaml`, and the GH
action must keep the image tag and the lock file in sync.

- **Type:** Source-driven plan
- **Pattern:** Source-driven
- **Rendered manifests pattern:** No

## Shared architecture summary
This plan keeps one release identity model:

- Kargo promotes a thin Git build-lock record from `k8s-gitops`
- that build lock pins the image and the real `code-dot-org` commit
- Argo later deploys source-oriented truth that ultimately points at that
  commit, instead of Kargo snapshotting or rendering the package into Git

Argo entrypoint is `k8s-gitops/apps/codeai/deployments/<deployment>/deploy/`,
built from the checked-in `code-dot-org/k8s/kustomize/` tree plus the existing
`k8s-gitops/apps/codeai/envTypes/*` envType components.

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
  kind: kustomize
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/kustomize
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
The GH action is intentionally small in this plan family:

The GH action writes the build-lock record and keeps the stable alias in sync.

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

This plan family reuses:
- [Git Build-Lock Freight Record](#git-build-lock-freight-recordmd)
- [Gate Promotion On Legacy Gitflow Branches](#gate-promotion-on-legacy-gitflow-branchesmd)

This plan:
- promote the same thin build-lock Freight
- parse the same stable `current.yaml` path
- rely on the same stage ladder and GH runner shape
- deploys Kustomize source after that lock is parsed

## Kustomize implementation starting point

Treat the checked-in `code-dot-org/k8s/kustomize/` tree as the starting point,
not a frozen contract. The implementor may modify or reshape `k8s/kustomize/`
as needed for this plan, especially the base/components layout.

Use the current `k8s-gitops/apps/codeai/envTypes/<envType>/kustomization.yaml`
files as the starting envType contract. `production` may additionally layer in
`apps/codeai/envTypes/components/autoscaling/`.

Do not treat `code-dot-org/k8s/kustomize/overlays/*` as the production deploy
contract unless the plan explicitly chooses to adopt them. Those directories are
currently local-dev/parity support.

The Kustomize deploy-wrapper contract is shared across all Kustomize stages:
`staging`, `test`, `levelbuilder`, and `review-infra-changes` all use the same
mutation pattern against their own deployment wrapper, changing only the
deployment-specific metadata and release inputs.

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

Kustomize stages are only valid when the lock says `packaging.kind: kustomize`
and `packaging.sourcePath: k8s/kustomize`.

For iteration 7, enforce that with repo contract tests in `k8s.yml` instead of
inventing a custom pre-mutation Kargo helper just for this family.

## Kustomize variant
This is the refactor variant.

### `code-dot-org`
Replace rough `targets/` layout with a durable shared-source tree:

```text
k8s/kustomize/
  base/
  components/
  local/
    overlays/
      development/
      setup-db/
      setup-s3/
```

There should be no long-lived deploy-target Kustomizations in `code-dot-org`
other than local-dev helpers.

### `k8s-gitops`
Keep deployment wrappers and envType components here:

```text
apps/codeai/
  deployments/
    <deployment>/
      deployment.yaml
      deploy/
        kustomization.yaml
  envTypes/
    <envType>/
      kustomization.yaml
      deployment.patch.yaml
      deployment.resources.patch.yaml
      locals.yml.patch.yaml
    components/
      autoscaling/
```

Per [README.md](/Users/seth/src/k8s-gitops/README.md#L27), a deployment exists
when `apps/codeai/deployments/<deployment>/` exists and contains
`deployment.yaml`. For this variant, `deployment.yaml` is metadata only. It
must contain at least `envType` and `namespace`. It does not carry the deploy
pin; the pin lives in `deploy/kustomization.yaml`.

### Concrete file examples

#### `apps/codeai/deployments/<deployment>/deployment.yaml`

This variant uses deployment metadata only to resolve `envType` and
`namespace`. It does **not** use `targetRevision`; Argo stays on `main` and the
deploy pin lives in `deploy/kustomization.yaml`.

```yaml
envType: staging
namespace: staging
```

#### `apps/codeai/deployments/<deployment>/deploy/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: staging
resources:
  - github.com/code-dot-org/code-dot-org//k8s/kustomize/base?ref=0cc4cd87f40ae606d1822d5652b552f8c50a4668
components:
  - ../../envTypes/staging
images:
  - name: code-dot-org
    newName: ghcr.io/code-dot-org/code-dot-org
    newTag: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
```

`resources[0]` pins the shared Kustomize base by full commit SHA.
`components[0]` selects the reusable envType layer.
`images[0].name` must be `code-dot-org` because that is the real image name in
[dashboard-deployment.yaml](/Users/seth/.codex/worktrees/684f/code-dot-org/k8s/kustomize/base/dashboard-deployment.yaml).
`images[0].newName` rewrites that local-dev base naming to the real deploy repo
and `images[0].newTag` selects the immutable `git-<full-commit-sha>` image tag.
Promotion rewrites the full `resources`, `components`, and `images` arrays to
that exact shape. All other fields in this file should be treated as immutable
deployment policy.

After the initial bootstrap migration seeds
`apps/codeai/deployments/<deployment>/deploy/kustomization.yaml`, that file is
machine-owned and should not be hand-edited.

#### `apps/codeai/envTypes/<envType>/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1alpha1
kind: Component
namePrefix: staging-
labels:
  - pairs:
      app.kubernetes.io/name: cdo
      app.kubernetes.io/instance: staging
    includeSelectors: true
    includeTemplates: true
patches:
  - path: deployment.patch.yaml
```

Top-level envTypes are now `Component`s. Production currently composes
`../components/autoscaling`. Deployment wrappers consume envTypes through
`components:`, not `resources:`.

#### `codeai/applicationset.yaml` sketch

The implementor must update
[applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml)
so this variant keeps Argo on `main` and deploys the Kustomize entrypoint under
each deployment:

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
          targetRevision: main
          path: apps/codeai/deployments/{{path.basename}}/deploy
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
```

#### Seeded wrapper requirement

Kargo built-ins do not include a generic file writer, and `yaml-update` fails
if the target file does not exist. This variant therefore requires a one-time
migration that seeds `apps/codeai/deployments/<deployment>/deploy/kustomization.yaml`
for every real deployment. Seed each wrapper with the canonical file shape
above, using that deployment's current live commit and tag as initial values.
After the first promotion, Kargo rewrites that existing file on every
promotion. Kargo does not create deployments or envTypes.

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
              - name: packagingKind
                fromExpression: packaging.kind
              - name: sourcePath
                fromExpression: packaging.sourcePath

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./gitops/apps/codeai/deployments/staging/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: yaml-update
          config:
            path: ./gitops/apps/codeai/deployments/staging/deploy/kustomization.yaml
            updates:
              - key: namespace
                value: ${{ outputs['deployment-meta'].namespace }}
              - key: resources
                value:
                  - github.com/code-dot-org/code-dot-org//k8s/kustomize/base?ref=${{ outputs['build-lock'].gitCommit }}
              - key: components
                value:
                  - ../../envTypes/${{ outputs['deployment-meta'].envType }}

        - uses: kustomize-set-image
          config:
            path: ./gitops/apps/codeai/deployments/staging/deploy
            images:
              - image: code-dot-org
                newName: ghcr.io/code-dot-org/code-dot-org
                tag: ${{ outputs['build-lock'].releaseId }}

        - uses: git-commit
          config:
            path: ./gitops
            message: Promote staging deploy to ${{ outputs['build-lock'].releaseId }}

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
              - name: packagingKind
                fromExpression: packaging.kind
              - name: sourcePath
                fromExpression: packaging.sourcePath
        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./gitops/apps/codeai/deployments/production/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace
        - uses: yaml-update
          config:
            path: ./gitops/apps/codeai/deployments/production/deploy/kustomization.yaml
            updates:
              - key: namespace
                value: ${{ outputs['deployment-meta'].namespace }}
              - key: resources
                value:
                  - github.com/code-dot-org/code-dot-org//k8s/kustomize/base?ref=${{ outputs['build-lock'].gitCommit }}
              - key: components
                value:
                  - ../../envTypes/${{ outputs['deployment-meta'].envType }}
        - uses: kustomize-set-image
          config:
            path: ./gitops/apps/codeai/deployments/production/deploy
            images:
              - image: code-dot-org
                newName: ghcr.io/code-dot-org/code-dot-org
                tag: ${{ outputs['build-lock'].releaseId }}
        - uses: git-commit
          config:
            path: ./gitops
            message: Review production deploy update for ${{ outputs['build-lock'].releaseId }}
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
            title: Review CodeAI production deploy
```

### Variant-specific notes
- Argo CD repo-server must be able to fetch the **public**
  `code-dot-org` repo at sync time when this variant keeps Argo pointed at the
  checked-in `k8s/kustomize/` source tree.
- Outbound access from repo-server to
  `https://github.com/code-dot-org/code-dot-org.git` must work.
- Validate outbound access and unauthenticated GitHub fetch assumptions during
  cluster bring-up.
- Credentials are only needed if cluster or network policy blocks anonymous
  GitHub fetches.
- This variant becomes much stronger if paired with a render-preview job for
  `review-infra-changes`.

### Kustomize migration notes
- Add `deploy/kustomization.yaml` under each real deployment in `k8s-gitops`.
- Update `apps/codeai/applicationset.yaml` so Argo points at
  `apps/codeai/deployments/{{path.basename}}/deploy` on `main`.
- Keep `code-dot-org/k8s/kustomize/local/` as local-dev-only support, not
  production deploy truth.
- Leave top-level envTypes as `Component`s.

### Kustomize Testing Plan

Shared checks still apply. For the Kustomize variant, also:
- In `k8s.yml`, validate every `warehouses/codeai/builds/current.yaml` and
  `git-<full-commit-sha>.yaml` written for the Kustomize variant has
  `packaging.kind: kustomize` and `packaging.sourcePath: k8s/kustomize`.
- In `k8s.yml`, validate every
  `apps/codeai/deployments/<deployment>/deployment.yaml` has `envType` and
  `namespace`.
- In the same workflow, validate every
  `apps/codeai/envTypes/<envType>/kustomization.yaml` exists and is
  `kind: Component`.
- In the same workflow, validate every
  `apps/codeai/deployments/<deployment>/deploy/kustomization.yaml` already
  exists before promotion.
- In the same workflow, validate promotion rewrites the full `namespace`,
  `resources`, `components`, and `images` sections exactly as documented:
  `resources[0]` ends with `//k8s/kustomize/base?ref=<full-commit-sha>`,
  `components[0]` is `../../envTypes/<envType>`,
  `images[0].name` is `code-dot-org`,
  `images[0].newName` is `ghcr.io/code-dot-org/code-dot-org`, and
  `images[0].newTag` is `git-<full-commit-sha>`.
- In the same workflow, validate
  [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml)
  keeps `targetRevision: main` for the Kustomize source and deploys
  `apps/codeai/deployments/{{path.basename}}/deploy`.
- In the same workflow, run one local `kustomize build` smoke test against a
  seeded deployment wrapper such as
  `apps/codeai/deployments/staging/deploy`.

## Tradeoffs
- This plan keeps the release trigger tiny and easy to audit.
- It is less reviewable than rendered-branch plans because Argo deploys
  source-oriented truth instead of rendered output.

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
the promoted release will later pin a Kustomize entrypoint or render full stage
output. The build-lock itself stays intentionally boring so
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
those hints to decide whether to render source into a branch or pin a
Kustomize deployment entrypoint, but the shared contract remains the same: one
exact source commit, one exact image, one stable `current.yaml` parse path.

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
  kind: kustomize
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/kustomize
createdAt: 2026-03-22T12:34:56Z
```

Use this as the lowest-common-denominator contract:
- `gitCommit` is the real source identity
- `image.ref` and `image.digest` pin the built image
- `packaging.kind` tells the stage it should later run Kustomize
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

- Rendered Branches from a Thin Lock: clone source, render, and commit output
- Argo Refs code-dot-org Commit: update deployment Kustomization refs and image pins
