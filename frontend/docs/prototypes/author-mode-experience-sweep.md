# Author Mode: experience sweep

Every distinct student-experience type in the live demo, rendered in author
mode and (where they differ) student view, decomposed into the logical areas
a curriculum author would point at, with the authoring affordance each area
has today.

Status: analysis only, on branch `ngfp/author-mode-staging` (tip
8ed71504859). No code written, no curriculum mutated — no Save was pressed on
any panel and no change was posted. Paths are relative to `frontend/`.

Companion documents:

- `author-mode-cms-ux-research.md` — the recommended IA this sweep tests
  against.
- `author-mode-properties-panel.md` — the field-level feasibility probe for
  fish/music/maze.
- `author-mode-data-wiring-map.md` — the code-derived field→consumer→op map.
  Where this document guesses at wiring and that one states it, that one wins;
  the merged result is `author-mode-authoring-tools-map.md`.

Method: `GET http://localhost:3752/api/state` (version 314) for the inventory,
`GET /api/levels/<id>/level_properties` for field shapes, and the live app at
`http://localhost:3036/frontend-studio/author` driven read-only through
Playwright (navigate + accessibility snapshot + geometry/style reads; no
screenshots, no clicks that write).

---

## 1. Type inventory

339 experiences across 5 courses, counted from the running session (version
314). `author-mode-data-wiring-map.md` §9 reports 350; the measured figure is
339 — `[.courses[].units[].lessons[].experiences[]] | length`.

| kind | levelType | runtime | count | swept live | representative |
|---|---|---|---|---|---|
| `existingLevel` | Karel | labhost/maze | 88 | yes | `courseD_bee_nested_loops1a` (Course D, Nested Loops in Maze) |
| `existingLevel` | Maze | labhost/maze | 70 | yes | `grade2_maze_intro2` (Block by Block L1) |
| `existingLevel` | Music | labhost/music | 45 | yes | `coding-with-music-play-sound` (Coding with Music L1) |
| `existingLevel` | StandaloneVideo | generic | 25 | yes | `courseD_video_nested_loops` |
| `content` | — | — | 16 | yes | `bbb-l1-intro` "Warm-Up: Program Your Teacher" |
| `existingLevel` | Dancelab | unsupported | 16 | by renderer | Course D, Dance Party |
| `existingLevel` | Craft | unsupported | 14 | by renderer | Course D, Looking Ahead with Minecraft |
| `existingLevel` | Panels | unsupported | 10 | yes | `music-coding-intro-effects-panel_launch_standalone` |
| `existingLevel` | Artist | unsupported | 9 | by renderer | Course D, Drawing Shapes with Loops |
| `existingLevel` | Fish | labhost/oceans | 9 | yes | `Oceans_Long_2024` (Sort It Out L2) |
| `existingLevel` | `unknown` | unsupported | 9 | yes | `blockly:Studio:hoc2015_blockly_7_no_video` |
| `existingLevel` | Bounce | unsupported | 8 | by renderer | Course D, Events in Bounce |
| `existingLevel` | External | generic | 8 | yes | `music-coding-intro-review_standalone` |
| `widget` | — | — | 5 | yes | `you_be_the_sorter` (Sort It Out L2) |
| `existingLevel` | BubbleChoice | generic | 4 | yes | `music-coding-intro-inspiration` |
| `existingLevel` | Multi | generic | 2 | yes | `music-coding-intro-events-cfu_standalone` |
| `existingLevel` | Match | generic | 1 | yes | `coding-with-music-seq-cfu-standalone` |

"by renderer" means the type was not individually navigated to, because
`ExperienceStage`'s fallback branch (`ExperienceStage.tsx:238-248`) routes
Dancelab, Craft, Artist, Bounce, Panels and `unknown` to the same
`UnsupportedLevel` card; Panels and `unknown` were rendered live and are
byte-identical in structure to what the other four produce.

**Types with a renderer and zero live instances:** `levelGroup`
(`renderers/LevelGroupLevel.tsx`, 80 lines) — nothing in the demo catalog
produces one, so its projection is unexercised.

