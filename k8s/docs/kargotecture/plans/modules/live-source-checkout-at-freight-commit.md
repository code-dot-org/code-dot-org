# Live Source Checkout at Freight Commit

**Short name:** Live source checkout

**Purpose:** Reuse the exact promotion-time checkout pattern for plans that
render from the real `code-dot-org` repository instead of from a frozen package
snapshot.

## Detailed Technical Description of Module
This module is the shared promotion-time source checkout contract for plans
that render from live `code-dot-org` source. Its job is narrowly defined: take
an already-chosen release identity, resolve the exact source commit behind it,
and clone only the packaging tree needed for rendering. The module is not about
Freight discovery, and it is not about rendered-output storage. It exists to
make sure Kargo renders from the exact promoted commit instead of the moving
branch tip, while keeping the checkout small enough that the huge monorepo does
not become the bottleneck.

The key implementation detail is the separation between commit resolution and
checkout shape. A consuming plan must provide `sourceCommit` from its own
Freight model, then use Kargo's `git-clone` step with an exact commit checkout
plus sparse paths. For Helm that means narrowing the sparse checkout to
`k8s/helm`; for Kustomize that means narrowing it to `k8s/kustomize`. The
rendered-output branch checkout, if present, still comes from `k8s-gitops` and
is a separate concern. That split is what keeps the module reusable: one plan
may feed `sourceCommit` from a build-lock file, another may feed it from live
Freight discovery, but both use the same checkout mechanics once the commit is
known.

The tricky part is that this module only works if the consuming plan is strict
about provenance. If `sourceCommit` comes from the wrong branch, or if the
sparse checkout includes the wrong packaging tree, the render step can still
succeed while producing the wrong manifests. So the module's real rule is not
just "use sparse checkout"; it is "resolve the exact promoted commit first, then
render only the packaging subtree that belongs to that release." That makes it
different from the build-lock module, which defines how Freight is recorded, and
different from the rendered-branch module, which defines where the output ends
up after rendering.

This module is shared by:
- Common-Case Freight + Rendered Branches
- Rendered Branches from a Thin Lock

## Why this is the hard part

These plans are only sane if promotion reads the **exact promoted source
commit**, not the moving branch tip, while also avoiding a full clone of the
giant monorepo.

Fortunately, Kargo's `git-clone` step supports both:
- exact `checkout[].commit`
- `checkout[].sparse`

So the right shape is:
- resolve the exact source commit first
- sparse-check out only the packaging tree that render needs

## Generic checkout sketch

```yaml
- uses: git-clone
  config:
    repoURL: ${{ vars.sourceRepo }}
    checkout:
      - as: source
        commit: ${{ vars.sourceCommit }}
        path: ./src
        sparse:
          - k8s/helm
          - k8s/kustomize
```

In practice:
- `vars.sourceCommit` comes from the build-lock helper or from Git Freight
  itself
- for Helm-first phases, sparse checkout can be narrowed to just `k8s/helm`
- for Kustomize-first phases, sparse checkout can be narrowed to just
  `k8s/kustomize`
- the rendered-output branch checkout still comes from the separate
  `k8s-gitops` clone described in
  [Rendered Stage Branches and PR Review](./rendered-stage-branches-and-pr-review.md)

## Plan-specific source-commit inputs

Rendered Branches from a Thin Lock:

```yaml
vars:
  - name: sourceCommit
    value: ${{ outputs['build-lock'].gitCommit }}
```

Common-Case Freight + Rendered Branches:

```yaml
vars:
  - name: sourceCommit
    value: ${{ commitFrom(vars.sourceRepo, warehouse("codeai")).ID }}
```

## Why this should stay a module

The checkout mechanics are identical. What differs between plans is only:
- where `sourceCommit` comes from
- whether the plan has synthetic Freight writeback at all
