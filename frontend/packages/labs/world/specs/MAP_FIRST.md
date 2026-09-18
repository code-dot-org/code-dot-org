# Proposal: the map as the front door

STATUS: PROPOSED. Nothing here is built. It is a design to argue with, written
after the pause menu showed where the current shape strains (UI_ACTORS.md,
"The second axis"; MAPS.md, "A block naming a placement").

The question: what does World Lab look like if a project opens on its MAP
rather than on its world's block workspace? You place actors on a canvas, set
their properties in an inspector, and attach behavior to the things you can
see. The world's workspace becomes the script of that map. Other maps are the
dialogs that appear over it and the levels that are loaded into it.

## Where the lab stands

A project opens on `worlds/main.world`, pinned when there is nothing to browse
(`layout/WorldLayout`). That file is a block stack: `define world`, then
`load map ⟨level1⟩`, then a few `set` rows, then hats about KINDS — `when
⟨any Coin⟩ is collected`. The arrangement itself is a `.map`, a document with
no behavior, opened from the Maps menu or from the `load map` block's field.

Behavior has three homes and none of them is a place:

- an ACTOR file says what a kind always does, everywhere;
- a RULE file says what an elected trait does;
- the WORLD file says what the game does, about kinds and world events.

What no file can say is what THIS coin does, or this switch, or this button.
Every unique thing must become a kind: the first pause menu shipped a Resume
Button and a Quit Button, two files whose whole content was a caption and one
handler. The named-actor block replaced them with a global namespace over
every map in the project, which fixed the two files and introduced a worse
thing: a Player in level one and a Player in level two are the same name, and a
hat about one is about both.

Levels are `clear world` then `load map`, in a handler, which empties the
score readout and the pause menu along with the bricks. Menus are maps loaded
on top, with an actor that presumes the buttons its map places.

INTERFACE.md's "Simple World" paragraph asked for this years early: "just have
the World view with PlatformActors where one can change their appearance only
and add events to the World view per Actor". That is the map editor with a
workspace per placed actor.

## The shape

**Every world has a main map, and they are one file.** The `.world` holds the
world's laws (its rules, its own properties), its main ARRANGEMENT (the
placements the map editor edits), and its SCRIPT (the hats). Opening a world
opens the map editor on its main map. The map editor is the basic point of
view of a world; the world's workspace, where world events are handled, is a
MODE of that editor, one switch away, and the world's properties are set in
the editor's properties window as an actor's are.

MAPS.md §1 already decided the half of this that matters: an arrangement only
one world reads belongs in that world's file, not beside it. `create actor in
map` put one kind's placements into the `.world` as a field value for exactly
that reason. The main map is the same decision applied to the whole
arrangement rather than to one block's worth, and it retires that block.

**A `.map` is an arrangement plus a script.** Every other map in the project
keeps its own file and gains the same modes. A dialog is a map whose first
placement is the parent of the rest; a level is a map with no root. Both are
loaded into a running world, both bring their behavior with them, and both are
edited in the same editor as the main map. There is one editor for "things
arranged in space and what they do", and the world is the one that also has
laws and is the entry point.

**A script is about its own placements.** An actor file says what a kind
does everywhere; a map says what one INSTANCE does here, in a workspace of
that instance's own, opened from the map editor. In it the hats are the
kind's events with the subject implicit — `when this actor is pressed`, as
in an actor file — and the body may name any other placement of the same map
as a value: `open ⟨the Door⟩`. Names are unique within a map, which the
editor already enforces, and mean nothing outside it. The world's workspace
holds what is about the world: its events, and hats about kinds —
`when ⟨any Coin⟩ is collected`. A dialog's button may say `unload this map`
and `emit ⟨quit⟩`, an event the map declares and the world listens for as it
listens for an actor's.

A script compiles to a function that runs once per load, closed over the
actors that load placed. Load the pause menu twice and each Resume closes its
own menu. There is no registry, no global name, and nothing left behind on
unload.

## What a map script looks like

Three scripts, as they read. A level with a switch and a door,
`maps/level3.map`. The Switch's workspace:

```
when this actor is pressed
  open ⟨the Door⟩
  play sound ⟨click⟩
```

The Player's workspace, in the same map:

```
when this actor touches ⟨the Exit⟩
  emit ⟨finished⟩ for this map
