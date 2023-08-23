import GoogleBlockly from 'blockly/core';
import {PROCEDURE_DEFINITION_TYPES} from '../constants';
import {partitionBlocksByType} from './cdoUtils';

const unknownBlockState = {type: 'unknown', enabled: false};

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
    console.log('stateToLoad: ', stateToLoad['blocks']);
    // Procedure definitions should be loaded ahead of call blocks, so that the
    // procedures map is updated correctly.
    const blockStates = partitionBlocksByType(stateToLoad['blocks'], {
      prioritizedBlockTypes: PROCEDURE_DEFINITION_TYPES,
      isJson: true,
    });

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
