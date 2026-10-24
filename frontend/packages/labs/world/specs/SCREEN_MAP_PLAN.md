# Plan: the Screen and Map file kinds (SIMPLE_INTERFACE.md, phase one)

STATUS: STEPS 1 TO 4 BUILT, 5a BUILT; the rest of 5 planned. The working record, as the
other plans are.

The first phase of the simple interface: make a Screen and a Map concrete as
files, and make the engine bear the game living inside a Viewport. No new
editor shell yet; the tabs and folder menus stay, and open the new kinds.

## What exists

- **A Viewport has its own space**, made when it is placed, with its own
  cameras and the layers of the map it shows (`World.place`,
  `loadMapInto`).
- **A `.map` already holds a level**: size in tiles, placements, layers,
  theme, modality and an events-only workspace (`MapDoc`).
- **A screen is already a map** loaded over the root space (SCREENS_PLAN.md).
- **The only context running code has is the in-hand stack.** An actor's
  handlers run with the actor in hand, and `place`, `near`, `mapBounds`,
  `viewSize` and the pointer follow its space. A map's script runs with
  nothing in hand, so while it runs it is in the root even when the map was
  loaded into a Viewport.
- **Every world block acts on the root.** `setBackground` and its offset,
  repeat and effect kin look up layers in the root's list only; the
  background color is one `clearColor` for the whole world; `setMapSize`
  writes the root's bounds; `loadMap` and `unloadNewestMap` use the root.
- **A Viewport looks through its chosen camera one tick late.** Its extra
  cameras are declared by an `on create` handler, which runs in the first
  tick, and `shows through` is copied into the space only in the end-of-tick
  settle.
- **`define world` does twelve things in order**: the builder, own
  properties, every rule, hoisted rows, animations, themes, every actor,
  every map, image sizes, layers, the main map's load, and its rows with the
  camera rows last. All but the rows can be generated from data.

## What is being built

One commit each.

### 1. A map's script knows where it is

A map load records the space it was loaded into, and its script runs with
that place in hand. The engine gains one lookup, `here`: the space and layer
of the code that is running.

| In hand                 | Here is                              |
| ----------------------- | ------------------------------------ |
| an actor                | its space, and its layer at the time |
| a camera                | its space                            |
| a map load (its script) | the space it was loaded into         |
| nothing (Screen code)   | the root                             |

Engine tests only.

BUILT. `World.here`, and `MapLoad.space`; a map's script runs with its
space in hand (`withSpace`), and `actorInHand` says nothing then.

### 2. World blocks act where they run

SIMPLE_INTERFACE.md, "World blocks act where they run". `setBackground`,
its offset, repeat and clear, the background and layer effects, and
`setMapSize` resolve their space through `here`. A layer named by the block
(`within layer`) is looked up in that space; from an actor's code with no
layer named, the actor's own layer is meant.

The background color becomes the space's: a Viewport paints its own sky.
The driver has to draw it, so this is seen in the browser.

`load map` and `unload the newest map` from a map's code act on that map's
space, so a door in Level 1 changes what its Viewport shows. From Screen
code they act on the root, as now.

Layer visibility does not exist in the engine and is not added here; it
comes with the Map's layer control.

BUILT. The layer-taking world calls take an optional layer, and a block
passes one only when a `define layer` or `within layer` is around it
(`namedLayerOf`). `Space.clearColor` is in `spaceSnapshot`, and the driver
paints it with the space's camera. The layer's own blocks (`this layer
follows`) still name theirs. A pause menu loaded from an actor's handler
inside a Viewport now lands in the Viewport; a world event or the Screen's
code is what puts one over the screen. Not yet seen in the browser: the
Viewport's sky.

### 3. A Viewport sees through its camera from the first frame

A Viewport placement's stored cameras are declared when it is placed, not by
a handler that runs a tick later, and `shows through` is applied when its
map loads. A test reads the first snapshot.

BUILT. A Viewport a map places has its own map loaded before the placing
map's script runs, so the stored cameras, now plain rows at the head of the
placement's code (`withCameraDeclarations`), are declared and aimed at what
the level holds as the world is built. `shows through` is applied, and the
space settled, as soon as the script is done and whenever `loadMapInto`
lands a map.

### 4. The Screen file kind

- `screens/` holds `.screen` files. The entry is `screens/main.screen`; the
  `worlds/` folder is gone.
- A `.screen` is a map document whose size is in pixels, with an
  events-only workspace. The Main Screen's data also holds the game-wide
  values that `define world` held: own properties with their defaults, and
  rule settings.
- It compiles from data, by an assembler that emits the same steps as
  `define world` without a `world_world` block.
- A game's Main Screen holds one Viewport the size of the screen, showing
  `maps/main.map`. Docking it is phase four. An app's Main Screen holds no
  Viewport.
- The World inspector becomes the Main Screen's properties: name, rules,
  theme, background, and the game-wide values. Moving those values under a
  map's "All maps" switch is the editor shell's work.

