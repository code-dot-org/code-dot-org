# Iteration 6 Report

## Important note

- This iteration was intentionally generated without reading or incorporating
  iteration 5 ideas, plan docs, notes, rankings, or reports.
- It was seeded only from
  [SEED_IDEAS](./plans/iteration-6/SEED_IDEAS.md).
- After a later manual comparison against iteration 5, the two iteration 6
  ideas most worth pulling forward are:
  - [Deploy Package Stream Repo](./plans/iteration-6/deploy-package-stream-repo.md)
  - [Shadow Promotion Bridge](./plans/iteration-6/shadow-promotion-bridge.md)

## Deploy Package Stream Repo vs Source Snapshot + Render

`Deploy Package Stream Repo` is in the same architecture family as iteration
5's
[Source Snapshot (Helm or Kustomize) + Rendered Branches](./plans/iteration-5/source-snapshot-rendered-branches.md).

They should be treated as functionally the same if all of the following are
true:
- CI freezes the deploy package once per `$gitcommit`
- Kargo promotes that frozen package plus the matching image
- downstream stages render from the frozen package into Git-reviewed output
- local dev still authors packaging in `code-dot-org`

Under those conditions, the only real difference is **where the frozen package
archive lives**:
- `Source Snapshot + Render`: inside `k8s-gitops` under
  `warehouses/codeai/releases/...`
- `Deploy Package Stream Repo`: in a separate tiny repo dedicated to frozen
  packages

That difference becomes materially important only if you care about:
- keeping `k8s-gitops` from turning into a long-term artifact archive
- separating env-policy ownership from release-payload ownership
- reducing GitOps repo churn, retention pressure, or audit noise
- giving Kargo a small package repo instead of making it read snapshots from the
  same repo that also holds Argo/Kargo/env policy

If those repo-boundary concerns are not important, then `Deploy Package Stream
Repo` and `Source Snapshot + Render` should mostly be considered the same
solution with different storage placement.

## Shadow Promotion Bridge, concretely

The concrete version is:

1. Keep a normal k8s release architecture underneath, ideally one of the simple
   frozen-package plans.
2. For every promoted `$gitcommit`, also record the intended legacy release
   state, such as "legacy staging should also be at this same commit."
3. `staging` deploys to k8s as normal, but also writes or checks a
   `legacy-intent` record for the same `$gitcommit`.
4. `review-infra-changes` shows both:
   - the k8s rendered diff
   - the legacy target state for that same release
5. `test` does not count as passed until:
   - k8s verification passes
   - the legacy path also acknowledges or reaches that same `$gitcommit`
6. `levelbuilder` / `production` gates can require the same dual
   confirmation while the migration overlap lasts.
7. Once legacy rollout is retired, remove the bridge entirely and keep the
   underlying simpler release architecture.

So the real point of `Shadow Promotion Bridge` is not "invent a new packaging
model." It is "make the coexistence period explicit and gated instead of
hand-waved."

# REMAINDER OF FILE IS NORMAL REPORT OUTPUT AS PER research-plan.md

- Best for KISS:
  [Deploy Package Stream Repo](./plans/iteration-6/deploy-package-stream-repo.md)
  (**42.7**)
- Best for reviewability:
  [Deploy Package Stream Repo](./plans/iteration-6/deploy-package-stream-repo.md)
  (**42.7**)
- Best for future Kustomize:
  [App Capsule + Env Policy Compiler](./plans/iteration-6/app-capsule-env-policy-compiler.md)
  (**36.6**)
- Best for Kargo Native:
  [Deploy Package Stream Repo](./plans/iteration-6/deploy-package-stream-repo.md)
  (**42.7**)

This iteration was intentionally constrained to the iteration 6 seed set and
iteration 6 notes. No prior iteration plans, notes, rankings, or reports were
loaded. The result is one ranked pass over eight iteration 6 idea families,
converted into decision-complete plan docs.

## Ranked plans

