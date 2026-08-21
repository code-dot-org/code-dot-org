# Plan: maps in the world

A world places actors two ways today. `add actor` places one, with its
per-instance values set by blocks chained under it; `load map` places everything
a `.map` file describes, which is where an arrangement of twenty coins belongs
because twenty `add actor` stacks is not an arrangement, it is a wall of blocks.

Neither reaches an actor a world defines for itself (BACKGROUNDS-adjacent work;
see `blockly/localActors`). `add actor` does — one at a time. A `.map` cannot:
its entries name a type, a type is a module path, and a world-local actor has no
module. That is not an oversight to patch. A file that could name the private
actor of one world would be a file that means nothing anywhere else, and the
whole point of the file form is that it is shared.

So: **`create actor in map`** — a block in the world's body that places many
actors of one type, with a field that opens the map editor scoped to that type.
Sugar over `add actor`, in the same sense a map file is sugar over twenty of
them, and the arrangement lives in the world rather than beside it.

## 1. The map is not a file

The placements are part of the `.world` file — its Blockly serialization —
rather than a `.map` of their own.

This is a constraint, not a preference, and it follows from what the actors are.
An actor defined in a world exists only in that world (BACKGROUNDS.md's
neighbour: `specs/INTERFACE.md` on files as the unit of sharing). A file
describing where those actors sit would be a file that only one world can read,
sitting in a folder whose whole promise is that anything in it can be used
anywhere. The arrangement of a world's own actors is part of that world in
exactly the way its rules are.

It also removes a class of breakage nobody would enjoy: a `.map` renamed,
deleted or moved while a world still names it. There is nothing to keep in step
when there is nothing beside it.

## 2. Where it lives: the map field's value

Each `create actor in map` block carries its placements as the VALUE of a map
field (`fields/FieldMapPlacements`, built on the same `createReactField` the
vector field uses). Blockly serializes a field's value with the block, so the
arrangement is in the `.world` file with nothing of ours in that path.

```jsonc
// inside the `.world` workspace, on one `world_create_in_map` block
{
  "type": "world_create_in_map",
  "id": "mk1",
  "fields": {
    "ACTOR": "local:localActorBlock",
    "PLACEMENTS": [
      {
        "id": "p1",
        "properties": {"positional": {"position": {"x": 48, "y": 80}}},
      },
      {
        "id": "p2",
        "properties": {"positional": {"position": {"x": 112, "y": 80}}},
      },
    ],
  },
}
```

One block, one actor type, its own placements. Three consequences worth stating:

- **Deleting the block deletes its actors**, and nothing else's. There is no
  shared document to garbage-collect, and no way to leave orphans behind.
- **Undo is Blockly's**, and so is copy: duplicating the block duplicates the
  arrangement, because it is a field value like any other.
- **The `.world` file grows with the placements.** A hundred actors is a few KB
  of JSON — small beside the project's images. A thousand would be a different
  conversation; §7.

Each entry omits `type`: the block's ACTOR field says which actor these are, and
storing it twice is storing it wrong. The generator supplies it (§3).

Ids are `p1`, `p2`, … , the lowest free number, rather than random: they become
instance ids in the running world, and an id that changed on every edit would be
an actor the hot reloader cannot recognise as the one already there.

## 3. The block, and what it generates

```
create [Coin ▾] in map  (edit…)      ← a statement in the world's body
```

The ACTOR dropdown is `actorFieldOptions` — the project's actor modules and the
world's own actors, the same list `add actor` offers. `(edit…)` opens the popup.

The generated code needs no engine change, because `loadMap` already does this
job: it resolves each entry's `properties[ownerId][propId]` against the world's
property registry, stamps the actor's `type`, and disambiguates instance ids
(`WorldBuilder.loadMap`, `resolveInstanceId`).

```js
// a world's own actor: the template is a const in this same module
world.define('Coin', actor_Coin_mk1);
world.loadMap({
  actors: [
    {
      type: 'Coin',
      id: 'mk1:c1',
      properties: {Space: {position: {x: 64, y: 96}}},
    },
    {
      type: 'Coin',
      id: 'mk1:c2',
      properties: {Space: {position: {x: 128, y: 96}}},
    },
  ],
});
```

```js
// a module actor: imported, exactly as `add actor` imports one
import Coin from "actors/coin";
world.define("actors/coin", Coin);
world.loadMap({actors: [{type: "actors/coin", id: "mk1:c1", …}]});
```

Notes on the shape:

