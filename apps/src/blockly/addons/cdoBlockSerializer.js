import GoogleBlockly from 'blockly/core';

const unknownBlockState = {type: 'unknown', enabled: false};
const getRecordUndo = function () {
  return true;
};

export default class CdoBlockSerializer extends GoogleBlockly.serialization
  .blocks.BlockSerializer {
  /**
   * Catch errors when deserializing, and create unknown blocks instead.
   * Adapted from:
   * https://github.com/google/blockly/blob/399bd650a69f50843f2b46a9907a8dce826f6b99/core/serialization/blocks.ts#L710-L723
   *
   * @param {json} state - The state of the blocks to deserialize.
   * @param {workspace} workspace - The workspace to deserialize into.
   */
  load(state, workspace) {
    const blockStates = state['blocks'];

    for (const state of blockStates) {
      try {
        GoogleBlockly.serialization.blocks.append(state, workspace, {
          recordUndo: getRecordUndo(),
        });
      } catch (e) {
        console.warn(`Creating "unknown block". ${e.message}`);
        GoogleBlockly.serialization.blocks.append(
          Object.assign(unknownBlockState, {x: state.x, y: state.y}),
          workspace,
          {
            recordUndo: getRecordUndo(),
          }
        );
      }
    }
  }
}
