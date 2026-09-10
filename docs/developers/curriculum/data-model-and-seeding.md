---
title: Data model and seeding
description: The ActiveRecord models behind curriculum, their table-name surprises, seed task mechanics, deprecated levels, the test-only config tree, and legacy surfaces.
type: reference
---

**Applies to:** engineers.

## Curriculum models

The curriculum tree is a set of ActiveRecord models whose database table names
do not always match their class names. The table below lists the models from
the top of the tree down.

| Model | Table | Key columns | Notes |
|---|---|---|---|
| `CourseOffering` | `course_offerings` | `key` (unique) | Top-level catalog entry. |
| `CourseVersion` | `course_versions` | `course_offering_id`, `key` (unique together) | Links an offering to a `content_root` (a `UnitGroup`). Carries `published_state`. |
| `UnitGroup` | `unit_groups` | `name` | Groups units into a course. A standalone unit still has a `UnitGroup` wrapper. Carries `published_state`, `instructor_audience`, `participant_audience`. |
| `Unit` | **`scripts`** | `name` (unique) | A sequence of lessons. The class was renamed from `Script`; the table was not. `self.table_name = 'scripts'` is set explicitly. Also carries `published_state`. |
| `LessonGroup` | `lesson_groups` | `script_id`, `position` | A named group of lessons within a unit. |
| `Lesson` | **`stages`** | `script_id`, `key` (unique together) | An ordered partition of levels within a unit. The class was renamed from `Stage`; the table was not. Foreign keys in other tables still use `stage_id`. |
| `LessonActivity` | `lesson_activities` | `lesson_id`, `position` | A section of the lesson plan. |
| `ActivitySection` | `activity_sections` | `lesson_activity_id`, `position` | A subsection. |
| `ScriptLevel` | `script_levels` | `stage_id`, `chapter` | Joins a lesson position to a level. The foreign key column is `stage_id`, not `lesson_id`. |
| `Level` | `levels` | `name`, `type` (STI) | The puzzle or content page. Properties stored as JSON in `properties` column. ~60 subclasses in `dashboard/app/models/levels/`. |
| `LevelGroup` | (subclass of `Level`) | | A level that contains other levels (for multi-part assessments). |

### Join models

Resources, vocabularies, standards, and programming expressions attach to
lessons and units through explicit join models (`LessonsResource`,
`LessonsVocabulary`, `LessonsStandard`, `ScriptsResource`, and others). The
join models carry their own `seeding_key` methods used during seeding.

## Services::ScriptSeed

The `Services::ScriptSeed` module in `dashboard/lib/services/script_seed.rb`
handles both directions of the round trip:

- **`serialize_seeding_json(script)`** loads a `Unit` with all its associated
  models, sorts every collection by its `seeding_key`, and writes a flat JSON
  representation. The output is a `.script_json` file.
- **`seed_from_json_file`** (the inverse) reads a `.script_json` file,
  resolves each object by its `seeding_key` to find or create the matching
  database row, and bulk-imports using `activerecord-import`.

The `seeding_key` is the stable, human-readable identifier for each object
(typically a combination of names and positions). It must resolve to the same
database row across environments so that primary key IDs are preserved. This
matters because `user_levels` and other progress tables reference those IDs.

The `SeedContext` struct holds pre-fetched data so that `seeding_key` lookups
avoid N+1 queries.

## Seed tasks

Seed tasks are defined in `dashboard/lib/tasks/seed.rake` using a custom
`timed_task_with_logging` wrapper (not the standard `task`). The wrapper prints
timing and logs to Slack.

Key task lists:

