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
package path; the `package/` tree contains either Helm chart files or a shared
Kustomize package; `metadata/` carries provenance and SBOM data. Promotion must
download the capsule, confirm the tag/digest/package metadata match the Freight
identity, and then render from the exact path recorded in the capsule. The
important tricky part is that the capsule is not a generic blob archive: the
package path inside the artifact is part of the contract, so Helm and Kustomize
must each have a predictable internal layout that downstream steps can trust.

For Helm, the capsule is mostly a frozen chart plus values; for Kustomize, it is
the shared `k8s/kustomize` package plus GitOps-side env policy and wrapper
inputs. That means the Kustomize form still depends on `k8s-gitops` for
environment shaping, but it does not depend on live `code-dot-org` source at
promotion time. The alternate package-pair form in this doc is intentionally
weaker and more incremental: it keeps the same image+package pairing but splits
the release witness into Git plus OCI artifacts. The full capsule is the
stronger, more opinionated version when the team wants one registry-native
release object to own both the deploy payload and its provenance.
For this handoff, the full capsule form is the required implementation target.
Treat the package-pair text below as future-only context, not as a co-equal
first-pass option.
- It is: packaging-agnostic plan
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
  # or
    kustomize/...
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
  kind: helm # or kustomize
  path: package/helm # or package/kustomize
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
      kustomize/...
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

The Kustomize capsule should contain only the shared app package. Promotion
must take its Kustomize package input from inside `package/kustomize/`.
Long-lived env overlays stay outside the capsule in `k8s-gitops`.

Both OCI sub-plans in this doc should get `package/kustomize/` from a GH action
running in the `code-dot-org` repo that sources from `k8s/kustomize/**`.
The path inside the uploaded OCI artifact is part of the contract: the GH
action must lay out the artifact so that after `oci-download` and unpack,
Kargo finds the package exactly at `package.path` from the release metadata
(`package/kustomize` for Kustomize, `package/helm` for the capsule Helm form).
For the Kustomize form, this means Kargo should expect to find files such as
`package/kustomize/base/kustomization.yaml` and
`package/kustomize/components/...` after unpack, and should use
`package/kustomize/base` as the shared package base input.
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
  - Generic subvariant: `ghcr.io/code-dot-org/codeai-packages@sha256:...`
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
  ref: ghcr.io/code-dot-org/codeai-packages@sha256:...
  digest: sha256:...
  kind: helm-chart # or generic-bundle
  format: helm-chart-tgz # or kustomize-tar
  path: . # helm chart root, or package/kustomize for the Kustomize pair form
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

Kustomize pair form:

```text
image:
  ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>

package artifact:
  ghcr.io/code-dot-org/codeai-packages:git-<full-commit-sha>

# inside the generic package artifact
package/
  kustomize/
    base/
    components/

git witness:
  warehouses/codeai/releases/git-<full-commit-sha>/release.yaml
```

The Kustomize package-pair form follows the same packaging rule as the capsule
form: the package input comes from `package/kustomize/`, and that package is
built by a GH action running in the `code-dot-org` repo that sources from
`k8s/kustomize/**`.
The path inside the uploaded artifact is part of the contract here too: the GH
action must publish the package so that after download and unpack, Kargo finds
the package at the exact `package.path` recorded in the witness.
For the Kustomize pair form, that means the witness should record
`package.path: package/kustomize`, and Kargo should expect to find
`package/kustomize/base/kustomization.yaml` after unpack.
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
   - Kustomize: generic OCI bundle ref
6. Unpack the package artifact into a temp working directory and read the
   package from the exact `package.path` recorded in the witness.
7. Render the target stage using the unpacked package plus env policy from
   `k8s-gitops`.
8. Commit rendered output to the target stage branch/path.

### Package Pair GH runner sketch

If the team chooses the pair form instead of the full capsule, the GH runner
should do this:

