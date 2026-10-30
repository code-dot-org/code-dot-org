---
name: dsco-mui-migration-status
description: Report where the DSCO-to-MUI migration stands - which PRs need review and who they wait on, what blocks what, each component's lifecycle step, and the Not Started queue - as a Slack message, a markdown table or JSON. Use when asked for a migration status, a review nudge, what to run next, or a weekly DSCO/MUI update.
---

# DSCO-to-MUI migration status

Nothing is stored between runs. `status.mjs` derives the whole picture from
what the migration workflows already keep current: `MIGRATION_STATUS.md` on
`origin/staging`, the open PRs whose titles those workflows emit
(`[Design System] Add MUI <X>`, `[MUI Migration] <X> consumers (k/n)`,
`[MUI Migration] <X>: delete the legacy DSCO source`,
`[MUI Migration] <X>: hand <behavior> to MUI`), and each migrated
component's `<COMPONENT>_MIGRATION_TO_MUI.md` "Deferred changes" table. A PR
whose base is another open PR is reported as blocked by it, and the base PR
is pulled in even when its title does not match. A hand-retitled PR drops
out of tracking.

## Run

From any checkout of the repo (the current branch does not matter):

```
node .agents/skills/dsco-mui-migration-status/status.mjs                   # Slack mrkdwn, for pasting
node .agents/skills/dsco-mui-migration-status/status.mjs --format slack-md # for the Slack tool
node .agents/skills/dsco-mui-migration-status/status.mjs --format markdown
node .agents/skills/dsco-mui-migration-status/status.mjs --format json
```

Needs `gh` signed in and network access. `--no-fetch` skips the fetch of
`origin/staging`; `--no-counts` skips the importer count per Not Started
component, which is the slow part (about ten seconds). `--ref` points the
status doc and the counts at another ref.

## Deliver

1. Run the script. Do not retype or adjust its numbers; if something looks
   wrong, fix the script or the source docs and run it again. A line
   starting with `warning:` is the script saying its sources disagree;
   pass it on, do not drop it.
2. Slack: when a Slack tool is connected and the operator named a channel or
   person, post the `slack-md` output as one message, with app link unfurls
   off if the tool offers the option (a dozen GitHub previews bury the
   text). Otherwise hand the `slack` output over verbatim in a fenced block
   for the operator to paste into the Slack app, which takes mrkdwn. Do not
   convert one into the other by hand.
3. Add at most one sentence of your own on top, and only when the operator
   asked for a nudge: name the PR with the longest `blocks` list and the
   reviewers it waits on.

## What to run next

Only entries marked `runnable:` are actions. Everything else is waiting on a
review or a merge.

- `runnable: migrate run` on a Not Started component means
  `dsco-mui-design-system-migration` for that component. A component marked
  `part of the <X> run` is migrated with `<X>`; do not run it alone.
- `runnable: step 4 delete legacy` or `runnable: step 5` on a migrated
  component means `dsco-mui-finish-migration` for that component. Step 5
  rows listed under `after step 4` are not runnable until the step 4 PR
  merges, and a row marked `optional` is the operator's call.
- `in review` and `in flight` entries, and anything under Needs review or
  Approved, waiting to merge, are not runnable: the next move is a review or
  a merge, and `blocks #N` tells you which one matters most.
- When several migrate runs are runnable, prefer the smallest importer count
  unless the operator orders the queue.
