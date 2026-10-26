# Plan: an actor's own blocks and events, designed in the Actor Editor

STATUS: BUILT, October 2026. The working record, as the other plans are.

An actor is data and events (SIMPLE_INTERFACE.md), and since
ACTORS_AS_DATA_PLAN.md nothing an actor IS is written as blocks, except
the blocks and events it adds to the language. Those are still roots of
its Code: `define event`, a phrasing and the values it carries, and
`define block`, a phrasing, the values it takes and what it does. This
phase makes both data, shown in the Actor Editor as the blocks they make,
and designed on a page of their own: the block drawn at the top, its parts
as a row of editable chips under it, and, for a block, the workspace of
what it does below that.

It is the first of the `define` blocks to go. The order after it is in
"Not in this phase".

## What exists

- **The design.** `define block` (`world_rule_block`) and `define event`
  (`world_rule_event`) keep their phrasing in `extraState.parts`
  (`BlockPart`, `blockly/extensions/blockDesigner`): words and values in
  order, `{kind: 'label', text}` and `{kind: 'param', type, var, name?,
default?}`. A value's `var` is a workspace variable, which is what a
  block's implementation reads it through. The parts are edited in a
  mutator bubble, a stack of statement blocks in a mini-workspace.
- **The picture.** `FieldBlockPreview` draws the block the design makes, a
  call or a hat, on a private workspace (`FieldBlockDrawing`): shape,
  colour, sockets and names.
- **The implementation's own surface.** The pencil on `define block` opens
  its body on a surface of its own, the head fixed at the top with its
  description, returns and arguments rows (`bodySurfaces`, `bodyOwner`,
  `BlocklyFileEditor.openBody`). An event's surface is its arguments row
  and nothing else.
- **Where an actor's are kept.** Both are in `CODE_ROWS`
  (`actors/actorData`), so the fold keeps them as roots of `data.blocks`
  and the view puts them back under `define actor`. `parseActorOwnMeta`
  reads them from the view; the palette mints the call, the hat and the
  raise from that, and the generator writes `defineAction` and
  `defineEvent`.
- **Who has them.** Ten stock event declarations (Toggle, Slider, Text
  Input, Text Area, Dropdown, the typewriter, List) and eleven actor files
  with a `define block`. No lesson tells a learner to write either in an
  actor.
- **The trail.** The Actor Editor's Code is a script step on it
  (`ScriptStep` `{kind: 'code'}`, `layout/trail`); the breadcrumb goes back
  from it.

## Decisions

- **One list, two kinds.** `ActorData.members: ActorMember[]`, each
  `{id, kind: 'event' | 'block', parts, description?, hidden?, body?}`.
  `parts` are `BlockPart`s, the variable id kept: a block's implementation
  reads its values through it. `id` is the id of the `define` block it
  stands for, kept across saves, so the trail and a rename can name it.
  `body` is the implementation's statement chain, as saved blocks.
- **The view writes them back.** Each member becomes the `define event` or
  `define block` row it was, after the properties, its body in `DO` and a
  workspace variable for each value. `parseActorOwnMeta`, the palette, the
  hats, the call, the raise and the generator read what they read now.
  `world_rule_block` and `world_rule_event` leave `CODE_ROWS`; the fold
  reads either into `members`.
- **A block does something.** Reports-a-value is refused in an actor today
  (`actorBlockReports`); the page offers no `returns` and a member is
  always an action. It comes back when an actor's block can report.
- **The chips are ours.** The design system's Chips are a group of
  checkboxes for picking from a set; a part is a field to edit. Each chip
  is a pill holding a grip and a text field, built on the design system's
  TextField and tokens.
- **A line break is a part.** `{kind: 'row'}` joins `BlockPart`, and is
  written as Blockly's `input_end_row`; the blocks a design makes are
  drawn with their inputs inline, so the block wraps there. A break at the
  start or the end, or after another break, does nothing in the block: it
  may sit there while the parts are arranged, and is dropped when the
  design is saved.