1. Build and stitch the app image exactly as today.
2. Resolve the final pushed image digest.
3. Create a temp package worktree such as:
   - Helm: chart package created from `k8s/helm/`
   - Kustomize:
     - `package/kustomize/base/...`
     - `package/kustomize/components/...`
4. For the Kustomize package, have the GH action populate `package/kustomize/`
   from `k8s/kustomize/**` in the `code-dot-org` repo. Implementors should not
   use the checked-in `overlays/` or `bin/` subdirs in Kargo or Argo production
   code paths.
5. Publish the package artifact:
   - Helm: `helm package` then `helm push`
   - Kustomize: archive the package directory and push it as a generic OCI
     artifact such as `ghcr.io/code-dot-org/codeai-packages:git-<full-commit-sha>`
6. Write the Git witness at
   `warehouses/codeai/releases/git-<full-commit-sha>/release.yaml` with:
   - `releaseId`
   - `gitCommit`
   - image ref/digest
   - package ref/digest
   - package kind/format
   - package path that Kargo will later read after unpack
7. Commit and push the witness to `k8s-gitops`.
8. Keep the Kargo Warehouse image-led and have promotion derive the witness path
   from the promoted image tag.

This is future-only context and should not be used to scope the first
contractor implementation.

## Full Kargo project design

- `Warehouse codeai-image` subscribes to the app image repo as it does today.
- Stages use `oci-download` to fetch the matching release capsule by image tag.
- `staging` verifies the image/capsule pair, unpacks the capsule, renders
  staging output, and commits rendered manifests to `k8s-gitops`.
- `test` rehydrates the same capsule, renders test output, syncs, and runs
  verification.
- `levelbuilder` and `review-infra-changes` both promote the exact Freight
  verified in `test`, rehydrate the same capsule, and render with different
  stage policy.
- `production` syncs the already-reviewed `stage/production` output after the
  PR merge.
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
   - `apps/codeai/envTypes/<envType>.values.yaml`
   - `apps/codeai/deployments/<deployment>/values.yaml`
3. Run `helm-template` against the unpacked chart.
4. Write rendered output to the stage branch/path in `k8s-gitops`.

This is the easier packaging form for the capsule because Kargo already has a
clear story for `oci-download` plus Helm rendering.

### Kustomize-specific render path

Use the unpacked shared base/components plus envType Components and a copied
temp wrapper from `k8s-gitops`:

1. Unpack `package/kustomize/` from inside the capsule. Use only its shared
   `base/` and `components/` package inputs.
   Kargo should expect files such as `package/kustomize/base/kustomization.yaml`
   after unpack.
2. Copy the generic wrapper template dir from `k8s-gitops` at
   `apps/codeai/kargo/templates/deploy/`.
3. Assemble a temp source tree combining:
   - capsule base/components
   - GitOps envType Component and any referenced `envTypes/components/`
     subcomponents
   - the copied temp wrapper
4. Update the copied wrapper with `deployment.yaml.namespace`,
   `resources: ../../source/base`, and
   `components: ../../envTypes/<envType>`.
5. Set the promoted image tag in the temp wrapper with `kustomize-set-image`,
   matching the real base image name `code-dot-org`.
6. Run `kustomize-build`.
7. Write rendered output to the stage branch/path in `k8s-gitops`.

Do not pull Kustomize packaging input from `code-dot-org/k8s/kustomize/overlays`
or `code-dot-org/k8s/kustomize/bin` in production code paths. Those are
currently local-dev/parity support surfaces, not release payload.

This is still workable, but it needs more composition glue than the Helm path.

## Stage-by-stage promotion flow

1. CI builds the image and pushes `git-<full-commit-sha>`.
2. CI snapshots the deploy package at that same `$gitcommit` and publishes it
   as an OCI release capsule with the same tag.
3. `staging` downloads the capsule, verifies it against the image Freight, and
   renders staging.
4. `test` downloads the same capsule, renders test, syncs, and runs
   verification.
