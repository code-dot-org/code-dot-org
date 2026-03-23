# Plan for the Iterative Kargo System Planning Doc Set

## Summary
Produce a multi-pass Kargo system planning doc set for CodeAI.

Final deliverables:
- Approved research-plan snapshot:
  - `k8s/docs/kargotecture/research-plan.md`
- Iteration summary reports:
  - `k8s/docs/kargotecture/report-iteration-${N}.md`
- Iteration outputs:
  - `k8s/docs/kargotecture/plans/iteration-${N}/*.md`
  - `k8s/docs/kargotecture/plans/iteration-${N}/rankings.md`
  - `k8s/docs/kargotecture/plans/iteration-${N}/NOTES.md`
- Prior iteration snapshots:
  - `k8s/docs/kargotecture/plans/iteration-1/*`
  - `k8s/docs/kargotecture/plans/iteration-2/*`
  - `...`

This work should be iterative and creative. Treat the whole system as editable:
- GH actions
- Kargo warehouse/freight/stages
- ArgoCD layout
- `k8s-gitops` structure
- `code-dot-org/k8s` Helm structure
- future Kustomize structure
- rendered vs source-driven promotion
- review flow

If a really good plan needs a structural refactor, include it. Do not preserve today’s layout by default.

The user will not mind if planning takes 2 hours, as long as each iteration is still improving the rankings or generating new very creative ideas, keep iterating.

## Step 1
Before doing any `make_plans` research/iteration work, write the finally approved research plan **verbatim** to:

- `k8s/docs/kargotecture/research-plan.md`

This file becomes the canonical instruction sheet for the planning effort.

Before each stage of every `make_plans` iteration:
- load `k8s/docs/kargotecture/research-plan.md` freshly into context

If context gets compacted:
- reload `k8s/docs/kargotecture/research-plan.md` again before continuing

Treat this as mandatory process, not optional housekeeping.

## Deliverables
### Canonical iteration output
For each `make_plans` iteration, write the plan set directly to:
- `k8s/docs/kargotecture/plans/iteration-${N}/`

This iteration directory is the canonical output for iteration `N`.

Do not maintain a separate "latest working set" in:
- `k8s/docs/kargotecture/plans/*.md`
- `k8s/docs/kargotecture/plans/rankings.md`

Do not write files to top-level `k8s/docs/kargotecture/plans/` first and then copy them into an iteration directory. Author the iteration output directly inside `iteration-${N}/`.

Each iteration directory must contain:
- that iteration’s plan docs
- `rankings.md`
- `NOTES.md`

`NOTES.md` should be meta notes about the iteration:
- what improved
- what got worse
- what ideas converged
- what new ideas appeared
- what unresolved tensions remain
- whether another iteration is justified

Think of `NOTES.md` as a research-advisor meeting note.

### Iteration summary reports
As the final step of each `make_plans` iteration, write:
- `k8s/docs/kargotecture/report-iteration-${N}.md`

Each iteration report should:
- start with:
  - Best for KISS
  - Best for reviewability
  - Best for future Kustomize
  - Best for Kargo Native
- present the ranked idea list for that iteration
  - in each idea include the weighted ranking from rankings.md
  - link each idea directly to its detailed plan doc in `k8s/docs/kargotecture/plans/iteration-${N}/`
