# Rendered Stage Artifact Pipeline

- Short name: Rendered Stage Artifacts
- Catchy description: Treat the rendered deployable itself as the stage output
  artifact, not just as a temporary byproduct on the way to Git.
- It is: packaging-agnostic plan
- It uses: hybrid pattern

## Warehouse artifact structure under `warehouses/codeai/`

```text
warehouses/codeai/
  releases/
    git-<full-commit-sha>/
      release.yaml
      package/
  rendered/
    staging/
      git-<full-commit-sha>.tgz
    test/
      git-<full-commit-sha>.tgz
    production/
      git-<full-commit-sha>.tgz
    levelbuilder/
      git-<full-commit-sha>.tgz
```

The rendered artifacts are published as OCI artifacts. Git stores only review
summaries and stage pointers.

## Freight definition

Base Freight is still the release pair:
- image revision
- matching package snapshot

Rendered stage artifacts are secondary outputs produced by promotion. Later
stages may reuse them or force a re-render if policy changed.

## Full Kargo project design

- `Warehouse codeai-image` and `Warehouse codeai-package` provide the base
  release inputs.
- `staging` renders once and publishes a rendered OCI artifact for staging.
- `review-infra-changes` compares candidate rendered artifacts to currently
  deployed stage artifacts and opens a PR containing only pointer changes and a
  diff summary.
- `test`, `autoscale-prod`, and `levelbuilder` each publish their own rendered
  stage artifact.
- ArgoCD consumes a stage pointer file from `k8s-gitops` plus a plugin or side
  controller that fetches the OCI artifact.

## Stage-by-stage promotion flow

1. Build publishes the normal release package and image.
2. `staging` renders staging and publishes `rendered/staging/git-<full-commit-sha>`.
3. `review-infra-changes` renders downstream candidates and opens a PR updating
   stage pointers.
4. `test` promotes the approved pointer, syncs, and optionally re-renders to
   confirm cache correctness.
5. `autoscale-prod` and `levelbuilder` publish their own rendered stage
   artifacts from the same source Freight.

## `review infra changes` stage behavior

- The PR shows a generated diff summary between current and candidate rendered
  stage artifacts.
- Reviewers approve a pointer move, not a committed manifest tree.
- The stage artifact digest is recorded in the PR metadata.

## `test` stage automation behavior

- Fetch the approved rendered stage artifact.
- Sync the test Application using the pointer.
- Run rollout and smoke checks.
- Optionally re-render and compare digests to catch stale-cache or
  non-determinism problems.

## Does it break/awkwardize skaffold or local-dev in any way?

No direct break for local dev, but it increases the mental gap between local
source and the production deploy surface.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/                  # optional future structure
```

`k8s-gitops`:

```text
apps/codeai/
  envTypes/
  deployments/
  rendered-pointers/
    staging.yaml
    test.yaml
    production.yaml
    levelbuilder.yaml
```

## Pros / cons

### Pros

- Strong artifact integrity for what actually gets deployed.
- Makes rendered outputs reusable across stages.
- Could reduce repeated render work.

### Cons

- Much weaker reviewability than rendered Git output.
- Requires Argo plugin or side-controller work.
- Harder day-2 debugging because Git no longer holds the canonical manifests.

## Migration notes

- Introduce rendered OCI publication first while still keeping Git-rendered
  manifests as the deploy source.
- Switch Argo to pointer + OCI only if the plugin/controller path proves stable.
- Keep this as a deliberate step away from the default, not the baseline path.

## Any useful implementation notes that do not fit neatly elsewhere

- Store digests, not mutable tags, in the stage pointer files.
- Keep a tool that can expand a pointer back into manifests for operators.
- Re-render comparison is mandatory if reuse is allowed.

# Code changes

## k8s-gitops changes

- Add `rendered-pointers/`.
- Update Argo Applications or add a plugin/controller that can materialize the
  rendered OCI artifact.
- Add review PR automation that attaches rendered diffs even though the PR does
  not contain raw manifests.

## code-dot-org changes

- Add rendered artifact publication logic.
- Add tooling to diff current vs candidate rendered OCI artifacts.
- Keep package export and image build aligned to the same `$gitcommit`.
