# Iteration 6 Rankings

## Best for

- Best for KISS: [Deploy Package Stream Repo](./deploy-package-stream-repo.md)
- Best for reviewability:
  [Deploy Package Stream Repo](./deploy-package-stream-repo.md)
- Best for future Kustomize:
  [App Capsule + Env Policy Compiler](./app-capsule-env-policy-compiler.md)
- Best for Kargo Native:
  [Deploy Package Stream Repo](./deploy-package-stream-repo.md)

## Plan list

1. [Deploy Package Stream Repo](./deploy-package-stream-repo.md)
2. [App Capsule + Env Policy Compiler](./app-capsule-env-policy-compiler.md)
3. [OCI Release Capsule](./oci-release-capsule.md)
4. [Shadow Promotion Bridge](./shadow-promotion-bridge.md)
5. [Content-Addressed Package Store](./content-addressed-package-store.md)
6. [Attested Freight Graph](./attested-freight-graph.md)
7. [Rendered Stage Artifact Pipeline](./rendered-stage-artifact-pipeline.md)
8. [Hermetic Render Formula](./hermetic-render-formula.md)

## Why the top few landed where they did

- `Deploy Package Stream Repo` won because it fixes the monorepo/artifact
  boundary without giving up Git-native review, rendered output in Git, or local
  Skaffold workflows.
- `App Capsule + Env Policy Compiler` ranked second because it is the best
  future-Kustomize architecture in the set, but it pays a clear KISS tax
  compared with the package-stream plan.
- `OCI Release Capsule` ranked third because it gives the cleanest immutable
  release object model, but generic OCI artifacts still need more glue than the
  Git-native winner.

## What changed since the prior iteration

- Per user instruction, no prior iteration plans, rankings, notes, or reports
  were loaded into context.
- Relative to the starting iteration-6 seed materials, this pass converted eight
  merged seed families into eight decision-complete plans, surfaced the top
  implementation candidates, and moved future hybrids into `NOTES.md`.

## Weighted rankings

| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Deploy Package Stream Repo](./deploy-package-stream-repo.md) | 4 | 5 | 4 | 4 | 5 | 5 | 4 | 5 | 4 | 4 | **42.7** |
| 2 | [App Capsule + Env Policy Compiler](./app-capsule-env-policy-compiler.md) | 3 | 4 | 5 | 3 | 4 | 5 | 3 | 4 | 4 | 4 | **36.6** |
| 3 | [OCI Release Capsule](./oci-release-capsule.md) | 3 | 4 | 4 | 4 | 5 | 4 | 3 | 4 | 5 | 3 | **35.7** |
| 4 | [Shadow Promotion Bridge](./shadow-promotion-bridge.md) | 3 | 4 | 3 | 4 | 5 | 3 | 5 | 4 | 3 | 3 | **33.8** |
| 5 | [Content-Addressed Package Store](./content-addressed-package-store.md) | 2 | 3 | 4 | 4 | 5 | 4 | 3 | 3 | 5 | 3 | **30.4** |
| 6 | [Attested Freight Graph](./attested-freight-graph.md) | 2 | 3 | 4 | 3 | 5 | 4 | 2 | 3 | 5 | 2 | **29.1** |
| 7 | [Rendered Stage Artifact Pipeline](./rendered-stage-artifact-pipeline.md) | 2 | 3 | 4 | 3 | 5 | 2 | 2 | 2 | 5 | 2 | **26.8** |
| 8 | [Hermetic Render Formula](./hermetic-render-formula.md) | 1 | 2 | 4 | 3 | 4 | 2 | 1 | 2 | 5 | 2 | **20.6** |
