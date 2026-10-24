# Plan: the editor shell (SIMPLE_INTERFACE.md, phase two)

STATUS: IN PROGRESS.

The second phase of the simple interface. Phase one (SCREEN_MAP_PLAN.md)
made Screens and Maps files and put the game in a Viewport. This phase
puts the editors that already exist inside the shell SIMPLE_INTERFACE.md
describes: one place at a time with a breadcrumb back, the Actor Palette
down the side, and a toolbar over the Screen or Map. Nothing about what a
file holds changes; that is the Actor Editor's phase.

## What exists

- **The file tabs are Codebridge's.** `Workspace` draws them
  (`codebridge/src/components/Workspace.tsx`). Which files are open and
  which is in front is kept in the project source itself (`openFiles`,
  `files[id].active`) and changed with `activateFile`. Everything that
  moves the learner to another file calls that: the folder menus, a block
  naming a module (`blockly/openModule`), the map editor's `openKind`, and
  Show me (`WorldLayout`'s revealer).
- **The folder menus sit before the tabs.** One icon button per folder
  (`files/FileMenus.tsx`, `files/folderMenus.ts`); the World button opens
  the Main Screen.
- **One editor per file kind** (`config.editorComponents`). A Screen is the
  map editor with the screen document (`ScreenEditor`).
- **A placed actor's code, or the map's own, replaces the map editor**
  while it is open: `MapEditor` keeps a `script` state and renders
  `PlacementScriptEditor`, whose header has a "← Map" button.
- **The actor strip runs along the top of the map editor**: the map's width
  and height, one picture per actor kind, and "New actor…", which opens the
  actor creation wizard (`actors/create/ActorCreator`). A click on a
  picture takes that kind as the brush; a click on the map places one.
- **The stage toolbar** (`MapStage`) has zoom, Reset view, Code marks,
  Layers, Cameras, and the map's or screen's code.
- **There is no undo** in any editor but Blockly's own.
- **Nothing draws a Screen or a Map** as a picture; the thumbnails are of
  actors only (`runtime/thumbnailManifest`).

## What is being built

One commit each.

### 1. One place, with a breadcrumb

The tab strip is gone. Above the editor is a breadcrumb naming the steps
from the Main Screen to what is open:

    Main › Level 1 › Hero

Each step but the last is a button back to it.

**The trail is kept by the layout, and follows the active file.** Nothing
that opens a file has to know about it: every way of opening one already
ends in `activateFile`. When the active file changes, the trail:

- is unchanged, if the last step is that file;
- is cut back to that file, if it is an earlier step;
- gains that file as a new step, otherwise.

The entry file (the Main Screen, or a world) is always the first step. A
step whose file has been deleted is dropped. The trail is not saved: a
project opens with the entry, and the active file after it if that is
another.

**A placed actor's code is a step too**, within its map's file: Main ›
Level 1 › Hero, where Hero is the code of the placement called Hero, and
Main › Level 1 › Code for the map's own. `MapEditor` reads which script is
open from the trail rather than from state of its own, so going back a
step closes it. Rendered without the layout (as tests render it), the map
editor keeps its own state as now. The script header keeps its title and
loses "← Map", which the breadcrumb replaces.

**Each step is named as the rest of the lab names it**: a file by
`config.fileLabel`, as its tab was; a placement by its name.

Codebridge's `Workspace` takes what to draw in place of the tabs
(`tabStrip`); a lab passing nothing keeps its tabs. The folder buttons stay
where they were, before the breadcrumb, until the Actor Editor can reach
what only they reach now: effects, animations, sprites, styles and sounds.

The trail's rules are a pure module with tests; the breadcrumb is checked
in the browser.

BUILT. `layout/trail.ts` (`follow`, `withScript`, `scriptOf`), kept by
`WorldLayout` and handed down through `TrailContext`; `MapEditor` takes its
open script from `useScriptStep`. The breadcrumb's separator is the
character `›`, not an icon. In the browser: opening the level from the
Maps menu, then its code, then going back a step at a time, closes the
code and returns to the Main Screen.

### 2. The Actor Palette

The actor strip becomes a column down the left of the map editor:

- two tabs, **Game** and **Interface**;
- one picture per actor kind under the chosen tab;
- under the actor in hand, **Open** (its file, as the folder menu opens it)
  and **Delete** (out of the project, after saying where it is placed and
  which files name it);
- **Add New Actor** fixed at the bottom, opening the wizard.

A second click on the actor in hand puts it down. The map's size moves to
the toolbar (step 4).

The tabs need to know what each actor is for. A stock actor says so
(`StockActor.for`: `game`, `interface` or `both`), and importing one writes
it into the actor file as a top-level key, beside the workspace. An actor
file that says nothing is a game actor, which is what the wizard makes from
nothing; a copy keeps its original's flag. An actor for both is under both
tabs. The flag's other uses (which wizard, what each import dialog offers)
are a later phase.

A Screen opens on the Interface tab, a Map on the Game tab.

BUILT. `mapEditor/ActorPalette`; the flag is `actors/actorPurpose` and
`StockActor.for`, written by `importedContents`. Delete is asked of the
file menus, which own the prompts (`actors/actorDelete`), and says where
the actor is placed and whose code names it (`files/actorUses`). It writes
with `replaceSources`, so the open map reads its file again rather than
keeping the placements it took away. Building it found that renaming an
actor missed `.screen` placements and the code kept inside maps; that is
fixed (`WORKSPACE_FILE`). The size fields stay over the stage until step 4. In the browser: the starter's Main Screen shows the Viewport under
Interface; its level shows the eight game actors; deleting the Ball takes
it off the palette, the stage and the running game.

### 3. Painting with the brush

With an actor in hand, a press on an empty cell places one and a drag
places one in each cell it crosses. A press on a placement of the same kind
removes it, and a drag that began that way removes along its path. Alt
still places off the grid, one at a time. With nothing in hand, a press
selects, as now.

The cell arithmetic is in a pure module (`stageGeometry`); the strokes are
checked in the browser.

### 4. The toolbar

Over the stage, shared by the Screen and the Map:

- **the name**, drawn as a dropdown. It opens the switcher: a dialog with
  a section of Screens and a section of Maps, each listing its files by
  name with an Add button. Choosing one opens it as a step on the trail.
- **an actions menu** beside the name: Rename, and Delete after a
  confirmation. The Main Screen can be renamed but not deleted.
- **the size**: tiles for a Map, as now; pixels for a Screen.
- **Code**, which opens the Screen's or Map's own code (now on the stage
  toolbar).
- **Reset view.**

The stage keeps zoom, Code marks, Layers and Cameras.

The switcher lists names. Pictures of Screens and Maps need a renderer and
a place in the project to keep them, and are later work.

### 5. Undo and redo

Each Screen and Map editor keeps a history of its file's contents: every
write the editor makes is a step, and a run of writes from one gesture (a
drag, a typed number) is one. Undo and redo are buttons on the toolbar and
the usual keys while the stage has focus. Adding an actor or a rule to the
project is not in the history, as SIMPLE_INTERFACE.md says. The history is
a pure module with tests.

### 6. Add Rules in the code workspaces

The toolbox of every code workspace ends with an **Add Rules** button that
opens the rule import dialog (`requestRuleImport`), as the Actor Palette
ends with Add New Actor.

### 7. Documents, fixtures and the browser

SIMPLE_INTERFACE.md, FILES.md and MAPS.md are brought into line; every
fixture is opened and edited in the browser through the shell alone.

## Not in this phase

- The Actor Editor, and an actor as data and events.
- Docking and the grid layout.
- Pictures of Screens and Maps.
- Taking the folder buttons away.
