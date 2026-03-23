# Hermetic Render Formula

- Short name: Hermetic Formula
- Catchy description: Freeze not just the package, but the exact renderer and
  render recipe, so every stage materializes the same result from the same lock.
- It is: packaging-agnostic plan
- It uses: hybrid pattern

## Warehouse artifact structure under `warehouses/codeai/`

```text
warehouses/codeai/
  formulas/
    git-<full-commit-sha>/
      formula.yaml
      inputs.lock
  packages/
    sha256-<package-hash>/
      package/
  renderers/
    renderer-<version>.oci
```

The formula references package hash, image digest, env inputs, and exact
renderer digest.

## Freight definition

Freight is:
- image revision
- formula artifact keyed to `$gitcommit`

The formula, not the live toolchain, determines how manifests are produced.

## Full Kargo project design

- `Warehouse codeai-image` subscribes to the image repo.
- `Warehouse codeai-formula` subscribes to the formula artifact stream.
- `staging` pulls the exact renderer named in the formula, materializes the
  manifests, and writes rendered output to `k8s-gitops`.
- `review-infra-changes` opens a PR with rendered diffs plus formula metadata.
- `test`, `autoscale-prod`, and `levelbuilder` all use the same formula and
  renderer digest.
- ArgoCD still consumes rendered Git output; the hermetic part is in the
  render pipeline, not in Argo itself.

## Stage-by-stage promotion flow

1. Build publishes image, package hash, renderer digest, and formula artifact.
2. `staging` materializes output using only the locked formula inputs.
3. `review-infra-changes` renders downstream envs and opens a PR.
4. `test` syncs and verifies the rendered output still matches the formula.
5. `autoscale-prod` and `levelbuilder` repeat the same hermetic render with
   different env inputs locked in the formula.

## `review infra changes` stage behavior

- The PR shows rendered diffs and records the formula digest and renderer
  digest.
- Reviewers approve a fully locked render recipe, not just a source snapshot.

## `test` stage automation behavior

- Re-run the exact renderer named in the formula.
- Sync test.
- Run rollout and smoke checks.
- Fail if the newly produced output differs from the approved rendered output.

## Does it break/awkwardize skaffold or local-dev in any way?

For everyday local dev, not much. For production-like local reproduction, it
adds extra tooling because local operators would need the formula and renderer
artifact instead of just source + Helm.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/                  # optional future structure
  renderers/
    codeai/
  release/
    formula/
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

- Strongest reproducibility story in the set.
- Makes the render toolchain part of release identity.
- Can detect non-determinism very aggressively.

### Cons

- Lowest KISS score in this iteration.
- Hard to explain and likely overbuilt for current operator maturity.
- Adds a lot of machinery before it improves the main day-to-day workflow.

## Migration notes

- Do not start here.
- Only introduce after a simpler package snapshot plan has already stabilized.
- Treat the hermetic renderer as an optional hardening layer, not the first
  architecture move.

## Any useful implementation notes that do not fit neatly elsewhere

- Keep the formula schema minimal.
- Favor an OCI renderer image over a custom binary distribution format.
- Never let the hermetic lock replace rendered diff review for human approval.

# Code changes

## k8s-gitops changes

- Add rendered output paths if not already present.
- Record approved formula and renderer digests in stage metadata.
- Keep Argo simple by consuming rendered Git output, not the formula directly.

## code-dot-org changes

- Add formula generation in CI.
- Add versioned renderer build and publication.
- Keep the live Helm tree for local dev even if the release pipeline becomes
  hermetic.
