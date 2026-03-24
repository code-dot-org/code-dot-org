# Common-Case Freight + Rendered Branches

**Short name:** Common-case render

**Catchy description:** Stop manufacturing a fake build-lock commit. Let Kargo assemble the real monorepo commit and the real image into one Freight, then render stage branches from sparse checkouts of the huge repo.

## Detailed Technical Description of Plan
This plan is the “use the real artifacts, not a synthetic release record” option. Kargo watches the actual app image in GHCR and the real `code-dot-org` Git history, then creates one Freight item only when those two match on the same `git-<full-commit-sha>` identity. That means the release coordinate is not a warehouse file in `k8s-gitops`; it is the pairing of the published image and the source commit that produced it. The Warehouse logic is therefore the heart of the plan: if the image tag and Git commit do not line up exactly, there is no promotion candidate.

On the GH action side, Helm and Kustomize are identical for this plan: CI only builds and publishes the immutable `git-<full-commit-sha>` image tag, and it writes no package artifact and no Git Freight record.

Promotion then uses that single Freight item to render deploy output into long-lived stage branches in `k8s-gitops`. The critical implementation detail is that render-time input comes from a sparse checkout of `code-dot-org` at the promoted commit, not from the moving `staging` branch tip. Kargo clones `k8s-gitops` once for env policy and metadata, clones `code-dot-org` once for the source package, renders the stage-specific output, and commits that rendered output to `stage/<deployment>`. The review stage is not a special case in architecture, only in Git behavior: production output gets rendered to a generated branch and opened as a PR against `stage/production` so humans review the actual manifests before production sync.

This plan differs from the thin-lock and snapshot families in where trust lives. The thin-lock family trusts a tiny build-lock file, and the snapshot family trusts a frozen copy of the package. Common-Case trusts the live source commit plus the live image tag, so the tricky part is making promotion deterministic without snapshotting anything into Freight. The hard implementation points are the exact `git-<full-commit-sha>` pairing rule, the sparse checkout at the promoted source commit, and the Kustomize temporary-wrapper flow that assembles render input from `k8s-gitops` envType components plus the shared deploy template before `kustomize-set-image` runs.

- **Type:** Packaging-agnostic
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

This is basically Kargo’s documented **Common Case** plus **Rendered Configs**
plus the maintainers’ preferred **stage-specific branches** storage shape.

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

## Proposed Helm / Kustomize directory structure
### `code-dot-org`
Helm can stay where it is:

```text
k8s/helm/
```

Future Kustomize should become more explicit:

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
- No required Helm restructure for the first version
- Later Kustomize work can happen in-place without changing the release identity model

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Live Source Checkout at Freight Commit](../modules/live-source-checkout-at-freight-commit.md)

# Sketch of Pivotal Implementation Details

## Shared mechanics

This plan reuses:
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

This plan is the main non-writeback plan, so the Warehouse itself is a pivotal
part of the design:

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai
  namespace: kargo-project-codeai
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
  freightCreationCriteria:
    expression: |
      imageFrom('ghcr.io/code-dot-org/code-dot-org').Tag ==
      'git-' + commitFrom('https://github.com/code-dot-org/code-dot-org.git').ID
