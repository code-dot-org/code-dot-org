# Plan: actors only as data (SIMPLE_INTERFACE.md, phase eight)

STATUS: IN PROGRESS.

The spec settled that "no `define actor` block is shown anywhere": an
actor's file is data and an event workspace, and the Actor Editor is where
the data is made (SIMPLE_INTERFACE.md, "An actor is data and events").
ACTOR_EDITOR_PLAN.md built the data shape, the fold and the editor; this
phase removes what is left of `define actor` as something a learner sees or
writes. What an actor IS goes in the panel. What an actor does when it is
made — the definitional logic that is not a value — goes in its `is created`
handler, which runs once the instance exists and before it is first drawn.

## What exists

- **The data shape** (`actors/actorData`): name, purpose, acts like, is a
  record, icon, animations, traits, properties, values and effects as keys;
  handlers and code rows (every frame, a block or event of its own, its
  drawing) as roots of the workspace. `foldActor` turns a `define actor`
  workspace into data and `actorView` turns data back into the workspace the
  compiler reads. Neither is saved as the other's shape.
- **Setup.** A row a fold cannot say as data — a `set` of something
  computed, a second `set sprite`, any other statement under the root — is
  kept in `setup` so the fold loses nothing. No shipped actor has one. It is
  shown nowhere: not in the panel, not in the Code view.
- **The Code view** of a data-shaped actor shows its handlers and code rows
  as roots, and no `define actor` (`blockly/codeRoots`).
