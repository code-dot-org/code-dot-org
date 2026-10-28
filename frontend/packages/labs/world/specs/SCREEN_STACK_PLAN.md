# Plan: screens are a stack, and each one holds its own words

STATUS: PLANNED, October 2026. Nothing below is built.

A game is a stack of screens. The Main Screen is at the bottom and is never
taken off, so what it declares lives as long as the game. Any other screen is
put on top of what is showing, and taken off again with `go back`. A screen
holds the values and events for what is on it, its Viewports' maps included.
This replaces the `Screens` rule, which keeps a stack of MAPS loaded over the
root (specs/SCREENS_PLAN.md).

## What there is now

- **One screen.** `screens/main.screen` is the root space. Nothing loads
  another `.screen`.
- **What a project calls a screen is a map.** `load map` and `load the map
named` add a map's actors to the space the code runs in, over what is
  there. `unload the newest map` takes the newest back. The `Screens` rule
  wraps those three in `go to screen`, `go back` and a list of paths.
- **Modality is a flag on a map.** A load made from a map that says `modal`
  covers what is under it: input stops at the topmost modal load in the
  root (`World.canReach`, specs/MODALITY_PLAN.md). The pause menu and the
  stock dialogs are modal maps.
- **The game's own values and events are one store on the World**, seeded
  from the Main Screen's data (`ownProperties`, `defineEvent`). A map raises
  one by name (`emitNamed`), since a map cannot import the screen that
  loads it.
- **A screen's `when any ⟨kind⟩ …` is registered on the kind**, so it hears
  that kind's actors in every space.

## The model

- **Screens are first-class, and no rule wraps them.** A rule is there to
  show a learner engine code in blocks they can read. Pushing and popping a
  screen is not code worth reading, so it is built in.
- **`show screen ⟨…⟩` puts a screen on top, and `go back` takes the top one
  off.** `go back` with only the Main Screen showing does nothing. The same
  screen shown twice is two screens, each with its own values.
- **Each screen on the stack is a space**, drawn over the ones below at the
  size of the window, with its own camera, layers and Viewports. Taking it
  off unloads it, its Viewports' maps, and its values.
- **Maps are places.** A map is shown in a Viewport, or added to the screen
  the code runs in with `load map`. That stays for what belongs to the
  screen it is on, such as an on-screen keyboard over a form. Anything that
  covers what is under it is a screen. The pause menu and the dialogs become
  screens.
- **Events are the only way screens talk.** A level-select screen raises
  the Main Screen's `level chosen ⟨path⟩` and goes back, and the Main
  Screen's handler loads the path into its Viewport. `go back` carries no
  value; it changes the stack and nothing else.

## Which words a screen sees

- **A screen's own words are seen by its own code and by the maps and
  placements in its Viewports.** A minigame screen with a `score` of its own
  keeps it for its own levels.
- **The Main Screen's words are seen everywhere**, since everything is above
  it.
- **A screen does not see the screen under it.** A settings screen shown
  from the title and from the game would otherwise see different words
  depending on where it came from.
- **A word is found from where the code runs**: the nearest screen at or
  under that space which declares it, and then the Main Screen. A screen
  shown twice therefore reads and sets its own copy.
- **The Main Screen's words reach another file by name**, as a map's events
  do now, and never by import. The Main Screen shows the other screens, so
  an import back to it is a cycle.
- **A screen's `when any ⟨kind⟩ …` hears only the actors on it and in its
  Viewports.** The Main Screen's hears every actor, as now. A minigame
  screen's hears only its own.

## Input and drawing

- **Only the top screen receives input.** Clicks, taps, keys and focus go to
  the top screen's actors and the maps in its Viewports, and to nothing
  under it. A map's `modal` flag goes: covering is what a screen does. This
  may later become a setting on a screen.
- **A screen covered completely is not drawn.** A screen covers the window
  when its background color is opaque. A screen with a transparent or
  partly transparent background shows what is under it. This comes from
  the screen's data, so there is no separate setting for it.
- **A covered screen keeps running.** Whether showing a screen pauses the
  ones under it is left for later. A project that wants the game to stop
  under a menu says `pause the game` itself, as it does now.

## Lifetimes

- **Game, from Run to Stop:** the Main Screen's values. Score, lives, level.
- **While a screen is on the stack:** that screen's values. They are lost
  when it is taken off.
- **Across runs:** memory. `save the world's memory` writes the values of
  the screen the code runs in, the same "where it runs" rule every world
  block keeps (specs/SIMPLE_INTERFACE.md).

## What goes

There are no migrations; nothing has shipped (specs/RETIREMENTS_PLAN.md).

- The `Screens` stock rule, its demo, and the tile and lessons that grant it.
- `load the map named ⟨…⟩` and `unload the newest map`. `load map ⟨…⟩
into ⟨Viewport⟩` already takes a path worked out in code.
- `WorldMap.modal`, `MapLoad.modal`, and `canReach`'s walk over modal loads.
- The pause menu and the stock dialogs as maps; they come back as screens.

## Order of work

1. This plan.
2. Engine: a screen on the stack as a space, `showScreen(path)` and
   `goBack()`, input to the top screen only, and covered screens not drawn.
   Tests.
3. Engine: a value store and an event registry for each screen on the
   stack, words found from where the code runs, and `any ⟨kind⟩` handlers
   scoped to the screen that registered them. Tests.
4. Compiling: every `.screen` file compiles and is registered by path, as
   maps are. A screen's palette offers its own words and the Main Screen's.
   The `show screen` and `go back` blocks. Tests.
5. The pause menu and the dialogs as stock screens. The Interface Kit and
   the Notes app move off the `Screens` rule.
6. Deleting what goes, above.
7. The shelf: library entry, demo, tile.
8. Specs: SCREENS_PLAN.md, MODALITY_PLAN.md and WORLD_AS_DATA_PLAN.md
   marked superseded where this replaces them, and this record.

## To find out before step 2

- How the preview's renderer draws spaces other than the root and the
  Viewports', and what it costs to add screens on the stack beside them.
- Which fixtures and lessons use the `Screens` rule, `load the map named`,
  `unload the newest map` or a modal map, and what each becomes.
- Whether the screen editor and the map editor need anything to open a
  `.screen` other than `main`, and how a project adds one.

## Not in this plan

- **Pausing what is under a screen.** Later, as a screen's setting.
- **Input reaching screens under the top one.** Later, as a screen's
  setting, if an overlay screen wants it.
- **Transitions.** A screen appears and is there.
- **HUD bindings.** A placed actor showing a word its screen can see, set in
  the inspector, is its own plan. It fits this model unchanged.
- **Editing a screen's values and events in the World inspector.** Pending
  from WORLD_AS_DATA_PLAN.md, and needed by step 4's palette only as data.