- 1.
  [Deploy Package Stream Repo](./plans/iteration-6/deploy-package-stream-repo.md)
  (**42.7**): the cleanest balance of frozen packages, Git reviewability,
  rendered output, and local-dev safety.
- 2.
  [App Capsule + Env Policy Compiler](./plans/iteration-6/app-capsule-env-policy-compiler.md)
  (**36.6**): the best shape if future Kustomize and sharper env-policy
  separation are real priorities.
- 3. [OCI Release Capsule](./plans/iteration-6/oci-release-capsule.md)
  (**35.7**): the strongest immutable-release-object framing, but still more
  glue-heavy than the Git-native winner.
- 4. [Shadow Promotion Bridge](./plans/iteration-6/shadow-promotion-bridge.md)
  (**33.8**): the most honest plan about the migration era, but intentionally
  transitional.
- 5.
  [Content-Addressed Package Store](./plans/iteration-6/content-addressed-package-store.md)
  (**30.4**): attractive as a storage optimization, but not simple enough to
  beat the package-stream baseline.
- 6. [Attested Freight Graph](./plans/iteration-6/attested-freight-graph.md)
  (**29.1**): better as a hardening layer than as the primary architecture.
- 7.
  [Rendered Stage Artifact Pipeline](./plans/iteration-6/rendered-stage-artifact-pipeline.md)
  (**26.8**): interesting for artifact purity, but much weaker on reviewability
  and Argo simplicity.
- 8.
  [Hermetic Render Formula](./plans/iteration-6/hermetic-render-formula.md)
  (**20.6**): the strongest reproducibility story, but too second-system-heavy
  for the current stack.

Rankings detail:
- [Iteration 6 rankings](./plans/iteration-6/rankings.md)

## Cross-cutting add-ons / variations

- Content-addressing looks better as an optimization layered onto
  `Deploy Package Stream Repo` than as the first architecture move.
- Stage attestations look better as a hardening layer on top of either the
  package-stream or OCI-capsule plans than as a stand-alone primary model.
- `Shadow Promotion Bridge` looks best as a temporary overlay on top of the
  winning simpler release model, not as the permanent platform core.
- `Hermetic Render Formula` should be treated as a later hardening phase if the
  simpler frozen-package model proves valuable first.

## Weighted rankings table

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Deploy Package Stream Repo](./plans/iteration-6/deploy-package-stream-repo.md) | 4 | 5 | 4 | 4 | 5 | 5 | 4 | 5 | 4 | 4 | **42.7** |
| 2 | [App Capsule + Env Policy Compiler](./plans/iteration-6/app-capsule-env-policy-compiler.md) | 3 | 4 | 5 | 3 | 4 | 5 | 3 | 4 | 4 | 4 | **36.6** |
| 3 | [OCI Release Capsule](./plans/iteration-6/oci-release-capsule.md) | 3 | 4 | 4 | 4 | 5 | 4 | 3 | 4 | 5 | 3 | **35.7** |
| 4 | [Shadow Promotion Bridge](./plans/iteration-6/shadow-promotion-bridge.md) | 3 | 4 | 3 | 4 | 5 | 3 | 5 | 4 | 3 | 3 | **33.8** |
| 5 | [Content-Addressed Package Store](./plans/iteration-6/content-addressed-package-store.md) | 2 | 3 | 4 | 4 | 5 | 4 | 3 | 3 | 5 | 3 | **30.4** |
| 6 | [Attested Freight Graph](./plans/iteration-6/attested-freight-graph.md) | 2 | 3 | 4 | 3 | 5 | 4 | 2 | 3 | 5 | 2 | **29.1** |
| 7 | [Rendered Stage Artifact Pipeline](./plans/iteration-6/rendered-stage-artifact-pipeline.md) | 2 | 3 | 4 | 3 | 5 | 2 | 2 | 2 | 5 | 2 | **26.8** |
| 8 | [Hermetic Render Formula](./plans/iteration-6/hermetic-render-formula.md) | 1 | 2 | 4 | 3 | 4 | 2 | 1 | 2 | 5 | 2 | **20.6** |
