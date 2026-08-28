# Author Mode: data wiring map

For every experience type the prototype can render: which fields flow from
source to screen, what reads each one, and what write path exists today.

Status: analysis only, on branch `ngfp/author-mode-staging` (tip
8ed71504859). No code written. Paths are relative to `frontend/` unless they
start with `dashboard/`. Every line number was read out of this worktree;
every count was measured against the running session
(`http://localhost:3752/api/state`, read-only) or against
`dashboard/config/levels/`.

Companion documents:

- `author-mode-properties-panel.md` — the feasibility probe this extends.
  Where the two disagree, this one is current: the panel has since been built
  (`PropertiesPanel.tsx`, 554 lines) and `overrideLevelDefinition` now exists.
  Section 8 lists the probe's claims that no longer hold.
- `author-mode.md` — the domain-model contract `packages/authoring/src/model/types.ts`
  is transcribed from.

---

## 0. Summary

Per type, "editable surface" means: of the fields the renderer or the mounted
lab actually reads off the served payload, how many can an author change.

| type | fields consumed | manual UI | chat (agent tool) | neither |
|---|---|---|---|---|
| maze / Karel | 12 | 9 (75%) | 8 (draft levels only) | 3 |
| fish / Oceans | 5 | 2 (40%) | 2 | 3 |
| music | 9 | 1 (11%) | 1 | 8 |
| multi | 6 | 0 | 2 | 4 |
| match | 4 | 0 | 2 | 2 |
| markdown (External) | 2 | 0 | 2 | 0 |
| video | 4 | 0 | 1 | 3 |
| levelGroup | 3+nested | 0 | 1 | rest |
| bubbleChoice | 4+nested | 0 | 1 | rest |
| opaque / unsupported | 2 | 0 | 0 | 2 |
| widget | 6 | 0 | 1 (source) | 5 |
| content | 2 | 2 (100%) | 2 | 0 |

Two write-op patterns exist (§1). Nine field groups need a write path that
does not exist; two new ops cover all of them (§7).

---

## 1. The write vocabulary

### 1.1 Op inventory

Every mutation is one `CurriculumChange` appended to the log
(`packages/authoring/src/model/changes.ts:49-120`). The client posts a body
to `POST /api/changes` (`apps/authoring-service/src/server.ts:273`), validated
by `CurriculumChangeBodySchema`
(`apps/authoring-service/src/authoring/changeSchema.ts:205-289`), applied by
the pure reducer `applyChange` (`packages/authoring/src/model/apply.ts:146-353`),
then folded into the served `levelProperties` by
`AuthoringState.applyCurriculumChange`
(`apps/authoring-service/src/state/AuthoringState.ts:92-191`).

| op | what it patches | `previous` captured? | revertible? | manual UI | agent tool |
|---|---|---|---|---|---|
| `createCourse` | new `CourseModel` | no | no | `routes/author/index.tsx:54` | `create_course` |
| `removeCourse` | drops a course | no | no | `RemoveCourseButton.tsx:40` | — |
| `createUnit` | new `Unit` | no | no | `routes/author/$courseId/index.tsx:138` | `create_unit` |
| `createLesson` | new `Lesson` | no | no | `routes/author/$courseId/index.tsx:88` | `create_lesson` |
| `updateUnit` | `Partial<UnitStub>` (`displayName`, `overview`, `origin`, `id`) | no | **no** | — | — |
| `updateLesson` | `LessonPatch` (7 fields, `apply.ts:201-205`) | no | **no** | — | `update_lesson`, `set_adaptive_policy` |
| `insertExperience` | whole `Experience` at position | n/a | yes (→`removeExperience`) | `InsertPoint.tsx:81` | `insert_content`, `create_widget` |
| `removeExperience` | drops one experience | no | no | `OutlineRail.tsx:64` | `remove_experience` |
| `moveExperience` | position / lesson | no | **no** (prior position not retained) | `OutlineRail.tsx:61` | `move_experience` |
| `updateContent` | `ContentPatch{title, markdown}` | no | **no** | `LessonPlayer.tsx:552` (content-kind only) | `update_content` |
| `attachExistingLevel` | resolves `levelKey`, inserts | n/a | yes (→`removeExperience`) | `InsertPoint.tsx:102` | `attach_existing_level` |
| `createWidget` | `WidgetDescriptor` | no | no | — | `create_widget` |
| `updateWidgetMetadata` | `Partial<WidgetDescriptor>` | no | no | **none** | **none** |
| `createLevel` | whole `ExistingLevelExperience` | n/a | yes (→`removeExperience`) | — | `create_level` |
| `updateLevel` | `LevelPatch` = `{title}` only | no | **no** | `LevelRail.tsx:246` (maze-only tab) | `update_level` (title arg) |
| `overrideLevelInstructions` | `InstructionsPatch{short,long}` | **yes** | **yes** | `PropertiesPanel.tsx:196` | `update_level_instructions` |
| `overrideLevelDefinition` | `LevelDefinitionPatch` (8 keys) | **yes** | **yes** | `levelDraft.ts:288` | — |

`updateWidgetMetadata` has **zero production callers**. It exists in the
model (`changes.ts:83-86`), the schema (`changeSchema.ts:263-267`), the
reducer (`apply.ts:291-299`), the change-history label
(`changeHistory.ts:260`) and tests — and nowhere else. Widget title and
description are read-only in practice.

### 1.2 Pattern A — `previous`-capturing override

The only pattern that yields exact revert. Two ops use it.

1. Client posts `{op, experienceId, patch}`. The schema does **not** accept a
   `previous` field (`changeSchema.ts:279-288`), so it can never be
   client-supplied.
2. Server captures `previous` from the **served** `levelProperties` entry,
   before the merge, reading only the keys the patch mentions
   (`AuthoringState.ts:108-129`). Capturing from `levelProperties` rather
   than from `experience.instructionsOverride` is deliberate: the override
   holds only the delta, while the served entry always holds the value
   currently on display, imported original or prior override alike
   (`AuthoringState.ts:308-312`).
3. `applyChange` merges the patch into `experience.instructionsOverride` /
   `experience.definitionOverride` (`apply.ts:321-351`).
4. The same version bump folds the patch onto the served
   `levelProperties[numericId]` — `mergeInstructionsOverride` is a shallow
   spread (`AuthoringState.ts:336-351`); `mergeDefinitionOverride` treats
   `null` as "delete this key" (`AuthoringState.ts:421-441`), so a field the
   level never had reverts to absent rather than `''`.
