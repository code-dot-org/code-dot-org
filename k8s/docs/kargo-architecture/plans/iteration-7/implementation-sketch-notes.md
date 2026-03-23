# Iteration 7 Implementation Sketch Notes

## Shared implementation groups

| Shared shape | Plans | Shared files / objects |
| --- | --- | --- |
| Thin Git build-lock Freight | Argo Refs code-dot-org Commit, Rendered Branches from a Thin Lock | `warehouses/codeai/builds/git-<full-commit-sha>.yaml`, Git Warehouse on `warehouses/codeai/builds/`, GH runner writes the historical file plus `current.yaml` in one commit |
| Stable build-lock parse path | Argo Refs code-dot-org Commit, Rendered Branches from a Thin Lock | `warehouses/codeai/builds/current.yaml`, promotion parses the stable file while humans keep the historical `git-<full-commit-sha>.yaml` files |
| Git Freight read checkout + writable main clone | Argo Refs code-dot-org Commit, Rendered Branches from a Thin Lock, Source Snapshot + Rendered Branches | exact promoted Git Freight commit checked out read-only, plus separate writable `main` checkout for GitOps edits |
| Rendered stage-branch review flow | Common-Case Freight + Rendered Branches, Source Snapshot + Rendered Branches, Rendered Branches from a Thin Lock, OCI Release Capsule | `stage/staging`, `stage/test`, `stage/levelbuilder`, `stage/production`, rendered output branch/path, `review-infra-changes` PR stage |
| Rendered-family Kustomize temp wrapper | Common-Case Freight + Rendered Branches, Source Snapshot + Rendered Branches, Rendered Branches from a Thin Lock, OCI Release Capsule | `apps/codeai/kargo/templates/deploy/` copied into a temp work dir, then the copied `kustomization.yaml` is updated with `namespace`, `resources`, `components`, and `kustomize-set-image` |
| Live source sparse checkout | Common-Case Freight + Rendered Branches, Rendered Branches from a Thin Lock | exact `git-clone` with `checkout[].commit` and `checkout[].sparse` against `code-dot-org` |
| Legacy coexistence gate | Any plan that keeps the migration overlap explicit | `warehouses/codeai/legacy-gitflow/<deployment>/current.yaml`, `merged/git-<full-commit-sha>.yaml` |

Those shared pieces are now broken out into:
- [Git Build-Lock Freight Record](../modules/git-build-lock-freight-record.md)
- [Live Source Checkout at Freight Commit](../modules/live-source-checkout-at-freight-commit.md)
- [Rendered Stage Branches and PR Review](../modules/rendered-stage-branches-and-pr-review.md)
- [Gate Promotion On Legacy Gitflow Branches](../modules/gate-promotion-on-legacy-gitflow-branches.md)

## Plan-by-plan differences

| Plan | Warehouse / Freight sketch | Stage / promotion sketch | GH runner sketch | Freight description vs current understanding | Main implementation deviation or TODO |
| --- | --- | --- | --- | --- | --- |
| Argo Refs code-dot-org Commit | Shared thin Git build-lock record | Helm variant updates `deployment.yaml.targetRevision` + `values.yaml`; Kustomize variant updates seeded deployment wrappers and image rewrites starting from the checked-in `k8s/kustomize/` tree plus `k8s-gitops/apps/codeai/envTypes/*` components | Build image, write both the historical lock file and `current.yaml`, commit them together | Accurate | Helm is the lower-migration variant; Kustomize now starts from the checked-in `k8s/kustomize/...` tree plus envType components and seeded deployment wrappers |
| Rendered Branches from a Thin Lock | Shared thin Git build-lock record | Render from live `code-dot-org` source to rendered stage branches | Same runner as Argo Refs code-dot-org Commit | Accurate | Hard parts are the stable build-lock alias, exact sparse checkout at the promoted source commit, and temp Kustomize wrapper assembly from envType Components plus the shared template |
| Source Snapshot + Render | Git Warehouse on `warehouses/codeai/freight/` with frozen package copy and a stable `current/` mirror | Render from frozen snapshot in `k8s-gitops` to rendered stage branches | Build image, snapshot package into `warehouses/codeai/freight/git-<full-commit-sha>/`, mirror to `current/`, write `freight.yaml` | Accurate | Hard part is keeping the `current/` mirror and the historical directory identical in one commit while rendering Kustomize from snapshot `base/` + `components/` plus the shared temp-wrapper template |
| Common-Case + Render | Combined image + source Git Warehouse, no synthetic warehouse dir | Render from live source + GitOps env policy to rendered stage branches | Build image only; no Kargo-specific Git writeback | Accurate | Hard parts are `git-<full-commit-sha>` image/git pairing, exact sparse checkout of the promoted source commit, and temp Kustomize wrapper assembly from envType Components plus the shared template |
| OCI Release Capsule | Image-led Freight plus promotion-time `oci-download` of capsule | Render from unpacked capsule + GitOps env policy to rendered stage branches | Build image, package/push capsule OCI artifact, no Git Freight record in capsule form | Accurate | Hard parts are keeping `release.yaml` disciplined in CI, implementing the explicit `codeai-release-verify` HTTP contract, and assembling the temp Kustomize wrapper from `package/kustomize/base` plus envType Components and the shared template |

## Freight-description sanity notes

- Argo Refs code-dot-org Commit and Rendered Branches from a Thin Lock now publish the same build-lock Freight contract and parse the same stable `current.yaml` path.
- Source Snapshot + Render now publishes the same package twice in one commit: the historical `git-<full-commit-sha>/` directory and the stable `current/` mirror.
- Common-Case + Render is now locked to `git-<full-commit-sha>` image tags plus `commitFrom(...).ID` pairing.
- OCI Release Capsule remains image-led in Kargo terms; the capsule is promotion-time downloaded artifact state plus an explicit HTTP verifier check, not a Git Freight item.
- The Kustomize variants now start from the checked-in `k8s/kustomize/` tree in `code-dot-org` plus the existing `k8s-gitops/apps/codeai/envTypes/*/kustomization.yaml` Component files. `production` currently also layers in `envTypes/components/autoscaling`.
- The rendered-family Kustomize variants do not rely on committed `apps/codeai/deployments/<deployment>/deploy/` wrappers on `main`. They copy `apps/codeai/kargo/templates/deploy/` into a temp work dir, update the copied `kustomization.yaml` with `namespace`, `resources`, and `components`, then run `kustomize-set-image`.

## Testing philosophy

- Prefer first-class Kargo `verification` and other documented promotion checks when they fit the plan.
- Use [k8s.yml](/Users/seth/.codex/worktrees/684f/code-dot-org/.github/workflows/k8s.yml) or a small reusable workflow called from it only for repo-specific contract, packaging, and local render smoke checks.
- Reuse existing Drone results on the promoted `gitCommit` for app/unit/UI gating.
- Avoid building a fake Kargo or fake Argo harness just to re-test controller behavior.
- Avoid live end-to-end tests unless they validate a repo-specific integration we actually own, such as `codeai-release-verify` if that helper exists.

## Bottom line

- The build-lock plan families are mostly differentiated by what promotion does after parsing the same tiny Freight file.
- The four rendered-review plans are mostly differentiated by where render input comes from:
  live source, frozen Git snapshot, or OCI capsule.
- The real outliers are:
  Common-Case because it removes warehouse writeback entirely, and OCI Release Capsule because it introduces a second artifact system and pushes more responsibility into CI artifact discipline.
