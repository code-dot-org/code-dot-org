# Levelbuilder and curriculum pipeline -- plan

## Levelbuilder mode status

Locally **off** (`Rails.application.config.levelbuilder_mode` returns `false`).
All browser journeys against levelbuilder UI are BLOCKED (environment).
No screenshots will be taken.

## Reader moments

1. "I need to understand Levelbuilder before I work in it or support someone who does."
2. "I want a map of what the editors are and how curriculum objects relate."
3. "I need to understand how authored content reaches production."
4. "I'm debugging a seed failure or working on the curriculum data model."

## Proposed pages

### `docs/developers/curriculum/index.md`

Hub page. Links the four topic pages below. One paragraph orienting the reader:
Levelbuilder is the internal curriculum authoring tool; it writes flat files
that are seeded into every other environment.

---

### `docs/developers/curriculum/levelbuilder-environment.md`

- **type:** concept
- **question:** What is Levelbuilder and how do I get access?
- **inventory:** lb-level-editor (availability), lb-lesson-editor (availability)
- **journey:** 9 (steps 1, 9)
- **sections:**
  - What Levelbuilder is (internal authoring tool, not reachable in production)
  - Access gate (UserPermission LEVELBUILDER + levelbuilder_mode)
  - Environments (levelbuilder Rails env defaults on; development/staging/test/production default off; locals.yml override)
  - CanCanCan grant (the broad `can :manage` list, guarded by both conditions)
  - English-only requirement
  - Running locally in levelbuilder mode
- **Applies to:** curriculum authors, engineers

### `docs/developers/curriculum/curriculum-authoring.md`

- **type:** concept
- **question:** What objects make up a course and which editors exist?
- **inventory:** lb-level-editor, lb-blocks-editor, lb-exemplar-and-start-code, lb-lesson-editor, lb-unit-editor, lb-course-editor, lb-publishing-editor, lb-resources-standards-vocab, lb-code-docs-editor, lb-data-docs-editor, lb-reference-guide-editor, lb-rubric-editor, lb-quiz-editor, lb-practice-problem-editor, lb-slides-generator, lb-curriculum-generator, lb-foorm-editor, lb-video-and-asset-admin, lb-callout-editor, lb-announcement-editor
- **journey:** 9 (steps 1--6, 9)
- **sections:**
  - Object hierarchy (CourseOffering > CourseVersion > UnitGroup > Unit > LessonGroup > Lesson > LessonActivity > ActivitySection > ScriptLevel > Level)
  - Level types by prevalence (Multi, External, Applab, Javalab, FreeResponse dominate)
  - Editor map (level, lesson, unit, course, offering editors; publishing editor)
  - Supporting catalogs (resources, standards, vocabulary, code docs, data docs, reference guides)
  - Publishing lifecycle (in_development > pilot > beta > preview > stable > sunsetting > deprecated)
  - Auxiliary authoring (rubrics, quizzes, practice problems, callouts, slides, announcements, videos/sprites, Foorm, AI generators, widget2)
- **Applies to:** curriculum authors, engineers

### `docs/developers/curriculum/curriculum-pipeline.md`

- **type:** concept
- **question:** How does authored content reach production?
- **inventory:** lb-curriculum-serialize-seed, dev-curriculum-data-model
- **journey:** 9 (steps 6--10)
- **sections:**
  - The one-way direction (Levelbuilder writes files; other environments seed from them)
  - Serialize to files (saving in any editor writes JSON/DSL files under dashboard/config/)
  - content-push and robo-commit (bin/content-push commits files on the levelbuilder server; bin/cron/commit_content runs it as robo-commit)
  - Merging to staging (bin/cron/merge_lb_to_staging, Slack DTS gate, dts_candidate PR)
  - Deploying to Levelbuilder (bin/cron/deploy_to_levelbuilder, Slack DTL gate, 5-minute window)
  - Seeding on downstream environments (rake seed:default, seed task lists per environment)
  - How to see your change on test and production
- **Applies to:** curriculum authors, engineers

### `docs/developers/curriculum/data-model-and-seeding.md`

- **type:** reference
- **question:** What are the curriculum models, their invariants, and common failure modes?
- **inventory:** dev-curriculum-data-model, lb-curriculum-serialize-seed, lb-deprecated-levels
- **sections:**
  - Model table (model, table name, key columns, notes -- highlight Unit=scripts, Lesson=stages)
  - ScriptSeed (serialize_seeding_json and seed_from_json_file, SeedContext, seeding_key matching)
  - Seed tasks (FULL_SEED_TASKS, UI_TEST_SEED_TASKS, DEFAULT_SEED_TASKS per environment)
  - Deprecated levels (blockly_levels.json, DeprecatedLevelLoader)
  - Test-only config tree (dashboard/test/ui/config, naming conventions)
  - Legacy surfaces (curriculum proxy to curriculum.code.org, hoc_legacy engine)
  - Troubleshooting seed failures (RecordNotFound/.seeded stale, FORCE_CUSTOM_LEVELS, locales/dsls/en.yml conflict, PID stale)
- **Applies to:** engineers

## Open question verdicts

| Question | Verdict |
|---|---|
| curriculum_proxy plan to retire? | AMBIGUOUS -- no deprecation markers in code; proxies curriculum.code.org for CORS avoidance; still in active routes |
| hoc_legacy engine purpose? | STRONGLY SUPPORTED -- Rails engine serving Hour of Code tutorial flow (sessions, certificates, tutorial refresh); under dashboard/engines/hoc_legacy |
| practice_problems vs challenges? | STRONGLY SUPPORTED -- different things. PracticeProblem seeded from config files, tied to objectives. Challenge is a lesson-level model with whiteboard/video modality and rubric, used in the newer "deep dive" feature |
| widget2 successor to Widget? | STRONGLY SUPPORTED -- Widget is a level type (app/models/levels/widget.rb); Widget2 is a levelbuilder-only controller that edits standalone widget content separate from levels |

## Terminology observed

- The UI says "unit" (not "script"), "lesson" (not "stage"), "course" (for UnitGroup).
- Internal code uses Script/scripts table for Unit, stages table for Lesson.
- "Levelbuilder" is both the permission name and the environment name.

## Existing docs reconciliation

- `docs/update-levelbuilder.md`: references Pivotal Tracker (defunct), SSH gateway (defunct), manual content-push. The troubleshooting section (RecordNotFound, .seeded, locale conflicts, PID stale) still holds. Reconcile into data-model-and-seeding.md troubleshooting section.
- `docs/pdf-lesson-plan-generation.md`: entirely stale (Dropbox pipeline into Pegasus). Note as deprecated in the pipeline page; do not duplicate.
- `bin/curriculum/README.md`: accurate one-paragraph description. Link from data-model-and-seeding.md.