```

And the map's properties window, with nothing selected: `camera follows
⟨Player⟩`, a field rather than a block, because the thing it names is in the
same file.

The pause menu, `maps/pauseMenu.map`, a Panel and two Buttons. The map's own
workspace declares `define event ⟨quit⟩`. The Resume button's workspace:

```
when this actor is clicked
  resume the game
  unload this map
```

The Quit button's:

```
when this actor is clicked
  emit ⟨quit⟩ for this map
```

And the world's workspace, in Breakout, which is the main map's:

```
when ⟨p⟩ is pressed
  pause the game
  load map ⟨pauseMenu⟩

when ⟨pause menu⟩ quit
  load map ⟨level1⟩ into ⟨the Game⟩
```

Three things to notice. An instance's workspace reads exactly like an actor
file — `this actor`, the kind's events, no subject to choose — and differs
only in being about one placement. `the ⟨Door⟩` is a placement of this file
and nothing else. And the world's workspace keeps its world events and its
kind hats, since it is the world's; what it loses is any need to name a
level's contents.

**An instance's workspace knows the kind.** A placement has a type, so the
Switch's workspace is a Button's: its events are the Button's, `this actor`
is the Switch, and the Button's own property blocks are offered and shadow
correctly. The named-actor block could do none of that, because a name said
nothing about a kind.

### The file

A placement gains a workspace of its own, serialized as an actor file's is,
and the map gains one for what is the map's:

```jsonc
{
  "type": "map",
  "size": {"width": 10, "height": 10},
  "tile": {"width": 32, "height": 32},
  "layers": [{"id": "game", "factor": {"x": 1, "y": 1}, "background": "sky"}],
  "camera": {"follows": "Player"},
  "actors": [
    {
      "type": "actors/button",
      "id": "Switch",
      "properties": {},
      "blocks": {"blocks": {"blocks": []}},
    },
    {"type": "actors/door", "id": "Door", "properties": {}},
  ],
  "blocks": {"blocks": {"blocks": []}},
}
```

Each `blocks` is a whole workspace serialization, the shape an actor file
holds, so the editor loads and saves it with the same calls. A placement
with no `blocks` has no script, which is most of them. For the
main map the same `actors`, `layers` and `camera` live on the `define world`
root as a field value, and the world's workspace is the file's workspace.
One shape, two homes.

### What it compiles to

A map module exports its data and a script function:

```js
export const map = {size, tile, layers, camera, actors};
export const events = {quit: {id: 'quit', ownerId: 'maps/pauseMenu'}};
export function script(world, placed, self) {
  placed.Resume.on(ClickedEvent, (world, actor) => {
    world.resume();
    self.unload();
  });
  placed.Quit.on(ClickedEvent, () => self.emit(events.quit));
}
```

Each placement's workspace compiles to registrations on that placement's
entry in `placed`, the table `loadMap` already builds for actor-typed
references. `loadMap` calls `script` once per load with a handle for
`this map`, and points the space's camera at `camera.follows` before the
first frame. Two loads are two closures. Unloading removes what that load
placed, and the handlers go with the actors. A world hat `when ⟨pause menu⟩
quit` registers on the map's events as it registers on an actor kind's.

### The palettes

An INSTANCE'S workspace offers what an actor file offers, less the
definition rows, and with three additions:

- the kind's events as hats, with `this actor` as their subject and no world
  events, which belong to the world's workspace;
- `this actor`'s properties to get and set, and the world's properties to get
  and set, since a switch may well add to the score;
- `the ⟨placement⟩` as an actor value, its dropdown read from this file, and
  `this map` with `unload this map` and `emit ⟨event⟩ for this map`.

The MAP'S own workspace, opened with nothing selected, holds `define event`
and hats on `this map`: `loads` and `unloads`. Most maps never open it.

The WORLD'S workspace is today's world file less what moved into the
properties window and the map: world events, kind hats, `define property`,
`use rule` where a project still says it, and `load map … into ⟨viewport⟩`.

A fourth file kind, `map`, beside `actor`, `world` and `rule`
(`blockly/fileKind`), and within it the instance workspaces, which are
generated with the placement's type as the kind `this actor` is about.

### The editor's modes

The map editor is one editor with three views of one file, and a switch in
its toolbar that says which:

1. **Map**, the default: the canvas, the palette of kinds, the properties
   window. Selecting nothing shows the WORLD'S properties for the main map —
   its name, its own properties, its camera, its layers and their backgrounds
   — and the map's for any other. `set target score to 30` is a field here.
2. **World**, on the main map: the world's workspace. One click from the map
   and one click back. A level or a dialog has a **Map** workspace in this
   position instead, for `define event` and the `this map` hats.
3. **Actor**, entered from a placement: selecting one shows a **Script**
   button in its properties window beside the values, and the button switches
   the editor to that instance's workspace, titled with the placement's name
   and kind. Escape, the switch, or clicking the canvas thumbnail returns to
   the map with the placement still selected.

**An icon on the placement.** A placement whose workspace holds any block
wears a small glyph at its corner on the canvas, so a map can be read for
where its behavior is without opening anything. A toolbar option hides or
shows the icons, for a screenshot or a crowded level.

**A store per placement, on purpose.** An earlier draft of this section kept
one workspace per map and made "this placement's script" a filter over it,
to keep a level readable top to bottom. It is reversed here because the
instance workspace reads as an actor file for one thing, which every learner
who has opened an actor already knows, and because the subject then never
has to be chosen. What the map-wide read loses, the icons carry; a listing
of every scripted placement in the map, one row each, is the later addition
if the icons are not enough.

**Wires on the canvas**, later: a hat with a one-block body that names
another placement, drawn as a line from the one to the other. Sugar over the
instance workspace, not a second store.

### What the editor needs built

`BlocklyFileEditor` edits a whole file; the instance workspace needs the same
workspace mounted on a subtree, taking one placement's `blocks` and writing
back through the map's own `onChange`. That is a refactor that pulls the
workspace out of the file editor, not a second Blockly integration. The mode
switch is a segmented control on the stage toolbar. The icon is a glyph the
stage already draws at a placement's corner for other reasons. The Script
button is one row in the properties window, and the world's properties on
empty selection are the same schema-driven form the inspector draws for an
actor, over the world's own properties.

### Two edges

- **Several placements in one subject** is not a question here, since a
  subject is always the one instance. `any ⟨Button⟩ in this map` is the
  world's workspace's, and covers "every switch in the level".
- **A deleted placement takes its workspace with it**, which is what a
  workspace belonging to the placement means; the editor confirms the delete
  when the workspace is not empty. Duplicating a placement duplicates its
  blocks. Renaming one rewrites the `the ⟨…⟩` values in other placements'
  workspaces that name it, which is the rename the map editor already owns.

## Levels: the Viewport

This is the part that has no precedent in the lab. Three answers were
weighed; the third grew into something better than the one first written
here, and this section records where it ended.

**Clear and load, as today.** `clear world; load map ⟨level2⟩`. It works
because Breakout has nothing on screen it wants to keep. A game with a score
readout, a lives display and a pause key loses all three and rebuilds them
from the main map, if it can. It also has no place to stand between levels:
the main map is what was cleared.

**A world per level.** A title screen "is a map you load into a world of its
own" (INTERFACE.md, "User Interfaces"), and a world per level extends that.
It duplicates the laws per level, restarts everything on a switch, and there
is no `go to world` block; there is one entry world. Wrong grain.

**A slot in the main map**, first written as an empty parent whose children
were the loaded map's actors. A parent is a frame, so a level's positions
became locals in the slot's frame and the spec had to insist the frame be the
identity. That caveat was the sign the primitive was wrong. What was wanted
was not a parent but a WINDOW.

### What a Viewport is

A **Viewport** is a stock actor placed on the main map. It is a rectangle on
the screen, and it holds a map. What it holds lives in a coordinate space of
its own: a level's positions are level positions wherever the Viewport sits,
and the only thing between the level and the screen is the Viewport's camera,
applied when the level is drawn and when a pointer lands on it. A Viewport is
not a frame in PARENTING.md's sense; nothing inside it is its child.

Its inspector has one property that matters: the map it holds, offered as the
project's maps, `New`, or `Import…` from the shelf. It draws that map's
placements inside itself, dimmed and unselectable, so the main map reads as
the game rather than as a readout floating over an empty box; a double-click
opens the map in its own tab. It has a camera, with the pose properties
VIEWPORT.md gives a camera, and a default that shows the map's top-left at
1:1, which is what the implicit camera does today.

`load map ⟨level2⟩ into ⟨the Game⟩` replaces what a Viewport holds; `unload
⟨the Game⟩` empties it. The same Viewport shows `title.map`, then `level1`,
then `level2`, and what is outside it stays. `clear world` goes.

### What it makes structural

The main map is SCREEN SPACE and is the interface; anything that scrolls is
inside a Viewport. VIEWPORT.md reached the same division with a `fit` flag on
a layer, so a score would not scroll with the camera. Here the division is a
box on the canvas rather than a property on a layer, and the box is what a
learner points at when asked where the game is.

This departs from VIEWPORT.md in one place, on purpose. There, a viewport
SELECTS from the world's layers and contents belong to the world, so that
"which viewport did I put the player in" can never be asked. Here a Viewport
CONTAINS its map, and that question is exactly the one a box on the canvas
answers. What the selection model was for comes back as one property: a
Viewport either holds a map or **mirrors** another Viewport's contents with
its own camera. A minimap is a second Viewport mirroring the first, zoomed
out. Split screen is two Viewports, the second mirroring the first and
following the other player. A Viewport may not mirror itself, and that is the
only rule. A map held by a Viewport may hold Viewports of its own, which is
how a level carries a minimap of itself.

### The simple case

A project with no Viewport puts its characters on the main map. The main map
keeps its implicit camera, so a beginner's larger map scrolls with zero new
concepts, exactly as today; a score on it scrolls too. The Viewport is taught
as how you get an interface that stays put, and `fit` can go quietly once it
has. A 10 by 10 map fills the window and never meets the question.

### What it costs in the engine

In order of size:

- **Pairwise rules stay inside a space.** Collision and nearness pair every
  actor with every other today. A brick in the level and a label on the main
  map must never touch, so the pairwise steps partition by the space an actor
  is in. Per-actor rules, gravity among them, do not care.
- **Pointer input maps through a Viewport.** A click lands on the screen,
  finds the Viewport under it, and goes through that camera's inverse to
  become a point in the level. Keys stay global.
- **Map bounds move to the space.** The held map's size is what the Viewport's
  camera clamps to, not a world-wide value.
- **Loading gains a target and an undo.** `loadMap` places into a space and
  records what it placed, so unloading removes exactly that.
- **The driver is on our side.** Phaser has several cameras per scene, each
  with its own screen rectangle and an ignore list, which is one Phaser camera
  per Viewport actor. The constraint that comes with it: a Viewport draws
  axis-aligned. A rotated or scaled parent does not rotate or scale what is
  inside a Viewport, and render-to-texture is the later answer if anyone wants
  that.

### Camera-follow is the level's property

The main map's properties window cannot say "follows the Player", because
the Player is in the level's file and the main map has no name for it. The
level's own can: `camera follows ⟨Player⟩` is a field in the level's
properties window, with nothing selected, and `loadMap` points the space's
camera at that placement before the first frame. A script that wants to
change it at run time has `camera of this map` in the pose blocks. This is
the reason the `set actor to follow ⟨camera⟩` block stops living in the
world file.

### Layers, backgrounds and foregrounds belong to the map

A layer is a depth slice of one space with a parallax factor and its own
background and foreground (VIEWPORT.md, "Layers"). Under this proposal a
space is a map's, so its layers are the map's too, and they are edited in the
map editor rather than declared with `define layer` blocks in the world: a
layer strip in the editor, a background and foreground per layer set from the
inspector, and a placement's layer chosen where the placement is. A map
loaded into a Viewport brings its layers with it; the main map has its own.

It is not clear layers earn much beyond depth and a scrolling backdrop, and
the editor is where that will be found out: a learner who never opens the
layer strip should have one layer, a background and a foreground, and nothing
to name. The `define layer` block and the layer effect blocks stay for what a
script needs to change at run time, and the map editor becomes the place a
layer is made.

### Backgrounds, foregrounds and parallax under this model

VIEWPORT.md's layer model is kept whole: a layer has a background slot drawn
behind its actors and a foreground slot drawn in front, each with repeat or
stretch and an offset, and the layer has a per-axis parallax factor. What
moves is whose the layers are and which camera the factor is a factor of.

**The map editor makes them.** Every map, the main one included, has a layer
strip. Selecting a layer shows its two slots and its factor in the inspector;
a placement's layer is chosen where the placement is. A level's mountains at
0.2, hills at 0.5, game at 1.0 and fog at 1.2 are four rows in the level's
file and nothing in the world. Images stay in the `backgrounds/` pool, and a
slot names one.

**The camera is the Viewport's.** The composition stands unchanged:

```
image position = (camera position - camera rest) (*) layer factor + slot offset
```

with the camera the one viewing that space and the rest the middle of the
map's rectangle. Three things follow. At rest every layer draws where it was
authored, so a map that never moves its camera looks as it does in the
editor. A Viewport that mirrors another applies its own camera to the same
layers, so a minimap shows the level's parallax at its own zoom with no extra
state. And the main map's camera cannot move a level's layers, because they
are not in its space.

**Compositing across spaces is depth.** A Viewport is an actor on some layer
of the main map and draws its whole space at that depth, each of its layers
in order — background, actors, foreground — clipped to its rectangle. The
main map's background is behind it and its foreground in front of it. A level
whose bottom layer has no background is transparent there, so the main map's
backdrop shows through and a game sits inside a themed frame without a copy
of the art. Fog over the level is the level's top foreground; a vignette over
the whole screen, HUD included, is the main map's.

**Drift stays a runtime value**, a handler writing a slot's offset each tick,
which the snapshot patches rather than restarts. The blocks that do it are
map-scoped: `set background offset of ⟨layer⟩` in a map's script means that
map's layer, and in the world's script the main map's. `set background to
⟨sky⟩` keeps meaning the default layer's background of the map the script
belongs to.

**Stretch covers the scroll.** An image stretched to the map's rectangle is
larger than the view by the margin the camera can travel, and a layer at any
factor below one moves less than the camera does, so the visible window never
leaves the image. Repeat is for art smaller than the map, and repeat with
offset is the pair to teach for drift.

**`fit` retires, and not first.** It exists so a score on a scrolling world
stays put. Once the scrolling world is inside a Viewport, the score is on the
main map, which does not scroll, and the flag has nothing left to do. It
stays while the main map keeps its implicit camera for the simple case and
goes when the Viewport is what lessons teach for an interface.

**The editor must show parallax, or nobody will author it.** The canvas
draws the rest pose. A look-through mode, in which dragging pans the camera
rather than the canvas and each layer moves at its factor, is the one
addition the editor needs; without it a factor is a number in a field whose
effect is visible only in the running game.

**The driver has the primitives.** Phaser's per-object scroll factor is a
per-axis parallax multiplier, a tile sprite is a repeating background, and
one camera per Viewport with an ignore list keeps spaces apart. Each layer's
slots become two game objects at the layer's depth with the layer's scroll
factor.

Two things deliberately not done. No background effects per Viewport: the
layer's slot takes effects and a Viewport inherits them by drawing the layer.
No per-placement parallax: a thing that scrolls at a rate other than its
layer's is a thing on another layer.

## Where the world's properties are set

The properties window with nothing selected shows the world's own
properties on the main map — the ones `define property` declares in the
world's workspace, with their starting values as fields — beside its name,
its camera, and its layers with their backgrounds and foregrounds. That is
where `set target score to 30` goes, and it is a field rather than a block;
the `set` block remains for a value that changes at run time. Every other
map's window shows the same on empty selection, minus the laws: a level has
a camera, layers and a background of its own.

## Against the current shape

What the current shape does better:

- **One kind of editor at the front.** A learner meets Blockly and only
  Blockly until they choose to open a map. Map-first puts a canvas, a palette,
  an inspector and a mode switch on the first screen. The mitigation is that
  three of those four are already the map editor, which has been built and
  tested (NEXT.md §5), and a lesson about one thing can hide the rest.
- **Everything the world does is readable top to bottom** as one block stack.
  Map-first splits it: the arrangement is a picture, the values are in an
  inspector, the behavior is in a workspace per placement. Reading a world
  means looking at several places. The icons on the canvas and the one-click
  mode switch are what make that bearable.
- **The curriculum is built on it.** Every level pins `main.world`, every tile
  in the catalogue unlocks blocks, and the progression assumes the workspace is
  where a learner's hands are (PROGRESSION.md). Unlocking editor affordances
  (the inspector, the palette, the modes) is a new kind of tile.
- **Testing.** A block stack is a JSON document a test can compile and run.
  The map editor is a canvas jsdom cannot paint, and its arithmetic lives in
  pure modules for that reason. Moving the front door onto the canvas moves
  more of the first-run experience out of reach of vitest.

What map-first does better:

- **The first act is placing something and seeing it.** Not reading a block
  that loads a file that holds the thing. Every beginner tool that has lasted
  starts from the picture.
- **Values are set where the thing is.** `set target score to 30` is a field
  on the world. A coin's value is a field on the coin. The `set` block still
  exists for the case where a value changes at run time, which is what a
  block is for.
- **Behavior attaches to things you can see.** This switch, this door, this
  button. No kind per unique thing, no global names, no actor that presumes
  its surroundings. It also gives the "Simple World" of INTERFACE.md a home
  without a second mode: a project that never opens an actor file is the
  simple view.
- **Dialogs, levels and the main map are one concept.** A map is an
  arrangement plus a script; the world is the map that also has laws. The
  pause menu becomes one `.map` with a Panel, two Buttons and four hats, and
  nothing on the actor shelf.
- **Hot reload gets better, not worse.** The preview already repaints as a map
  is edited (tier 3, UI_ACTORS.md). A main map edited in place is the same
  path; a world edited as blocks restarts the game.

## What this changes in the files

- `.world`: gains a placements document, stored as a field value on the
  `define world` root the way `create actor in map` stores its own, but for
  mixed kinds. The Blockly serialization remains the file; undo remains
  Blockly's. `create actor in map` is retired; its placements migrate into the
  main map on first open.
- `.map`: each placement may carry a `blocks` workspace, and the map one of
  its own, serialized as an actor file's is; a map gains a `camera`. It
  compiles to a module exporting the arrangement and a script function.
  Map-owned events appear in world hat dropdowns as actor events do.
- The named-actor block becomes the map script's `the ⟨Resume⟩`, scoped to its
  file. `World.named`, `World.actorsNamed`, `ActorBuilder.named` and the
  placement-name registry go.
- `Viewport` joins the stock actors, with the map it holds, the Viewport it
  mirrors, and its camera as properties. `load map … into ⟨viewport⟩` and
  `unload ⟨viewport⟩` join the world's blocks; `load map` alone keeps meaning
  the main map's own space, which is what a dialog wants. `clear world` and
  `set actor to follow ⟨camera⟩` go; the second becomes a map's property.
- `.map` gains layers, each with a background and a foreground, edited in the
  map editor. `define layer` in a world stops being how a layer is made.
- VIEWPORT.md's selection model for viewports is superseded by containment
  with mirroring; its layer and camera sections stand.
- The Pause Menu actor goes. The stock pause menu is a map with a script.

## Order of work

1. **Map scripts.** The instance workspace, the Script button, the icons and
   their toggle, and the map's own workspace, on `.map` files. This stands on
   its own, replaces the named-actor commit, and is what the pause menu needs
   whatever else happens.
2. **The main map.** Placements on the world root, the editor opening a
   `.world` as a map with the World mode as its workspace, the world's
   properties on empty selection. Migration of `create actor in map`.
3. **The Viewport.** The stock kind, the two blocks, spaces in the engine
   (pairwise rules partitioned, pointer mapping, bounds per space, undoable
   loads), one Phaser camera per Viewport in the driver, and the dimmed
   preview of a held map in the editor. Mirroring last, since nothing in a
   first game needs it.
4. **Layers in the editor.** The layer strip, backgrounds and foregrounds per
   layer in the inspector, and a placement's layer set where it is placed.
5. **Retirements.** The Pause Menu actor, `create actor in map`, the global
   name registry, `clear world`, the `fit` layer flag.
6. **Curriculum.** Tiles that unlock editor affordances; levels re-pinned.

Step 1 is worth doing even if the rest is refused. Steps 2 and 3 are the
proposal; 4 is where the layer question gets its answer.

## Open

- **A map loaded twice.** Two scripts, each about its own placements. A world
  hat about the map's events hears both. That is what two menus should do; it
  is also what two levels in two Viewports would do, which nobody has asked
  for.
- **How much a layer is worth.** Depth and a scrolling backdrop are certain;
  whether anything else survives the editor is not. Settled by building step
  4 and watching what gets used.
- **Kinds that exist only in a map.** A switch that appears in one level with
  one behavior is a Button placement with a script today. When the same switch
  appears in six levels, it wants to be a kind, and the move from placement
  with a script to kind with the same script is the "transform" INTERFACE.md's
  Simple World describes. Not designed here.
- **Where `use rule` goes.** Today a project holds a rule by having the file
  (constants.ts, `MAIN_WORLD`). The World mode can show the rule rows if a
  lesson wants them said; the world inspector can list them; either is fine and
  neither is decided.
- **The title screen.** Settled in the small: the Viewport holds `title.map`
  first and `level1` after, so there is one entry world and the title's laws
  are the game's. Whether a game ever wants a title with different laws is
  left to the first one that does.
