# One kind of camera, in every space

STATUS: PROPOSED. Nothing here is built. specs/VIEWPORT_PLAN.md left one
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

Today a camera rests at the middle of its view: the root's `main` camera is
made at `view/2`, and a Viewport's at the middle of its window. A camera that
elects nothing therefore shows the middle of the first screenful, which is the
right shape for a level a player walks around and the wrong one for a map you
are looking AT — the same distinction `ViewportScrollProperty` already draws
between a camera's middle and a scroll offset (specs/SCROLLING_PLAN.md).

Top left is the default this proposes, uniformly. It is a visible change for
every project with no camera of its own, and the fixtures that deliberately
have none are the check: `fixtures/jetpack` ("there is no camera in this
project at all") and `fixtures/meteors`.

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
   takes the space it is for, defaulting to the root, so the world's cameras are
   declared exactly as they are today and a Viewport's are declared at all for
   the first time. Every space is made with a `main` camera, synthesised as the
   default layer is. Tests: two cameras in two spaces keep their own traits and
   their own positions; a space with nothing said about cameras has `main`.
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
   space. One change in the engine, and a look at `jetpack` and `meteors` in the
   browser.
8. **Editor: the camera strip.** The world's cameras on a main map, a
   Viewport's with that placement selected, none on a level `.map` — built the
   way the layer strip is, with an inspector that is the Enhance row and a field
   per trait property (`mapEditor/LayerPanel`, `LayerInspector`).
9. **`actor to follow` by kind.** A property type the inspector can offer as a
   dropdown of the project's actor kinds, so a Viewport's camera can be aimed at
   something inside a map it does not yet hold. Runtime semantics are already
   there; this is a type, a generator case and an inspector field.
10. **Specs.** This file's status, VIEWPORT_PLAN's open line, STYLES_PLAN's table
    if the inspector's fields move again, MAP_EVENTS_PLAN's principle extended to
    cameras, and SCROLLING_PLAN on what a camera with no traits now means for a
    scroll view.

Steps 1 to 4 are invisible; 5 is where it starts working; 6 is where the lab
gets smaller; 8 is where an author can reach it without writing blocks. Each its
own commit.

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