**Types that exist in Levelbuilder but not in this catalog at all:** App Lab,
Game Lab, Sprite Lab, Weblab, Python Lab, Poetry, Free Response, Contract
Match, Text Match, Evaluation levels. None are reachable from the five demo
courses; a Levelbuilder search-attach could pull one in, and it would land as
`opaque` → `UnsupportedLevel`.

---

## 2. The confirmed component model, and where it does and does not reach

The product owner's model (FINAL IA REVISION, 8/27): the stage decomposes into
logical components; each is hover-highlightable and click-selectable; clicking
one opens *its* properties in the right panel; the left rail's "Level" tab
holds level-wide settings only.

Measured against the live app, exactly one type implements it:

| type | stage click targets | "Level" tab | right panel reachable |
|---|---|---|---|
| Maze / Karel | 4 — Instructions, Play Area, Blocks, Workspace | enabled | yes |
| Music | 1 — Instructions (host block above the lab) | **disabled** | yes, instructions only |
| Fish / Oceans | 1 — Instructions (host block above the lab) | **disabled** | yes, instructions only |
| content | 0 — a pencil swaps the stage for an inline editor | **disabled** | n/a (no panel) |
| every generic type (video, multi, match, external, bubbleChoice) | **0** | **disabled** | **no** |
| widget | **0** | **disabled** | **no** |
| unsupported (Panels, Dancelab, Craft, Artist, Bounce, `unknown`) | 0 | **disabled** | no |

So the model is shipped for 158 of 339 experiences (47%), degraded to
instructions-only for 54 more (16%), and absent for the remaining 127 (37%) —
of which 16 (`content`) have an inline stage editor instead and 66 are
correctly inert placeholders.

Two structural notes that shape every recommendation below:

- **The panel is the only place a field edit can live**, and reaching it
  requires a stage click target. For content the prototype instead put the
  editor *in the stage* (a pencil that replaces the rendered markdown with a
  title input + a raw `<textarea>`). That is the one place the shipped IA
  contradicts itself, and it is also the only non-maze type an author can edit
  at all without chat.
- **The stage is narrow.** With the AI sidebar at 440px and the outline rail
  beside it, the stage measured 528px wide at a 1920px viewport. Maze fits.
  Music does not: its 48-measure timeline laid out to 2900px inside a 308px
  box, and the lab's left toolbar collapsed to 56px. An author is judging a
  layout no student will ever see.

---

## 3. Per-type decomposition

Each section: what is actually on screen, the logical areas, and per area the
current affordance / what the tool should be / the data behind it. "Field"
names are what the served `level_properties` or `experience.data` actually
carries.

### 3.1 Maze / Karel — the reference implementation

Live: `courseD_bee_nested_loops1a`, Course D → Nested Loops in Maze.

On screen, top-left to bottom-right: a left column holding an **Instructions**
panel (labelled header, a `Select instructions` icon button, the rendered
markdown bubble, a `Hint` button) above a **Play Area** panel (labelled header,
`Select visualization`, the 320×320 grid with the bee and two `?` cloud tiles,
Run and Step buttons); a right column holding a **Blocks** header (a `1/5`
block-count chip, `Select toolbox`) over the toolbox flyout, and a
**Workspace** header (`Select workspace`, Settings, Start Over, Show Code) over
the Blockly canvas with the immovable `when run` block.

Karel differs from Maze only in skin-derived vocabulary: the paint tray gains
`Flower (nectar)` and `Hive (honey)`, the toolbox catalog gains `Get nectar` /
`Make honey` / `If path ahead` etc. Same four components, same panels.

