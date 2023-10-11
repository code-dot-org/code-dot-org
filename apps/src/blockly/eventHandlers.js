// A custom version of Blockly's Events.disableOrphans that will disable orphans
// while the workspace is dragging. This enables the preview to update as soon as
// a block is dragged, and for a new block to not be enabled until it is attached
// to the main block.
export function disableOrphans(blockEvent) {
  if (
    blockEvent.type === Blockly.Events.BLOCK_MOVE ||
    blockEvent.type === Blockly.Events.BLOCK_CREATE
  ) {
    if (!blockEvent.workspaceId) {
      return;
    }
    const eventWorkspace = Blockly.Workspace.getById(blockEvent.workspaceId);
    if (!blockEvent.blockId) {
      throw new Error('Encountered a blockEvent without a proper blockId');
    }
    let block = eventWorkspace.getBlockById(blockEvent.blockId);
    if (block) {
      // Changing blocks as part of this event shouldn't be undoable.
      const initialUndoFlag = Blockly.Events.getRecordUndo();
      try {
        Blockly.Events.setRecordUndo(false);
        const parent = block.getParent();
        if (parent && parent.isEnabled()) {
          const children = block.getDescendants(false);
          for (let i = 0, child; (child = children[i]); i++) {
            child.setEnabled(true);
          }
        } else if (block.outputConnection || block.previousConnection) {
          do {
            block.setEnabled(false);
            block = block.getNextBlock();
          } while (block);
        }
      } finally {
        Blockly.Events.setRecordUndo(initialUndoFlag);
      }
    }
  }
}
