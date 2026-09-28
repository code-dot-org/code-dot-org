# One kind of camera, in every space

STATUS: BUILDING. Steps 1 to 8 are in — a camera can now be declared FOR a
Viewport in blocks, in that Viewport's own `on create`. Steps 1 to 7 are — step 6 is where the lab got smaller (a
map says nothing about a camera any more) and step 7 turned out to be a
correction to this document rather than a change to the engine. Steps 1 to 4 are — a space holds cameras, one collection
finds them all, each knows its space, one may be declared against a space that
does not exist yet, and a Viewport says which of its own it shows through. Step
5 proved a camera trait reaches a space's camera, and step 6 deleted the engine
branch that used to overwrite it. What remains is the editor: nothing lists a
Viewport's cameras yet (step 9), and `actor to follow` cannot name a kind (step
10), so aiming one still means writing the follow in blocks.

ONE REFINEMENT THE BUILD FORCED, in step 6. `settleSpace` did three jobs, not
one: it followed what the map named, it positioned the camera from the
Viewport's `scroll`, and it clamped. Only the first was the duplicate. The
scroll stays — a scroll view is the Viewport deciding about the scene it shows,
and `ViewportScrollProperty` promises a reading of where it actually stopped, so
that path still clamps. What decides between them is whether the camera elects
anything: a camera with traits is the rules' to aim and the engine leaves it
alone, a camera with none is the Viewport's to scroll. Which also means a
trait-aimed camera is confined by `Confined to the Map` or by nothing at all,
exactly as the world's cameras have always been. specs/VIEWPORT_PLAN.md left one
question open with a single line — "the Viewport's camera is the engine's, not
the camera rules'" — and this is what answering it would take. The line was
honest about being a shortcut; what follows is the cost of the shortcut and the
work to remove it.

## What is wrong

Following a subject is implemented twice.

A world's camera follows through the rules. `Camera Follow` declares a trait
`Follows` holding `actor to follow` and `look offset`, with one step in the
`aim` phase that puts the goal where the followed actor is. Around it,
`Camera Ease`, `Camera Deadzone` and `Camera Confined to the Map` each add a
step in a named phase, and they compose: adding easing later changes nothing in
the follow rule. All of it is authored in blocks a learner can open.

A Viewport's camera follows through `World.settleSpace`. It reads
`camera.follows` off the map document — a placement id, matched as
`actor.id === follows || actor.id.startsWith(follows + '#')` — and clamps the
result into the space's bounds with arithmetic written out by hand. That clamp
is `Camera Confined`'s step, said a second time in TypeScript, and the two will
drift the first time either is corrected.

So a Viewport's camera cannot ease, cannot have a deadzone, cannot have a look
offset, and cannot be aimed by a block. It can only do the one thing the engine
hard-codes.

## The mistake underneath it: a map does not own logic

The duplication above is the symptom. The cause is that `camera.follows` is on
the MAP at all, and the lab has already settled that question in a neighbouring
domain.

specs/MAP_EVENTS_PLAN.md inverted events for three reasons, and the first is
this one exactly: "A hundred level maps mint a hundred different `complete`
events. This is the one that matters, and it is not about tidiness." Its
conclusion generalises past events — a map is "a thing that USES a vocabulary
declared elsewhere", which places kinds it did not declare and raises events it
did not mint. A map is data. It does not own the program's logic.

A camera is logic. Where the view looks, how hard it chases, how far it leads
and what it refuses to leave are decisions about how the game is PLAYED, and a
hundred level maps should no more each configure a camera than they should each
declare a `complete`. Today they must: `camera.follows` is a per-map field, so a
hundred-level game is a hundred places to say "follow the player", and changing
that decision is a hundred edits.

The reason given for putting it there was circular besides. The value is a
placement id, and placement ids are local to a map, so the reference had to live
in the map that owned them — but it is an id BECAUSE it was put on the map.
`Camera Follow` never had the problem: `actor to follow` holds an actor, and an
actor reference cannot dangle the way a name can.

## What is already true

Most of this is subtraction, because the pieces exist:

- **A Viewport's camera is already a `Camera`.** `Space.camera` is typed
  `Camera | undefined` and built by `makeCamera({id: '<id>:camera', …})` in
  `World.placeActor`. The class holds traits and their property values, and its
  own comment says so: "A class rather than a plain object because it holds
  traits, and holding traits is what makes a camera something a rule can act
  on". It is made with no traits, and nothing ever gives it any.
