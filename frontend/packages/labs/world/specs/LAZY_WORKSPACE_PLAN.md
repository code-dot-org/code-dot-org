# Plan: a workspace of top blocks, their bodies built on demand

STATUS: BUILT. All three steps, each seen working in the browser.

## What is being built

A file's workspace holds its top blocks — the `define …` blocks and the
event hats — and nothing else. Each sits where a column layout puts it, and
each can be collapsed to its first row. A collapsed top block's BODY is not
built at all: it is kept as the JSON it was saved as, and becomes blocks
only when the learner expands it.

- **No free-floating blocks.** A block alone on the canvas means nothing:
  the generator ignores it and an orphan plugin disables it. A block dropped
  on empty canvas is deleted, as one dropped on the toolbox is, and undo
  brings it back.
- **One column instead of tidying.** The editor places every top block,
  in file order, definitions first, in a single column, so a file reads top
  to bottom as one list. (Built as columns first — the definition alone and
  the handlers beside it — and made one column in Oct 2026: a file read in
  two directions was harder to follow than a long one, now that a long one
  collapses to its headers.) Expanding, collapsing or editing one moves only
  the blocks below it. This replaces `tidyLayout`, which measured what had loaded and
  rearranged it only when something overlapped.
- **Bodies on demand.** A large file opens collapsed, and only its top
  blocks are built. A small one (under about forty blocks) opens expanded.
  What is expanded is remembered per file for the session.

## Why it can be lazy

What a file MEANS is already read from its JSON: the generator builds a
hidden workspace from the saved file, and the rule, property and map readers
never touch a live block. What needed live blocks was the editor's own
questions about what a file declares — which layers, which cameras, which
variables are written, how big the map is — and most of those declarations
are rows inside a `define world` or `define actor` body. A dropdown drops a
stored value its options do not hold, so a layer declared in an unbuilt body
would be rewritten out of every block that names it.

So those questions are answered by a WORKSPACE INDEX
(`blockly/workspaceIndex`), which reads the live blocks AND the JSON of every
body not yet built. The JSON is the one source of truth, as it already is for
the compiler and the map editor.

Not moved, and why:

- The generator's own walks (`layerOf`, `manyActorVariables`, the camera and
  layer value resolvers when generating): it builds a complete workspace.
- Redraw passes (`refreshActorPictures`, `redrawLiveDropdowns`,
  `refreshMissingRuleWarnings`, `refreshBlockDesigns`): a body built later
  runs its extensions as it is built.
- Top-block queries: top blocks are always built.

## Reordering — BUILT

Picking up a top block on the file collapses every section to its header —
the one picked up too — so the file is a short list and the choice is
between two headers. The headers part where letting go would put it: each
frame the dragged header's middle is compared with theirs
(`tidyLayout.gapIndexFor`) and the ones below it move down by its height
(`headerPlaces`), silently. The column is shifted so it opens around the
dragged header where it was picked up, so a section dragged from far down a
long file still has its neighbours in view.

Letting go on the file puts it in the gap shown: that order becomes the
remembered one, the sections that were open are built again, the column is
laid out, and the view goes to the section that moved. Letting go on the
toolbox or the bin deletes it, as before; its body goes aside with it, and
undoing brings it back where it was and open, as it was picked up.

All of it is silent except the drop itself, which is the one undo step a
move always was. A section dragged in fresh from the toolbox is handled the
same way, since a hat dragged out is a top block being placed.

## The definition stays first — BUILT

`define actor`, `define world`, `define rule` and `define map` are what
their file is, so the block is held first and in place: it cannot be
dragged or deleted, the layout puts it at the top whatever else says, and
while another section is dragged no gap opens above it (`pinnedRoots`). A
rule's traits and an actor's handlers move freely below it.

Imperative, as a body surface's head is: Blockly writes `movable: false`
and `deletable: false` into what it saves for such a block, and every save
takes them back out (`withoutPins`), so the file says what it did before.

## Adding a section — BUILT

