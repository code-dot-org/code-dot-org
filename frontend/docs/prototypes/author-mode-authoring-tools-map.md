# Author Mode: authoring tools map

For every student-experience type the prototype renders: the logical areas a
curriculum author would point at, the field each area reads, the write op that
exists (or does not), the control that should edit it and where that control
lives, and whether it is shipped, partial or missing. Then a prioritized build
list and the observed problem list.

Status: analysis only, on branch `ngfp/author-mode-staging` (tip
8ed71504859). No code written, no curriculum mutated. Paths relative to
`frontend/`.

This document merges two independent sweeps of the same ground:

- `author-mode-experience-sweep.md` — visual: every type rendered live in
  author mode and student view, decomposed into logical areas.
- `author-mode-data-wiring-map.md` — code: field → producer → consumer → write
  op, with the op vocabulary and the traps.

Reconciliation rule used throughout: **the code side is authoritative on
wiring facts; the visual side is authoritative on decomposition and control
placement.** Section 6 lists the three places the two disagreed and how each
was settled.

---

## 0. Where the shipped IA reaches

The confirmed component model — stage decomposes into hover-highlightable,
click-selectable logical components, each editing its own properties in the
right panel; the left rail's "Level" tab holds level-wide settings only — is
implemented for exactly one type.

| type | instances | stage click targets | "Level" tab | panel reachable |
|---|---|---|---|---|
| Maze / Karel | 158 | 4 (Instructions, Play Area, Blocks, Workspace) | enabled | yes |
| Music | 45 | 1 (Instructions) | disabled | instructions only |
| Fish / Oceans | 9 | 1 (Instructions) | disabled | instructions only |
| content | 16 | 0 (inline pencil instead) | disabled | n/a |
| generic (video, multi, match, external, bubbleChoice) | 40 | **0** | disabled | **no** |
| widget | 5 | **0** | disabled | **no** |
| unsupported (Panels, Dancelab, Craft, Artist, Bounce, `unknown`) | 66 | 0 | disabled | no |

The structural cause of the last three rows is one branch:
`ExistingLevelStage`'s generic path (`ExperienceStage.tsx:227-236`) and
`WidgetExperienceView` pass no `onSectionClick`, and `showPropertiesPanel`
additionally requires a `panelSection` (`LessonPlayer.tsx:239-240`) that
nothing can set. The panel's instructions section would function if it were
opened. **Only the click target is missing.**

The write vocabulary is 17 ops in two patterns
(`author-mode-data-wiring-map.md` §1). Pattern A (`overrideLevelInstructions`,
`overrideLevelDefinition`) captures `previous` server-side and is exactly
revertible. Pattern B (`updateUnit`, `updateLesson`, `updateContent`,
`updateLevel`, `updateWidgetMetadata`) is a plain partial spread with no
capture — editable but **not revertible**, and `ChangeHistory` shows those
rows without a Revert control.

---

## 1. Maze / Karel — 158 instances, the reference implementation

Stage, left column to right: **Instructions** (labelled header, select button,
rendered markdown bubble, a `Hint` button) over **Play Area** (grid + Run +
Step); right column: **Blocks** (block-count chip + toolbox flyout) over
**Workspace** (Blockly canvas, Start Over, Show Code). Karel differs only in
skin-derived vocabulary (`Flower (nectar)`, `Hive (honey)` paint chips; nectar
and honey blocks).

