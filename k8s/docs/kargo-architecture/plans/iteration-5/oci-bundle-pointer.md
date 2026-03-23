# OCI Bundle Pointer

**Short name:** OCI bundle

**Catchy description:** Store the real release payload in OCI, keep only a small Git pointer in `warehouses/codeai/`, and let Kargo download the exact bundle digest during promotion.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Usually yes

## Warehouse artifact
The GH action publishes:
- image: `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`
- config bundle: `ghcr.io/code-dot-org/codeai-bundles@sha256:...`

It writes:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>.yaml
```

Suggested file content:

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <gitcommit>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
bundle:
  ref: ghcr.io/code-dot-org/codeai-bundles@sha256:...
  format: helm-chart-tgz # or kustomize-tar
```

## Freight
Freight is **Git-only**.

This is important because Kargo Warehouses do not natively subscribe to generic OCI config bundles. The bundle digest is carried by the Git release record, and promotion uses `oci-download`.

## Kargo project
Promotion task:
1. Clone `k8s-gitops` at the freight commit.
2. Parse the release file.
3. `oci-download` the bundle by digest.
4. Untar it into a temp directory.
5. Render with `helm-template` or `kustomize-build`.
6. Commit rendered output to the target stage.

## Stage-by-stage promotion flow
- `staging`: download bundle, render staging
- `test`: download same bundle, render test, run tests
- `levelbuilder`: render levelbuilder
- `review-infra-changes`: render production to PR branch
- `production`: merge reviewed output

## Helm / Kustomize structure
This plan works with either packaging form.

### `code-dot-org`
No structural change is required, but the bundle format should be standardized:
- Helm bundle: chart tarball
- Kustomize bundle: tarball of `base/` + `components/`

### `k8s-gitops`
Keep env configuration here and add:

```text
warehouses/codeai/releases/
apps/codeai/rendered/<stage>/
```

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local dev still uses source packaging in `code-dot-org`. The OCI bundle exists only for CI and promotion.

## Pros
- very small Git warehouse payload
- immutable artifact by digest
- works for both Helm and Kustomize
- clean separation between release metadata and release payload

## Cons
- more exotic than most alternatives
- generic OCI bundle is not a first-class Warehouse subscription type
- debugging promotion can be less obvious because source comes from a downloaded blob

## Migration notes
- Standardize bundle creation and media types.
- Keep bundle size under control; Kargo `oci-download` is not a general artifact store for giant payloads.

## Additional implementation notes
- This is a good “creative but credible” option.
- It becomes more attractive if Git payload size or repo churn becomes a concern.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/releases/`
- Add rendered stage output paths or branches
- Replace image-only Kargo stage logic with `oci-download` + render steps

## `code-dot-org` changes
- Add bundle packaging to CI
- Publish bundle digest into the warehouse release file
- Keep source packaging available for local dev and debugging