5. `buildRevertChangeBody` re-posts the same op with `change.previous` as the
   patch (`revert.ts:51-66`).

Two extras `overrideLevelDefinition` carries and `overrideLevelInstructions`
does not:

- **Staleness rule.** `withSolutionStalenessRule`
  (`AuthoringState.ts:374-393`) runs *before* the capture. A patch touching
  `serialized_maze`/`maze`/`toolboxBlocksXml`/`startDirection`
  (`SOLUTION_STALENESS_TRIGGERS`, `:367-372`) on a level that already has a
  stored `solutionBlocksXml`, and not itself supplying `solutionVerified`,
  gets `solutionVerified: 'false'` forced server-side. `ideal` and
  `startBlocksXml` are excluded — the first is display-only, the second is
  the learner's starting arrangement, not an input to the author's proof.
- **Draft-level flag.** `markDraftLevelVisuallyEdited`
  (`AuthoringState.ts:451-470`) sets `visuallyEdited` on a `draft:` level's
  on-disk `MazeLevelDefinition`, which makes the agent's `update_level` tool
  refuse (`ClaudeAgentRunner.ts:706-710`) rather than clobber the visual
  edit.

### 1.3 Pattern B — plain patch, no capture

`updateUnit`, `updateLesson`, `updateContent`, `updateLevel`,
`updateWidgetMetadata`. A `Partial<>` spread onto the target node
(`apply.ts:195-205`, `:268-276`, `:291-299`, `:311-319`). No `previous`, so
`buildRevertChangeBody` returns `undefined` for all five (`revert.ts:67-68`),
and `ChangeHistory` offers no Revert control. These are **editable but not
revertible**.

`updateContent` is the only one of the five that reaches *inside* a level's
payload: `applyContentPatch` (`apply.ts:100-122`) sets `title` on any
experience kind, and sets `markdown` on `experience.data` when the data
variant has a `markdown` key — which is true for `multi`, `match` and
`markdown`, false for `video`, `levelGroup`, `bubbleChoice` and `opaque`
(`types.ts:131-161`). A patch field that does not apply is a silent no-op,
not an error (`apply.ts:120`).

---

## 2. Generic renderers

No lab. `ExperienceStage` dispatches `experience.data` to one of six
components (`ExperienceStage.tsx:534-561`), inside a `.contentCard`
(`:227-236`). The union is closed and the prototype defines it itself
(`packages/authoring/src/model/types.ts:131-161`), mirrored exactly by
`GenericLevelDataSchema` (`changeSchema.ts:86-135`).

**No generic experience has any click target.** `onSectionClick` is passed
only to `LabHostStage` and `LevelInstructions`
(`ExperienceStage.tsx:396-405`, `:210-211`); the generic branch
(`:227-236`) passes nothing. `showPropertiesPanel` additionally requires a
`panelSection` (`LessonPlayer.tsx:239-240`), which nothing can set here. So
the properties panel is unreachable for every type in this section, even
though `PropertiesPanel`'s instructions section would function if it were
opened (many generic experiences do carry a `levelNumericId` — see §2.8).

### 2.1 multi (`Multi`)

Renderer: `renderers/MultiLevel.tsx`.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `question` | `buildCourse.ts:324` ← `dslLevel.ts:120-147` (`question '…'`) | `MultiLevel.tsx:69` (`<Typography variant="h5">`) | **NONE** | — |
| `answers[].text` | `buildCourse.ts:325` ← `dslLevel.ts:123-129` (`right`/`wrong`) | `MultiLevel.tsx:89` | **NONE** | — |
| `answers[].correct` | same (`right`→true, `wrong`→false) | `MultiLevel.tsx:34-41` (grading), `:74`, `:90` | **NONE** | — |
| `allowMultipleAttempts` | `buildCourse.ts:326` ← `dslLevel.ts:130-133` | `MultiLevel.tsx:43` (lock), `:114` (retry copy) | **NONE** | — |
| `markdown` | `buildCourse.ts:327` ← `dslLevel.ts:134` (heredoc) | `MultiLevel.tsx:68` | `updateContent` (`apply.ts:113-119`) | no |
| `title` (experience) | `buildCourse.ts:261` (`display_name`/`title`, else humanized `:72-86`) | `OutlineRail`, progress-dot label (`LessonPlayer.tsx:684`) | `updateContent`/`updateLevel` | no |

Missing-op sketch: a whole-`data` replace. `answers` is an ordered array
with per-item correctness — a field-merge cannot express reorder or delete.
See §7.1.

### 2.2 match (`Match`)

Renderer: `renderers/MatchLevel.tsx`.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `pairs[].question` | `buildCourse.ts:330` ← `dslLevel.ts:149-172` | `MatchLevel.tsx:76` (Markdown), `:79` (`aria-label`) | **NONE** | — |
| `pairs[].answer` | same | `MatchLevel.tsx:44` (answer pool), `:52` (grading), `:92` | **NONE** | — |
| `markdown` | `buildCourse.ts:330` | `MatchLevel.tsx:65` | `updateContent` | no |
| `title` | `buildCourse.ts:261` | outline only | `updateContent`/`updateLevel` | no |

The answer pool is `shuffled(pairs.map(p => p.answer))`
(`MatchLevel.tsx:44`), so every answer is an option for every prompt. Editing
one pair's answer changes every prompt's option list: `pairs` is a single
unit, not six independent fields.

Live example (`lb:coding-with-music-seq-cfu-standalone`): all three pairs are
bare image markdown (`![](https://images.code.org/…)`), question and answer
alike. Any pair editor has to be a markdown editor, not a text input.

### 2.3 markdown (`External`)

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `markdown` | `buildCourse.ts:332` ← `dslLevel.ts:174-181` | `ExperienceStage.tsx:543` (`<Markdown>`) | `updateContent` (chat only) | no |
| `title` | `buildCourse.ts:261` | outline only | `updateContent` | no |

The one generic type that is fully writable today — and only from chat. The
manual edit bar is gated on `active.kind === 'content'`
(`LessonPlayer.tsx:526`), and an imported External page is
`kind: 'existingLevel'`, so the pencil never appears even though the op
behind it would work verbatim.

Live example `lb:music-coding-intro-review_standalone` is 4 KB of raw HTML
with inline styles inside the markdown — a plain `<textarea>` is the right
editor, and a WYSIWYG would destroy it.

### 2.4 video (`StandaloneVideo`)

