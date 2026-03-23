# Iteration 6 Seed Ideas

This is the deduped iteration 6 seed set.

The original OG / Prof / Jesse idea pools had several same-family ideas under
different names. This rewrite merges those duplicates into a smaller set of
actual architecture families and keeps distinct variants inside each family
instead of pretending they are separate ideas.

These are still deliberate "new weird but coherent" prompts, not defaults.

## 1. OCI Release Capsule
Publish one immutable OCI-native release object keyed to `$gitcommit` or the
image digest. The capsule contains:
- `release.yaml`
- frozen deploy package snapshot
- app image digest
- source SHA / tree hash
- optional SBOM / provenance / preview metadata

Merged from:
- OCI Referrers Universe
- OCI Release Index
- OCI Deploy Capsule + Rendered Branches

Why this is interesting:
- collapses release truth into one immutable registry-native object
- avoids giant-monorepo reads during promotion
- avoids Git snapshot churn in `k8s-gitops`
- keeps "package + image + metadata" together instead of pairing them later

Why it feels more real after research:
- Kargo already has `oci-download` for promotion-time pulls
- Kargo already supports image, chart, and Git composition elsewhere in the flow

Main downside:
- generic OCI artifacts are easier to consume in promotion than to model as a
  totally first-class Warehouse source, so this still needs glue and policy

## 2. Deploy Package Stream Repo
CI exports only the deploy-relevant package into a small dedicated Git repo
keyed to `$gitcommit`. Kargo then promotes:
- image digest/tag
- package repo commit

The repo can be framed as:
- a mirror repo
- a package snapshot repo
- a release-stream repo

Merged from:
- Mini-Monorepo Mirror
- Package Snapshot Repo
- Package Mirror Repo + Common-Case Render
- Dedicated Release Stream Repo + Rendered Branches

Why this is interesting:
- keeps the model Git-native and reviewable
- avoids promotion-time reads from the giant monorepo
- avoids storing immutable package history inside `k8s-gitops`
- fits Kargo's existing image + Git subscription model cleanly

Why it feels more real after research:
- Kargo already handles mixed image+Git Freight cleanly
- Kargo can write promotion output to a separate repo, not just the source repo

Main downside:
- this only earns its keep if the monorepo cost is still meaningfully worse
  than Kargo's existing path filters and sparse checkout support

## 3. Attested Freight Graph
Treat promotion state as signed attestations over the release graph, not as
primarily Git commits. A release records:
- image digest
- package hash
- source commit
- optional test/result evidence

Each stage adds attestations such as:
- passed-staging
- passed-test
- approved-production

Merged from:
- Promotion as Attestation, Not Artifact
- Stage Attestation Ladder
- Attested Freight Graph

Why this is interesting:
- strongest provenance and auditability story in the set
- makes trusted release identity explicit instead of implicit
- can layer on top of snapshot-oriented plans instead of replacing them

Why it feels more real after research:
- Kargo already has verification hooks and external evidence-oriented steps

Main downside:
- it risks becoming ceremonially secure but operationally miserable unless
  policy, debugging, and human review stay very legible

## 4. Shadow Promotion Bridge
During the coexistence period, treat legacy deployment state as part of the
promotion contract. Promotion means one of:
- Kargo follows legacy branch progression as the promotion signal
- Kargo records the same release against both the k8s and legacy fleets
- a stage is not truly "passed" until both sides agree

Merged from:
- Shadow-Fleet Promotion
- Shadow Gitflow

Why this is interesting:
- directly matches the real migration phase instead of pretending it is over
- reduces drift between legacy and k8s rollout narratives
- may give reviewers one place to reason about "what release is where"

Main downside:
- strongly transitional, and therefore dangerous if it hardens into the
  long-term operating model

## 5. App Capsule + Env Policy Compiler
Split app/package truth from env-policy truth much more sharply.

Publish:
- one immutable app package artifact
- one env-policy source or env capsule

Kargo composes them to produce the stage output.

The env side may be:
- a dedicated compiler repo
- a versioned env-policy artifact
- a small Git repo that exists only to define environment policy

Merged from:
- Environment Compiler Repo
- App Capsule + Env Capsule Composition

Why this is interesting:
- sharpest separation of release payload vs environment policy
- probably the cleanest path if future Kustomize overlays become first-class
- maps well onto Kargo's multi-source and multi-Warehouse composition model

Why it feels more real after research:
- Kargo already documents multi-source composition and multiple Warehouses as
  normal patterns, not hacks

Main downside:
- very easy to drift into second-system architecture and too many moving parts

## 6. Content-Addressed Package Store
Store deploy packages by content hash, not by release name or branch alias.

Example:

```text
packages/
  sha256-.../
releases/
  git-<full-commit-sha>.yaml
```

The thin release record maps:
- `$gitcommit -> package hash + image digest`

Merged from:
- Content-Addressed Package Store

Why this is interesting:
- de-duplicates identical deploy packages across many commits
- separates release identity from package identity cleanly
- pairs well with either Git-backed or OCI-backed package storage

Main downside:
- more indirection for humans, especially during incident response

## 7. Rendered Stage Artifact Pipeline
Treat rendered output as a first-class artifact, not just a side effect.

Possible forms:
- cache rendered output between stages
- publish rendered stage output as OCI artifacts
- keep Git only as the review surface, not the canonical rendered storage

Merged from:
- Render Cache as First-Class Artifact
- Rendered OCI Stage Artifacts

Why this is interesting:
- makes the actual deployable thing immutable and inspectable
- could reduce repeated render work
- creates a cleaner story for "what exactly reached this stage"

Why it feels less default after research:
- Kargo's own guidance still strongly prefers rendered Git output for review and
  operational clarity

Main downside:
- once Git stops being the obvious rendered review surface, Argo integration and
  day-2 debugging get much harder

## 8. Hermetic Render Formula
The release is not just a package snapshot. It also freezes the render recipe
or renderer itself.

The formula includes some combination of:
- source commit
- package path or package hash
- image digest
- env inputs
- renderer version or packaged renderer artifact

Merged from:
- Nix-ish Release Formula
- WASM Renderer Artifact

Why this is interesting:
- maximal reproducibility
- treats rendering as part of the release, not incidental tooling
- could make "same input, same render" much more defensible

Main downside:
- this is classic second-system territory and likely too abstract for the
  current operator maturity level

## Most Worth Revisiting
On the current repo and upstream Kargo evidence, the strongest iteration 6
seeds look like:
- OCI Release Capsule
- Deploy Package Stream Repo
- App Capsule + Env Policy Compiler
- Shadow Promotion Bridge