| logical area | today | should be | data |
|---|---|---|---|
| Instructions bubble | panel: two raw `<textarea>`s (Short instructions, Instructions markdown) + Cancel/Save | keep, plus a live markdown preview; drop the Short field (nothing renders it for maze) | `longInstructions`, `shortInstructions` |
| Instructions → Hint button | **nothing** — the button is on stage, its content is not editable anywhere | a hints list editor (add/edit/remove/reorder, markdown per hint) in the instructions panel, collapsed by default | `authored_hints` (JSON array of `{hint_class, hint_markdown, hint_id, hint_type, tts_url}`) |
| Play Area → grid | panel: a 7-chip paint tray (Wall / Open / Start / Finish / Obstacle / Flower (nectar) / Hive (honey)); painting happens on the stage | keep — this is the one genuinely spatial gesture | `maze`, `serialized_maze` |
| Play Area → grid **size** | **nothing** — the panel shows a grid-size readout only | rows/cols steppers in the visualization panel, with an explicit "crop/pad" warning | `maze` array dimensions |
| Play Area → start direction | panel: `<select>` N/E/S/W | keep | `startDirection` |
| Play Area → skin | panel: read-only text `Skin: bee` | leave read-only, but say *why* — a skin change re-bases the toolbox, tile vocabulary and stored solution | `skin` |
| Play Area → per-cell payloads (nectar per flower, honey goal, dirt) | **nothing** | a cell inspector: click a painted cell, edit its amount in the panel | `serialized_maze[r][c]`, `initial_dirt`, `final_dirt` |
| Blocks (toolbox) | panel: "Available blocks" catalog + "In the toolbox" chip list, add/remove | keep; add reorder, and per-block usage caps | `toolboxBlocksXml` |
| Workspace | panel: `Student start` / `My solution` mode toggle + solution status line; arranging happens on the stage | keep | `startBlocksXml`, `solutionBlocksXml`, `solutionVerified` |
| Level settings (left rail "Level" tab) | Title input, solution status line, Target block count, `Check level`, Save | keep; this is the right home for it | `title`, `ideal`, `solutionVerified` |
| Run feedback | inline success/failure card with "You used N blocks — this can be solved in M" | not authorable, correctly | `ideal` |

### 3.2 Music

Live: `coding-with-music-play-sound`, Coding with Music → Songwriter's Toolbox.

On screen: a host-rendered instructions block whose body reads *"Instructions
are shown in the lab below."* with a `Select instructions` button, then the
music lab — a 56px icon rail (Version History, Documentation, Copyright,
Settings), an unlabelled side panel showing *"No version history found. Have
you started your project?"*, a `Finish` button, a **Workspace** header with
undo/redo over a Blockly canvas holding `when run`, a **Controls** panel with
Run, and a **Timeline** panel with 48 numbered measures.

Logical areas an author would name: instructions, the sound library / song,
the student's block palette, the starting program, the timeline, and the
"finish" condition.

| logical area | today | should be | data |
|---|---|---|---|
| Instructions | panel: one raw `<textarea>`; the stage shows a placeholder note, not the text | show the real text in the panel and let the note say *where* it will appear | `longInstructions` |
| Instructions placement | **nothing** | a `guideMode` selector beside the instructions field (sidebar tab vs. canvas overlay) | `levelData.guideMode` |
| Sound library / pack | **nothing** | a song picker in a "Sounds" panel section — one control that writes library + pack + allowed-sound list together | `levelData.library`, `levelData.packId`, `levelData.sounds` |
| Block palette | **nothing** — the toolbox flyout is on stage but has no click target | the same two-list chip tray the maze toolbox panel uses, per category | `levelData.toolbox.blocks`, `levelData.toolbox.type` |
| Starting program | **nothing** | read-only, with a "capture from workspace" button mirroring maze's Student start | `levelData.startSources` |
| Timeline / playhead | **nothing** | a boolean in the panel | `levelData.allowChangeStartingPlayheadPosition` |
| Level settings | **"Level" tab is disabled** — no title, no anything | enable the tab with the level-agnostic fields (title at minimum) | `title` |

### 3.3 Fish / Oceans

Live: `Oceans_Long_2024`, Sort It Out → Sorting Without a Rulebook.

On screen: the host instructions block reading *"No instructions yet."* with a
`Select instructions` button; then the oceans canvas — the prompt *"Is this a
fish?"*, a `0` counter with an Erase button, `Not Fish` / `Fish` buttons at the
bottom, a `Continue` button, and a guide overlay carrying the intro copy.

| logical area | today | should be | data |
|---|---|---|---|
| Instructions | panel: short + long textareas | keep | `longInstructions`, `shortInstructions` |
| Activity mode (what students train on: fish-vs-trash, creatures-vs-trash, the long word-choice variant) | **nothing** | a mode `<select>` in a level panel — this is the single most identity-defining field of an oceans level | `mode` / `appMode` |
| Guide overlay copy (the "Garbage dumped in the water…" text and every subsequent coaching beat) | **nothing** | a guide-step list editor (ordered, markdown per step) | `guides` |
| Training prompt / labels ("Is this a fish?", "Fish"/"Not Fish") | **nothing** — currently derived from `mode` | leave derived; expose only if `guides` proves insufficient | derived from `mode` |
| Level settings | **"Level" tab disabled** | enable for title | `title` |

