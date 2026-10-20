# Flyout

`BlocklyFlyout`: a panel of blocks, outside any workspace, from which a
student drags blocks into the provider's main workspace.

## Why it exists

Blockly's flyouts belong to a workspace and sit at its edge. Instructions
and other panels need to offer blocks where the text is: "drag this block
into your program". Apps has no counterpart; its instructions show
pictures of blocks. Markdown with embedded blocks (`markdown.md`) is built
on this.

## Requirements

FLY-1. `<BlocklyFlyout blocks>` renders a `div` with `role` `region`, a
named landmark, and `aria-label` `Block palette`. `label` replaces the
name, and `containerRole: 'group'` makes it a group, which screen readers
announce but do not list among a page's landmarks. With `inline`, it is an
`inline-block` `span` aligned to the middle of the text, so that it can sit
within a paragraph. `className` goes on the element.

FLY-2. It needs a `BlocklyProvider` ancestor (WS-26) and shows nothing until
the provider has a main workspace and the element is in the document,
checking once per animation frame. It then makes a Blockly vertical flyout
with the main workspace's options, direction and current theme, inside the
element, and initializes it against the main workspace: a block dragged
out is created there, at the drop point. The flyout is as tall and wide as
its blocks, sits at the element's top left, does not scroll, and stays open
after a drag.

FLY-3. The element takes the classes of the main workspace's injection
element, so that the blocks' text has the main workspace's font and
colours, and so that Blockly's focus and coordinate code, which looks for
`injectionDiv`, treats the flyout as part of a workspace. With `inline`,
the flyout's background is transparent.

FLY-4. Once the page's fonts have loaded, and whenever the Driver's theme
changes, the flyout's blocks are measured and drawn again and the flyout
resized; on a theme change the flyout's workspace first takes the new
theme. Blockly does neither for a flyout outside the workspace.

FLY-5. When `blocks` changes, the flyout shows the new blocks.

FLY-6. A key pressed in the flyout, except Escape, goes to Blockly's
shortcut registry for the flyout's workspace, so that the keyboard moves
between its blocks and places one in the main workspace (WS-29). Blockly
listens for keys only on a workspace's injection element, which the flyout
is outside. Escape is left to the flyout.

FLY-7. While a block is dragged from the flyout, a copy of it follows the
pointer above everything on the page, because the real block is drawn in
the main workspace's drag layer and hidden until it reaches the
workspace. The copy appears once the pointer has moved 3 pixels, is gone
when the pointer is released or the drag cancelled, takes no pointer
events, and carries no ids, tab stops or roles, and is hidden from screen
readers, so nothing mistakes it for a block.

FLY-8. `workspaceRef` receives the flyout's workspace once it is made, and
`null` when the component unmounts.

FLY-9. On unmount the flyout's workspace releases focus (WS-12) and the
flyout is disposed.

FLY-10. When the main workspace the flyout targets is removed, as when the
`BlocklyWorkspace` remounts, the flyout is disposed as on unmount (FLY-9)
and made again, as in FLY-2, once the provider has a main workspace again.
Each flyout is drawn in an element of its own within the component's,
since disposing a flyout removes the element that holds it.

## Test vectors

FLY-V1 (FLY-6, FLY-9; WS-V5). With a flyout of one `text` block, Down then
Enter in the flyout places a `text` block in the main workspace, still
moving; unmounting then leaves Blockly's focus manager with no focused
node.

FLY-V2 (FLY-1). A flyout with no `label` is a `region` named
`Block palette`.

FLY-V3 (FLY-10). With a flyout beside a `BlocklyWorkspace` whose `key`
changes, the flyout's workspace targets the new main workspace and still
holds its block.

## Not specified here

- The blocks, which are the provider's (WS-17).
- Embedding flyouts in markdown: `markdown.md`.

## Open questions

1. FLY-5: a `blocks` array written inline in a lab's render is new on every
   render, so the flyout re-shows its blocks each time. Compare contents?
2. The first browser run after the test dependencies are rebuilt has seen
   the theme test (FLY-4) fail once, on the font size; it has passed on
   every run since. Is the high-contrast font still loading then?