- **The one mechanical gap is the collection.** `CameraCollection` wraps the
  root's `cameraList` and nothing else, so `world.cameras.with(trait)` — how
  every camera step finds its subjects — cannot see a space's camera. A
  Viewport's camera is a camera that no step has ever been offered.
- **Following by KIND already works at runtime.** `actor to follow` is
  list-shaped and read through `WorldLab.one`, and `cameraFollow.mjs` says
  plainly that `set actor to follow to ⟨any Player⟩` "is a reasonable thing to
  write and has to do something reasonable". Selecting a kind and following the
  first of it needs no engine work.
- **The editor already knows the project's actor kinds.** The placement
  inspector's own comment draws the line: a map's placements are "the one thing
  the sandbox cannot supply: it introspects actor KINDS". Kinds are the easy
  direction.
- **Nothing depends on `camera.follows`.** No fixture and no stock map sets it.
  It exists in `World.ts`, `mapModel.ts`, `MapStage.tsx` and their tests, so it
  comes out by deletion with no content to migrate.

## The shape of the answer

- **A VIEWPORT decides the camera, and the world is the main Viewport.** The
  root is a space with cameras and a Viewport is a space with cameras; what is
  unusual about the world is only that it owns its cameras directly, with no
  placement standing for it. Say it once in the world and every level it loads
  is framed that way.
- **A map has no camera.** It is data: it says where things are, and nothing
  about how the view behaves. This is the field that comes out.

  A VIEWPORT PLACED ON A MAP IS NOT AN EXCEPTION, though it looks like one: its
  cameras are stored with the placement, so a map can end up carrying camera
  data. The distinction that matters is which way the camera points. A map
  saying how the view onto ITSELF behaves is a level dictating play, and that is
  what comes out; a Viewport is the viewer and not the viewed, and what it holds
  is about the scene it shows, not about the map it sits on.

- **Cameras are not shared between spaces**, and cannot be. A position belongs
  to a space — "the only thing between two spaces is nothing at all"
  (`engine/core/Space`) — so a camera's position means nothing in a space it is
  not in. A Viewport shows a different scene, so it has its own.
- **A space may hold SEVERAL cameras**, as the world's `cameraList` already
  does, with one of them taking the view. A Viewport that wants two framings —
  a wide shot and a chase — says so where it is placed.
- **Traits are how a camera gains behaviour, everywhere.** Follow, ease,
  deadzone and confine reach a Viewport's camera by being elected on it, not by
  being reimplemented for it.
- **A camera that elects nothing looks at the top left of what it shows**, in
  every space alike.

## The default, and why top left

**CORRECTED IN BUILDING, step 7: it was already top left, and this section had
it wrong.** A camera rests at the middle of its view — the root's `main` at
`view/2`, a Viewport's at the middle of its window — and a camera's position IS
the middle of the view, so one resting half a view in frames the first screenful
from the corner. Measured: a camera-less world shows from (0, 0), before and
after `set size of view`, which sweeps a camera still standing where it was
declared so the framing survives a resize.

The draft read that as "shows the middle of the first screenful" and proposed
changing it. There was nothing to change. What the step turned into was four
assertions, because the behaviour was right and nothing said so — which is how a
plan came to argue with it.

So: **top left, uniformly, and already true.** No visible change, and the look at
`fixtures/jetpack` and `fixtures/meteors` the draft asked for is unnecessary —
nothing moved.

**Fitting the map to the view is NOT proposed here**, though it is the other
sensible default, because it needs zoom — which specs/VIEWPORT_PLAN.md lists as
not built and waiting on "the engine's cameras having any". Top left costs
nothing and fit drags zoom in with it, so fit waits for zoom and is a
one-property change when zoom lands.

## Where a Viewport's cameras are authored

WANTING MORE THAN ONE CAMERA PER VIEWPORT SETTLES THIS, and it settles it
against the cheap answer. Electing the camera traits on the Viewport actor
itself would have needed no new machinery — a placement already shows a field
per property of every trait its kind elects — but an actor holds each trait once
(`has` is a set over traits), so a Viewport could have exactly one framing. Two
cameras on one Viewport cannot be expressed that way at all.

So a camera stays the thing it already is: an object with its own trait set and
its own property values, owned by a space. What is new is that a Viewport's are
authored and listed somewhere, and that something says which one takes the view.

