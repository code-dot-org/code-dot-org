# Common-Case Freight + Rendered Branches

**Short name:** Common-case render

**Catchy description:** Stop manufacturing a fake build-lock commit. Let Kargo assemble the real monorepo commit and the real image into one Freight, then render stage branches from sparse checkouts of the huge repo.

- **Type:** Packaging-agnostic
- **Pattern:** Hybrid
- **Rendered manifests pattern:** Yes

## Warehouse artifact
This plan intentionally does **not** use a synthetic `warehouses/codeai/` tree.

Instead of teaching Kargo about a release by committing a release record into
`k8s-gitops`, let Kargo discover the release directly from the real artifacts:

- the built image in `ghcr.io/code-dot-org/code-dot-org`
- the matching `code-dot-org` commit on `staging`

Suggested Warehouse shape:

```yaml
apiVersion: kargo.akuity.io/v1alpha1
kind: Warehouse
metadata:
  name: codeai
spec:
  freightCreationPolicy: Automatic
  subscriptions:
    - image:
        repoURL: ghcr.io/code-dot-org/code-dot-org
        allowTagsRegexes:
          - ^git-[0-9a-f]{40}$
    - git:
        repoURL: https://github.com/code-dot-org/code-dot-org.git
        branch: staging
        commitSelectionStrategy: NewestFromBranch
  freightCreationCriteria:
    expression: |
      imageFrom('ghcr.io/code-dot-org/code-dot-org').Tag ==
      'git-' + commitFrom('https://github.com/code-dot-org/code-dot-org.git').ID
```

Operationally, `warehouses/codeai/` becomes “nothing.” The image and the source
commit are the release record.

## Freight
Freight is a **single multi-artifact Freight** from one Warehouse:

- one image revision
- one `code-dot-org` Git commit

Those two artifacts are promoted together as a unit.

The image must publish an immutable `git-<full-commit-sha>` tag in addition to any
human-friendly branch tags.

## Kargo project
Stages:
- `staging`
- `test`
- `levelbuilder`
- `review-infra-changes`
- `production`

Recommended stage rules:
- `staging`: direct from Warehouse
- `test`: from `staging`, ideally using `MatchUpstream`
- `levelbuilder`: from `test`, ideally using `MatchUpstream`
- `review-infra-changes`: from `test`, ideally using `MatchUpstream`
- `production`: from `review-infra-changes`

Recommended promotion task shape:
1. Clone `k8s-gitops` `main` to `./meta` for env policy and app metadata.
2. Clone `k8s-gitops` `stage/<stage>` to `./out`.
3. Clone `code-dot-org` at the Freight commit to `./src` using sparse checkout.
4. `git-clear` `./out`.
5. Render the stage output from `./src` + `./meta`.
6. Commit and push `./out`.
7. Ask Argo CD to sync the stage app to the rendered branch commit.

This is basically Kargo’s documented **Common Case** plus **Rendered Configs**
plus the maintainers’ preferred **stage-specific branches** storage shape.

## Stage-by-stage promotion flow
- `staging`: render the staging deployment from the exact Freight commit/image pair to `stage/staging`
- `test`: render `stage/test`, sync, then run verification against the exact same Freight already running in `staging`
- `levelbuilder`: render `stage/levelbuilder` from the exact Freight verified in `test`
- `review-infra-changes`: render production output to a generated branch, open a PR against `stage/production`, and wait for review/merge
- `production`: sync the already-reviewed `stage/production` branch after the PR merge

The crucial point is that the Freight shape does **not** change across stages.
Only the rendered view changes.

## `review infra changes` stage behavior
This stage should behave like a real Git review gate:
1. Clone `stage/production` to `./out`.
2. Render production manifests from the Freight commit and production env config.
3. Commit to a generated branch.
4. Open a PR against `stage/production`.
5. Wait for merge.

Use `git-wait-for-pr` by default.

`git-merge-pr` is a valid later optimization if the team wants “open a PR for
audit, but auto-merge when checks pass,” but it should not be the first design.

## `test` stage automation behavior
After `stage/test` is updated and synced, run verification before allowing
promotion onward.

Good fits:
- Kargo `verification` with `AnalysisTemplate`s for smoke checks
- external integration tests triggered after sync
- `MatchUpstream` so downstream stages always follow the exact Freight verified in `test`, not merely the newest discovered Freight

## Does it break/awkwardize skaffold or local-dev in any way?
No.

Local dev keeps using source packaging in `code-dot-org`, exactly where it lives
today. Promotion-time rendering is isolated to Kargo.

## Proposed Helm / Kustomize directory structure
### `code-dot-org`
Helm can stay where it is:

```text
k8s/helm/
```

Future Kustomize should become more explicit:

```text
k8s/kustomize/
  base/
  components/
  stages/
    staging/
    test/
    levelbuilder/
    production/
```

### `k8s-gitops`
`main` keeps only env policy and Argo metadata:

```text
apps/codeai/
  envTypes/
  deployments/
```

Rendered output lives on stage branches, not on `main`:

```text
stage/staging        -> apps/codeai/rendered/
stage/test           -> apps/codeai/rendered/
stage/levelbuilder   -> apps/codeai/rendered/
stage/production     -> apps/codeai/rendered/
```

That keeps the review surface honest and avoids feedback loops.

## Pros
- removes the synthetic warehouse writeback workflow entirely
- uses Kargo the way the current docs/examples actually want to be used
- keeps source of truth in `code-dot-org`
- preserves excellent reviewability through rendered output
- sparse checkout makes promotion-time monorepo reads realistic

## Cons
- requires immutable `git-<full-commit-sha>` image tags
- depends on two upstream artifacts becoming available in lockstep
- more Kargo expression logic than the thin-lock control plan
- still clones source during promotion instead of using a frozen package snapshot

## Migration notes
- Stop writing release records into `k8s-gitops`.
- Make the image build publish immutable `git-<full-commit-sha>` tags.
- Replace the current image-only Warehouse with the combined image+git Warehouse.
- Move Argo CD apps to rendered stage branches.
- Use sparse checkout aggressively so Kargo does not slurp the whole monorepo.

## Additional implementation notes
- This is the first plan in the set that really uses Kargo’s newer freight
  assembly features instead of building a sidecar release-record system.
- If the image+git pairing turns out to be awkward in practice, the next thing
  to try is not “go back to build locks.” It is “let the image carry the commit
  via OCI annotations and make the Warehouse image-only.”

# Code changes
## `k8s-gitops` changes
- Delete the need for `warehouses/codeai/`
- Replace the current CodeAI Warehouse with a combined image+git Warehouse
- Rewrite Stages around rendered stage branches such as `stage/staging`
- Update Argo Applications to deploy from rendered stage branches in `k8s-gitops`
- Add `review-infra-changes` PR behavior against `stage/production`

## `code-dot-org` changes
- Remove `k8s-commit-to-kargo-warehouse.yml` from the release path
- Publish immutable `git-<full-commit-sha>` image tags
- No required Helm restructure for the first version
- Later Kustomize work can happen in-place without changing the release identity model

## modules that are part of implementing this plan
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)
