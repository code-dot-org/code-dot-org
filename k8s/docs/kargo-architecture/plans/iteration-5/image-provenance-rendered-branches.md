# Image Provenance + Rendered Branches

**Short name:** Provenance render

**Catchy description:** Let the built image carry the commit. Kargo promotes the image as the release witness, reconstructs the exact source tree from OCI provenance metadata, and renders stage branches from sparse monorepo checkouts.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
This plan intentionally publishes **nothing** under `warehouses/codeai/`.

The built image itself becomes the release record.

The existing build already emits immutable `git-<full-commit-sha>` image tags. Extend
that by publishing OCI annotations on the stitched multi-arch image:

```text
org.opencontainers.image.source=https://github.com/code-dot-org/code-dot-org
org.opencontainers.image.revision=<full gitcommit>
io.code.org.kargo.package-kind=helm|kustomize
io.code.org.kargo.package-path=k8s/helm|k8s/kustomize
```

Suggested Warehouse shape:

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai
spec:
  subscriptions:
    - image:
        repoURL: ghcr.io/code-dot-org/code-dot-org
        allowTagsRegexes:
          - ^git-[0-9a-f]{40}$
        cacheByTag: true
```

This plan keeps the immutable git-derived image tag, but treats the full OCI
annotation set as the canonical release metadata.

## Freight
Freight is **image-only**.

The image digest is the promoted artifact. The full source commit is recovered
from `imageFrom(...).Annotations["org.opencontainers.image.revision"]`.

That means Kargo no longer has to pair:
- a Git release record
- a Git source commit
- an image

It promotes one thing: the image revision that already knows where it came from.

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
1. Clone `k8s-gitops` `main` to `./meta`.
2. Clone `k8s-gitops` `stage/<stage>` to `./out`.
3. Read the full source commit from the image annotation.
4. Sparse-clone `code-dot-org` at that commit to `./src`.
5. Read package kind/path from annotations.
6. `git-clear` `./out`.
7. Render the stage output from `./src` + `./meta`.
8. Commit and push `./out`.
9. Ask Argo CD to sync the rendered branch commit.

This keeps the rendered-branch review model, but deletes both the synthetic
warehouse-writeback pattern and the multi-artifact freight pairing logic.

## Stage-by-stage promotion flow
- `staging`: render the staging deployment from the image’s recorded source commit to `stage/staging`
- `test`: render `stage/test`, sync, then run verification against the exact same image revision already accepted in `staging`
- `levelbuilder`: render `stage/levelbuilder` from the exact image revision verified in `test`
- `review-infra-changes`: render production output to a generated branch, open a PR against `stage/production`, and wait for merge
- `production`: sync the already-reviewed `stage/production` branch after the PR merge

Freight shape stays perfectly stable: one image in, many rendered stage views out.

## `review infra changes` stage behavior
This stage should work exactly like a real infra review gate:
1. Clone `stage/production`.
2. Reconstruct the source package from the image’s provenance annotations.
3. Render production manifests.
4. Commit to a generated branch.
5. Open a PR against `stage/production`.
6. Wait for merge.

The PR is now a review of the real deploy output from the real built artifact.

## `test` stage automation behavior
After syncing `stage/test`, run verification before any downstream promotion.

Good fits:
- Kargo `verification` / `AnalysisTemplate`s for smoke checks
- external integration tests after sync
- `MatchUpstream` so `levelbuilder` and `review-infra-changes` follow the exact
  image revision already verified in `test`

## Does it break/awkwardize skaffold or local-dev in any way?
No.

Local dev continues to use source packaging in `code-dot-org`. This plan only
changes what Kargo treats as release truth for promoted environments.

## Proposed Helm / Kustomize directory structure
### `code-dot-org`
Helm can stay where it is:

```text
k8s/helm/
```

Future Kustomize should still become more explicit:

```text
k8s/kustomize/
  base/
  components/
  stages/
    staging/
    test/
    levelbuilder/
    production/
```

### `k8s-gitops`
`main` keeps env policy and app metadata:

```text
apps/codeai/
  envTypes/
  deployments/
```

Rendered output lives on stage branches:

```text
stage/staging        -> apps/codeai/rendered/
stage/test           -> apps/codeai/rendered/
stage/levelbuilder   -> apps/codeai/rendered/
stage/production     -> apps/codeai/rendered/
```

## Pros
- simplest serious operational model in the whole set
- reuses the immutable git-derived image tags the build already produces
- deletes synthetic warehouse commits entirely
- deletes explicit image+git freight pairing entirely
- keeps the strong rendered-review workflow
- keeps source of truth in `code-dot-org`

## Cons
- depends on OCI metadata discipline
- if image provenance annotations are wrong, promotions are wrong
- less explicit than a multi-artifact Freight for operators who prefer to see the source commit subscribed directly
- still reads source at promotion time instead of using a frozen package snapshot

## Migration notes
- Keep the existing `git-<full-commit-sha>` image tagging convention.
- Add OCI annotations carrying the full source commit and package path/kind.
- Keep the Warehouse image-only, but rewrite Stage promotion tasks around rendered branches and source reconstruction from image provenance.
- Move Argo CD apps to rendered stage branches.

## Additional implementation notes
- This is the first plan that makes the actual built artifact, not a sidecar Git
  record, the release witness.
- If the team later wants stronger immutability without giving up this model,
  the next refinement would be to attach a package snapshot digest in OCI
  metadata rather than reintroducing `warehouses/codeai/`.
- Another plausible next refinement is to publish the Helm chart or Kustomize
  base directly to GHCR and carry that digest in OCI metadata too. That is a
  real idea, but it still feels more like an optimization layer than the first
  clean-sheet answer.

# Code changes
## `k8s-gitops` changes
- Keep the Warehouse image-only, but rewrite Stage promotion to:
  - read OCI annotations from Freight
  - sparse-clone `code-dot-org` at the annotated commit
  - render to stage branches
- Update Argo Applications to deploy from rendered stage branches
- Add `review-infra-changes` PR behavior against `stage/production`
- Delete any future dependence on `warehouses/codeai/`

## `code-dot-org` changes
- Keep the current immutable `git-<full-commit-sha>` image tagging convention
- Add OCI annotations for full commit SHA and package path/kind during build/stitch
- Remove `k8s-commit-to-kargo-warehouse.yml` from the release path
- No required packaging-tree restructure for the first version

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