- link directly to `k8s/docs/kargotecture/plans/iteration-${N}/rankings.md`
- include cross-cutting add-ons / variations
- avoid a long appendix
- at the bottom put a weighted rankings table, example:
```
| Rank | Plan | KISS | Review | Kustomize | Helm | Local Dev | Kargo | Migration | Clarity | Immutable | Day-2 | Weighted |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | [Common-Case Freight + Rendered Branches](./plans/iteration-5/common-case-rendered-branches.md) | 4 | 5 | 5 | 4 | 5 | 5 | 3 | 5 | 4 | 5 | 44.0 |
| 2 | [Rendered Branches](./rendered-branches.md) | 4 | 5 | 5 | 4 | 5 | 5 | 3 | 5 | 4 | 4 | 43.2 |
| 3 | [Immutable Package Snapshot + Rendered Branches](.plans/iteration-5/immutable-package-rendered-branches.md) | 4 | 5 | 5 | 5 | 5 | 4 | 3 | 5 | 5 | 4 | 42.8 |
| 4 | [Image Provenance + Rendered Branches](.plans/iteration-5/image-provenance-rendered-branches.md) | 4 | 5 | 5 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 42.1 |
| 5 | [Thin Build Lock](.plans/iteration-5/thin-build-lock.md) | 5 | 2 | 4 | 5 | 5 | 4 | 5 | 4 | 3 | 4 | 38.6 |
| 6 | [Helm Source Snapshot](.plans/iteration-5/helm-source-snapshot.md) | 4 | 4 | 2 | 5 | 5 | 4 | 3 | 4 | 4 | 4 | 38.1 |
| 7 | [Pre-Rendered Release Bundle](.plans/iteration-5/rendered-release-bundle.md) | 3 | 5 | 4 | 4 | 5 | 3 | 2 | 5 | 5 | 3 | 36.8 |
| 8 | [Kustomize Base Snapshot](.plans/iteration-5/kustomize-base-snapshot.md) | 3 | 4 | 5 | 1 | 4 | 5 | 2 | 4 | 5 | 4 | 36.1 |
| 9 | [OCI Chart Release Pair](.plans/iteration-5/oci-chart-release-pair.md) | 3 | 4 | 2 | 5 | 5 | 4 | 2 | 4 | 5 | 4 | 35.2 |
| 10 | [Kustomize Split Overlays](.plans/iteration-5/kustomize-split-overlays.md) | 3 | 3 | 5 | 1 | 3 | 4 | 2 | 3 | 4 | 4 | 31.5 |
| 11 | [Multi-Warehouse Base + Overlay](.plans/iteration-5/multi-warehouse-base-overlay.md) | 2 | 4 | 5 | 1 | 3 | 5 | 2 | 3 | 5 | 4 | 31.4 |
| 12 | [OCI Bundle Pointer](.plans/iteration-5/oci-bundle-pointer.md) | 2 | 4 | 4 | 3 | 5 | 3 | 2 | 3 | 5 | 3 | 30.9 |
| 13 | [GitOps Truth with Generated Mirror](./gitops-truth-generated-mirror.md) | 2 | 4 | 4 | 3 | 2 | 3 | 1 | 3 | 3 | 3 | 27.1 |
```

Of course the ranking categories can change, this is just an example, this should also be in the rankings.md file you output earlier

Put final weighted values in **bold** unlike this example.


## Detailed Plan Requirements
Each plan doc in `k8s/docs/kargotecture/plans/iteration-${N}/` must be self-contained and implementable on its own.

Each plan doc must include:
- Title
- Short name
- Catchy description
- Whether it is:
  - Helm plan
  - Kustomize plan
  - packaging-agnostic plan
- Whether it uses:
  - rendered manifests pattern
  - source-driven pattern
  - hybrid pattern
- Warehouse artifact structure under `warehouses/codeai/`
- Freight definition
- Full Kargo project design
- Stage-by-stage promotion flow
- `review infra changes` stage behavior
- `test` stage automation behavior
- `Does it break/awkwardize skaffold or local-dev in any way?`
- Proposed Helm/Kustomize directory structure in both repos if the plan changes them
- Pros / cons
- Migration notes
- Any useful implementation notes that do not fit neatly elsewhere
- `# Code changes`
  - `## k8s-gitops changes`
  - `## code-dot-org changes`

## Iterative Process
Run this loop multiple times:

### `make_plans` loop
1. Before starting iteration `N`, read:
- `k8s/docs/kargotecture/research-plan.md`
- all prior `k8s/docs/kargotecture/plans/iteration-*/rankings.md`
- all prior `k8s/docs/kargotecture/plans/iteration-*/NOTES.md`
- enough of the prior iteration plan docs to avoid repeating the same ping-pong edits

2. Create or update the iteration working set directly in:
- `k8s/docs/kargotecture/plans/iteration-${N}/`

Do not use top-level `k8s/docs/kargotecture/plans/*.md` as an intermediate or mirrored output location.

3. Before each major stage within the iteration, reload:
- `k8s/docs/kargotecture/research-plan.md`