- **A pointer arranges with `@dnd-kit`; the keys arrange by place.**
  dnd-kit's own keyboard sensor moves by geometry, and in a surface that
  wraps "the chip to the right" is sometimes the start of the next line.
  The grip's keys move a chip one place earlier or later in the list,
  which is what the block reads as. DONE in step 3.
- **An actor file may still hold either block.** Neither is offered in
  its drawer, and both are listed in `ESTABLISHED_ELSEWHERE`, which says
  what a file may hold without offering it; the head of a member's page
  is one, and the misplaced-blocks check otherwise disables it and its
  body.
- **Rules keep their blocks.** A rule's `define block` and `define event`
  stay as they are. The page takes parts and gives parts back, so a rule
  can use it later.
- **No migration.** The fold turns any `define` row in an actor's view into
  a member, which covers every actor written as a workspace.

## What is being built

### 1. Members in the data

`ActorMember` in `actors/actorData`; the fold reads `define event` and
`define block` rows, wherever they sit, into `members` (`readMember`), and
the view writes each back (`writeMember`), adding the values' variables to
the workspace's. The Code workspace no longer holds them: the "+" stops
offering "an event of its own" and "a block of its own" in an actor
(`ACTOR_CODE_CHOICES`), and the Actor drawer stops listing both.

Everything that reads parts learns the break: the blocks a design mints
(the call, the hat, the raise) put an `input_end_row` where it is; the
picture draws one; a design's name and its values' names pass over it;
a signature's stack on a body surface offers `new line` for it, so a
rule's `define block` may wrap too.

Tests: List's two events and a stock actor's `define block` round-trip
through the fold and the view, parts, ids and body unchanged; a Toggle
imported has two members and no `define` among its code roots; the hats
and calls those mint are the block types they minted before; the
generated module of a stock actor is byte-for-byte what it was; a design
with a break mints a block with an end-row input there, and the same
design's name, values and generated code are what they were without it;
leading, trailing and doubled breaks are dropped on save.

### 2. Look and Blocks

The main area of the Actor Editor gets two tabs, the design system's Tabs:
**Look**, holding what it holds now, and **Blocks**. A record has no Look,
so it opens on Blocks.

Blocks is two lists, **Events** and **Blocks**, each under a heading. A
row is the member's picture, drawn as it is used (the hat for an event,
"when ⟨Toggle⟩ turned on"; the call for a block, "push ⟨amount⟩ toward
⟨target⟩"), its description under it, and **Edit** and **Delete**. **New
event** and **New block** end their lists. A new member opens at once on
its page, phrased "do something" or "happens".

The picture is a React component (`BlockPicture`) over the drawing
`FieldBlockDrawing` already makes, so the call, the hat and their colours
come from the same code as the toolbox's.

### 3. The page

Edit opens the member's page, a script step on the trail
(`{kind: 'member', id}`): "Hero › push". Top to bottom:

- **The block**, drawn from the parts as they are edited.
- **The palette**, a row of chips to take from: **Word**, one per type a
  value may have (the designer's: what a `let` can hold, an actor, an
  enum, a kind), and **Line break**. A chip is pressed, which puts it after
  the chip with focus, else at the end; or dragged out, which makes it as
  it leaves. The pointer then carries the chip in full, as it carries one
  being moved, and the surface opens a faded place for it before or after
  the chip under the pointer. Let go over the surface, it is kept there;
  anywhere else, nothing is added.
- **The surface**, the design's parts in order, laid out as the block
  will be: left to right, and a new line after each break, each line
  marked as one. A WORD chip is a pill holding its wording; a VALUE chip a
  pill holding its name, with its type beside it as a word and an icon. A
  BREAK is not a pill: a small return mark at the end of its line, since
  it has nothing to edit. One that does nothing where it is is drawn
  faded. Every chip but a break has a grip, which is what is dragged.
  Removing a break joins its line to the one before.
