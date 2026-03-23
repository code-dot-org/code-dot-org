# Rendered Branches from a Thin Lock

**Short name:** Rendered branches

**Catchy description:** Keep the warehouse artifact tiny, but make every promotion render full stage-specific manifests into stage branches so humans review the real output, not just a ref change.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
Same release record shape as Thin Build Lock:

```text
warehouses/
  codeai/
    builds/
      git-<full-commit-sha>.yaml
```

The lock file contains:
- `$gitcommit`
- image ref + digest
- packaging kind
- source path

## Freight
Freight is **Git-only** from `warehouses/codeai/builds/`.

The build lock is just the trigger. Promotion does the expensive work.

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Promotion pattern:
1. Clone `k8s-gitops` at the freight commit to `./meta`.
2. Parse the build lock.
3. Clone `code-dot-org` at `$gitcommit` to `./src`.
4. Clone the target stage branch or rendered path to `./out`.
5. Render the stage’s manifests from source + env config.
6. Commit and push rendered output.
7. Ask ArgoCD to sync the rendered source.

This is the closest CodeAI analogue to `kargo-advanced`.

## Stage-by-stage promotion flow
- `staging`: render manifests for the staging env and commit to a staging output branch/path
- `test`: render manifests for the test env from the same freight and run automated tests
- `levelbuilder`: render levelbuilder manifests from the same freight after `test`
- `review-infra-changes`: render production manifests to a generated branch and open a PR
- `production`: merge or fast-forward the reviewed rendered output

This model keeps freight stable but changes how each stage materializes it.

## Helm / Kustomize structure
This plan works with both Helm and Kustomize.

### Helm shape
Render from:
- `code-dot-org/k8s/helm`
- plus env values in `k8s-gitops/apps/codeai/...`

### Kustomize shape
Render from:
- `code-dot-org/k8s/kustomize/...`
- plus env overlays in `k8s-gitops`

### Suggested `k8s-gitops` addition

```text
apps/codeai/rendered/
  staging/
  test/
  levelbuilder/
  production/
```

Argo apps should point at rendered stage paths or rendered stage branches.

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local Skaffold still uses source packaging in `code-dot-org`. Rendering happens only in Kargo promotion.

## Pros
- much stronger reviewability
- Argo deploys exactly what Kargo rendered
- supports both Helm now and Kustomize later
- maps closely to upstream Kargo’s rendered-branch pattern

## Cons
- more moving parts than Thin Lock
- requires rendered-output paths/branches and corresponding Argo changes
- stage output is derived, not hand-edited

## Migration notes
- Add rendered output locations and move Argo apps to them.
- Introduce `helm-template` or `kustomize-build` promotion steps.
- Add PR-based `review-infra-changes`.

## Additional implementation notes
- For Helm, prefer `helm-template` to render into a directory so diffs stay readable.
- For Kustomize, prefer `kustomize-build` with directory output.
- This is likely to score very highly on reviewability.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/builds/`
- Add `apps/codeai/rendered/<stage>/` or stage branches
- Rewrite CodeAI stages to:
  - parse build lock
  - clone `code-dot-org` at `$gitcommit`
  - render stage manifests
  - commit rendered output
- Update Argo Applications to point at rendered output
- Add `review-infra-changes` PR stage

## `code-dot-org` changes
- Rewrite `k8s-commit-to-kargo-warehouse.yml` to write build locks only
- No required packaging-tree change for the first version

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
