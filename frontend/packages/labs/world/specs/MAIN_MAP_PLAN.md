# Plan: the main map (MAP_FIRST.md, step 2)

STATUS: IN PROGRESS. The second build step of specs/MAP_FIRST.md, after
specs/MAP_SCRIPTS_PLAN.md: every world has a main map, held in its own file;
opening a world opens the map editor on it, with the world's workspace one
switch away; the world's properties are set with nothing selected. The
working record, as the first step's was: the plan before building, each
commit as it lands, and what was decided or learned.

## What is being built

- **The main map, in the world's file.** A `.world` gains a `map` beside its
  `blocks`: the same shape a `.map` holds — size, tile, placements each with
  an optional workspace. The generator compiles it into the world module and
  loads it after the world's own rows, so it draws over whatever `load map`
  rows placed. A world with no `map`, or an empty one, compiles as it did.
- **The world editor.** Opening a `.world` opens the map editor on its main
  map. A switch at the top shows two views of the one file: Map, the canvas,
  palette and inspector; World, today's Blockly workspace. Both write the
  same file, and neither loses what the other holds.
- **The world's properties on empty selection.** The inspector, with nothing
  selected, shows the world's name and the properties its `define property`
  rows declare, with their starting values as fields. A change writes the
  row's DEFAULT in the workspace's serialization.
- **A placement's workspace in the main map** is the same third view step 1
  built, with the world's own drawer at home.

## Decisions taken before building

- **A top-level `map` key, not a field on `define world`.** MAP_FIRST.md
  said the arrangement lives on the root block as a field value, as
  `create actor in map` stores its own. Read against the editor's shape —
  two views over one document, the Map view holding no Blockly instance —
  a field would put a JSON blob on a block that has no use for it, and
  Blockly would need a field type only to keep it through a save. Blockly's
  workspace loader ignores keys it has no serializer for, so `map` beside
  `blocks` costs the world's workspace nothing; what it costs is that the
  file editor must carry the key through its own saves, which is one merge
  at the one place it reads a workspace back. MAPS.md §1's constraint — the
  arrangement of a world's own actors lives in the world's file — holds.
- **The main map loads after the world's rows.** `use rule` must precede any
  load, and the rows chained under `define world` may hold `load map`s of
  their own; the main map's load is emitted after the whole root chain, so
  rules are in force and the main map draws over a loaded level, which is
  what a readout over a level wants. Its script binds `placed` and `map` as
  a `.map`'s does, through the same generator helper.
- **A placement's script in the main map is at home in the world.** Its
  palette hoists the world's own drawer (`ownMapModule` is the world's
  path), so a placed button may add to the world's score.
- **The map view is the door.** A `.world` opens in Map view, whatever
  opened it. A block that opens the world file lands there too; the World
  view is one click.
- **The thumbnail manifest stubs the world's map as it stubs a `.map`.**
  Otherwise every placement edit in the main map would recompile the
  manifest, which stubbing existed to prevent.
- **Not in this step.** Migrating `create actor in map` into the main map,
  and moving the starter project's level into its main map: content, after
  the mechanics work. Layers, backgrounds, the camera and the Viewport are
  steps 3 and 4.

## Order of work

1. Generator: `map` in a `.world`, compiled and loaded; the manifest stub;
   tests through the generated text and through a compiled project.
2. Editor: the file editor keeping `map` through a save; the world editor
   with its two views; the map editor over a document rather than a file;
   the config routing; tests with the heavy halves mocked.
3. The world's properties on empty selection.
4. Specs: MAP_FIRST.md brought in step.

## Commits

(recorded as they land)

## Learned while building

(recorded as it happens)