A "+" sits in each gap down the column and after the last section — never
above the file's own definition. It opens the events this file's toolbox
offers, grouped by drawer and worded as each hat reads (`when … is
clicked`), and picking one adds that section at the gap: an edit, one undo
step, laid out where it was put and brought into view
(`eventChoices.eventChoicesIn`, `addSectionButtons`). The "+" is SVG in the
workspace's own canvas, so it scrolls and zooms with the blocks; it is not
drawn on a body surface, in a read-only file, or while a section is being
dragged.

The map inspector has the quick version for one placement: a bolt beside
Code opens the events an actor of that kind can actually hear — its own,
its parents', and those of the traits it holds, the built-in rules'
reaching through their one trait (`eventChoicesForKind`). An event of a
trait the kind does not hold is not offered: its handler would never run.
Picking one puts the hat first in that placement's own code and opens it.

THE "+" AND THE TOOLBOX NARROW THE SAME WAY where the code is about one
kind: in an actor's own file, and in a placed actor's code. A handler's
subject is that actor and nothing else (specs/EVENTS.md, "Whose event"),
so an event it cannot hear is left out of the toolbox too — a Button's
List drawer keeps the List's properties and loses its events. Only left
out: the blocks stay defined, and the misplaced-block check still counts
them as offered, so a file that holds one loads and compiles as before. Both ask `kindEvents`,
which the quick add asks too, so the three lists cannot drift apart. A
world's "+" offers every event: its handler names a kind after it is
added. Nor is a kind offered another kind's OWN events, declared in that
kind's file: they belong to no rule, and were once let through as though
they were the language's own — a Button was offered the Slider's
`changed`.

## One actor's code is sections too — BUILT

The map editor's view of one placement's code, or the map's own
(`mapEditor/PlacementScriptEditor`), is a workspace of its own and not the
file editor: a placement is a subtree of a map document, not a file. What
makes a workspace sections is shared between the two
(`blockly/useSectionWorkspace`): the column layout and its memory of the
order, bodies held unbuilt behind each header's chevron, dragging a header
to reorder, the "+" in every gap, deleting a block let go of on its own,
and the undo and copy that know about held bodies. Each editor hands its
documents through the hook on the way in and saves through it on the way
out; what the file is, and what else the editor shows, stays with the
editor. Which sections a placement's code had collapsed is remembered for
the session under the map file and the placement.

A placement's code has no definition at its head, so the first "+" sits
above its first section. Half a gap above it was above the canvas's top
edge, which the view does not scroll past; it is held at least half the
margin down (`tidyLayout.gapCenters`).

## Jumping to a section — BUILT

Collapsed, a file reads as a list of headers; a long one still had to be
scrolled to find the handler wanted. A "Jump to…" button over the workspace's
top right corner lists them in the column's order, each named as its
header reads (`sectionOutline`): its words, the shown text of its
dropdowns, and what sits in its sockets, but not its body. Picking one
opens it if it was collapsed and scrolls its header to the top of the view
— as far as the content allows, so the last section comes up only until
the column's end is at the bottom — and selects it. A menu, so it is
reached and worked from the keyboard. Offered in a read-only file too; not
on a body surface, which is not a list of sections.

## Order of work

1. **The index.** `workspaceIndex` over live blocks and unbuilt bodies; the
   layer and camera dropdowns, their deleted-declaration checks, variable
   scope and the map grid size moved onto it. No visible change. Tested by
   taking a body out of a loaded workspace, holding it as JSON, and getting
   the same answers.
2. **The layout.** Columns placed by the editor; free-floating blocks
   deleted on drop; `tidyLayout` and the editor's tidy pass retired.
3. **Lazy bodies.** The collapse/expand control on each top block; bodies
   held as JSON until expanded; saving writes them back unchanged; a
   variable rename rewrites them; expanding and collapsing are not edits and
   not undo steps; a lesson's "show me" expands what it points into.

## Commits

- `20af30a3f87` — step 1, the workspace index.
- `37e18e12103` — step 2, the layout and no free-floating blocks.
- step 3, bodies built on demand.
- the sections shared with one actor's code in the map editor.
- jumping to a section from a list.

## Learned while building

