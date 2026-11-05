# Mapping a source onto a pathway

## Structure

| Source | Pathway |
|---|---|
| A skill (Build with AI, Language of web dev, ...) | `skills.<id>`; title and description from the source's skill map |
| A checkpoint: a doc row group, or a sheet row | one `checkpoints[]` entry, with `skillIds` |
| A numbered row or part within a checkpoint | one step, in order |
| Info panel, slides | `panels` step |
| Video | `video` step whose `videoKey` is the video's key in levelbuilder's video list (`dashboard/config/videos.csv`); with no video there yet, a `panels` step of stand-in panels and a task to add the video and send its key |
| Multiple choice, self check, CFU | `questions` step, `MultipleChoiceQuestion`; `correctChoiceId` only where the source gives an answer |
| Short written answer | `questions` step, `freeResponse` |
| Rating on a scale | `questions` step, `MultipleChoiceQuestion` with one choice per point of the scale, no `correctChoiceId`; there is no scale question |
| Practice on a given page | `level` step on a sandbox level |
| "Apply to project", work on the student's own page | `level` step, `project: true`, on a project level |
| "Unlock X after Y", "Opens after Y" | `X.requires` includes `Y` |
| The project the pathway builds | `project.templateLevel` and `project.description` |

`requires` means all listed checkpoints; at least one checkpoint has none.

Placement and routing by evidence have fields: a question's `measures`
says which skill an answer shows and at what evidence level; a skill's
`evidenceLevels` describes each level; a checkpoint's
`targetEvidenceLevels` and `skippable` let a student who has shown the
skill be placed past it; `routeAfterCompletion` runs the router when the
checkpoint is done. Use them only where the source states the levels and
what each answer shows; read the schema for the rules between them.

These have no field: an "or" unlock, branching by a particular answer,
per-destination variants, hints, pass criteria, feedback and validation
messages, time estimates, status columns. Keep them as `unplaced`
comments beside the step they belong to, copied word for word. When one
changes what the pathway does (an "or" unlock, a variant to pick), also
add a decision to the task list.

## Spec text versus content

A planning sheet often describes content instead of giving it: "Two
moves: add a detail, or change one thing" in a column headed "Introduced:
info panel or video" is a brief for a panel, not the panel's text. Copy
only text meant for the student into student-facing fields (`text`,
`questionTitle`, choices, `instructions`). For a brief, write `TODO`, quote
the brief in the `todo` comment, and add a content task. Draft the text
only if the user asks, tagged `generated` with the basis quoted.

Fields not shown to students may take spec text directly:
checkpoint and skill `description`, `objective`, `project.description`, and
`instructionsPrompt` (built from the source's task and evidence columns;
tag `generated`).

When it is unclear whether a column is content or brief, ask during the
mapping step.

## Ids and names

- Ids: lowercase kebab-case from the source's labels (`steer-it`,
  `steer-it-panel`). Step ids are unique across the pathway; `project` is
  reserved.
- Question `id`s, multiple choice and free response alike, are positive
  integers unique across the pathway, starting at 101. Once the pathway is
  published, never change one: progress is stored by it.
- Level names: `adaptive-<short id>-<role>`, role `template`,
  `project-<checkpoint>`, or a sandbox name such as `<checkpoint>-panda`.
  Max 70 characters. A level backs only one step, and no step may play the
  template level.
- Panel `key`s: `<step id>-<n>`, or the source level's own keys when the
  panels are copied from a level.

## Text placement

Put the source's words for a level step in the step's `instructions`;
they override the level's own instructions inside the pathway. Add
`instructionsPrompt` only on project steps, and only when the source gives
the task and what counts as success.

A required `imageUrl` with no image yet takes the placeholder
`https://images.code.org/99d7f396c47a604d6ca01825a08c4ab2-Panel 1.png`,
a `todo` tag, and an image task.

## Linked levels

When the source links a levelbuilder level (panels to reuse, a practice
page, or a level made for each step), read it from GitHub staging, where
levelbuilder levels land after the nightly content push:

    python3 $S/repo.py level <name>

Panels are under `properties.panels`. A link by number (`/levels/104045`)
does not give the name; ask the user for it, or for the level's
properties pasted. A level made on levelbuilder since the last push is
not on GitHub yet; add a content task asking the user to paste its
properties. Give each such level its own source code in the JSONC
header and cite fields by path (`KO panels[3].text`).

A level step plays any Lab2 level: Weblab2, Panels, and the other labs
in `apps/lab2EntryPoints.ts`. A level that is not Lab2 (FreeResponse,
Multi, Match) cannot be a step; copy its prompt into an inline question
and record the level as unused. Its directory in `repo.py where` names
its type.

When the source names a created level for every step, use each one
unless the user says otherwise:

- Weblab2 with Project Template Level Name equal to the pathway's
  template: a step in the student's project. That template is the
  pathway's `templateLevel`; if levels name different templates, ask.
- Weblab2 without a template: a practice level step.
- Panels: copy the panels inline (keys, images, text, layout) or play the
  level as a step; ask which. Inline panels do not follow later edits on
  levelbuilder.
- FreeResponse: an inline `freeResponse`, its text from the source and
  its placeholder from the level.
- Not on GitHub yet: build the step from the source, and note the level.

List every created level the pathway does not play in a decision, so the
writer can keep or retire it.

## Starter code

Starter code for a template or sandbox level goes into the level on
levelbuilder, not the JSON. Save what the source gives into
`source/starter/<level name>/<file>` and point the level's task at it.
Where the source gives no page, say so in the task.
