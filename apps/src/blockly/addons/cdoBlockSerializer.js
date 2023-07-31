import GoogleBlockly from 'blockly/core';
import {PROCEDURE_DEFINITION_TYPES} from '../constants';

const unknownBlockState = {type: 'unknown', enabled: false};

// Move blocks of the specified types to the front of the list. Used by load()
function partitionBlocksByType(blockStates, prioritizedBlockTypes) {
  // Create a copy of the blockStates array in case it's read-only
  const copiedBlockStates = [...blockStates];
  const prioritizedBlocks = [];
  const remainingBlocks = [];

  copiedBlockStates.forEach(block => {
    prioritizedBlockTypes.includes(block.type)
      ? prioritizedBlocks.push(block)
      : remainingBlocks.push(block);
  });

  return [...prioritizedBlocks, ...remainingBlocks];
}

export default class CdoBlockSerializer extends GoogleBlockly.serialization
  .blocks.BlockSerializer {
  /**
   * Catch errors when deserializing, and create unknown blocks instead.
   * Adapted from:
   * https://github.com/google/blockly/blob/399bd650a69f50843f2b46a9907a8dce826f6b99/core/serialization/blocks.ts#L710-L723
   *
   * @param {*} stateToLoad - The state of the blocks to deserialize.
   * @param {Blockly.Workspace} workspace - The workspace to deserialize into.
   */
  load(stateToLoad, workspace) {
    // Procedure definitions should be loaded ahead of call blocks, so that the
    // procedures map is updated correctly.
    const blockStates = partitionBlocksByType(
      stateToLoad['blocks'],
      PROCEDURE_DEFINITION_TYPES
    );

    for (const blockState of blockStates) {
      try {
        GoogleBlockly.serialization.blocks.append(blockState, workspace, {
          recordUndo: Blockly.Events.getRecordUndo(),
        });
      } catch (e) {
        console.warn(`Creating "unknown block". ${e.message}`);
        GoogleBlockly.serialization.blocks.append(
          {...unknownBlockState, x: blockState.x, y: blockState.y},
          workspace,
          {
            recordUndo: Blockly.Events.getRecordUndo(),
          }
        );
      }
    }
  }
}
