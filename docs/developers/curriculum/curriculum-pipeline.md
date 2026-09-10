---
title: Curriculum pipeline
description: How curriculum content authored in Levelbuilder is serialized, committed, merged into staging, and seeded into production.
type: concept
---

**Applies to:** curriculum authors, engineers.

Curriculum flows in one direction: Levelbuilder writes files, and every other
environment (staging, test, production) reads them back through seeding. No
environment other than Levelbuilder modifies curriculum files, and production
never runs in Levelbuilder mode.

## Serialize to files

When an author saves in any Levelbuilder editor, the Rails app writes flat
files under `dashboard/config/`. The file format depends on the object type:

- **Units** produce `.script_json` files in `dashboard/config/scripts_json/`
  via `Services::ScriptSeed.serialize_seeding_json`. Each file contains the
  full serialized tree from the unit down (lesson groups, lessons, activities,
  sections, script-level references) in a flat JSON structure designed for
  bulk import.
- **DSL-defined levels** (Multi, External, Match, and others) produce `.multi`,
  `.external`, `.match` files in `dashboard/config/scripts/` alongside their
  unit.
- **Custom levels** (Applab, Javalab, Gamelab, FreeResponse, and others)
  produce `.level` files in `dashboard/config/levels/custom/<type>/`.
- **Course definitions** produce files in `dashboard/config/courses/`.
- **Course offerings** produce JSON files in `dashboard/config/course_offerings/`.
- Other objects (blocks, programming environments, reference guides, data docs,
  practice problems, callouts, slides, Foorm forms, standards) each have their
  own subdirectory under `dashboard/config/`.

These files are the source of truth for curriculum content. The database on
each non-Levelbuilder environment is populated by reading them.

## Commit and push (robo-commit)

Saving an editor writes files to disk but does not commit them to git. A
separate process handles that.

On the Levelbuilder server, `bin/cron/commit_content` runs on a schedule. It:

1. Checks Slack permission by reading the `DTL` status from the
   `#deploy-status` channel topic (via `DevelopersTopic`).
2. Runs `bin/content-push --force --name robo-commit`, which:
   - Stages all changes under `dashboard/`, `pegasus/`, and `aws/dms/`.
   - Excludes `dashboard/db/schema_cache.yml` and `dashboard/db/schema.rb`
     (these are reverted to HEAD on the `levelbuilder` branch).
   - Rejects case-only file renames (a git portability hazard).
   - Creates a commit attributed to "robo-commit" on the `levelbuilder`
     branch.
3. Posts the result to `#levelbuilder` in Slack.

The commit message reads `levelbuilder content changes (-robo-commit)`.

## Merge to staging

`bin/cron/merge_lb_to_staging` runs on a schedule and merges the
`levelbuilder` branch into `staging`:

1. Checks whether the Slack `#deploy-status` topic has `DTS: yes`
   (the "deploy to staging" flag, set by the DOTD).
2. Checks whether `levelbuilder` is ahead of `staging`.
3. Creates a temporary `dts_candidate_<date>` branch from the `levelbuilder`
   HEAD, rebased onto `staging`.
4. Opens a pull request from that branch into `staging`, merges it, and
   deletes the branch.
5. Posts the PR link to `#staging` in Slack.

If either check fails, the script posts a skip message and exits. If the merge
or PR creation fails, it sets `DTS: no` and alerts `#staging`.

## Deploy to Levelbuilder

The reverse direction -- getting code changes (not curriculum) onto the
Levelbuilder server -- is handled by `bin/cron/deploy_to_levelbuilder`:

1. Checks `DTL: yes` in the Slack topic.
2. Finds the latest green commit on the `test` branch.
3. Creates a `dtl_candidate_<sha>` branch from that commit, opens a PR into
   `levelbuilder`.
4. Posts a warning to `#levelbuilder` and waits five minutes for objections.
5. If `DTL` is still `yes`, merges the PR.

This ensures the Levelbuilder server receives code updates without
overwriting uncommitted curriculum content (which was already committed by
the robo-commit step).

## Seeding on downstream environments

When staging, test, or production deploys, `rake seed:default` runs. The seed
task list varies by environment:

| Environment | Task list | Notable difference |
|---|---|---|
| Production, staging | `FULL_SEED_TASKS` | Full curriculum: videos, concepts, scripts, courses, reference guides, data docs, callouts, schools, standards, and more. |
| Test | `UI_TEST_SEED_TASKS` | Curriculum prefixed `ui-test-` only (from `dashboard/test/ui/config/`). No production content. |
| Development | `FULL_SEED_TASKS` + `UI_TEST_SEED_TASKS` | Both production and test content, so developers can run UI tests locally. |
| Adhoc | `ADHOC_SEED_TASKS` | A subset of production content. |

Seeding reads the committed JSON and DSL files, finds or creates the
corresponding database rows (matched by `seeding_key`, not by primary key ID),
and bulk-imports them. Primary key IDs are preserved across environments
because other tables (such as `user_levels` for student progress) reference
them.

## How to see your change on test and production

1. **Save** in the Levelbuilder editor. Files are written immediately.
2. **Wait for robo-commit.** The cron job commits your files to the
   `levelbuilder` branch. Check `#levelbuilder` in Slack for confirmation.
3. **Wait for merge to staging.** `merge_lb_to_staging` creates and merges a
   PR into `staging` when the DOTD has set `DTS: yes`. Check `#staging`.
4. **Staging deploys.** After the staging build succeeds (~30--60 minutes),
   your change is live on staging. Seeding happens as part of the deploy.
5. **Test and production** receive the change through their own deploy cycles,
   which include seeding.

If your change is urgent, ask the DOTD to confirm the Slack flags are set and
the merge cron is running.

## Related

- [Levelbuilder environment](/developers/curriculum/levelbuilder-environment/) --
  where editing happens.
- [Curriculum authoring](/developers/curriculum/curriculum-authoring/) --
  what can be edited.
- [Data model and seeding](/developers/curriculum/data-model-and-seeding/) --
  the models and seed mechanics in detail.