- **The layout's moves are silent, and that is enough to keep the order.**
  A move is an edit, an undo step and a restart of the running world, so the
  layout makes its moves with events off. The file keeps its old positions
  until the learner's next edit saves the workspace as it stands — and the
  layout reads ORDER off positions, column by column, so the positions a
  file holds still read in the order the layout made. A dropped handler is
  saved where it was dropped, between the ones it went between.
- **A free-floating block goes in the drag's own event group.** Deleting it
  as a separate step would make undo bring back a block alone on the
  canvas; in the drag's group, one undo puts it back where it was taken
  from. Seen in the browser: a row dragged out of `define world` onto empty
  canvas is gone, and Ctrl+Z puts it back in the stack.
- **The file never knows, and a test holds it to that.** A collapsed body
  is spliced back into its top block on every save — `readFile`, the
  interface kept for a body surface, a block's copy for the clipboard — so a
  collapsed workspace saves exactly the file a built one would
  (`lazyBodies.test`). Seen in the browser: with `define actor` collapsed, a
  score changed elsewhere saved, the game restarted with every trait of the
  Player intact, and the file reopened collapsed as it was left.
- **Every way into the interface strips, or a body is built twice.** The
  way Back from a body surface loaded the interface directly, not through
  `showFile`; a whole interface loaded there built bodies the store still
  held, and the next save would have written them twice. All three loads
  now go through `stripCollapsed`.
- **Stock files have no block ids.** A body is put back by its top block's
  id, and every stock file is generated without them, so the first try left
  every stock file built. A top block without an id is given one by its
  POSITION (`top-0`), which names the same block each time the file is read
  — on a reload, and when it is opened again this session — until a save
  writes it in.
- **Undo expands what it is about to change.** Blockly passes over an event
  whose block it cannot find, so undoing a change inside a body collapsed
  since would do nothing, silently. The editor's undo looks at the group it
  is about to run and builds any held body holding one of its blocks first.
- **A collapsed block's copy carries its body.** Blockly copies what is
  built; each top block's `toCopyData` is wrapped once to put its held body
  into what it hands the clipboard.
- **Measured.** The Text Area actor is 848 blocks. Opened in the Interface
  Kit before this, it built 450 block groups in 2.4 s; now it builds 21 —
  its top blocks — in 1.3 s, and reads as a list of what the actor answers.

- **Order is remembered, not read off positions.** The layout first read
  the order of the top blocks off where they sat, every time. Blockly moves
  blocks on its own: expanding a body connects it, and Blockly then nudges
  apart what overlaps — `define actor` included — so a nudged definition read
  as last and was laid out at the bottom (reported from the browser). The
  editor now remembers each top block's place: seeded from the file's
  positions as saved, before anything moves a block, and kept across its own
  reloads; only a top block the LEARNER moved — a drag, a paste, an undo, but
  not a move whose reason is `bump` — is placed by where it now is
  (`tidyLayout.orderKeys`, `placesOfDocument`).
- **A reload takes the controls away.** The show/hide control is not part of
  the file, so any reload builds blocks without it. The font and locale
  reloads — a save and a load to re-measure — did not lay out afterwards, and
  on a fresh page the fonts land after the file has opened: a large file
  showed its headers with no way to open them until a tab switch reloaded it
  with the fonts already there (reported from the browser). Both reloads now
  run the layout, which puts the controls back.

## Not built, and known

- **The size rule counts blocks, and the eye counts height.** A rule file's
  `define block` bodies live on their own surfaces already (the body seam),
  so Gravity's interface is 24 blocks and opens expanded, though its rows
  are tall and wide and it fills more than a screen. Rendered height would
  be the better measure; it needs a render before the decision, which is
  what this is avoiding.
- **Button order on a rebuilt row.** A `use trait` row built by an expand
  wears its open and lesson buttons in the other order from one built on
  load: two extensions add them, and which runs first differs. Cosmetic.
- **A lesson's "show me" into a collapsed body.** No place a lesson points
  at is inside a body today (they ring toolbox drawers and map controls),
  so nothing expands for one. A reveal that pointed into a body would have
  to call `expandHolding` first.