Major stages include at least:
- research sweep
- plan writing/revision
- compare/contrast
- scoring/ranking
- generate new ideas
- synthesis/new-plan generation
- finalizing the iteration snapshot
- writing the iteration report

4. Compare and contrast all current plans.

5. Score all current plans and write:
- `k8s/docs/kargotecture/plans/iteration-${N}/rankings.md`

6. After ranking, explicitly generate new ideas:
- propose at least 1-2 new candidate ideas, hybrids, or reframings if the ranking or comparison suggests a gap
- prefer doing this even after a boring iteration if there is still any plausible opening for a better framing

7. Decide whether to:
- improve existing plans
- merge overlapping plans
- split overloaded plans
- add 1–2 new plans if comparison/ranking or idea generation reveals a missing hybrid or better framing

8. Ensure the whole iteration is written directly into:
- `k8s/docs/kargotecture/plans/iteration-${N}/`

All plan docs and rankings for that iteration should already live there; do not keep a duplicated top-level copy.

9. Write:
- `k8s/docs/kargotecture/plans/iteration-${N}/NOTES.md`

10. As the final step of the iteration, write:
- `k8s/docs/kargotecture/report-iteration-${N}.md`

11. Read the latest rankings, notes, and iteration report before deciding whether another iteration is warranted.

Repeat until:
- iterations stop producing materially new ideas, or
- rankings stop improving in meaningful ways, or
- further changes are mostly ping-pong rather than new synthesis
- and even then, prefer a couple of incremental "boring" iterations if they might still unlock a new idea before stopping entirely

Important rules:
- `10` plans is not a hard limit.
- If iteration produces more strong plans, keep them.
- If ranking reveals a plan can be made significantly better, revise it and iterate again.
- Prefer improving plans over churning names or making cosmetic reshuffles.

## Rankings File Requirements
### `iteration-${N}/rankings.md`
For each iteration, include:
- the same "Best for" list used at the top of the iteration report:
  - Best for KISS
  - Best for reviewability
  - Best for future Kustomize
  - Best for Kargo Native
- linked plan list for that iteration
- per-axis score for every plan
- weighted total score
- short explanation of why the top few landed where they did
- short explanation of what changed since the prior iteration

## Ranking Axes
Use 1–5 scoring per axis.

Required axes and weights:
- KISS / operational simplicity: **3.0**
- Reviewability: **2.0**
- Future Kustomize fit: **0.7**
- Current Helm fit: **0.3**
- `Does it break/awkwardize skaffold or local-dev in any way?`: **1.0**
- Kargo-native fit: **1.0**
- Migration complexity: **0.2**
- Promotion clarity: **0.3**
- Artifact integrity / immutability: **0.3**
- Day-2 operability: **0.8**

You may add a few extra axes if they genuinely help, but:
- keep their weights low
- do not dilute the user-specified axes much
- do not let new axes materially overpower the existing priorities

Guidance:
- KISS dominates.
- Reviewability is second.
- Future Kustomize fit matters more than current Helm fit.
- KISS should primarily mean simplicity of the operating model and the on-disk structure.
- Do not treat lower KLOC or simpler implementation code as the main definition of KISS; that is nice when it happens, but it is not the primary goal.
- The Skaffold/local-dev axis should focus on user pain, awkwardness, mirroring, local drift risk, or degraded workflows.
- Migration complexity is intentionally low weight.

## Research Scope
Continue researching during execution, not just at the start.

Required research inputs:
- current `code-dot-org` GH workflows
- current `skaffold.yaml`
- current `k8s/helm`
- current `k8s-gitops` CodeAI app and Kargo config
- upstream Kargo docs
- upstream examples:
  - `kargo-simple`
  - `kargo-helm`
  - `kargo-advanced`
- local `k8s/kustomize` branch as inspiration, but not as a fixed target

Also, while writing plans, continue looking up any Kargo feature or pattern that becomes relevant:
- chart subscriptions
- OCI download patterns
- rendered branch patterns
- PR review patterns
- multiple-warehouse composition
- verification and gating patterns

