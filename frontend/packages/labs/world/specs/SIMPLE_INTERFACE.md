# Simple Interface Design

In the original interface design, we matched fairly dogmatically the interface
of Web Lab 2 that was provided to us by using Web Lab 2 as a base. We use Web
Lab 2 as a base since it offers a way to have a JavaScript-oriented project
safely run on a page with untrusted code. Effectively, a game is indeed a
complex web site: some HTML serving Phaser running a set of JavaScript routines.

For the second iteration, we follow up on what we have learned about the types
of objects and events in the system. We know that for game development, there
are a few different types of objects:

- World - The overall screen we load the map into
- Actor - An object that acts upon the world and other actors.
- Map - The sets of actors that stage a view of the world.
- Camera - A lens to view the world through
- Rule (System) - A set of behaviors that offer 'traits' that actors can elect.

We just need to present an interface that models these objects in the
appropriate places, particularly where those objects generally live naturally.

What we are intending to do is to remove or essentially hide the file tabs and
buttons altogether to maximize just the Map Editor, effectively, to the full
workspace area.

Built in phases, each with its own plan and record: the Screen and Map
file kinds and the game inside a Viewport (SCREEN_MAP_PLAN.md), then the
editor shell — the breadcrumb, the Actor Palette, the brush, the toolbar,
undo, and Add Rules (SHELL_PLAN.md), then an actor as data and events, with
the Actor Editor (ACTOR_EDITOR_PLAN.md), then docking and the grid layout
(DOCKING_PLAN.md), then game or interface all the way through: the
wizards, the shelves, a drawing the size of its box, and docking and
placing from the keyboard (PURPOSE_PLAN.md), then the shell finished: a
picture of each Screen and Map in the switcher, layers in front hidden
while one is edited, a Viewport's cameras in its own inspector, a way in
for every kind of file where it is used, and the folder buttons gone
(SHELL_FINISH_PLAN.md), then animations as the actor's own timelines,
edited in the Actor Editor, with `.anim` files retired
(ANIMATION_PLAN.md), then actors only as data: an actor told it was made
before it is first drawn, what it is for deciding how it is drawn, every
actor opened in the Actor Editor, and the blocks an editor establishes out
of the toolbox, with the lessons rewritten (ACTORS_AS_DATA_PLAN.md). The
accessibility gaps each phase opened or closed
are kept in ACCESSIBILITY.md.

## World Editor is now a Screen Editor

Therefore, the World is the main view we deal with. It is a screen and the main
view of the game. It maintains the rules that exist in the project. It is the
root of the project.

From that perspective, we need to get to everything while looking at the main
World view. We get rid of having multiple Worlds for now to ensure that we just
have this main nexus.

For our game view, the World is now the Main Screen. We orient ourselves with
the concept of a Screen. The Screen Editor is the same as the Map Editor except
it only deals with Interface Actors and instead of a grid for tiles, it is a
grid for interface components. The screen is sized for the display. The Main
screen decides the dimensions of the application. When one switches to a
different Screen, it changes the dimensions of the canvas to match that new
Screen, but largely the screen dimension should not change.

The World object is now the Screen object. Rules are part of the project and
not a World. Rules are always available and in use as long as they are
present in the project.

## Screen

A Screen could be loaded into another as a modal. In that case, the dimensions
of the Screen dictate just how big that modal is. We will worry about the
properties and mechanics of modal Screens when they should differ at a later
point.

A Screen can add Interface Actors directly within it like any other map by
snapping that to grid or being adjusted like any other actor. There is no
specific way that any element needs to be placed. However, screens also offer
anchors to 'dock' Interface Actors into a grid layout. These anchors exist as
rectangular regions off to the edges of the screen. When an Interface Actor is
dragged to those, they extend the grid layout to place that Actor on that side
of the divider. When an Interface Actor is already docked, there will be
anchors on the sides of them in order to sub-divide the region that Actor is
currently taking to add the dragged actor into that region. Dragging an Actor
out of the region will create a void and essentially undo that division allowing
Actors to fill that void as necessary. The same places are offered without
a drag, as the Dock menu in a placement's inspector.

This Grid Layout serves as a fairly easy way to create rich interfaces quickly.