**The editor surface is the map editor, beside the layers.** A map's layers are
already a strip of them with add, remove, reorder and select, and an inspector
for the selected one (`mapEditor/LayerPanel`, `LayerInspector`,
specs/LAYERS_PLAN.md). Cameras are the same shape of thing — a short list
belonging to what is being edited, each with properties — so they get the same
treatment:

- On a world's main map, the strip lists the WORLD's cameras.
- With a Viewport placement selected, it lists that Viewport's.
- On a level `.map`, there is no strip, because a map has no cameras. That
  absence is the plan's point made visible.

A camera's inspector is then the Enhance row and a field per property of every
trait it elects, which is what a placement's inspector already does for an
actor's traits. `look offset` and `actor to follow` need no bespoke UI.

## Simplifying: a Viewport elects camera traits itself

BUILT, after the first person to aim a Viewport's camera in the browser needed
four blocks to do it — `define camera ⟨…⟩ for ⟨this actor⟩`, `use trait
⟨Follows⟩` in its mouth, `set actor to follow` on it, and `look through camera`
after it — and two of the four were ceremony. Every space already has a `main`
camera; the ceremony existed only because nothing but a `define camera` could
give a camera a trait.

**A kind that `Shows a Map` may elect camera traits, and they go to its own
main camera.** The palette offers the camera traits to a `use trait` under a
`define actor` whose rows elect `Viewport#ViewportTrait` (`traitOptions`,
read off the rows since that is where it is said), and nowhere else — a Label
given `Follows` would give it to no camera. Such a row generates
`actor.useCameraTraits([…])` rather than `useTraits` (`traitSubjectOfValue`
decides, from the trait's own subject in the rules in play). The engine gives
the kind's camera traits to the space's main camera when the Viewport is
placed, and the actor HOLDS them too, so their properties have slots on it:
`actor to follow` is then a field in the placement inspector — an actor
reference, with pick-on-canvas — and a `set … of ⟨this actor⟩` in blocks. The
values are copied from the Viewport to its camera once a tick, before the
steps run, so a target set this frame is aimed at this frame; only the traits
the kind elected directly, since a dependency's properties (`Aimed`'s goal)
are the camera's own working state.

**The stock Viewport elects `Follows` and `Confined to the Map`.** `Follows`
with no target does nothing — its step is guarded on there being one — so a
Viewport told nothing is the Viewport it was, and one given an `actor to
follow` in its inspector follows it with no blocks at all. `define camera ⟨…⟩
for ⟨…⟩` stays for a second framing, which is what it was always for.

**What this does not reach.** The inspector's actor picker offers this map's
placements, so a box holding its own copy of a level cannot pick the Pilot
inside it — that wants `actor to follow` by kind (step 10) or the `set` under
`shows a map`. A mirror, whose scene is the map the box sits on, needs nothing
more. And traits are elected per KIND: every stock Viewport can follow; which
one follows what is per placement.

## Which camera takes the view

**Every space has a `main` camera that always exists, and the Viewport carries a
property saying which of its cameras is in use, defaulting to that one.**

The world is already built this way and the lab already spells `main` three
times over: `DEFAULT_CAMERA_ID`, `ROOT_SPACE_ID` and `DEFAULT_LAYER` are the
same word, and a `World` is constructed with `cameraList = [makeCamera({id:
'main'})]` and `activeCameraId = DEFAULT_CAMERA_ID`. A space's main camera is
that, one level down: made with the space, never removable, and SYNTHESISED
rather than stored — which is how `mapLayers` already treats the default layer,
splicing `{id: 'main'}` in when a document does not mention it. A map that says
nothing about cameras therefore has one, and a project written before any of
this reads exactly as it did.

So the mechanism is `Space.activeCameraId`, and what differs between the world
and a Viewport is only the SURFACE it is set through:

- **A Viewport gets a property**, because a Viewport is a placement and a
  placement's properties are fields in an inspector and blocks for free. Setting
  it mid-play — a chase camera for the boss, the wide shot afterwards — is then
  an ordinary `set` with no new block to invent.
- **The world keeps `setActiveCamera`**, because it has no placement to hang a
  field on. This is the sense in which the world is the odd one out: not a
  different mechanism, a different way in.

**The property's choices are SIBLING knowledge**, and that makes it the third
dropdown of its kind rather than a new idea. A theme's choices are the project's
`.style` files; an `actor` property's are "the map's own placements, which is the
one thing the sandbox cannot supply" (`mapEditor/MapStage`). A camera property's
are this Viewport's own cameras, authored in the strip beside the field — so it
patterns with `actor`, not with theme.

