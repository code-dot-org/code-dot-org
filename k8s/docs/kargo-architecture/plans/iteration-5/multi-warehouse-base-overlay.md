# Multi-Warehouse Base + Overlay

**Short name:** Multi-warehouse

**Catchy description:** Promote a frozen Kustomize base and environment policy as separate pieces of freight, then let Kargo compose the two on purpose into rendered branches.

- **Type:** Kustomize plan
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
This plan intentionally splits freight sources.

### Base freight warehouse artifact
The GH action writes:

```text
warehouses/
  codeai/
    base-freight/
      git-<full-commit-sha>/
        freight.yaml
        kustomize/
          kustomization.yaml
```

Recommended `freight.yaml`:

```yaml
schemaVersion: v1
revision: <full-commit-sha>
tag: git-<full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packageType: kustomize
treeHash: sha256:...
createdAt: 2026-03-22T12:34:56Z
```

Rule:
- `packageType: kustomize` means the payload lives in `kustomize/`
- the only hard package contract is `kustomize/kustomization.yaml` exists

### Overlay warehouse input
Environment policy lives in `k8s-gitops` as Kustomize overlays, for example:

```text
apps/codeai/overlays/
  staging/
  test/
  levelbuilder/
  production/
```

You can model overlays as one shared Git warehouse with `includePaths`, or as multiple narrow warehouses if you want stricter blast-radius control.

## Freight
Freight is **multi-warehouse Git freight**:
- one Git freight for the immutable base snapshot
- one Git freight for overlay / env-policy changes

What moves through the pipeline is the explicit composition of those two inputs:
- app/base revision
- env-policy revision

This is the most Kargo-native future-Kustomize design in the set.

Pros:
- base release promotion and overlay promotion can be reasoned about separately
- matches the documented `copy`/multiple working tree pattern
- lets policy-only changes move without pretending they are app releases

Cons:
- materially more complex than single-warehouse designs
- reviewers need to understand both which warehouse triggered the promotion and which exact pair is under review

## Kargo project
Recommended stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Recommended warehouses:
- `codeai-base-freight`
- `codeai-overlays`

Promotion task pattern:
1. Clone `k8s-gitops` at the base-freight commit to `./src`.
2. Clone `k8s-gitops` at the overlay freight commit to `./overlay`.
3. Clone the stage output branch/path to `./out`.
4. Copy the target overlay into the assembled Kustomize source tree rooted at `./src/warehouses/codeai/base-freight/git-<full-commit-sha>/kustomize/`.
5. Set the image digest/tag from `freight.yaml`.
6. Run `kustomize-build`.
7. Record the exact base-freight + overlay-freight pair under review.
8. Commit and push rendered output.

This is directly inspired by the Kargo docs’ “base + overlay” composition example.

## Stage-by-stage promotion flow
- `staging`: direct from the base-freight warehouse, plus the current staging overlay
  - concretely: from `warehouses/codeai/base-freight/git-<full-commit-sha>/kustomize/`
- `test`: same base freight as `staging`, promoted from `staging`, plus the test overlay
- `levelbuilder`: same base freight as `test`, plus the levelbuilder overlay
- `review-infra-changes`: same base freight as `test`, plus the production overlay, rendered to a PR branch
- `production`: merge the reviewed output

The important subtlety is that the *kind* of freight does not change by stage. Stages change which overlay they apply to the same base release, and the thing under review is always the explicit base+overlay pair.

This means:
- a new base snapshot can reuse an existing overlay revision
- a policy-only overlay change can be reviewed and promoted without rebuilding the base snapshot

## Helm / Kustomize structure
This plan assumes a deliberate Kustomize redesign.

### `code-dot-org`

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

### `k8s-gitops`

```text
apps/codeai/
  overlays/
    staging/
    test/
    levelbuilder/
    production/
  rendered/
    staging/
    test/
    levelbuilder/
    production/
warehouses/codeai/
  base-freight/
    git-<full-commit-sha>/
```

`envTypes/` can either remain as shared overlay fragments, or be folded into `apps/codeai/overlays/<env>/`.

## Does it break/awkwardize skaffold or local-dev in any way?
Only mildly. Local dev should still use local overlays in `code-dot-org`, so Skaffold does not need to read production/test overlays from `k8s-gitops`. The awkwardness is mostly conceptual: dev and deploy overlays now live in different repos.

## Pros
- strongest Kargo-native Kustomize design
- clean separation between release source and deploy policy
- supports independent overlay evolution
- very strong future-Kustomize fit

## Cons
- highest conceptual complexity among the serious Kustomize plans
- more warehouses, more freight combinations, more opportunities for human confusion
- overkill if CodeAI wants one simple pipeline

## Migration notes
- Do this only if you want Kustomize to be a long-term first-class deploy system.
- Standardize overlay structure first, then add the second warehouse.

## Additional implementation notes
- A good compromise is to use one overlay warehouse rooted at `apps/codeai/overlays` rather than one warehouse per env.
- `review-infra-changes` should absolutely be PR-based in this model.
- the PR should record the exact base-freight revision and overlay revision being approved
- if only overlay policy changed, the PR should still record the base revision so the composition stays explicit
- `test` should verify the composed output, not just the base snapshot in isolation
- This is probably the best “ambitious Kustomize” plan and should be scored that way even if it loses on KISS.

# Code changes
## `k8s-gitops` changes
- Add `warehouses/codeai/base-freight/`
- Add `apps/codeai/overlays/`
- Add `apps/codeai/rendered/`
- Add a second Warehouse for overlay/config changes
- Add review metadata that records the approved base/overlay pairing
- Rewrite stages to assemble base freight + overlay freight + render
- Point Argo apps at rendered outputs

## `code-dot-org` changes
- Create the durable `k8s/kustomize/` source tree rooted by `kustomization.yaml`
- Update the GH action to snapshot that Kustomize package into `warehouses/codeai/base-freight/git-<full-commit-sha>/kustomize/`
- Keep the base snapshot schema stable so downstream promotion can verify the exact base revision being composed
- Keep local dev overlays in source repo for Skaffold

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
