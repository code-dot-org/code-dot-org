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
3. **Say which findings are latent.** Whether a change fixes a real
   problem today or forecloses one later is the first question you will be
   asked; the probability field (Phase 3) answers it up front.
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

## Phase 3 — triage, verify, classify

`/code-review` does not rate severity; it ranks findings most-severe first.
Triage first: from each finding's summary and failure scenario alone,
without investigating, estimate its severity on the Tunables scale. Send
the clearly-LOW ones straight to LOW as one-liners marked "not
investigated" and skip the rest of this phase for them. When in doubt,
keep the finding.

Verify yourself, in this context, every finding whose severity could be
CRITICAL or HIGH: read the code, run the query, check the CI log, check the
branch actually under review. Findings sourced from an agent's summary get
downgraded or dropped when the mechanism doesn't hold up, and stating a
blocker that dissolves under one question costs more than omitting it.

Then classify each finding that survives, whether or not the PR is part of
a stack. The triage estimate is provisional; this is where severity and
probability are set, and later sections use these values, not fresh
judgment. `/code-review`'s ranking
does not carry over.

- **scenario** — what has to be true for it to fire.
- **impact** — what goes wrong in that scenario.
- **severity** of that impact, if it occurs — CRITICAL, HIGH, MEDIUM, or
  LOW, on the scale under Tunables.
- **current or latent** — CURRENT if it can happen now through the actions
  of attackers, end users, curriculum authors, translators, engineering
  workflows such as the daily deploy, or other internal workflows. LATENT
  if only a future code or config change by engineering can trigger it.
- **origin** — NEW if this PR introduces it. WORSENED if it predates this
  PR but the PR makes it more likely, more severe, or newly reachable.
  EXISTING otherwise, including an issue introduced by another pending PR.
- **age** — for EXISTING issues, roughly how long it has been in the repo
  (days, weeks, months, years), or PENDING if it lives in another pending
  PR and has not landed yet. Age is evidence for
  probability: an issue that has sat in production for years without
  firing is unlikely to fire this week.
- **probability** — for CURRENT issues, HIGH, MEDIUM, or LOW chance it
  fires under today's code and config. LATENT for latent issues.
- **recommendation** — one of:
  1. fix before merge.
  2. document before merge — for a severe latent issue that cannot easily
     be guarded against or eliminated. Put the note where the engineer who
     would trigger it will read it: a comment at the call site, or the
     subsystem's README.
  3. track for follow-up, with a deadline: "before the new path becomes
     the default", "before launch". Where to track it — a code TODO, a
     Jira ticket, the author's own list — is the team's call; say which
     fits. No deadline, no follow-up: pick 1, 2, or 4.
  4. fine to leave.

## Phase 4 — the report

### Buckets

Bucket each finding from its Phase 3 values. Severity sets the starting
bucket: CRITICAL and HIGH start in HIGH, MEDIUM in MEDIUM, LOW in LOW. Move
it down one bucket for each of these that holds, stopping at LOW:

- probability is LOW or LATENT;
- origin is EXISTING.

CRITICAL findings stay in HIGH regardless.

### Shape

```
## PR description

Claims that don't match the code, and omissions that would mislead the next
reviewer. One line if it's accurate.

## Previously raised feedback

One line per earlier comment: addressed / partly / not, with the evidence.
Omit the section if there was no prior review.

## HIGH

**1. <the claim, one line>**

*Scenario:* what has to happen.
*Probability:* HIGH | MEDIUM | LOW | LATENT
*Impact:* what goes wrong when it does.
*Severity:* CRITICAL | HIGH | MEDIUM | LOW
*Recommendation:* fix | document | follow up by <deadline> | leave

## MEDIUM
## LOW

## Questions
```

Every classified finding carries the same five fields; in LOW, put them
on one line. Triaged-out findings follow at the bottom of LOW, one line
each, no fields. Don't pad LOW and don't argue for its items.

Description findings are classified like any other. A body that tells the
next reviewer not to look at a file the PR changes on the default path is
severity HIGH: the scenario is this review, the impact is an unreviewed
change shipping.

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

- **Severity scale.**
  - CRITICAL — data loss, security breach, privacy breach, or harm on that
    scale.
  - HIGH — significant functional impact on end users; anything that blocks
    this PR from shipping, such as a deploy pipeline failure; or a break in
    a core non-production workflow: curriculum authoring (levelbuilder),
    the daily deploy, feature development and developer experience, adhoc
    starts, test environments.
  - MEDIUM — any other material impact on end users or core workflows, such
    as substantial inconvenience or performance degradation; also code
    quality, readability, maintainability, and technical debt.
  - LOW — anything else.
- **Default effort.** `high`.
- **Finding cap.** `/code-review` at `high` caps at 15.