Write path: `useLevelDraft` (`levelDraft.ts:134-372`) accumulates one
`LevelDraftPatch` that Save posts as a single `overrideLevelDefinition`, then
invalidates and runs `checkLevel`.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Instructions bubble | `longInstructions` | `overrideLevelInstructions` (revertible) | textarea + live markdown preview — panel §Instructions | **shipped** (preview missing) |
| — its Short field | `shortInstructions` | same | **remove it.** Nothing in `packages/labs/maze` reads it and `hostRendersInstructions` is false for maze, so it saves a field with no consumer and logs a change | **shipped-but-wrong** |
| Hint button | `authored_hints` (JSON array) | **none** | ordered hint-list editor, markdown per hint — panel §Instructions, collapsed | **missing** |
| Grid painting | `maze`, `serialized_maze` | `overrideLevelDefinition` (paired write; triggers solution-staleness rule) | paint-chip tray in panel, painting on stage — correct as built | **shipped** |
| Grid size | `maze` dimensions | `overrideLevelDefinition` (same keys) | rows/cols steppers with a crop/pad warning — panel §Play Area | **missing** (readout only) |
| Cell payloads (nectar per flower, honey goal, dirt) | `serialized_maze[r][c]`, `initial_dirt`, `final_dirt` | `overrideLevelDefinition` would need `initial_dirt`/`final_dirt` added to `LevelDefinitionPatch` | click a painted cell → numeric field — panel §Play Area | **missing** |
| Start direction | `startDirection` | `overrideLevelDefinition` | `<select>` N/E/S/W | **shipped** |
| Skin | `skin` | **none, deliberately** | keep read-only; add the reason inline — a skin change re-bases the paint tray, the toolbox palette and any stored solution simultaneously (`levelDraft.ts:163-178`) | **shipped as read-only** |
| Toolbox | `toolboxBlocksXml` | `overrideLevelDefinition` | two-list chip tray — panel §Toolbox. Add reorder; label unknown block types with their friendly name (see problem 8) | **shipped** (partial) |
| Start blocks | `startBlocksXml` | `overrideLevelDefinition` | `Student start` mode + on-stage arrangement | **shipped** |
| Solution | `solutionBlocksXml`, `solutionVerified` | `overrideLevelDefinition`; `'false'` forced server-side by `withSolutionStalenessRule` | `My solution` mode; capture only on a passing run | **shipped** |
| Title | `title` | `updateLevel` (**not revertible**) | text input — left rail §Level | **shipped** |
| Target block count | `ideal` | `overrideLevelDefinition` | number input — left rail §Level | **shipped** |
| Recommended blocks | `recommendedBlocksXml` | none | do not offer — read by the lab, authored nowhere | intentionally absent |

Trap carried over: imported maze entries hold both `start_direction` and
`startDirection` (and both instruction spellings); the override merges only
the camelCase copy, leaving the snake_case one stale. It is harmless because
the adapter reads camelCase — **except** for `authored_hints`, `maze` and
`serialized_maze`, which the adapter reads in snake_case. Any new descriptor
row must reproduce that inconsistency, not tidy it.

---

## 2. Music — 45 instances

Stage: a host instructions block reading *"Instructions are shown in the lab
below"*, then the lab — icon rail (Version History / Documentation / Copyright
/ Settings), a side panel, `Finish`, **Workspace** (Blockly + undo/redo),
**Controls** (Run), **Timeline** (48 measures).