### 3.4 Video (StandaloneVideo)

Live: `courseD_video_nested_loops` and `music_lab_promo_long`.

On screen: **nothing but a YouTube iframe.** No instructions block, no header,
no click target, no panel, "Level" tab disabled. The most-common non-lab type
in the catalog (25 instances) has the weakest authoring surface of any type
that renders successfully.

| logical area | today | should be | data |
|---|---|---|---|
| The video itself | nothing | a video picker (search the `videos.csv` catalog by key, preview inline) | `data.videoKey` → `data.youtubeCode` |
| Title / caption shown above the player | nothing; nothing is shown | a title field, and render it | `data.displayName`, `experience.title` |
| Framing copy (why the student is watching) | nothing, and no field exists to hold it | either allow a `content` experience beside it, or add a `markdown` key to the video variant | — |

### 3.5 Multiple choice (Multi)

Live: `music-coding-intro-events-cfu_standalone`.

On screen: an optional markdown lead-in, the question, four answer buttons,
a `Check` button, and an inline correct/incorrect line. No click target, no
panel, "Level" tab disabled.

| logical area | today | should be | data |
|---|---|---|---|
| Lead-in markdown | chat only (`update_content`) | a markdown field in the panel | `data.markdown` |
| Question | **nothing** | a markdown field | `data.question` |
| Answer list | **nothing** | an ordered list editor: markdown per answer, a correct/incorrect toggle per answer, add/remove/reorder | `data.answers[].text`, `.correct` |
| Retry behaviour | **nothing** | a checkbox | `data.allowMultipleAttempts` |
| Feedback copy | hard-coded ("Correct!", "Not quite — try again.") | leave hard-coded for v1 | — |

### 3.6 Matching (Match)

Live: `coding-with-music-seq-cfu-standalone`.

On screen: three prompts, each a radio group of three options. In this level
every prompt and every option is a bare image (`![](https://images.code.org/…)`),
so the visible content is nine thumbnails and no words. `Check` is disabled
until every prompt is answered. No click target, no panel.

| logical area | today | should be | data |
|---|---|---|---|
| Lead-in markdown | chat only | markdown field | `data.markdown` |
| Prompt/answer pairs | **nothing** | a pair-list editor with a markdown field on each side; note that the answer pool is shared, so it is one table, not N independent rows | `data.pairs[].question`, `.answer` |

### 3.7 Choice grid (BubbleChoice)

Live: `music-coding-intro-inspiration`, `coding-with-music-career-videos-standalone`.

On screen: a heading and a list of three named choices, each rendering
*"Not supported in this prototype (unresolved) — `<levelKey>`"*. The choices
are not enterable, so a student reaching this experience can do nothing.

| logical area | today | should be | data |
|---|---|---|---|
| Grid heading | nothing | a text field | `data.displayName` |
| Choice list | nothing | a list editor over level keys, each with a Levelbuilder search-attach picker and a display-name override | `data.choices[].levelKey`, `.displayName` |
| Choice content | broken (unresolved) | resolve at edit time so the author can see what a student would get | `data.choices[].data` |

### 3.8 External / markdown

Live: `music-coding-intro-review_standalone` (Coding with Music) and six
unplugged pages in Course D.

On screen: a fully rendered markdown page — headings, concept cards, links.
It renders *identically* to a `content` experience. It has **no pencil**, no
panel, and a disabled "Level" tab, purely because its `kind` is
`existingLevel` rather than `content`.

| logical area | today | should be | data |
|---|---|---|---|
| The page body | chat only | the same inline title + textarea editor `content` already has | `data.markdown` |
| Title | chat only | same editor | `experience.title` |

This is the cheapest gap in the whole sweep: the editor exists, the write path
exists, and only the `kind === 'content'` gate stands between them.

### 3.9 Widget

Live: `you_be_the_sorter`, `rule_or_examples_finale`.

