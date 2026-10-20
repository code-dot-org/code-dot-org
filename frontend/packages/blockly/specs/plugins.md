# Plugins

Workspace behaviours ported from apps' Blockly layer
(`apps/src/blockly/`), each offered for a lab to opt into: scrolling
(part 10), the toolbox trashcan (part 11), and block limits, disabled
orphans and grayed undeletable blocks (part 12).

## Scrolling

Apps' workspaces have no permanent scrollbars. Content starts at the top
left; the workspace scrolls only to blocks outside the view; the wheel
pans it; and dragging a block to the edge scrolls toward it. A lab gets the
same with three pieces, all given at injection:

```ts
<BlocklyWorkspace
  options={{
    move: {scrollbars: true, wheel: true, drag: true},
    plugins: {
      metricsManager: TopLeftMetricsManager,
      blockDragger: ScrollBlockDragger,
    },
  }}
  plugins={[scrollOptionsPlugin]}
/>
```

### Why it exists

Blockly's own workspace lets content be scrolled half a view past every
edge and always shows both scrollbars. Students moving between apps' labs
and these would find blocks drifting and scrollbars that apps never shows.

### Requirements

PLG-1. `TopLeftMetricsManager` is a Blockly metrics manager, a subclass of
`@blockly/plugin-scroll-options`' `ScrollMetricsManager`, which keeps the
content's size fixed while a block is dragged. A workspace uses it when its
inject options name it as `plugins.metricsManager`.

PLG-2. Left to right, the scroll area runs from 0, at the top and left, to
20 pixels past the content's right edge and 100 past its bottom, or to the
view's right and bottom edges where those are further. So content that
fits leaves nothing to scroll, and a workspace cannot be scrolled above or
left of its origin. These are apps' figures
(`apps/src/blockly/addons/cdoMetricsManager.ts`).

PLG-3. Right to left, the scroll area runs from 20 pixels left of the
content, or the view's left edge where that is further left, to the view's
width; top and bottom are as in PLG-2.

PLG-4. `hasFixedEdges()` is true left to right and false right to left. Apps
turns fixed edges off right to left because, with them, Blockly bumps
blocks under the toolbox when the window is resized (Blockly issue 8637).

PLG-5. `@code-dot-org/blockly/plugins/scrollOptions` exports, as default,
an inject plugin (DEF-26). When constructed for a workspace it installs
`@blockly/plugin-scroll-options`: wheel scrolling on that workspace, and
edge scrolling for blocks dragged with `ScrollBlockDragger`, which starts
as the cursor nears the edge whatever the size of the block
(`oversizeBlockThreshold: 0`). The edge-scroll settings belong to
`ScrollBlockDragger` itself, so they are the same for every workspace on
the page. Once the workspace is laid out (`onReady`) the plugin calls
`initializeScrollbarPair`.

PLG-6. `initializeScrollbarPair(workspace)`, from
`plugins/scrollOptions/scrollbar.ts`, does nothing unless the workspace has
both scrollbars. Otherwise it unpairs them, so that Blockly shows each only
while content overflows its axis, and hides each whose content now fits.
Blockly declares a scrollbar's pairing read-only; this writes it anyway, as
apps does (`apps/src/blockly/addons/cdoScrollbar.ts`).

PLG-7. The package re-exports `ScrollBlockDragger` from
`@blockly/plugin-scroll-options`, so a lab names it without depending on
that package. Apps' `CdoScrollBlockDragger` exists only to give an older
version of that package the dragged block's workspace; the version here
reads it already.

### Test vectors

PLG-V1 (PLG-2). For a view at (0, 0) of 800 by 600, content at (16, 16) of
200 by 50 pads to `{top: 0, left: 0, bottom: 600, right: 800}`.

PLG-V2 (PLG-2). For that view, content at (16, 16) of 1000 by 700 pads to
`{top: 0, left: 0, bottom: 816, right: 1036}`.

PLG-V3 (PLG-6). A workspace of 800 by 600 with both scrollbars and no
blocks has neither visible after `initializeScrollbarPair`; a block moved
to (16, 2000) and a resize make only the vertical one visible.

### Not specified here

- Apps' extra scroll height below the content for Dance Lab's overlay
  (`Blockly.extraScrollHeight`), which is not ported.
- Wheel and edge scrolling themselves: `@blockly/plugin-scroll-options`.

### Open questions

1. PLG-5: the plugin has no `onDispose`, and nothing restores
   `ScrollBlockDragger`'s settings. Should disposing it undo them?
