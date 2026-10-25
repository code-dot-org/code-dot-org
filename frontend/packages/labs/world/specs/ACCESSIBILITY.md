# Accessibility: the gaps, as they are found

A ledger, kept as the lab is built. Each phase adds what it found and marks
what it closed; nothing is taken off, so the record says when a gap opened
and what closed it. The floor is WCAG 2.2 AA; criteria are cited where one
plainly applies.

None of this has been tried with a screen reader. Most of it has not been
tried with a keyboard alone. Those two passes are owed for every phase
below, and are listed last.

## What already holds

- **The map stage speaks.** A placement is pixels on a canvas, not an
  element, so the stage announces what keyboard actions did through a
  polite live region: a resize's size, a turn's angle, the box it is in
  (`MapStage`, `say`; specs/BOXES_PLAN.md). The arrow keys cycle the
  selection, Shift and an arrow nudges it, Enter opens its code, Delete
  removes it.
- **The breadcrumb is a list in a `nav` landmark**, the separators hidden
  from assistive technology and the last step marked `aria-current`.
- **Icon-only buttons carry names**: Undo, Redo, the Screen or Map actions,
  every folder button.

## Open

### The Actor Palette and the brush (SHELL_PLAN.md, steps 2 and 3)

- **Nothing can be placed from the keyboard.** A tile takes an actor in
  hand, and only a click on the stage places it; the stage's keys are for
  selecting, and with an actor in hand it ignores them. (2.1.1 Keyboard.)
  Wanted: with an actor in hand, the arrows move a cursor cell and Enter or
  Space places or takes away there, said aloud.
  CLOSED by PURPOSE_PLAN.md, step 5: so they do, and the canvas's name
  says so while an actor is in hand.
- **A stroke is a drag.** Painting a row is one drag; the same row is a
  click per cell, which is the single-pointer way (2.5.7 Dragging Movements
  holds), but slow. Recorded so the keyboard answer above covers it too.
- **Which tab an actor is under is said only by being under it.** The
  tabs are a segmented control; whether a screen reader hears the actors
  change when the tab does is untested.

### The toolbar (SHELL_PLAN.md, steps 4 and 5)

- **Undo says nothing.** The buttons and the keys work, but what was undone
  is not announced, and the stage's region says only what the keyboard
  moved. (4.1.3 Status Messages.)
- **The keys are found only by hovering**, in the buttons' titles. Nothing
  lists them.

### Add Rules in the toolbox (SHELL_PLAN.md, step 6)

- **A button inside Blockly's tree.** It is an ordinary button reached by
  Tab, but where Tab lands relative to the tree's own arrow-key walk is
  untested.

### The Actor Editor (ACTOR_EDITOR_PLAN.md)

- **Focus after an in-place change.** Rename and Delete on a property swap
  its row for a field or a question in place; where focus goes when the
  row comes back, and after the property is gone, is not managed.
  (2.4.3 Focus Order.)
- **The preview is a picture with a name**, and says nothing of what the
  actor looks like beyond it.
- **The "+" between sections**, which is now how an actor's drawing, its own
  blocks and events and its every-frame work are added, is drawn on the
  Blockly canvas; whether it is reachable from the keyboard is untested,
  and was before this phase too.

### Docking (DOCKING_PLAN.md)

- **Docking is a drag, and only a drag.** There is no key and no
  single-pointer way to dock a placement: the zones appear only while
  dragging. (2.1.1 Keyboard; 2.5.7 Dragging Movements.) Undocking has a
  button and a docked side's size has a field, so those two are covered.
  Wanted: a "Dock" choice in the inspector — which edge of the screen, or
  beside which docked placement — doing what a drop does.
  CLOSED by PURPOSE_PLAN.md, step 5: "Dock…" opens a menu of the same
  zones, and a choice is said aloud.
- **A zone is shown only by a tint**, and nothing is said when one is
  entered or when a placement docks. (1.4.1 Use of Color, for the tint
  alone; 4.1.3 Status Messages.)
