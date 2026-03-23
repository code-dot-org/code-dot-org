# Pre-Rendered Release Bundle

**Short name:** Rendered bundle

**Catchy description:** Render everything in CI once, publish a release bundle containing finished manifests for every environment, and let Kargo promote those immutable outputs.

- **Type:** Packaging-agnostic
- **Pattern:** Rendered
- **Rendered manifests pattern:** Yes

## Warehouse artifact
The GH action renders manifests for every target environment and commits:

```text
warehouses/
  codeai/
    releases/
      git-<full-commit-sha>/
        release.yaml
        rendered/
          staging/
          test/
          levelbuilder/
          production/
```

`release.yaml` records:
- `$gitcommit`
- image ref + digest
- render tool (`helm-template` or `kustomize-build`)
- env config commit from `k8s-gitops` used during render

## Freight
Freight is **Git-only** on `warehouses/codeai/releases/`.

The rendered manifests are already part of the freight, so Kargo promotion can be as simple as copying the right environment subtree.

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Promotion pattern:
1. Clone `k8s-gitops` at the freight commit.
2. Copy `warehouses/codeai/releases/git-<full-commit-sha>/rendered/<env>/` to the stage output path.
3. Commit and push.
4. Run tests in `test`.
5. For `review-infra-changes`, open a PR for the production rendered tree.

## Stage-by-stage promotion flow
- `staging`: copy rendered staging bundle
- `test`: copy rendered test bundle and run tests
- `levelbuilder`: copy rendered levelbuilder bundle
- `review-infra-changes`: copy rendered production bundle to PR branch
- `production`: merge reviewed production render

No stage re-renders anything. The render happens once in CI.

## Helm / Kustomize structure
This plan works with both packaging styles because rendering is front-loaded into CI.

### `code-dot-org`
May keep current Helm or adopt future Kustomize. CI just has to know how to render the chosen packaging.

### `k8s-gitops`
Should add:

```text
apps/codeai/rendered/
  staging/
  test/
  levelbuilder/
  production/
warehouses/codeai/releases/
  git-<full-commit-sha>/
```

## Does it break/awkwardize skaffold or local-dev in any way?
No. Local dev remains source-based in `code-dot-org`. This plan changes CI and promotion only.

## Pros
- strongest immutable review story
- very easy to diff in PRs
- fastest Kargo promotions after the build
- stage behavior is easy to understand

## Cons
- env config is frozen at build time
- a later env overlay tweak needs a new render and new warehouse release
- CI has to render every environment on every build

## Migration notes
- Decide what exact env inputs are allowed in CI at render time.
- Make `test` promotion verify the rendered test bundle before downstream promotion.
- Consider storing both rendered manifests and the source metadata used to produce them.

## Additional implementation notes
- This plan is best when you value reviewability more than flexibility.
- It is a poor fit if env config changes independently and often.
- The release bundle should record the `k8s-gitops` commit used for the render so it is auditable.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/releases/`
- Add `apps/codeai/rendered/<stage>/`
- Replace current Kargo promotions with `copy`-based promotion from rendered bundles
- Point Argo apps at rendered stage output

## `code-dot-org` changes
- Make the build workflow check out `k8s-gitops`
- Render all target envs in CI
- Publish the rendered release bundle into `warehouses/codeai/releases/git-<full-commit-sha>/`

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
