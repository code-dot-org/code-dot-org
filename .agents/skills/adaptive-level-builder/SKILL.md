---
name: adaptive-level-builder
description: >-
  Build and iterate on an adaptive pathway (the JSON behind an Adaptive
  level, like dashboard/config/level_content/adaptive/sample.json) from a
  curriculum Google Doc or Google Sheet. Writes <id>.json to copy or paste,
  <id>.annotated.jsonc recording where every line came from, and
  <id>.tasks.md, a checklist of the levelbuilder work only a person can do
  (create levels, upload images, fill gaps). Use when the user gives a
  docs.google.com document or spreadsheet and asks for an adaptive level,
  pathway, or sample.json-style JSON; and on any follow-up about an existing
  build: "I created level X", "here's the image URL", "done L2", "change
  the title", "the doc changed".
---

# adaptive-level-builder

A build lives in a workspace folder, by default
`~/Documents/adaptive-levels/<id>/` (use another if the user names one):

    <id>.annotated.jsonc   source of truth, edited by hand
    <id>.json              generated from the JSONC; never edited directly
    <id>.tasks.md          levels table, manual tasks, decisions, log
    source/                what was fetched: doc.txt or sheet.txt, media/

`<id>` is the pathway id and file name, `[a-z0-9][a-z0-9_-]{0,63}`.

The goal is fidelity to the source. Copy its words; never invent prose.
Where the source gives nothing, write a visible `TODO` and a task.

Scripts are in this skill's `scripts/` directory; below, `$S` stands for
its absolute path. No code-dot-org checkout is needed: code and levels are
read from GitHub, `code-dot-org/code-dot-org` on branch `staging`, through
`$S/repo.py`. Do not read them from a local checkout even if one exists;
it may be on another branch or stale.

    python3 $S/repo.py cat <path>     a file
    python3 $S/repo.py ls <path>      a directory
    python3 $S/repo.py level <name>   a level's JSON
    python3 $S/repo.py where <name>   a level's path

`REPO_REF=<branch>` reads another branch, e.g. one whose schema change has
not merged yet.

## Which mode

- No workspace for this pathway yet: **first build** (below).
- A workspace exists: **iterate** (see `references/tasks.md`, "Updating").
  Read `<id>.tasks.md` and the JSONC header first. Do not refetch the
  source unless the user asks or says it changed.

Find workspaces with `ls ~/Documents/adaptive-levels/`. If the user names a
pathway that has none, ask before starting a new one.

## First build

### 1. Inputs

Need: the source URL, which part of it to use, and the pathway id. Ask
once for whatever is missing (AskUserQuestion; suggest an id from the
source title). The URL may arrive wrapped across lines; rejoin it.

- A doc's `?tab=t.xxx` and `#bookmark=id.xxx` cannot be resolved from the
  export. Ask for the tab title, or list the tab titles and ask.
- A sheet: ask which sheet tabs hold the progression, after listing them.

### 2. Read the format from the code

The schema moves; read it each run with `repo.py cat` (browsable at
https://github.com/code-dot-org/code-dot-org/tree/staging/apps/src/adaptive/schema):

- `apps/src/adaptive/schema/` — `pathway.ts`, `checkpoint.ts`,
  `project.ts`, `skill.ts`, `question.ts`, `steps/*.ts`. Objects are
  strict: no extra keys. `repo.py ls` the directory first; files come and
  go.
- `apps/src/adaptive/schema/parse/references.ts` — rules the schema cannot
  express.
- `dashboard/config/level_content/adaptive/sample.json` — house style:
  2-space indent, small objects (choices, standards) on one line.
- `repo.py ls dashboard/config/level_content/adaptive` — the pathway ids
  already taken.

`$S/check_pathway.py` hard-codes the shapes and reference rules. If the
schema has a key or rule the checker lacks, follow the schema, and tell
the user the checker needs updating.

### 3. Fetch the source

Load the Google Drive tools with ToolSearch. Make `source/` in the
workspace. Results too large to return are saved to a file; the tool
result names it.

**Doc.** `read_file_content` with the file id. Then
`jq -r .fileContent <saved file> > source/doc.txt`. Every tab is flattened
into one markdown file; each tab starts with `# <Tab title>` (two trailing
spaces). Find tabs with `grep -n '^# ' source/doc.txt`. The export drops
images and bookmark targets, and the .docx and HTML exports are too large
for the connector; do not try them. Ask the user whether the tab has
images that belong in the pathway.

**Sheet.** `read_file_content` returns only sample rows with cells cut at
80 characters; use it only to list sheet names. For content, call
`download_file_content` with `exportMimeType`
`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, then

    python3 -I $S/xlsx_dump.py <saved file> <workspace>/source

which writes `source/sheet.txt` (one line per cell, `Sheet!B3<TAB>text`,
plus links and merged ranges) and extracts embedded images to
`source/media/`.

Record the fetch date. WebFetch on Google URLs returns 401; do not try it.

Read the whole part the user named, and anything it points to: other tabs
(skill maps, starter code), and levelbuilder levels it links (see
`references/mapping.md`, "Linked levels").

### 4. Propose the mapping, then write

Map the source onto the pathway following `references/mapping.md`. Before
writing the JSONC, show the user the mapping in one short table: which
rows or sections become which checkpoints and steps, the skills, the
unlock graph, and the questions you cannot settle from the source (use
AskUserQuestion for those). Sheets especially vary in layout; never guess
which column is student-facing text. Record the agreed mapping in the
JSONC header so later sessions apply it the same way.

Then write, in this order:

1. `<id>.annotated.jsonc`, following `references/annotations.md`.
2. `<id>.json`: `python3 $S/jsonc_to_json.py <id>.annotated.jsonc <id>.json`
3. `<id>.tasks.md`, following `references/tasks.md`.
4. `python3 $S/check_pathway.py <workspace>/<id>.json`

Fix every `PROBLEM` line and rerun until it passes. The checker mirrors
the schema and reference rules, checks the annotations, and checks that
the task list covers every level, placeholder image, and TODO. It also
looks up each level on GitHub to check its project template. The level
index is cached for an hour; `rm -r ~/.cache/adaptive-level-builder` after
a content push to see new levels sooner. Offline, it skips the level
checks and says so.

### 5. Report

A short chat message:

- the source part used, and anything unreadable;
- counts by annotation tag;
- open tasks by kind (levels, images, content, publish), and the decisions
  the user needs to make, each in one line;
- the three file paths.

## Rules for every change

- Edit only the JSONC; regenerate the JSON; run the checker; update the
  tasks file and append one line to its Log. Every turn that changes a
  file ends with the checker passing.
- Keep `// me:` lines and their values unless the user says otherwise.
- Never rename an id, level name, or question id that a done task or a
  created level depends on without saying so; a renamed level breaks the
  pathway until the level is renamed on levelbuilder too.
- Do not commit, push, or open a pull request unless the user asks (see
  `references/tasks.md`, "Publish").