- **Dragging an Interface Actor out of the palette** (step 9) places and
  docks one in a single gesture. Its keyboard route is two acts: the
  brush and Enter, then Dock…. Both exist, so 2.1.1 holds; the drag is the
  shorter path only for a pointer. The zone it lights is a tint, as above.
- **The line between two sides is grabbed within six pixels.** Small for a
  pointer that is not precise (2.5.8 Target Size is about controls, and
  this is one); the size field is the alternative.
  NARROWED by DOCKING_PLAN.md, step 8: with a docked placement selected,
  each of its movable edges has a grip 28 pixels long, and Alt and an
  arrow moves the line. Unselected, the line is still six pixels.

### Shelves by purpose (PURPOSE_PLAN.md, step 3)

- **"Show everything" changes a list without saying so.** Ticking it
  adds rows under it, and clearing it takes them away, which a screen
  reader is not told; nor is it told how many the box is hiding.
  (4.1.3 Status Messages.) Wanted: the box's label, or a line beside it,
  saying how many more it shows.
- **The fold is not redone.** The checklist decides which groups are shut
  when it first draws; "Show everything" then adds up to 29 rows open,
  which is a long walk by Tab.

### Placing and docking from the keyboard (PURPOSE_PLAN.md, step 5)

- **The cursor is found only by being moved.** It starts in the middle of
  the map on the first arrow, and nothing says where it is before then;
  Enter before any arrow does nothing, silently.
- **Placements are named by their ids** in the Dock menu ("Above
  HealthBar"), which are what the inspector shows but not always what a
  learner would call them.
- **Reaching the stage from a tile is a walk by Tab** past the rest of the
  palette; taking an actor in hand does not move focus to the stage, which
  is right for a pointer and long for a keyboard.

### Finishing the shell (SHELL_FINISH_PLAN.md)

- **A place's picture in the switcher has no text of its own**: the name
  under it labels the button, and the picture is decorative (`alt=""`).
  What the place holds is not said.
- **Layers in front vanish without a word** when a layer is pressed in
  the strip; only the box "Show all layers" says they can come back.
- **A camera's inspector takes the place of its owner's, and focus is
  not moved**: pressing a row of the camera list, or Add a camera, removes
  the button that was pressed, so focus falls to the page; Close and
  Remove this camera do the same coming back. Focus should land on the
  camera inspector's heading going in, and on the camera's row (or Add a
  camera) coming back.
- **A door that opens a file leaves focus behind**: Edit picture, Edit
  background, Edit theme, an effect's Edit, a rule's Open, and every New
  that opens what it made put another editor in front, and focus stays on
  the page rather than moving into it or to its breadcrumb. Nothing is
  said, either; the breadcrumb changing is the only sign.
- **The effect row's More and the sound shelf's Rename and Delete are
  small text buttons in a dense row**; their names say whose they are
  ("More for Glow", "Rename coin.mp3"), but their targets are under 24
  pixels tall at the extra-small size.
- **No single place lists a kind's files** now the folder buttons are
  gone: pictures are reached through an actor's look or a background
  field, effects through an actor's Effects tab. A learner who knows a
  picture's name but not what uses it has no list to search. Rules
  (Rules in Play) and sounds (the sound shelf) still have one.
- **`set sprite`'s open button is an icon in a Blockly field**, named by
  its tooltip ("Open the file this comes from") as `use trait`'s is; it is
  reached from the keyboard only as any Blockly field is, which no pass
  here has checked.

### Animations on the actor (ANIMATION_PLAN.md)

- **The animation row's buttons say which is chosen** (`aria-pressed`)
  and Main says it plays "when made"; the preview of the chosen one is an
  image named for it ("Pilot, Fly at its start"). Choosing one changes the
  picture and says nothing else.

## Not yet done for any phase

- A keyboard-only pass through the shell: the breadcrumb, the palette, the
  switcher, the toolbar, the Actor Editor, docking, and the doors to each
  kind of file (the Pictures, Backgrounds and Themes menus, Rules in Play,
  the sound shelf).
- A screen-reader pass through the same.
- Contrast of the drop-zone tint, the divider and the palette's ring
  against both themes.
