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

## The mistake underneath it

`camera.follows` lives on the MAP, and the reason given for that is circular:
the value is a placement id, and placement ids are local to a map, so the
reference has to live in the map that owns them. But it is an id BECAUSE it was
put on the map. `Camera Follow` has no such problem — `actor to follow` holds
an actor, not a name, and an actor reference cannot dangle the way a name can.

The real obstacle was never the reference. It was that nothing elected traits
on a space's camera, so the engine did the work itself.

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

- **A world is the root Viewport.** Not a new idea to implement so much as one
  to stop contradicting: the root is a space with a camera, a Viewport is a
  space with a camera, and the only difference is that one has an owning actor.
- **One camera per space, of one kind, found by one collection.** Every camera
  step runs for every space's camera.
- **Traits are how a camera gains behaviour, everywhere.** Follow, ease,
  deadzone and confine reach a Viewport by being elected, not by being
  reimplemented.
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

## The open question: how a Viewport's camera gains a trait

This is the part the plan proposes rather than settles, because both answers
work and they say different things about what a camera is.

**Elect on the Viewport.** The camera traits become electable on an actor with
`Shows a Map`, and the subject their steps act on is that Viewport's space's
camera. The Enhance row and the placement inspector then work with no new
machinery at all: a placement shows a field per property of every trait its
kind elects, so `actor to follow` and `look offset` appear in the inspector the
day the traits are electable. Cheapest by a wide margin. What it costs is
honesty about ownership — `actor to follow` reads as a property of the
Viewport, which is a thing that shows a map, not a thing that looks at one.

**Give `define camera` an owner.** A camera is declared as it is today and says
which space it is for, so a Viewport's camera is as first-class as the world's
and `setActiveCamera` could mean something per space. Truer, and more work:
`define camera` is a world-level block, cameras are held in `cameraList` keyed
by id alone, and a second camera in a space raises "which one is active here",
which nothing asks today.

**Recommendation: elect on the Viewport**, and say in the block's own
documentation that the trait is about the view the Viewport shows. The truer
answer is the one to reach for when a space wants two cameras, and nothing
wants that yet.

## Order of work

1. **Engine: the collection.** `CameraCollection` walks the root's cameras and
   every `viewportSpaces[].camera`. Nothing elects anything yet, so no camera
   step finds a new subject and the suite should not move. Tests: the collection
   answers with a Viewport's camera; `with(trait)` still filters.
2. **Engine: the queries the steps ask.** `Camera Confined` clamps against the
   map and `take the view` moves the camera; both must answer for the camera's
   own space — the space's bounds, and the Viewport's window rather than the
   world's view. The same treatment `mapSize(actor)` and `mousePosition(actor)`
   already got in specs/VIEWPORT_PLAN.md step 2.
3. **Rules: elect on the Viewport.** The four camera traits become electable on
   `Shows a Map`, with the space's camera as their subject. No rule source
   changes shape; what changes is what may hold the traits. Tests per trait,
   through a Viewport.
4. **Delete the duplicate.** `settleSpace`'s follow-and-clamp branch,
   `Space.follows`, `MapDoc.camera`, `withCameraFollows`, the inspector's
   "Camera follows" field and the tests of each. A Viewport with no camera
   traits then looks at the top left of what it holds, which is step 5.
5. **The default.** Every camera with no traits looks at the top left of its
   space. One change in the engine, and a look at `jetpack` and `meteors` in the
   browser.
6. **`actor to follow` by kind.** A property type the inspector can offer as a
   dropdown of the project's actor kinds, so a Viewport's camera can be aimed at
   something inside a map it does not yet hold. Runtime semantics are already
   there; this is a type, a generator case and an inspector field.
7. **Specs.** This file's status, VIEWPORT_PLAN's open line, STYLES_PLAN's table
   if the inspector's fields move again, and SCROLLING_PLAN on what a camera
   with no traits now means for a scroll view.

Steps 1 and 2 are invisible; 3 is where it starts working; 4 is where the lab
gets smaller. Each its own commit.

## What this does not do

- **It does not give a space two cameras**, or `setActiveCamera` a meaning per
  space. One camera per space, as today.
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
  demonstration this plan is for.
