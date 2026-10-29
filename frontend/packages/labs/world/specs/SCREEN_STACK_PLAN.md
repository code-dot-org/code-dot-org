# Plan: screens are a stack, and each one holds its own words

STATUS: BUILDING, October 2026. Steps 1 and 2 are done. Comes after
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
5. The pause menu and the dialogs as stock screens. Breakout and the
   Notes app move off the `Screens` rule.
6. Deleting what goes, above.
7. The shelf: library entry, demo, tile.
8. Specs: SCREENS_PLAN.md, MODALITY_PLAN.md and WORLD_AS_DATA_PLAN.md
   marked superseded where this replaces them, and this record.

## How it is built

**A screen is a load on the root.** The root already keeps a stack of
loads, oldest first, each closed over the actors it placed (`MapLoad`), and
`unloadNewestMap` already takes the top one off. A screen is such a load
marked as one: the Main Screen's is the bottom, `showScreen` pushes one and
`goBack` pops the top screen with whatever was loaded over it. Until step 6
the old maps over the screen are loads that are not screens, so the pause
menu and the dialogs keep working while the screens arrive beside them.

**Input is `canReach`.** The pointer's hit test, the keyboard's listeners
and the focus route all ask it already (`scripts/rules/pointing`, `input`,
`tabNavigation`). It answers for the top screen: an actor that screen, or a
load over it, placed; and an actor in the World only while that screen
holds a Viewport. The modal walk stays beside it until step 6.

**Drawing leaves a covered screen out of the snapshots.** A screen whose
`backgroundColor` is opaque covers every screen under it, so their actors
are left out of `renderSnapshot` and their Viewports out of
`spaceSnapshot`; the binding already takes away what a snapshot no longer
holds, and a World no Viewport shows is not drawn. A screen's color is a
rectangle the size of the window, put just before its first actor in the
root's draw order. The root's actors draw in the order they were placed,
and the bands give a root object the camera of the Viewport it follows, so
a half-clear screen over a game dims the World's window too. The Main
Screen's color stays the main camera's clear color.

**What was found** (October 2026):

- **The Notes app** (`fixtures/app`) uses the `Screens` rule: two `go to
  screen` and four `go back`, modal maps for its screens, and the
  on-screen keyboard loaded over its form, not modal so the form still
  takes its typing. The keyboard needs input to reach the screen under
  it, which this plan leaves for later.
- **Breakout** brings up the stock pause menu with `load the map named`,
  and the menu takes itself away with `unload this map` and raises `quit`.
- **The stock maps**: Pause Menu, Are You Sure? and Message are modal;
  Keyboard and Tab Bar are overlays. All five are in the library.
- **The lessons**: `place/map` grants `load the map named`, `unload the
  newest map` and the `Screens` rule; `place/script` grants `unload this
  map`. The `Screens` rule has a demo.
- **The Interface Kit** uses none of these; step 5 has nothing to move.
- **The editor** already makes a `.screen` ("New screen" in the place
  switcher) and opens it. A screen other than `main` compiles as a map but
  is not registered by path, so nothing can show it until step 4.

## Learned while building

- **Step 2 marks a load as a screen** (`MapLoad.screen`): `loadScreen`,
  which the Main Screen's module calls, and `showScreen(path)`. `goBack`
  takes the top screen off with every load over it, and never the bottom.
  `load the map named` still puts up a map that is not a screen, so the
  pause menu and the dialogs work as they did until step 5.
- **The World is reached while the Main Screen is on top**, whether or not
  a Viewport shows it, and under another screen only through that screen's
  Viewports. A game's Main Screen always has its Game Viewport, so this
  changes nothing for one; it keeps the tests written as worlds, whose
  level has no Viewport and whose code adds to the World, reaching what
  they add.
- **A screen's color is `WorldMap.backgroundColor`**, kept on its load. An
  opaque one leaves every load under it out of `renderSnapshot` and their
  Viewports out of `spaceSnapshot`; `screenColors` says the rest, and the
  binding paints each as a window-sized rectangle just before the screen's
  first actor, so the bands give it the camera of the Viewport it follows.
- **Compared before and after**: every scenario and lesson draws the same
  and reaches the same, but the random lessons' positions. Nothing shows a
  second screen yet, so seeing one in the browser waits for step 4.

## Not in this plan

- **Pausing what is under a screen.** Later, as a screen's setting.
- **Input reaching screens under the top one.** Later, as a screen's
  setting. The on-screen keyboard is the first thing that needs it.
- **Transitions.** A screen appears and is there.
- **HUD bindings.** A placed actor showing a word its screen can see, set in
  the inspector, is its own plan. It fits this model unchanged.
- **Editing a screen's values and events in the World inspector.** Pending
  from WORLD_AS_DATA_PLAN.md, and needed by step 4's palette only as data.