On screen: a sandboxed `<iframe srcdoc>` (CSP `default-src 'none'`, brand-kit
CSS injected) rendering the agent-built activity — heading, round indicator,
two sorted groups of emoji, a prompt, three rule-guess buttons. It works.

Around it: nothing. No click target, no panel, disabled "Level" tab. Every
widget property — its title, its description, the `defaultInput` the host
passes in, and its 400 KB of generated source — is chat-only.

| logical area | today | should be | data |
|---|---|---|---|
| Widget title | nothing | a text field in a widget panel section | `descriptor.title` |
| Widget description (what the model is told it does) | nothing | a textarea in the same section | `descriptor.description` |
| Per-placement input | nothing | a form generated from `inputSchema` | `experience.defaultInput` |
| Widget behaviour/source | chat only | leave to chat; surface a "what this widget does" summary and a link to re-prompt | `widgets/<id>/src/index.tsx` |
| Contract (network, visibility, event types) | nothing | read-only display — these are safety gates | `descriptor.network`, `.visibility`, `.eventTypes` |

### 3.10 Content (draft markdown)

Live: `bbb-l1-intro`, `bbb-l1-wrap`, and 14 more.

On screen: a rendered markdown card with a pencil in the corner. Clicking the
pencil replaces the card with a Title input, a raw markdown `<textarea>`, and
Cancel/Save.

| logical area | today | should be | data |
|---|---|---|---|
| Title | inline input | move into the right panel, per the IA rule | `experience.title` |
| Body | inline raw textarea | keep the raw textarea (imported pages contain hand-written HTML that a WYSIWYG would destroy), but add a side-by-side preview | `experience.markdown` |

### 3.11 Unsupported (Panels, Dancelab, Craft, Artist, Bounce, `unknown`)

Live: `music-coding-intro-effects-panel_launch_standalone` and
`blockly:Studio:hoc2015_blockly_7_no_video`.

On screen: a card with the level type in overline, the level key as a heading,
and one paragraph: *"This activity type runs in the classic Studio runtime and
isn't playable in this prototype. It keeps its place and identity in the
lesson. Ask the AI to build an interactive version if you want it playable
here."*

56 of these are correctly inert placeholders. **Panels is the exception**: its
payload carries the authored panel markdown and images, and the card displays
none of it. A Panels level is a slideshow of markdown pages — the projection
the prototype already has for `content` would render it faithfully.

| logical area | today | should be | data |
|---|---|---|---|
| Identity (type + key) | shown, read-only | keep | `levelKey`, `levelType` |
| Panels payload | carried and discarded | render the panels as a pager; author each panel's markdown with the content editor | `data.properties.panels[].text` |
| Everything else | inert | keep inert | — |

---

## 4. Cross-cutting: outline, level rail, top bar, student view

**Outline rail.** Rows show a title and a type chip. The title fallback is
inconsistent across courses:

- Course D rows read `Course d bee nested loops1a` — the level key, humanized.
- Block by Block rows read `lb:grade2_maze_intro3` — the raw experience id,
  `lb:` prefix and all.
- One Block by Block row is blank (its `title` is the empty string, so the
  fallback never fires).
- Coding with Music shows six consecutive rows all reading `Skill Building`
  (the imported activity-section name, not the level's own name), which makes
  them impossible to tell apart.
- Course D's Play Lab levels show `unknown` as their type chip.

**Level rail ("Level" tab).** Enabled for maze only. Holds Title, a solution
status line, Target block count, `Check level`, Save. Correct contents; wrong
gate.

**Top bar.** Back-to-course, breadcrumb, lesson title, a lesson-progress dot
strip, a `Changed` status chip, undo/redo with a tooltip naming the last
change, `Publish`, `AI tutor off`, `Student view`. Undo's tooltip read
`Undo: Edited level ""` — the change label interpolates an empty level title.

**Course page.** Title, grades, status chip, Publish, History, a unit heading,
lesson rows with activity counts, `New lesson`, `New unit`. Nothing on this
page is editable: no course rename, no grade-level edit, no unit rename, no
lesson rename, no lesson reorder, no lesson delete.

**Index page.** Course cards with origin chips (Draft / Levelbuilder import),
a Remove button per course, `New course`, and the AI chat. No rename.

**Student view.** Removes the AI sidebar, the outline rail and every
`Select …` button; keeps the lab's own section headers (INSTRUCTIONS / PLAY
AREA / BLOCKS / WORKSPACE, which are student-facing chrome in the real lab
too). It also keeps the author top bar — `Changed`, `Publish` and the AI-tutor
toggle stay on screen in "student" view.

