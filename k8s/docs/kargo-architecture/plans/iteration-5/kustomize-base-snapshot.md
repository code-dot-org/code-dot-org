# Kustomize Base Snapshot

This plan has been merged conceptually with [Source Snapshot (Helm or Kustomize) + Rendered Branches](./source-snapshot-rendered-branches.md), which is now the cleaner snapshot-family reference plan. This file remains as the Kustomize-specific predecessor.

**Short name:** Base snapshot

**Catchy description:** Freeze the exact shared Kustomize base/components for each release into the warehouse, but keep environment overlays in GitOps so Kargo can combine immutable source with mutable env policy.

- **Type:** Kustomize plan
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
On each build, publish:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
        base/
        components/
```

This snapshot is copied from the future source tree in `code-dot-org`, for example:

```text
k8s/kustomize/
  base/
  components/
```

`release.yaml` records:
- `$gitcommit`
- image ref + digest
- snapshot tree hash

## Freight
Freight is **Git-only** on the release directory.

Promotion combines:
- immutable base/components from the warehouse snapshot
- env overlays from `k8s-gitops`

## Kargo project
Promotion task:
1. Clone `k8s-gitops` at the freight commit.
2. Copy `warehouses/codeai/releases/git-<full-commit-sha>/{base,components}` into a temp source tree.
3. Copy the target env overlay from `apps/codeai/overlays/<stage>/`.
4. Set image digest/tag in the overlay or the assembled source tree.
5. Run `kustomize-build`.
6. Commit rendered output.

This is similar to Kargo’s documented “base + overlay” composition pattern.

## Stage-by-stage promotion flow
- `staging`: render staging overlay against the release snapshot
- `test`: render test overlay and run tests
- `levelbuilder`: render levelbuilder overlay
- `review-infra-changes`: render production overlay to a PR branch
- `production`: merge reviewed production render

## Helm / Kustomize structure
This plan assumes a real Kustomize refactor.

### `code-dot-org`

```text
k8s/kustomize/
  base/
  components/
  local/
    overlays/
```

### `k8s-gitops`

```text
apps/codeai/
  overlays/
    staging/
    test/
    levelbuilder/
    production/
  envTypes/
    staging/
    test/
    levelbuilder/
    production/
warehouses/codeai/releases/git-<full-commit-sha>/
  base/
  components/
```

## Does it break/awkwardize skaffold or local-dev in any way?
No, as long as local dev uses the source tree in `code-dot-org` and not the warehouse snapshot. Skaffold does need a Kustomize-based local path if Helm is retired.

## Pros
- very strong future-Kustomize fit
- immutable shared source
- env overlays remain easy to edit in `k8s-gitops`
- excellent reviewability when paired with rendered outputs

## Cons
- more complex than thin-lock approaches
- duplicates shared source into `k8s-gitops`
- requires a real Kustomize structure decision

## Migration notes
- First settle the future Kustomize shared tree.
- Then move env overlays into `k8s-gitops`.
- Finally add warehouse snapshots and Kargo render steps.

## Additional implementation notes
- This is a strong likely finalist for “best future Kustomize.”
- Keep the snapshot small by excluding local-dev overlays and generated files.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/releases/`
- Add `apps/codeai/overlays/`
- Add rendered output paths or branches
- Rewrite CodeAI stages to assemble snapshot + overlay + render

## `code-dot-org` changes
- Create the durable `k8s/kustomize/base` + `components` shape
- Update GH action to snapshot those directories into the warehouse release dir
- Keep local overlays in source repo for Skaffold/local dev

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