A World is now the Main Screen. For a Game, that Main Screen automatically
contains a Viewport that is docked to the entire screen. That Viewport is
already loading a Main Map, as Viewports elect to show a Map. When you click
on a Viewport Actor, there is an option to select the map and to open that
map. The Game itself is made via the Map Editor via this Viewport.

Since the Viewport is docked into the Grid Layout as the only Actor, there are
now docking regions that appear when you drag or otherwise move an Interface
Actor on the Main Screen. If you drag a Panel to one of the sides, you are
effectively creating a HUD for the game. Although, dragging Interface Actors
on top of the Viewport just places them as floating Actors which also serves
as a means of creating an interface for your Game.

The Interface Actors are arranged in a side panel that will be described later.
The Screen Editor just shows Interface Actors. These can be dragged off of the
side panel Actor Palette and materialize in the view, potentially placed in the
Grid Layout if dragged onto the anchor regions.

The Map Editor is now the only true place to manage and place Game Actors. This
is an editor that is used when a Map is opened. This will be described later.

## Actor Palette

So, we need a way to move Actors into the Screen/Map. Instead of the top bar in
the map editor to present the actors, we should move to a vertical side bar of
current Actors. Visually, they work the sawe: we see the visual depictions of
each Actor. Clicking on them places them as the current Brush and clicking into
the map will place them on the grid in the same way the Map Editor already does.
From the keyboard, with an actor in hand, the arrows move a cursor a cell at a
time on the stage and Enter or Space places one there, each said aloud. An
Interface Actor's tile can also be dragged out, which places one, and docks
it when it is let go in a dock zone, without taking it as the brush.

The Actor has its own view, which we will discuss later. When an Actor is
clicked it presents a couple of buttons below it while surrounding the entire
region (actor image and buttons) with a ring to indicate it is selected. These
buttons are an 'Open' button which will change the view to the Actor Editor.
The other button deletes the actor and removes it from your project. Clicking on
a different actor switches the brush to that actor and it reflects that visually
by only highlighting one actor at a time. Clicking on the actor a second time
when it is already highlighted will unhighlight it and select nothing.

At the top of this Actor Palette is a tab bar that switches between actors that
are game actors and actors that are primarily user interface actors. This
distinction is sometimes muddied by the fact that user interface actors can
make sense in a game context (health bars, etc) but also are different enough
that separating them is useful. As each is mutually toggled, it updates the list
to show just game actors or just user interface actors. The behavior otherwise
is the same: clicking loads the brush, two buttons are presented, and clicking
on the map while they are selected will apply them to the view.

Sticky at the bottom of the Actor Palette will be the 'Add New Actor' button
that will present our actor creation wizard dialog to add an actor to your
game. Similar side panels will attempt to have their own `Add` buttons in the
same place to keep a very consistent interface and convention across all
editors.

## Map Editor

The Map Editor is used when editing a Map. A Map is a Game level. It contains
Game actors. Therefore, the Map Editor is essentially the same as it is now.
The Screen Editor is just a Map Editor that only shows Interface Actors and
has a Grid Layout option. The Map Editor is not representing a screen but
rather a wider and larger space occupied by Game Actors. Therefore, it shows
all Actors (Interface Actors are allowed inside game worlds, too.)

These changes to the Map Editor are following from the updates to lift Actors
in the interface. Primarily, the Actor Palette, as discussed, is now present in
the map editor. Also, clicking on an actor selects it as a 'Brush', which means
that clicking in the Map Editor will create an instance of that Actor.

Clicking and dragging should also apply such actors at though they were pixels
in a grid. When you click on an established actor of the same type, it would
remove it as though it were 'toggling' the actor in that space. Placing two
actors in the exact same spot is confusing, so it should be avoided as an
accident. Removing the actor is the proper feedback of clicking with a brush
loaded.

When the Actor in the palette is clicked on when it was active would make it
inactive as a brush. Clicking in the map editor, when no actor is active as a
brush, will select existing actor instances within the map. This behavior will
match the existing behavior: it will bring up handles for resizing and rotation
and bring up the properties window for setting specific values to the instance.