Renderer: `renderers/VideoLevel.tsx`.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `videoKey` | eager: `buildCourse.ts:292,304`; lazy: `levelCatalog.ts:403-407` | `VideoLevel.tsx:22` (placeholder), `:31` (iframe title fallback) | **NONE** | — |
| `youtubeCode` | eager only: `buildCourse.ts:298` via `parseVideosCsv` (`:414-435`) | `VideoLevel.tsx:16` (branch), `:30` (embed src) | **NONE** | — |
| `displayName` | eager: `buildCourse.ts:306` (`display_name`); lazy: never | `VideoLevel.tsx:19`, `:31` | **NONE** | — |
| `title` | `buildCourse.ts:187-189` | outline only | `updateContent`/`updateLevel` | no |

**Asymmetry, verified live.** The lazy attach path
(`levelCatalog.ts:402-408`) constructs `{type:'video', videoKey}` and never
looks up `videos.csv`, so a video the agent attached has no `youtubeCode`
and no `displayName` and always renders the placeholder. Every one of the 25
video experiences in the running session is in that state — e.g.
`lb:Oceans_Video_Elementary_Machine_Learning_2024` serves
`{"type":"video","videoKey":"elementary_machine_learning"}` and nothing else.

### 2.5 levelGroup (`LevelGroup`)

Renderer: `renderers/LevelGroupLevel.tsx`.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `title` | `buildCourse.ts:350` ← `dslLevel.ts:214` | `LevelGroupLevel.tsx:31` | **NONE** (this is `data.title`, not `experience.title`) | — |
| `pages[]` | `buildCourse.ts:351-356` ← `dslLevel.ts:194-215` (`page` markers) | `LevelGroupLevel.tsx:32`, `:65-73` (pager) | **NONE** | — |
| `pages[].levels[].levelKey` | `buildCourse.ts:352-355` | `LevelGroupLevel.tsx:38,44,48` (React key + fallback label) | **NONE** | — |
| `pages[].levels[].data` | `buildGenericData` (`buildCourse.ts:373-391`) | `LevelGroupLevel.tsx:33-53` — only `multi` and `markdown` render; anything else is a one-line label | **NONE** | — |

Self-referential (`GenericLevelData` inside `GenericLevelData`,
`types.ts:151-155`; `z.lazy` at `changeSchema.ts:86`). A sub-level's data is
a *copy* resolved at import time, not a live reference to the sub-level's own
experience — `buildGenericData` deliberately assigns no numeric id and
registers no `levelProperties` (`buildCourse.ts:363-372`). Editing a
sub-level therefore means editing the parent's embedded copy; there is no
other handle on it.

Zero levelGroup experiences exist in the running session, so this renderer is
currently unexercised.

### 2.6 bubbleChoice (`BubbleChoice`)

Renderer: `renderers/BubbleChoiceLevel.tsx`.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `displayName` | `buildCourse.ts:336` ← `dslLevel.ts:183-192` | `BubbleChoiceLevel.tsx:26-28` | **NONE** | — |
| `choices[].levelKey` | `buildCourse.ts:342` | `:31` (key), `:33` (label fallback), `:43` | **NONE** | — |
| `choices[].displayName` | `peekDisplayName` (`buildCourse.ts:393-410`) | `:33` | **NONE** | — |
| `choices[].data` | `buildGenericData` (`:344`) | `:35-45` — video plays inline, everything else is an honest "not supported" line | **NONE** | — |

**Live-data note.** All four bubbleChoice experiences in the session have
`choices` entries with `levelKey` + `displayName` but **no `data`** — they
were resolved by an older projection and the session snapshot is never
re-imported (§8.1). `BubbleChoiceLevel.tsx:35-45` uses `choice.data?.` for
exactly this reason and renders "not supported (unresolved)". The doc comment
at `:18-21` predicted it; the running session confirms it.

### 2.7 opaque → `UnsupportedLevel`

| field | produced at | consumed by | write op today |
|---|---|---|---|
| `levelKey` | `buildCourse.ts:246`/`levelCatalog.ts:161` | `UnsupportedLevel.tsx:26` | **NONE** (identity) |
| `levelType` | `buildCourse.ts:250`/`levelCatalog.ts:162` | `UnsupportedLevel.tsx:25` | **NONE** (identity) |
| `data.properties` | `buildCourse.ts:312`/`levelCatalog.ts:420` | passed in (`ExperienceStage.tsx:242-246`) but **never rendered** — `UnsupportedLevel` destructures only `levelKey`/`levelType`/`reason` (`:18-22`) | n/a |
| `reason` | `ExperienceStage.tsx:200`, `:334` | `UnsupportedLevel.tsx:29` | n/a |

66 of 318 level experiences in the session are unsupported: `Panels` 10,
`Dancelab` 16, `Craft` 14, `Artist` 9, `Bounce` 8, `unknown` 9. Correctly
inert — these are identity placeholders, not editable content. The
`properties` prop is dead weight (the `Panels` payload alone carries several
KB of authored panel markdown that nothing displays).

### 2.8 The numeric-id quirk

`buildCourse` assigns `levelNumericId` only on the Fish/Music/Maze branch
(`:213`, `:239`), but `levelCatalog.resolveLevel` assigns one to **every**
lazily attached level regardless of runtime (`levelCatalog.ts:156-165`) and
registers a passthrough properties entry (`:323-331`). So a generic
experience attached by search carries a numeric id and a served entry, while
the same type imported eagerly does not. Live proof:
`lb:Oceans_Video_Elementary_Machine_Learning_2024` has
`levelNumericId: 9000007` with `runtime: 'generic'`.

Consequence: if a generic experience ever gained a click target, its
instructions section would work for attached ones and print "Nothing to edit
here" (`PropertiesPanel.tsx:99-100`) for imported ones. Any generic-data
editor must key off `experience.data`, never off `levelNumericId`.

---

## 3. Labhost labs

`ExperienceStage.LabHostStage` (`:258-426`) fetches
`useLevelProperties(levelNumericId)` (`hooks.ts:78-83` → `GET
/api/levels/:id/level_properties`, `server.ts:158`) and dispatches on
`appName` (`:324`).

Three host-level switches decide what an author can click:

```
selfDisplayedByLab     = appName === 'music'   (ExperienceStage.tsx:358)
hostRendersInstructions = appName !== 'maze'   (:359)
levelEditable          = authorMode && appName === 'maze'  (:368)
```

