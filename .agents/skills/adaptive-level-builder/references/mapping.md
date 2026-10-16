# Mapping a source onto a pathway

## Structure

| Source | Pathway |
|---|---|
| A skill (Build with AI, Language of web dev, ...) | `skills.<id>`; title and description from the source's skill map |
| A checkpoint: a doc row group, or a sheet row | one `checkpoints[]` entry, with `skillIds` |
| A numbered row or part within a checkpoint | one step, in order |
| Info panel, slides | `panels` step |
| Video | no video step exists: a `panels` step plus a task to make stand-in panels |
| Multiple choice, self check, CFU | `questions` step, `MultipleChoiceQuestion`; `correctChoiceId` only where the source gives an answer |
| Short written answer | `questions` step, `freeResponse` |
| Rating on a scale | `questions` step, `scale` |
| Practice on a given page | `level` step on a sandbox level |
| "Apply to project", work on the student's own page | `level` step, `project: true`, on a project level |
| "Unlock X after Y", "Opens after Y" | `X.requires` includes `Y` |
| The project the pathway builds | `project.templateLevel` and `project.description` |

`requires` means all listed checkpoints; at least one checkpoint has none.
These have no field: an "or" unlock, branching or routing by answer,
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
- Multiple choice `id`s are integers unique across the pathway, starting
  at 101. `freeResponse` and `scale` ids are strings.
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
page), read it from GitHub staging, where levelbuilder levels land after
the nightly content push:

    python3 $S/repo.py level <name>

Panels are under `properties.panels`. A link by number (`/levels/104045`)
does not give the name; ask the user for it, or for the level's
properties pasted. A level made on levelbuilder since the last push is
not on GitHub yet; add a content task asking the user to paste its
properties. Give each such level its own source code in the JSONC
header and cite fields by path (`KO panels[3].text`).

## Starter code

Starter code for a template or sandbox level goes into the level on
levelbuilder, not the JSON. Save what the source gives into
`source/starter/<level name>/<file>` and point the level's task at it.
Where the source gives no page, say so in the task.
