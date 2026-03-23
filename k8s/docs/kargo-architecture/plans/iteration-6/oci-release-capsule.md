# OCI Release Capsule

- Short name: OCI Capsule
- Catchy description: Make one immutable registry object the center of release
  truth, then render from that object instead of chasing source at promotion
  time.
- It is: packaging-agnostic plan
- It uses: hybrid pattern

## Warehouse artifact structure under `warehouses/codeai/`

```text
warehouses/codeai/
  capsules/
    git-<full-commit-sha>/
      release.yaml
      package/
        helm/...
        kustomize-base/...
      metadata/
        sbom.json
        provenance.json
```

This directory is packaged into a single OCI artifact such as
`ghcr.io/code-dot-org/codeai-release-capsule:git-<full-commit-sha>`.

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

### Kustomize capsule contents

```text
release.yaml
package/
  kustomize/
    base/
    components/
metadata/
  sbom.json
  provenance.json
```

The Kustomize capsule should contain only the shared app package. Long-lived
env overlays stay outside the capsule in `k8s-gitops`.

## Freight definition

Freight is anchored on the app image tag `git-<full-commit-sha>`. The matching OCI release
capsule uses the same tag. Promotion verifies that:
- image tag and capsule tag match
- `release.yaml` inside the capsule names the same `$gitcommit`
- image digest in the capsule matches the actual image digest from Freight

## Full Kargo project design

- `Warehouse codeai-image` subscribes to the app image repo as it does today.
- Stages use `oci-download` to fetch the matching release capsule by image tag.
- `staging` verifies the image/capsule pair, unpacks the capsule, renders
  staging output, and commits rendered manifests to `k8s-gitops`.
- `review-infra-changes` renders downstream envs and opens a PR in
  `k8s-gitops`.
- `test`, `autoscale-prod`, and `levelbuilder` all promote the same image tag
  and rehydrate the same capsule.
- ArgoCD still consumes rendered manifests from Git, not OCI artifacts
  directly.

### Common promotion skeleton

Every stage uses the same common steps:

1. Clone `k8s-gitops` for env policy and rendered output.
2. Resolve the promoted image Freight.
3. `oci-download` the capsule whose tag matches that image.
4. Verify:
   - image tag matches capsule tag
   - `release.yaml.gitCommit` matches the tag identity
   - `release.yaml.image.digest` matches the promoted image digest
5. Unpack the capsule into a temp working directory.
6. Render the target stage using the unpacked package plus env policy from
   `k8s-gitops`.
7. Commit rendered output to the target stage branch/path.
8. Sync Argo or open a PR, depending on the stage.

### Helm-specific render path

Use the unpacked chart plus env values from `k8s-gitops`:

1. Unpack `package/helm/`.
2. Read env values from:
   - `apps/codeai/envTypes/<env>.values.yaml`
   - `apps/codeai/deployments/<env>/values.yaml`
3. Run `helm-template` against the unpacked chart.
4. Write rendered output to the stage branch/path in `k8s-gitops`.

This is the easier packaging form for the capsule because Kargo already has a
clear story for `oci-download` plus Helm rendering.

### Kustomize-specific render path

Use the unpacked shared base/components plus env overlays from `k8s-gitops`:

1. Unpack `package/kustomize/base/` and `package/kustomize/components/`.
2. Read the target env overlay from `k8s-gitops`, for example:
   - `apps/codeai/overlays/<env>/`
   - or a future `apps/codeai/envTypes/<env>/` Kustomize structure
3. Assemble a temp source tree combining:
   - capsule base/components
   - GitOps env overlay/policy
4. Set the promoted image digest/tag in the assembled source tree.
5. Run `kustomize-build`.
6. Write rendered output to the stage branch/path in `k8s-gitops`.

This is still workable, but it needs more composition glue than the Helm path.

## Stage-by-stage promotion flow

1. CI builds the image and pushes `git-<full-commit-sha>`.
2. CI snapshots the deploy package at that same `$gitcommit` and publishes it
   as an OCI release capsule with the same tag.
3. `staging` downloads the capsule, verifies it against the image Freight, and
   renders staging.
4. `review-infra-changes` opens a PR with rendered diffs for downstream envs.
5. `test` syncs after review approval and runs verification.
6. `autoscale-prod` and `levelbuilder` reuse the same capsule for their stage
   renders.

The important point is that the shared app package is frozen once in the
capsule, while stage-specific policy stays outside the capsule and is layered in
at promotion time.

## `review infra changes` stage behavior

- The review PR contains generated manifest diffs plus capsule metadata.
- Reviewers do not inspect the OCI artifact directly in normal flow; they review
  rendered Git output and metadata links.
- A failed capsule/image verification blocks PR creation.
- For Helm, the PR diff is the rendered result of the frozen chart plus
  production values.
- For Kustomize, the PR diff is the rendered result of the frozen base/components
  plus production overlay/policy.

## `test` stage automation behavior

