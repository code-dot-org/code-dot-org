# OCI Chart Release Pair

**Short name:** OCI chart pair

**Catchy description:** Publish the image and the Helm chart as separate OCI artifacts tied to the same `$gitcommit`, and let a Git release record tell Kargo exactly which pair to render.

- **Type:** Helm plan
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Usually yes

## Warehouse artifact
The GH action publishes:
- container image: `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`
- OCI Helm chart: `oci://ghcr.io/code-dot-org/codeai-chart:0.0.0-git.<full-commit-sha>`

It also writes:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
```

Suggested `release.yaml`:

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <gitcommit>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
chart:
  ref: oci://ghcr.io/code-dot-org/codeai-chart:0.0.0-git.<full-commit-sha>
  version: 0.0.0-git.<full-commit-sha>
```

## Freight
Freight is **Git-only** on `warehouses/codeai/releases/`.

The Git release record is the pairing mechanism. Kargo does not need to infer which chart goes with which image.

## Kargo project
Promotion task:
1. Clone `k8s-gitops` freight commit.
2. Parse `release.yaml`.
3. `oci-download` the chart tarball.
4. Run `helm-template` with env values from `apps/codeai/...`.
5. Commit rendered output to the stage path/branch.
6. Run tests or open PRs as appropriate.

This is artifact-heavy but still keeps a simple Git warehouse input.

## Stage-by-stage promotion flow
- `staging`: render from OCI chart + staging values
- `test`: render from same chart + test values, then run tests
- `levelbuilder`: render from same chart + levelbuilder values
- `review-infra-changes`: render production output to PR branch
- `production`: merge reviewed output

## Helm / Kustomize structure
This plan is Helm-specific.

### `code-dot-org`
Keep the chart source in `k8s/helm`, but add chart packaging in CI.

Optional cleanup:

```text
k8s/helm/
  Chart.yaml
  values.yaml
  env/
    staging.values.yaml
    test.values.yaml
    levelbuilder.values.yaml
    production.values.yaml
```

### `k8s-gitops`
Keep env-specific values and add:

```text
warehouses/codeai/releases/git-<full-commit-sha>/release.yaml
apps/codeai/rendered/<stage>/
```

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local dev still uses the source chart in `code-dot-org`. OCI chart publication is CI-only.

## Pros
- image and chart are both immutable publishable artifacts
- good fit if CodeAI stays Helm
- keeps `warehouses/codeai/` small
- clear provenance between chart and image

## Cons
- Helm-only
- requires chart versioning discipline and OCI chart publication
- slightly more complex than chart snapshots

## Migration notes
- Chart versions must be semver. Use a deterministic form like `0.0.0-git.<full-commit-sha>`.
- If later moving to Kustomize, this plan does not carry over cleanly.

## Additional implementation notes
- Record both chart digest and image digest if possible.
- If Kargo later gets direct chart+image pairing logic you trust, this plan could evolve from Git-only freight to multi-subscription freight.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/releases/`
- Add rendered output paths or branches
- Replace image-only Kargo stages with `oci-download` + `helm-template` stages

## `code-dot-org` changes
- Add OCI chart packaging to the GH action
- Write `release.yaml` into the warehouse path
- Keep `k8s/helm` as chart source for both CI and Skaffold

