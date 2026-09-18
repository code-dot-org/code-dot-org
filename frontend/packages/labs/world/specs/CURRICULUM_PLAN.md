# Plan: the curriculum (MAP_FIRST.md, step 6)

STATUS: BUILT, and seen working in the browser. The sixth and last build step of
specs/MAP_FIRST.md, which says of it one line: "Tiles that unlock editor
affordances; levels re-pinned." This plan says what that line is taken to
mean, what is built, and what is left for a decision that is not the build's
to take. The working record, as before.

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
    were written for. REMOVED since: see "Decided since";
  - SCRIPTS on a map: the Script button on a placement, the map's own, the
    corner marks and their toggle. A new unlock kind, `affordance`, with
    the id `map-scripts`;
  - LAYERS in a map: the strip, a layer's inspector, a placement's Layer
    dropdown. `affordance: map-layers`.
- **An ungated lab holds everything**, as with every other unlock, and a
  lesson lends what it grants while it is open (`shelfKeys`).
- **`place/layers` is told in the editor.** MAP_FIRST.md: "`define layer`
  in a world stops being how a layer is made, and stays for what a script
  changes while the game runs." The lesson's hills and score become
  placements on its main map (its hero could not: see "Learned"), its
  instructions use the layer strip, and it grants `map-layers` beside the
  blocks it granted. Its check reads the
  LAYER a thing is in and how that layer moves, from the map or from
  `define layer` blocks: a learner who does it in blocks has done it.
- **A new tile, `place/script`: "This one, not the other".** Two Buttons
  of one kind on a map and a sign. `when ⟨any Button⟩ is clicked` cannot
  tell them apart, which is where this whole design started (the pause
  menu's Resume and Quit). The lesson gives each Button a script of its
  own, in the map. It grants `map-scripts` and the two blocks only a map's
  script can say, `the ⟨…⟩` and `unload this map`. At `place (3,1)`, the
  one free cell that keeps Place one shape, entered from `place/layers`.

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

- `d74858aded7` — this plan.
- `65f8a4cce51` — `levelData.worldView`, and the world editor opening on it;
  lessons defaulting to their workspace. The `affordance` unlock kind; the
  view bar behind `editor: map`; a map's scripts and layers behind the two
  affordances.
- `276d0d8555d` — `place/layers` on its main map and told in the editor;
  its check reading the map or the blocks.
- `0a3291c6e82` — `place/script`: the tile, the lesson, the check and its
  tests; PROGRESSION.md and MAP_FIRST.md.

## Learned while building

- **`editor: map` had been granted since the catalogue was written, and
  read by nothing.** The catalogue was written from what lessons need, and
  `place/map` needed the map editor, so it said so. Four `editor` grants
  exist and this step gives one of them a meaning; the other three
  (`animation`, `effect`, `image`) still gate nothing, and are listed
  below.
- **A placement script ran in a lesson's check the first time it was
  tried.** The check plays a pointer down and up on each Button and reads
  the sign; the script is the main map's, compiled into the world's
  module (step 2), naming `the ⟨Sign⟩` (step 1). Nothing in either step had
  a lesson in mind, and nothing needed changing for one.
- **The hero could not move onto the map with the hills.** `place/layers`
  was to have every actor a placement. Its camera names who it follows
  under `define world`, and the main map is loaded after those rows, so a
  Hero on the map is not there to be named. The Hero stays an `add actor`
  row. The general form of this is under "Not built, and known".
- **Two blocks had been parked where they did not belong.** Step 1 granted
  `the ⟨…⟩` and `unload this map` from `story/choice`, the tile that grants
  the Button, for want of a lesson about scripts. The layout test refuses a
  second grant of anything, which is how their move to `place/script` was
  found rather than remembered.
- **A seventh cell.** A foundation is six cells in the catalogue's drawing.
  Place's `(3,1)` was free, touches `layers`, `camera` and `camera-feel`,
  and no test forbids it; the one thing that moved was the map's
  arrow-key test, which used the hole that cell was.
- **The check harness merges actor files into the world it hands an
  edit**, and files each root back afterwards. A test that swapped in a
  world's blocks from elsewhere lost every actor's roots and failed with
  `actor is not defined` in an empty module, which read like a generator
  defect for a quarter of an hour. Edits to a lesson compose; they do not
  transplant.

## Not built, and known

- The other three `editor` grants gate nothing: a gated learner can open
  the animation, effect and image editors before the tiles that grant them.
- A row under `define world` cannot name a main-map placement, since the
  map loads after the rows. `place/layers` works round it; a camera that
  follows a placement wants either the map loaded first or the follow
  resolved late.
- `place/layers` still teaches a layer fixed to the screen (`fit`), not a
  Viewport with the interface outside it. MAP_FIRST.md retires `fit` when
  lessons teach the Viewport for an interface; they do not yet.
- No lesson teaches a MAP's own script and its events (`define event` in
  a `.map`, `when ⟨quit⟩` in the world), which is the pause menu's other
  half. `place/script` grants the way in and stops at the placement.
- The lesson instructions name the editor's controls by their labels
  ("Script", "Back", "Moves X"). Nothing pins the two together, so a
  renamed control leaves a lesson pointing at nothing.

## What to look at in the browser

In a gated lab a lesson's world should show both tabs, Map and World, whatever
has been done. With `place/map` open, the world should open on the map, with
no Layers list and no Script button. `place/layers` should open on the map
with the Layers list: adding a layer, ticking Fixed to the screen and setting
the Score's Layer should pass the check when run. `place/script` should open
on the map with two Buttons and a sign: a Button's properties should offer
Script, the workspace should offer `the ⟨Sign⟩` under Map, and each Button
should get its corner mark. Any other lesson should open on its workspace,
with Map one tab away. An ungated project should look as it did.

## Decided since

- **The first lessons move onto the canvas**, with blocks shown when a
  lesson needs programmable behavior, and the World workspace never locked.
  specs/CANVAS_FIRST.md is what that takes, lesson by lesson.
- **Neither view of a world is ever withheld.** This step gated the Map
  view behind `place/map`'s `editor: map`. That gate is removed: a learner
  can open either view from the first lesson and see what is and is not
  theirs yet. `editor: map` is read by nothing again. The two affordances
  stand, since they withhold a control inside a view and not the view.