```ruby
FULL_SEED_TASKS = [
  :check_migrations, :videos, :concepts, :scripts, :json_videos,
  :practice_problems, :courses, :reference_guides, :data_docs,
  :jit_pl_concepts, :callouts, :school_districts, :schools,
  :census_summaries, :secret_words, :secret_pictures, :foorms,
  :datablock_storage, :validate_ai_rubrics
]

UI_TEST_SEED_TASKS = [
  :check_migrations, :videos, :concepts, :scripts_ui_tests,
  :courses_ui_tests, :jit_pl_concepts, :reseed_scripts_ui_tests,
  :callouts_ui_tests, :school_districts, :schools, :secret_words,
  :secret_pictures, :datablock_storage
]
```

In development, both lists run. Rake deduplicates shared tasks automatically
(each task runs once per process).

Individual seed commands useful during development:

- `rake seed:single_script SCRIPT_NAME=<name>` -- seed one unit.
- `rake seed:single_dsl DSL_FILE=<path>` -- seed one DSL-defined level.
- `rake seed:all` -- full seed (equivalent to `FULL_SEED_TASKS`).
- `FORCE_CUSTOM_LEVELS=1 rake seed:all` -- force re-import of custom `.level`
  files even if the `.seeded` timestamp says they are current.

## Deprecated levels

`dashboard/config/deprecated_levels/blockly_levels.json` contains legacy
Blockly levels that are no longer defined by DSL files.
`Services::DeprecatedLevelLoader.load_blockly_levels` reads this file and
creates or updates the corresponding `Level` rows. Each key must start with
`blockly`.

## Test-only config tree

`dashboard/test/ui/config/` mirrors the layout of `dashboard/config/` but
contains curriculum that exists only for UI tests. The partition is decided by
naming convention:

- Course offerings, courses, and units: names beginning with `ui-test-`.
- Levels: names beginning with `UI Test ` (case-insensitive).

The naming prefix must be decidable from a bare string because the seed checks
level references as serialized keys before the join rows exist. CI and
short-lived containers seed only this tree (`UI_TEST_SEED_TASKS`), avoiding
the ~100,000 production curriculum files.

## Legacy surfaces

### Curriculum proxy

`CurriculumProxyController` proxies requests from `studio.code.org/docs/*` and
`studio.code.org/curriculum/*` to `curriculum.code.org`. This avoids
cross-origin restrictions when rendering external curriculum docs in an iframe.
The proxy caches responses for 30 minutes. No deprecation plan was found in
code.

### hoc_legacy engine

`dashboard/engines/hoc_legacy/` is a Rails engine that serves the Hour of Code
tutorial flow: session management (the `hoc_` cookie), tutorial launching, and
certificate generation. It includes a background job (`RefreshTutorialsJob`)
that updates the tutorial list. The engine is mounted into the main app's
routes.

## Troubleshooting seed failures

These patterns are carried forward from `docs/update-levelbuilder.md` and
remain accurate.

### `ActiveRecord::RecordNotFound` during seeding

**Cause:** the `.seeded` timestamp file is stale, so the seed skips files it
thinks are unchanged, or custom level files from another Levelbuilder have
not been imported.

**Fix:**

```sh
cd dashboard
rm config/scripts/.seeded
rake seed:all
```

If levels are missing because they were created on a different Levelbuilder:

```sh
rake seed:all FORCE_CUSTOM_LEVELS=1
```

### Merge conflict in `dashboard/config/locales/dsls/en.yml`

This file is owned by Levelbuilder. The staging build can incorrectly modify
it. Resolve conflicts in favor of the Levelbuilder branch.

### Puma PID stale on the Levelbuilder server

If the server fails to start with "Already running on PID:XXXX", kill the
stale process and rebuild:

```sh
kill -9 <PID>
rake build:dashboard
```

## Related

- [Curriculum pipeline](/developers/curriculum/curriculum-pipeline/) --
  the flow that moves files from Levelbuilder to production.
- [Curriculum authoring](/developers/curriculum/curriculum-authoring/) --
  the editors that produce these files.
- `bin/curriculum/README.md` -- one-paragraph summary of curriculum-related
  scripts.
- `dashboard/lib/services/README.md` -- the Service Object pattern used by
  `ScriptSeed`.
