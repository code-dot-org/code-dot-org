import * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

export function disableOrphanBlocks(eventWorkspace: BlocklyCore.Workspace) {
  // When a function definition is moved, we should not suddenly enable
  // its call blocks.
  eventWorkspace.getTopBlocks().forEach(block => {
    if (block.type === BLOCK_TYPES.procedureCall) {
      block.setDisabledReason(true, 'ORPHANED');
    }
    updateBlockEnabled(block);
  });
}

export function updateBlockEnabled(block: BlocklyCore.Block) {
  // Changing blocks as part of this event shouldn't be undoable.
  const initialUndoFlag = Blockly.Events.getRecordUndo();
  try {
    Blockly.Events.setRecordUndo(false);
    const parent = block.getParent();
    if (parent && parent.isEnabled()) {
      const children = block.getDescendants(false);
      for (let i = 0, child; (child = children[i]); i++) {
        child.setDisabledReason(false, 'ORPHANED');
      }
    } else if (block.outputConnection || block.previousConnection) {
      let currentBlock: BlocklyCore.Block | null = block;
      do {
        currentBlock.setDisabledReason(true, 'ORPHANED');
        currentBlock = currentBlock.getNextBlock();
      } while (currentBlock);
    }
  } finally {
    Blockly.Events.setRecordUndo(initialUndoFlag);
  }
}
