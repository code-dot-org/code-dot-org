# App Capsule + Env Policy Compiler

- Short name: App Capsule + Env Compiler
- Catchy description: Freeze the app once, version environment policy
  separately, and let Kargo compose the two on purpose.
- It is: packaging-agnostic plan
- It uses: hybrid pattern

## Warehouse artifact structure under `warehouses/codeai/`

```text
warehouses/codeai/
  app/
    git-<full-commit-sha>/
      app-capsule.yaml
      package/
        helm/...
        kustomize-base/...
  env/
    env-<commit>/
      env-policy/
        envTypes/...
        deployments/...
```

The app artifact is immutable. The env artifact is versioned policy input.

## Freight definition

Freight is a composed release:
- one immutable app capsule keyed to `$gitcommit`
- one env-policy revision chosen for the target stage

The app capsule is globally shared across stages. The env-policy revision may
advance independently when only environment behavior changes.

## Full Kargo project design

- `Warehouse codeai-app` subscribes to the app capsule stream.
- `Warehouse codeai-env-policy` subscribes to env policy in `k8s-gitops`.
- `staging` assembles the latest approved app capsule with staging env policy.
- `review-infra-changes` opens a PR showing rendered deltas caused by either app
  changes or env policy changes.
- `test` promotes a composed Freight Assembly, not just an image.
- `autoscale-prod` and `levelbuilder` each bind the same app capsule to their
  own env policy inputs.
- ArgoCD consumes rendered output from `k8s-gitops`; the env-policy repo is the
  source for policy, not the direct deploy source.

## Stage-by-stage promotion flow

1. Build publishes an app capsule for `$gitcommit`.
2. Env policy changes land separately in `k8s-gitops`.
3. `staging` composes the app capsule with staging policy and syncs.
4. `review-infra-changes` renders downstream envs and opens a PR when either
   input changed.
5. `test` runs on the approved composition.
6. `autoscale-prod` and `levelbuilder` promote the same app capsule with their
   target policy revisions.

## `review infra changes` stage behavior

- The PR diff shows both rendered changes and the exact app/env pair under
  review.
- If only env policy changed, the PR still records the app capsule revision to
  keep the composition explicit.
- Reviewers can approve policy-only changes without rebuilding the app artifact.

## `test` stage automation behavior

- Sync rendered test output.
- Run application smoke tests and policy-specific checks.
- Verify the composed output still references the approved app capsule digest.
- Fail if the env-policy revision no longer matches the approved PR contents.

## Does it break/awkwardize skaffold or local-dev in any way?

Not directly. Local development still builds from live `code-dot-org` source.
The extra composition model mostly affects CI/CD and promotion-time rendering.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/
    components/
  release/
    app-capsule/
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
  policy/
    shared/
```

## Pros / cons

### Pros

- Best future Kustomize fit in this iteration.
- Sharp separation between reusable app packaging and environment policy.
- Makes policy-only promotions possible without rebuilding the app artifact.
- Aligns well with Kargo's multi-Warehouse and Freight Assembly model.

### Cons

- Lower KISS than the package-stream plan.
- More moving parts to explain to operators.
- Easy to over-abstract if policy boundaries are not kept tight.

## Migration notes

- Start by defining env policy boundaries inside the current `k8s-gitops` repo.
- Publish app capsules from the current Helm tree first.
- Introduce Kustomize bases later behind the same app capsule contract.
- Do not split env policy into a new repo until the logical boundaries prove
  stable.

## Any useful implementation notes that do not fit neatly elsewhere

- Treat env policy as mostly Git-native, not OCI-native.
- Keep the app capsule schema identical for Helm and future Kustomize.
- Use rendered output in Git as the audit and rollback surface.

# Code changes

## k8s-gitops changes

- Add env-policy path conventions and rendered output directories.
- Add a new env-policy Warehouse and Freight Assembly logic.
- Add review-stage metadata that records the approved app/env pairing.
- Update Argo to deploy rendered output, not live source + values layering.

## code-dot-org changes

- Add app capsule generation in CI.
- Define a stable package export schema that works for Helm now and Kustomize
  later.
- Add metadata generation so downstream policy compilers can verify the app
  capsule identity.