While an actor instance is selected, a button will present itself to view the
specific code for the actor in the map, and a delete button to remove the actor
from the map. The code area for an actor instance is a Blockly Workspace. When
one navigates to it, it will present a Blockly Workspace to the screen with the
'+' style interface that when the '+' is pressed will list possible events and
allow wiring up event handlers that are specific to that instance of the actor.
This event-driven workspace is already implemented and should be used for this.

## Screen/Map Toolbar

The Screen/Map Editor will have a toolbar at the top that helps define the
size and name of the Screen or Map. For a map, the size is given in 'tiles'
as it does already. For a Screen, this is the size in pixels potentially, or
a set of device profiles to choose from (mobile, desktop, etc). The Screen
and Map editor will share this toolbar.

The Screen/Map Editor toolbar should also have a set of buttons.

Two buttons are undo and redo to update the map accordingly to undo or redo
user actions (adding actors, moving actors, rotating, etc) Major actions like
adding rules or actors to projects are not reflected in the action buffer for
undo/redo. Property setting could be, however.

Another button is one to add events to the Screen/Map. This is the 'Code'
button, which brings up a Blockly workspace with the list of events. We want to
use the '+' interface that lists possible events and just have it be only
events in that workspace. This will also be true for Actor code spaces, so it
is also true for the Actor scripts spaces for actor instances in the map. The
event-driven workspace is already implemented and should be used for this.

Then there is a view reset button to zoom out to a fitted view or some default
zoom.

The name of the Screen/Map looks like a dropdown and serves as a way to access
other screens and maps in the project. When you click on the name, it opens a
modal to show the other Screens and Maps in the project. There will be a section
of screens and a section of maps following it. Each is represented as some
visual snapshot of the Screen or Map (which is a thumbnail that should be saved
within the project itself for recall later and use in imports across projects)
and clicking on it will update the editor to view that Screen or Map.

Much like the actor and image modals, this is a grid of thumbnails to list all
screens and maps in the project.

This modal will have a way of adding a new Screen or Map in that relevant
section as a button in that section. There will possibly be, in the future, a
way to import a Screen or Map from another project.

We could also possibly try to use tabs to switch/filter between screens and maps
in the project instead of showing both kinds in separate lists.

Next to the faux dropdown that shows the current Screen or Map by name is an
actions button that will house the rename and delete action that will either
bring up a means of renaming the Screen or Map or delete the Screen or Map from
the project. It should confirm deletion before committing to it as we will
likely only be able to undo it via the version history.

## Code Workspaces

The Code Workspaces will have a layout similar to the map editor. Instead of the
Actor Palette on the left-hand side, this will be the Blockly toolbox as we have
it today: categories of blocks based on our main set, and then a section for
each rule and for each actor. The only additional thing we are adding is a
button to mirror the `Add New Actor` button which will be the `Add Rules` button
which will present the rule import dialog.

Rules will generally be the domain of the code spaces just as actors will be in
the domain of the screen/map spaces.

As mentioned before, our Blockly workspaces will not be ones where you can place
the blocks anywhere. These workspaces are just oriented around event handling.
As such, we will always be using the '+' style interface where we place '+'
buttons inbetween events to add new events, allowing dragging only to reorder
events when dragging the top block of that event, and clicking the '+' buttons
lists only available events for the context. We have already implemented this
system and we will reuse it.

## Screen and Map Properties

The initial definition of a Screen or Map is done via the visual editor. We will
not offer the code interface of the `define world` (which would be something
like `define screen` now) or `define map` anymore. The properties will be set
via the base properties window when nothing is selected in a screen or map.

The Map properties are ones provided by the base engine or by rules. The base
engine properties deal with backgrounds and user interface themes. Backgrounds
are set via representing the background as an image and then clicking on the
image brings up the backgrounds dialog. The backgrounds dialog has the ability
to clone, create from scratch, import, and AI generate options. Existing
backgrounds can be edited with the image editor, similar to how sprites and
animations are dealt with in the Actor Editor, to be described later.