So: maze gets four click targets (the lab's own bubble, play area, Blocks
header, Workspace header — threaded in via `editing`, `:375-392`); fish and
music get one (the host's `LevelInstructions` pencil, `:396-405` →
`LevelInstructions.tsx:80-87`); music's shows a placeholder note instead of
the text, because the lab already displays it (`LevelInstructions.tsx:96-101`).

### 3.1 fish / Oceans

Builder: `buildFishLevelProperties` (`levelProperties.ts:31-57`), 16 keys.
Adapter: `apps/studio/src/modules/labs/oceans/index.tsx`.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `longInstructions` | `levelProperties.ts:54` ← `long_instructions` | `LevelInstructions.tsx:50-54` (host block) | `overrideLevelInstructions` — `PropertiesPanel.tsx:196` | **yes** |
| `shortInstructions` | `levelProperties.ts:55` | `LevelInstructions.tsx:52` (fallback only, when long is empty) | `overrideLevelInstructions` (field shown: `PropertiesPanel.tsx:174-175`, `:219-226`) | **yes** |
| `mode` | `levelProperties.ts:43` ← `properties.mode` | `oceans/index.tsx:26-29` → `OceansLab appMode` | **NONE** | — |
| `appMode` | `levelProperties.ts:42` (same source) | nothing in this tree reads it; kept "for whatever else expects it" (`:41-43`) | **NONE** | — |
| `guides` | `levelProperties.ts:45` | `oceans/index.tsx:30` → `OceansLab guides` | **NONE** | — |
| `offerBrowserTts` | `levelProperties.ts:50` via `offerBrowserTtsFrom` (`:24-29`) | nothing | — | — |
| the other 10 constants | `levelProperties.ts:36-53` | nothing | — | — |
| `title` (experience) | `buildCourse.ts:187-189` | outline, progress dots | `updateLevel` — but the UI is in LevelRail's Level tab, gated `appName === 'maze'` (`LevelRail.tsx:61-64`) | no |

Ground truth for the shape: `dashboard/config/levels/custom/fish/Oceans_FishVTrash_2024.level`
carries exactly `mode`, `guides`, `background`, `parent_level_id`,
`name_suffix`.

**Live trap.** All nine fish entries in the running session serve `appMode`
but **no `mode` and no `guides`** — measured by fetching each
`/api/levels/<id>/level_properties`. The adapter reads `props.mode`
(`oceans/index.tsx:27`), so every fish level currently mounts with
`appMode: undefined` and `guides: undefined`. The builder emits both keys
today (`levelProperties.ts:42-45`); the session snapshot predates that and is
never re-derived (§8.1).

Missing-op sketch for `mode`: a `updateLevelProperties` shallow merge onto
the entry, writing `mode` **and** `appMode` together — the builder sets both
from one source, so a single-key write would desynchronise them. Option list
is derivable from `AppMode` in `packages/labs/oceans/src/oceans/constants.ts`;
real data includes `pondlab`, which that enum omits, so the editor must render
an unknown current value rather than normalise it.

### 3.2 music

Builder: `buildMusicLevelProperties` (`levelProperties.ts:67-105`), 25 keys.
Adapter: `apps/studio/src/modules/labs/music/index.tsx:17-32` — passes the
whole properties object straight through, so the lab reads served keys
directly.

Live census over all 45 music levels in the session (each
`levelData` key, counted from the served entries):

| `levelData` key | levels | read at |
|---|---|---|
| `toolbox` | 44 | `Driver.ts:115`, `MusicLab/index.tsx:210` |
| `startSources` | 42 | `MusicLab/index.tsx:125` |
| `library` | 38 | `MusicLab/index.tsx:175` |
| `packId` | 32 | `Driver.ts:155`, `MusicLab/index.tsx:115,138,200` |
| `sounds` | 31 | `Driver.ts:155` |
| `validationTimeout` | 22 | **no reader** |
| `toolboxDefinition` | 10 | **no reader** — §8.11 |
| `allowChangeStartingPlayheadPosition` | 3 | `MusicLab/index.tsx:376` |
| `Control` / `Play` (stray dupes) | 2 / 2 | no reader |
| `blocks` (legacy) | 1 | no reader |
| `guideMode` | **0** | `MusicLab/index.tsx:88` |
| `blockMode` | **0** | **no reader** — `Driver.ts:119` hardcodes `BlockMode.SIMPLE2`, `MusicLab/index.tsx:210` passes it literally |
| `showSoundFilters` | **0** | — |

Inside `toolbox`: `blocks` 44, `type` 35, `addFunctionCalls` 14,
`addFunctionDefinition` 6, `addFunctionCallsSortByPosition` 1.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `longInstructions` | `levelProperties.ts:82` | music-lab renders it itself; host shows a placeholder note (`LevelInstructions.tsx:96-99`) | `overrideLevelInstructions` — `PropertiesPanel.tsx:196` | **yes** |
| `shortInstructions` | `levelProperties.ts:83` | nothing | hidden by `SHORT_INSTRUCTIONS_RELEVANT_BY_APP_NAME` (`PropertiesPanel.tsx:21-23,174-175`) | n/a |
| `levelData.packId` | `levelProperties.ts:80` (whole `level_data` passthrough) | `Driver.ts:155-157`, `MusicLab/index.tsx:115,138,200` | **NONE** | — |
| `levelData.sounds` | same | `Driver.ts:155-156` (`setAllowedSounds`) | **NONE** | — |
| `levelData.library` | same | `MusicLab/index.tsx:175` | **NONE** | — |
| `levelData.toolbox.blocks` | same | `Driver.ts:115`, `MusicLab/index.tsx:210` | **NONE** | — |
| `levelData.toolbox.type` | same | `Driver.ts:115` | **NONE** | — |
| `levelData.toolboxDefinition` | same | **nothing** — `Driver.ts:768` reads `this.toolboxDefinition`, which is never assigned (§8.11) | **NONE** | — |
| `levelData.startSources` | same | `MusicLab/index.tsx:125` | **NONE** (must stay read-only) | — |
| `levelData.guideMode` | same | `MusicLab/index.tsx:88` | **NONE** | — |
| `levelData.allowChangeStartingPlayheadPosition` | same | `MusicLab/index.tsx:376` | **NONE** | — |
| `validations` | `levelProperties.ts:102` | **no reader in `packages/labs/`** — see §8.4 | **NONE** | — |
| `exemplarSettings` | `levelProperties.ts:103` (top level) | `MusicLab/index.tsx:271` reads `levelData.exemplarSettings` — **wrong path**, §8.3 | **NONE** | — |
| `title` | `buildCourse.ts:187-189` | outline | `updateLevel` (no UI for music) | no |

