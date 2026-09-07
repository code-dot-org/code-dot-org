# The progression, on screen

[PROGRESSION.md](./PROGRESSION.md) designs the catalogue: what the tiles are,
what they unlock, and what counts as having learned one. It is data, and this
document is where a learner touches it.

Two questions, and the second is the interesting one.

- **Where does a map of sixty-seven hexagons live** in a page that is already an
  instructions panel, a file tree, a block editor, a game and a console?
- **What happens when a tile is chosen?** The answer this design commits to is
  that a tile carries LEVEL PROPERTIES — the same shape a level has — and every
  surface that shows a lesson shows those properties rather than a second copy
  of them written by hand.

## Where it opens from

The page has four places a new affordance could go, and three of them are
wrong.

**Not a resource-panel tab.** The panel is about 320px wide and collapses to an
icon strip; a hex map needs the width of the page. `Tabs` is also a base
concept every lab shares (`resourcePanel/types.ts`), so a world-only tab would
be a world-only entry in a shared enum.

**Not the workspace header.** That header belongs to the file being edited —
the view-mode buttons and the Blockly controls. A skill tree is not a fact
about the current file.

**Not the preview header.** That belongs to the running game.

**A modal, opened from the resource panel's bottom icon strip.** The strip
(`resourcePanelLinksElementId`) already holds Extra Links, Documentation,
Disclaimer, Copyright and Settings — the things that are about the SESSION
rather than about the code. The progression belongs with those, and
`ButtonWithDialog` is the pattern already used there.

That strip is a fixed list today with no slot for a lab, so this costs **one
new prop on the base `ResourcePanel`**:

```ts
/** Lab-contributed buttons for the bottom icon strip, rendered first. */
extraLinks?: ReactNode;
```

Passed through `InfoPanel` (Codebridge) the way `extraSettings` and `aiTutor`
already are. Generic enough to be worth having in base regardless of this
feature: every lab eventually wants one of these.

### One opener, many callers

