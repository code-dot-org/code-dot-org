# OCI Package Pair (Helm or Kustomize) + Rendered Branches

**Short name:** OCI package pair

**Catchy description:** Publish the app container image and the deploy package (either a Helm chart or a Kustomize bundle) as separate OCI artifacts tied to the same `$gitcommit`, and let a Git release record tell Kargo exactly which pair to render into rendered branches.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
On each successful build, publish:
- image: `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`
- OCI package artifact:
  - Helm subvariant: `oci://ghcr.io/code-dot-org/codeai-chart:0.0.0-git.<full-commit-sha>`
  - Generic package subvariant: `ghcr.io/code-dot-org/codeai-packages@sha256:...`

And write one Git release record:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
```

Recommended `release.yaml`:

```yaml
schemaVersion: v1
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
  mediaType: application/vnd.codeorg.package.v1+tar
createdAt: 2026-03-22T12:34:56Z
```

Common rules:
- use `git-<full-commit-sha>` as the operator-facing release/tag shape
- keep the full 40-character SHA in structured metadata
- keep the Git release record small and explicit
- store the real deploy payload in OCI, addressed by digest
- keep env-specific policy in `k8s-gitops`, not inside the release record

### Helm chart subvariant
If CodeAI stays Helm-shaped, publish the chart itself as an OCI artifact and point the release record at it:

```yaml
package:
  ref: oci://ghcr.io/code-dot-org/codeai-chart:0.0.0-git.<full-commit-sha>
  digest: sha256:...
  kind: helm-chart
  format: helm-chart-tgz
```

This keeps the package very literal: the OCI artifact is the chart.

### Generic package subvariant
If the team wants one OCI family that can outlive Helm, publish a tarball bundle and point the release record at its digest:

```yaml
package:
  ref: ghcr.io/code-dot-org/codeai-packages@sha256:...
  digest: sha256:...
  kind: generic-bundle
  format: helm-chart-tgz # or kustomize-tar
```

This is more flexible, but also more custom.

## Freight
Freight is **Git-only** on `warehouses/codeai/releases/`.

Suggested Warehouse shape:

```yaml
git:
  repoURL: https://github.com/code-dot-org/k8s-gitops.git
  branch: main
  includePaths:
    - warehouses/codeai/releases
```

This is the key design point:
- Kargo promotes the small Git release record
- the record explicitly pairs image and deploy package
- promotion then uses `oci-download` to fetch the real package payload

Why Git-only Freight:
- Helm charts and generic OCI bundles are not the same native Warehouse subscription shape
- the Git record gives one explicit release witness for both subvariants
- Kargo does not need to infer which package goes with which image

## Kargo project
Promotion should download by digest, then render from the downloaded package.

Recommended stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Common promotion pattern:
1. Clone `k8s-gitops` at the freight commit to `./src`.
2. Clone the target rendered stage branch to `./out`.
3. Read `warehouses/codeai/releases/git-<full-commit-sha>/release.yaml`.
4. `oci-download` the package artifact.
5. Unpack it into a temp directory.
6. Render the target stage from the downloaded package plus GitOps env policy.
7. Commit and push rendered output to the stage branch.
8. In `review-infra-changes`, open a PR instead of pushing directly to the production branch.

Preferred rendered branch shape:

```text
stage/staging
stage/test
stage/levelbuilder
stage/production
```

### Helm chart subvariant render path
1. `oci-download` the OCI chart.
2. Run `helm-template` against the unpacked chart.
3. Supply env values from:
   - `apps/codeai/envTypes/<env>.values.yaml`
   - `apps/codeai/deployments/<env>/values.yaml`

### Generic package subvariant render path
1. `oci-download` the bundle by digest.
2. Untar it into a temp directory.
3. Render with either:
   - `helm-template`, if the bundle contains a chart
   - `kustomize-build`, if the bundle contains a Kustomize base/components package

## Stage-by-stage promotion flow
- `staging`: download the exact OCI package and render staging output to `stage/staging`
- `test`: download the same package, render test output to `stage/test`, and run automated tests
- `levelbuilder`: render levelbuilder output from the same package after `test`
- `review-infra-changes`: render production output to a generated branch against `stage/production` and open a PR
- `production`: merge the reviewed production render, then sync Argo to `stage/production`

This preserves the rendered-branches review model while moving the deploy payload out of Git and into OCI.

## `review infra changes` stage behavior
This stage is the same for both subvariants:
1. Download the exact OCI package referenced by the release record.
2. Render production manifests from that package plus production env policy.
3. Commit to a generated branch.
4. Open a PR against `stage/production`.
5. Wait for merge before production sync.

The review surface is still the rendered deploy output, not raw refs.

## `test` stage automation behavior
After syncing `stage/test`, run verification before downstream promotion.

Good fits:
- Kargo `verification` / `AnalysisTemplate`s for smoke checks
- external integration tests after sync
- stage promotion rules that ensure downstream stages follow the exact Freight already verified in `test`

## Proposed Helm / Kustomize directory structure
### `code-dot-org`

#### Helm chart subvariant
Keep the source chart in:

```text
k8s/helm/
  Chart.yaml
  values.yaml
  templates/...
```

CI packages that chart into OCI.

#### Generic package subvariant
Keep the source package in the long-lived source repo, but publish a tarball package to OCI:

```text
k8s/helm/
  ...

# or later

k8s/kustomize/
  base/
  components/
```

CI is responsible for packaging that source tree as a bounded OCI artifact.

### `k8s-gitops`

```text
apps/codeai/
  rendered/
    staging/
    test/
    levelbuilder/
    production/
warehouses/codeai/releases/git-<full-commit-sha>/
  release.yaml
```

This plan keeps env-specific values or overlays in GitOps, even though the shared deploy package lives in OCI.

## Does it break/awkwardize skaffold or local-dev in any way?
No.

Common rule:
- local dev keeps using source packaging in `code-dot-org`
- OCI packaging is CI/promotion-only

Helm chart subvariant note:
- Skaffold keeps using `code-dot-org/k8s/helm`

Generic package subvariant note:
- local dev still points at source packaging, not downloaded OCI blobs

## Pros
- keeps the Git warehouse small and explicit
- preserves rendered-branches reviewability
- gives strong immutability via package digest
- works as a Helm-now or OCI-package-later family
- avoids promotion-time rereads of the giant live monorepo

## Cons
- more exotic than Git snapshot plans
- requires OCI packaging and publication discipline
- generic bundle/package artifacts are not a first-class native Warehouse type
- debugging promotion is less obvious because the source package arrives as a downloaded blob

Helm chart subvariant downside:
- still narrower if the long-term direction is Kustomize

Generic package subvariant downside:
- more custom and operationally stranger than either Git snapshots or native Kargo subscriptions

## Migration notes
- This merged plan supersedes both the old `OCI Chart Release Pair` plan and the old `OCI Bundle Pointer` plan.
- If the team wants the lowest-friction first form, start with the Helm-chart OCI subvariant.
- If Git payload churn becomes painful, the generic OCI package form becomes more attractive.

## Additional implementation notes
- record both package digest and image digest
- keep package size bounded; this is not a general artifact dump
- use stable package media types and archive structure
- use deterministic chart versions for the Helm subvariant, such as `0.0.0-git.<full-commit-sha>`

# Code changes
## `k8s-gitops` changes
- add `warehouses/codeai/releases/`
- add rendered output branches or paths
- replace image-only Kargo stage logic with `oci-download` + render steps

## `code-dot-org` changes
- add OCI package publication to CI
- write `release.yaml` into the warehouse path
- keep source packaging available for local dev and debugging

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