**Per-field write recommendation.**

| field | mechanism | why |
|---|---|---|
| `packId` + `sounds` | one group write, `updateLevelProperties` with `merge:'levelData'` | `sounds` is `{[category]: string[]}` whose single key *is* the packId; changing one alone leaves the allowlist keyed to the old pack, and `Driver.ts:155-157` applies both together |
| `library` | same group (it invalidates `packId`'s option list) | valid packs are only knowable after fetching `music-library-<library>.json` |
| `toolbox.blocks` | whole-value replace under `merge:'toolbox'` | per-category allowlist; a deep merge cannot express "remove a block" |
| `toolbox.type` | scalar, `merge:'toolbox'` | independent |
| `guideMode` | scalar enum + unset, `merge:'levelData'` | independent; decides where the author's markdown appears (`MusicLab/index.tsx:88`) — belongs beside the instructions editor |
| `allowChangeStartingPlayheadPosition` | boolean, `merge:'levelData'` | independent |
| `toolboxDefinition` | **do not offer** | 10 of 45 levels set it and nothing reads it (§8.11). The probe's "hide the block editor when this is set" rule is currently unnecessary — but reinstate both the rule and the editor gate if `Driver.toolboxDefinition` is ever wired up |
| `startSources` | **read-only** | a Blockly workspace serialization on 42 of 45 levels, and it references sounds as `packId/soundName` — changing the song silently invalidates the authored starting program |
| `validations` | **read-only** | inert in this prototype (§8.4); writing it would be authoring against a runtime that is not mounted |
| `blockMode` | **do not offer** | zero levels set it and the lab hardcodes `SIMPLE2` |
| `validationTimeout` | **do not offer** | 22 levels set it; no reader |

### 3.3 maze / Karel

Builder: `buildMazeLevelProperties` (`levelProperties.ts:118-148`) — spreads
every raw snake_case property first, then adds camelCase duplicates and the
extracted Blockly XML. Adapter: `apps/studio/src/modules/labs/maze/index.tsx:57-77`
is the exhaustive list of what is read.

This is the only type with a real editor. Its write path is `useLevelDraft`
(`levelDraft.ts:134-372`) accumulating one `LevelDraftPatch` (`:26-38`) that
Save posts as a single `overrideLevelDefinition` (`:287-291`), then
invalidates the query and runs `checkLevel` (`:292-311`).

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `maze` (grid JSON) | `levelProperties.ts:125` (raw spread) | `maze/index.tsx:74` → `map`; `PropertiesPanel.tsx:328` (grid-size readout) | `overrideLevelDefinition` — stage paint → `LessonPlayer.tsx:573` → `levelDraft.ts:208-212` | **yes** |
| `serialized_maze` | raw spread | `maze/index.tsx:75` → `serializedMaze` | same paint patch (written as a pair) | **yes** |
| `startDirection` | `levelProperties.ts:142` ← `start_direction` | `maze/index.tsx:71` | `overrideLevelDefinition` — `PropertiesPanel.tsx:339-350` | **yes** |
| `toolboxBlocksXml` | `levelProperties.ts:144` (from `<toolbox_blocks>`) | `maze/index.tsx:65-68` → `toolboxBlocks` | `overrideLevelDefinition` — chip tray, `PropertiesPanel.tsx:416-451` → `levelDraft.ts:263-277` | **yes** |
| `startBlocksXml` | `levelProperties.ts:143` | `maze/index.tsx:59-64` → `startBlocks` | `overrideLevelDefinition` — Workspace "Student start" capture, `levelDraft.ts:220-229` | **yes** |
| `solutionBlocksXml` | `levelProperties.ts:145` | `maze/index.tsx:69` | `overrideLevelDefinition` — **only** by accepting a passing-run offer (`levelDraft.ts:250-261`); a bare canvas capture never enters the draft (`:214-219`) | **yes** |
| `solutionVerified` | not produced by the importer; only ever written by an override | `levelDraft.ts:181-182`; status line `PropertiesPanel.tsx:516-522`, `LevelRail.tsx:170-176` | `overrideLevelDefinition`, `'true'` client-set only; `'false'` forced server-side (`AuthoringState.ts:374-393`) | **yes** |
| `ideal` | `levelProperties.ts:141` | `maze/index.tsx:72` | `overrideLevelDefinition` — `LevelRail.tsx:177-186` | **yes** |
| `longInstructions` | `levelProperties.ts:138` | maze-lab's own bubble (host skips `LevelInstructions`, `ExperienceStage.tsx:359`) | `overrideLevelInstructions` via the lab's bubble click → `PropertiesPanel.tsx:196` | **yes** |
| `shortInstructions` | `levelProperties.ts:139` | nothing | offered anyway (`PropertiesPanel.tsx:174-175` only suppresses it for music) — §8.5 | yes, but pointless |
| `title` | `buildCourse.ts:187-189` | outline | `updateLevel` — `LevelRail.tsx:234-274` | **no** |
| `skin` | `levelProperties.ts:140` | maze-lab dispatch; `PropertiesPanel.tsx:380-383` shows it as a read-only fact | **NONE** | — |
| `recommendedBlocksXml` | `levelProperties.ts:146` | `maze/index.tsx:70` | **NONE** | — |
| `authored_hints` | raw spread (snake_case) | `maze/index.tsx:73` → `authoredHints` | **NONE** | — |
| `flower_type` | raw spread | `Bee.ts:40` reads `level.flowerType` — **nothing produces the camelCase name** | **NONE**, and inert (§8.2) | — |
| ~20 legacy properties (`step_mode`, `is_k1`, `use_contract_editor`, `examples_*`, `definition_*`, `contract_*`, `disable_*`, `callout_json`, …) | raw spread (`levelProperties.ts:125`) | nothing in `packages/labs/maze` | — | — |

Live shape of an imported maze entry (`9000058`, `grade2_maze_intro2`): 21
raw snake_case keys plus 15 builder keys, with `start_direction` **and**
`startDirection` both `"1"`, `short_instructions` **and** `shortInstructions`
both present, `maze` present, `serialized_maze` absent. See §8.6 for why the
duplication is a trap.

A draft maze level (`9000108`) carries a much smaller raw set — `maze`,
`skin`, `short_instructions`, `long_instructions`, `start_direction`, `ideal`
— because it is built from a typed `MazeLevelDefinition`
(`levels/mazeLevel.ts`) rather than parsed XML.

Deliberately **not** writable, with reasons:

- `skin` — changes the whole block vocabulary. `levelDraft.ts:163-164`,
  `:175-178` derive the paint tools and the toolbox palette from `skin`; a
  skin change would invalidate the tray, the map's cell types, and any stored
  solution simultaneously. This is a re-create, not a field edit.
- `authored_hints` / `recommendedBlocksXml` — read by the lab but authored
  nowhere; a form field would be the only writer of a format nothing else
  validates.

---

## 4. Widgets

Renderer: `WidgetExperienceView.tsx:25-76` → `WidgetFrame` from
`@code-dot-org/widget-runtime`, keyed on `widgetId` + a source hash (`:65`,
`:80-86`) so an agent edit remounts the sandbox.

| field | produced at | consumed by | write op today | revertible |
|---|---|---|---|---|
| `descriptor.title` | `ClaudeAgentRunner.ts:605` (`create_widget`) | `WidgetExperienceView.tsx:67` (`toolName` prop into the frame) | `updateWidgetMetadata` — **no caller** | no |
| `descriptor.description` | `:606` | model context only | `updateWidgetMetadata` — no caller | no |
| `descriptor.inputSchema` | `:607-610` | agent-facing contract | `updateWidgetMetadata` — no caller; should stay read-only | no |
| `descriptor.resourceUri` | `:611` | derived from id | must not change | — |
| `descriptor.visibility` / `network` / `eventTypes` | `:612-614` | contract gates (`widgets/contractGates.ts`) | must stay read-only | — |
| widget **source** (`widgets/<id>/src/index.tsx`) | agent `Write`/`Edit`, confined to `store.widgetsDir` (`ClaudeAgentRunner.ts:286`) | esbuild → `buildWidget.ts` → `injectWidgetChrome` at serve (`server.ts:200-204`) | **chat only** — no op, no UI, a file write plus a watcher (`server.ts:112`) | no (not in the change log at all) |
| `experience.defaultInput` | `ClaudeAgentRunner.ts:630` | `WidgetExperienceView.tsx:37-43` | **NONE** — no op patches a widget experience's `defaultInput` | — |
| `experience.title` | `:626` | outline | `updateContent`/`updateLevel` (no UI) | no |

A manual widget-editing tool would write two different things:

1. **Metadata** — `title` and `description` via `updateWidgetMetadata`, which
   already exists, is already schema-gated on `WIDGET_ID_PATTERN`
   (`changeSchema.ts:264-266`), and already appends to the change log. Two
   text fields, zero new server code. Cheapest real win in the map.
2. **Source** — a `PUT /api/widgets/:id/source` that writes the TSX and runs
   `rebuildWidgetSource`. This is *not* a `CurriculumChange` today (source
   edits bump the version via `notifyWidgetSourceChanged`,
   `AuthoringState.ts:198-203`, without touching the log), so a source editor
   inherits no history, no revert, and does not mark the course touched for
   publish.

---

## 5. Scaffolding: course, unit, lesson, experience placement

| target | fields | write op | previous? | UI | agent |
|---|---|---|---|---|---|
| course `displayName`, `gradeLevels`, `offeringKey` | `types.ts:7-14` | **none after create** — no `updateCourse` op exists | — | create only | `create_course` |
| unit `displayName`, `overview` | `types.ts:16-22` | `updateUnit` (`apply.ts:195-199`) | no | **none** | **none** |
| lesson `displayName`, `goal`, `durationMinutes`, `overview`, `outline`, `expectedOutcome`, `adaptivePolicy` | `types.ts:24-36`; patch shape `changeSchema.ts:55-63` | `updateLesson` (`apply.ts:201-205`) | no | **none** | `update_lesson`, `set_adaptive_policy` |
| experience position | — | `moveExperience` (`apply.ts:230-266`) | no | `OutlineRail.tsx:61` | `move_experience` |
| experience removal | — | `removeExperience` (`apply.ts:217-228`) | no | `OutlineRail.tsx:64` | `remove_experience` |
| content `title` + `markdown` | `types.ts:45-48` | `updateContent` | no | `LessonPlayer.tsx:550-557` | `update_content` |

So: unit fields are **op-complete but UI-less and tool-less** — nothing can
edit a unit overview today. Course fields have no op at all. Lesson fields are
**chat-only**. Everything in this table is **not revertible**.

`ChangeHistory` still labels all of them (`changeHistory.ts:240-271`), so an
author sees "Updated lesson … (goal)" in the log with no Revert control
beside it.

---

## 6. What the chat can drive

Tools are defined at `ClaudeAgentRunner.ts:402-787` and exposed as an
in-process MCP server (`:398-401`).

| area | manual tool | chat tool | neither |
|---|---|---|---|
| course create/remove | yes | create only | — |
| unit create | yes | yes | — |
| unit edit | — | — | **`updateUnit` unreachable** |
| lesson create | yes | yes | — |
| lesson edit (goal/outline/overview/policy) | — | `update_lesson`, `set_adaptive_policy` | — |
| insert content | yes | `insert_content` | — |
| edit content markdown/title | yes (content-kind only) | `update_content` | — |
| edit generic level markdown/title | — | `update_content` | — |
| generic level `question`/`answers`/`pairs`/`videoKey`/… | — | — | **all of it** |
| attach existing level | yes | `attach_existing_level` | — |
| move / remove experience | yes | yes | — |
| level title | maze only (`LevelRail.tsx:234`) | `update_level` title arg (draft maze only) | fish/music/generic titles |
| level instructions | yes (`PropertiesPanel`) | `update_level_instructions` | — |
| maze grid / toolbox / start blocks / solution / ideal / start direction | yes (`levelDraft`) | `update_level` — **draft levels only**, and refuses after any visual edit (`:706-710`) | imported maze levels have no chat path |
| music/fish level data | — | — | **all of it** |
| widget create | — | `create_widget` | — |
| widget source | — | `Write`/`Edit` under `widgetsDir` | — |
| widget metadata | — | — | **`updateWidgetMetadata` unreachable** |

**Latent allowlist bug.** `update_level_instructions` is defined
(`:737-768`) but is absent from `CURRICULUM_TOOL_NAMES` (`:343-360`), which
is what `allowedTools` is built from (`:80-82`). It works today only because
`guardFileTool` blanket-allows every `mcp__curriculum__*` name before any
other check (`:269-271`). Narrow that guard and the chat loses instruction
editing silently. Add the name to the list.

---

## 7. Missing ops, ranked

### 7.1 `updateGenericLevelData` — unblocks 5 types

Types unblocked: multi, match, video, levelGroup, bubbleChoice (markdown is
already covered by `updateContent`).

Nothing today writes `experience.data`. It is not a `levelProperties` merge:
generic experiences have no reliable numeric id (§2.8) and the payload is a
discriminated union with arrays, not a flat record.

```
{op: 'updateGenericLevelData';
 experienceId: string;
 data: GenericLevelData;      // whole-variant replace, validated by the
                              // EXISTING GenericLevelDataSchema
 previous?: GenericLevelData; // server-captured from experience.data
}
```

Follow Pattern A. Server capture in `applyCurriculumChange`
(`AuthoringState.ts:108-129`) reads `findExistingLevelExperience(...)?.data`;
the reducer replaces `experience.data` in `apply.ts` beside the
`overrideLevelInstructions` case; no `levelProperties` fold is needed, so the
`levelProperties` ternary at `AuthoringState.ts:142-157` is untouched.
`buildRevertChangeBody` gains one case mirroring `revert.ts:51-58` exactly.

Whole-variant replace, not a field merge, for three reasons: the arrays
(`answers`, `pairs`, `choices`, `pages`) need reorder and delete; the union
is discriminated on `type`, so a partial patch could produce an
uninhabitable shape; and `GenericLevelDataSchema` already validates the whole
value by construction — the panel gets its allowlist for free, unlike the
`levelProperties` case which needs a descriptor table.

It also needs a click target: the generic branch of `ExistingLevelStage`
(`ExperienceStage.tsx:227-236`) must accept and pass `onSectionClick`, and
`PropertiesPanel` needs a section that dispatches on `experience.data.type`
rather than on `appName`.

### 7.2 `updateLevelProperties` — unblocks 3 types

Types unblocked: music (8 fields), fish (`mode`+`appMode`, `guides`), maze
(nothing new — `overrideLevelDefinition` already covers its editable set).

The probe's §3.6 sketch stands, with one correction: `overrideLevelDefinition`
has since landed and is the closer template than `overrideLevelInstructions`,
because it already implements `null`-means-delete
(`AuthoringState.ts:421-441`) and a pre-capture normalisation hook
(`withSolutionStalenessRule`, `:374-393`) — a `packId`/`sounds` group write
needs exactly that hook shape.

```
{op: 'updateLevelProperties';
 experienceId: string;
 patch: {
   properties?: Record<string, unknown>;  // shallow onto the entry
   levelData?: Record<string, unknown>;   // shallow onto entry.levelData
   toolbox?: Record<string, unknown>;     // shallow onto entry.levelData.toolbox
 };
 previous?: /* same shape */;
}
```

Non-negotiables carried over from the probe and confirmed here:

- **Descriptor-gated zod.** A bare `Record<string, unknown>` reaching a merge
  is an arbitrary-write primitive — the exact lesson `changeSchema.ts:6-16`
  records about `widgetId`. The per-`appName` descriptor table is the
  allowlist.
- **Three explicit levels, shallow at each.** A general deep merge cannot
  express "replace `toolbox.blocks` wholesale" and would half-merge `sounds`.
- **Group writes.** `packId`+`sounds`(+`library`) and `mode`+`appMode` must
  travel in one patch or the entry desynchronises.

### 7.3 Wire `updateWidgetMetadata` — 1 type, zero server work

The op, the schema branch, the reducer and the history label all exist. Two
text fields in a widget section of the properties panel, plus a click target
on `WidgetExperienceView` (which today has none, same as the generic
renderers). Not revertible until it grows a `previous` — worth adding at the
same time, since it is three lines mirroring `capturePreviousInstructions`.

### 7.4 Generic-experience title UI — unblocks 6 types, no new op

`updateLevel` writes `title` on any `existingLevel` experience
(`apply.ts:311-319`) and `updateContent` writes it on any experience at all
(`apply.ts:104-107`). The only reason no generic or music or fish title is
editable is that the one `TitleField` lives behind a `appName === 'maze'`
gate (`LevelRail.tsx:61-64`, `:167`). Moving it to a level-agnostic section
costs nothing.

### 7.5 `updateCourse` — 0 types unblocked, but a real gap

No op patches `CourseModel.displayName` or `gradeLevels`. A course created by
`create_course` can never be renamed; an imported one carries the offering's
display name forever (`buildCourse.ts:147`).

---

## 8. Traps

Fields that look editable but are not safely writable, and wiring that looks
correct but is not. Each is verified, not suspected.

### 8.1 Session snapshots are frozen; importer fixes never reach them

`importCourseIfMissing` returns early when the course id is already in the
snapshot (`boot/importCourse.ts:61-66`). `levelProperties` is written once at
seed (`AuthoringState.seedCourse`, `:248-260`) and never re-derived. So every
improvement to `levelProperties.ts` or `buildCourse.ts` applies only to
sessions created after it.

Two live consequences, both measured:

- All 9 fish entries lack `mode` and `guides` (§3.1) though the builder emits
  them (`levelProperties.ts:43-45`).
- All 4 bubbleChoice experiences have `choices` without `data` (§2.6) though
  `buildCourse.ts:341-345` resolves it.

`repairLevelProperties` (`levelCatalog.ts:344-361`) exists for exactly this
class of drift but only repairs entries missing `appName`, so neither case is
caught. Any field table derived from the builders describes what a *fresh*
session serves, not what the running one does.

### 8.2 `flower_type` is inert — the probe's finding, still true

`Bee.ts:40` reads `level.flowerType`. `buildMazeLevelProperties` spreads raw
snake_case and camelises only `startDirection`, `ideal`, `skin`
(`levelProperties.ts:140-142`). `grep -rn 'flowerType'` across
`packages/authoring/src` and `apps/studio/src` returns nothing that produces
it. 2670 real maze levels set `flower_type`. A descriptor row for it would
write a key with no reader.

### 8.3 `exemplarSettings` is served at the wrong depth

`buildMusicLevelProperties` emits it at top level
(`levelProperties.ts:103`, from `properties.exemplar_settings`).
`MusicLab/index.tsx:271` reads `levelProperties.levelData.exemplarSettings`
and dereferences it with `!` twice. Same class of bug as `flower_type`, with
a sharper edge: it is gated behind `showExemplarPlayer`, so if that condition
ever becomes true on a level whose `level_data` lacks the key, this throws.

### 8.4 `validations` has no reader in this prototype

`buildMusicLevelProperties:102` carries it through with a comment citing
`apps/src/lab2/progress/ProgressContainer.tsx`. That file is in the legacy
`apps/` bundle, which the Author Mode host does not mount — it mounts
`packages/labs/music`, where `grep -rn 'validations'` finds only a comment in
`MusicValidator.ts:1`. So the Check/Continue gate the comment describes does
not exist here. Correction to the probe's §3.1, which listed `validations` as
read-only-because-dangerous; it is read-only because nothing reads it.

### 8.5 `shortInstructions` is offered for maze and goes nowhere

`PropertiesPanel.tsx:21-23` suppresses the field for `music` only. For maze,
`hostRendersInstructions` is false (`ExperienceStage.tsx:359`) so
`LevelInstructions`'s fallback (`:50-54`) never runs, and nothing in
`packages/labs/maze` reads `shortInstructions`. An author typing into that
box on a maze level writes a field with no consumer — and it *is* saved, so
it also shows up as a change in the log. 3877 of 4100 real maze levels set
`short_instructions` today, all equally inert here.

### 8.6 Maze entries carry snake_case and camelCase copies; only one is patched

The imported maze wire shape holds both `start_direction` and
`startDirection`, both `short_instructions`/`long_instructions` and
`shortInstructions`/`longInstructions` (`levelProperties.ts:125` spread, then
`:138-142` re-emit). `overrideLevelDefinition` and
`overrideLevelInstructions` merge only the camelCase keys
(`LevelDefinitionPatch`, `types.ts:84-102`; `InstructionsPatch`, `:70-73`).
After a save, the snake_case copy is stale.

Harmless today because the adapter reads the camelCase names
(`maze/index.tsx:71`) — with two exceptions it reads snake_case for:
`authored_hints` (`:73`), `maze` (`:74`) and `serialized_maze` (`:75`). Those
three are why `LevelDefinitionPatch` carries `maze` and `serialized_maze`
under their snake_case names while everything else is camelCase
(`types.ts:84-91`) — an inconsistency that is correct, and that any new
descriptor table has to reproduce rather than tidy up.

### 8.7 `packId` alone corrupts the sound allowlist

`sounds` is `{[category]: string[]}` and in practice its single key *is* the
packId (verified against
`dashboard/config/levels/custom/music/Change_the_volume_ keyboard_navigation.level`).
`Driver.ts:155-157` applies `setAllowedSounds(sounds)` then
`setCurrentPackId(packId)`. Writing `packId` alone leaves the allowlist
keyed to the old pack. Worse, `startSources` references sounds as
`packId/soundName`, so a song change silently invalidates the authored
starting program — the lab degrades by resetting the field rather than
crashing. Any song picker must write the group and warn before it does.

### 8.8 `definitionOverride` is stripped by the experience schema

`ExistingLevelExperienceSchema` (`changeSchema.ts:157-167`) declares
`instructionsOverride` but not `definitionOverride`. `z.object` strips
unknown keys, so an `insertExperience` or `createLevel` body carrying a
`definitionOverride` loses it silently. No caller does that today
(`create_level` mints fresh levels), but the omission is drift against
`types.ts:67` and will bite the first re-attach or duplicate flow.

### 8.9 Several ops do not mark a course touched for publish

`changeTargets` (`publish/buildChangeSet.ts:127-160`) has no case for
`updateLevel`, `createLevel`, `createWidget`, `updateWidgetMetadata` or
`removeCourse`; they fall to `default: return []`. A session whose only
change is a level title edit therefore reports no touched course. `createLevel`
does register in `newIds` (`:205-207`), so a created level is listed as new
while its course is not listed as changed.

### 8.10 Attached videos never resolve their YouTube code

§2.4. The lazy path (`levelCatalog.ts:402-408`) has no access to
`videos.csv`; only `loadCourse` reads it (`node/loadCourse.ts:84`). Every
video in the running session is a placeholder. A `videoKey` editor would
therefore appear to do nothing, because the *code* is what the renderer
branches on (`VideoLevel.tsx:16`).

### 8.11 `toolboxDefinition` looks authoritative and is dead

`Driver.ts:768` reads `this.toolboxDefinition || getToolbox(this.blockMode,
this.toolbox)`. `this.toolboxDefinition` is declared on no class in the chain
— `Driver` extends only a typed `EventEmitter` (`Driver.ts:93`), its field
list is `Driver.ts:95-109`, and `grep -rn 'toolboxDefinition'
packages/labs/music/src` returns exactly three hits: this line, the comment
below it, and `types.ts:37`. Nothing ever assigns it from
`levelProperties.levelData.toolboxDefinition`, so the expression always falls
through to `getToolbox`. 10 of the 45 music levels in the session set the
key and get no effect from it.

Same shape as `flower_type` (§8.2) and `exemplarSettings` (§8.3): a field
carried faithfully from `.level` to the wire and dropped at the last hop. All
three would be caught by a descriptor table with an explicit "consumed as"
column and one test per row — which remains the strongest argument for the
probe's §1.4 recommendation.

This also corrects the probe's §3.1 and §4.2, which treated
`toolboxDefinition` as winning over `toolbox` and used its presence as the
gate that hides a block-list editor. That gate is currently a no-op.

### 8.12 The generic renderers have no click target at all

§2. Not a data problem — a wiring one, and it is the single largest reason
the generic types read as 0% editable. 40 of 318 level experiences in the
session are `runtime: 'generic'`, plus 16 content experiences that *do* have
an edit affordance. The op to edit generic markdown already exists and is
already reachable from chat; only the pencil is missing.

---

## 9. Method

- Code read at branch `ngfp/author-mode-staging`, tip 8ed71504859.
- Live session read-only via `GET /api/state` (version 314: 5 courses, 350
  experiences, 11 widgets, 228 changes) and `GET
  /api/levels/<id>/level_properties` for every fish (9) and music (45) level
  plus one imported maze (`9000058`) and one draft maze (`9000108`).
  No `POST` was issued.
- `.level` ground truth from
  `dashboard/config/levels/custom/{fish,music,maze}/` in this worktree.
- Read-site claims ("no reader") are `grep -rn` over `packages/labs/*/src`
  and `apps/studio/src`, excluding `__tests__`.