The adapter passes the whole properties object through, so the lab reads
served keys directly. Field census over all 45 live levels is in
`author-mode-data-wiring-map.md` §3.2.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Instructions | `longInstructions` | `overrideLevelInstructions` | textarea — panel §Instructions. Show the real text; the placeholder note should say *where* it appears, not stand in for it | **partial** |
| Instructions placement | `levelData.guideMode` | **missing** `updateLevelProperties` (`merge:'levelData'`) | enum select + unset — panel §Instructions, beside the text | **missing** |
| Song / sound library | `levelData.library`, `levelData.packId`, `levelData.sounds` | **missing** `updateLevelProperties` — must be **one group write** | a single song picker writing all three — panel §Sounds. `sounds` is `{[category]: string[]}` whose one key *is* the packId; writing `packId` alone leaves the allowlist keyed to the old pack, and `startSources` references sounds as `packId/soundName`, so a song change silently invalidates the authored starting program. Warn before writing | **missing** |
| Student block palette | `levelData.toolbox.blocks`, `.type` | **missing** `updateLevelProperties` (`merge:'toolbox'`, whole-value replace for `blocks`) | the same two-list chip tray maze uses, per category — panel §Toolbox | **missing** |
| Starting program | `levelData.startSources` | **must stay read-only** | show it; offer "capture from workspace" only once the song-invalidation warning exists | intentionally absent |
| Playhead | `levelData.allowChangeStartingPlayheadPosition` | **missing** `updateLevelProperties` | checkbox — panel §Level | **missing** |
| Title | `title` | `updateLevel` exists and accepts any level | text input — left rail §Level, currently gated `appName === 'maze'` (`LevelRail.tsx:61-64`) | **missing UI, op exists** |
| `validations`, `validationTimeout`, `blockMode`, `toolboxDefinition` | — | — | **do not offer.** None has a reader in `packages/labs/music`; `toolboxDefinition` in particular looks authoritative (10 of 45 levels set it) and is dead — `Driver.ts:768` reads a field nothing assigns | intentionally absent |
| `shortInstructions` | — | already suppressed for music | correct | intentionally absent |

---

## 3. Fish / Oceans — 9 instances

