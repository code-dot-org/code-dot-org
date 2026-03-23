# GitOps Truth with Generated Mirror

**Short name:** GitOps truth

**Catchy description:** Move deployment packaging truth into `k8s-gitops`, then generate or mirror a local copy back into `code-dot-org` so Skaffold still works without humans editing two systems by hand.

- **Type:** Packaging-agnostic
- **Pattern:** Source-driven
- **Rendered manifests pattern:** Optional, but not required

## Warehouse artifact
This is the most radical plan.

The GH action still writes a release record:

```text
warehouses/
  codeai/
    builds/
      git-<full-commit-sha>.yaml
```

But the deploy packaging source of truth lives in `k8s-gitops`, for example:

```text
apps/codeai/source/
  helm/ ... # or
  kustomize/
```

The release file carries:
- `$gitcommit`
- image ref + digest
- package revision in `k8s-gitops`

## Freight
Freight is **Git-only**, potentially from both:
- `warehouses/codeai/builds/`
- `apps/codeai/source/`

The simplest variant uses one warehouse rooted at `apps/codeai/source/` plus the build lock path. A more explicit variant uses two warehouses.

## Kargo project
Promotion becomes very direct because the deploy packaging already lives in GitOps:
- update image/digest references
- update package revision if needed
- render only if using rendered outputs

Recommended stage chain:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

This plan is especially compatible with a PR-heavy review workflow.

## Stage-by-stage promotion flow
- `staging`: advance source package + image ref in GitOps
- `test`: copy same release into test source or rendered output, then run tests
- `levelbuilder`: same release into levelbuilder
- `review-infra-changes`: production change on PR branch
- `production`: merge reviewed change

## Helm / Kustomize structure
This plan can work with Helm or Kustomize, but it changes ownership.

### `k8s-gitops`

```text
apps/codeai/
  source/
    helm/           # or kustomize/
  overlays/
  rendered/
warehouses/codeai/
  builds/
```

### `code-dot-org`
The developer-facing source becomes generated or mirrored:

```text
k8s/generated/
  codeai/
    helm/           # or kustomize/
```

Skaffold then points at `k8s/generated/codeai/helm` or the generated local Kustomize path.

Generation options:
- CI mirror job
- checked-in generated subtree
- `bin/update-k8s-generated` script
- git subtree/submodule style import

## Does it break/awkwardize skaffold or local-dev in any way?
Yes, unless the generated mirror is done very carefully. This is the biggest risk in the whole plan:
- local dev now depends on a mirror workflow
- stale generated content becomes a real foot-gun
- onboarding is harder

That is why this plan is included as a creative option, not a presumptive winner.

## Pros
- makes deploy truth live where deploy review already happens
- removes “source repo vs GitOps repo” ambiguity
- can make production review very clean
- packaging and env policy can be reviewed together

## Cons
- highest local-dev and process risk
- easiest plan to accidentally make annoying for Skaffold
- can blur the line between application source and deployment control

## Migration notes
- Do not do this unless you are willing to invest in a polished generation/mirroring workflow.
- If adopted, make the generated mirror reproducible and one-command refreshable.

## Additional implementation notes
- The cleanest version probably uses Kustomize, not Helm, because splitting source, overlays, and generated outputs is conceptually easier there.
- If this plan is ever chosen, it should likely be chosen for review/governance reasons, not for KISS.

# Code changes
## `k8s-gitops` changes
- Add `apps/codeai/source/`
- Potentially add `apps/codeai/overlays/` and/or `apps/codeai/rendered/`
- Rebuild the CodeAI Warehouse and stages around GitOps-native packaging source
- Keep `warehouses/codeai/builds/` as the release trigger or audit log

## `code-dot-org` changes
- Add `k8s/generated/codeai/`
- Update Skaffold to point at the generated mirror
- Add tooling to refresh the mirror safely and predictably
- Potentially remove `k8s/helm` or future deploy Kustomize from primary ownership

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
