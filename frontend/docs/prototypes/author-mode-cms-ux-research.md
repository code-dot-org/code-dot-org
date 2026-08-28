# CMS visual-editor IA research for Author Mode

Research pass, 2026-08-27. Contentful Studio (Experiences / Experience
Builder) as gold standard, per product-owner steer. Cross-checked against
Webflow, Framer, Builder.io, Wix Studio, Storyblok, and — for the one thing
none of those cover, a canvas containing a _running program_ — Figma
prototype mode, Articulate Storyline, H5P, Roblox Studio, Unity, Unreal, and
Plasmic.

Sourcing note: WebFetch to contentful.com hit HTTP 429 on essentially every
attempt in this pass (both mine and a research subagent's); Contentful
material below is WebSearch-result-snippet-derived except where the
product owner's own screenshot of the live editor is cited as "(screenshot)"
— that screenshot is primary evidence and wins over docs on every point of
disagreement, per instruction. Every other claim below carries a source URL
or is marked UNVERIFIED. Cross-CMS and runnable-canvas material is
better-sourced throughout (docs, not snippets) — see inline citations.

---

## a. Contentful Studio IA anatomy

### Layout, as directly observed (product owner's screenshot, page "Web Lab")

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← │ Web Lab  [Published ▾]        [All Sizes ▾]  [↶][↷]  │ 👤 ⋯ ↗  Save  [Change status ▾] │
├───────────────┬────────────────────────────────────────────┬─────────────┤
│ Components     │                                            │ Design | Content│
│ Layers        │              CANVAS                        │             │
│ [Settings]    │   (empty dotted grid, loading placeholder)  │ Breakpoints:│
│               │                                              │  All Sizes  │
│ ── Settings ──│                                              │   "Desktop  │
│ Preview        │                                              │    first"   │
│  Platform ▾    │                                              │  Tablet     │
│ Title(internal)│                                              │   <992px    │
│  "7 chars/256former│                                          │  Mobile     │
│ Slug (required)│                                              │   <576px    │
│ Meta Title     │                                              │             │
│ Meta Description│                                             │ "Design     │
│ OG Image        │                                             │  changes    │
│  [Published]⋯   │                                             │  apply to   │
│               │                                              │  all screen │
│               │                                              │  sizes ≤    │
│               │                                              │  this one…" │
└───────────────┴────────────────────────────────────────────┴─────────────┘
```

### Top bar

- Back arrow (leftmost) → page title → a **status chip** ("Published") next
  to the title, itself a dropdown for version/context. (screenshot)
- **Center**: device-size switcher ("All Sizes ▾") with **undo/redo buttons
  immediately beside it** — breakpoint switching and undo/redo share one
  visual cluster, not two. (screenshot)
- **Right, in order**: user avatar (presence — who else is viewing/editing),
  an overflow "⋯" menu, an "open preview in new tab" icon, a quiet
  secondary-styled **Save** button, and a prominent green **Change status**
  dropdown button. (screenshot)
- **Publish is a status transition, not a save action.** The primary button
  reads "Change status," not "Publish" or "Save" — publishing an entry is
  choosing DRAFT → PUBLISHED (or another transition) from that dropdown, and
  Save is a separate, lower-emphasis, always-available action alongside it.
  This matches Contentful's generic content-status model, confirmed
  independently across multiple docs pages (not Experiences-specific, but
  the same status vocabulary): entries are always in one of **DRAFT,
  CHANGED, PUBLISHED, or ARCHIVED** — [Entry editor sidebar
  overview](https://www.contentful.com/help/content-and-entries/entry-editor-sidebar-overview/),
  [Determine the state of entries and
  assets](https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/).
  CHANGED specifically means "published, then edited, not yet
  re-published" — i.e. dirty-since-publish is itself a first-class status
  value, not just an unsaved-changes badge.
- Publishing an _Experience_ specifically is documented as a **multi-step,
  reference-selection action**, not a flat button: "In the experience
  editor, click Publish. Select checkboxes against the references you would
  like to publish in your experience, then click Publish" — [Publish an
  experience](https://www.contentful.com/help/publish-experience/) (fork-A,
  WebSearch snippet, UNVERIFIED against primary due to 429s, but consistent
  phrasing across two independent search hits). Publishing a page can
  therefore also publish content it links to, as an explicit, visible
  choice — not a silent cascade.
- Autosave exists but isn't the only checkpoint: version history explicitly
  distinguishes autosaved/saved states from published ones — see Versioning
  below.

### Left rail

Three tabs: **Components | Layers | Settings**. (screenshot)

- **Components**: drag-and-drop source for adding new elements to the
  canvas — built-in primitives (image, text, divider, button) plus any
  custom components registered via the SDK's `defineComponents`, grouped
  under a "Basics" area — [Custom
  components](https://www.contentful.com/developers/docs/experiences/custom-components/)
  (fork-A). You can drag onto empty canvas or onto/into an existing
  selected element.
- **Layers**: the hierarchy tree, with an element-visibility toggle
  (hide/show per component) — [Editable
  patterns](https://www.contentful.com/help/studio/experiences/editable-patterns/)
  (fork-A). A third-party blog additionally described an "X-Ray mode" for
  inspecting nesting on this tab; a follow-up check strongly suggests that
  term is actually **Builder.io's**, not Contentful's — flagged UNVERIFIED,
  do not reuse without a primary source.
- **Settings** (the tab open in the screenshot): **page-scoped form
  metadata, not selection-driven.** Fields present: Preview Platform
  (dropdown with explanatory prose + a doc link), Title (internal, required,
  with a live character counter — "7 characters / Maximum 256"), Slug
  (required, with format-guidance prose), Meta Title, Meta Description, and
  OpenGraph Image (which itself carries its own Published-status chip and
  overflow menu — an asset nested inside page settings has its own
  publish lifecycle). **Every field carries inline guidance text** — this
  tab reads as a documented form, not a bare property grid. (screenshot)
- Nesting depth is deliberately capped: patterns can nest at most three
  levels deep (a parent pattern plus two nested levels) — [Nested
  patterns](https://www.contentful.com/help/studio/experiences/nested-patterns/)
  (fork-A). A pattern author can also mark specific design properties as
  the _only_ ones editable when the pattern is reused elsewhere — a
  documented locked/read-only mechanism, though the exact visual treatment
  (greyed out vs. hidden vs. lock icon) is UNVERIFIED.

### Right panel

Two tabs: **Design | Content**.

- **With nothing selected** (the screenshot's state): Design shows
  **canvas-scoped context, not an empty panel** — a Breakpoints list (All
  Sizes "Desktop first", Tablet "<992px", Mobile "<576px") plus explanatory
  prose ("Design changes will apply to all screen sizes that are equal or
  smaller…"). **The convention this establishes: an unselected right panel
  still shows something scoped to the current editing context (here,
  breakpoint behavior), never a blank state.** (screenshot)
- **With a component selected**: Design shows that component's style/layout
  properties; Content shows its data bindings. The mechanism is variable-
  typed at the component-definition level — "variant properties provide a
  select input in the design sidebar for styling [Design tab]... text
  properties enable content binding [Content tab]" — [Component definition
  schema](https://www.contentful.com/developers/docs/experiences/component-definition-schema/)
  (fork-A). Binding itself has two stages: a content-model-level **pre-bind**
  (map a component prop to a content-type field as a default) and
  per-instance binding directly on canvas — [Pre-bind
  content](https://www.contentful.com/help/studio/experiences/pre-bind-content/)
  (fork-A).
- Selection → panel is confirmed directly: "Once components are added to
  the canvas, you can switch to the Content tab... when a component is
  selected, its content properties are displayed" (fork-A, same family of
  docs).
- A **Comments** tab and an **Animate** tab exist in the same tab group,
  per a secondary source (webstacks.com blog paraphrasing Contentful docs,
  UNVERIFIED against primary) — real-time/async commenting scoped to the
  experience, and scroll/entrance-animation properties as a category
  distinct from static Design properties.
- **Design tokens**: a separate governance layer — "tweak colors, fonts, or
  spacing in the design tokens panel, and see changes instantly across
  every page… preventing authors from deviating from approved styles" (a
  2026 Contentful Studio update, loosely sourced via WebSearch snippet,
  UNVERIFIED exact doc URL). Functions as a brand-consistency guardrail
  underneath the Design tab, not a competing panel.
- **"No editable properties" empty state**: NOT FOUND despite targeted
  search. Genuine documentation gap in the sources reached this pass, not
  confirmed either way.

### Canvas

Screenshot's captured state is a **pure preview surface**: an empty dotted
grid with a centered placeholder mark, read as a loading/empty state — **no
edit chrome rendered on the canvas itself** (no visible hover outline, no
inline toolbar) at the moment captured. (screenshot) This is consistent
with fork-A's broader read that the canvas renders inside an iframe as the
literal experience output — [Contentful Studio
blog](https://www.contentful.com/blog/contentful-studio-experiences-sdk/)
(fork-A, WebSearch snippet).

Canvas _micro-interactions_ — hover-before-select outline, double-click to
enter a nested pattern, breadcrumb/path indicator, Esc-to-deselect,
arrow-key sibling stepping, multi-select — were **not found** in any
reachable Contentful source across three independent targeted searches.
This is a real material gap, not an inference that these don't exist;
treat every such Contentful-specific micro-interaction claim as
**UNVERIFIED**, and lean on the cross-CMS convergence table below (§b) as
the best available proxy for what Contentful "probably" does, since every
other layout-owning competitor converges on the same handful of patterns.

### Save / dirty / draft-published / versioning

- Save and Change-status are two separate, always-visible top-bar actions
  (screenshot) — this decouples "my edit is persisted" from "my edit is
  live," which is the same decoupling every other product researched makes
  (see §b convergence row "Save model").
- Generic entry status model — DRAFT / CHANGED / PUBLISHED / ARCHIVED — is
  confirmed via two independent docs pages (cited above); CHANGED is the
  interesting one: **"dirty since last publish" is a first-class, named
  status**, not merely an unsaved-changes toast.
- **Version history**, Experiences-specific: "compare your current version
  to a past version… view two versions side-by-side and roll back" —
  [Version history in
  Experiences](https://www.contentful.com/help/studio/experiences/version-history-in-experiences/)
  (fork-A, WebSearch snippet). **Critical constraint, confirmed**: "you can
  restore only published experiences (major versions) — you cannot restore
  to a version that was saved or auto-saved, but not published." That
  single sentence establishes two things at once: autosave exists as a
  background durability mechanism, and **only publish events are durable,
  restorable checkpoints** — an autosaved draft is not itself a version you
  can return to. Access is via a "⋯" menu → "View version history," a left
  sidebar lists past versions, "Compare with current" opens a side-by-side
  diff view. A further caveat: restoring an old version re-renders it under
  the _current_ SDK version, not the SDK version active when it was
  authored — a real gotcha for anyone modeling our own revert as a full
  time-machine.
- Versioning is scoped to the "master environment" only (fork-A,
  UNVERIFIED against primary).

### Stated design rationale (the "why")

Best-sourced material in this whole section, from Contentful's own blog
(via WebSearch snippet, fork-A): **"Contentful Studio separates content and
design, with content only connected to design when placed in a context
using Studio. This allows editorial teams to customize content without
interfering with design, while design teams retain creative control
without fear of their designs being disrupted by editorial changes."**
Paired with an explicit four-persona model — Developers (SDK/component
registration), Designers (component + design-token authoring), Marketers
(canvas assembly), Editors (Content-tab binding) — and a stated product
goal: **"shift responsibility for building layouts from developers to
marketers… allowing non-technical personas to make critical changes
without running through the entire development lifecycle."** This is the
direct analogue of our own product owner's framing: the entire Design/
Content split exists to let a non-engineer safely reconfigure a page
without a developer in the loop, with design tokens as the guardrail that
keeps that freedom from breaking brand consistency.
Source: [Contentful Studio
blog](https://www.contentful.com/blog/contentful-studio-experiences-sdk/)
and adjacent posts (fork-A, WebSearch snippet, UNVERIFIED exact wording
against primary due to 429s, but two independent snippets agreed closely).

---

## b. Cross-CMS convergence table

Rows = IA slot. Columns = product. "TBD" cells for Contentful are filled
from §a where confirmed, else left as noted.

| IA slot                        | Contentful                                                                                                                                                        | Webflow                                                                                                                  | Framer                                                                                                  | Builder.io                                                                                    | Wix Studio                                                                          | Storyblok                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Left rail                      | Components / Layers / **Settings** tabs (screenshot)                                                                                                              | Navigator (hierarchy tree only)                                                                                          | Layers (hierarchy + rename/lock/group)                                                                  | Layers tab (hierarchy + binding/action indicators)                                            | Layers panel, sectioned header/main/footer                                          | No confirmed hierarchy tree — field/schema panel instead (unverified)                                              |
| Right panel split              | Design / Content tabs, selection-driven; unselected state shows breakpoint context, never blank (screenshot)                                                      | Style panel (design) **and** separate Element Settings panel (structural, breakpoint-independent) — two panels, not tabs | Single unified Properties panel (style+settings, no split)                                              | Explicit Style / Data / Animate / Comments tabs — cleanest design-vs-content split researched | Single Inspector (unified)                                                          | Schema-driven fields only — **no design/style panel at all**                                                       |
| Canvas relationship to output  | iframe rendering the real experience (unverified detail)                                                                                                          | Design surface rendering the real site                                                                                   | **Canvas literally is the live site**                                                                   | Design surface with breakpoint preview                                                        | Design surface                                                                      | **iframe of the actual running frontend app**                                                                      |
| Hover-before-click highlight   | UNVERIFIED (not found)                                                                                                                                            | Yes, confirmed (blue outline)                                                                                            | Assumed/standard, not explicitly doc-cited                                                              | Not explicitly doc-cited                                                                      | Not explicitly doc-cited                                                            | Outline appears on interaction with preview elements                                                               |
| Enter-nested-component gesture | UNVERIFIED (not found); 3-level nesting cap is documented                                                                                                         | Double-click instance → edit main component; Up-arrow / right-click "Select Parent" to ascend                            | Double-click/Enter to descend; Cmd/Ctrl+Enter = first child; double-click instance opens its own canvas | Not explicitly doc-cited                                                                      | **Breadcrumb bar** (persistent, bottom-left, click any ancestor)                    | Click-through opt-in per component via `storyblokEditable()` bridge tagging — developer-implemented, not automatic |
| Esc to deselect                | UNVERIFIED                                                                                                                                                        | Yes, confirmed                                                                                                           | Standard, not explicitly cited                                                                          | Not explicitly cited                                                                          | Not explicitly cited                                                                | N/A (different architecture)                                                                                       |
| Multi-select                   | UNVERIFIED                                                                                                                                                        | Shift+click in Navigator; canvas multi-select limited/inconsistent (open feature request)                                | Not explicitly cited                                                                                    | Not explicitly cited                                                                          | Not explicitly cited                                                                | Not applicable                                                                                                     |
| Inline text edit on canvas     | UNVERIFIED                                                                                                                                                        | Assumed standard                                                                                                         | Standard (canvas = real site)                                                                           | Double-click a Text block → inline edit, "/" opens slash-command menu                         | Assumed standard                                                                    | Not applicable — text edited via field panel                                                                       |
| Top-bar publish action         | **"Change status" dropdown**, separate from a quiet secondary **Save** (screenshot); publish is a checkbox-selectable reference-publish dialog, not a flat button | Autosave continuous + 50th-snapshot backup; explicit "Create Backup"; Publish separate                                   | Autosave continuous, decaying-resolution snapshots (5 min → hourly → daily)                             | **Three explicit save tiers**: All (autosave) / Checkpoints (Cmd+S) / Publishes               | Autosave (armed only after first manual save — a real outlier); toggle-able         | Explicit Save = draft state; separate Publish action; 3-publishes/day cap on some plans                            |
| Draft vs. published states     | DRAFT / **CHANGED** / PUBLISHED / ARCHIVED — dirty-since-publish is a named status, not a badge                                                                   | Implicit — Designer state vs. published site                                                                             | Staging environment mirrors live for pre-publish testing                                                | Explicit Draft/Published field per entry                                                      | Implicit                                                                            | Explicit draft/published API versions                                                                              |
| Approval workflow gate         | UNVERIFIED                                                                                                                                                        | None                                                                                                                     | None                                                                                                    | "Request to Publish" (adjacent feature)                                                       | None                                                                                | **Explicit 3-stage gate** (Drafting → Reviewing → Ready to publish); only "Ready" can publish                      |
| Undo/redo                      | **Present in top bar, beside the breakpoint switcher** (screenshot)                                                                                               | Not separately documented (assumed standard)                                                                             | Cmd/Ctrl+Z (assumed standard)                                                                           | Cmd+Z / Ctrl+Shift+Z, confirmed                                                               | Not confirmed                                                                       | N/A                                                                                                                |
| Version history UI             | "⋯" menu → version list → side-by-side compare → restore; **only published versions are restorable**, restore uses current SDK                                    | Flat list, last 30, preview-then-restore, non-destructive (auto-backs-up before restore)                                 | File → Version History; **copy-elements-out** model instead of blunt restore                            | 3-tab History (All/Publishes/Checkpoints), one-click revert                                   | Site History log (who/when); **restore is destructive** (discards everything after) | Two-pane History (list + color-coded diff); restore replaces wholesale                                             |
| Presence / avatars             | User avatar shown top-right (screenshot)                                                                                                                          | Not confirmed                                                                                                            | Not confirmed                                                                                           | Not confirmed                                                                                 | Not confirmed                                                                       | Not confirmed                                                                                                      |

### Where all convergence-table products agree (adopt without debate)

1. **Left rail = structural hierarchy, independent of the right panel's
   content.** Every layout-owning product has this; Storyblok's absence is
   explained by it not owning layout at all — the exception proves the
   rule rather than breaking it.
2. **Canvas selection drives the right panel; the right panel is never
   browsed independently of selection.** No product has a competing
   "global settings" panel fighting the element-properties panel for the
   same visual slot — where page-level settings exist (Contentful), they
   live in a _different_ rail tab, not the same slot as element
   properties.
3. **Autosave is baseline; publish is a separate, explicitly named action,
   without exception.** Granularity varies enormously (Wix's
   armed-after-first-save model, Builder.io's 3-tier model, Framer's
   decaying-resolution snapshots) but every product distinguishes "my
   draft persists" from "this is now live."
4. **Non-destructive-by-default history browsing.** You can preview a past
   version before committing to restore it — Webflow's eye-icon, Framer's
   copy-out, Builder.io's revert-with-confirmation, Storyblok's diff view,
   Contentful's side-by-side compare. Wix Studio is the lone outlier
   (destructive restore, no preview-before-commit confirmed) — worth
   naming as the anti-pattern to avoid.

### Where they diverge, and why

- **The Design/Content tab split exists specifically where a tool serves a
  non-technical content author separately from whoever owns layout code**
  (Contentful, Builder.io). Single-persona visual builders (Webflow,
  Framer, Wix Studio) don't need the split because one person owns both
  halves. Storyblok has _only_ content because it deliberately owns zero
  layout — that's the frontend integrator's job. **This maps directly onto
  our situation**: curriculum authors are not the engineers who built the
  Oceans/Maze/Music labs, so a design/content-shaped split (level-wide
  _settings_ vs. per-experience _content_) is the right-shaped convention
  to borrow, not an arbitrary choice.
- **Approval-workflow gates exist only in headless/content-team products**
  (Storyblok's 3-stage workflow, Builder.io's Request-to-Publish);
  single-owner visual builders skip editorial gating entirely. This tracks
  team size and role separation, not tooling sophistication.
- **"Canvas IS the real thing" vs. "canvas previews the real thing" splits
  the group cleanly.** Framer and Storyblok both collapse the
  design/production distinction; Webflow/Wix/Builder.io/Contentful keep a
  rendering abstraction between editor canvas and shipped output. Author
  Mode is unambiguously in the first camp — the canvas **is** the exact
  student-facing runtime, not a preview of it — which is the single
  biggest reason CMS conventions need adaptation rather than adoption; see
  §e.

---

## c. Recommended IA for Author Mode

### Top bar

| Region                     | Recommendation                                                                                                                                                                                                                                   | Rationale                                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Back / breadcrumb          | Keep current back-arrow + course·unit·lesson title stack                                                                                                                                                                                         | Matches convergence row 1; no change needed                                                                                                                                                             |
| Status                     | **Add** a status chip next to the lesson title: Draft / Changed / Published-equivalent-for-curriculum ("Live in [changeset]"), mirroring Contentful's DRAFT/CHANGED/PUBLISHED vocabulary                                                         | We have zero status surface today (see §d gap 1)                                                                                                                                                        |
| Progress nav               | Keep the progress-dot bubbles — they are the equivalent of Contentful's canvas-scoped context, own navigation, no change needed                                                                                                                  | Already matches; no CMS studied puts primary navigation in the top bar center the way we do, but ours is learner-navigation, not editor-navigation — a legitimately different, correctly-scoped concept |
| Breakpoint/device switcher | **Not applicable** — our "canvas" renders one fixed learner surface per lab, not a responsive page; do not add                                                                                                                                   | Would be cargo-culting a slot that has no referent in our domain                                                                                                                                        |
| Undo/redo                  | **Add**, scoped to the append-only CurriculumChange log we already have                                                                                                                                                                          | We already have exact data (revert-by-entry) to back a real undo stack; today it's only reachable via a History popover deep in the course page, not the lesson-level top bar (see §d gap 2)            |
| Save                       | Keep explicit per-panel Save (matches Wix/Storyblok's explicit-save-as-draft model) — do not add silent autosave to level/instructions edits, since a bad edit to a live level's grid needs the solvability gate to run before anything persists | Matches convergence row 3's "autosave baseline, publish separate" _pattern_, but our "autosave" is deliberately gated per-field, not continuous — a defensible, documented divergence, not an oversight |
| Publish                    | **Add** a "Publish" action distinct from Save, surfacing the existing `/api/publish` → `buildChangeSet` machinery that has zero UI today (see §d gap 1)                                                                                          | We already have the backend; only the top-bar affordance is missing                                                                                                                                     |
| Presence/avatar            | Skip for now                                                                                                                                                                                                                                     | No multi-author concurrent-editing story yet; premature                                                                                                                                                 |

### Left rail

Adopt Contentful's **tabbed, always-available** model, not our current
**mode-switching** model (see §d gap 3 for why the difference matters):

- **Outline** tab — the existing `OutlineRail`: experience list, reorder,
  remove, insertion points. Always reachable, regardless of what's selected
  on the stage.
- **Level settings** tab — what `LevelRail.tsx`'s `LevelSettings` branch
  already builds (start direction, map palette, toolbox tray, start-blocks
  editing) for the active level. Currently this _replaces_ Outline instead
  of living beside it as a second tab; that's the one structural fix this
  section recommends.
- No **Components** tab equivalent is needed at the rail level — "adding a
  new element" in our world is authored through chat (agent tool calls) or
  the stage's `InsertPoint` affordance, not drag-from-a-palette. This is a
  legitimate, product-shaped divergence, not a gap: Contentful's Components
  tab exists because _authors assemble pages from a component library_;
  our authors describe intent to an agent that writes levels/widgets. Do
  not force a component-palette tab to exist just for IA-parity's sake.

### Right panel

Keep the current click-to-open, single-purpose panel, but narrow its scope
now that level-wide settings move to the left rail:

- **Content** — per-experience content editing: `longInstructions`,
  content markdown, multi/match/video/bubbleChoice field editors from the
  properties-panel design doc's descriptor table. This is the Content-tab
  half of Contentful's split.
- Nothing analogous to Contentful's Design tab is needed here, because our
  "design" concerns (level-wide settings: skin, start direction, toolbox,
  map) are the left-rail Settings tab's job under this recommendation, not
  a second right-panel tab. One property, one home — do not duplicate
  `startDirection` in both places.
- Empty/no-editable-props state: already handled correctly today —
  `PropertiesPanel.tsx:91` renders "Nothing to edit here" when
  `levelNumericId` is undefined. Keep this; it is the exact behavior
  Contentful's own docs left undocumented (§a, "no editable properties"
  gap) — we already have an answer they don't publicly show.

### Canvas

Keep direct manipulation as-is (map tile painting, block dragging inside
the mounted lab) — this is already the right call per §e: our canvas is a
runnable surface, not a design surface, so CMS click-to-select conventions
apply only to the chrome _around_ the lab (`.labStage`, instructions block,
content card), never to hit-testing inside the mounted Blockly workspace.
This matches every runnable-canvas precedent in §e: none of them make the
running surface itself individually click-selectable at the DOM-node
level; they gate a mode boundary around it instead.

### Selection/keyboard model

- Keep click-to-select (not hover-to-select) — already decided, matches
  Contentful (hover-highlight-only, click-opens convention, per the
  LessonPlayer.tsx comment: "hover is discoverability-only... product
  decision, 8/27").
- **Add Esc-to-deselect/close** — already implemented per-panel via
  `useEscapeKeyHandler` (`PropertiesPanel.tsx:78`); this is consistent
  with every product in §b that documents it. No gap here, just confirm it
  extends to the left-rail Settings tab once that lands.
- Arrow-key sibling-stepping, multi-select: **skip**. No convergence-table
  product confirms multi-select as solid (Webflow's is a known limitation;
  everyone else UNVERIFIED), and our selection universe per screen is a
  handful of experiences, not a dense page tree — the keyboard-navigation
  investment CMS editors make to tame hundreds of DOM nodes doesn't pay
  off at our scale.

### Save/dirty/publish wrapper

- Keep per-section explicit Save + dirty-gated section-switching (already
  correct — `LessonPlayer.tsx`'s `handleSectionClick` refuses to switch
  panels while dirty, exactly the "don't discard an in-progress edit on a
  stray click" convention every product implicitly guarantees via
  autosave; ours guarantees it by refusal instead, which is an equally
  valid, arguably more honest answer given we don't autosave).
- **Wire `/api/publish` to a top-bar Publish button** (gap 1).
- **Promote `ChangeHistory`'s revert-per-entry into a real undo affordance**
  reachable from the lesson header, not only the course-overview page (gap 2) — the data model (server-captured `previous`, exact revert) already
  matches what Contentful's version-compare/restore needs; only the
  discoverability and top-bar wiring are missing.
- Status chip: Draft (has unpublished changes) / Published (nothing pending
  since last `/api/publish` call) — cheap to compute from
  `changes.jsonl`'s tail vs. the last `publish-*.json` artifact's
  timestamp, no new state needed.

---

## d. Gap list, ordered by user-visible impact

1. **No status/publish surface anywhere in the top bar.** The backend
   already has `POST /api/publish` (`apps/authoring-service/src/server.ts:309`)
   building a real `PublishedWidget[]`/changeset artifact
   (`apps/authoring-service/src/publish/buildChangeSet.ts`), and
   `authoringApi.publish()` (`apps/studio/src/modules/authoring/api.ts:156`)
   is a fully wired client call — **with zero UI callers** (confirmed via
   repo-wide grep). An author can accumulate any number of changes and has
   no in-product way to know whether "publish" has ever been run, or to
   run it. This is the single largest gap against Contentful's
   Save/Change-status pair (§a) and against every product in §b's "autosave
   baseline, publish separate, always visible" convergence row.
2. **No undo/redo, despite having the data to back one.** The
   `CurriculumChange` log is append-only with server-captured `previous`
   values and a working revert path (`apps/studio/src/modules/authoring/revert.ts`,
   `ChangeHistory.tsx`'s per-entry Revert button) — but that surface is
   only reachable from the course-overview page's History popover
   (`routes/author/$courseId/index.tsx:61-66`), not from the lesson-level
   editing view where changes actually happen, and it presents as a
   _list to browse and revert one entry from_, not an Undo/Redo pair a
   keyboard shortcut or top-bar button drives. Contentful puts undo/redo
   directly in the top bar next to the breakpoint switcher (screenshot);
   every §b product treats undo/redo (or its equivalent, version restore)
   as ambient and immediate, not a drill-down. We have the hard part
   (exact, safe reverts); the affordance is what's missing.
3. **Left rail is a mode-switch, not a tabbed always-available rail —
   and this is happening live, right now, uncommitted.** `LevelRail.tsx`
   (new file, untracked, dated today) already implements the product
   decision described in the task brief — level-wide settings move to the
   left rail, replacing the outline — but its own doc comment states the
   cost plainly: _"the outline's type chips are not offered in that
   state"_ (`LevelRail.tsx:50-55`). Concretely: while a maze level's
   settings occupy the rail, an author cannot see or jump to sibling
   experiences via the rail at all — only the top progress bubbles remain
   for navigation, and they carry no type/kind information (no icon, no
   "content" vs. "level" vs. "widget" tag) the way `OutlineRail`'s rows do.
   Every §b product with a Settings-equivalent (Contentful's own
   Components/Layers/Settings) keeps _all three_ reachable as sibling
   tabs — you never lose the hierarchy view because you opened settings.
   §c's recommendation (tab Outline and Level-settings as siblings, not a
   toggle) is a small structural change from what's already been built,
   not a redesign — and it directly restores what the current WIP's own
   comment flags as a cost.
4. **No draft/dirty vs. published status is visible per-experience or
   per-lesson**, only per-panel-section (the `panelDirty` flag gates
   switching panels, but nothing shows an author "this lesson has 6
   unpublished edits"). Contentful's CHANGED status and every §b product's
   draft/published distinction is scoped to the _content unit being
   edited_, visible without opening anything. Once gap 1 lands (a
   publish timestamp exists to compare against), this is a cheap
   derived-state addition, not new plumbing.
5. **No breadcrumb/path indicator for "what am I inside of right now."**
   Minor relative to 1–3, but real: Wix Studio's persistent breadcrumb
   bar and Framer/Webflow's parent-selection gestures all answer "what's
   the ancestor chain of my current selection" — we have no equivalent,
   though our hierarchy is shallow enough (course → unit → lesson →
   experience → field) that the lesson header's `course.displayName ·
unit.displayName` plus the active row's highlight in `OutlineRail`
   substantially covers this already. Low priority: revisit only if the
   left-rail restructuring in gap 3 removes the outline's highlight as an
   implicit breadcrumb.
6. **No presence/avatar indicator.** Matches Contentful (screenshot) and is
   listed in §b, but is genuinely low priority absent a multi-author
   concurrent-editing story — correctly out of scope for now, not a
   silent omission.

### What already matches, no action needed

- Hover-highlights-then-click-opens-panel selection model — matches
  Contentful's stated convention exactly (`LessonPlayer.tsx` comment,
  8/27 product decision).
- Right panel's selection-driven, single-purpose-per-click-target model —
  matches §b convergence row 2 exactly.
- Explicit per-section Save with dirty-gated switching — a defensible,
  documented alternative to autosave that still honors §b convergence row
  3's underlying guarantee (never silently discard an edit).
- "Nothing to edit here" empty state on the right panel
  (`PropertiesPanel.tsx:91`) — Contentful's own equivalent is
  undocumented; we already have a considered answer.
- Esc-to-close on the properties panel — matches every §b product that
  documents this.
- Canvas never hit-tests into the mounted lab's own DOM/Blockly workspace
  (`.labStage` is the click target, not the lab's internals) — matches
  every runnable-canvas precedent in §e; this was evidently a deliberate,
  correct call already, not something borrowed from CMS conventions
  (CMS editors don't have this problem at all).

---

## e. What does not transfer, and our play/edit-mode answer

### Where CMS conventions break

Every product in §b treats the canvas as either a rendering of the shipped
output (Webflow, Wix, Builder.io, Contentful) or literally the shipped
output itself (Framer, Storyblok) — but in both cases, **the thing under
the cursor is inert until a human interacts through the editor's own
selection layer.** Our canvas mounts a live Blockly puzzle: the moment a
lab renders, a student (or an author testing it) can drag blocks, click
Run, and drive real interpreter state — the DOM under the cursor is not
"design that happens to look like content," it's a running program with
its own event handlers competing for the same clicks a CMS would use for
selection. No CMS studied has this problem at all; it's a category
difference, not a UX nuance to smooth over.

### What runnable-canvas tools do instead — convergent pattern

Sourced from Figma, Articulate Storyline, H5P, Roblox Studio, Unity,
Unreal Engine, and Plasmic (fork-C; see inline citations in that fork's
findings, folded in below):

1. **Suppress editing/selection affordances during run, by default.**
   Figma's Presentation view hides all editing tools entirely — [Play your
   prototypes](https://help.figma.com/hc/en-us/articles/360040318013-Play-your-prototypes).
   Unity darkens the whole non-Game-view chrome and offers a dedicated
   "Play Mode Tint" preference specifically so authors don't forget
   they're in a live session — [Unity Manual: Game
   view](https://docs.unity3d.com/6000.2/Documentation/Manual/GameView.html),
   [Play Mode
   Tint](https://whitepotstudios.com/blog/unity-tip-play-mode-tint/).
   Roblox Studio explicitly disables selection tools during Test mode —
   [Studio testing
   modes](https://create.roblox.com/docs/studio/testing-modes). This is
   the majority pattern, and it's what we already do structurally: the
   mounted `<Lab>` is never a click-target for the properties system.
2. **The one documented exception is opt-in, not default.** Unreal's
   Simulate-in-Editor mode keeps full editor/selection access _while the
   simulation runs_, toggled live against Play-in-Editor via Eject/Possess
   (`F10`) — [In-editor
   testing](https://dev.epicgames.com/documentation/unreal-engine/ineditor-testing-play-and-simulate-in-unreal-engine).
   Plasmic's "Interactive" canvas toggle is the closest sibling-domain
   precedent (a CMS-shaped tool with genuinely stateful components): turn
   it on to click real buttons/forms and drive real state changes without
   leaving the editor; turn it off to return to select-and-edit — [Plasmic:
   interactive
   editing](https://plasmic.substack.com/p/introducing-new-simplified-canvas).
3. **Ephemeral, provably non-destructive run state.** Unity: "any changes
   you make [in Play mode] are temporary and are reset when you exit."
   Roblox: Stop "resets all objects and instances to how they were before
   the playtest." Both guarantee running the thing can never leak into the
   authored artifact unless explicitly committed — directly relevant to us
   since a Blockly puzzle's runtime state (block execution, sprite
   position) must never silently become part of the level definition.
4. **A visible, specific return-to-edit affordance, not just "stop."**
   Storyline's Preview ribbon includes "Edit Slide," which returns you to
   the _exact slide you were previewing_, not a generic close —
   [Previewing a
   course](https://www.articulatesupport.com/article/Storyline-360-Previewing-a-Course).
   This is the most directly reusable precedent for us: our runnable
   object (a Blockly puzzle) has an obvious "current position" analogue —
   which experience, which block/step — that a return-to-edit action
   should anchor to, the same way Storyline's does.
5. **Nielsen Norman Group's mode-slip theory names the failure we're
   trying to avoid**: users forget which mode is active and act as if in
   the other one — [Modes: when they help and when they hurt
   users](https://www.nngroup.com/articles/modes/). Their prescribed
   mitigation is redundant visual signaling (at minimum two simultaneous
   cues, e.g. chrome color plus cursor change), not a single subtle
   button-state change — and Roblox's own developer forum shows the
   real-world cost of getting this wrong: repeated, years-long complaints
   that Studio's select tool stays partially active during Test mode and
   interferes with play-testing —
   [devforum.roblox.com](https://devforum.roblox.com/t/disable-selecting-while-play-testing-in-studio/875746).
   **This is a direct, named cautionary precedent against a half-measure**
   — we must not ship a state where hover-highlight is "mostly off but
   sometimes fires" while a lab is actually running.

### Recommended play/edit-mode answer for Author Mode

Given the above, and that our runnable surface is always a single mounted
`<Lab>` per screen (never a page full of independently-runnable widgets,
unlike a game engine's whole scene):

- **Default: suppress, structurally, not via a toggle.** Keep the current
  design where `.labStage` — not the lab's internal DOM — is the only
  click target author mode ever wires up. This already matches the
  majority pattern (§e.1) and needs no new mode machinery, because we
  never attempt to make the running puzzle itself selectable in the first
  place — there's no mode to slip out of because edit-affordances were
  never live over the running surface to begin with.
- **No Unreal/Plasmic-style "interactive-while-editable" toggle is needed
  for Blockly puzzles specifically** — an author testing a puzzle they're
  building already has the real Run button the puzzle itself exposes;
  layering a second "author test mode" on top would be the kind of
  redundant machinery §e.1's majority-pattern tools deliberately avoid.
  Reserve this pattern (if ever needed) for a hypothetical future
  element type where editing genuinely needs to happen _while_ something
  is running (e.g., live-tweaking a widget's input schema while watching
  it render) — not for the puzzle canvas as it exists today.
- **Do add a Storyline-style anchored return.** When an author leaves the
  stage to go configure a sibling experience or a level setting and comes
  back, land them on the same experience, same scroll position — this is
  already true today (`activeExperienceId` persists across
  `panelSection`/`selection` state changes in `LessonPlayer.tsx`), so this
  is confirmation, not a gap.
- **Do add a visible mode signal for "student view."** `LessonPlayer.tsx`
  already has a Student-view toggle that strips all author chrome — but
  per NN/g's redundant-signaling prescription, verify (outside this
  research pass's scope; a UI audit, not a research question) that the
  transition into student view is visually unmistakable beyond the button
  label changing from "Student view" to "Back to authoring" — e.g., no
  chrome-color or border change currently signals which mode is active
  once the toggle has been clicked and the button has scrolled out of
  view. This is the one place our own product already has the _shape_ of
  the mode-slip risk NN/g and the Roblox forum both warn about, and it's
  worth a follow-up look, not a finding this research pass can resolve
  from documentation alone.

---

## Sources consulted

Contentful (fork-A + my own verification, WebSearch/WebFetch — WebFetch to
contentful.com was 429-rate-limited throughout; snippet-sourced except
where marked "(screenshot)"): Entry editor sidebar overview, Determine the
state of entries and assets, Publish an experience, Version history in
Experiences, Custom components, Editable patterns, Nested patterns,
Component definition schema, Pre-bind content, Contentful Studio blog —
all at contentful.com/help or contentful.com/developers/docs or
contentful.com/blog, as linked inline above.

Cross-CMS (fork-B): Webflow Help Center (Navigator, Style panel, Canvas
overview, Keyboard shortcuts, Components overview, Save/restore backups),
Webflow Wishlist/Discourse (multi-select limitations); Framer (Layers
Panel Guide, Academy shortcuts lesson, Shortcuts page, Help articles on
version history, Publish page); Builder.io Docs (Layers Tab, Bind Data,
Intro to Visual Editor, Top Bar Tour, Publish content, History) and
Builder.io forum; Wix Support (Guided Tour, Inspector Panel, Layers Panel,
Page Structure, About Autosave, Site History, Restore limitations);
Storyblok Docs (Visual Editor concepts, Content Authoring, Workflows,
History) and Storyblok FAQ (publishing limit).

Runnable-canvas (fork-C): Figma Help Center (Guide to prototyping, Play
your prototypes, Design mode in Slides); Articulate Support (Previewing a
Course, Adding and Editing States, Working with Triggers); H5P
documentation (The basics, Editing interactive video); Scratch Wiki (User
Interface, Green Flag); Roblox Creator Docs (Studio testing modes) and
Roblox DevForum threads (select-tool-during-test complaints); Construct 3
manual (Testing projects); Unity Manual (Game view) and third-party Unity
tip posts (Play Mode Tint); Unreal Engine Docs (In-editor testing: Play &
Simulate); Plasmic blog (interactive canvas editing); Nielsen Norman Group
(Modes: when they help and when they hurt users).

Local codebase, read directly for §d/§e grounding:
`frontend/apps/studio/src/modules/authoring/components/LessonPlayer.tsx`,
`OutlineRail.tsx`, `LevelRail.tsx` (untracked, in progress),
`PropertiesPanel.tsx`, `ChangeHistory.tsx`, `ExperienceStage.tsx`,
`authoring.module.scss`; `frontend/apps/authoring-service/src/server.ts`,
`src/publish/buildChangeSet.ts`, `src/store/SessionStore.ts`;
`frontend/apps/studio/src/modules/authoring/api.ts`,
`frontend/apps/studio/src/routes/author/$courseId/index.tsx`;
`frontend/docs/prototypes/author-mode.md`,
`frontend/docs/prototypes/author-mode-properties-panel.md`.
