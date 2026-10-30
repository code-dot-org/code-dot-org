# Argo Refs code-dot-org Commit

**Short name:** Argo refs commit

**Catchy description:** Write one tiny release record to `warehouses/codeai/`,
then let Argo CD deploy Helm or Kustomize source pinned to a `code-dot-org`
commit.

## Detailed Technical Description of Plan
This plan is the simplest source-driven Kargo design in iteration 7. Kargo does
not snapshot a release package or render review output into Freight; instead it
promotes a tiny Git build-lock record from `k8s-gitops` that names one exact
`code-dot-org` commit and one exact image tag/digest. The build-lock is the
release record, and `current.yaml` is just a stable parse path to that same
record. The whole point is to keep Freight small, deterministic, and easy to
audit while still letting the real deploy source live in `code-dot-org`.

The plan then forks into two packaging variants that share the same release
identity model. In the Helm variant, Argo points directly at `code-dot-org`
`k8s/helm` at the pinned commit and uses `k8s-gitops` only for env values and
deployment metadata. In the Kustomize variant, Argo points at
`k8s-gitops/apps/codeai/deployments/<deployment>/deploy/`, where the rendered
deploy tree is built from the checked-in `code-dot-org/k8s/kustomize/` package
plus the envType `Component`s under `apps/codeai/envTypes/<envType>/`. That is
the main conceptual difference from the rendered-branch plans: here the GitOps
repo does not store rendered output, it stores the deploy entrypoint and env
policy that tell Argo how to materialize source at the right commit.

The tricky part is that the plan looks deceptively simple until you try to make
promotion and deploy truth line up. The build-lock file must be written
atomically as both `git-<full-commit-sha>.yaml` and `current.yaml`, the GH
action must keep the image tag and the lock file in sync, and Kargo must
distinguish Helm vs Kustomize with `packaging.kind` and `sourcePath` before it
mutates GitOps. The Helm path is the lower-friction migration path, while the
Kustomize path is the cleaner long-term form if the team wants source-backed
Kustomize deploy truth without moving to rendered stage branches.

- **Type:** Source-driven plan family
- **Pattern:** Source-driven
- **Rendered manifests pattern:** No

## Shared architecture summary
This is one plan family with two packaging variants:

- **Helm variant:** lower-migration, simpler, and closer to today
- **Kustomize variant:** deeper refactor, but cleaner if the team really wants
  long-lived Kustomize deploy truth

Both variants share the same release identity model:

- Kargo promotes a thin Git build-lock record from `k8s-gitops`
- that build lock pins the image and the real `code-dot-org` commit
- Argo later deploys source-oriented truth that ultimately points at that
  commit, instead of Kargo snapshotting or rendering the package into Git

The key distinction between variants is:

- **Helm variant:** Argo entrypoint is `code-dot-org` at a pinned commit.
- **Kustomize variant:** Argo entrypoint is
  `k8s-gitops/apps/codeai/deployments/<deployment>/deploy/`, built from the
  checked-in `code-dot-org/k8s/kustomize/` tree plus the existing
  `k8s-gitops/apps/codeai/envTypes/*` envType components.

Pick one variant for a given implementation pass; do not try to mix both
deploy-truth models in one first pass.

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
  kind: helm # or kustomize
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/helm # or k8s/kustomize
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

Helm and Kustomize use the same GH action shape here; only
`packaging.kind` and `sourcePath` differ.

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
[Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
for migration-era gating.

## Shared core tradeoff
This is the core tradeoff of the whole family:

- Argo deploys source-oriented truth that points at a pinned
  `code-dot-org` commit
- Kargo promotes a tiny release record instead of rendered output

That makes the plan simple and migration-friendly, but less reviewable than the
rendered-branch plans.

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
- [Git Build-Lock Freight Record](../modules/git-build-lock-freight-record.md)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan family reuses:
- [Git Build-Lock Freight Record](../modules/git-build-lock-freight-record.md)
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)

Both variants:
- promote the same thin build-lock Freight
- parse the same stable `current.yaml` path
- rely on the same stage ladder and GH runner shape
- differ only in what Argo ultimately deploys after that lock is parsed

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

Variant selection is also part of the build-lock contract:

- Helm stages are only valid when the lock says `packaging.kind: helm` and
  `packaging.sourcePath: k8s/helm`
- Kustomize stages are only valid when the lock says
  `packaging.kind: kustomize` and `packaging.sourcePath: k8s/kustomize`

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

## Kustomize variant
This is the deeper-refactor variant.

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
must contain at least `envType` and `namespace`. Unlike the Helm variant, it
does not carry the deploy pin; the pin lives in `deploy/kustomization.yaml`.

### Concrete file examples

#### `apps/codeai/deployments/<deployment>/deployment.yaml`

This variant uses deployment metadata only to resolve `envType` and
`namespace`. Unlike the Helm variant, it does **not** use `targetRevision`;
Argo stays on `main` and the deploy pin lives in `deploy/kustomization.yaml`.

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

## Variant comparison / tradeoffs
- **Helm variant:** lower migration, fewer repo changes, and the easiest way to
  adopt this family.
- **Kustomize variant:** deeper restructure, cleaner Kustomize separation, and
  a better long-term fit if the team really wants Kustomize as deploy truth.
- **Shared downside:** both variants are less reviewable than rendered-branch
  plans because Argo deploys source-oriented truth instead of rendered output.
- **Shared upside:** both variants keep the release trigger tiny and easy to
  audit.
