# Plan: the Screen and Map file kinds (SIMPLE_INTERFACE.md, phase one)

STATUS: STEPS 1 TO 3 BUILT; 4 and 5 planned. The working record, as the
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

### 5. Fixtures and scenarios in the new shape

Flappy, the stock scenarios and a new project become a Main Screen and
`maps/main.map`. The transform written for the Viewport check is where this
starts. FILES.md, MAPS.md, VIEWPORT.md and SCREENS_PLAN.md are updated to
match.

## Not in this phase

- A map's own rule settings ("This map").
- A modal map loaded inside a Viewport: `canReach` still asks only the root.
- Anchors re-anchoring inside a Viewport when the window resizes.

None is needed while the game is the only thing a Viewport shows.