That is worth recording rather than glossing: the inspector now special-cases a
dropdown for the second time, and `MapStage` already says what the third should
trigger — "an enum property type is what would replace it the day a second
property wants one". The choices here are per-placement rather than
statically declared, so a plain enum type would not cover it; what would is a
notion of "a reference to a sibling of the thing being inspected", which `actor`
is an instance of already. **Not proposed here**, but three special cases is the
point at which it has earned itself, and the next one should build it instead.

## Order of work

1. **Engine: a space holds cameras, and one collection finds them all.**
   `Space.camera` becomes a list, and `CameraCollection` walks the root's
   cameras and every space's. Nothing elects anything yet, so no camera step
   finds a new subject and the suite should not move. Tests: the collection
   answers with a Viewport's camera; `with(trait)` still filters.
2. **Engine: the queries the steps ask.** `Camera Confined` clamps against the
   map and `take the view` moves the camera; both must answer for the camera's
   own space — the space's bounds, and the Viewport's window rather than the
   world's view. The same treatment `mapSize(actor)` and `mousePosition(actor)`
   already got in specs/VIEWPORT_PLAN.md step 2.
3. **A camera belongs to a space, and is declared against one.** `defineCamera`
   takes the Viewport it is for — the actor, or its id — defaulting to the root,
   so the world's cameras are declared exactly as they are today and a
   Viewport's are declared at all for the first time. Every space is made with a
   `main` camera, synthesised as the default layer is. Tests: two cameras in two
   spaces keep their own traits and their own positions; a space with nothing
   said about cameras has `main`.

   (This step first HELD a declaration whose Viewport was not there yet. Step 8
   removed the need — see it — and the engine refuses one instead.)

4. **The Viewport says which camera it shows through.** `Space.activeCameraId`,
   defaulting to `main`, exposed as a Viewport property so a field and a `set`
   block come for free. Tests: the default is `main`; switching mid-play changes
   which camera the view is taken through; a name no camera has falls back to
   `main` rather than showing nothing.
5. **Rules: the traits reach a space's camera.** The four camera traits run for
   every camera the collection offers. No rule source changes shape — `Follows`
   already holds an actor and aims a goal — so this is step 1 and 2 paying off.
   Tests per trait, through a Viewport.
6. **Delete what the map owned.** `settleSpace`'s follow-and-clamp branch,
   `Space.follows`, `MapDoc.camera`, `withCameraFollows`, the inspector's
   "Camera follows" field and the tests of each. A level `.map` then says
   nothing about cameras, which is the plan's point.
7. **The default.** Every camera with no traits looks at the top left of its
   space — WHICH IT ALREADY DID. No engine change; four assertions instead, and
   a correction to the section above, which had described the existing behaviour
   wrongly and proposed changing it to itself.
8. **Blocks: `define camera ⟨wide⟩ of ⟨the Minimap⟩`.** The engine takes a
   space's name from step 3 and nothing writes one yet.

   **BUILT TWICE, and the second is the one that stands: `define camera ⟨name⟩
for ⟨actor⟩`, a socket.**

   The draft said a socket; the first build replaced it with a live dropdown of
   the world's Viewport placements, on the grounds that a world's prologue
   declares cameras BEFORE the map places its Viewports, so a live actor would be
   empty at the one moment it is read. That is true of the prologue and the wrong
   conclusion: the prologue is not where a Viewport's camera belongs. In the
   Viewport placement's own `on create` the Viewport exists, `world` is bound
   (`extensions/worldContext` admits any `world_on_…` hat) and `this actor` IS
   the Viewport. The block is already offered in a placement script's toolbox —
   `ROOT_HOMES` does not restrict it — so nothing had to be opened for it.

   The socket is also the more correct of the two, which the dropdown build
   missed. A dropdown holds an AUTHORED placement id, and a map loaded twice
   suffixes those, so a name matches the first copy and silently misses the
   second. `this actor` names the instance that is there.

   Two things went with the dropdown. `pendingSpaceCameras` from step 3 is
   deleted: nothing declares a camera for a space that does not exist, because
   the declaration lives in the handler that fires when the space is made. And
   the "only Viewport kinds are offered" filter is gone, so the protection it
   gave moved into the engine, which now THROWS for an owner that is not a
   Viewport — as `loadMapInto` does, and covering a hole the dropdown had anyway
   (a Viewport deleted after the fact left a name held pending forever, in
   silence).