- **Blocks-shaped files.** `ActorFileEditor` opens an actor whose contents
  are not data in the blocks editor, `define actor` and all. Scenarios and
  the starter project are folded where they are loaded (`WORLD_SCENARIOS`,
  `DEFAULT_PROJECT`); stock actors, new actors and enhanced ones are written
  as data. Lessons are not folded: every lesson's actors are `define actor`
  workspaces but one (`look/animation`'s Hero, ANIMATION_PLAN.md step 9).
- **The panel** edits purpose, traits, Self, values, effects and looks. Acts
  like, is a record and the icon are data with no field: the creation wizard
  and the enhancements set them. It offers the same looks whatever the actor
  is for.
- **What an actor is for** (`actors/actorPurpose`): a game, an interface, or
  both. Both is under both tabs of the Actor Palette (`isUnder`), narrows no
  shelf (`asTab`), and is offered by the Actor Editor's purpose dropdown;
  Label, Progress Bar, Health Bar, Viewport and Image are both in the
  library, and the starter's Health Bar and Scoreboard are written so
  (PURPOSE_PLAN.md). Either tab is open on a Screen and on a Map, which only
  chooses the one shown first, so an interface actor can be placed in a
  level. Rules and enhancements say game, interface or both too, meaning
  which kind of actor they are offered to. A new interface actor already
  starts with a box and a drawing the size of it (`create/newActor`), and
  every interface or both actor in the library is drawn by a routine — its
  own, or the one it acts like (the Health Bar's is the Progress Bar's) —
  except two that wear a sprite: Image (both), a picture fitted to its box
  by scale, and Portrait (interface), a face that starts invisible.
  `draw image` takes its picture from a dropdown and draws it at its own
  size, and no property can hold a picture. An animation's drawn offset,
  scale and turn reach a drawing's image as they reach a sprite
  (`PhaserBinding`), so a drawn actor's animations move, scale, turn, fade
  and switch effects already.
- **The toolbox's Actor drawer** offers `define actor`, `use trait`,
  `acts like`, `is a record` and `define property`, which mean something
  only under a `define actor`.
- **`is created`** (`rules/spatial`, the hat `world_on_Space_CreatedEvent`)
  is raised by `World.addActor` and QUEUED like every event. An actor made
  by a step hears it in the same tick's flush, before that tick's render.
  One made in a handler hears it on the next tick, since a flush dispatches
  a snapshot of the queue; it is drawn once first. One placed while the
  world is built is drawn by the driver's first `sync`, before any tick, and
  the first tick's steps act on it before its handler does. Thumbnails and
  play checks render before ticking too. The health bar and the hunter
  enhancements add their company from this handler.
- **Lessons.** Thirteen of the 79 lessons' instructions work in an actor
  file's blocks: `first-world`, `arrows`, `speed`, `sprite`, `drawing`,
  `effect`, `andOr`, `map`, `placementScript`, `reveal`, `ownTrait`,
  `ownRule`, `actorState`. Two tiles unlock `define actor`, `use trait` and
  `is a record` as blocks. The lesson-check tests edit actors through a
  merged `define actor` workspace (`editingWorld`).

## Decisions

- **Creation runs before the first render.** `is created` runs after the
  actor exists and before it is drawn for the first time, which may mean in
  the same tick as whatever made it. It leaves the general queue for a lane
  of its own; `is removed` stays queued, since nothing about it is bound to
  a render.
- **Definitional logic is a creation handler.** A row that is not data
  becomes a row of the actor's `when this actor is created` handler, in the
  order it was written. It runs after the placed instance has its own
  values, so a computed `set` there overrides the map's value for that
  actor, before any step and before any render. A literal stays data and
  keeps its override. `setup` is deleted.
- **Every actor file is data.** No blocks-shaped actor is written, loaded or
  opened. The `define actor` workspace survives only as `actorView`, the
  compiler's reading of the data, and `world_actor` is never in a toolbox —
  as the animations row is not.
- **What an actor is, is in the panel.** Acts like and is a record join the
  panel; the rows that said them leave the toolbox.
- **An actor is for a game or for an interface, never both.** That is its
  tab in the palette, what the shelves and enhancements offer it, and the
  tag that keeps a game actor out of a level with no game. Both is deleted
  from `ActorPurpose`; each actor that said it says interface, since each is
  drawn. A rule or an enhancement may still say both, which there means it
  is offered to either kind of actor.
- **An interface actor is drawn, and shown by its icon.** Its look is mostly
  its size and its properties, so a rendered thumbnail says little; an icon
  says what it is. An interface actor is always drawn by a drawing routine,
  and its panel offers the icon and no sprites: no Looks like, no Pictures,
  and no picture keys or Add frames on its timeline, whose other tracks it
  keeps. A game actor has Looks like and no icon field. Making a game actor
  an interface one asks first, then takes its picture keys away and gives it
  the starting box and drawing if it has none.
- **No migrations.** Nothing has shipped. The lessons are rewritten, not
  converted on load, and the blocks-shaped fallback is deleted outright.

## What is being built

### 1. Creation before the first render

`World.addActor` puts the actor on a creation list instead of the event
queue. `World.settleCreations()` runs the `is created` handlers of each
actor on it, with the actor in hand (`withActor`), and goes round again
while those handlers make more, up to a bound past which the rest wait for
the next call, so an actor that makes itself cannot hang a frame. It is
called:

- at the start of a tick, before the steps, so a placed actor is set up
  before anything moves it;
- at the end of a tick, after the flush, so an actor made by a handler is
  set up in the tick that made it;
- at the start of `renderSnapshot`, so nothing is drawn before its handler
  has run — the driver's first `sync`, a thumbnail and a play check alike,
  without each having to remember. It does nothing once the list is empty.

An actor removed before it is settled is dropped from the list. The engine's
tests say each case: placed and drawn before a tick, made by a step, made by
a handler, made by a creation handler, and the bound. The health bar and
hunter enhancements are checked in the browser: a bar is there on the first
frame, not the second.

BUILT. `World.settleCreations`, over a list `addActor` fills instead of
the event queue, run at the start of a tick, after its flush, and at the
start of `renderSnapshot`; at most 16 rounds a call (`CREATION_ROUNDS`),
and an actor gone before it was told is skipped. Not run inside itself.
The driver lends the storage, the clock and the measuring tape in its
constructor, before its first `sync`, so a handler that restores what was
saved still finds the storage; the text that said `is created` runs "on
the first tick" says "before the actor is first drawn".

The lifecycle tests say each case: told before the first picture, set up
before the first tick's steps, told in the tick a handler made it, what a
creation handler makes told in the same call, an actor that makes itself
bounded and resumed, and one removed before it was told left alone. The
health bar's test asks for the bar in the first picture, with no tick,
and fails with the render-time call taken out.

In the browser: the starter, Jetpack, Meteors and the Notes app run with
no page or runtime error. A canvas at sixty frames a second cannot be
caught on its first, so the first picture is the test's.

### 2. Setup into the creation handler

`foldActor` puts a row it cannot say as data under the actor's `is created`
hat — the one it has, or a new one — rather than into `setup`, and `setup`
is deleted from the shape, the view and the tests. Because every row the
view writes under `define actor` is data or a code row, a fold of a view is
the same data. The round-trip test over every actor (scenarios, lessons,
stock) says so.

### 3. The panel by what the actor is for

**Acts like**, a dropdown of the project's other actors or nothing, and **Is
a record**, a checkbox, under the actor's name and purpose, which offers
Game and Interface and no Both; a record has nowhere to be drawn, so it
hides the look, the icon and the animations. For an interface actor,
**Icon**, the picker the creation wizard uses, where Looks like was; the
Pictures menu, the timeline's picture row, the moment panel's Picture and
Add frames are not offered. For a game actor, no icon. Changing the purpose
from game asks, then drops the picture keys and adds the starting box and
drawing (`newActor`) to an actor without a drawing. The creation wizard
offers an interface actor no sprites. `ActorPurpose` loses both: `isUnder`,
the shelves' filter and the enhancements' table read two values for an
actor, and Label, Progress Bar, Health Bar, Viewport, Image and the
starter's Health Bar and Scoreboard say interface. Each is an edit in
`actorEdits` with its test.

### 4. Image and Portrait, drawn

A `picture` property type — a project picture, chosen in the inspector from
the same list `set sprite` offers — and
`draw image ⟨picture⟩ at x y size w h`, which takes its picture from a
socket and draws it at a size, as a drawing's other shapes are. Image
becomes a drawing that draws its `picture` into its box, fitted or stretched
as `stretches` says, and its fit-by-scale step is deleted; a drawing clips
what it draws, so the crop Image's header says it cannot do is one more
mode, left for when it is asked for. Portrait acts like Image, starting
invisible. The fixtures that set either one's sprite set its picture.

### 5. Every actor file is data

`lessonSource` writes each actor as data (`inDataShape`), as the scenarios
are. `ActorFileEditor` is the Actor Editor, and the blocks-shaped branch is
deleted. The lesson-check tests' `editingWorld` edits an actor through its
view and folds it back (`throughView`), or through `actorEdits` where a
learner would use the panel.

### 6. The definition rows leave the toolbox

The Actor drawer loses `define actor`, `use trait`, `acts like`,
`is a record`, and `define property` as an actor row; `use trait` stays
where a trait requires another, under `define trait`. The code rows stay
where the "+" offers them. The two tiles that unlock these blocks unlock the
panel affordances instead, or nothing, and the unlock list says so
(`progression/TileDetail`).

### 7. The lessons

The thirteen are rewritten for the panel: a trait is added with Add trait, a
property in Self, a value in its field, code with Code and the "+", and what
happens when an actor is made in its `is created` handler. Their checks
watch the running game and stay as they are; the tests that solve them edit
data.

### 8. Documents, the browser, and the ledger

SIMPLE_INTERFACE.md lists the phase, GLOSSARY.md and the README say what an
actor file is and that an interface actor is drawn, and the ledger notes the
new fields and the picture property's chooser. In the browser: a health bar
on the first frame, and a lesson from start to finish.

## Not in this phase

- `define world`'s rows, which the spec moves to the Screen and the maps.
- A rule's or a trait's own workspace, which stays blocks.
- Easing, and the other animation work ANIMATION_PLAN.md left.
