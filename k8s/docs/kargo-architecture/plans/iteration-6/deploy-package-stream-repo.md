# Deploy Package Stream Repo

- Short name: Package Stream Repo
- Catchy description: Keep the release payload Git-native, but shrink the Git
  surface until Kargo only reads the deploy package it actually needs.
- It is: packaging-agnostic plan
- It uses: hybrid pattern

## Warehouse artifact structure under `warehouses/codeai/`

```text
warehouses/codeai/
  releases/
    git-<full-commit-sha>/
      release.yaml
      package/
        helm/...
        kustomize-base/...
```

This tree lives in a dedicated `codeai-package-stream` repo, not in
`k8s-gitops`.

## Freight definition

Freight is a matched pair:
- app image revision from `ghcr.io/code-dot-org/code-dot-org:git-<full-commit-sha>`
- package-stream Git commit containing `warehouses/codeai/releases/git-<full-commit-sha>/`

`release.yaml` records the canonical `$gitcommit`, package tree hash, and image
digest. Promotion fails if the package snapshot and image do not agree on the
same `$gitcommit`.

## Full Kargo project design

- `Warehouse codeai-image` subscribes to the app image repo.
- `Warehouse codeai-package` subscribes to the `codeai-package-stream` Git repo
  under `warehouses/codeai/releases/`.
- `Stage staging` assembles Freight from the matched image and package
  snapshot, renders staging output, and commits rendered manifests to
  `k8s-gitops`.
- `Stage review-infra-changes` renders `test`, `autoscale-prod`, and
  `levelbuilder` candidates to a promotion branch and opens a PR in
  `k8s-gitops`.
- `Stage test` requires the review PR to be merged, syncs test, and runs Kargo
  verification tasks.
- `Stage autoscale-prod` and `Stage levelbuilder` both request Freight from
  `test` and render their own stage output from the same package snapshot.
- ArgoCD consumes rendered manifests from `k8s-gitops`, not the live chart or
  base in `code-dot-org`.

## Stage-by-stage promotion flow

1. GitHub Actions build `git-<full-commit-sha>` images from `staging`.
2. CI exports only the deploy-relevant package into `codeai-package-stream`
   under `warehouses/codeai/releases/git-<full-commit-sha>/`.
3. `staging` renders from that frozen package plus staging env values and syncs
   automatically.
4. `review-infra-changes` renders the non-staging environments and opens a PR
   with only generated manifest changes and updated stage metadata.
5. After approval, `test` syncs and runs smoke checks and rollback checks.
6. `autoscale-prod` and `levelbuilder` promote the same Freight independently
   from `test`.

## `review infra changes` stage behavior

- Rendered output is committed to a temporary branch in `k8s-gitops`.
- The PR diff is the human review surface.
- The PR body includes the source `$gitcommit`, image digest, package tree hash,
  and links back to the package-stream commit.
- No hand-editing of generated manifests is allowed in the PR; edits must land
  in source or env policy.

## `test` stage automation behavior

- Wait for the review PR merge.
- Sync the test Application.
- Run Kargo `AnalysisTemplate` checks for rollout health, HTTP smoke tests, and
  manifest drift detection.
- Refuse promotion if the rendered output in `k8s-gitops` no longer matches the
  package snapshot and env values.

## Does it break/awkwardize skaffold or local-dev in any way?

No, if local development continues to point at `code-dot-org/k8s/helm` or a
future local `k8s/kustomize/base`. The package-stream repo is CI-only and does
not replace local authoring.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/                # only when Kustomize is introduced
  release/
    export-package/      # CI packaging scripts
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

- Strong KISS story compared with other artifact-heavy ideas.
- Keeps reviewability high by preserving Git-native rendered diffs.
- Removes giant-monorepo promotion reads without moving local source of truth.
- Fits Kargo's image + Git subscription model cleanly.

### Cons

- Introduces another repo that must be owned and monitored forever.
- Exporter correctness becomes critical.
- Package repo drift or accidental human edits need policy guardrails.

## Migration notes

- Start by creating the package-stream repo while keeping Argo on the current
  live-chart model.
- Add the new Warehouse and `review-infra-changes` stage first.
- Switch Argo to rendered manifests only after the package exporter and render
  loop are stable.
- Keep Skaffold and local Helm workflows unchanged throughout migration.

## Any useful implementation notes that do not fit neatly elsewhere

- Use Git path filters so the package repo only tracks release material.
- Prefer one package commit per `$gitcommit`.
- Keep rendered output in `k8s-gitops/main`; use temp branches only for review.

# Code changes

## k8s-gitops changes

- Add rendered output directories under `apps/codeai/rendered/`.
- Add a `review-infra-changes` Stage.
- Update the Argo ApplicationSet to point at rendered output instead of
  `code-dot-org/k8s/helm`.
- Add metadata files or annotations that record the approved package-stream
  commit per environment.

## code-dot-org changes

- Replace `k8s-commit-to-kargo-warehouse.yml` image-only writeback with package
  export plus image publication.
- Add CI packaging scripts that export deploy-relevant files for the matched
  `$gitcommit`.
- Add release metadata generation so image and package can be verified as a
  pair.
