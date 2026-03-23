# Shadow Promotion Bridge

- Short name: Shadow Bridge
- Catchy description: Use Kargo to drive Kubernetes promotion, but keep legacy
  deployment intent in the same promotion loop until the migration is truly
  over.
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
  legacy-intent/
    git-<full-commit-sha>.yaml
```

The release package can come from a package-stream repo. `legacy-intent` is a
promotion record, not a deploy package.

## Freight definition

Freight is the normal release pair:
- app image revision
- matching package snapshot keyed to `$gitcommit`

Legacy deployment status is not part of Freight itself. It is an explicit gate
that later stages must satisfy.

## Full Kargo project design

- `Warehouse codeai-image` and `Warehouse codeai-package` provide the normal
  release inputs.
- `staging` writes rendered staging output and records legacy deployment intent
  for the same `$gitcommit`.
- `review-infra-changes` opens a PR showing the candidate k8s changes and the
  expected legacy fleet target.
- `test` runs only after the same `$gitcommit` is acknowledged by both the k8s
  path and the legacy path.
- `autoscale-prod` and `levelbuilder` also require legacy acknowledgement unless
  a one-time migration override is approved.
- ArgoCD still consumes rendered Git output.

## Stage-by-stage promotion flow

1. Build publishes the normal release package and image.
2. `staging` deploys to k8s and writes a `legacy-intent` record for visibility.
3. `review-infra-changes` opens a PR that shows both rendered deltas and legacy
   target metadata.
4. `test` promotes only if the same `$gitcommit` is confirmed in the legacy
   path.
5. `autoscale-prod` and `levelbuilder` gate on both k8s verification and legacy
   status until the bridge is retired.

## `review infra changes` stage behavior

- The PR diff remains the main review surface.
- The PR also shows the expected legacy branch or fleet target for the same
  release.
- Reviewers can explicitly see when k8s and legacy promotion paths are about to
  diverge.

## `test` stage automation behavior

- Sync the test environment.
- Run normal rollout and smoke checks.
- Query the legacy promotion record or branch state and confirm the same
  `$gitcommit`.
- Fail closed if the legacy path is behind, ahead, or pointed at another
  release.

## Does it break/awkwardize skaffold or local-dev in any way?

No. This plan changes promotion governance, not local authoring.

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
  rendered/
  legacy-intent/
    staging/
    test/
    production/
    levelbuilder/
```

## Pros / cons

### Pros

- Most honest plan about the real hybrid migration period.
- Makes drift between legacy and k8s promotion visible.
- Keeps local dev and release packaging mostly unchanged.

### Cons

- Transitional by design, so it must be retired deliberately.
- Lower Kargo-native simplicity than the top-ranked plans.
- Dual truth can slow down promotion and confuse ownership if it lingers.

## Migration notes

- Use this only during the overlap period.
- Start with visibility-only `legacy-intent` records before enforcing hard
  gates.
- Add a removal criterion up front so the bridge does not become permanent.

## Any useful implementation notes that do not fit neatly elsewhere

- Model the legacy gate as verification data, not as extra mutable config.
- Keep the underlying release packaging simple; the point of this plan is the
  bridge, not a new artifact format.

# Code changes

## k8s-gitops changes

- Add `legacy-intent/` records per environment.
- Add verification hooks that can read legacy promotion state.
- Add a `review-infra-changes` Stage that includes legacy target metadata in PRs.
- Add rendered output paths if Argo is moved to rendered Git output.

## code-dot-org changes

- Publish release metadata that always names the canonical `$gitcommit`.
- Add any helper used to map legacy promotion signals back to the same
  `$gitcommit`.
- Keep existing local Helm structure intact.
