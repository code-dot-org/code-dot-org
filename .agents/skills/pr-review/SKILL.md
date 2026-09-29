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

- **effort** — `low`, `medium`, `high`, `xhigh`, `max`. Defaults to `high`
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

- the **scenario** — what has to be true for it to fire
- the **impact** in that scenario
- the **severity** of that impact, if it occurs.
  - CRITICAL for data loss, security breach, privacy breach, or harm on that scale.
  - HIGH for significant functional impact to end users; anything that will
    block this PR from shipping (such as a deploy pipeline failure); or any
    breaks to core workflows in non-production environments such as curriculum
    authoring, daily deploy, feature development, or adhoc starts.
  - MEDIUM for any other issues that materially impact end users or core
    workflows, such as substantial inconvenience or performance degradation.
    Also any issues related to code quality, readability, maintainability,
    or technical debt.
  - LOW for any other issues.
- **current or latent** -- CURRENT if the issue can happen now based on actions
  taken by attackers, end users, curriculum authors, translators,
  engineering workflows (such as the daily deploy), or other internal workflow.
  LATENT if the issue can only be triggered by a future code or config change
  made by engineering.
- **new or existing** — NEW if introduced in this PR, EXISTING if it was already
  present (including in another pending PR).
- **age** - For existing issues, approximately how long the issue has existed
 in the repo (e.g. years, months, weeks, days). Or, PENDING if another pending
 branch owns the fix.
- **probability** assign current issues LOW, MEDIUM, or HIGH probability of
  failure given current code and config. Assign LATENT if the issue is latent.
- **priority** — LOW, MEDIUM, or HIGH — the overall priority of addressing this
  issue, considering severity, probability and impact. Old, existing issues can
  be assumed to have lower priority. Latent issues have lower priority unless
  their potential impact is extremely high.


## Phase 4 — the report

### Buckets

- **HIGH** — a current problem in a real usage scenario. The scenarios that
  count are listed under Tunables. A latent issue reaches HIGH if this PR
  makes it more likely, or if its consequence outweighs a low probability,
  such as data loss, a security breach, or a privacy breach.
- **MEDIUM** — verified and real, but bounded: a narrow scenario, a
  recoverable failure, or a latent issue with a reasonable probability of
  being triggered.
- **LOW** — nitpicks, cleanups, and long-standing latent issues that pass
  none of the tests below. One line each, grouped. Don't pad the bucket
  and don't argue for them.

Long-standing latent issues are the ones most often mis-ranked. Three
tests separate them:

- Does this PR make the issue more likely to fire, harder to fix, or newly
  reachable? Then rank it on that, not on its age.
- Is the consequence severe — data loss, a security or privacy breach, or
  harm on that scale? Then it is eligible for HIGH however unlikely it is.
- Is there a reasonable probability it gets triggered? Then it is fair game
  for MEDIUM.

Everything else long-standing goes LOW.

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
2. track for follow-up, with a deadline: "before the new path becomes the
   default", "before launch". Where to track it — a code TODO, a Jira
   ticket, the author's own list — is the team's call; say which fits. No
   deadline, no follow-up: the item goes to 1 or 3.
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

These are the parts that drift.

- **Usage scenarios that make a finding HIGH.** Any regression reaching
  end users in production. Also, any breaks in non-production environments
  or workflows, including curriculum authoring (levelbuilder), developer
  experience, adhoc start, or any test environment failures.
- **Default effort.** `high`.
- **Finding cap.** `/code-review` at `high` caps at 15.
