---
name: pr-review
description: Review a pull request for a merge decision. Wraps /code-review and takes the same arguments, adding an audit of the PR description, a check of whether previously raised feedback was addressed, and findings sorted into high/medium/low by whether they bite today. Use for "review PR N", "/pr-review", or any review whose output feeds a merge or push decision.
---

# Review a PR for a merge decision

`/code-review` finds defects and ranks them by severity. That is the wrong
ranking for deciding whether to merge: a severe bug that no real scenario
reaches costs less than a mild one on the default path. This skill runs that
review, then re-ranks its output by whether the finding bites today, and
audits the PR description alongside the diff.

## Arguments

`/pr-review [effort] [target] [--comment] [--fix] [questions and context...]`

Identical to `/code-review`:

- **effort** — `low`, `medium`, `high`, `xhigh`, `max`. Defaults to `xhigh`
  (see Tunables).
- **target** — PR number or URL, branch name, or path. Defaults to the
  current diff.
- **`--comment`** — post the findings to the PR. Held back from
  `/code-review`; see Phase 4.
- **`--fix`** — apply findings to the working tree. Also held back; see
  Phase 4.
- Everything else on the line is a question or extra context. Forward it to
  `/code-review` verbatim *and* answer it in the report — these are usually
  the most valuable part of the run.

## Rules for every run

1. **Never push, commit, or amend on the branch under review.** A PR that is
   open or marked ready for review belongs to its author until they say
   otherwise. If you need the code locally, check the head SHA out detached
   in a scratch worktree and say so in the report.
2. **Don't gate on CI.** Lint, typecheck, and test failures are drone's job,
   not a review finding.
3. **Label every finding `current` or `latent`.** Whether a change fixes a
   real problem today or forecloses one later is the first question you will
   be asked; answer it up front.
4. **Ask.** If the system's intent isn't recoverable from the diff, the
   description, or the linked docs, ask rather than guess. Questions about how
   the system works are welcome and belong in the report.

## Phase 1 — context, before findings

Read, in this order:

- the PR body,
- the comments and inline review comments already on it
  (`gh pr view N --comments`); list which of them the PR claims to have
  addressed,
- any proposal or design doc the PR or the caller links,
- `git log` for the branch — commit messages in this repo tend to document
  the special cases the diff hit,
- the PR's position in a stack, if any: its base branch, and which sibling
  branches carry work that a finding might belong to instead.

## Phase 2 — run the code review

Invoke the `code-review` skill, forwarding the effort level, the target, and
the caller's questions. Do not re-run its finder angles yourself; it is
thorough and running it twice wastes the budget you need for Phase 3.

Hold back `--comment` and `--fix` — both act on the raw, unranked list, which
is the list you are about to re-rank.

## Phase 3 — verify before you rank

Verify every candidate HIGH finding yourself, in this context, before it
reaches the report: read the code, run the query, check the CI log, check the
branch actually under review. Findings sourced from an agent's summary get
downgraded or dropped when the mechanism doesn't hold up, and stating a
blocker that dissolves under one question costs more than omitting it.

For each surviving finding, establish:

- the **scenario** — what has to be true for it to fire,
- the **impact** in that scenario,
- **current or latent**,
- **whether this PR makes it more likely**, and
- **which branch owns the fix**, when the PR is one of a stack.

## Phase 4 — the report

### Buckets

- **HIGH** — a current problem in a real usage scenario. The scenarios that
  count are listed under Tunables. A latent issue reaches HIGH only if it is
  severe *and* likely to surface, or if this PR makes it more likely.
- **MEDIUM** — verified and real, but bounded: a narrow scenario, a
  recoverable failure, or a latent issue that active work will walk into
  soon.
- **LOW** — nitpicks, cleanups, and long-standing latent issues this PR
  neither worsens nor exposes. One line each, grouped. Don't pad the bucket
  and don't argue for them.

Long-standing latent issues are the ones most often mis-ranked. Two tests
separate them:

- Does this PR make the issue more likely to fire, harder to fix, or newly
  reachable? Then rank it on that, not on its age.
- Is it in ground an active workstream is already moving? Then it is fair
  game at MEDIUM or above, because someone is about to stand on it.

Everything else long-standing goes LOW, however alarming it reads.

### Shape

```
## PR description

Claims that don't match the code, and omissions that would mislead the next
reviewer. One line if it's accurate.

## Previously raised feedback

One line per earlier comment: addressed / partly / not, with the evidence.
Omit the section if there was no prior review.

## HIGH

**1. <the claim, one line>** — current

*Scenario:* what has to happen.
*Impact:* what goes wrong when it does.
*Before merge:* the action, or "none — informational".

## MEDIUM
## LOW

## Questions
```

Description findings are ranked in the buckets like any other. A body that
tells the next reviewer not to look at a file the PR changes on the default
path is a HIGH finding, not a copy edit.

When the PR is one step in a stack, or when the caller asks for it, add the
merge-gating axis alongside the buckets:

1. must fix before merge,
2. mark in code with a TODO, to fix before the new path becomes the default,
3. fine to leave.

### `--comment` and `--fix`

With `--comment`: render the report as paste-ready markdown with permalinks
(full SHA, `#L[start]-L[end]`, one line of context either side), show it, and
post after the caller confirms. They preview review comments on GitHub before
posting; skipping that step is not a time saving.

With `--fix`: apply HIGH and MEDIUM fixes to the working tree, list what you
changed, and leave LOW alone unless asked. Working tree only — Rule 1 still
holds.

## Tunables

Fill these in; they are the parts that drift.

- **Usage scenarios that make a finding HIGH.** Observed so far: developer
  experience, and regressions reaching production. <!-- TODO: confirm the
  full list — is a broken adhoc, a levelbuilder-only break, or a curriculum
  authoring break its own scenario? -->
- **Active workstreams whose latent issues are fair game** (Phase 4, second
  test). As of 2026-09-08: drone secrets removal, curriculum data
  partitioning. <!-- TODO: keep dated; drop entries as they land. -->
- **Default effort.** `xhigh`. <!-- TODO: confirm; `high` may be the better
  default for a small PR. -->
- **Finding cap.** `/code-review` at `xhigh` caps at 15. <!-- TODO: state
  whether the report should carry all of them or cut the LOW tail. -->