This somewhat contradicts earlier ideas about maps and the purpose of a world
where the world was the general arbiter of the world properties. We now need
some kind of general properties for which all maps adhere. It is unclear how
to best do this, but it seems reasonable to do it in the Map view when looking
at any Map to have the general properties toggle between 'World' and 'Map' to
allow setting properties for ALL maps and properties for just the one being
edited. For a project with just one map, this is effectively the same, but
useful for games that eventually get more than one level or possibly travel to
levels with different rules and behaviors.

### Effects

Effects with respect to screens and maps are effects that are applied to the
entire screen or map. This is applied to all objects by essentially being an
effect applied to the entire surface. For a Map, this effect is applied to the
space where the size is governed by the dimensions of the map and it is as seen
through the camera of a Viewport. This is different than an effect applied to
the Viewport actor as that is applied to the surface that is viewing and
rendering the part of the Map visible via the Viewport, though in practice this
may result in very similar looks and it is something that is able to apply to
all maps that are loaded and not require every Map apply the same effect.

Applying an Effect to all maps is an interesting idea but we will punt on that
for the time being.

## Actor Editor

Actors have a dedicated editor. They are the entities in the game. There are
Game Actors and Interface Actors, depending on what their main purpose is. Game
Actors are ones that generally take on traits related to game systems and rules.
Interface Actors generally take on engine and input systems and rules. Interface
actors have an icon as their depiction. The Actor Palette shows each set on
their own while toggled as described in the Actor Palette section of this
document. The `Add New Actor` button will present the actor wizard for creating
each type of actor and there are two different wizards for each of the two
types.

Actors created by scratch will be done through that wizard and so will be a
blank Game Actor or Interface Actor. Different rules and enhancements are
offered to each type. We should look at existing rules and enhancements and
categorize them to fit each type so we can filter what we offer to reflect the
context of when the import dialogs are shown.

The Actor Editor retains the same shape as other editing modes. In the left-hand
side, where the Map Editor had the actor list and the Code Workspaces places the
toolbox will be an equally wide panel that houses the actor definition. This
panel lists traits and effects in the top tabs of the panel much like the
game actor and interface actor toggles in the map editor's Actor Palette.

The traits section of the side panel works like it does in the Map Editor when
you select an Actor and it lists the properties for each trait when you select
it to expand the trait. The effects tab will list the current Effects that are
loaded for the Actor. When you select the Effect, you can toggle it on for the
actor and set the properties. So, it has a toggle and the Effect properties
listed just like Trait properties.

### Traits

The traits section lists the traits as small blocks of what behaviors the actor
has and how it, ultimately, works. these have properties. When one clicks on a
trait, it brings up the trait properties so that they can be edited. The trait
can also be removed.

On the bottom, where the `Add New Actor` button was in another button to add a
trait. This will bring up the existing trais and also offer the actor
enhancements. This button will be the `Enhance Actor` button. Basic, already
known traits, will be listed as options but also the enhancements dialog we
already have will be accessed here.

### Effects

Effects are listed like traits in the side panel. Similar to the traits section,
this will show the properties when selected. On the bottom, where the `Add New
Actor` button was will be the `Add Effect` button to bring up the Effect modal
that lists Effects for import.

Effects can be listed but toggled off for the Actor. This is because toggling it
on could be something done during gameplay or as a part of an Animation, which
are described later.

### Animations

In the preview section to the right of the properties side panel will be the
Actor preview and animation editor. For a basic Actor, this is just the sprite
for the Actor and potentially this is also an animation that plays and loops by
default. An Actor is a set of animations and has a Main animation that might be
a single sprite.

The animations are listed under the preview as a horizontal list as long as
there is room on the page. If there is no room, it is a dropdown that brings up
a modal to list the animations attached to the Actor. When an animation is
selected, the animation is loaded and the preview shows the first frame of the
animation.

Animations are no longer globally accessed, they are accessed from the actors
they are attached to. Rarely would the same animation be applied to a different
actor.

The button at the bottom will be the `Add New Animation` button which will
create an animation that, by default, is just the empty properties. This makes
an animation that does not do anything. One can change the sprite to essentially
create a different sprite for that animation. By using the timeline, one can
create a traditional visual animation. By using the timeline, and setting other
properties, one can create a tween. Properties are edited using the same side
panels. Effects can be toggled on which turns them on for the animation at that
time in the timeline. Setting any property will create a keyframe on the
timeline in the current position.

