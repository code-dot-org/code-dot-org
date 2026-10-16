# The task list

`<id>.tasks.md` is for the curriculum writer, who may not read JSON. It
holds the levels the pathway names, the manual work left, the decisions
waiting on them, and a log. The checker parses the Levels table and the
task lines, so keep their shape.

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

Role is `template`, `project`, or `sandbox`. Status is `to create`,
`created`, or `exists` (already on levelbuilder before this build).

Task ids are a letter and a number: L levels, I images, C content, F
publish, D decisions. Ids are never reused or renumbered, so the user can
say "done L3". A task is one line, `- [ ] **<id>** <imperative>`, with
indented detail lines below it when needed. Every level in the Levels
table has a task naming it in backticks; every placeholder image's task
names the panel `key`; every `TODO` value has an open C task naming the
id of its step (or its checkpoint or skill, for a TODO outside a step).

A finished task is checked in place with what happened:
`- [x] **L1** ... Done <date>: level 104123.` A task made moot is checked
and struck through: `- [x] ~~**I2** ...~~ Dropped <date>: panel removed.`

## Task templates

Levelbuilder is https://levelbuilder-studio.code.org. Write the steps out
in each task; the writer should not need this file.

**Template level** (one per pathway):

    - [ ] **L1** Create the project template `<name>`.
      1. Go to /levels/new, choose Weblab2, name it exactly `<name>`.
      2. Leave "Project Template Level Name" blank.
      3. Click "Save, publish, and go to edit start code"; add the starter
         files (<source/starter/<name>/..., or "the source gives none: a
         blank page is fine">); save.
      4. Tell me the level number.

**Project step level** (one per `project: true` step):

    - [ ] **L2** Create project level `<name>` for step "<step title>".
      1. /levels/new, Weblab2, name exactly `<name>`.
      2. Set "Project Template Level Name" to `<template name>`.
      3. No start code: the template's is used.
      4. Tell me the level number.

**Sandbox level** (one per practice step):

    - [ ] **L3** Create practice level `<name>` for step "<step title>".
      1. /levels/new, Weblab2, name exactly `<name>`.
      2. Leave "Project Template Level Name" blank.
      3. "Save, publish, and go to edit start code"; add <starter files>.
      4. Tell me the level number.

**Image** (one per placeholder `imageUrl`, or one per panel set):

    - [ ] **I1** Upload the image for panel `<key>` in step "<step title>".
      Source: <source/media/<file>, or where it is in the doc, or "none:
      make or pick one">. Upload it with the image field of any Panels
      level's editor on levelbuilder, then send me the
      https://images.code.org/... URL.

**Content** (one per `TODO`, grouped by step when several share a cause):

    - [ ] **C1** Write the panel text for "<step title>" (`<step id>`).
      The source has only a brief: "<brief>". Add it to the source and
      tell me, or send the text, or ask me to draft it.

Also C tasks for a linked level not yet on GitHub ("paste the
properties of level 104045, or tell me its name") and a video that needs
stand-in panels.

**Publish** (always, in this order):

    - [ ] **F1** Get `<id>.json` into the repo as
      `dashboard/config/level_content/adaptive/<id>.json` by pull request:
      on https://github.com/code-dot-org/code-dot-org/tree/staging/dashboard/config/level_content/adaptive
      use "Add file" → "Upload files", choose "Create a new branch", and
      open the PR; or hand the file to an engineer. The Adaptive level's
      Content ID list only shows files in the repo, so this comes first.
      Skip if `<id>` already exists there.
    - [ ] **F2** On levelbuilder, create (or open) the Adaptive level that
      plays this pathway and set its Content ID to `<id>`.
    - [ ] **F3** Add that level to a lesson, then play the pathway through
      as a student.

After F1, later changes reach levelbuilder by pasting `<id>.json` into
the Adaptive level editor's Content box and saving, where that editor is
deployed; otherwise by another PR. Say which after each change once F1 is
done.

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
- **The source changed**: fetch again into `source/new/`, then
  `diff source/doc.txt source/new/doc.txt` (or `sheet.txt`). Show the user
  the changed locations, update only lines citing them (leave `me:` and
  `provided:` lines unless the user agrees), move `new/` over the old
  files, and note the new fetch date in the header.
- **"What's left?"**: list open tasks and decisions, and say which one
  unblocks the most.

End each update with one or two lines: what changed, and the open task
count. Do not repeat the whole list unless asked.