2. The three pieces only work together. Should the plugin's README entry,
   or a helper returning the inject options, say so where a lab looks?

## The toolbox trashcan

Apps has no trashcan on the workspace. While a student drags a block out
of the workspace, the toolbox's contents give way to a trashcan, and a
block dropped there is deleted. `@code-dot-org/blockly/plugins/toolboxTrashcan`
is that trashcan (`apps/src/blockly/addons/cdoTrashcan.ts`).

### Why it exists

Students learn to throw blocks away by dragging them back to where they
came from. A lab without this either deletes silently over the toolbox, as
Blockly does, or shows Blockly's trashcan in a corner apps never uses.

### Requirements

PLG-8. The module exports, as default and as `plugin`, an inject plugin
whose class is `ToolboxTrashcan`, a Blockly `DeleteArea`. Constructed with
a workspace and theme, it inserts an SVG element, hidden, just before the
workspace's SVG, positioned over the toolbox: as tall as the view, as wide
as the toolbox (`getToolboxWidth`: the category list's width, the flyout's
for a toolbox without categories, or 0 without a toolbox), at the left, or
right to left at the view's width. It registers itself with the
workspace's component manager as a delete area, a drag target and a
positionable element, under the id `toolboxTrashcan-` and the workspace's
id, with weight -1, so that it, not the toolbox, receives
drags over the toolbox. Blockly repositions it when the workspace resizes.

PLG-9. The trashcan is a body and a lid drawn as SVG shapes, filled with
the theme's `trashcan.fill`, centred across the container and 40 pixels
from its top, with a red circle and bar over it for "not allowed". Apps
draws the same shapes from its sprite image instead, `trash.png` or
`trash_dark.png`.

PLG-10. On a block drag's start, unless the drag began in a flyout, the
trashcan's container is shown and the toolbox's contents hidden: every
flyout workspace not inside a block field
(`.blocklyFlyout:not(.blockFieldFlyout) .blocklyWorkspace`) and every
category list (`.blocklyToolboxCategoryGroup`) within the workspace's
injection element. On the drag's end the container is hidden and they are
shown. Other events change nothing. Apps looks for these in the whole
document, so a drag in one of its workspaces hides every toolbox on the
page.

PLG-11. While the container is shown, the "not allowed" mark is shown if
any dragged block can be neither deleted nor is a shadow block. Blockly
reports a shadow block as undeletable although it is deleted with its
parent.

PLG-12. The lid opens while a block that would be deleted is over the
trashcan, and closes when the block leaves, or 100 milliseconds after it is
dropped; apps closes it at once on a drop. It swings to 45 degrees in
fifths, 20 milliseconds apart, hinged on the side away from the toolbox,
while the trashcan's opacity goes from 0.8 to 1.

PLG-13. `dispose()` cancels any lid animation, removes the trashcan from
the component manager, removes its change listener, and removes its
container from the page. A workspace's own trashcan, if it has one, is
left as it was, and the workspace may have another `ToolboxTrashcan`
afterwards. Apps' trashcan lives as long as the page and has no `dispose`.

### Test vectors

PLG-V4 (PLG-10). With a categorized toolbox, a drag start of a workspace
block sets the category list's visibility to `hidden`, and the drag's end
sets it to `visible`.

PLG-V5 (PLG-11). A drag of one deletable and one undeletable block shows
the "not allowed" mark.

### Not specified here

- Deleting the dropped block, which Blockly does for any delete area.
- Blockly's own trashcan, which a lab may still turn on with the
  `trashcan` inject option.

### Open questions

1. PLG-9: draw apps' sprite instead, so the two look the same?

## Block limits

A level may allow only so many blocks of a type. Each such block in the
flyout wears a bubble with the number the student may still add, and a red
`!` once they have added too many. `@code-dot-org/blockly/plugins/blockLimits`
is apps' feature (`apps/src/blockly/utils/legacy/blockLimits.ts`,
`updateBlockLimits` in `apps/src/blockly/eventHandlers.ts`).

### Why it exists

Levels teach economy, or a loop in place of repetition, by allowing few
blocks. Their toolboxes state the limits, and a lab that ignored them would
let a student solve such a level the way it means to rule out.

### Requirements

PLG-14. `new BlockLimitMap(items, theme)` reads a limit for each block
item of `items` that has `extraState.limit`, under the item's `type`. It
reads only the items it is given, not those inside categories. The
plugin gives it the workspace's toolbox contents
(`options.languageTree.contents`).

