# Plan: screens are a stack, and each one holds its own words

STATUS: PLANNED, October 2026. Nothing below is built. Comes after
specs/ONE_WORLD_PLAN.md: it assumes one World, flat screens, and Viewports
that look at the World.

A game is a stack of screens. The Main Screen is at the bottom and is never
taken off, so what it declares lives as long as the game. Any other screen
is put on top of what is showing, and taken off again with `go back`. The
Main Screen's values and events are the game's; another screen's are for
its own interface. This replaces the `Screens` rule, which keeps a stack of
maps loaded over the root (specs/SCREENS_PLAN.md).

## What there is now

- **One screen.** `screens/main.screen` is the root. Nothing shows another
  `.screen`.
- **What a project calls a screen is a map.** `load the map named` adds a
  map's actors over what is there, and `unload the newest map` takes the
  newest back. The `Screens` rule wraps the two in `go to screen`, `go
back` and a list of paths.
- **Modality is a flag on a map.** A load made from a map that says `modal`
  covers what is under it: input stops at the topmost modal load
  (`World.canReach`, specs/MODALITY_PLAN.md). The pause menu and the stock
  dialogs are modal maps.
- **The game's own values and events are one store on the World**, seeded
  from the Main Screen's data. A map raises one by name (`emitNamed`),
  since a map cannot import the screen.

## The model

- **Screens are first-class, and no rule wraps them.** A rule is there to
  show a learner engine code in blocks they can read. Pushing and popping a
  screen is not code worth reading, so it is built in.
- **`show screen ⟨…⟩` puts a screen on top, and `go back` takes the top one
  off.** `go back` with only the Main Screen showing does nothing. The same
  screen shown twice is two screens, each with its own values.
- **A screen is flat.** Interface actors and Viewports, drawn at the size of
  the window. Taking it off removes its actors and its values. Its
  Viewports look at the one World, which is not the screen's and is not
  touched.
- **A screen never loads a map.** Maps are the World's.
- **Events are the only way screens talk.** A level-select screen raises
  the Main Screen's `level chosen ⟨path⟩` and goes back, and the Main
  Screen's handler loads the map. `go back` carries no value; it changes
  the stack and nothing else.

## Which words a screen sees

- **The Main Screen's words are the game's.** Every screen's code sees them,
  and so do maps, placements and kinds.
- **Another screen's words are seen by its own code only.** The World is no
  screen's, so nothing in it sees them.
- **A screen does not see the screen under it.** A settings screen shown
  from the title and from the game would otherwise see different words
  depending on where it came from.
- **A screen's code reads and sets its own copy.** The same screen shown
  twice holds two sets of values, and each one's code finds its own.
- **The Main Screen's words reach other files by name**, as a map's events
  do now, and never by import. The Main Screen shows the other screens, so
  an import back to it is a cycle.
- **`any ⟨kind⟩` on any screen hears the World's actors.** A scoreboard
  screen can count coins. A screen shown twice hears each event twice, once
  for each copy.

## Input and drawing

- **Only the top screen receives input.** Clicks, taps, keys and focus go to
  the top screen's actors and through its Viewports to the World, and to
  nothing under it. A map's `modal` flag goes: covering is what a screen
  does. Letting input through to the screens under the top one is a later
  setting on a screen; the on-screen keyboard waits for it.
- **A screen covered completely is not drawn.** A screen covers the window
  when its background color is opaque. A screen with a transparent or
  partly transparent background shows what is under it. This comes from
  the screen's data, so there is no separate setting.
- **A covered screen keeps running**, and so does the World. Whether showing
  a screen pauses what is under it is left for later. A project that wants
  the game to stop under a menu says `pause the game` itself, as it does
  now.

## Lifetimes

- **Game, from Run to Stop:** the Main Screen's values. Score, lives, level.
- **While a screen is on the stack:** that screen's values. They are lost
  when it is taken off.
- **Across runs:** memory. `save the world's memory` writes the values of
  the screen the code runs on, or the Main Screen's from a map, a placement
  or a kind.

## What goes

There are no migrations (specs/RETIREMENTS_PLAN.md).

- The `Screens` stock rule, its demo, and the tile and lessons that grant
  it.
- `load the map named ⟨…⟩` and `unload the newest map`. `load map` takes a
  path worked out in code.
- `WorldMap.modal`, `MapLoad.modal`, and `canReach`'s walk over modal loads.
- The pause menu and the stock dialogs as maps; they come back as screens.

## Order of work

1. This plan.
2. Engine: the stack of screens, `showScreen(path)` and `goBack()`, input
   to the top screen only, and covered screens not drawn. Tests.
3. Engine: a value store and an event registry for each screen on the
   stack, the Main Screen's reached by name from everywhere. Tests.
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

- Which fixtures and lessons use the `Screens` rule, `load the map named`,
  `unload the newest map` or a modal map, and what each becomes.
- What the screen editor needs to open a `.screen` other than `main`, and
  how a project adds one.

## Not in this plan

- **Pausing what is under a screen.** Later, as a screen's setting.
- **Input reaching screens under the top one.** Later, as a screen's
  setting. The on-screen keyboard is the first thing that needs it.
- **Transitions.** A screen appears and is there.
- **HUD bindings.** A placed actor showing a word its screen can see, set in
  the inspector, is its own plan. It fits this model unchanged.
- **Editing a screen's values and events in the World inspector.** Pending
  from WORLD_AS_DATA_PLAN.md, and needed by step 4's palette only as data.