- **The chosen chip's details**, under the surface, for what a pill has no
  room for: a value's type and its starting value, for a type that has
  one, and Remove. Choosing is pressing a chip or focusing it.
- **What it is for**, the description, one line.
- **Shown to other files**, the eye, as a checkbox.
- For a block, **What it does**: the implementation's surface, as the
  pencil opens it now, with the description, returns and arguments rows
  hidden, since the page above holds them. An event's page ends at the
  description.

A design must have a word in it; two values may not share a name; two
members of one actor may not read the same. Each is said on the field at
fault and nothing is saved until it is fixed. A read-only editor shows the
page with every control disabled.

Saving is the Actor Editor's: the page edits the member in the data, and
the body surface writes its chain back through the same seam the pencil
uses.

### 4. Rename and delete

A member's call, hat and raise are named after its words, as a property's
get and set are (`selfProperties`). Changing the words rewrites every use
in every file; Delete first says where it is used, then leaves those
blocks meaning nothing, as a property's delete does (`memberUses`,
`renameMember`, beside `propertyUses`).

The rewrite is made once, when the page is left. A rename replaces the
project, which loads the implementation open on the page again, and doing
that on every keystroke would take the workspace from under the learner.
Until then the uses elsewhere keep the old block types and the game does
not compile; the page is the only place that is true.

A value renamed is matched by its place among the values, and only when
there are as many after as before: one added or taken away is a different
design, whose uses say so in their own editors. A value renamed is two
more rewrites. A block that takes more than one value names a socket for
each (`NAME`, or `NAME_X` and `NAME_Y`), on a call and on a raise alike.
And a handler reads what its event carries as a local of that name below
its hat (EVENT_VALUES_PLAN.md): those getters are moved to a variable of
the new name, made if the file has none, rather than the variable being
renamed, since a variable is shared across the file. A block's value is a
variable of the implementation, so the implementation follows by id.

DONE: rename on leaving, Delete with the question, and focus after a
delete on the row that took its place, else New event or New block.

### 5. Documents and the browser

SIMPLE_INTERFACE.md lists the phase; GLOSSARY.md defines a member; the
README's actor paragraph says where they are made; ACTOR_EDITOR_PLAN.md
points here; the ledger (ACCESSIBILITY.md) takes the section below, with
what the browser showed.

In the browser: the stock Toggle's two events on its Blocks tab; List's
in order; a New event on the Hero, `[amount] of damage taken`, then a
handler for it from the "+" in Code and a raise of it from the toolbox,
carrying a number; a New block, `heal by [amount]`, its implementation
written on its page and called from a rule; each renamed, its handler,
raise and calls following; each deleted, the question naming its uses.

## Accessibility

Built in as the phase goes, not after it. What the page must do:

- **Tabs.** The design system's Tabs give `tablist`, `tab` and `tabpanel`
  with `aria-selected` and `aria-controls`. They do not move between tabs
  by arrow key, so each tab is its own stop; noted, not changed here.
- **The picture is an image named by its reading**: `role="img"` and the
  phrasing as words, values in angle brackets ("when Toggle turned on";
  "push ⟨amount⟩ toward ⟨target⟩"). Its Blockly drawing is hidden from a
  screen reader.
- **A member's row is a list item headed by its reading**, its Edit and
  Delete named for it ("Edit push amount toward target").
- **The palette is a toolbar** named "Parts to add": one stop, the arrows
  move along it, and Enter or Space adds the chip in focus. Each is named
  for what it adds ("Add a number value", "Add a line break").
- **The surface is an ordered list** named "Parts of push", each chip an
  item. A word or value chip is two stops: its grip, a button named for
  the part and its place ("amount, value, part 3 of 5, line 2"), and its
  text field, labelled ("Name of value 3"). A break is one stop, its grip,
  named "Line break, part 4 of 5", and "does nothing here" when it does
  not. The text field's keys stay the text field's; the grip has the
  moving keys.
