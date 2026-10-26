# Plan: actors only as data (SIMPLE_INTERFACE.md, phase eight)

STATUS: BUILT, October 2026.

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

BUILT. A row under `define actor` that is neither data nor a code row is
chained, in order, at the top of the actor's `when ⟨this actor⟩ is
created` handler (`CREATED_HAT`) — the one it has, whose own rows follow,
or a new one. A row that declares something the data says once (`use
trait`, `acts like`, `is a record`, `show as`, `define property`, the
animations row) and that the fold could not take is dropped: a second
`acts like` says nothing the first does not, and would mean nothing in a
handler. `setup` is gone from the shape, the view and `DATA_KEYS`. The
tests say both moves and the drop, and that a view folds to the same
data; the round trip over every shipped actor finds no creation handler
the fold made, so each compiles to the same lines as before.

Nothing a learner sees changes here: no shipped actor had a setup row, and
the creation handler is in the Code view with the other handlers.

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

BUILT. An actor is for a game or an interface: `ActorPurpose` lost both,
and `OfferedTo` (game, interface or both) is what a rule or an enhancement
says. Label, Progress Bar, Health Bar, Viewport and Image, and the
starter's Health Bar and Scoreboard, say interface; the purpose dropdown
offers Games and Interfaces. `asTab` went with both. The agreement test
between stock actors and the rules they need now reads: a game actor
needs no interface's rule, and an interface actor an app is offered needs
no game's (`APP_ACTORS`); the Viewport, which an app is never offered —
the game's window on a Screen — may need the camera rules.

The Traits tab opens on "What it is": **Acts like**, the project's other
actors or nothing, and **Is a record**, with a line on what one is. A
record's preview column says it is never drawn, in place of its look and
animations. An interface actor has the **Icon** picker
(`ActorIconPicker`, the sixteen of `blockly/actorIcons`, each a button
pressed when chosen, pressed again for none) where Looks like and
Pictures are, no Add frames, and no Picture field at the playhead. A
game actor has no icon field. Made an interface's, an actor that would
lose something is asked first; then its picture keys come off every
animation, a Main that was only a picture goes, and one with no drawing
gets the box and drawing a new interface actor starts with (`setPurpose`,
`losesToInterface`). The creation wizard already asked an interface
actor nothing about a picture.

Departure: the plan said the icon picker was the creation wizard's.
There was none; the wizard asks no interface actor for a look, and an
icon was set only by a stock actor's file or an enhancement. The picker
is new.

In the browser: the Interface Kit's Label opens with the icon picker and
no Looks like; Jetpack's Pilot, made an interface's, asked, then showed
the icon picker, its Fly and Climb with their pictures gone, and Main
gone; no page errors.

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

BUILT, in three commits. **The picture type:** `picture` is a property
type, a file name held as a string as a color is; `world_picture` reports
one, from the same field, list, open button and `(import…)` row as `set
sprite`, and is a picture socket's shadow (`PICTURE_CHECK`). The Actor
Editor offers it as a kind of own property; its fields (`ValueField`) and
the map inspector's are a list of the project's pictures, with "(none)" or
"(its kind's)" first and the one held kept even when the project no longer
has it. A picture set on an actor is kept as data.

**Drawing it:** `draw image ⟨picture⟩ in x y width height, fitted |
stretched` (`world_draw_picture`), whose `image` command carries the box;
the painter fits it, keeping its shape and centered, or stretches it, where
the picture's size is known (`paintDrawing.placeInBox`). The map editor's
reader reads the block and the picture.

**Image and Portrait:** the Image declares `picture` (the stock face to
start with) and `stretches`, and its drawing, the size of its box, draws
the one into the other; the step that set its scale each frame is gone.
The Portrait acts like the Image (`actors: ['image']`, and the visual
novel holds `image.actor` beside it), starts invisible, and has an icon of
its own, a face, since no two stock actors share one. The scene lesson
sets its `picture` rather than its sprite, and its check reads `picture`:
read as `sprite`, a Portrait that never changed face passed, from empty to
the one face.

Departure: `draw image` is kept beside the new block rather than given a
socket. It names its picture in a field so a sheet's cell can be resolved
where the `.sheet` files are known; a value is read while the game runs,
where they are not, so the new block draws whole pictures.

In the browser: the Interface Kit's Image opens with its Picture and
Stretches under Self, the icon picker with `image` chosen, and its preview
the picture fitted to its 64 by 64 box; no page errors.

### 5. Every actor file is data

`lessonSource` writes each actor as data (`inDataShape`), as the scenarios
are. `ActorFileEditor` is the Actor Editor, and the blocks-shaped branch is
deleted. The lesson-check tests' `editingWorld` edits an actor through its
view and folds it back (`throughView`), or through `actorEdits` where a
learner would use the panel.

BUILT. `lessonSource` hands back its project with every actor as data
(`inDataShape`), as the scenarios and the starter are; a lesson still
writes its actors as workspaces, which is how they are easiest to write.
`ActorFileEditor` is the Actor Editor, and the blocks branch is gone; a
file that is not data says it cannot be read. A test finds every lesson's
actors data. New actors, stock imports and enhancements were data
already.

The tests that solve a lesson edit an actor through its view and fold it
back, as a writer of the view does (`editing`, `editingWorld`,
`toolboxShelf`'s `declaring`). Doing so found three things. The
actor-state check read the Lamp's file for `world_rule_property`, which
a data-shaped file does not say; it reads the Lamp's view. A test that
changed "the first row under Stone" found the picture there, the view
putting rows in a fixed order; it finds the `use trait` row. And the
fold read a declaration only if it had exactly the one field it needed,
so a `use trait` carrying a field the block does not have — which
Blockly drops on loading — was a row the fold could not take, and since
step 2 dropped it; it reads the field it needs and ignores the rest, as
Blockly does.

The thirteen lessons whose instructions speak of `define actor` still do,
until step 7; their actors now open in the Actor Editor.

In the browser: `motion/speed`'s Hero, which opened as blocks, opens in
the Actor Editor; no page errors.

### 6. The toolbox keeps what code does

A block leaves the toolbox when an editor already establishes what it
says and code has no reason to say it again; a block that changes
something while the game runs stays. Each workspace's toolbox is gone
through by that rule; a first pass:

- **Leaves, the Actor Editor's:** `define actor`, `use trait` as an
  actor's row, `acts like`, `is a record`, `show as`, and `define