9. **Editor: the camera strip.** THREE STEPS, not one, and priced here because
   the draft under-read it. Step 8 put camera declarations in the world's
   BLOCKS, so a strip is a block-editing surface and not a document-editing one
   — the shape to copy for the reading and writing is `mapEditor/worldProperties`,
   which already reads `define world`'s rows and rewrites their fields in the
   JSON without opening a workspace, and the shape to copy for the UI is
   `LayerPanel` / `LayerInspector`.

   - **9a. Read and show. BUILT.** `mapEditor/worldCameras` reads every
     `define camera` in a workspace — the world's are those with an empty owner
     socket, a placement's are those `for ⟨this actor⟩` in its script — and
     `CameraPanel` lists them beside the layers: the world's on a main map with
     nothing selected, a placement's with one selected, nothing on a level
     `.map`. Name and traits, and one button: Script, which opens where they
     are declared. That is the whole of what a read-only strip can honestly
     offer, and it says so where the list is empty rather than reading as "no
     view", since every space has a main camera regardless. It starts
     closed behind a Cameras button in the stage's toolbar, which appears
     only where there would be a list to show.
   - **9b. Add, remove, rename.** Renaming is a field rewrite, which
     `worldProperties` already does. Adding and removing are NOT: they splice a
     row into a chain and unlink one, and no writer in that module changes
     structure. This is the new surgery.
   - **9c. The inspector's traits.** "The Enhance row and a field per trait
     property" is doing a lot of work in one sentence: the Enhance machinery
     (`actors/enhance`) is keyed to actor KINDS, and a camera is not one. This is
     the piece to design rather than estimate.

10. **`actor to follow` by kind.** A property type the inspector can offer as a
    dropdown of the project's actor kinds, so a Viewport's camera can be aimed at
    something inside a map it does not yet hold.

    **AND THE QUESTION IT RAISES, found by reading `Camera Follow` for this.**
    That rule aims at `position of ⟨actor to follow⟩` and asks nothing about
    which space the actor or the camera is in. A world camera following a root
    actor is right by construction; a VIEWPORT's camera following `any ⟨Coin⟩`
    picks the first Coin anywhere in the world, and if that Coin is in the root
    the camera tracks coordinates that mean nothing in its own space. Nobody has
    hit it because until step 5 a space's camera could not follow at all.

    **ANSWERED AND BUILT, ahead of the step it was a prerequisite for.** The
    engine already drew the right line: `actorsNear`, `mapSize` and `the mouse`
    answer for the space of the thing in hand, and `any ⟨Kind⟩` does not — a HUD
    counting coins wants all of them. Following is spatial, so the narrowing
    went with the follow: a block `⟨actors⟩ in this space` (the engine's
    `inThisSpace`, reading the space BEFORE the walk, since `filtered` puts each
    candidate in hand during its test), and `Camera Follow` reads every one of
    its target reads through it, the guard included. A camera with nothing of
    its own to follow stays where it is. It fixed a case that was already wrong:
    a WORLD camera following a Player who happened to be inside a Viewport
    aimed at that Player's space-local coordinates as if they were the root's.

    What it does NOT fix is timing. `any ⟨Pilot⟩` is a SNAPSHOT at the moment of
    the `set` — `world.actors.ofType(…)`, an array — despite its tooltip
    promising "the ones placed later". Set in a Viewport's `on create`, before
    the Viewport's map has loaded, it freezes to the root's Pilots or to
    nothing. Making the stored value lazy was considered and rejected as a
    surprise in how values work; the answer is an EVENT for the moment the
    map lands (step 12).

11. **Specs. DONE.** This file's status, VIEWPORT_PLAN's open line, STYLES_PLAN's
    table, MAP_EVENTS_PLAN's principle extended to cameras, and SCROLLING_PLAN on
    what a camera with no traits now means for a scroll view — which is that it
    is the Viewport's to scroll, and one with traits is the rules' to aim.

    What this plan sidestepped by giving each Viewport its own space — one
    space, several cameras — is reopened by specs/MIRRORING_PLAN.md, a Viewport
    onto the world's own scene, which is where the second person to build a
    Viewport went next.

