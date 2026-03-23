# Content-Addressed Package Store

- Short name: Package Store
- Catchy description: Split release identity from package identity, then let one
  thin release record point at a deduplicated immutable package store.
- It is: packaging-agnostic plan
- It uses: hybrid pattern

## Warehouse artifact structure under `warehouses/codeai/`

```text
warehouses/codeai/
  packages/
    sha256-<package-hash>/
      package/
        helm/...
        kustomize-base/...
  releases/
    git-<full-commit-sha>.yaml
```

`git-<full-commit-sha>.yaml` maps `$gitcommit` to:
- package hash
- image digest
- source tree hash

## Freight definition

Freight is the pair:
- image revision from GHCR
- release-record commit for `git-<full-commit-sha>.yaml`

Promotion resolves the package hash out of the release record, then uses the
package store as the immutable source for render inputs.

## Full Kargo project design

- `Warehouse codeai-image` subscribes to the app image repo.
- `Warehouse codeai-release-record` subscribes to the release-record path.
- `staging` resolves `packageHash` and renders from the content-addressed store.
- `review-infra-changes` opens a PR with generated output for downstream envs.
- `test`, `autoscale-prod`, and `levelbuilder` all use the same release record
  and therefore the same package hash.
- ArgoCD consumes rendered output from `k8s-gitops`.

## Stage-by-stage promotion flow

1. Build computes the deploy package hash.
2. If the package already exists, CI only adds a new `git-<full-commit-sha>.yaml` release
   record.
3. `staging` resolves the package hash and renders staging.
4. `review-infra-changes` opens a PR for downstream rendered changes.
5. `test` syncs after PR approval and verifies the package hash used in render.
6. `autoscale-prod` and `levelbuilder` promote the same release record.

## `review infra changes` stage behavior

- The PR includes the release record, package hash, and rendered diffs.
- Reviewers mostly look at rendered output; the content-addressed store exists
  to guarantee repeatability and dedupe.

## `test` stage automation behavior

- Re-resolve the package hash from the approved release record.
- Sync test.
- Run rollout and smoke checks.
- Fail if the package hash or image digest differ from the approved release
  record.

## Does it break/awkwardize skaffold or local-dev in any way?

No direct break. The store is a release-time optimization and immutability
layer, not a local authoring format.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/                  # optional future structure
  release/
    package-store/
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

- Strong immutability story.
- Removes duplicate storage when many commits produce the same deploy package.
- Works with either Git-backed or OCI-backed package storage later.

### Cons

- More human indirection during debugging.
- Lower KISS than a simple package stream.
- Still needs a release-record stream in addition to the package store.

## Migration notes

- Add the release-record format first.
- Use content addressing only after the basic package snapshot flow already
  works.
- Do not expose raw package hashes as the main human-facing release name.

## Any useful implementation notes that do not fit neatly elsewhere

- Keep `git-<full-commit-sha>.yaml` the human-facing release object.
- Treat the package hash as an implementation detail with strong audit value.
- Pair this plan with good tooling for inspecting a hash and expanding it back
  to human-readable metadata.

# Code changes

## k8s-gitops changes

- Add rendered output paths.
- Update Kargo configuration to read release records instead of a simple package
  snapshot commit.
- Add metadata recording the approved release record per environment.

## code-dot-org changes

- Add package hash computation and release-record generation in CI.
- Add package store upload logic with dedupe behavior.
- Keep the local Helm tree unchanged.