## Required Constraints
- `$gitcommit` always means the `code-dot-org` `staging` commit that triggered the warehouse upload.
- That `$gitcommit` is the canonical release identity for both image and matching chart/base source.
- Default bias: keep source of truth in `code-dot-org`.
- Alternative source-of-truth models are allowed only if they preserve or credibly replace local Skaffold workflows.
- Current Kargo boilerplate in `k8s-gitops` should not anchor the design.
- Helm and Kustomize structure are both fair game for redesign.
- Any part of the system may be changed if it unlocks a materially better plan.

## Specific Kustomize/Helm Refactor Expectations
The plans should not treat current directory names as sacred. In particular:
- Kustomize plans should seriously consider renaming `targets/` to `overlays/`.
- Kustomize plans should seriously consider splitting:
  - shared base/components in `code-dot-org/k8s/...`
  - env-specific overlays in `k8s-gitops/apps/codeai/...`
- Some strong plans may keep all overlays in `code-dot-org`.
- Some strong plans may move only env-type overlays to `k8s-gitops`, for example near `apps/codeai/envTypes/`.
- Helm plans may also propose a cleaner separation between:
  - reusable chart source in `code-dot-org`
  - env values / env overlays / rendered output in `k8s-gitops`

Every plan that changes structure must show the proposed tree explicitly. If a plan requires no structure changes, it should say so explicitly.

## What Every Plan Must Decide
Every detailed plan doc must make concrete decisions for:
- what the GH action publishes under `warehouses/codeai/`
- what the Warehouse subscribes to
- what freight is
- whether freight stays the same shape across stages
- how `staging -> test -> [production, levelbuilder]` works
- what `review infra changes` means in that model
- how `test` runs automated checks
- whether artifacts are source, rendered, OCI, or hybrid
- whether the plan uses rendered manifests pattern or not
- whether the plan is Helm-specific, Kustomize-specific, or agnostic
- how ArgoCD consumes promoted output
- whether Helm/Kustomize directory structure changes are needed
- if structure changes are needed, what the proposed tree looks like in:
  - `code-dot-org/k8s/...`
  - `k8s-gitops/...`
- exact repo changes in both repos
- any plan-specific notes that would help implementation even if they do not fit a rigid template

## Acceptance Criteria
This is done when:
- the approved research plan has first been written verbatim to `k8s/docs/kargotecture/research-plan.md`
- the `make_plans` loop has been run multiple times
- each new iteration reads prior iteration rankings and notes first
- each iteration reloads `k8s/docs/kargotecture/research-plan.md` before each major stage
- after any context compaction, `k8s/docs/kargotecture/research-plan.md` is reloaded before continuing
- each iteration writes:
  - detailed plans directly in `k8s/docs/kargotecture/plans/iteration-${N}/`
  - `k8s/docs/kargotecture/plans/iteration-${N}/rankings.md`
  - `k8s/docs/kargotecture/plans/iteration-${N}/NOTES.md`
  - `k8s/docs/kargotecture/report-iteration-${N}.md`
- there are at least 6 detailed plans, with no upper cap if more strong plans appear
- there is a final iteration rankings file in the final iteration directory
- there is a latest iteration report at `k8s/docs/kargotecture/report-iteration-${N}.md`
- the iteration report clearly links directly to plan docs and `rankings.md` in the matching iteration directory
- every plan explicitly covers whether it breaks or awkwardizes Skaffold/local-dev
- every plan explicitly defines freight and promotion shape
- every plan explicitly states rendered vs non-rendered
- every plan explicitly states Helm-specific, Kustomize-specific, or agnostic
- every plan details any required Helm/Kustomize directory changes
- the latest iteration report clearly identifies the best KISS, reviewability, future-Kustomize, and Kargo Native options

## Assumptions / Defaults
- Use `k8s/docs/kargotecture/plans/iteration-${N}/` as the canonical output location for each iteration's detailed plans.
- Do not maintain a duplicated top-level `k8s/docs/kargotecture/plans/*.md` latest mirror.
- Use `k8s/docs/kargotecture/report-iteration-${N}.md` for the report written at the end of each iteration.
- Use the weights above exactly unless later user feedback changes them.
- Keep iterating until the plan set feels saturated rather than arbitrarily stopping after one pass.
- If changes are still being made, prefer continuing for a couple more iterations even if the last step was only incrementally better.
- Prefer decision-complete detailed plans over uniform formatting when the two are in tension.