The animation starts at position 0 and is considered ended at the last keyframe.
The timeline is long enough to accommodate 5 seconds by default and subdivided
equally. Clicking on the timeline where there isn't a keyframe will preview that
time in the preview. Properties that can be visually reflected will be visually
represented if possible by the preview. Updating a property will create the
keyframe at that position with the set properties. Properties that are in
process will show the interpolated result in italics to denote that they are
computed. You can edit these values and they will be set at that keyframe and
will affect interpolation accordingly.

Currently we will just do linear interpolation. We should consider how we would
tell it how to use easing for that keyframe and whether or not we do it for all
values or just the ones being set. We should do what is easiest to represent and
best for Phaser to handle.

Built (ANIMATION_PLAN.md), with two departures. The values at the
playhead are a panel under the timeline rather than the side panel, whose
fields stay the actor's own; and an effect is keyed by its checkbox in
that panel, while the Effects tab says whether it starts on. The strip is
drawn five seconds long only while an animation is empty, and its own
length after that, which a Length field can stretch.

### Interface Actors

Interface Actors are typically drawn via `define drawing` function. This will
be simplified since Interface Actors always have a width and height to be
automatically a `define drawing <width of actor> by <height of actor>`.

## Effect Editor

The overall Effect Editor stays as it is currently.

## Cameras

Cameras are only owned by Viewports since the World is now a Screen. A Screen
does not have a Camera. A Camera is used to decide how a Viewport sees which
part of the Map it is currently viewing.

When you select a Viewport, there is now a Cameras tab alongside the Traits
and Effects tabs. This will list the Cameras that are part of the Viewport.
There is a Main Camera that, by default, is always available on the Viewport.
There is an `Add New Camera` button in the normal place which will create a
new named camera.

The Main Camera is the toggled camera by default. You can toggle a different
camera in the interface or programmably via a 'look through' block.

When you select a Camera in the side panel, it opens up to show trait
properties for that camera. It also has the same Trait dropdown that current
cameras have to allow one to select Camera abilities. There is a way to add
Camera enhancements as well. This is how we add the easing, deadzone, and
follow behaviors and rules. This lets us, once again, keep the camera rules
and traits out of the main rule and trait import.

## Viewports

Viewports basically do not change that much. Much of the changes were already
discussed with discussions of Screens and Maps earlier.

## Map Layers

The only remaining issue is the Map Editor with layers. Screens do not have
layers. Screens have panels and inlay views via other screens. Maps, instead,
have layers in order to have foreground and background elements. They are an
advanced tool to create richer levels.

In the Map Editor, the top toolbar will have a layer toggle. It will be a
button that has a dropdown to list layers in their render order and a way
to add or remove the layer. We may need to experiment with how this looks
and feels. Layers have names and can be referred by layer dropdowns in code
blocks that target layers.

When a layer is toggled, that layer is shown. If there are any layers
underneath, these are still potentially shown. Layers above are hidden so that
these layers do not impede visibility of the editing layer. The base properties
which typically show Map properties in general will also show layer properties.
Layers have a background and can get their own Effect toggled for it.

Actors added to the layer are rendered in that layer. They might interact with
actors in other layers, potentially. We can revisit that decision later. For
simplicity, the actors in all layers are generally considered in the same space
and subjected by the same rules. They can collide, for instance.

## Actor, Effect, Sprite and Animation Assets

It would be good to have a great set of assets premade for quick prototyping and
building. These include:

- Interface Actors
- Game Actors
- Sprites/Animations for different characters
- Sprites/Animations for different collectables
- Spritesheets for blocks and tiles for environments
- Camera effects and interesting traits
- Effects that are interesting for entire maps and for characters and objects
- Enhancements and code updates that add interesting behaviors

These Actor premades dictate many interesting rules that can applied on import
of the premade actor and/or enhancement that adds functionality to an Actor or
Camera.

We should build a nice pool of rules, traits, and such to build a rich set of
games. These types of games should include:

- Platformers
- Top-down adventures
- Turn-based puzzles / adventures
- Arcade games similar to Tetris/Breakout/etc
- Board and Card games
- Visual Novels
- Text Adventures

