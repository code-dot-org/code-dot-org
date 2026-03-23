# Iteration 6 NOTES

## Scope

- This iteration started from `SEED_IDEAS.md` and the earlier iteration-6 seed
  notes only.
- Per explicit user instruction, no prior iteration plan docs, rankings, notes,
  or reports were read.
- This was intentionally a single iteration even though `research-plan.md`
  normally expects more.

## What improved

- The deduped seed list became eight self-contained plan docs with explicit
  Freight definitions, stage flows, and repo changes.
- A consistent stage model emerged across the plan set:
  `staging -> review-infra-changes -> test -> [autoscale-prod, levelbuilder]`.
- The strongest plans now preserve Skaffold and local authoring by keeping
  `code-dot-org/k8s/helm` as the source author surface.
- The plan set is clearer about which ideas are core architectures versus
  hardening layers or migration overlays.

## What got worse

- The exotic plans became less attractive once forced into full operator-facing
  detail.
- Several ideas still end up relying on rendered Git output for reviewability,
  which means their novelty does not translate into enough practical value.
- The more provenance-heavy and hermetic options look expensive relative to the
  current maturity of the stack.

## What ideas converged

- `Deploy Package Stream Repo` became the clean reference point for frozen
  package promotion without giant-monorepo reads.
- `App Capsule + Env Policy Compiler` became the main future-Kustomize-oriented
  architecture.
- `OCI Release Capsule` and `Content-Addressed Package Store` converged into
  alternate storage models for a similar frozen-package promotion shape.
- `Attested Freight Graph` and `Hermetic Render Formula` converged into
  hardening layers more than first moves.
- `Shadow Promotion Bridge` converged into a transitional governance overlay,
  not a durable long-term platform core.

## What new ideas appeared

- Sparse Monorepo + Release Pointer:
  Keep `code-dot-org` as the package source, but combine Kargo's Git path
  filters and sparse checkout with a tiny release pointer artifact that binds
  image digest to package tree hash.
- Dual-Truth Migration Gate:
  Keep `Shadow Promotion Bridge` only as a test-to-prod gate, where k8s
  promotion cannot advance until the same `$gitcommit` is acknowledged by the
  legacy path.
- OCI Capsule + Stage Attestations:
  Treat `Attested Freight Graph` as a hardening layer on top of
  `OCI Release Capsule`, not as a separate primary architecture.

## What unresolved tensions remain

- Whether ArgoCD should ever stop consuming Git-rendered output.
- Whether package storage should stay Git-native or move to OCI once the frozen
  package contract exists.
- Whether future Kustomize needs its own first-class architecture now, or only a
  strong compatibility path inside the simpler winner.
- Whether migration-era legacy alignment deserves a dedicated architecture or
  should remain only a temporary gating overlay.

## Whether another iteration is justified

- Yes, if the next goal is to narrow the eight plans to a short implementation
  shortlist or explicitly test hybrids.
- No, for this specific turn, because the user asked for a single constrained
  iteration seeded only from iteration 6 material.
