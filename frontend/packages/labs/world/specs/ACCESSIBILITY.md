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
- **The timeline is a slider** (`role="slider"`, the time as its
  value text), moved by the arrows, Home and End. What it does not say:
  which tracks it has and where their keys are, which are drawn and
  hidden from a screen reader; and Play changes the picture with no word.
- **Each key is a button** named for its track and time and pressed when
  chosen, so the keys a screen reader could not find on the strip are in
  the tab order, one stop each; Alt and an arrow move one, Delete removes
  it. Dragging is never the only way. Not done: a key moved or removed is
  not announced, and focus is lost with a deleted key.
- **The values at the playhead are labelled fields**, and one not keyed
  there says so in words ("Between keys", "Held from the last key"), not
  only in italics. The section is named for the time.
- **Add frames** is the old dialog, keyboard and screen reader as before
  (each cell a button saying which frame it becomes); its frame rate is a
  labelled field that says what it will take when it will not.

### Actors only as data (ACTORS_AS_DATA_PLAN.md)

- **The icon picker is a labelled list of buttons**, each named for its
  icon and pressed when chosen; the picture in each is hidden from a
  screen reader, the name says it. A group of sixteen tab stops, where a
  radio group would be one: noted, not changed.
- **What it is** is a named group: Acts like is a labelled dropdown, Is a
  record a checkbox with its meaning in a line of text after it.
- **A picture is chosen from a labelled list**, in the Actor Editor and
  in the map inspector alike, never typed; the one held is said even when
  the project no longer has it. Not done: the list names files, and says
  nothing of what is in them.
- **A trait's Rule button** is named for the rule it opens ("Open the
  Jumping rule"), beside a Remove named for the trait.
- **The confirm prompt** — asked before deleting an animation, among
  others — is an alert dialog named by its title: the shared prompt
  (`usePrompts`) is the design system's Dialog. Enter confirms, Escape
  cancels.
- **What an actor is for** is said as text beside its name, not offered as
  a control, since it does not change.

### The Rule Editor (RULE_EDITOR_PLAN.md)

- **The side panel is a region** ("Properties and traits") of headed
  sections. Each heading is a button: the rule's name goes back to the
  rule, a trait's opens it, and the one open is `aria-current`.
- **Every control names its property**: a default by the property and its
  kind ("Amount of gravity (number)"), the read-only box by the property
  ("Only this rule sets amount of gravity"), Change and Delete by it.
  Built so after a test found six checkboxes all called "Only this rule
  sets it", which a list of form controls could not tell apart.
- **Focus is placed**: opening a trait, its view's heading; back, the
  trait's name in the panel. A new trait opens with focus on its heading.