PLG-15. The map counts blocks per limited type, each count starting at 0:
`set`, `increment`, `get` (0 for an unknown type), `clear` (every count back
to 0), `size` (the number of limited types), `has(type)`, and
`limitFor(type)`, which is the type's limit, or `Infinity` for a type
without one or with a limit of 0. `remainingFor(type)` is the limit less the
count, and `anyOver()` is true while some count exceeds its limit.
`indicatorFor(type, block)` makes, once for each type and block id, the
indicator of PLG-16 on that block, and returns the same one after.

PLG-16. A `BlockLimitIndicator` is a rounded bubble drawn in the block's
SVG, centred on its top left corner: 18 pixels across, or wider for a longer number. It
shows the remaining count in the theme's `blockLimits.indicator` colours,
or `!` in its `blockLimits.overLimit` colours when the count is negative.

PLG-17. The module exports, as default and as `plugin`, an inject plugin.
When the workspace changes a block, moves one, changes theme, or finishes
loading, and once the workspace is laid out, it counts the workspace's
enabled blocks of each limited type, and updates the indicator of each
limited block in the workspace's flyout, making one where there is none.
Creating or deleting a block does not, by itself, update them. A toolbox
with no limits does nothing.

### Test vectors

PLG-V6 (PLG-17). A flyout of one `text_print` with `extraState: {limit: 2}`
shows `2`; after an enabled `text_print` is added and moved, `1`.

## Disabled orphans

A block not attached to the program's top block does not run. Apps
disables such orphans as soon as they come loose, and draws them faded.
`@code-dot-org/blockly/plugins/disableOrphans` is apps' `disableOrphans`
(`apps/src/blockly/eventHandlers.ts`), with Blockly's own
`Events.disableOrphans` behind it.

### Why it exists

Students see at once which blocks will run. Blockly's own handler does
nothing while a drag is under way, so a block only fades once dropped, and
it does not survive procedure renames, which enable every call block.

### Requirements

PLG-18. The plugin is an inject plugin whose change listener is
`disableOrphans(event)`. When a block is created or moved, or reports
changing from disabled to enabled, the block is passed to
`updateBlockEnabled(block)`: under an enabled parent, the block and all its
descendants lose the disabled reason; otherwise, if it can attach to
anything (it has an output or previous connection), it and the blocks after
it gain it. The reason is Blockly's `MANUALLY_DISABLED`, the reason a
student's own "Disable Block" sets. The block's opacity is then 0.5 if it
is disabled and has no parent, and its default otherwise.

PLG-19. A block reporting that it went from disabled to enabled is checked
again, so that a call block a procedure rename enabled is disabled again if
it is loose (blockly-samples issue 2035).

PLG-20. When a procedure definition (`procedures_defnoreturn`) is dragged,
`disableOrphanBlocks(workspace)` runs: every top-level
`procedures_callnoreturn` is disabled with the reason `ORPHANED`, and
every top block is passed to `updateBlockEnabled` with the reason
`ORPHANED`, and has its opacity reset.

## Grayed undeletable blocks

A level's start blocks may be fixed in place or made undeletable. Apps
grays the undeletable ones, so a student sees that they belong to the
level. `@code-dot-org/blockly/plugins/grayOutUndeletableBlocks` is apps'
`handleGrayUndeletableBlocks` (`apps/src/blockly/eventHandlers.ts`).

### Requirements

PLG-21. The plugin is an inject plugin whose change listener is
`grayOutUndeletableBlocks(event)`. When a block is created, it and every
block created with it, and when a block changes, that block, are colored
`#888` if they cannot be deleted, can be moved, and the workspace is not
read-only.

### Not specified here

- How a level's toolbox comes to carry `extraState.limit`: `xml-toolbox.md`.
- What a lab does once `anyOver()` is true, such as refusing to run.

### Open questions

1. PLG-14: apps finds limits on blocks at any depth of the toolbox. Read
   inside categories?
2. PLG-15: a limit of 0 means no limit. Should it mean none may be used,
   as in apps?
3. PLG-17: count on creation, as apps does, and on deletion, which apps
   does not?
4. PLG-18: use `ORPHANED` throughout, as apps does, so a student's own
   "Disable Block" survives attaching the block?
5. PLG-21: apps grays every undeletable block except `when_run` and
   procedure definitions, movable or not, in `#808080`, and again on
   loading and on selection. Match it?