- Pull the capsule again and verify digest consistency.
- Sync the test Application.
- Run rollout, smoke, and drift checks.
- Fail if the rendered output diverges from the capsule contents and env values.
- Keep the same capsule across all downstream stages; only the stage policy
  input changes.

## Does it break/awkwardize skaffold or local-dev in any way?

No for day-to-day local work. Skaffold continues to use the live Helm chart in
`code-dot-org`. The OCI capsule is a CI/CD release artifact, not a local author
surface.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/                  # optional future structure
  release/
    capsule/
```

`k8s-gitops`:

```text
apps/codeai/
  envTypes/
  deployments/
  rendered/
    staging/
    test/
    production/
    levelbuilder/
```

## Pros / cons

### Pros

- Clean immutable object model.
- No giant-monorepo promotion reads.
- Good artifact integrity story without abandoning Git-based review output.
- Keeps the release payload together instead of pairing artifacts loosely later.

### Cons

- Generic OCI artifacts are still less native to Warehouse subscriptions than
  images and Git.
- Requires custom capsule packaging and verification glue.
- Operators need one more registry-native concept to understand.

## Migration notes

- Start by publishing capsules alongside the current image-only flow.
- Add capsule verification in staging before making it mandatory everywhere.
- Keep Argo on rendered Git output to avoid combining too many big changes at
  once.

## Any useful implementation notes that do not fit neatly elsewhere

- Reuse the image tag as the capsule tag to avoid extra identity mapping.
- Include the exact image digest in `release.yaml`.
- Keep the capsule schema stable across Helm and future Kustomize packaging.
- Keep env-specific values or overlays out of the capsule so environment policy
  can still evolve in GitOps.
- If the capsule is generic OCI content rather than an OCI Helm chart, Kargo is
  using it as a promotion-time downloaded artifact, not as the cleanest
  first-class Warehouse subscription type.

# Code changes

## k8s-gitops changes

- Add rendered output directories.
- Add a `review-infra-changes` Stage.
- Update Argo to deploy rendered output from Git.
- Add metadata recording the approved capsule digest per environment.

## code-dot-org changes

- Add CI packaging and push for the OCI release capsule.
- Add capsule verification helpers used by Kargo promotion steps.
- Replace image-only assumptions in release metadata generation.

# Implementation Sketch Details

This section is intentionally more concrete than the rest of the plan. It is
still a sketch, but it is meant to answer "what would the actual Kargo objects
look like?"

## Example capsule `release.yaml`

```yaml
schemaVersion: codeai/v1alpha1
gitCommit: 0cc4cd87f40ae606d1822d5652b552f8c50a4668
image:
  repoURL: ghcr.io/code-dot-org/code-dot-org
  tag: git-0cc4cd87f40ae606d1822d5652b552f8c50a4668
  digest: sha256:1111111111111111111111111111111111111111111111111111111111111111
package:
  kind: helm
  path: package/helm
metadata:
  sbomPath: metadata/sbom.json
  provenancePath: metadata/provenance.json
```

For the Kustomize form, `package.kind` becomes `kustomize` and `package.path`
points at `package/kustomize/`.

## Example Warehouse

The capsule plan stays image-anchored. The Warehouse only needs to discover the
real application image stream. Promotion derives the matching capsule ref from
the promoted image tag.

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai-image
  namespace: kargo-codeai
spec:
  subscriptions:
    - image:
        repoURL: ghcr.io/code-dot-org/code-dot-org
```

## Example `staging` Stage using a Helm capsule

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: staging
  namespace: kargo-codeai
