# Attested Freight Graph

- Short name: Attested Freight
- Catchy description: Promote only when the package, image, and stage evidence
  form a verifiable graph instead of relying on Git state alone.
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
  attestations/
    build/
    staging/
    test/
    production/
```

The attestation material can live in OCI referrers or another evidence system;
the layout above is the logical model.

## Freight definition

Freight is the normal release pair:
- image revision
- matching package snapshot

Promotion is allowed only if required attestations prove:
- image digest matches the release metadata
- package hash matches the release metadata
- mandatory build/test evidence exists

## Full Kargo project design

- `Warehouse codeai-image` subscribes to the image repo.
- `Warehouse codeai-package` subscribes to the release package stream.
- `staging` verifies build attestations before rendering and then emits a
  passed-staging attestation after successful sync.
- `review-infra-changes` opens a PR with rendered diffs and evidence summary.
- `test` verifies staging evidence, deploys, runs tests, and emits
  passed-test attestation.
- `autoscale-prod` and `levelbuilder` require the appropriate attestation set
  before promotion.
- ArgoCD still consumes rendered output from Git.

## Stage-by-stage promotion flow

1. Build publishes image, package snapshot, and build attestations.
2. `staging` verifies the build graph and deploys.
3. `staging` emits a stage attestation after success.
4. `review-infra-changes` opens a PR that includes evidence links.
5. `test` verifies staging evidence, runs test automation, and emits
   passed-test evidence.
6. `autoscale-prod` and `levelbuilder` require the test attestation before sync.

## `review infra changes` stage behavior

- PRs include a compact evidence summary.
- Reviewers can approve based on both rendered diff and signed evidence.
- The PR itself is not the source of truth for promotion state; the attestation
  graph is.

## `test` stage automation behavior

- Verify the attestation graph before deploy.
- Sync test.
- Run smoke tests and any environment-specific suites.
- Publish a new stage attestation only if both deploy and tests succeed.

## Does it break/awkwardize skaffold or local-dev in any way?

No major local-dev break. The complexity lands in release verification, not in
the local authoring flow.

## Proposed Helm/Kustomize directory structure in both repos if the plan changes them

`code-dot-org`:

```text
k8s/
  helm/
  kustomize/
    base/                  # optional future structure
  release/
    evidence/
```

`k8s-gitops`:

```text
apps/codeai/
  envTypes/
  deployments/
  rendered/
  release-evidence/
```

## Pros / cons

### Pros

- Strongest provenance story short of the hermetic plan.
- Stage evidence becomes explicit instead of implied.
- Can be layered onto simpler package-snapshot plans.

### Cons

- Lower KISS and lower day-2 clarity than the simpler Git-native plans.
- Easy to build something that looks secure but is hard to operate.
- Reviewers may still trust PRs more than attestations, creating dual mental
  models.

## Migration notes

- Add build attestations first.
- Add stage attestations only after verification automation is stable.
- Keep Git review and rendered output so operators still have a familiar
  rollback and audit surface.

## Any useful implementation notes that do not fit neatly elsewhere

- Keep attestation subjects anchored on the image digest and package hash.
- Prefer a small number of mandatory evidence types.
- Do not let stage attestations replace rendered diff review for infra changes.

# Code changes

## k8s-gitops changes

- Add rendered output directories.
- Add verification steps and evidence summary generation.
- Optionally add `release-evidence/` metadata for operator visibility.
- Add a `review-infra-changes` Stage if it does not already exist.

## code-dot-org changes

- Publish signed attestations for build outputs.
- Add helpers that map `$gitcommit`, package hash, and image digest into one
  release identity.
- Keep package export or capsule generation aligned with the attested hashes.