---

## 5. UX problems observed

Ordered by how much they hurt the demo. Each was observed live.

1. **An entire lesson is dead.** All 12 maze levels in Block by Block →
   "Spot the Repeat" (`courseB_iceage_loops1`…`12`) crash the lab with
   `TypeError: Invalid block definition for type:
   controls_repeat_simplified_dropdown`; the stage shows *"An error occurred
   while loading the lab. Try reloading the page."* The ice-age skin assets are
   also missing (`/skins/scrat/small_static_avatar.png` → 404). These are the
   only 12 levels in the catalog using that block type.

2. **BubbleChoice is non-functional.** All four choice grids render every
   choice as "Not supported in this prototype (unresolved)". A student cannot
   enter any choice.

3. **A 404 retry storm on every lesson load.** `GET
   /authoring-api/levels/-1/level_properties` fires repeatedly (react-query
   retries) before any level is selected — a level id of `-1` is being
   requested for experiences that have no numeric id. Harmless to correctness,
   but it fills the console and coincided with two lesson loads that hung past
   60s.

4. **Multi renders markdown as literal source.** The question and every answer
   are rendered as plain text, so `*Who should use events?*` and
   `**control when the drum sounds play,**` appear with their asterisks. Only
   the lead-in `markdown` field goes through the Markdown renderer.

5. **Match's radio options are announced as markdown source.** Each option's
   accessible name is the raw `![](https://images.code.org/…)` string. For an
   all-image matching level, a screen-reader user hears three identical URL
   fragments and nothing else.

6. **The "Workspace" component has no visible label.** Measured
   `getBoundingClientRect().width === 0` on the maze stage — the header row
   crowds Blocks + Workspace + four buttons into one flex line and the fourth
   component's name collapses to nothing. Only its icon button identifies it.

7. **Music's instructions are invisible to the author.** The host block says
   "Instructions are shown in the lab below" — but on the level swept, the
   field was empty, so nothing was shown anywhere and the note was actively
   misleading.

8. **Music lab noise leaks into author mode.** The lab's side panel shows
   *"No version history found. Have you started your project?"* — a
   student-project error surfaced during authoring.

9. **Oceans renders its guide text twice.** Two sibling elements with
   identical bounding boxes and identical copy stack on the canvas.

10. **Outline rows are not identifiable.** Raw `lb:` ids in Block by Block,
    six identical `Skill Building` rows in Coding with Music, one blank row,
    `unknown` as a type chip on nine Course D rows. (§4.)

11. **The stage is too narrow to judge a lab.** 528px at a 1920px viewport.
    Music's timeline overflows to ~2900px and its toolbar collapses to 56px.

12. **The instructions block can render off-stage.** On the music level its
    bounding box top was `-13` — clipped above the visible stage area.

13. **Student view still shows Publish.** The author top bar (status chip,
    Publish, AI-tutor toggle) stays mounted in student view.

14. **Undo's label can be empty.** `Undo: Edited level ""`.

15. **First lab mount can take longer than a minute.** Two navigations to
    Block by Block lessons stalled on `Loading…` past 60s and one wedged the
    browser; the same URLs loaded in ~10s afterwards. Cold Vite chunk
    compilation, not a data fault — but it is what a first-time demo viewer
    would hit.

---

## 6. Coverage statement

Rendered and decomposed live: content, widget, Maze, Karel, Music, Fish,
StandaloneVideo, Multi, Match, BubbleChoice, External, Panels, `unknown`.

Not individually rendered, covered by shared renderer: Dancelab, Craft,
Artist, Bounce (all route to `UnsupportedLevel`, verified in code and
confirmed against the two unsupported types that were rendered).

Renderer exists, zero live instances: `levelGroup`.

Exists in Levelbuilder, absent from this catalog: App Lab, Game Lab, Sprite
Lab, Weblab, Python Lab, and the free-response/evaluation family.