spec:
  requestedFreight:
    - origin:
        kind: Warehouse
        name: codeai-image
      sources:
        direct: true
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
    - name: capsuleRepo
      value: ghcr.io/code-dot-org/codeai-release-capsule
    - name: targetBranch
      value: stage/${{ ctx.stage }}
    - name: releaseName
      value: codeai
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
            path: ./out

        - uses: oci-download
          config:
            imageRef: ${{ vars.capsuleRepo }}:${{ imageFrom(vars.imageRepo).Tag }}
            outPath: ./capsule.tgz

        - uses: untar
          config:
            inPath: ./capsule.tgz
            outPath: ./capsule

        - uses: yaml-parse
          as: capsule-release
          config:
            path: ./capsule/release.yaml
            outputs:
              - name: gitCommit
                fromExpression: gitCommit
              - name: imageRepo
                fromExpression: image.repoURL
              - name: imageTag
                fromExpression: image.tag
              - name: imageDigest
                fromExpression: image.digest
              - name: packageKind
                fromExpression: package.kind

        # Real implementation needs one fail-fast helper here that blocks the
        # promotion if the parsed release metadata does not match the promoted
        # Freight. Kargo has the pieces to download and parse the capsule, but
        # the actual assertion is still custom glue.

        - uses: set-metadata
          config:
            updates:
              - kind: Stage
                name: staging
                values:
                  promotedImage:
                    repoURL: ${{ imageFrom(vars.imageRepo).RepoURL }}
                    tag: ${{ imageFrom(vars.imageRepo).Tag }}
                    digest: ${{ imageFrom(vars.imageRepo).Digest }}
                  capsule:
                    repoURL: ${{ vars.capsuleRepo }}
                    tag: ${{ outputs['capsule-release'].imageTag }}
                    packageKind: ${{ outputs['capsule-release'].packageKind }}
                    gitCommit: ${{ outputs['capsule-release'].gitCommit }}

        - uses: helm-template
          config:
            path: ./capsule/package/helm
            releaseName: ${{ vars.releaseName }}
            outPath: ./out
            valuesFiles:
              - ./src/apps/codeai/envTypes/${{ ctx.stage }}.values.yaml
              - ./src/apps/codeai/deployments/${{ ctx.stage }}/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-commit
          as: commit
          config:
            path: ./out
            message: |
              Render ${{ ctx.stage }} from OCI release capsule

              image: ${{ imageFrom(vars.imageRepo).RepoURL }}:${{ imageFrom(vars.imageRepo).Tag }}
              digest: ${{ imageFrom(vars.imageRepo).Digest }}
              capsule: ${{ vars.capsuleRepo }}:${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-push
          config:
            path: ./out
            branch: ${{ vars.targetBranch }}

        - uses: argocd-update
          config:
            apps:
              - name: codeai-${{ ctx.stage }}
                sources:
                  - repoURL: ${{ vars.gitopsRepo }}
                    desiredRevision: ${{ outputs.commit.commit }}
                    updateTargetRevision: true
```

## Example `review-infra-changes` Stage

This is the same capsule flow, but instead of syncing directly it pushes to a
generated branch and opens a PR against the long-lived stage branch.

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Stage
metadata:
  name: review-infra-changes
  namespace: kargo-codeai
spec:
  requestedFreight:
    - origin:
        kind: Warehouse
        name: codeai-image
      sources:
        stages:
          - staging
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
    - name: capsuleRepo
      value: ghcr.io/code-dot-org/codeai-release-capsule
    - name: targetBranch
      value: stage/production
    - name: releaseName
      value: codeai
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
            path: ./out
        - uses: oci-download
          config:
            imageRef: ${{ vars.capsuleRepo }}:${{ imageFrom(vars.imageRepo).Tag }}
            outPath: ./capsule.tgz
        - uses: untar
          config:
            inPath: ./capsule.tgz
            outPath: ./capsule
        - uses: helm-template
          config:
            path: ./capsule/package/helm
            releaseName: ${{ vars.releaseName }}
            outPath: ./out
            valuesFiles:
              - ./src/apps/codeai/envTypes/production.values.yaml
              - ./src/apps/codeai/deployments/production/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ imageFrom(vars.imageRepo).Tag }}
        - uses: git-commit
          config:
            path: ./out
            message: |
              Review production render from OCI capsule

              image: ${{ imageFrom(vars.imageRepo).RepoURL }}:${{ imageFrom(vars.imageRepo).Tag }}
              capsule: ${{ vars.capsuleRepo }}:${{ imageFrom(vars.imageRepo).Tag }}
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
          as: wait-for-pr
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
        - uses: argocd-update
          config:
            apps:
              - name: codeai-production
                sources:
                  - repoURL: ${{ vars.gitopsRepo }}
                    desiredRevision: ${{ outputs['wait-for-pr'].commit }}
                    updateTargetRevision: true
```

## Kustomize delta

The Kustomize path is the same overall design, but the render steps change:

```yaml
        - uses: copy
          config:
            inPath: ./capsule/package/kustomize/base
            outPath: ./work/base

        - uses: copy
          config:
            inPath: ./src/apps/codeai/overlays/${{ ctx.stage }}
            outPath: ./work/overlays/${{ ctx.stage }}

        - uses: kustomize-set-image
          as: set-image
          config:
            path: ./work/overlays/${{ ctx.stage }}
            images:
              - image: ${{ vars.imageRepo }}
                digest: ${{ imageFrom(vars.imageRepo).Digest }}

        - uses: kustomize-build
          config:
            path: ./work/overlays/${{ ctx.stage }}
            outPath: ./out
```

That is the main reason the capsule plan is more natural in Helm first and more
glue-heavy in packaging-agnostic/Kustomize mode.

## The one custom helper still needed

The built-in Kargo steps are already enough for:

- image-driven Freight discovery
- downloading the capsule
- unpacking it
- parsing `release.yaml`
- rendering Helm or Kustomize
- pushing stage branches
- opening and waiting on PRs

The missing piece is a small fail-fast helper that turns "parsed capsule fields
do not match promoted Freight" into a hard promotion failure. The cleanest
versions are:

- a tiny custom promotion task or service invoked during promotion
- or a verification-time `AnalysisTemplate` that re-checks capsule metadata
  against the deployed Freight and stored Stage metadata

That gap is real, but it is small. It is exactly the kind of custom glue this
plan is already admitting.
