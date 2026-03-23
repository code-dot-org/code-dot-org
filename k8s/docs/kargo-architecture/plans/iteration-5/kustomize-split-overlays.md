# Kustomize Split Overlays

**Short name:** Split overlays

**Catchy description:** Keep shared Kustomize base/components in `code-dot-org`, move deploy-environment overlays into `k8s-gitops`, and promote by updating commit/image refs instead of rendering in CI.

- **Type:** Kustomize plan
- **Pattern:** Source-driven
- **Rendered manifests pattern:** No

## Warehouse artifact
The GH action writes a thin build lock:

```text
warehouses/
  codeai/
    builds/
      git-<full-commit-sha>.yaml
```

The lock file contains:
- `$gitcommit`
- image ref + digest
- `packaging.kind: kustomize`
- `sourcePath: k8s/kustomize/base`

## Freight
Freight is **Git-only**.

The build lock is the release trigger; promotion updates Kustomize refs and image refs in env overlays.

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Promotion task:
1. Clone `k8s-gitops`.
2. Parse build lock.
3. Update the target env overlay so it pins the remote base to `$gitcommit`.
4. Update the overlay image ref/digest.
5. Commit and push.

Argo applies the environment overlay directly from `k8s-gitops`.

## Stage-by-stage promotion flow
- `staging`: update `apps/codeai/overlays/staging/`
- `test`: copy the same release into `apps/codeai/overlays/test/`, then run tests
- `levelbuilder`: copy to the levelbuilder overlay
- `review-infra-changes`: update the production overlay on a PR branch
- `production`: merge reviewed production overlay change

## Helm / Kustomize structure
This plan intentionally restructures Kustomize.

### `code-dot-org`
Replace `targets/` with a cleaner shared-source tree:

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

There should be no long-lived deploy-env overlays in `code-dot-org` other than local-dev helpers.

### `k8s-gitops`
Move env overlays here:

```text
apps/codeai/
  overlays/
    staging/
      kustomization.yaml
    test/
      kustomization.yaml
    levelbuilder/
      kustomization.yaml
    production/
      kustomization.yaml
  envTypes/
    staging/
      kustomization.yaml
    test/
      kustomization.yaml
    levelbuilder/
      kustomization.yaml
    production/
      kustomization.yaml
```

The env overlay can compose an envType base plus deployment-specific differences.

## Does it break/awkwardize skaffold or local-dev in any way?
It should not, if local dev uses `code-dot-org/k8s/kustomize/local/overlays/...` and Skaffold is updated to point there. It does require a Skaffold refactor if you switch local deployment from Helm to Kustomize.

## Pros
- strong future-Kustomize fit
- clean split between shared app packaging and deploy env policy
- simple freight model
- no need to duplicate base source into `k8s-gitops`

## Cons
- requires a meaningful Kustomize refactor
- reviewability is weaker unless combined with rendered PR previews
- remote-base pinning can be less obvious to readers than rendered output

## Migration notes
- Rename `targets/` to `overlays/`.
- Move non-local env overlays to `k8s-gitops`.
- Keep a local-only overlay tree in `code-dot-org` for Skaffold.

## Additional implementation notes
- This plan becomes much stronger if paired with a render-preview job for `review-infra-changes`.
- Prefer digest pinning in overlays even if the warehouse file stores both tag and digest.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/builds/`
- Add `apps/codeai/overlays/` and likely `apps/codeai/envTypes/<env>/kustomization.yaml`
- Rewrite CodeAI Kargo stages to update overlay refs instead of Helm values
- Update Argo apps to point at Kustomize overlays

## `code-dot-org` changes
- Replace rough `k8s/dashboard/targets/` layout with `k8s/kustomize/base` + `components` + `local/overlays`
- Update local dev / Skaffold integration for Kustomize if adopting this path
- Keep GH action warehouse writeback thin

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
