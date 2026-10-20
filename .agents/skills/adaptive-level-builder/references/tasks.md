# The task list

`<id>.tasks.md` is for the curriculum writer: fluent in levelbuilder, not
in JSON or git (see "Who reads what" in SKILL.md). It holds the levels the
pathway names, the manual work left, the decisions waiting on them, and a
log. The checker parses the Levels table and the task lines, so keep their
shape.

## Shape

    # <Pathway title>: tasks

    Pathway `<id>` from [<source title>](<url>), "<tab or sheet>".
    Updated <date>.

    - `<id>.json`: the JSON to copy or paste
    - `<id>.annotated.jsonc`: where each line came from
    - `<id>.tasks.md`: this list

    ## Levels

    | Level name | Role | Used by | Status | Levelbuilder |
    |---|---|---|---|---|
    | `adaptive-hoai-template` | template | project | to create | |
    | `adaptive-hoai-project-steer` | project | steer-it/steer-it-project | created | [104123](https://levelbuilder-studio.code.org/levels/104123/edit) |

    ## To do

    ### Levels
    - [ ] **L1** Create the project template `adaptive-hoai-template`.
      ...steps...

    ### Images
    ### Content
    ### Publish

    ## Decisions
    - [ ] **D1** <question>. <what the source says>. <the options>.

    ## Log
    - <date> First build from <source>, fetched <date>.

Role is `template`, `project`, or `sandbox` (the checker reads these
words; in task text, say "practice level" for `sandbox`). Status is
`to create`, `created`, or `exists` (already on levelbuilder before this
build).

Task ids are a letter and a number: L levels, I images, C content, F
publish, D decisions. Ids are never reused or renumbered, so the user can
say "done L3". A task is one line, `- [ ] **<id>** <imperative>`, with
indented detail lines below it when needed. Every level in the Levels
table has a task naming it in backticks; every placeholder image's task
names the panel `key`; every `TODO` value has an open C task naming, in
backticks, the id of its step (or its checkpoint or skill, or the field,
such as `project`, for a TODO outside a step).

A finished task is checked in place with what happened:
`- [x] **L1** ... Done <date>: level 104123.` A task made moot is checked
and struck through: `- [x] ~~**I2** ...~~ Dropped <date>: panel removed.`

## Task templates

Levelbuilder is https://levelbuilder-studio.code.org. The writer knows it
well: a task states what to make and the settings that matter, not where
to click. Each task stands alone; the writer should not need this file.
Name the step by its title in quotes, with its id in backticks after.

**Template level** (one per pathway):

    - [ ] **L1** Create the project template `<name>`: Weblab2, no project
      template. Start code: <source/starter/<name>/..., or "the source
      gives none; a blank page is fine">. Send me its level number.

**Project level** (one per step in the student's project):

    - [ ] **L2** Create project level `<name>` for "<step title>": Weblab2,
      Project Template Level Name `<template name>`, no start code of its
      own. Send me its level number.

**Practice level** (one per practice step; Role `sandbox`):

    - [ ] **L3** Create practice level `<name>` for "<step title>":
      Weblab2, no project template. Start code: <starter files, or "none
      given">. Send me its level number.

**Image** (one per placeholder image, or one per panel set):

    - [ ] **I1** Upload the image for panel `<key>` of "<step title>" and
      send me its images.code.org URL. Source: <source/media/<file>, or
      where it is in the doc, or "none: make or pick one">.

**Content** (one per gap, grouped by step when several share a cause):

    - [ ] **C1** Write the panel text for "<step title>" (`<step id>`).
      The source has only a brief: "<brief>". Add it to the source and
      tell me, or send the text, or ask me to draft it.

Also C tasks for a linked level not yet on GitHub ("paste the
properties of level 104045, or tell me its name") and a video that needs
stand-in panels.

**Decision**: the curriculum question, what the source says, and what the
student would see under each choice.

    - [ ] **D1** Check the Fix's question has two right answers; a
      question here can have one. Students could retry until they pick
      B, or any answer could continue. Which?

**Publish** (always, in this order). F1 is the one task that needs GitHub,
so spell it out:

    - [ ] **F1** Get `<id>.json` into the repo as
      `dashboard/config/level_content/adaptive/<id>.json`. On
      https://github.com/code-dot-org/code-dot-org/tree/staging/dashboard/config/level_content/adaptive
      choose "Add file", then "Upload files", then "Create a new branch",
      and open the pull request; or hand the file to an engineer. Wait
      until every level in the Levels table is on GitHub, which the
      nightly content push does: the pull request's tests fail on a
      level they cannot find. The Adaptive
      level's Content ID list shows only files in the repo, so this comes
      first. Skip if `<id>` already exists there.
    - [ ] **F2** Create (or open) the Adaptive level that plays this
      pathway and set its Content ID to `<id>`.
    - [ ] **F3** Add that level to a lesson and play the pathway through
      as a student.

After F1, a change reaches levelbuilder through the Adaptive level's
editor: paste `<id>.json` into its Pathway box and click "Save pathway"
(saving the level does not save the pathway). The nightly content push
carries it to GitHub. Before that editor is deployed, a change takes
another pull request. Say which after each change once F1 is done.

If levelbuilder rejects the JSON ("Invalid adaptive content"), its
deployed code may be older than `staging`: read the schema with
`REPO_REF=levelbuilder` and say which fields it lacks; do not change the
build to match without asking.

## Updating

Each user message about an existing build is one of these. Do the change,
then follow "Rules for every change" in SKILL.md.

- **A level was created** ("made adaptive-hoai-template, it's 104200"):
  set the row's Status to `created` and its Levelbuilder cell to
  `[104200](https://levelbuilder-studio.code.org/levels/104200/edit)`;
  check the task. If the name differs from the plan, ask whether to rename
  it in the pathway (change `level` or `templateLevel` and the row) or on
  levelbuilder.
- **An image was uploaded** (a URL): set that panel's `imageUrl`, retag it
  `provided: I<n>, <date>`, check the task.
- **Content was supplied**: in chat, set the value and tag it `provided`;
  "it's in the doc now", refetch (below) and tag it `copied`. Check the C
  task.
- **A decision was made**: apply it, move any `unplaced` comment it
  resolves into the tag's note, check the D task.
- **A change request** ("rename checkpoint 2", "add a question", "drop the
  video step"): edit, then add, drop, or reword the tasks it affects. A
  new level gets a row and an L task; a removed one loses its row, and its
  task is dropped, or, if the level was already created, kept with a note
  that the level is unused.
- **"Done L3"** with nothing else: check it, and ask for anything the task
  asked to be told (a level number).
- **The source changed**: fetch again into `source/new/` and compare.
  For a doc, `diff source/doc.txt source/new/doc.txt`. For a sheet, a line
  diff is useless once a row is inserted; match rows by an id column:

      python3 $S/sheet_diff.py source/sheet.txt source/new/sheet.txt \
        --key 'Steps=C' --key 'Checkpoints=A'

  Name each sheet exactly as a `# Sheet:` line of sheet.txt does, emoji
  and all. It lists added, removed and changed rows by id; ignore columns the
  mapping drops. Show the user the changes that reach the pathway, and
  ask about any that change its structure (a step removed, a new
  format). If rows moved, add `--renumber <id>.annotated.jsonc --code
  ST=Steps ...` (one `--code` per sheet code in the header) to rewrite
  the citations, and fix any it reports as STALE. Then update the lines
  citing changed cells (leave `me:` and `provided:` lines unless the user
  agrees), move `new/` over the old files, and note the new fetch date in
  the header.
- **"What's left?"**: list open tasks and decisions, and say which one
  unblocks the most.

End each update with one or two lines: what changed, and the open task
count. Do not repeat the whole list unless asked.
