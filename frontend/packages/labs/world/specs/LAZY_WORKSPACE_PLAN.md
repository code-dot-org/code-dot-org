# Plan: a workspace of top blocks, their bodies built on demand

STATUS: BUILDING. Steps 1 and 2 built; step 3 next.

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
- **A column layout instead of tidying.** The editor places every top block,
  in file order, definitions first, in columns as wide as the editor allows.
  Expanding, collapsing or editing one moves only the blocks below it in its
  column. This replaces `tidyLayout`, which measured what had loaded and
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
- step 2, the layout and no free-floating blocks.

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