12. **An event for when a Viewport's map lands.** The other half of step 10's
    finding. `set actor to follow` in a Viewport's `on create` runs before the
    Viewport's map has loaded, and the value it stores is a snapshot, so the
    camera follows the root's Pilot or nobody. A hat for the moment the map is
    shown — the same moment `showHeldMap` already knows — is where that `set`
    belongs. Either that, or a kind's `is created` heard by OTHER actors, which
    would let the Viewport's script say "when any Pilot is created, follow it";
    both were proposed. BUILT as the first: `when ⟨this Viewport⟩ shows a map`,
    raised by `loadMapInto` after the map's actors exist in the space, for a
    load by path and by value alike, with the path as the event value. Queued
    like every event, so the handler runs on the tick the map landed and a
    `set actor to follow` there snapshots the Viewport's own Pilot. The kind's
    `is created` heard by other actors is still not built; it would be the
    general answer and this is the specific one.

    **AND A DECISION IT FORCED.** The hat is the twenty-fourth block in a gated
    first lesson whose detail pane says it unlocks the Actor drawer, and
    fourteen of the twenty-four are a foundation rule's own — eight the
    Viewport's. `toolboxShelf.generatedElsewhere` exempts every rule's
    generated blocks from gating except Space's and Appearance's, the pair that
    were built in when it was written; Viewport, Boxed and Styled are built in
    the same way and were never added. Extending the exemption to every
    `BUILTIN_RULES` entry is one line and the right line — and it makes those
    blocks earned, so a tile has to grant each of them or `shelfCoverage` will
    say nobody can reach it. Which tile teaches `set width`, and which a
    Viewport's map, is curriculum. Left for that decision, with the threshold
    raised by one and the reason written where the number is.

Steps 1 to 4 are invisible; 5 is where it starts working; 6 is where the lab
gets smaller; 8 is where an author can reach it AT ALL, in blocks; 9 is where
they can reach it without writing any. Each its own commit.

**8 is a usable stopping point**, and worth naming as one: a camera can be
declared of a Viewport, given traits, and aimed, entirely in blocks. What 9 buys
is not capability but reach, and it is a larger piece than 1 to 8 together.

## What this does not do

- **It does not build the "reference to a sibling" property type** that the
  camera selector is the third instance of. It special-cases a dropdown as the
  theme and the actor reference already do, and says where the abstraction is
  owed (see "Which camera takes the view").
- **It does not add zoom**, so "fit the map to the view" is still out of reach
  and the default is top left.
- **It does not answer a Viewport inside a loaded map.** Nothing forbids it and
  nothing tests it, which is where specs/VIEWPORT_PLAN.md left it.
- **It does not make a camera an actor.** A camera holds traits and has a
  position; it has no drawing, no box and no place in a map.
- **It does not add a "map loaded into a Viewport" event.** Step 6 is what
  removes the need for one here. The event is worth having on its own merits —
  it is the general answer to "configure the thing I just loaded" — and should
  be argued for there rather than smuggled in as a prerequisite.

## Obligations

- Every camera trait, elected through a Viewport, gets a test that runs it —
  the four are `Follows`, `Eases`, `Has a Deadzone` and `Confined to the Map`,
  and the last is the one whose duplicate this deletes, so it wants the
  arithmetic pinned on both sides of the change.
- `shelfCoverage` will want a tile granting whatever new block step 6 mints, as
  it did for `is data` (specs/RECORDS_PLAN.md). A block nobody can reach is the
  failure that ledger exists for.
- Every property a FOUNDATION rule gains is two more blocks in the first lesson,
  ungated, because a rule's own property blocks never are. `shows through` took
  the count from eleven to thirteen and `toolboxShelf` said so. That is the
  second drift — `Has a Style` was the first — and the fix both have deferred is
  to gate a foundation rule's blocks with the trait that elects them. The test
  that will eventually force it is the one asserting a first lesson is small
  enough to read.
- An answer to the cross-space question in step 10 BEFORE a fixture follows
  anything through a Viewport, or the fixture will enshrine whichever behaviour
  happens to fall out.
- A fixture that places a Viewport and follows something through it, since
  nothing today aims a Viewport's camera at all. `fixtures/interfaceKit` is the
  phone shape; a Viewport showing a level that follows its player is the
  demonstration this plan is for, and two cameras switched between is what proves
  the property.
- `projectWeight` will notice a `main` camera that is SYNTHESISED rather than
  stored only if something stores it. It must not: a map that says nothing about
  cameras has to keep saying nothing, or every map in every project grows a
  camera entry for no change in meaning — the same discipline
  `modal: undefined` keeps (specs/MODALITY_PLAN.md).