We would want fixtures that represent these games so we can see them in
practice.

## Application Lab

We want a specific lab mode that focuses only on Application development. In
this mode, there are no Game Actors. There are only Screens and Interface Actors
available. The Main Screen does not have a Viewport nor is the Viewport
available for use. All Game elements and enhancements are not available.

## Decisions

Settled in discussion, October 2026. Each says where a thing lives once the
World is a Screen and nobody sees a `define world` or `define actor` block.

### An actor is data and events

An actor's file is data and an event workspace. The data is what the Actor
Editor's panel shows: its own properties, the traits it takes, its effects,
its sprite and its animations. The generator builds the actor from the data,
as it builds stored cameras now. No `define actor` block is shown anywhere.

The actor's own properties are the first group of its traits, named "Self".
Each is a name, a type and a default value, with the types `define property`
has today. A placed actor's inspector shows the same group, where the value
set overrides the default for that one instance.

Renaming a property rewrites every block that reads or sets it, in the
actor's code and in any other file. Deleting one first says where it is used.
A property's blocks are named after it, so a rename that did not follow them
would leave each one silently meaning nothing.

What an actor DOES stays in its code workspace, and the "+" offers it beside
the events: every frame, a block of its own, an event of its own, and its
drawing. An Interface Actor's drawing is sized to the actor's width and
height.

The same property device is used wherever something keeps values of its
own: an actor's Self, a Screen, and the game as a whole.

### What `define world` held, and where it goes

| Under `define world`              | Where it lives                              |
| --------------------------------- | ------------------------------------------- |
| name                              | the project's name; the Main Screen is Main |
| own properties (a score, lives)   | All maps, as game-wide values               |
| rule settings (amount of gravity) | All maps; This map may override             |
| theme                             | a Screen's properties, and a Map's          |
| background image and color        | a Screen's properties, and a Map's          |
| view size                         | the Main Screen's size                      |
| cameras                           | the Viewport's inspector, a Cameras section |
| layers                            | the Map's layer control                     |
| `load map`                        | the Viewport's map                          |

A map's properties window switches between "All maps" and "This map". The
word World is not used for either. A project with one map does not show the
switch.

Game-wide values can be read and set from any code, a Screen's or a Map's: a
score is shown by a label on the Main Screen and changed by a coin in a map.

A Map takes the Main Screen's theme unless it sets its own.

### The grid layout is a tree of splits

A Screen's layout is stored on the Screen as a tree. Each split divides its
region across or down, and each side of it is either a fixed size in pixels
(a HUD bar) or fills what is left (the Viewport). Ratios alone would make a
HUD bar grow and shrink with the screen, which is rarely what is meant.

The divider between two sides can be dragged to resize them. An actor docked
in the layout fills its region. An actor not docked floats where it was put.

### Effects are data on the actor

An actor's effects are stored with it, each with its settings and whether it
is on. The panel's toggle writes that flag. Code and animations turn an effect
on and off while the game runs; the stored flag is how it starts.

### Interface, game, or both

Every stock rule and enhancement says whether it is for interfaces, for
games, or for both; every actor says interfaces or games, never both
(ACTORS_AS_DATA_PLAN.md, step 3). An interface actor is drawn and shown by
its icon, and either tab is open on a Screen and on a Map, so a Health Bar
is an interface actor placed in a level. Whether a level with no game
offers one is a separate list (`appBuilder`), which leaves out the
Viewport, the Health Bar and the Portrait. The flag decides which tab of
the Actor Palette an actor is under, which of the two wizards makes it, and
what each import dialog offers in that context. It decides what is offered
FIRST and never what can be used: each dialog lists what fits and keeps the
rest behind "Show everything", and the engine and the compiler do not read
it.

### A breadcrumb back

With the file tabs gone, an editor can be several steps from the Main Screen:
Main › the Viewport › Level 1 › the Hero placed there › its code. A
breadcrumb above the editor names each step and is the way back to any of
them.

### Every kind of file is reached where it is used

There is no list of a project's files. Each kind is opened, made, renamed,
cloned and deleted from the place that uses it, and those places all ask
one host for the act, with the same prompts:

