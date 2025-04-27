import * as BlocklyLibrary from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

import {BLOCK_TYPES} from './constants';

/**
 * Options for the `getAllGeneratedCode` method.
 */
export interface GetAllGeneratedCodeOptions {
  /** Specifies the block type to look for and filter just that. */
  startBlock?: string;
  /** The code to inject at the start of the generated code block. */
  extraCode?: string;
}

/**
 * Generates all code for the main workspace.
 */
export function getAllGeneratedCode(options?: GetAllGeneratedCodeOptions) {
  // Sets the lab code based on the student's blocks and any extra (e.g. initialization) code.
  // The students blocks are considered to be any on the main or hidden workspaces.
  let code = options?.extraCode || '';

  [BlocklyLibrary.getMainWorkspace()].forEach(workspace => {
    if (workspace) {
      javascriptGenerator.init(workspace);
      const blocks = workspace.getTopBlocks(true);
      const blocksCode: (string | [string, number])[] = [];
      blocks.forEach(block => {
        if (
          options?.startBlock === undefined ||
          options?.startBlock === block.type
        ) {
          blocksCode.push(javascriptGenerator.blockToCode(block));
        }
      });
      code += javascriptGenerator.finish(blocksCode.join('\n'));
    }
  });

  console.log('GENERATED CODE', code);
  return code;
}

export function updateBlockEnabled(block: BlocklyLibrary.Block) {
  // Changing blocks as part of this event shouldn't be undoable.
  const initialUndoFlag = BlocklyLibrary.Events.getRecordUndo();
  try {
    BlocklyLibrary.Events.setRecordUndo(false);
    const parent = block.getParent();
    if (parent && parent.isEnabled()) {
      const children = block.getDescendants(false);
      for (let i = 0, child; (child = children[i]); i++) {
        child.setEnabled(true);
      }
    } else if (block.outputConnection || block.previousConnection) {
      let currentBlock: BlocklyLibrary.Block | null = block;
      do {
        currentBlock.setEnabled(false);
        currentBlock = currentBlock.getNextBlock();
      } while (currentBlock);
    }
  } finally {
    BlocklyLibrary.Events.setRecordUndo(initialUndoFlag);
  }
}

/**
 * Disables all blocks that are not attached to a top block.
 */
export function disableOrphanBlocks(eventWorkspace: BlocklyLibrary.Workspace) {
  // When a function definition is moved, we should not suddenly enable
  // its call blocks.
  eventWorkspace.getTopBlocks().forEach(block => {
    if (block.type === BLOCK_TYPES.procedureCall) {
      block.setEnabled(false);
    }
    updateBlockEnabled(block);
  });
}