- **What a rule declares is listed as text**: its events, blocks and
  steps as they read ("⟨faller⟩ is resting on ⟨ground⟩ — reports a
  boolean"), each a list item under a heading.
- **What it is for** is a native `textarea` with a label, there being no
  design-system one.
- **A member's Edit and Delete are named by how it reads** ("Edit is on
  the ground?, reports a boolean"), and New event and New block sit under
  each list. Back from a member's page puts focus on its Edit; a delete,
  on the row that took its place, else New. The member's page is the
  actor's, with its own ledger below, and adds Reports, a labelled
  dropdown.
- **A step's page** opens with focus on its heading ("Step: applyVelocity");
  its name and when it runs are a labelled field and dropdown, with the
  moment's own summary below them in words. A step's Edit and Delete are
  named for it ("Edit applyVelocity, during push").
- **A trait's Rename and Delete** are named for it ("Rename Acts as
  Ground"); the rename is a labelled field in place, Enter saving and
  Escape not, and the trait stays open under its new name. A delete asks
  first, names what uses it, and puts focus on the rule's name.
- **Untested**: no screen reader; the keys only by tests and a headless
  browser.

### An actor's own blocks and events (ACTOR_BLOCKS_PLAN.md)

- **Look and Blocks are tabs**: the design system's `tablist`, each panel a
  `tabpanel` named by its tab. They do not move between tabs by arrow key,
  so each tab is a stop of its own. Noted, not changed.
- **A member is drawn as an image named by how it reads** ("when Text
  Input changed", "move the highlight by ⟨rows⟩"). The drawing is a
  read-only Blockly workspace, which brings focusable groups and roles of
  its own, so it is hidden and made `inert`. Each row's Edit and Delete are
  named for the reading. The row has no heading of its own; the image's
  name is what says which member it is.
- **An event's page takes focus on its heading** when it opens. A block's
  page is its workspace, with its design above it: focus goes to the
  design's heading when the design opens with the page (a new block, or
  one whose design is wrong), else to "Edit design". Going back,
  by the trail or Back, puts focus on the Edit it was opened from. A member
  deleted puts focus on the row that took its place, else on New event or
  New block. For these doors, the gap "a door that opens a file leaves
  focus behind" is closed.
- **The palette is a toolbar** ("Parts to add"): one stop, the arrows,
  Home and End move along it, and each chip is a button named for what it
  adds ("Add a number value", "Add a line break"). Dragging one onto the
  surface is the pointer's other way; the chip it carries is a picture,
  hidden from a screen reader, and dropping it says and focuses what
  pressing would.
- **The surface is an ordered list** ("Parts of heal"). Each chip's grip
  is a button named for the part, its place and its line ("rows, number
  value, part 2 of 5, line 1"), and "does nothing here" for a break that
  ends nothing; the text field beside it is labelled ("Word, part 1",
  "Name of number value, part 2"). Space or Enter on a grip picks the chip
  up (`aria-pressed`), any arrow moves it one place, Space drops it, Escape
  puts it back, and Delete removes it; one hidden sentence describes each
  grip with those keys. Dragging is never the only way (2.5.7).
- **Every add, move and removal is said** through the page's polite
  region, with the line ("Number added, part 5 of 5, line 2."); typing
  says nothing. dnd-kit keeps an empty live region of its own beside it,
  with its announcements silenced.
- **A problem is said where it is.** A value's is on its field
  (`aria-invalid`, and the message as its description: "Two values are
  called amount; rename one."); one of the whole design ("A design needs a
  word in it.") is an alert. Nothing is written until it is fixed.
- **Not by colour alone**: a value chip writes its type beside its name,
  with an icon, and a break that does nothing is named so as well as
  faded.
- **"Edit design" is a disclosure** at the end of the breadcrumb bar
  (`aria-expanded`, `aria-controls`): in the same place on every page and
  before the page in the tab order. Shutting the design, by it or by the
  design's "Close design", leaves focus on it. The design is a region
  named by its heading, before the workspace in the tab order. The
  workspace keeps a heading for a screen reader ("Block: heal by"),
  hidden from sight.
- **What it does is Blockly**, under a head that is the block itself. A
  value's getter is dragged out of the head's socket with a pointer; from
  the keyboard it is the Variables drawer's, as any local's is.
- **Untested**: none of this has been through a screen reader, and the
  keys have been driven only by tests and a headless browser, not by
  hand. Target sizes are the small IconButton's and the design system's
  small TextField; neither has been measured against 24 pixels.

### Opening a Scroll View (ONE_WORLD_PLAN.md, step 8)

- **Opened by a button and closed by a button or Escape.** "Arrange what it
  holds" is a row of the Scroll View's inspector, and "Done" is in the
  stage's toolbar, in a group named "Inside ⟨id⟩"; both are said aloud
  when used. The arrow keys go round only what an open Scroll View holds.
- **What is outside it is shown faint, and that is all.** The stage is one
  canvas, so the dimming is visual only; the toolbar's group is what says
  a Scroll View is open. (1.3.1 Info and Relationships.)
- **Closed, a row below the window is reached by the arrow keys** and not
  by a pointer, as in the game, where the keyboard reaches a field
  scrolled out of sight.
- **Untested**: not through a screen reader, and the dashed edge and the
  window's foot have not been measured for contrast against the stage.

### A name carried out of what declares it (EVENT_VALUES_PLAN.md)

- **The getter draws the name faint and slanted, and carries a warning**:
  "amount is not known here." The style is visual only; the warning's
  text is what says it. (1.4.1 Use of Color does not apply: no color
  changes.)
- **Untested**: whether a screen reader reaches a block's warning, and the
  faint text's contrast against the getter's fill, which is lower than
  a working getter's by design.

### A hat's values as chips (VARIABLE_OWNERSHIP_PLAN.md, step 5)

- **A chip is taken with a pointer only.** Pressing one drags out a getter;
  there is no key that does it. The `+` on the same hat offers the same
  getters and is the keyboard's way to them, which is why the values stay
  there. (2.1.1 Keyboard, met through the `+`.)
- **A chip is drawn in its getter's colour with white text**, and says the
  value's name, so colour is not the only thing that tells it apart.
- **Untested**: the white text's contrast on each getter colour, and what a
  screen reader says of a chip inside the hat.

### An actor's drawing and steps on pages (DRAWING_PAGE_PLAN.md)

- **Every frame is a headed list on the Blocks tab**, as Events and Blocks
  are: each step a list item that says its name and its moment in words
  ("blink", "each frame, during react"), with Edit and Delete named for it
  ("Edit blink"). New step opens the new one's page; back puts focus on its
  Edit; a delete asks first and puts focus on the step that took its
  place, else New step.
- **A step's page is the rule's** (`StepPageView`): focus on its heading,
  the name a labelled field with Enter saving and Escape not, when it runs
  a labelled dropdown with the moment's summary below in words.
- **The drawing's page takes focus on its heading** ("Drawing: Ball"),
  with one sentence under it saying what the size means.
- **Its size is in sockets on the head**, which only Blockly reaches, as
  any block's socket is. There is no field outside the workspace for it.
  (2.1.1 Keyboard holds as far as Blockly's keyboard does.)
- **The Look tab's drawing controls are buttons and a sentence**: Edit
  drawing, Draw its own or Draw it, Draw as a ⟨Label⟩, and "Drawn as a
  Label is." as text. Giving up a drawing and choosing a picture over one
  ask first.
- **Draw as a ⟨Label⟩ removes the button that had focus**, so focus moves
  to Draw its own, which takes its place. Found writing this entry, and
  closed; seen in the browser. (2.4.3 Focus Order.)
- **Untested**: no screen reader; the keys only by tests and a headless
  browser.

### An actor's tweens on pages (TWEENS_AS_DATA_PLAN.md)

- **Tweens is a headed list on the Blocks tab**, after Every frame and in
  the same component: each tween's name and how long it takes in words
  ("fade away", "over 1 second"), Edit and Delete named for it. Back from
  its page puts focus on its Edit; a delete asks first, names the files
  that play it, and puts focus on the tween that took its place, else New
  tween.
- **A tween's page takes focus on its heading** ("Tween: fade away"); its
  name is a labelled field, Enter saving and Escape not. How long and the
  curve are on the head, a socket and a Blockly dropdown, reached as any
  block's are.
- **`play tween` names another actor's tween by actor and name** ("Pad:
  fade out"), so two tweens of one name on two actors read apart.
- **Untested**: no screen reader; the keys only by tests and a headless
  browser.

### Deleting a game-wide value (the Main Screen's inspector)

- **Each value has a Delete**, named "Delete ⟨value⟩" for a screen
  reader; its visible word is the start of that name.
- **The confirm is inline**, a group named the same, saying which files'
  code uses the value. Focus moves to Cancel, so Enter on a stray Delete
  deletes nothing.
- **After Delete, focus moves to New value**, since the field it came
  from is gone.
- **Untested**: no screen reader; seen by mouse and a headless browser.

### A map's background color (LOOK_PLAN.md)

- **The same field the Main Screen's color is**, a text field labelled
  Background color and a swatch beside it. Emptying the field takes the
  color away; its placeholder says None.
- **Both swatches are named "pick background color"**, so a screen reader
  cannot tell the map's from the screen's by the swatch alone; they are
  never on screen together.
- **Untested**: no screen reader; seen by mouse and a headless browser.

### Putting a kind down, and folding the inspector

- **Escape puts down the kind in hand**, from its tile or from the stage,
  where it is said ("Put down Coin"). Before, only a second press on the
  tile did, and the stage's Escape fell through to nothing.
- **The inspector with nothing selected starts folded** to a head naming
  what it is for (Main Screen, Map, Screen) and a button, "Show ⟨it⟩
  properties", with `aria-expanded`. Open, the same place holds "Hide ⟨it⟩
  properties". The choice is kept in the browser. A lesson's link to the
  game's properties unfolds it.
- **Folded, its fields are not in the page at all**, so a screen reader
  walking the stage meets one button where it met the form. Whether that
  reads as a disclosure is untested.
- **Untested**: no screen reader; seen by keyboard in unit tests and by
  mouse in a headless browser.

### A selection's inspector in the palette's column (SHELL_PLAN.md, step 2)

- **The column is before the map in the page**, so Tab from the map goes
  away from the inspector. I on the map moves focus to its first button,
  Back to the actors, and the canvas's name says so.
- **Back to the actors returns focus to the map**, where the selection
  was; Escape on the map does the same without moving it.
- **The palette is hidden, not removed**, so its tab is kept; while it is
  hidden its tiles are out of the tab order.
- **Untested**: no screen reader. Whether the swap of the column is
  heard at all is open: nothing announces it.

## Not yet done for any phase

- A keyboard-only pass through the shell: the breadcrumb, the palette, the
  switcher, the toolbar, the Actor Editor, docking, and the doors to each
  kind of file (the Pictures, Backgrounds and Themes menus, Rules in Play,
  the sound shelf).
- A screen-reader pass through the same.
- Contrast of the drop-zone tint, the divider and the palette's ring
  against both themes.