- **Moving from the keys**: Space or Enter on a grip picks the chip up
  (`aria-pressed`), any arrow moves it one place, Space drops it, Escape
  puts it back. Delete on a grip removes the chip. The grips share one
  description saying so.
- **Dragging is never the only way** (2.5.7): every chip is added by
  pressing it in the palette and moved by its grip's keys.
- **Every change is said** (4.1.3), through the page's polite region;
  dnd-kit's own announcements are silenced and its empty region stays.
  Ours name the line as well as the place ("amount picked up,
  part 3 of 5, line 2"; "amount moved to part 4, line 2"; "amount dropped,
  part 4 of 5"); adding and removing go through the same polite region
  ("Number value added, part 6 of 6"; "toward removed").
- **Focus is placed, never dropped** (2.4.3). A chip added: its text
  field, or a break's grip. A chip moved: its grip, where it now is. A
  chip removed: the grip of the chip that took its place, else the one
  before it, else the palette. Opening the page:
  its heading, the member's name. Back on the trail: the Edit it was
  opened from. A member deleted: the row that took its place, else New
  event or New block. This page closes, for itself, the ledger's "a door
  that opens a file leaves focus behind".
- **Errors are tied to their field** (3.3.1, 3.3.3): `aria-invalid` and
  the message by `aria-describedby`, in words that say what to do ("Two
  values are called amount; rename one").
- **Targets are at least 24 pixels** (2.5.8), the grip and the break's
  mark included.
- **What it does is Blockly**, reached by Tab into the workspace and
  walked by Blockly's own keys; nothing new is added there.
- **Not by colour alone** (1.4.1): a value chip's type is written beside
  its name and shown by an icon, and a faded break is named as doing
  nothing, not only drawn paler; the colours come from the semantic
  tokens.

## Found while building

- **The mini toolbox could not be given by an extension.** Since the
  rebase onto `ngfp/codebridge-package`, `addMiniToolbox` saves whether
  its flyout is open by adding `saveExtraState` to the block, and Blockly
  throws when an extension that is not a mutator does that. World's two
  hat extensions do, so any file holding a contact hat, or a hat whose
  event carries values, took the lab down when it opened. Fixed in the
  blockly package (`remembersOpen: false`, mini-toolbox.md MT-7) and in
  World's extensions.
- **The misplaced-blocks check reads the drawers.** Taking `define block`
  out of the actor's drawer made it something an actor file could not
  hold, and the head of a member's page was disabled with its body. Both
  definitions are listed in `ESTABLISHED_ELSEWHERE`.
- **An inline Blockly drawing measures nothing.** `BlocklyMarkdown` draws
  off the page, where text has no width, and a hat's words came out on
  top of each other. The pictures are read-only workspaces on the page.
- **A design's type is its words.** A value added leaves the block's name,
  and so its type, as they were; the picture is drawn anew for each
  design rather than for each type.

## In the browser

Checked headless, on the dev server: the Blocks tab of the Text Input
and the List; a List block opened, a break, a word and a value added and
the picture, the head and the trail following; a palette chip dragged on
and a chip dragged by its grip; going back by the trail with focus on
Edit; the Text Input's `changed` renamed, its uses found under the new
name once the page was left; a new event with a value, offered in the
actor's own drawer as a hat and a raise. Not yet checked by hand: an
implementation edited on the page and run, and the keys with a screen
reader.

## Open

- **How a line looks.** So far a break's mark ends its line and nothing
  more. A faint rule under each line, or an indent after a break, has not
  been tried.

## Not in this phase

- `define drawing` (86 actor files): "Looks like: a drawing" on the Look
  tab, opening its drawing code the same way. The next step, and mostly
  this one's machinery.
- `define tween` (2): the animation timeline.
- The world file as data, retiring `define world`.
- A Screen's events, which are data already (`ScreenEvent`) and would take
  the same page.
- A rule's `define block` and `define event` on this page.
- Blocks that report a value.
