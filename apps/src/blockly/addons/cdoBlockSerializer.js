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
   * @param {*} stateToLoad - The state of the blocks to deserialize.
   * @param {Blockly.Workspace} workspace - The workspace to deserialize into.
   */
  load(stateToLoad, workspace) {
    const blockStates = stateToLoad['blocks'];

    for (const blockState of blockStates) {
      try {
        GoogleBlockly.serialization.blocks.append(blockState, workspace, {
          recordUndo: getRecordUndo(),
        });
      } catch (e) {
        console.warn(`Creating "unknown block". ${e.message}`);
        GoogleBlockly.serialization.blocks.append(
          Object.assign(unknownBlockState, {x: blockState.x, y: blockState.y}),
          workspace,
          {
            recordUndo: getRecordUndo(),
          }
        );
      }
    }
  }
}