Stage: host instructions block, then the oceans canvas — prompt (*"Is this a
fish?"*), counter + Erase, `Not Fish` / `Fish`, `Continue`, and a guide
overlay.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Instructions | `longInstructions`, `shortInstructions` | `overrideLevelInstructions` | two textareas — panel §Instructions | **shipped** |
| Activity mode | `mode` (+ `appMode`, same source) | **missing** `updateLevelProperties`, written as a **group** | `<select>` — panel §Level. Options derive from `AppMode` in `packages/labs/oceans/src/oceans/constants.ts`, but real data includes `pondlab` which that enum omits, so render an unknown current value rather than normalising it | **missing** |
| Guide overlay copy | `guides` | **missing** `updateLevelProperties` | ordered step list, markdown per step — panel §Guides | **missing** |
| Training prompt / labels | derived from `mode` | — | leave derived | intentionally absent |
| Title | `title` | `updateLevel` (op exists) | left rail §Level, currently gated on maze | **missing UI, op exists** |

Live caveat: all nine fish entries in the running session serve `appMode` but
**no `mode` and no `guides`**, because session snapshots are frozen at import
and never re-derived (`importCourse.ts:61-66`, `AuthoringState.seedCourse`).
The builder emits both keys today. A mode/guides editor must therefore handle
"field absent" as a first-class state, not assume the import populated it.

---

## 4. Generic types — 40 instances, zero click targets

All five share one blocker and one missing op. The blocker: the generic branch
must accept and pass `onSectionClick`. The op:
**`updateGenericLevelData`** — a whole-variant replace of `experience.data`,
validated by the existing `GenericLevelDataSchema`, following Pattern A so it
is revertible. Whole-variant, not field-merge, because `answers`/`pairs`/
`choices`/`pages` need reorder and delete, and a partial patch on a
discriminated union can produce an uninhabitable shape.

An editor must key off `experience.data`, **never** off `levelNumericId`:
eagerly imported generic experiences have no numeric id while lazily attached
ones do, so an id-keyed panel would work for some instances of the same type
and print "Nothing to edit here" for others.

### 4.1 Video (StandaloneVideo) — 25 instances

Stage: a bare YouTube iframe. Nothing else — no instructions block, no header.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| The video | `data.videoKey` → `data.youtubeCode` | **missing** `updateGenericLevelData` | video picker searching the `videos.csv` catalog, previewing inline — panel §Video. Must write `videoKey` **and** `youtubeCode` together: the renderer branches on the code, so writing the key alone appears to do nothing | **missing** |
| Caption / title | `data.displayName`, `experience.title` | `updateContent` / `updateLevel` for the experience title; `updateGenericLevelData` for `displayName` | text input — panel §Level; and render it above the player, which nothing does today | **missing** |
| Framing copy | — no field exists | — | either place a `content` experience beside it, or add a `markdown` key to the video variant | **missing** |

Measured correction to the data map: 24 of the 25 live video experiences **do**
resolve a `youtubeCode`; only one does not
(`lb:Oceans_Video_Elementary_Machine_Learning_2024`, the single lazily
attached video). The mechanism the data map describes is right — the lazy
attach path never reads `videos.csv` — but it affects one instance, not all
25. A video picker is therefore useful today, provided it writes the pair.

### 4.2 Multiple choice (Multi) — 2 instances

Stage: optional lead-in markdown, question, answer buttons, `Check`, inline
verdict.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Lead-in | `data.markdown` | `updateContent` (chat only today) | markdown field — panel §Question | **partial (chat only)** |
| Question | `data.question` | **missing** `updateGenericLevelData` | markdown field — panel §Question | **missing** |
| Answers | `data.answers[].text`, `.correct` | **missing** `updateGenericLevelData` | ordered list: markdown per answer + correct toggle + add/remove/reorder — panel §Answers | **missing** |
| Retry | `data.allowMultipleAttempts` | **missing** same op | checkbox — panel §Answers | **missing** |
| Verdict copy | hard-coded | — | leave hard-coded | intentionally absent |

### 4.3 Matching (Match) — 1 instance

Stage: one radio group per prompt, options drawn from a shuffled shared pool.
In the live level every prompt and option is a bare image.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Lead-in | `data.markdown` | `updateContent` (chat only) | markdown field — panel §Question | **partial (chat only)** |
| Pairs | `data.pairs[].question`, `.answer` | **missing** `updateGenericLevelData` | one table with a markdown editor on each side, add/remove/reorder — panel §Pairs. It is one unit, not N rows: the answer pool is `pairs.map(p => p.answer)`, so editing one answer changes every prompt's option list | **missing** |

### 4.4 Choice grid (BubbleChoice) — 4 instances

Stage: a heading and a list of choice names, each rendering *"Not supported in
this prototype (unresolved)"*.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Heading | `data.displayName` | **missing** `updateGenericLevelData` | text input — panel §Choices | **missing** |
| Choice list | `data.choices[].levelKey`, `.displayName` | **missing** same op | list editor with a Levelbuilder search-attach picker per row and a display-name override — panel §Choices | **missing** |
| Choice content | `data.choices[].data` | resolved at import | resolve so the author sees what a student gets | **broken — frozen-session artifact** (see §7) |

### 4.5 External / markdown — 8 instances

Stage: a fully rendered markdown page, visually identical to a `content`
experience — and with none of its affordances.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Page body | `data.markdown` | **`updateContent` already writes it** (`apply.ts:113-119`) | the same inline title + raw-textarea editor `content` has. Live pages contain hand-written HTML with inline styles; a WYSIWYG would destroy them | **missing UI, op exists** |
| Title | `experience.title` | `updateContent` / `updateLevel` | same editor | **missing UI, op exists** |

The only thing standing between the shipped editor and this type is the
`active.kind === 'content'` gate on the edit bar (`LessonPlayer.tsx:526`).
Cheapest real win in the map.

### 4.6 levelGroup — 0 instances

Renderer exists (`renderers/LevelGroupLevel.tsx`); nothing in the demo catalog
produces one. `data.pages[].levels[].data` is a *copy* resolved at import, not
a live reference, so editing a sub-level means editing the parent's embedded
copy — `updateGenericLevelData`'s whole-variant replace handles that
correctly. No UI work is worth doing until an instance exists.

---

## 5. Widget, content, unsupported

### 5.1 Widget — 5 instances

Stage: a sandboxed `<iframe srcdoc>` (CSP `default-src 'none'`, brand kit
injected) rendering the agent-built activity. It works. Around it: no click
target, no panel, disabled Level tab.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Title | `descriptor.title` | **`updateWidgetMetadata` exists with zero callers** | text input — panel §Widget | **missing UI, op exists** |
| Description (what the model is told it does) | `descriptor.description` | same op | textarea — panel §Widget | **missing UI, op exists** |
| Per-placement input | `experience.defaultInput` | **none** — no op patches it | form generated from `descriptor.inputSchema` — panel §Widget | **missing** |
| Behaviour / source | `widgets/<id>/src/index.tsx` | chat only; a file write plus a watcher, **not** a `CurriculumChange` | leave to chat. A source editor would inherit no history, no revert, and would not mark the course touched for publish | intentionally chat-only |
| Contract (`network`, `visibility`, `eventTypes`, `inputSchema`, `resourceUri`) | descriptor | must stay read-only | display only — these are safety gates | correct |

`updateWidgetMetadata` already exists in the model, the schema, the reducer,
the history label and the tests. Two text fields and a click target is the
entire cost. It should grow a `previous` capture at the same time (three lines
mirroring `capturePreviousInstructions`) so it is revertible.

### 5.2 content — 16 instances

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Title | `experience.title` | `updateContent` (not revertible) | text input — **move to the right panel** per the IA rule; today it is an inline stage editor | **shipped, wrong placement** |
| Body | `experience.markdown` | `updateContent` | keep the raw textarea, add a side-by-side preview | **shipped** |

### 5.3 Unsupported — 66 instances

`Panels` 10, `Dancelab` 16, `Craft` 14, `Artist` 9, `Bounce` 8, `unknown` 9.
All route to one card showing the level type, the level key and one honest
paragraph.

| logical area | reads | write op | recommended control + placement | status |
|---|---|---|---|---|
| Identity | `levelKey`, `levelType` | none | keep read-only | correct |
| **Panels payload** | `data.properties.panels[].text` | none | `UnsupportedLevel` receives `data.properties` and never renders it. A Panels level *is* a markdown slideshow — render it as a pager and author each panel with the content editor | **missing (real content discarded)** |
| Everything else | — | — | keep inert; the author's move is keep / replace / ask the AI to build a widget | correct |

### 5.4 Scaffolding — course, unit, lesson

| target | fields | write op | UI today | status |
|---|---|---|---|---|
| Course | `displayName`, `gradeLevels`, `offeringKey` | **no `updateCourse` op at all** | create + remove only | **missing op** |
| Unit | `displayName`, `overview` | `updateUnit` exists | **none, and no chat tool either** — the op is unreachable | **missing UI** |
| Lesson | `displayName`, `goal`, `durationMinutes`, `overview`, `outline`, `expectedOutcome`, `adaptivePolicy` | `updateLesson` | chat only | **missing UI** |
| Experience order / removal | — | `moveExperience`, `removeExperience` | outline rail | shipped (move is **not** revertible — prior position is not retained) |

The course page shows a unit heading and lesson rows and lets an author do
nothing to any of them: no rename, no reorder, no delete.

---

## 6. Where the two sweeps disagreed

1. **Video placeholders.** The data map states every one of the 25 session
   videos is an unresolved placeholder. The visual sweep rendered working
   `youtube-nocookie` embeds. Settled by re-measuring `/api/state`: 24 of 25
   carry a `youtubeCode`; the single exception is the one lazily attached
   video. The *mechanism* the data map identified is correct and stands; the
   count does not. Consequence: a video picker is worth building, and must
   write `videoKey` and `youtubeCode` as a pair.

2. **Whether the panel is "unreachable" or merely "empty" for generic types.**
   The visual sweep could only observe "no panel appears". The data map names
   the branch (`ExperienceStage.tsx:227-236` passes no `onSectionClick`;
   `LessonPlayer.tsx:239-240` requires a `panelSection`). Code wins: it is
   structurally unreachable, and the fix is a prop, not a new panel section.

3. **Total experience count.** The data map's §9 reports 350; the measured
   figure is 339 (`[.courses[].units[].lessons[].experiences[]] | length` on
   version 314), which is also what the per-type counts in §0 sum to. All
   percentages in this document use 339.

4. **Whether maze's Short instructions field is useful.** The visual sweep saw
   it populated and offered. The data map shows nothing in
   `packages/labs/maze` reads it and `hostRendersInstructions` is false for
   maze, so the fallback never runs. Code wins: it is a field with no
   consumer, and it is saved, so it also pollutes the change log. Remove it
   for maze rather than keep it.

---

## 7. Problem list

Split by whether the problem is in the code or is an artifact of this
particular running session. Session snapshots are frozen at import
(`importCourse.ts:61-66`) and `levelProperties` is never re-derived, so
improvements to the importers do not reach a session created before them.

### 7.1 Real — reproducible from a fresh session

1. **An entire lesson is dead.** All 12 maze levels in Block by Block → "Spot
   the Repeat" (`courseB_iceage_loops1`…`12`) crash with `TypeError: Invalid
   block definition for type: controls_repeat_simplified_dropdown`; the stage
   shows "An error occurred while loading the lab." Ice-age skin assets are
   also 404 (`/skins/scrat/small_static_avatar.png`). These are the only 12
   levels in the catalog using that block type — a missing block definition in
   the ported maze Blockly, not a data fault.

2. **A 404 retry storm on every lesson load.** `GET
   /authoring-api/levels/-1/level_properties` fires repeatedly before any
   level is selected: a numeric id of `-1` is requested for experiences that
   have none. Fills the console; coincided with two lesson loads that hung
   past 60 s.

3. **Multi renders markdown as literal source.** `MultiLevel.tsx:69` puts
   `data.question` in a `<Typography>` and `:89` puts `answer.text` in a plain
   button, so `*Who should use events?*` and `**control when the drum sounds
   play,**` display with their asterisks. Only the lead-in `markdown` goes
   through the renderer.

4. **Match's options are announced as markdown source.** `MatchLevel.tsx:79`
   uses the raw string as the `aria-label`. On the live all-image level a
   screen-reader user hears three near-identical `![](https://images.code.org/…)`
   URLs.

5. **The "Workspace" component has no visible label.** Its `<h2>` measures
   `width: 0` on the maze stage — the header row crowds Blocks + Workspace +
   four buttons into one flex line and the fourth component's name collapses.
   Only its icon button identifies it, which undercuts the whole "click the
   thing you want to edit" model.

6. **Panels content is carried to the client and discarded.**
   `ExperienceStage.tsx:242-246` passes `data.properties` to
   `UnsupportedLevel`, which destructures only `levelKey`/`levelType`/`reason`.
   Several KB of authored panel markdown per level goes nowhere.

7. **Music lab noise leaks into author mode.** The lab's side panel shows "No
   version history found. Have you started your project?" — a student-project
   error surfaced during authoring.

8. **Toolbox chips show raw block type names.** The maze toolbox panel's "In
   the toolbox" list mixes friendly names (`Turn right`, `Get nectar`) with
   raw ids (`maze_move`, `controls_repeat`) for blocks absent from the
   catalog.

9. **Outline rows are not identifiable.** Four distinct failure modes, all
   live: raw `lb:grade2_maze_intro3` ids in Block by Block; one blank row (its
   `title` is the empty string, so the fallback never fires); six consecutive
   `Skill Building` rows in Coding with Music (the imported activity-section
   name, not the level name); `unknown` as the type chip on nine Course D Play
   Lab levels.

10. **The stage is too narrow to judge a lab.** 528 px at a 1920 px viewport,
    with the AI sidebar at 440 px. Music's 48-measure timeline lays out to
    ~2900 px inside a 308 px box and its toolbar collapses to 56 px. The
    author is reviewing a layout no student will see.

11. **The instructions block can render off-stage.** On the music level its
    bounding-box top measured `-13` — clipped above the visible stage.

12. **Student view keeps the author top bar.** The `Changed` chip, `Publish`
    and the AI-tutor toggle stay mounted.

13. **Undo's label can be empty** — `Undo: Edited level ""`.

14. **Several ops do not mark a course touched for publish.**
    `changeTargets` has no case for `updateLevel`, `createLevel`,
    `createWidget`, `updateWidgetMetadata` or `removeCourse`. A session whose
    only change is a level-title edit reports no touched course.

15. **`update_level_instructions` is missing from `CURRICULUM_TOOL_NAMES`.**
    It works only because `guardFileTool` blanket-allows every
    `mcp__curriculum__*` name first. Narrow that guard and chat loses
    instruction editing silently.

16. **`definitionOverride` is stripped by the experience schema.**
    `ExistingLevelExperienceSchema` declares `instructionsOverride` but not
    `definitionOverride`, and `z.object` drops unknown keys. No caller hits
    this today; the first re-attach or duplicate flow will.

17. **Three fields are carried faithfully and dropped at the last hop:**
    `flower_type` (the lab reads `flowerType`, nothing produces it),
    `exemplarSettings` (served top-level, read at `levelData.exemplarSettings`),
    `toolboxDefinition` (read from a field nothing assigns). Each would be
    caught by a descriptor table with an explicit "consumed as" column.

18. **First lab mount can exceed a minute.** Two Block by Block navigations
    stalled on `Loading…` past 60 s and one wedged the browser; the same URLs
    loaded in ~10 s afterwards. Cold Vite chunk compilation — but it is what a
    first-time demo viewer hits.

### 7.2 Frozen-session artifacts — this session only

These looked like renderer bugs in the visual sweep. The data map shows the
builders emit the missing fields today; the running session predates them and
is never re-derived. `repairLevelProperties` exists for exactly this drift but
only repairs entries missing `appName`, so neither case is caught.

- **BubbleChoice renders every choice as "not supported (unresolved)".** All
  four live choice grids carry `choices` with `levelKey` + `displayName` but
  no `data`. `buildCourse.ts:341-345` resolves it now. A fresh import should
  render the choices; verify before treating this as a renderer bug.

- **Fish levels serve no `mode` and no `guides`.** All nine, measured. The
  adapter reads `props.mode`, so every oceans level currently mounts with
  `appMode: undefined`. `levelProperties.ts:42-45` emits both today.

- **Oceans renders its guide text twice.** Two siblings with identical copy
  and identical bounding boxes. Plausibly a consequence of the `guides`
  absence above rather than an independent bug — re-check on a fresh session
  before chasing it.

---

## 8. Prioritized build list

Sizes are rough, in serial Sonnet passes on this codebase, and assume the
per-change verification gates (typecheck, unit tests, lint) each time.

### Tier 0 — the demo is broken without these (not authoring tools)

| # | work | size | why first |
|---|---|---|---|
| 0.1 | Register `controls_repeat_simplified_dropdown` (and ship the ice-age skin assets) | 1 pass | 12 levels — a whole Block by Block lesson — are dead |
| 0.2 | Stop requesting `level_properties` for id `-1` | 0.5 pass | console noise on every lesson load; suspected contributor to the 60 s hangs |
| 0.3 | Re-import or repair the session so bubbleChoice `data` and fish `mode`/`guides` are present | 0.5 pass | three of the sweep's worst-looking defects are this one cause |

### Tier 1 — highest authoring value per pass

| # | work | unblocks | size |
|---|---|---|---|
| 1.1 | **Generic + widget click targets.** Pass `onSectionClick` from the generic branch and `WidgetExperienceView`; let `showPropertiesPanel` open on a data-typed section | 45 experiences move from "no panel possible" to "panel reachable" — precondition for every item below | 1 pass |
| 1.2 | **External markdown editor.** Widen the edit bar's `kind === 'content'` gate so an `existingLevel` with `data.type === 'markdown'` gets the same editor | 8 experiences; **no new op, no new UI** | 0.5 pass |
| 1.3 | **Level-agnostic title field.** Move `LevelRail`'s `TitleField` out from behind `appName === 'maze'` | title editing for music (45), fish (9) and every generic type (40); `updateLevel` already accepts them | 0.5 pass |
| 1.4 | **Wire `updateWidgetMetadata`** + a widget panel section (title, description), plus a `previous` capture so it is revertible | 5 widgets; the op, schema, reducer and history label all already exist | 1 pass |

Tier 1 totals ~3 passes and takes the "no authoring surface at all"
population from 111 experiences to 66 (the correctly-inert unsupported ones).

### Tier 2 — the missing ops

| # | work | unblocks | size |
|---|---|---|---|
| 2.1 | **`updateGenericLevelData`** — Pattern A, whole-variant replace, validated by the existing `GenericLevelDataSchema`; server capture from `experience.data`; one `buildRevertChangeBody` case | multi, match, video, bubbleChoice, levelGroup | 1.5 passes |
| 2.2 | Panel sections on top of 2.1: **Multi** (question + answer list + retry), **Match** (pair table), **Video** (picker writing `videoKey`+`youtubeCode`), **BubbleChoice** (heading + choice list) | 32 experiences | 1 pass each, 4 total |
| 2.3 | **`updateLevelProperties`** — three explicit shallow levels (`properties` / `levelData` / `toolbox`), descriptor-gated zod (a bare `Record<string, unknown>` reaching a merge is an arbitrary-write primitive), `null`-means-delete and a pre-capture normalisation hook, both modelled on `overrideLevelDefinition` rather than `overrideLevelInstructions` | music + fish | 2 passes |
| 2.4 | Panel sections on top of 2.3: **Fish** mode (group write with `appMode`) + guides list; **Music** song picker (group write of `library`+`packId`+`sounds`, with the `startSources` invalidation warning) + toolbox tray + `guideMode` + playhead | 54 experiences | 1 pass each, 4 total |

### Tier 3 — completing what is shipped

| # | work | size |
|---|---|---|
| 3.1 | Maze: hints editor (`authored_hints`) | 1 pass |
| 3.2 | Maze: grid-size steppers and per-cell payload inspector (adds `initial_dirt`/`final_dirt` to `LevelDefinitionPatch`) | 1.5 passes |
| 3.3 | Maze: drop `shortInstructions` from the panel; friendly names for unknown toolbox block ids; reorder in the toolbox tray | 1 pass |
| 3.4 | Render Panels as a markdown pager and let the content editor author each panel | 1 pass |
| 3.5 | Markdown preview beside every markdown textarea; move the content title into the panel | 1 pass |
| 3.6 | Scaffolding: `updateCourse` op + course/unit/lesson rename UI on the course page | 2 passes |

### Tier 4 — polish and correctness debt

Outline row titles (§7.1 #9), the collapsed Workspace label (#5), student view
hiding the author top bar (#12), the Multi/Match markdown-rendering bugs
(#3, #4), the empty undo label (#13), `changeTargets` gaps (#14), the tool
allowlist (#15), the `definitionOverride` schema omission (#16), and a
descriptor table with a "consumed as" column plus one test per row to catch the
`flower_type` / `exemplarSettings` / `toolboxDefinition` class (#17). Roughly
4 passes, individually small, each independently landable.

### The one-line answer

If only three things get built: **the generic/widget click target**, the
**External markdown editor**, and the **level-agnostic title field**. Together
they are about three passes, add no new op, and take the share of experiences
with some manual authoring surface from 67 % (228 of 339) to 81 % (273).