The modal is not opened only from that button. [PROGRESSION.md's revisit
section](./PROGRESSION.md#revisiting-a-lesson) puts a link back to a lesson on
the rule import dialog's rows, on a rule's toolbox category, and beside the
`use trait` eye. All of them open the SAME modal, focused on a tile.

So the opener is a context, not a `useState` in the layout:

```ts
interface Progression {
  catalogue: Catalogue; // tiles, regions, edges
  completed: ReadonlySet<TileId>; // what this learner has done
  stateOf(id: TileId): TileState; // done | open | shut
  openTree(focus?: TileId): void;
  closeTree(): void;
}
```

`ProgressionProvider` sits at the lab root beside `WorldRuntimeProvider`, and
renders exactly one modal. Rendering a dialog per opener is the bug this
prevents: two maps on screen, each with its own scroll position, and a close
button that closes only one of them.

### It should have a URL

A modal cannot be linked to, and "look at the Puzzle region" is a thing a
teacher will want to say in a sentence. That does not need a route: reflect the
open tile in a query parameter, `?tree=<tileId>` (`?tree` alone opens it with
nothing selected), read on mount and written on change. Cheap now, and it
removes the only real argument for making the tree a page instead of a modal.

## The modal

`CustomDialog` from `@code-dot-org/component-library/dialog` — arbitrary
children, focus trap, `Esc` to close, body scroll lock, a close button. Sized
by class to near the viewport: `min(1200px, 92vw) × min(800px, 88vh)`. The
`Dialog` sibling is the wrong one; it is a title, a body and two buttons.

```
┌───────────────────────────────────────────────────────┬───────────────┐
│  Progression            [ Map | List ]         [ × ]  │               │
├───────────────────────────────────────────────────────┤   detail      │
│                                                       │               │
│                    the map (SVG)                      │   the tile's  │
│                                                       │   level       │
│                                                       │   properties  │
│                                                       │               │
│                                                       │  [ Start ]    │
├───────────────────────────────────────────────────────┴───────────────┤
│  14 of 67 done · Motion complete · Puzzle needs Logic                 │
└───────────────────────────────────────────────────────────────────────┘
```

Two panes: the map, and a detail pane of about 360px. Below 900px wide they
stack, map above; below 600px the map is a scroller and the detail pane becomes
a sheet over it.

### The map pane

One SVG. Nothing here is canvas: sixty-seven polygons is not a rendering
problem, and an SVG is inspectable, styleable, printable and — the part that
matters — focusable element by element.

**Coordinates.** Pointy-top axial to pixels:

```
x = size * √3 * (q + r / 2)
y = size * 3/2 * r
```

The `viewBox` is computed from the extent of the placed tiles plus one tile of
padding. Adding a tile to the catalogue must never require editing a layout
constant, and this is the whole of how that is arranged.

**Layers, back to front:** region fills, region outlines, tiles, edges, region
names. Grouping by layer rather than by tile is what lets a region's fill sit
under every tile of that region, and an edge sit over the two tiles it joins,
without any z-index games.

**A region outline is the union boundary of its tiles.** Emit only the hex sides
not shared with a same-region neighbor. An outline drawn per tile gives a
honeycomb; a convex hull gives a shape the tiles do not fill. The survivors are
NOT walked into a joined path: one `<path>` of unjoined segments draws the same
picture at these stroke widths, and joining would only begin to matter for a
dash pattern or a gradient running along the outline.

**An edge is a bar across the shared side**, drawn only where a `requires`
exists — solid when the prerequisite is done, dashed when it is not — and drawn
ON TOP of the two tiles it joins. Not a line between centers: at any tile size
that fits a title, a center-to-center line is entirely hidden under the two
tiles. Under them, even the BAR shows only the sliver in the gap between two
tiles — four or five pixels carrying a whole relation. Over them, it reads as
the staple it is.

**Region names go outside the map, in a ring.** A region's centroid is by
definition covered in that region's own tiles, so a name written there is under
them; drawn above them instead, it lies across two titles. Pushing it out along
its own bearing until it clears its own region is not enough either — whatever
lies further out on the same line is what it collides with next, which for a
genre is its Making tile and for a foundation is the genre beside it. Push it
clear of the WHOLE map, and let the words run outward rather than centered, and
the twelve names sit in a ring around the picture, which is where a legend
belongs anyway.

**Zoom and pan.** The whole map fits by default and that is the intended way to
read it. Wheel/pinch zoom clamped to [0.5, 2.5], drag to pan, a "fit" control,
and `+`/`-`/`0` on the keyboard. Labels are hidden below a zoom where they stop
fitting — the detail pane and the list view carry the names, so nothing is lost.

**Three states**, as [PROGRESSION.md](./PROGRESSION.md#three-states-none-of-them-hidden)
specifies: done is filled with a stamp, open is outlined in the region color,
shut is gray with a padlock. A fourth mark, not a state: the tile whose lesson
is currently loaded gets a ring, so somebody who opened the map mid-lesson can
see where they are.

### The detail pane: level properties, presented

This is the part of the design worth being strict about.

When a tile is selected the detail pane renders **the tile's level properties**
— not a summary of them written a second time:

| Shown             | From                                                                  |
| ----------------- | --------------------------------------------------------------------- |
| the lesson itself | `levelProperties.longInstructions`, through `MainInstructionsContent` |
| what it unlocks   | the `Unlock[]`, each rendered as the row it will become               |
| what it needs     | `requires`, each with its state and a link to that tile               |
| the action        | `Start` / `Continue` / `Do it again`, by state                        |
| for a done tile   | "Open the finished example", read-only                                |

`MainInstructionsContent` (base, `instructions/components/`) is the component
the Instructions tab and the bubble preview already share; using it here is how
a lesson reads identically in the modal and in the panel. It is not exported
from `@code-dot-org/lab/instructions` today — **one line in
`instructions/components/index.ts`**, the second and last base change this
design asks for.

Rendering the real properties rather than a précis is not tidiness. It is the
only arrangement in which a curriculum author's edit to a lesson shows up
everywhere it is quoted, and it removes the second copy that would otherwise
drift within a month.

An unlock row should look like the thing it unlocks: a rule renders as its
import-dialog row (name, ability, the traits it provides), a block renders as
the block. A learner deciding whether to spend twenty minutes on `puzzle/push`
is deciding about `Can Be Pushed`, and a bullet point saying "Can Be Pushed"
tells them less than the trait row does.

### The list view is not a fallback

A toggle in the modal header, `[ Map | List ]`, and both are first-class. The
list groups by region and states in words everything the map encodes: title,
state, what it unlocks, what it needs. A learner scanning for "which lessons
teach me about text" is better served by the list, and a learner using a screen
reader is served by nothing else.

### Keyboard and screen reader

The map is a **grid of tiles with roving tabindex**: one tab stop for the whole
map, arrows to move within it, `Enter`/`Space` to select.

**Arrow keys move to the nearest tile in that screen direction**, not to a
named neighbor. Six neighbors do not map onto four arrow keys, and every
scheme that tries (modifier keys, `Q`/`E` for the diagonals) is a scheme
nobody discovers. Nearest-in-direction works with four keys, never gets stuck
at a region boundary, and crosses gaps in the map — which a strict-neighbor
walk cannot do at all.

- Each tile's accessible name says everything color says: **"Jumping.
  Platformer. Locked — needs Gravity."**
- Selection moves focus to nothing; the detail pane is `role="region"`,
  labeled by the selected tile, and updates in place. Movement announces the
  tile through its own accessible name, which is what a roving-tabindex grid
  gives for free — no `aria-live` on the map.
- Color is never the only carrier: stamp, padlock, and the words in the name.
- The dialog traps focus, `Esc` closes, and focus returns to the button that
  opened it — `CustomDialog` does all three.
- Contrast: region fills are backgrounds for text and must clear 4.5:1 against
  the label, in both themes. A shut tile is gray and low-contrast BY INTENT,
  which means its label must not be the only place its name appears — it is in
  the list view and in the detail pane.

See the `accessibility` skill for the standard (WCAG 2.2 AA).

## What happens on Start

A tile's lesson is `{source, instructions, levelData?}` — which is exactly
`WorldScenario` (`src/fixtures/scenarios.ts`). And `fixtureFor`
(`src/fixtures/index.ts`) already turns one of those into `LevelProperties`,
filling in everything a scenario does not vary.

So the shape this design needs mostly exists, and the honest description of the
work is: **a tile is a scenario with a tree around it.** Generalize
`fixtureFor` into `levelPropertiesFor(tile)`, and one function then serves the
detail pane, the dev-host mock, and any future level generator.

```ts
interface Tile {
  // …everything in PROGRESSION.md, plus:
  /** The lesson: a starting project, its instructions, its level settings. */
  lesson: WorldScenario;
  /** The studio level, when one exists. Absent until they do. */
  level?: {name: string; url: string};
}
```

### Three transports, and only one of them is for starting

**1. A studio level** — the eventual answer. The tile names a level; Start
navigates to it. Progress, teacher visibility and a per-level channel all come
free, because it is a real level and the machinery already exists.

It is blocked today, and the spec should say so plainly rather than assume it:
there is **no `World` level type in `dashboard/app/models/levels/`** (Python Lab
and Web Lab 2 have one; World does not), and no `.level` files. World Lab
reaches studio only as a project route,
`/app/projects/world/:channelId/edit`. Making the tiles into levels is a
dashboard-side piece of work — a `World < Level` model with `start_sources`,
and a generator that writes one `.level` file per tile from the catalogue.

**2. A project channel** — what works now. Each tile is a channel id; Start
navigates to `/projects/world/<tile-id>/edit`. This is the shape the dev host
and the mock API already serve: `WorldFixtures` maps a scenario tag to level
properties and the route's channel id picks the tag. Every tile authored this
way is playable and demonstrable the day it is written, before any dashboard
work exists.

**3. In place** — dispatch `onLevelChange({levelProperties, appOptions,
initialSources})`, the base action that `loadLab` itself ends with
(`redux/labSlice.ts`), swapping the level under the running lab with no
navigation.

**Transport 3 is not for starting a lesson.** The project that is open is the
learner's own game, and replacing its sources under it is how somebody loses a
week of work. It is for two things and nothing else:

- the **reader** — opening a finished example from a rule's back-link, in a
  read-only view that is thrown away on close;
- **catalogue authoring** — an author flipping between tiles without a page
  load.

**Start never touches what is open.** Whatever the transport, a lesson gets its
own channel. If the current project has unsaved edits, force a save before
navigating; `hasEdited` is already in the store and `ProjectManager` already
knows how to flush.

## Where progress is stored

**First, `localStorage`**, keyed by user id and catalogue version. It is enough
to build every screen here, enough to run the thing in a classroom for a week,
and honest about being temporary — a learner who switches machines loses their
tree, which is a sentence the first version can afford to say out loud.

**Then, derived.** If tiles become studio levels, tile completion is level
progress, and there is no second store to keep in step and no way for the two
to disagree. Prefer deriving it to storing it. A tile with no level yet — and
there will be a period where most have none — falls back to the local set, and
the merge is a union: anything done either way is done.

The catalogue carries a **version**, and a learner's stored set carries the
version it was written against. That is what makes the tile-id migration rules
in [PROGRESSION.md](./PROGRESSION.md#what-a-tile-is) enforceable rather than
aspirational.

## Milestones

Ordered so each is worth having alone, and so the map is proved to read before
anything depends on it.

1. ~~**Catalogue module.**~~ **Done** — `src/progression/`. Tiles, regions,
   coordinates, `levelPropertiesFor`, and the validator tests. Meeting real
   coordinates changed three things in PROGRESSION.md: Making cannot be a rim
   (no small region touches six capstones five steps apart), a genre's entrance
   is a two-edge gate rather than the single edge the first draft asked for,
   and the catalogue is sixty-seven tiles rather than fifty-five. The block
   unlocks are checked against the real palette
   (`__tests__/unlockedBlocks.test.ts`), which is what confirmed the generated
   types nobody can guess — `world_do_Physics_ApplyForceAction` and its
   relatives.
2. ~~**The map, standalone.**~~ **Done** — `src/progression/ProgressionMap.tsx`,
   at `yarn dev` then `?map`. The SVG, region fills, outlines and names, the
   edges, the three states, zoom, pan and fit — and the keyboard model, a roving
   tabindex with nearest-tile-in-direction on the arrows, brought forward from
   milestone 5 because a map built for the mouse first is a map shaped around
   the mouse. The list view is still milestone 5.

   "The layout will be wrong in ways only a picture shows" was right three
   times: where a region's name can go, and where an edge bar has to be drawn
   (both above) — and a bug worth the milestone on its own. **Capturing the
   pointer on `pointerdown` made every tile unclickable.** The `pointerup` then
   goes to the `<svg>`, so the browser resolves the click against their common
   ancestor and no tile's `onClick` ever runs, while the map pans perfectly.
   Capture is taken on the first real movement instead. jsdom can see none of
   this — it has no pointer capture — so the test that pins it spies on
   `setPointerCapture`, and has to dispatch a `MouseEvent` of the right type:
   `fireEvent.pointerDown` under jsdom delivers `button` and `clientX` as
   `undefined`, and a handler that checks either returns early without ever
   running.

3. ~~**The modal and the opener.**~~ **Done** — `ProgressionProvider`,
   `ProgressionDialog`, `TileDetail`, `ProgressionButton`, and the two base
   changes this document asked for: `extraLinks` on `ResourcePanel` (passed
   through Codebridge's `InfoPanel`) and `MainInstructionsContent` exported from
   `@code-dot-org/lab/instructions`. `?tree=<tileId>` is written with
   `replaceState` — moving around a map is not navigation, and a Back button
   that walks back through forty tiles is worse than useless.

   Three things came out differently from the sketch above. The **count went in
   the header** rather than a footer strip: a whole band of chrome for one
   number, in a dialog already divided in two, was not worth the row. The
   **`[ Map | List ]` toggle is not there**, because the list is milestone 5 and
   a toggle with one setting is furniture. And the detail pane renders
   `MainInstructionsContent` for every tile, written or not — a tile with no
   lesson yet has the markdown a lesson WOULD open with composed from its own
   `teaches` and `task`, and says so in as many words. The alternative was a
   rendering path that nothing exercised until the first lesson was authored.

   The provider and the dialog are two modules because they cannot be one: the
   provider renders the modal, the modal reads the context, and the lint rule
   for import cycles is what noticed. The context and the hook live in
   `progressionContext.ts`, which both import.

4. ~~**Start, by project channel.**~~ **Done** — six lessons
   (`src/progression/lessons/`), `Start` as a link to a channel of the lesson's
   own (`lessonRoute.ts`), `localStorage` behind the completion
   (`progressStore.ts`), and the mock API serving a channel per lesson. The loop
   is walkable: open the map, pick a tile, Start, land in the lesson, come back,
   and the tile stays done through a reload.

   **A lesson is authored the way a learner's project GETS things** — by running
   the same `importStockRule` / `importStockSprite` / `importStockActor` the
   dropdowns run (`lessons/support.ts`). So Gravity's dependencies arrive
   because the importer brings them, not because a lesson remembered to list
   them, and nothing here can drift from what importing actually does.

   Each lesson is built and TICKED in `__tests__/lessonsPlay.test.tsx`, the
   bargain `scenariosPlay` already makes for the demo scenarios: a wrong block
   type or a mistyped socket compiles perfectly and does nothing, so nothing
   short of running a project says whether it works. Two of the six also assert
   what their own first line CLAIMS — that the speed lesson crosses the screen
   by hand, and that the gravity lesson hangs in the air — because a starter
   that gives the lesson away is a lesson that has quietly stopped being one.

   Two things the loop found that nothing else would have. A tile's title and a
   written lesson's own opening heading were both shown, one under the other, so
   the pane supplies a title only when the lesson does not. And **`?tree` meant
   two things**: the modal writes `?tree=<tileId>` to the URL, and the dev host
   read `?tree` as "show the standalone map harness" — so reloading after
   opening the map replaced the whole lab with the harness. The harness is
   `?map` now.

5. ~~**The list view, the keyboard model, the a11y pass.**~~ **Done** —
   `ProgressionList.tsx`, `palette.ts`, and the two audits that hold them:
   `__tests__/palette.test.ts` (122 contrast assertions, every region hue, both
   themes) and `__tests__/accessibility.test.tsx` (axe over the whole dialog in
   both views). Axe also runs in a real browser, where contrast can actually be
   computed, and the keyboard self-test from the org checklist was walked there:
   Enter opens, focus lands on the view toggle, two Tabs reach the map's single
   tab stop, the arrows move between tiles announcing each one in full, the
   detail follows, Escape closes and focus returns to the trigger.

   **The color system had a real defect, and it was invisible by construction.**
   Every role was one fixed HSL lightness reused at all fourteen hues — and HSL
   lightness is not luminance, so `hsl(90 52% 62%)` and `hsl(245 52% 62%)` are
   the same "lightness" and differ fourfold in brightness. White on a finished
   tile ran from **1.79:1 to 4.6:1** against a floor of 4.5, and eight of ten
   measured pairs failed. Colors are now asked for by target LUMINANCE and the
   lightness found by bisection, so the ratios hold at every hue by construction
   rather than by inspection.

   **Which theme a color is for is decided on `[data-theme]`**, the attribute
   the design system's own tokens are scoped by. Two earlier answers could put
   the map in a different theme from the panel around it: `prefers-color-scheme`
   painted dark colors on a white dialog whenever the OS and the lab disagreed,
   and the React theme context put a light map inside a dark dialog whenever the
   context and the attribute did. Axe caught the first as a 1.83:1 link; a
   screenshot caught the second. Related: the design system's dialog paints its
   surface and leaves `color` alone, so the content inherited the page's black
   onto a dark panel — the dialog now sets `--text-neutral-primary` itself.

   **The map is a listbox, not sixty-seven buttons.** Picking a tile SELECTS it,
   so `aria-selected` is the truth `aria-pressed` would have misstated, and the
   role brings the keyboard model that was already built. Everything else in the
   SVG — fills, outlines, names, edges — is `aria-hidden`, so the listbox holds
   only options.

   **Selecting a tile brings it into view**, which is two criteria rather than a
   nicety: Focus Not Obscured (2.4.11), because arrowing to a tile off the edge
   of a zoomed map puts focus where nobody can see it, and Dragging Movements
   (2.5.7), because dragging was the only way to pan and picking a lesson in the
   list is now a single-pointer way to reach any of them. Panning also converts
   pointer pixels to user units now; it had been moving by the wrong amount.

   **Known limit, and it is the lab's rather than this feature's.** At a 380px
   viewport the document scrolls horizontally — but it already does with the
   dialog shut: the lab's own workspace header and its Code/Preview/Split
   buttons are 782px wide at that width. The dialog itself reflows to a single
   column and audits clean. Reflow (1.4.10) for World Lab as a whole is
   somebody's milestone and is not this one.

6. ~~**The back-links.**~~ **Done**, all four sites — `LessonLink.tsx` for the
   two import dialogs, `blockly/extensions/lessonButton.ts` for the block, and
   `blockly/lessonFlyoutButton.ts` for the toolbox drawer. Every one of them
   names the LESSON rather than saying "learn more": somebody deciding whether
   to spend twenty minutes is deciding about that lesson, and the title is the
   only thing on the control that says which.

   Two mechanisms, because there are two kinds of caller. React code uses
   `LessonLink`, which asks the context and draws nothing outside it — the
   import dialogs have tests that render them alone, and a link that threw there
   would have made them untestable. Blockly cannot use a hook, so it goes
   through `progression/lessonSeam.ts`, the shape this package already uses for
   the same problem (`openModule`, `ruleImport`, `effectImport`): the lab
   registers a handler while it is mounted and clears it on unmount.

   **`lessonFor` answers "nothing" when nothing is mounted, whatever the
   catalogue says.** A caller asking it is deciding whether to draw an
   affordance, and an affordance that opens nothing is worse than none — so the
   headless generator and every test that renders a dialog alone get no button
   without having to ask a second question first.

   The block button resolves by NAME rather than by file: a tile granted the
   stock rule `gravity`, and the project's copy is called whatever the learner
   called the file. It sits on `use rule`, `use trait` and `add actor` — three
   of the eight blocks the eye is on. The other five name an actor kind in
   passing (`is a ⟨Coin⟩`), which is not where anybody asks what it was for.

   Asking the other direction — not "does this unlock exist" but "does
   everything the library ships have a lesson" — found two gaps: the stock
   Player and Button actors were granted by no tile, so they could only be met
   by accident and the link back from them led nowhere. `platformer/level` and
   `story/choice` grant them now, and the layout test asserts the coverage in
   both directions so the next gap fails the suite instead of sitting there.

7. **Real completion.** The assertion channel is **done**; the checks are
   started, and the studio-level transport is not.

   **The channel** (`runtime/checks.ts`, `runtime/playCheck.ts`, and a `CHECK` /
   `CHECK_RESULT` pair on the sandbox protocol). A check travels as DATA: the
   lab sends a script of inputs and a set of probes, the sandbox builds a fresh
   world, plays the script on a fixed clock, samples the probes and sends the
   numbers back. **The sandbox makes no judgement** — whether the numbers pass
   is decided in the lab, where the catalogue is, which keeps the side that runs
   somebody else's code as small as it can be and means a wrong check can be
   corrected without rebuilding anything down there.

   Fresh, through `WorldBuilder.instantiate()` rather than `getWorld()`: the
   latter memoizes, so a check would otherwise be handed the world the learner
   has been playing, with their own keypresses in its history.

   Ten probes — an actor count, the positions of a kind, how many actors draw
   anything, which sprites are on screen, a world property, a named property
   read off every actor of a kind, what a kind draws for itself, the backdrop,
   the effects on an actor or on the view, and where the cameras are. Every one is something an
   existing play-test already asks, and each addition is argued for where it is
   declared: the vocabulary is what keeps the untrusted side small enough to
   trust, so a check that wants a tenth is a check to think about again first.

   The sixth was added for the two Memory lessons about state, and it is the
   one that shows where the line is. A lesson about state is a lesson about a
   value an actor carries, and nothing could read one: the probe matches on a
   property's id OR its name, across the actor's traits and its own
   declarations, so a check can ask what a Label SAYS without knowing which
   rule the text belongs to.

   The last three arrived together with the Look region, and for the same
   reason one level up: nothing in the first six can see a PICTURE. `sprites`
   answers which file is on screen, which was the whole of what a picture was
   until an actor could describe one — a drawing has no file, so what identifies
   it is the key the driver already computes to decide whether it has rasterized
   that exact picture before. A backdrop is not an actor and no actor probe can
   find one. An effect is on something rather than in it. None of the three
   hands back a document or a command list: a probe that did would be sending a
   shader across the sandbox boundary to answer "is it on".

   The tenth is Place's, and it is the region's subject stated as a question:
   what is DRAWN and where things ARE are two different things, and every probe
   before it answered the second. A camera that follows, stops at the edge of
   the map, eases, or ignores a small movement is right or wrong in the first.

   **The runner is shared with the tests**, and that is the point of it being
   its own module. A check tested against a different runner from the one that
   judges a learner is a check nobody has tested.

   **Every tile has a lesson, and every lesson has a check** — all sixty-eight
   of them — and every one is tested in both directions: it refuses the starter the lesson ships with AND accepts a
   project where the lesson has been done, which no amount of refusing proves on
   its own. Three also have a HALFWAY case, because a check that stops at the
   first thing the lesson asks for calls it done halfway — gravity with the Hero
   elected and the Ground not, so it falls forever; the arrow keys with only
   "Moves Across"; speed with a velocity added and the hand-written handler
   still there.

   One check has a **workspace half** as well as a played one, and it is the
   case that shows why `shape` evidence has a use: `motion/speed`'s starter
   ALREADY crosses the screen, so "it moves" is true before the lesson begins.
   What the lesson changes is HOW, and that is a fact about the file. The first
   version of that half banned `each frame` outright and was wrong — setting a
   velocity every frame is how the Arrow Keys rule itself moves an actor, and a
   learner who does it that way has done the lesson. What it looks for now is
   moving by PLACE, which is the thing being replaced.

   Writing that test found **a bug in the lesson**: the Hero was placed at x 160
   and the floor at 192, and two 32-pixel sprites at those positions overlap by
   nothing, so it fell past the corner. The lesson had shipped, been played in a
   browser, and looked right.

   **"Check my work" is offered only for the lesson the lab actually has open**
   — the dialog reads the loaded channel — because a check measures the open
   project, and the button on any other tile would measure whatever was on
   screen and complete the wrong lesson. Marking a tile done by hand stays
   beside it: a check is evidence, not a gate, and a learner who has plainly
   done the lesson should not be argued with by a probe.

   The project's own `console.log` is captured by the shared runner and travels
   back with the samples, so the `trace` kind is available; no check reads it
   yet, and the first one that wants to (gravity's "print something when it
   lands") can.

   Still to do: **the studio-level transport**, which is blocked outside this
   package entirely — there is no `World < Level` model in
   `dashboard/app/models/levels/` and no `.level` files, so a tile cannot be a
   studio level until somebody writes the model and a generator that emits one
   per tile from the catalogue.

   And one behavior that wants a decision rather than a default: a tile that is
   SHUT can still be checked and completed, because a lesson's URL opens
   directly and refusing to check a learner who is plainly doing the lesson
   would be perverse. It leaves the tree able to hold a tile that is done whose
   prerequisite is not, which is consistent with "an edge means readiness, not
   possession" and is still worth somebody saying out loud.

8. **The gate.** Hiding what a learner has not been given, in the two places
   they reach for something: the import libraries (`progression/shelf.ts`) and
   the toolbox (`progression/toolboxShelf.ts`). Off unless a level asks for it
   (`levelData.gateShelf`), because the gating is a teaching device and it must
   be possible to say no to it.

   **Per block, not per drawer.** A drawer becomes EARNED the moment the
   catalogue grants anything in it, and inside an earned drawer a block nobody
   grants is hidden. Nothing is listed as gated: the set is derived from what
   the tiles say they unlock, so a drawer no lesson has been written for stays
   open and the gate grows with the curriculum. The first lesson went from
   twelve drawers and a hundred and fifty-seven blocks to under twenty, while
   its own detail pane says it unlocks the Actor drawer — which is what the
   number was for.

   **A lesson lends what it teaches, and what it merely needs.** Finishing
   `logic/if` is what grants Logic, so while the lesson is open the learner has
   not earned the `if` its instructions tell them to add; and a lesson on one
   branch may need a block another branch teaches, which is `Tile.offers` —
   grant what you teach, offer what you need. Both are in `shelfKeys`, keyed off
   the open channel, and they are there rather than in the toolbox because the
   toolbox asked the question alone at first: the import dialogs asked a
   narrower one, so `memory/score` — whose whole task is to go and find the
   Scoring rule in the library — was a door locked behind itself.

   **What the project mints is never gated.** A rule's blocks come with the
   rule, and an edge on the map means readiness rather than possession, so a
   project that HOLDS Gravity has Gravity's blocks. That is easy while a rule
   has a drawer of its own; it is not easy for a property the learner just
   declared, whose get and set land in the Actor drawer, which is earned. Their
   types are minted from a file path and a name nobody knew in advance, so no
   tile can grant them — they pass the gate by being project-minted, and the
   lessons that declare properties are what found it.

   **A test per lesson says what its instructions send the learner to find.**
   Written by hand from the instructions, because nothing else knows: a
   lesson's starting project does not contain the blocks the lesson asks for.
   That table is what turns "the gate hid something" from a bug report into a
   failing test.

9. **One file.** A lesson says everything it has to say in `main.world`, and
   the file browser is off while it does (`lessons/index`, `ONE_FILE`). The
   actors a lesson asks the learner to change are defined IN the world — a
   `define actor` root beside the `define world`, which is a shape the engine
   already had and `fixtures/platformerSingle` already proved at full size.

   The reason is the one the single-world scenarios give: a sidebar listing
   eleven files argues with a lesson that is about one of them, and the first
   thing it invites is the click that leaves it. The files are still there and
   still compiled — a lesson holds the rules and pictures it needs — and what
   is gone is the list.

   **Nothing became unreachable**, which is the test of it. The eye on `use
trait` opens the rule behind the trait; the rule count on `define world`
   opens what the project holds, and is where `memory/score` goes to find
   Scoring; a sprite's `(import…)` row is on the block that names it. Those
   ways in were built for a level that hides the browser, and this is the first
   thing that has used them at scale.

   **Eight lessons keep the browser, and each earns it.**

   `look/sprite` is "a picture is a file", and its third step opens the picture
   and paints on it. A `.png` opens by being opened: there is no eye on `set
sprite` the way there is on `use trait`, so with no list there is no way in.
   The lesson's subject is the sidebar, so the lesson has one.

   `memory/actor-state` is the other, and it is forced rather than chosen. A
   property declared in a world's own `define actor` is a `const` in that
   definition's block scope, so the actor's drawing can read it and the world's
   body cannot — which is precisely what a lesson about per-instance state has
   to do. The engine gap is written down as
   [own-property scope](PROGRESSION.md#own-property-scope); if it is ever
   closed, that lesson can be one file like the rest.

   The six Making lessons need no argument: a Making lesson is spent inside a
   `.rule`, and a rule is a file.

   Each says so where the learner reads it, in the lesson itself. A sidebar
   that simply appears one day is a change nobody explained.

   Two tests hold the line: a lesson with no browser may not name a path in its
   instructions, and any `.actor` file it does hold must be the library's own,
   untouched.

## Open questions

- **Whose component is the map?** The renderer is generic (hexes, regions,
  edges, states); the catalogue is not. Recommendation: build it in
  `src/progression/` inside World Lab, with the renderer importing nothing
  world-specific, so the day a second lab wants a tree it moves without a
  rewrite. Do not put it in base speculatively.
- **Does the tree open by itself** for a learner who has never seen it? Once,
  probably, on a project with no history. Nobody finds an icon in a strip of
  five.
- **What does a teacher see?** A class's progress over the same map is an
  obvious and separate feature; the catalogue and the renderer should not need
  to change to allow it, which is an argument for keeping `completed` a prop of
  the renderer rather than something it reads from a store.
- **What does the modal do while a lesson is loaded?** Showing the current tile
  with a ring is the minimum. Whether the check's result appears here, in the
  instructions panel, or both, is a question for whoever builds the first
  check.
- **Is `Start` on a shut tile really refused?** The alternative is letting
  anybody start anything and using the tree only as advice. That is a
  pedagogical decision, not a UI one, and it belongs in
  [PROGRESSION.md](./PROGRESSION.md#opening-a-tile) — but the modal should read
  the answer from the catalogue rather than hard-coding it, so the decision can
  change without a rewrite.