property` as an actor's row. `use trait` stays under `define trait`.
- **Leaves, the Screen and map editors':** `define world`, of which a
  project has one; `use theme`, a Screen's and a Map's property; `define
camera`, the Viewport's inspector; `define layer`, `layer parallax` and
  `layer fixed`, the map editor's layers; and `define property` in the
  World drawer, the game-wide values of All maps.
- **Stays:** the background setters and effects, which a game switches
  in play; loading and unloading maps; adding and removing actors;
  moving and using cameras; adding and removing effects, which code and
  animations turn on and off; the code rows, offered by the "+".
- **To settle when this step is built:** `world_map` and
  `world_placement`, and whether `set map size` and `set view size` are
  ever said at runtime or only as definitions.

The tiles that unlock blocks which leave unlock the editor affordances
instead, or nothing, and the unlock list says so
(`progression/TileDetail`). What `define world`'s rows hold moving to the
Screen and the maps is not this step's; only the blocks leave.

BUILT, all but two. Out of the toolbox: `define actor`, `acts like` and
`is a record` (the Actor Editor's); `define world` (a project has one);
`use theme` (the Screen's Theme); `set map size` and `set view size` (the
map editor's and the Screen's; the two reporters that read them stay);
`define camera` (the Viewport's inspector); and `define layer`, `layer
parallax` and `layer fixed` (the map editor's layers). Every one is a
definition — `define layer` is hoisted by `define world`, and the sizes,
the theme and the camera describe the world as it is built — so none has
a reason to be said again while the game runs. `world_map` and
`world_placement` stay: they name a map and a placement from a map's
code, which runs. So do the background setters and effects.

Found on the way, and the larger half of the step: a file may HOLD only
what its palette offers (`misplacedBlocks`, `holdable`), so taking a
block out of the toolbox would have disabled every world's own `define
world`, its layers and its theme, and the world would have compiled to
nothing. What a file holds is now its toolbox and `heldNotOffered`: the
blocks taken out (`ESTABLISHED_ELSEWHERE`), less a definition whose home
is another kind of file.

The tiles that granted the blocks taken out grant them no longer:
`origin/first-world` (`define actor`, `define world`), `place/map` (`set
map size`), `place/layers` (the three layer blocks; `within layer`
stays, and the lesson names it where it said blocks change a layer while
the game runs, which they did not), and `story/form` (`use theme`, `is a
record`). App Builder's hidden list loses the four no toolbox shows.

Not yet: `use trait` and `define property` as an actor's or a world's.
Some thirty lessons send a learner to drag `use trait`, and four teach
`define property` under `define actor` or `define world` — the plan
counted thirteen, by looking for `define actor` in their words — and a
lesson asking for a block nobody can find is worse than a block still
offered. They leave with step 7's rewrites, `use trait` staying under
`define trait` and `define property` in a rule.

In the browser: `place/layers`' world, whose `set size of map` no drawer
offers now, opens with `define world` and that row enabled, and runs.

### 7. The lessons

Every lesson that sends a learner to `use trait`, `define property` on an
actor or the world, or `define actor` — about thirty, not the thirteen
first counted — is rewritten for the panel: a trait is added with Add trait, a
property in Self, a value in its field, code with Code and the "+", and what
happens when an actor is made in its `is created` handler; a world's own
value is added in All maps' values. Their checks watch the running game and
stay as they are; the tests that solve them edit data. With them, `use
trait` and an actor's and a world's `define property` leave the toolbox
(step 6), and the lesson test that every block a lesson asks for is
offered says the rewrites are whole.

BUILT. Forty-four lessons' steps were rewritten: twenty-eight that sent
a learner to `use trait` or to an actor's or a world's `define property`,
and the others that spoke of `define actor`, an actor's file or its
blocks. A trait is given from **Enhance Actor** ("Open the Hero and give
it **Jumps** from **Enhance Actor**") and taken off with its **Remove**;
a trait's own value is its field ("set its **Lifetime** to 1"); an
actor's code is read and changed with **Code**; an actor's own property
is a **New property** in **Self**; a world's own value is a **New value**
on the Map with nothing selected. An effect is added from the Effects
tab's **Add Effect**. Rules are still blocks, so `use trait` under
`define trait` and a rule's `define property` are taught as they were;
and a world is still blocks, so a world value is deleted where it is
written, in the World tab.

Four lessons sent a learner to "the open button on `use trait`" to read
or change the rule behind a trait. That button went with the block, so
each trait in the panel has a **Rule** button beside **Remove**, which
opens the rule's file as a step on the trail (`TraitChoice.rulePath`).

With them, `use trait` and an actor's and a world's `define property`
left the toolbox, joining `ESTABLISHED_ELSEWHERE`, and the tiles that
granted them for those uses no longer do: `origin/first-world`,
`memory/world-state`, `memory/actor-state` and `simulation/dials`.
`memory/actor-state` now gives nothing at all, and says why where the
tiles that give nothing are named: an actor's Self is never withheld. The
table of what each lesson's steps ask for (`ASKS_FOR`) lost the two
blocks, and the test that every one is offered passes for every lesson.

Corrected on the way: `platformer/hunter` said a chase target is set in
its code because "the rows beside the traits run before anything has
been put in the world"; it says a value set in the panel is. The ladders
lesson read "what the sparkles wrote", which is now the Hero's **Code**.

In the browser: `input/press`, step 1 as written — the Hero opened, Enhance
Actor offered Takes Keyboard Input, and it arrived in the panel with Rule
and Remove; no page errors.

### 8. Documents, the browser, and the ledger

SIMPLE_INTERFACE.md lists the phase, GLOSSARY.md and the README say what an
actor file is and that an interface actor is drawn, and the ledger notes the
new fields and the picture property's chooser. In the browser: a health bar
on the first frame, and a lesson from start to finish.

BUILT. SIMPLE_INTERFACE.md lists the phase and says the lessons are done
for actors; GLOSSARY.md says an actor is for a game or an interface and is
data and events, and that an Animation is the actor's own timeline (it
still said a world registers Animations, and that one is a list of
Sprites with delays); the README says what an actor is. A level that turns
`showRuleSource` off now hides a trait's Rule button in the Actor Editor
too, which is the same door, and the README's `levelData` table says so.

In the browser, `motion/speed` from its start: the Hero opened from the
Map, Can Move from Enhance Actor, its `each frame` deleted in its Code; on
the Map the Hero chosen with the arrow keys, its Can Move group opened,
and its Velocity set to 2 — and the Hero crossed the screen when the game
was restarted. One wording fixed on the way: the Velocity is a dial, and
its first box is behind it, so the step says to open it.

Found, and not this phase's: **Check my work** in the browser builds the
world it checks with no actors in it — every probe reads nothing, so every
lesson whose check watches an actor fails. The build before this phase
(`0270436cd5e`) does the same, checked by running both with a count of
the actors the check sees. The lesson checks in the tests run the same
checks against `compileProject` and pass, which is why nothing caught
it. Left for its own investigation.

## Open

- **Check my work in the browser checks an empty world** (step 8): found
  here, older than this phase.
- **Whether an actor's purpose may change after it is made.** Step 3
  lets the purpose dropdown switch it, converting a game actor to a drawn
  one. Fixed when the actor is made would leave nothing to convert or
  explain, and `setPurpose`'s conversion would go. Recommended; not
  decided.

## Not in this phase

- Scrolling in an interface. The Scroll View elects the Viewport's trait
  and scrolls by moving a camera over a map: an interface's scrolling runs
  on a game's machinery, where a Screen might hold it. A design question
  of its own.
- Moving what `define world`'s rows hold to the Screen and the maps;
  step 6 only takes its blocks out of the toolbox.
- A rule's or a trait's own workspace, which stays blocks.
- Easing, and the other animation work ANIMATION_PLAN.md left.
