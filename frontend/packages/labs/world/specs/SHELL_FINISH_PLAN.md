# Plan: finishing the shell (SIMPLE_INTERFACE.md, phase six)

STATUS: IN PROGRESS.

The sixth phase of the simple interface. SIMPLE_INTERFACE.md opens with
the aim of hiding the file tabs and folder buttons, so the Screen or Map
editor fills the workspace. Phase two (SHELL_PLAN.md) built the shell
around the editors and left four things for later: pictures of Screens and
Maps, taking the folder buttons away, and (by omission) the spec's layer
and camera sections. This phase does those four, in an order that makes
the last one safe.

## What exists

- **The file tabs and the file tree are already gone.** `WorldLayout`
  passes `hideFileBrowser`, and the breadcrumb stands where the tabs were
  (`tabStrip`). The folder buttons are the last way to browse files
  (`tabBarStart={<FileMenus menus={browsable} />}`), shown unless a level
  sets `showFileBrowser: false`.
- **FileMenus is also the host of every file seam.** With the buttons off
  it stays mounted and draws nothing, and the seams it answers still work:
  `fileActs` (make, rename and delete for screens and maps), actor create
  and delete, the import shelves. So the buttons can go without the acts
  going, as long as each act has another door.
- **What only the folder buttons reach** (an audit of `FileMenus`, October
  2026):
  1. Opening four editors: the image editor (sprites and backgrounds), the
     animation editor, the effect editor and the theme editor. No block,
     field or panel opens them.
  2. Making from nothing: a sprite, a background, an animation, an effect,
     a theme, a rule.
  3. Uploading anything: sprites, backgrounds, sounds.
  4. An AI-drawn background (a sprite can also be drawn in the wizard).
  5. Rename, clone and delete for rules, sprites, backgrounds, animations,
     sounds, effects and themes. Screens, maps and actors have other doors
     (the switcher, the palette, the Actor Editor); clone has none for maps.
  6. Opening a rule that no block on screen names.
  7. A list of everything of one kind: all rules, sounds, effects, themes.
- **The switcher lists names.** Nothing draws a Screen or a Map as a
  picture (`PlaceSwitcher`).
- **Layers** are a strip toggled from the stage's toolbar (`LayerPanel`),
  with the selected layer's properties in the base inspector. Every layer
  is drawn while one is edited, and a Screen offers the toggle though the
  spec says Screens have no layers.
- **Cameras** are a strip on the stage (`CameraPanel`). The world's are
  edited there (`CameraInspector`, `worldCameraCode`); a Viewport's are
  read-only, declared in its placement's code. Since phase one the game's
  camera is a Viewport's, so the editable list is the one that matters
  least.

## Decisions

- **Each kind gets a door where it is used**, as the spec's opening asks
  ("where those objects generally live naturally"): a picture from the
  actor or field that shows it, an effect from the Effects tab, a theme
  from the Theme field, a background from the Background field, a rule from
  the code workspace. No new general file browser.
- **One seam for the acts.** `fileActs` grows to make, rename, clone,
  delete and upload for every kind, answered by FileMenus as now, so each
  door is a button that asks rather than a second implementation.
- **An opened asset is a step on the trail.** Opening an actor's picture
  from the Actor Editor puts "Player › its picture" on the breadcrumb, and
  the crumb before it is the way back, as with a placement's code.
- **A picture of a Screen or Map is a project file**, written when the map
  editor leaves a place it changed, and hidden from every list as a sheet
  is. The spec asks for it to be saved "for recall later and use in
  imports across projects", which a cache in the browser would not be.
- **The folder buttons are removed, not hidden.** Nothing has shipped
  (no migrations), and a flag that brings them back is a second shell to
  keep working. `showFileBrowser` goes with them, and the lessons that set
  it say nothing instead. FileMenus stays, as the headless host it already
  is when the buttons are off.

## What is being built

One commit each, or a few where a step names several kinds.

### 1. Pictures of Screens and Maps

The switcher shows each Screen and Map as a picture above its name. The
picture is drawn from the place's document, fitted, small, by the same
drawing the stage does, when the editor leaves a place whose document
changed, and written beside it as a hidden PNG. A place with no picture
yet shows its name on a plain tile.

BUILT. The stage's painting is one function (`MapStage.paint`), which the
stage calls DECORATED — the grid, the border, the selection, the marks,
the ghosts — and the picture calls plain: the place as the game shows it,
a Viewport's contents undimmed. It is painted 240 pixels on its longer
side a second and a half after the place last changed, so a burst of
edits is one picture and the actors' own pictures, which arrive after the
first paint, are in it; and written only when it differs.

Where it is kept departs from the decision above in one respect: not a
PNG, which in this project is an upload behind a URL, but a hidden text
file of the image as a data URL, `main.picture` beside `main.map`
(`mapEditor/placePicture`). It follows its place through a rename and a
delete as a `.sheet` follows its image; that reconciling is now one
helper for both (`files/companions`). It is no part of the program
(`projectFiles` leaves it out), so writing one does not recompile the
game. In the browser, Breakout's Screen and both its Maps showed as
pictures after each was opened once, and the preview did not restart.

### 2. Layers as the spec has them

- No Layers toggle on a Screen.
- While a layer is selected on a Map, the layers in front of it are not
  drawn; those behind it are. "Show all" in the strip draws every one.

### 3. Cameras on the Viewport

A selected Viewport's inspector has its cameras: the Main Camera always,
and Add New Camera. A camera opens in the camera inspector, with its
traits, what it follows, and its enhancements, as the world's do now; what
is set is written into the Viewport placement's code by the same writer
the world's cameras use. The stage's camera strip goes; the world's own
cameras, on a project still shaped as a world, keep the inspector they
have.

### 4. Doors for every kind

`fileActs` widened first (make, rename, clone, delete, upload, for any
folder). Then, by kind:

- **Pictures and animations**, from the Actor Editor: beside the look,
  "Edit" opens the picture or animation in its editor, as a trail step;
  the look's picker gains New, Upload, Draw with AI, Rename and Delete.
- **Backgrounds**, from the Background field: Edit, and the same picker
  acts.
- **Effects**, from the Actor Editor's Effects tab: Edit opens the effect
  editor; New makes one; Rename and Delete on its row.
- **Themes**, from the Theme field: Edit and New.
- **Rules**, from the code workspace: Rules in Play (`RulesInPlayDialog`,
  which already lists every rule and deletes) gains Open, Rename, Clone
  and New, and is reached from the toolbox beside Add Rules.
- **Sounds**, from the sound shelf: Upload, and the project's own sounds
  with Rename and Delete.
- **Maps**: Clone in the switcher's actions.

### 5. The folder buttons go

FileMenus draws no buttons; `showFileBrowser` and its lesson settings are
removed; folderMenus.ts's description of the menus is rewritten for what
remains (the seam host and its dialogs). A test walks the audit's list
and finds a door for every item.

### 6. Documents, the browser, and the ledger

## Not in this phase

- Importing a Screen or Map from another project, which the pictures
  make possible.
- Animations kept on the actor rather than in the project, and the
  timeline, which are the next phase.
- Effects on a whole Screen or Map, and the World/Map properties toggle.