5. `levelbuilder` and `review-infra-changes` both reuse the exact capsule
   verified in `test`.
6. `review-infra-changes` opens a PR against `stage/production`.
7. `production` syncs the already-reviewed `stage/production` branch after the
   PR merge.

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
- Use Kargo `verification` / `AnalysisTemplate`s for rollout, health, and smoke checks.
- Require existing Drone unit/UI results for the same promoted `gitCommit` before downstream promotion.
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
    base/
    components/
    overlays/
    bin/
  release/
    capsule/
```

Use only `k8s/kustomize/base/` and `k8s/kustomize/components/` in Kargo/Argo
production code paths. The checked-in `overlays/` and `bin/` trees are
currently local-dev/parity support.

`k8s-gitops`:

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

Helm-shaped capsule use should keep:

```text
apps/codeai/
  envTypes/
    <envType>.values.yaml
  deployments/
    <deployment>/
      deployment.yaml
      values.yaml
```

Kustomize-shaped capsule use should keep:

```text
apps/codeai/
  envTypes/
    <envType>/
    components/
  deployments/
    <deployment>/
      deployment.yaml
  kargo/
    templates/
      deploy/
        kustomization.yaml
```

For the Kustomize-shaped form, `main` keeps envType Components and the generic
temp-wrapper template at `apps/codeai/kargo/templates/deploy/`. The
rendered `deploy/` tree stays on `stage/*` as generated output only.

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

## Iteration 7 notes
- Keep this as the primary OCI-forward plan and implement the full capsule form
  first.
- Keep `OCI Package Pair` only as future-context text, not as a co-equal first
  pass target.
- The real evaluation question is whether the capsule is cleaner enough than
  the pair to justify the extra packaging/verification glue, but that is a
  follow-on question, not the initial contractor scope.

# Code changes

## k8s-gitops changes

- Add rendered output directories.
- Add `apps/codeai/kargo/templates/deploy/kustomization.yaml` as the generic
  Kustomize temp-wrapper template copied into promotion work dirs.
- Add a `review-infra-changes` Stage.
- Update Argo to deploy rendered output from Git.
- Add metadata recording the approved capsule digest per environment.

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

## code-dot-org changes

- Add CI packaging and push for the OCI release capsule.
- Add the plan-owned `codeai-release-verify` helper/service used by Kargo
  promotion steps.
- Replace image-only assumptions in release metadata generation.

## modules that are part of implementing this plan

- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)

# Sketch of Pivotal Implementation Details

This section is intentionally more concrete than the rest of the plan. It is
still a sketch, but it is meant to answer "what would the actual Kargo objects
look like?"

## Shared mechanics

This plan reuses:
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)

## Helm implementation starting point

Treat the checked-in `code-dot-org/k8s/helm/` tree as the starting point, not a
frozen contract. The implementor may modify or reshape `k8s/helm/` if this plan
benefits from it, but should preserve current behavior unless the change
materially improves the plan before packaging it into the capsule.

## Kustomize implementation starting point

Treat the checked-in `code-dot-org/k8s/kustomize/` tree as the starting point,
not a frozen contract. The implementor may modify or reshape `k8s/kustomize/`
as needed for this plan, especially the base/components layout, before
packaging it into the capsule.

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

## Required verifier contract

This plan is not handoff-ready unless capsule verification is concrete. The
required contract is:

`codeai-release-verify` is part of this plan's required implementation and
should live in the `code-dot-org` repo for the first pass.

- service name: `codeai-release-verify`
- invocation: Kargo `http` step, `POST`
- inputs:
  - promoted image repo, tag, digest
  - parsed `release.yaml`
  - expected capsule ref
- assertions:
  - promoted image tag equals `release.yaml.image.tag`
  - promoted image digest equals `release.yaml.image.digest`
  - `release.yaml.gitCommit` matches the `git-<full-commit-sha>` tag suffix
- `release.yaml.package.kind` is one of `helm` or `kustomize`
- `release.yaml.package.path` stays under `package/`
- success output:
  - verified release metadata object
  - normalized `packageKind`
  - normalized `packagePath`
  - verified `gitCommit`
- failure behavior:
  - return a non-2xx or `ok: false` with a readable mismatch reason
- Kargo treats that as a terminal failure and stops promotion before render

For the required implementation, this contract is the only allowed verifier
shape.

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
  namespace: kargo-project-codeai
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
  namespace: kargo-project-codeai
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

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./src/apps/codeai/deployments/${{ ctx.stage }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

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
              - name: packagePath
                fromExpression: package.path

        - uses: http
          as: verify-release
          config:
            method: POST
            url: http://codeai-release-verify.kargo-project-codeai.svc.cluster.local/verify
            headers:
              - name: Content-Type
                value: application/json
            body: |
              ${{ quote({
                "image": {
                  "repoURL": imageFrom(vars.imageRepo).RepoURL,
                  "tag": imageFrom(vars.imageRepo).Tag,
                  "digest": imageFrom(vars.imageRepo).Digest
                },
                "capsule": {
                  "repoURL": vars.capsuleRepo,
                  "tag": imageFrom(vars.imageRepo).Tag
                },
                "release": {
                  "gitCommit": outputs['capsule-release'].gitCommit,
                  "imageRepo": outputs['capsule-release'].imageRepo,
                  "imageTag": outputs['capsule-release'].imageTag,
                  "imageDigest": outputs['capsule-release'].imageDigest,
                  "packageKind": outputs['capsule-release'].packageKind,
                  "packagePath": outputs['capsule-release'].packagePath
                }
              }) }}
            successExpression: response.status == 200 && response.body.ok == true
            failureExpression: response.status >= 400 || response.body.ok == false
            outputs:
              - name: verifiedGitCommit
                fromExpression: response.body.release.gitCommit
              - name: verifiedPackageKind
                fromExpression: response.body.release.packageKind
              - name: verifiedPackagePath
                fromExpression: response.body.release.packagePath
              - name: mismatchReason
                fromExpression: response.body.reason

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
                    packageKind: ${{ outputs['verify-release'].verifiedPackageKind }}
                    gitCommit: ${{ outputs['verify-release'].verifiedGitCommit }}

        - uses: helm-template
          config:
            path: ./capsule/package/helm
            releaseName: ${{ vars.releaseName }}
            outPath: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy
            valuesFiles:
              - ./src/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}.values.yaml
              - ./src/apps/codeai/deployments/${{ ctx.stage }}/values.yaml
            setValues:
              - key: image.repository
                value: ${{ vars.imageRepo }}
              - key: image.tag
                value: ${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-commit
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
```

## Example `staging` Stage using a Kustomize capsule

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

        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./src/apps/codeai/deployments/${{ ctx.stage }}/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType

        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/${{ ctx.stage }}/deploy

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
              - name: packagePath
                fromExpression: package.path

        - uses: http
          as: verify-release
          config:
            method: POST
            url: http://codeai-release-verify.kargo-project-codeai.svc.cluster.local/verify
            headers:
              - name: Content-Type
                value: application/json
            body: |
              ${{ quote({
                "image": {
                  "repoURL": imageFrom(vars.imageRepo).RepoURL,
                  "tag": imageFrom(vars.imageRepo).Tag,
                  "digest": imageFrom(vars.imageRepo).Digest
                },
                "capsule": {
                  "repoURL": vars.capsuleRepo,
                  "tag": imageFrom(vars.imageRepo).Tag
                },
                "release": {
                  "gitCommit": outputs['capsule-release'].gitCommit,
                  "imageRepo": outputs['capsule-release'].imageRepo,
                  "imageTag": outputs['capsule-release'].imageTag,
                  "imageDigest": outputs['capsule-release'].imageDigest,
                  "packageKind": outputs['capsule-release'].packageKind,
                  "packagePath": outputs['capsule-release'].packagePath
                }
              }) }}
            successExpression: response.status == 200 && response.body.ok == true
            failureExpression: response.status >= 400 || response.body.ok == false
            outputs:
              - name: verifiedGitCommit
                fromExpression: response.body.release.gitCommit
              - name: verifiedPackageKind
                fromExpression: response.body.release.packageKind
              - name: verifiedPackagePath
                fromExpression: response.body.release.packagePath
              - name: mismatchReason
                fromExpression: response.body.reason

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
                    packageKind: ${{ outputs['verify-release'].verifiedPackageKind }}
                    gitCommit: ${{ outputs['verify-release'].verifiedGitCommit }}

        - uses: copy
          config:
            inPath: ./capsule/package/kustomize
            outPath: ./work/deployments/source

        - uses: copy
          config:
            inPath: ./src/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}
            outPath: ./work/deployments/envTypes/${{ outputs['deployment-meta'].envType }}

        - uses: copy
          config:
            inPath: ./src/apps/codeai/envTypes/components
            outPath: ./work/deployments/envTypes/components

        - uses: copy
          config:
            inPath: ./src/apps/codeai/kargo/templates/deploy
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
            message: |
              Render ${{ ctx.stage }} from OCI release capsule

              image: ${{ imageFrom(vars.imageRepo).RepoURL }}:${{ imageFrom(vars.imageRepo).Tag }}
              digest: ${{ imageFrom(vars.imageRepo).Digest }}
              capsule: ${{ vars.capsuleRepo }}:${{ imageFrom(vars.imageRepo).Tag }}

        - uses: git-push
          config:
            path: ./out
            branch: ${{ vars.targetBranch }}
```

## Example `review-infra-changes` Stage

This is the same capsule flow, but instead of syncing directly it pushes to a
generated branch and opens a PR against the long-lived stage branch.

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
        name: codeai-image
      sources:
        stages:
          - test
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
        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./src/apps/codeai/deployments/production/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
              - name: namespace
                fromExpression: namespace
        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/production/deploy
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
              - name: packagePath
                fromExpression: package.path
        - uses: http
          as: verify-release
          config:
            method: POST
            url: http://codeai-release-verify.kargo-project-codeai.svc.cluster.local/verify
            headers:
              - name: Content-Type
                value: application/json
            body: |
              ${{ quote({
                "image": {
                  "repoURL": imageFrom(vars.imageRepo).RepoURL,
                  "tag": imageFrom(vars.imageRepo).Tag,
                  "digest": imageFrom(vars.imageRepo).Digest
                },
                "capsule": {
                  "repoURL": vars.capsuleRepo,
                  "tag": imageFrom(vars.imageRepo).Tag
                },
                "release": {
                  "gitCommit": outputs['capsule-release'].gitCommit,
                  "imageRepo": outputs['capsule-release'].imageRepo,
                  "imageTag": outputs['capsule-release'].imageTag,
                  "imageDigest": outputs['capsule-release'].imageDigest,
                  "packageKind": outputs['capsule-release'].packageKind,
                  "packagePath": outputs['capsule-release'].packagePath
                }
              }) }}
            successExpression: response.status == 200 && response.body.ok == true
            failureExpression: response.status >= 400 || response.body.ok == false
            outputs:
              - name: verifiedPackageKind
                fromExpression: response.body.release.packageKind
        - uses: helm-template
          config:
            path: ./capsule/package/helm
            releaseName: ${{ vars.releaseName }}
            outPath: ./out/apps/codeai/deployments/production/deploy
            valuesFiles:
              - ./src/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}.values.yaml
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
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

## Example `review-infra-changes` Stage using a Kustomize capsule

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
        name: codeai-image
      sources:
        stages:
          - test
  vars:
    - name: gitopsRepo
      value: https://github.com/code-dot-org/k8s-gitops.git
    - name: imageRepo
      value: ghcr.io/code-dot-org/code-dot-org
    - name: capsuleRepo
      value: ghcr.io/code-dot-org/codeai-release-capsule
    - name: targetBranch
      value: stage/production
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
        - uses: yaml-parse
          as: deployment-meta
          config:
            path: ./src/apps/codeai/deployments/production/deployment.yaml
            outputs:
              - name: envType
                fromExpression: envType
        - uses: git-clear
          config:
            path: ./out/apps/codeai/deployments/production/deploy
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
              - name: packagePath
                fromExpression: package.path
        - uses: http
          as: verify-release
          config:
            method: POST
            url: http://codeai-release-verify.kargo-project-codeai.svc.cluster.local/verify
            headers:
              - name: Content-Type
                value: application/json
            body: |
              ${{ quote({
                "image": {
                  "repoURL": imageFrom(vars.imageRepo).RepoURL,
                  "tag": imageFrom(vars.imageRepo).Tag,
                  "digest": imageFrom(vars.imageRepo).Digest
                },
                "capsule": {
                  "repoURL": vars.capsuleRepo,
                  "tag": imageFrom(vars.imageRepo).Tag
                },
                "release": {
                  "gitCommit": outputs['capsule-release'].gitCommit,
                  "imageRepo": outputs['capsule-release'].imageRepo,
                  "imageTag": outputs['capsule-release'].imageTag,
                  "imageDigest": outputs['capsule-release'].imageDigest,
                  "packageKind": outputs['capsule-release'].packageKind,
                  "packagePath": outputs['capsule-release'].packagePath
                }
              }) }}
            successExpression: response.status == 200 && response.body.ok == true
            failureExpression: response.status >= 400 || response.body.ok == false
            outputs:
              - name: verifiedPackageKind
                fromExpression: response.body.release.packageKind
        - uses: copy
          config:
            inPath: ./capsule/package/kustomize
            outPath: ./work/deployments/source
        - uses: copy
          config:
            inPath: ./src/apps/codeai/envTypes/${{ outputs['deployment-meta'].envType }}
            outPath: ./work/deployments/envTypes/${{ outputs['deployment-meta'].envType }}
        - uses: copy
          config:
            inPath: ./src/apps/codeai/envTypes/components
            outPath: ./work/deployments/envTypes/components
        - uses: copy
          config:
            inPath: ./src/apps/codeai/kargo/templates/deploy
            outPath: ./work/deployments/production/deploy
        # The temp wrapper template provides apiVersion/kind and one
        # `images` entry whose match key is `code-dot-org`.
        - uses: yaml-update
          config:
            path: ./work/deployments/production/deploy/kustomization.yaml
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
            path: ./work/deployments/production/deploy
            images:
              - image: code-dot-org
                newName: ${{ vars.imageRepo }}
                tag: ${{ imageFrom(vars.imageRepo).Tag }}
        - uses: kustomize-build
          config:
            path: ./work/deployments/production/deploy
            outPath: ./out/apps/codeai/deployments/production/deploy
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
          config:
            repoURL: ${{ vars.gitopsRepo }}
            prNumber: ${{ outputs['open-pr'].pr.id }}
```

That is the main reason the capsule plan is more natural in Helm first and more
glue-heavy in packaging-agnostic/Kustomize mode.

## Verifier response shape

`codeai-release-verify` should return JSON shaped like:

```json
{
  "ok": true,
  "reason": "",
  "release": {
    "gitCommit": "0cc4cd87f40ae606d1822d5652b552f8c50a4668",
    "packageKind": "helm",
    "packagePath": "package/helm"
  }
}
```

On mismatch, return `ok: false` plus a short `reason`, for example
`image digest mismatch between Freight and capsule release.yaml`.

## GH runner sketch

This runner is materially different from the Git-only plans:

1. Build and stitch the app image exactly as today.
2. Resolve the final pushed image digest.
3. Create a temp capsule worktree such as:
   - `release.yaml`
   - `package/helm/...` or `package/kustomize/...`
   - `metadata/sbom.json`
   - `metadata/provenance.json`
4. Copy the deploy package from:
   - `k8s/helm/`
   - or, for Kustomize, have the GH action populate `package/kustomize/` from
     `k8s/kustomize/**`
     - do not use `overlays/` or `bin/` from that tree in Kargo or Argo
       production code paths; those are local-dev/parity support surfaces
5. Write `release.yaml` with:
   - `gitCommit`
   - image repo/tag/digest
   - `package.kind`
   - `package.path`
   - where `package.path` exactly matches the path Kargo will later read after
     `oci-download` and unpack
6. Package and push the OCI artifact to
   `ghcr.io/code-dot-org/codeai-release-capsule:git-<full-commit-sha>`.
7. Do not write a Git Freight record for the capsule form.
8. Let the Kargo Warehouse stay image-led and have promotion derive the capsule
   ref from the promoted image tag.

If the team chooses the alternate OCI pair form instead of the full capsule,
the GH runner should follow the pair-specific flow documented earlier in this
plan: publish the package artifact separately, then write the Git witness that
pairs image and package identity.
The required implementation for this repo does not use that pair-specific flow.
It implements the full capsule path above.

### Testing Plan

Recommended automation:
- Extend [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or call a small reusable workflow from it for repo-specific capsule contract and render smoke checks.
- Use existing Drone results on the promoted `gitCommit` as the app/unit/UI gate before downstream promotion.
- Use Kargo `verification` with `AnalysisTemplate`s for post-sync rollout/health/smoke checks in `test`.

Simple tests to automate:
- In `k8s.yml`, after the capsule packaging step, unpack the OCI capsule build artifact in a temp dir and fail unless it contains `release.yaml`, `package/`, `metadata/sbom.json`, and `metadata/provenance.json`.
- In the same workflow, parse `release.yaml` and fail unless `gitCommit`, `image.repoURL`, `image.tag`, `image.digest`, `package.kind`, and `package.path` are all present and internally consistent with the built `git-<full-commit-sha>` image tag, and unless the unpacked OCI artifact actually contains the package at that exact `package.path`.
- For the Helm variant, run `helm template` from `package/helm` using deployment metadata from `apps/codeai/deployments/<deployment>/deployment.yaml`, envType values from `apps/codeai/envTypes/<envType>.values.yaml`, and deployment values from `apps/codeai/deployments/<deployment>/values.yaml`.
- For the Kustomize variant, run `kustomize build` from a temp tree assembled from `package/kustomize/base`, `package/kustomize/components`, `apps/codeai/envTypes/<envType>/` as a Component, any referenced `apps/codeai/envTypes/components/` subcomponents such as `autoscaling`, and a copied `apps/codeai/kargo/templates/deploy/` dir whose `kustomization.yaml` `namespace`, `resources`, and `components` fields are updated before `kustomize-set-image` rewrites `code-dot-org` to `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`. Do not use `code-dot-org/k8s/kustomize/overlays` or `bin/` in production code paths; those are local-dev/parity support only.
- If `codeai-release-verify` is implemented in `code-dot-org`, test it with small local fixture/request-response contract cases in this repo, because that helper is our code and not part of Kargo itself.
- In the same workflow, check out `k8s-gitops` read-only and validate [applicationset.yaml](/Users/seth/src/k8s-gitops/apps/codeai/applicationset.yaml) deploys `apps/codeai/deployments/{{path.basename}}/deploy` from `stage/{{path.basename}}`, because capsule plans still hand Argo rendered Git output.

Avoid as baseline coverage:
- A live registry + live `oci-download` + live controller test whose main purpose is re-testing OCI transport or Kargo internals. If upstream later documents a first-class OCI promotion verification flow, prefer that over bespoke harnessing.