- **Each block loads its own literal**, so there is no coordination problem —
  the "who emits `loadMap`" question that a shared document would have forced,
  and no chance of loading the same map twice (`loadMap` is additive).
- **Instance ids are prefixed with the block's id.** They must be unique across
  the world and stable across rebuilds — stable because that is what lets the
  reconciler tell "the same actor moved" from "a different actor"; prefixed
  because two blocks may both have a `c1`.
- **`world.define` is emitted even though the literal could carry the builder**,
  because the type string is what a placed actor is known by: `is a` compares
  against it, and so does anything asking for actors of a kind.

**Done — the block is implemented.** `world_create_in_map`, its
`mapPlacementsMutator` (extraState, so the arrangement is saved with the
workspace, copied with a duplicated block, and undone by Blockly's own undo),
its generator, and the `edit…` button that will open the canvas. The button
carries the count — `edit… (3)` — because a block whose content is somewhere
else should at least say how much of it there is, and it writes back through one
`BlockChange` mutation event: extraState changes fire nothing on their own, and
an edit the workspace never hears about is neither saved nor compiled.

It emits nothing at all until something is arranged, so a block dragged out and
left alone is inert rather than broken — checked in the editor, where a world
holding one keeps running with no console errors.

## 4. The popup: a field dropdown, and one act

Clicking the field opens a grid of the world's tiles in Blockly's dropdown —
ten by ten, 22 pixels a cell, about the size of a colour picker. Click an empty
cell and this block places one there; click a cell it placed in and that one
goes. That is the whole interaction.

- **No palette**: the block's dropdown already said which actor these are.
- **No camera**: the world is 320 pixels and the grid shows all of it.
- **No inspector**, which is the one thing given up — see below.
- **The rest of the world is drawn behind**, dimmed and not clickable: the other
  `create actor in map` blocks' placements, read straight off the workspace
  through the field's `sourceBlock`. A coin's place is worth judging against the
  ground under it.

**The block face shows the map.** A 30-pixel square of the world with a dark
mark at each of this block's placements, on a light ground — the same preview
the old Sprite Lab put on its block, and for the same reason: it says WHERE,
which is what the block is about. No count beside it; the marks are the count. Thirty rather than the
eighteen a field is normally tall because ten cells across a smaller box gives
each cell under two pixels, and an arrangement nobody can read is not worth
drawing. Only the occupied cells are drawn; an empty map is an empty box.

Actors are drawn with the thumbnails the sandbox renders, pushed into a registry
the field reads (`blockly/actorThumbnails`) because a Blockly field is not in the
React tree and cannot ask the runtime context itself — the same arrangement the
project dropdowns use. A cell whose thumbnail has not arrived draws a plain
marker, which still says it is taken.

**What this gives up.** An earlier draft of this plan opened the full map editor
scoped to one actor, so a learner could set each instance's properties without
blocks. Placement-only drops that: an actor placed here gets the position of its
cell and whatever its definition gives it. Positions are what an arrangement of
twenty coins is actually about, and a dropdown that does one thing is worth more
than a window that does five; per-instance properties remain available where
they always were, in a `.map` file and its editor.

That editor is unchanged, and `MapStage` — the canvas and inspector extracted in
step 2 — is now back to one caller. The extraction still pays for itself in
`MapEditor` being 125 lines instead of 1103, but it is fair to say the second
caller it was made for no longer exists.

## An actor-typed property: a placement naming another

A placement may hold a REFERENCE to another placement — the stock Health Bar's
`subject` is one, and it is what lets a bar be pointed at the player in the map
editor rather than in a block.

A map is JSON and JSON holds no actors, so what is stored is the other entry's
ID and `WorldBuilder.loadMap` resolves it. In a SECOND PASS, once every entry
exists, which is what lets a reference point forwards or in a circle.

**Ordering the entries instead would have been cheaper to describe and wrong
twice.** Placement order is DRAW order within a layer — `renderSnapshot` walks
`actorList` as it was filled — so sorting a map to put references first would
silently restack anything sharing one. And a cycle has no order to be put in.

**By ENTRY id, not by the actor's.** `resolveInstanceId` disambiguates a taken
id to `base#2`, and maps stack — a level and a HUD — so looking a name up in
the world could find an actor from another map, or the wrong one of two. What a
placement means by "Player" is the Player in THIS map.

**A reference to nothing is left unset.** A placement may point at one that has
since been deleted, and refusing the map over it would take a whole level away
for a bar pointed at a missing enemy. That is what a map already does with a
property it cannot resolve. Rewriting references when a placement is deleted or
renamed — the way `renameRule` rewrites rule names — is the better answer and is
not built.

A SET of actors is still not offered: `contacts` is what a rule works out at
runtime and there is nothing sensible to pick.

**Two ways to say who, and both are needed.** The dropdown names any placement
in the map; the button beside it arms a click on the canvas, and the next click
chooses whatever it lands on. The dropdown is exact and unreadable the moment a
level has thirty things in it; pointing is the gesture the canvas is already
for, and is the one anybody with a pointer will use.

Neither replaces the other. A canvas click cannot be reached from a keyboard,
so an affordance that was the only way to set a reference would put the feature
out of reach — the dropdown is what keeps it available.

While a pick is armed the cursor is a crosshair and the hovered actor wears the
REFERENCE colour rather than the hover one, because the click will point at it
rather than select it. The click never changes the selection: doing so would
take away the very actor whose property is being set. Escape disarms, a click
on empty space disarms without clearing the value — undoing a reference is what
the dropdown's "(none)" row is for, and a missed click should not be
destructive — and selecting another actor disarms too, since the armed property
belonged to the one that was selected when the button was pressed.

## 5. What blocks this: a world-local actor has no schema

The inspector is driven by `schemas[type]`, which the sandbox builds by
introspecting real actor instances — and it builds them from the **thumbnail
manifest**, which imports actor modules by path:

```js
// runtime/thumbnailManifest.ts
import W from 'worlds/main';
import M0 from 'actors/coin';
export default {world: W, actors: [{type: 'actors/coin', builder: M0}]};
```

An actor defined inside the world is not a module and cannot be imported. So for
exactly the actors this block exists to serve, the popup would draw a canvas and
an empty inspector — placements you can move but not configure.

**The fix, and it is step one.** The world's module already gets imported by the
manifest, so let it carry its own templates out:

```js
const localActors = {};                       // assembler, when any are defined
const actor_Coin_mk1 = new WorldLab.ActorBuilder({id: "Coin", name: "Coin"});
{ const actor = actor_Coin_mk1; /* traits, values */ }
localActors["Coin"] = actor_Coin_mk1;         // the define block
const world = new WorldLab.WorldBuilder(…);
export default world;
export {localActors};                         // assembler
```

`assembleWorldModule` already orders definitions before the world and already
knows which top-level blocks are `world_actor`, so both added lines are its to
emit. The manifest then reads `W`'s companion export and describes those
builders the same way it describes an imported one.

**Done — this part is implemented.** Every world declares and exports
`localActors`, defined actors or not: an export that is only sometimes there is
one its importers must ask about first, and empty is a perfectly good answer.
The `define actor` block registers itself under the type a placement carries
(`localActors["Coin"] = actor_Coin_ab1`), and `thumbnailManifest` spreads them in
beside the imported modules. Two actors of one name share a key, as they already
share what `is a` can tell about them.

Checked in the browser, because the manifest is compiled rather than bundled and
a broken one would only show there: a world with a `define actor` in it restarts
and runs, and opening `level1.map` still compiles the manifest, draws its four
thumbnails and lists Player / Ground / Coin / Ball. The other half — a local
actor's schema actually reaching the inspector — has no way to show until the
popup exists (§4), and is pinned by tests until then.

This is worth doing whether or not the block ships: an actor you cannot inspect
is an actor the map editor cannot help you place, and that is true of `add
actor` too.

## 6. What happens to `.map` files

Nothing, for now. `load map` and `maps/*.map` keep working and keep their reason
to exist: an arrangement several worlds load, authored in a file, is a real
thing — the starter project's `level1.map` is one.

The two forms answer different questions. A file says "this arrangement is a
thing in its own right"; a block says "this world has these actors in these
places". A project may use both, and the popup draws the file's actors as
context too if the world loads one (§4, second bullet) — worth having, not worth
blocking on.

If in-world maps turn out to cover everything a learner actually does, the file
form becomes a levelbuilder feature rather than a learner one. That is a
conclusion to reach from use, not from this document.

## 7. Costs, and what is deliberately not solved

- **Size.** The placements ride in the `.world` file, which rides in the project
  save. A hundred actors is a few KB; ten thousand tiles would not be, and this
  is not a tilemap — a floor is one wide Ground actor, as the starter project
  already has it.
- **No sharing.** Two worlds cannot use the same in-world arrangement. That is
  what the file form is for, and copying a block between worlds copies its
  placements with it.
- **One type per block.** Arranging a scene means several blocks, each opened in
  turn. The alternative — one popup that edits everything — is the map file
  editor, which exists. This block is deliberately the narrow one: it makes
  "twenty of these, here" a single act.
- **Tile size** is the lab's (`runtime/viewport.TILE_SIZE`), not the map's. The
  `.map` file carries a `tile` because a file has to say; a block in a world does
  not, and a per-block grid would be a setting with no consequence outside the
  editor.

## 7a. An unrelated thing this turned up — since fixed

A block dragged into a `.world` file did not come back after a full page reload:
the saved file had it (the compiler read the same file and placed its actors),
but the editor's workspace came up showing the STARTER contents. It happened to a
plain `add actor` exactly as it did to `create actor in map`, so it was neither
this feature's nor new.

The cause: every custom editor seeded itself from `initialContents` once, at
mount, and the project finishes loading AFTER that — `onLevelLoad` replaces the
sources through the context (which is why the compiler had the saved file), but
nothing told an already-mounted editor to look again. So the workspace showed a
project nobody had any more, and half a minute later would have saved it back
over the real one.

Three changes: one that stops the situation arising, and two that make the
system honest about it either way.

**The sources are now a value, not an event.** `LabWithSources` reads
`state.lab.initialSources` from redux and passes it to `SourcesProvider`, which
was always shaped to take it (`getInitialSources` prefers it; the provider
reinitializes when it changes) and never got it. Before, the loaded project
reached the context only through `LevelLoadCompleted` — which a provider that
mounts AFTER the load never hears, leaving it on the level's start sources with
nothing to correct it. `Lab` renders nothing while `isLoadingProjectOrLevel`, so
that order is a real one.

**Each editor re-seeds when its file changes underneath it.** It keeps the
contents it is in step with — what it was seeded from, plus everything it has
written since — and reloads when anything else arrives: `BlocklyFileEditor`,
`MapEditor`, `AnimationEditor`, and Codebridge's text editor, which had it too.

**And nothing mounts before the sources are known.** `LabHost` gated on
`!levelPropertiesMap || !appOptions` — the level METADATA. `loadLab`, which
fetches the sources, goes out from an effect a render later, so the lab mounted,
rendered the level's start sources, and swapped them for the learner's project a
moment later. That flicker is the situation these guards were catching.

The gate is now a positive signal, `hasLoadedProjectFor(levelId)`, recorded where
the sources become known (`onLevelChange`, which every path reaches — including
levels with no project at all) and cleared when a new load starts. Positive
because the absence of a load in flight is not the same as a load having
happened: `isLoadingProjectOrLevel` is false before the dispatch as well as
after it lands, so a host waiting on the flag still gets one render with no
sources. A spinner that says nothing yet beats a lab that says the wrong thing
and corrects itself.

Measured, by disabling each in turn against the same reload:

|                       | dragged block after a reload |
| --------------------- | ---------------------------- |
| none of the three     | gone (8 blocks)              |
| provider change only  | gone (8 blocks)              |
| per-editor guard only | back (9 blocks)              |
| loading gate only     | back (9 blocks)              |

So the gate is what makes the common case correct, and the guard is what catches
the rest: sources are replaced under a mounted editor by a version restored, a
Start Over, and a level switch (Lab2 does not reload the page between levels).

## 8. Testing

- **Pure, in vitest**: the block's generator (both actor kinds, empty state, a
  deleted definition), `saveExtraState`/`loadExtraState` round-tripping, id
  prefixing and uniqueness, and the manifest's new export.
- **The scoped editor**, in jsdom: it places only its own type, draws its
  siblings' placements, refuses to select them, and writes back exactly the
  placements it was given plus the new one.
- **In the browser** (Playwright against `dev:isolated`): place three actors in
  the popup, close it, and see three actors in the preview — then reload and see
  them still there, which is the test that the state really did land in the
  `.world` file.

## 9. Order of work

1. **The manifest gap** (§5): `localActors` export, manifest reads it, schemas
   arrive for world-local actors. Useful on its own — `add actor` benefits too.
2. **Extract** the map editor's canvas + inspector from `MapEditor.tsx`, with
   the file editor as its first caller and no behaviour change. (Done — §4.)
3. **The block**: `world_create_in_map`, its map field, its generator.
   (Done — §3.)
4. **The popup**: a field dropdown that places and unplaces. (Done — §4.)
5. **Context**: the siblings' placements are drawn (§4); the loaded `.map`'s
   are not yet.
