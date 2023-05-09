# Blockly Manual Testing
Whenever the mainline `blockly` package version is being upgraded, manual testing should be included to ensure there are no regressions or issues with the version bump.

The following is a manual test checklist to follow and may not be extensive:

For all blockly labs, check the following:
- Page loads - check for errors and unexpected warnings in console - keep console open throughout manual testing process. Look out for deprecation warnings.
- Context menu works (copy, duplicate, collapse, expand, disable, delete, paste).
- The different themes are rendered properly (Modern, High Contrast, Protanopia, Deuteranopia, Tritanopia, and each of these can be combined with dark mode). There are 10 different ways to render workspace.
- Drag any block from toolbox. Block connects to other blocks. When you delete the block, the trashcan animates.
- The cursor changes appropriately as you move it throughout workspace, hovering over different types of blocks.
- Click on the 'Show Code' button and confirm generated code looks correct (modal).
- Click and drag a block to replace a ['shadow block'](https://developers.google.com/blockly/guides/configure/web/toolbox#shadow_blocks). Then remove the block and the shadow block is displayed.
- Drag blocks to different locations in workspace, save the program by clicking on 'Run', then refresh the browser. The blocks appear with their x/y positions maintained.
- Drag blocks to workspace but don't attach blocks to the program. When the program is run, an svg frame should surround unused blocks.
- When unused blocks are dragged to a different location in workspace, the svg frame should be removed. The svg frame appears around unused blocks when the program is run.
- Click on the question mark icon of the unused code's svg frame. Check that a callout is displayed and that callout is removed when you click on X.