```

This expression is the locked pairing rule for the plan. The architecture is
the important point: Kargo assembles Freight directly from upstream image and
source streams.

## Hard parts

This plan has two real hard parts:

1. pair image Freight with Git Freight using the same `git-<full-commit-sha>` identity
2. render from the exact promoted monorepo commit using sparse checkout instead
   of reading the moving branch tip

The first part is why the Warehouse expression matters. The second part is why
the live-source checkout must be shown explicitly.

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
        name: codeai
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
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.sourceRepo, warehouse('codeai')).ID }}
                path: ./src
                sparse:
                  - k8s/helm
                  - k8s/kustomize

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
                value: ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-commit
          config:
            path: ./out
            message: Render ${{ ctx.stage }} for ${{ imageFrom(vars.imageRepo).Tag }}

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
        name: codeai
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
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.sourceRepo, warehouse('codeai')).ID }}
                path: ./src
                sparse:
                  - k8s/kustomize

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
                tag: ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: kustomize-build
          config:
            path: ./work/deployments/${{ ctx.stage }}/deploy
            outPath: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

        - uses: git-commit
          config:
            path: ./out
            message: Render ${{ ctx.stage }} for ${{ imageFrom(vars.imageRepo).Tag }}

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
        name: codeai
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
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.sourceRepo, warehouse('codeai')).ID }}
                path: ./src
                sparse:
                  - k8s/helm

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
                value: ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-commit
          config:
            path: ./out
            message: Review production render for ${{ imageFrom(vars.imageRepo).Tag }}

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
            title: Review CodeAI production render for ${{ imageFrom(vars.imageRepo).Tag }}

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
        name: codeai
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
              - branch: main
                path: ./meta
              - branch: ${{ vars.targetBranch }}
                create: true
                path: ./out

        - uses: git-clone
          config:
            repoURL: ${{ vars.sourceRepo }}
            checkout:
              - commit: ${{ commitFrom(vars.sourceRepo, warehouse('codeai')).ID }}
                path: ./src
                sparse:
                  - k8s/kustomize

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
                tag: ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: kustomize-build
          config:
            path: ./work/deployments/${{ vars.renderDeployment }}/deploy
            outPath: ./out/${{ vars.renderPath }}

        - uses: git-commit
          config:
            path: ./out
            message: Review production render for ${{ imageFrom(vars.imageRepo).Tag }}

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
            title: Review CodeAI production render for ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-wait-for-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

The exact live-source sparse checkout pattern is still shared in
[Live Source Checkout at Freight Commit](../modules/live-source-checkout-at-freight-commit.md).

## GH runner sketch

This is the least Kargo-specific runner shape:

1. Build and stitch the multiplatform app image.
2. Publish immutable `git-<full-commit-sha>` tag.
3. Optionally also publish the branch alias tag such as `staging`.
4. Do not check out `k8s-gitops`.
5. Do not write `warehouses/codeai/*`.
6. Let the Warehouse discover Freight directly from the image repo and source
   repo.

That is why this is the pure-Kargo benchmark. The CI job only produces the real
upstream artifacts; Kargo does the pairing.

### Testing Plan

Recommended automation:
- Extend [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or call a small reusable workflow from it for repo-specific contract and render smoke checks.
- Use existing Drone results on the promoted `gitCommit` as the app/unit/UI gate before downstream promotion.
- Use Kargo `verification` with `AnalysisTemplate`s for post-sync rollout/health/smoke checks in `test`.

Simple tests to automate:
- In `k8s.yml`, immediately after `stitch-multiplatform-image`, assert the produced image tag is exactly `git-<full-commit-sha>`.
- In the same workflow, check out `k8s-gitops` read-only and validate [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml) reads deployment metadata from `main` and deploys `apps/codeai/deployments/{{path.basename}}/deploy` from `stage/{{path.basename}}`.
- In the same workflow, validate every `apps/codeai/deployments/<deployment>/deployment.yaml` has `envType` and `namespace`, because this plan resolves envType from deployment metadata at promotion time.
- For the Helm variant, run `helm template` from [/Users/seth/.codex/worktrees/684f/code-dot-org/k8s/helm](/Users/seth/.codex/worktrees/684f/code-dot-org/k8s/helm) using deployment metadata from `apps/codeai/deployments/<deployment>/deployment.yaml`, envType values from `apps/codeai/envTypes/<envType>.values.yaml`, and deployment values from `apps/codeai/deployments/<deployment>/values.yaml`, writing to a temp `apps/codeai/deployments/<deployment>/deploy/` tree.
- For the Kustomize variant, run `kustomize build` from a temp tree assembled from the checked-in `k8s/kustomize/` source, `apps/codeai/envTypes/<envType>/` as a Component, any referenced `apps/codeai/envTypes/components/` subcomponents such as `autoscaling`, and a copied `apps/codeai/kargo/templates/deploy/` dir whose `kustomization.yaml` `namespace`, `resources`, and `components` fields are updated before `kustomize-set-image` rewrites `code-dot-org` to `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`. Do not use `k8s/kustomize/overlays` or `bin/` in production code paths.

Avoid as baseline coverage:
- A live Kargo or expr-engine harness whose main purpose is proving `freightCreationCriteria` works inside the controller. If upstream later provides a first-class preflight for that expression shape, use it instead of custom harness code.
