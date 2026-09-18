# Plan: the curriculum (MAP_FIRST.md, step 6)

STATUS: IN PROGRESS. The sixth and last build step of specs/MAP_FIRST.md,
which says of it one line: "Tiles that unlock editor affordances; levels
re-pinned." This plan says what that line is taken to mean, what is built,
and what is left for a decision that is not the build's to take. The
working record, as before.

## The problem

The curriculum was written when a world opened on its block workspace
(specs/PROGRESSION.md). Seventy-eight lessons say "add **when ⟨…⟩**" and
mean the World view. Since step 2 a world opens on its MAP, so every lesson
opens on a canvas its instructions never mention, one click from where its
task is. That is the first thing to put right.

The second is the gate. A gated lab offers a learner what they have
unlocked, and the gate reaches the toolbox and the two import dialogs
(`progression/shelf`). It does not reach the map editor, which steps 1 to 4
filled with things no lesson has taught: a script on a placement, a map's
own script, layers with backgrounds. `place/map` grants `editor: map` and
nothing reads it.

The third is that nothing teaches what the first five steps built. The
instance script is the reason the whole design exists, and no tile hands it
over.

## What is being built

- **A lesson says which view its world opens on.** `levelData.worldView`,
  `map` or `world`. A project that says nothing opens on its map, as now. A
  LESSON that says nothing opens on its workspace, since that is where its
  instructions are; the lessons about the map say `map`.
- **The shelf reaches the map editor.** Three things are held or not:
  - the MAP VIEW of a world, which is `editor: map`, `place/map`'s grant
    since before there was a view to gate. Without it a gated lab shows a
    world's workspace and no view bar, which is the lab the first lessons
    were written for;
  - SCRIPTS on a map: the Script button on a placement, the map's own, the
    corner marks and their toggle. A new unlock kind, `affordance`, with
    the id `map-scripts`;
  - LAYERS in a map: the strip, a layer's inspector, a placement's Layer
    dropdown. `affordance: map-layers`.
- **An ungated lab holds everything**, as with every other unlock, and a
  lesson lends what it grants while it is open (`shelfKeys`).
- **`place/layers` is told in the editor.** MAP_FIRST.md: "`define layer`
  in a world stops being how a layer is made, and stays for what a script
  changes while the game runs." The lesson's hills, score and hero become
  placements on its main map, its instructions use the layer strip, and it
  grants `map-layers` beside the blocks it granted. Its check reads the
  LAYER a thing is in and how that layer moves, from the map or from
  `define layer` blocks: a learner who does it in blocks has done it.
- **A new tile, `place/script`: "This one, not the other".** Two Buttons
  of one kind on a map and a Lamp. `when ⟨any Button⟩ is clicked` cannot
  tell them apart, which is where this whole design started (the pause
  menu's Resume and Quit). The lesson gives each Button a script of its
  own, in the map. It grants `map-scripts` and the block a map script
  names a placement with, `the ⟨…⟩`. At `place (3,1)`, the one free cell
  that keeps Place one shape, entered from `place/layers`.

## Decisions taken before building

- **The first lessons stay in blocks.** The other reading of "tiles that
  unlock editor affordances" is a curriculum re-founded on the canvas:
  Origin places an actor by clicking, the palette and the inspector are the
  first unlocks, and the workspace is a mode earned later. That is a
  rewrite of Origin and of most of six foundations, and of what
  PROGRESSION.md argues a first lesson is. It is not done here and is
  listed under "Left for a decision". What is built works for either: the
  gate can hide the World view as easily as the Map view once a tile says
  so.
- **One affordance per thing a lesson teaches, not per control.** The
  palette and the placement inspector are not gated apart from the map
  view: `place/map` teaches painting a room, which is the palette, and
  there is no lesson a map view without them would serve. The world's
  properties as fields, and a level's `Camera follows`, show only when the
  file has something for them to show, and are left alone.
- **A gate hides a control; it never refuses a file.** A lesson's own
  project may hold a scripted placement or a layered map a learner has not
  earned (an edge means readiness, not possession — `progression/shelf`).
  The map draws and runs as it is; what is withheld is the way to make
  another.
- **`fit` stays**, and the Viewport is still not what lessons teach for an
  interface: `place/layers` keeps teaching a layer fixed to the screen.
  Retiring it is a second curriculum change, after this one is seen to
  work.

## Order of work

1. `worldView` in level data; the world editor opens on it; lessons
   default to `world`.
2. The `affordance` unlock kind; the world editor's view bar and the map
   editor's scripts and layers behind the shelf. Tests.
3. `place/layers` on its main map, told in the editor; its check reading
   either telling.
4. `place/script`: the tile, the lesson, the check, the tests.
5. Specs: PROGRESSION.md's tables, MAP_FIRST.md's status, this record.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)

## Left for a decision

- **Whether the curriculum is re-founded on the canvas**, as above.