| Kind                 | Where                                                     |
| -------------------- | --------------------------------------------------------- |
| Screens and Maps     | the switcher, and the actions beside the name             |
| Actors               | the Actor Palette, and the Actor Editor                   |
| Pictures, animations | an actor's Looks like; the open button on `set sprite`    |
| Backgrounds          | the Background field                                      |
| Effects              | an actor's Effects tab                                    |
| Themes               | the Theme field                                           |
| Rules                | Rules in Play, from the toolbox, the world, the inspector |
| Sounds               | the sound shelf, under "In your project"                  |

A file opened from one of these is a step on the breadcrumb, and the step
before it is the way back.

A Viewport's cameras are a section of its inspector rather than a tab of
their own: a placement's inspector has no tabs, and one section beside its
traits is what a tab would have held.

### Lessons last

The lessons teach the current shape of the lab: `define world` rows,
`use trait`, `define actor`. Their checks watch the running game and should
carry over; their starting projects and instructions do not. Nothing has
shipped, so they are rewritten for the new shape rather than migrated, and
after the rest is built.

Done for actors (ACTORS_AS_DATA_PLAN.md, step 7): forty-four lessons give
traits from Enhance Actor, keep an actor's own values in Self and a world's
on the Map, and read an actor's code behind Code. `define world`'s rows
remain, and so do the lessons that teach them.

### First, the game inside a Viewport

The one change the engine has to bear is the game moving into a Viewport: a
game's actors live in the Viewport's space on the Main Screen rather than in
the World's own. Before any interface is built, every lesson check and
fixture is run with its game moved into a Viewport docked to a bare Main
Screen, to find what rules, collisions, cameras and pointer input do
differently there.

Done, October 2026, for the lesson checks (249 cases), by moving each
project's game at the point it is checked: the world's main map and its
`set size of map` became `maps/game.map`, each `add actor` row became a
placement there whose script ran the row's body when it was created, the
main camera became a camera of the Viewport, and the world's main map held
only the Viewport. Every actor landed in the Viewport's space, and the
engine played the same games there. What differed:

- **Backgrounds set from the world's code land on the screen.** A
  `set background` row or handler acts on the root, which is the Main
  Screen now, not on the map in the Viewport (`look/background`,
  `adventure/world`, `story/scene`). The blocks that act on "the world" —
  background, effects, layers, map size — take their target from where the
  code runs; see "World blocks act where they run" below.
- **A placement cannot read the world's variables.** Rows that placed
  actors from a variable declared in the world's code lost it in a
  placement's script (`memory/variable`, `memory/actor-state`). Game-wide
  values, decided above, are what such a lesson uses instead.
- **Setup in a "when created" script lands a frame late.** Speeds, text and
  traits given in a placement's script arrive after the first frame, where a
  row gave them before it (`simulation/emergent`, `story/scene`'s first
  click). Placements keep their values as data, which the inspector already
  does, rather than as code.
- **A Viewport looks through its chosen camera one tick after loading.**
  The camera followed and stopped at the map's edge as before, but the first
  frame was seen through the Viewport's main camera.
- **Seven lessons' static checks** read the world file's own blocks and map,
  and fail against a moved project before anything runs. They are rewritten
  with the lessons.

Not covered by the checks, and still to see in the browser: drawing, the
pointer while the Viewport's camera has scrolled, where keyboard focus goes,
the cost of the extra space, and the root-only behavior of anchors and of
modal maps stacked over the screen.

### World blocks act where they run

A block that acts on "the world" has no dropdown naming a screen or a map.
It acts on the place its code belongs to:

| Code belongs to      | `set background` sets                 |
| -------------------- | ------------------------------------- |
| a Screen             | that Screen's background              |
| a Map                | that Map's background                 |
| an actor on a Screen | the background of the Screen it is on |
| an actor in a Map    | the background of the layer it is in  |

An actor's place is where it is when the block runs, not where it was put:
an actor that moves to another layer, or is carried into another map, sets
that one's. An actor in a map with no layers of its own is in the map's one
layer, so it sets the map's background.

The other blocks that act on "the world" follow the same rule. Effects act
on the Screen, Map or layer the code runs in; map size and layer visibility
act on the Map it runs in. Code that means some other place has to name it.
