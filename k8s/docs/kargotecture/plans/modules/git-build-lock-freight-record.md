# Git Build-Lock Freight Record

**Short name:** Build-lock freight

**Purpose:** Reuse one tiny Git release record shape across plans that want
Kargo to discover Freight from `k8s-gitops`, but do the real deployment work
later.

## Detailed Technical Description of Module
This module is the smallest possible release contract for the thin-lock family:
it says, in Git, exactly which `code-dot-org` commit and image digest Kargo
should promote, and nothing more. The file is not a rendered manifest, not a
snapshot of the package, and not a deployment target. It is a release witness.
That distinction matters because the downstream plan is free to decide whether
the promoted release will later mutate Helm values, pin a Kustomize entrypoint,
or render full stage output. The build-lock itself stays intentionally boring so
the promotion logic can be deterministic and easy to audit.

The module uses two paths for the same payload on purpose. `git-<full-commit-sha>.yaml`
is the immutable historical record, while `current.yaml` is the stable parse
path Kargo reads at promotion time. The key implementation detail is that CI
must write both files atomically in one commit, because promotion should never
have to guess whether `current.yaml` and the historical lock disagree. That
makes the module different from the rendered-review module, which owns output
branches, and from the live-source checkout module, which owns how to fetch the
source tree once the lock has already identified it.

The other subtlety is that this module deliberately carries just enough extra
metadata to let a downstream plan choose the right deployment strategy without
changing Freight shape. `packaging.kind` and `sourcePath` are not the release
record itself; they are hints for the stage that consumes it. A plan can use
those hints to decide whether to update Helm refs, render source into a branch,
or pin a Kustomize deployment entrypoint, but the shared contract remains the
same: one exact source commit, one exact image, one stable `current.yaml`
parse path.

This module is shared by:
- Argo Refs code-dot-org Commit
- Rendered Branches from a Thin Lock

## Canonical file paths

```text
warehouses/codeai/builds/
  current.yaml
  git-<full-commit-sha>.yaml
```

## Recommended file contents

```yaml
schemaVersion: v1
releaseId: git-<full-commit-sha>
gitCommit: <full-commit-sha>
image:
  ref: ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>
  digest: sha256:...
packaging:
  kind: helm # or kustomize
  sourceRepo: https://github.com/code-dot-org/code-dot-org.git
  sourcePath: k8s/helm # or k8s/kustomize
createdAt: 2026-03-22T12:34:56Z
```

Use this as the lowest-common-denominator contract:
- `gitCommit` is the real source identity
- `image.ref` and `image.digest` pin the built image
- `packaging.kind` tells the stage whether it should later run Helm or Kustomize
- `sourcePath` tells the stage where to clone/render from if it needs live source

## Warehouse sketch

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai-builds
  namespace: kargo-project-codeai
spec:
  subscriptions:
    - git:
        repoURL: https://github.com/code-dot-org/k8s-gitops.git
        branch: main
        includePaths:
          - warehouses/codeai/builds
```

This keeps Freight discovery:
- deterministic
- Git-native
- independent of Argo env files

Both files carry the same schema:
- `git-<full-commit-sha>.yaml` is the historical audit record
- `current.yaml` is the stable promotion-time parse path

`current.yaml` is intentionally not treated as a dangerous mutable "latest"
pointer because promotion always checks out an exact promoted Git Freight
commit. The promoted commit pins the exact `current.yaml` contents.

## GH runner sketch

This is the shared CI shape for build-lock plans:

1. Build and publish the app image tagged `git-<full-commit-sha>`.
2. Resolve the final pushed image digest after the multiplatform image exists.
3. Check out `k8s-gitops` `main`.
4. Write `warehouses/codeai/builds/git-<full-commit-sha>.yaml`.
5. Copy the same contents to `warehouses/codeai/builds/current.yaml`.
6. Commit and push both files in the same commit.

In practice, this means the current
`k8s-commit-to-kargo-warehouse.yml` workflow stops editing
`apps/codeai/deployments/*/values.yaml` and starts writing this build-lock file
instead.

## Hard part: keep history and the stable parse path in sync

The tricky part is no longer promotion-time lookup. It is making the CI write
path explicit enough that an implementation agent does not accidentally update
the historical file and `current.yaml` in different commits.

The required rule is:

1. CI writes `git-<full-commit-sha>.yaml` and `current.yaml` atomically in one commit.
2. Promotion only parses `warehouses/codeai/builds/current.yaml`.
3. Humans and audit tooling read `git-<full-commit-sha>.yaml`.

That is the implementation tradeoff:
- keep the historical per-release file for legibility
- add one stable path so promotion does not need unsupported custom Kargo steps

One more rule is just as important:

1. read `current.yaml` from an exact checkout of the promoted Freight commit
2. make mutable GitOps edits against a separate checkout of `main`

Do not branch or push from the promoted Freight commit directly. That would
turn older promotions into stale-base Git edits instead of replaying the chosen
release onto the latest writable GitOps branch.

## What varies plan-to-plan

The build-lock record is intentionally boring. What changes by plan is what the
promotion stage does after parsing it:

- Argo Refs code-dot-org Commit (Helm variant): update env refs only
- Rendered Branches from a Thin Lock: clone source, render, and commit output
- Argo Refs code-dot-org Commit (Kustomize variant): update deployment Kustomization refs and image pins