The `.world` shape keeps compiling beside it until the lessons are
rewritten, since their 249 checks start from `define world` projects. Then
it is deleted outright. Nothing converts one shape to the other.

#### The file

A `.screen` is a `.map` document with five more keys, all optional:

| Key               | Holds                                                     |
| ----------------- | --------------------------------------------------------- |
| `name`            | the game's name; `Main` when absent                       |
| `properties`      | game-wide values: `{name, type, value}`, as the inspector |
| `events`          | game-wide events: `{name, carries?}`, as a map raises one |
| `rules`           | rule settings: setter block type to value, only those set |
| `backgroundColor` | `#rrggbb`, the color behind the screen                    |

Its size is stored as a map's is, in tiles of its `tile`, so the map editor
edits it unchanged; what it means is the screen's extent in pixels, and the
compiled screen sets the view and the root's bounds to it. The toolbar that
states it in pixels is the editor shell's.

Properties and events are data rather than `define property` and `define
event` blocks because a screen's workspace holds events only. They are read
into the same declarations a world's rows give (`screenOwnMeta`), so their
blocks are minted, named and imported exactly as a world's are, under the
screen's module path: `world_get_ScreensMain_ScoreProperty`.

#### What it compiles to

The steps of `define world`, from data: the builder named by `name`, the
game-wide declarations, every rule, animations, themes, actors and maps,
image sizes, the screen's layers, the view and bounds, the screen's own
load, then the theme, background color and rule settings as the rows
`define world` would have held, and the screen's world-event hats. The
prologue `world_world` emits is one function both call
(`worldModulePrologue`), so the two shapes cannot drift while both exist.

Only the Main Screen is compiled as the game. Another `.screen` is a map
the Main Screen's code loads, compiled as one.

#### Steps

- 4a. The kind compiles: `fileKind` knows `.screen`, the generator
  assembles one, the runtime and the test compiler take
  `screens/main.screen` as the entry when the project holds one and
  `worlds/main.world` otherwise. A test compiles a Main Screen holding a
  Viewport onto `maps/main.map` and runs it.
  BUILT. `blockly/screenData` reads the five keys and turns them back
  into rows; `parseScreenOwnMeta` reads the declarations through the
  world's walk; `generateMainScreen` assembles the module around
  `worldModulePrologue`; `entryFileOf` picks the entry. The bundler
  resolves `.screen`. The thumbnail manifest stubs a screen's placements
  as it does a map's.
- 4b. The editor opens one: the file menus, icons and tab, the map editor
  through a screen adapter, and the inspector reading and writing the data
  above. Importing a stock map declares its events in the screen's data.
- 4c. A stock map's world events are named from the project's entry, not
  from a constant, so the Pause Menu raises `quit` in either shape.

4b and 4c BUILT, together, since an editor that opened a screen and could
not import a dialog into it would be half of one. `screenDocumentFor` gives
the Main Screen an adapter whose inspector reads and writes the five keys
(`screenProperties`), with a row to add a game-wide value; any other
screen is edited as a map. The screen's own workspace opens as the map
editor's third view with the game's hats, and the theme is the screen's
own key. The World button opens the Main Screen when there is one. An
import declares a dialog's events in the screen's data and renames its
blocks from `WorldsMain` to `ScreensMain` (`raisedOnTheScreen`); a map's
`emit` names a screen's event as it names a world's, since importing the
screen into a map it loads is a cycle. The thumbnail manifest imports the
game's module in either shape (`gameModuleOf`).

Not yet seen in the browser: no scenario holds a Main Screen until step 5.
Not built: making a new screen from the file menus, which waits for
something that loads one.

### 5. Fixtures and scenarios in the new shape

Flappy, the stock scenarios and a new project become a Main Screen and
`maps/main.map`. The transform written for the Viewport check is where this
starts. FILES.md, MAPS.md, VIEWPORT.md and SCREENS_PLAN.md are updated to
match.

#### Steps

One commit each, so each fixture's tests move with it.

- 5a. Flappy: its level becomes `maps/main.map`, shown by a Viewport on
  the Main Screen whose camera follows the Bird and stays in the level.
  Gravity is a rule setting in the screen's data.
  BUILT. Seen in the browser: the Main Screen's inspector, and the game
  played in the Viewport with the camera following the Bird.
- 5b. The starter and the empty project, which are what a new project is.
- 5c. The other games: breakout, meteors, jetpack, tapper, sokoban, novel.
- 5d. The two apps, interface and app, whose Main Screen holds no
  Viewport.
- 5e. The documents.

A test that is about the `.world` shape itself — a world's own cameras,
its rows — builds a small world of its own rather than reading a
scenario, since no scenario will have one.

## Not in this phase

- A map's own rule settings ("This map").
- A modal map loaded inside a Viewport: `canReach` still asks only the root.
- Anchors re-anchoring inside a Viewport when the window resizes.

None is needed while the game is the only thing a Viewport shows.
