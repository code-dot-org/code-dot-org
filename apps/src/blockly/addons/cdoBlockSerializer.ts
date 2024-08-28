import GoogleBlockly, {Workspace} from 'blockly/core';
import {State} from 'blockly/core/serialization/blocks';

import {BLOCK_TYPES, PROCEDURE_DEFINITION_TYPES} from '../constants';

const unknownBlockState = {type: 'unknown', enabled: false};

export default class CdoBlockSerializer extends GoogleBlockly.serialization
  .blocks.BlockSerializer {
  /**
   * Catch errors when deserializing, and create unknown blocks instead.
   * Adapted from:
   * https://github.com/google/blockly/blob/399bd650a69f50843f2b46a9907a8dce826f6b99/core/serialization/blocks.ts#L710-L723
   *
   * @param stateToLoad - The state of the blocks to deserialize.
   * @param workspace - The workspace to deserialize into.
   */
  load(stateToLoad: {blocks: State[]}, workspace: Workspace) {
    for (const blockState of stateToLoad['blocks']) {
      try {
        if (PROCEDURE_DEFINITION_TYPES.includes(blockState.type)) {
          // Procedure definitions should not be movable on the modal workspace.
          blockState.movable = !Blockly.useModalFunctionEditor;
          // Ensure that procedure definitions are editable.
          blockState.editable = true;
        } else if (blockState.type === BLOCK_TYPES.whenRun) {
          // Ensures that when run blocks cannot be deleted.
          blockState.deletable = false;
        }
        GoogleBlockly.serialization.blocks.append(blockState, workspace, {
          recordUndo: Blockly.Events.getRecordUndo(),
        });
      } catch (e) {
        console.warn(`Creating "unknown block". ${(e as Error).message}`);
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
