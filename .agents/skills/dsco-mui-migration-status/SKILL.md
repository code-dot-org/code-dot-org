---
name: dsco-mui-migration-status
description: Report where the DSCO-to-MUI migration stands - which PRs need review and who they wait on, what blocks what, each component's lifecycle step, and the Not Started queue - as a Slack message, a markdown table or JSON. Use when asked for a migration status, a review nudge, what to run next, or a weekly DSCO/MUI update.
---

# DSCO-to-MUI migration status

Nothing is stored between runs. `status.mjs` derives the whole picture from two
things the migration workflows already keep current: `MIGRATION_STATUS.md` on
`origin/staging`, and the open PRs whose titles those workflows emit
(`[Design System] Add MUI <X>`, `[MUI Migration] <X> consumers (k/n)`,
`[MUI Migration] <X>: delete the legacy DSCO source`,
`[MUI Migration] <X>: hand <behavior> to MUI`). A PR whose base is another
open PR is reported as blocked by it, and the base PR is pulled in even when
its title does not match. Deferred behaviors come from each migrated
component's `<COMPONENT>_MIGRATION_TO_MUI.md` "Deferred changes" table.

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
   wrong, fix the script or the source docs and run it again.
2. Slack: when a Slack tool is connected and the operator named a channel or
   person, post the `slack-md` output as one message, with app link unfurls
   off (a dozen GitHub previews bury the text). Otherwise hand the `slack`
   output over verbatim in a fenced block for the operator to paste into the
   Slack app, which takes mrkdwn. Do not convert one into the other by hand.
3. Add at most one sentence of your own on top, and only when the operator
   asked for a nudge: name the PR and the reviewer it waits on.
4. When asked "what to run next", answer from the By component and Not
   started sections: a `migrate run` row means
   `dsco-mui-design-system-migration` for that component; a `step 4` or
   `step 5 not started` entry means `dsco-mui-finish-migration` for that
   component. Prefer the smallest Not Started component by importer count
   unless the operator orders the queue.

## Reading the output

- Needs review lists open, non-draft PRs without an approval, oldest first;
  `quiet Nd` means no activity for N days; `nobody requested` means no
  reviewer is assigned at all.
- Approved, waiting to merge: approved PRs, usually blocked by a base PR.
- `blocks #N` on a PR is the reason that PR deserves the nudge.
- By component shows each in-flight component's lifecycle step: step 4 is
  deleting the legacy source, step 5 is one PR per deferred behavior.
- Other open PRs mentioning MUI or DSCO are not produced by the workflows;
  they can mean someone else is working on a component in the queue.
