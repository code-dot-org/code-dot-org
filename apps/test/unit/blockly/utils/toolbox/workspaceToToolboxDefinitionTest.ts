import * as BlocklyCore from 'blockly/core';

import category from '@cdo/apps/blockly/blockDefinitions/category';
import customCategory from '@cdo/apps/blockly/blockDefinitions/custom_category';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import workspaceToToolboxDefinition from '@cdo/apps/blockly/utils/toolbox/workspaceToToolboxDefinition';

import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

setBlocklyGlobal();
BlocklyCore.common.defineBlocksWithJsonArray([
  category.definition,
  customCategory.definition,
]);

// Lays the blocks out top to bottom, in toolbox order.
function toolboxOf(blocks: BlocklyCore.serialization.blocks.State[]) {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(
    {
      blocks: {
        languageVersion: 0,
        blocks: blocks.map((block, i) => ({...block, x: 0, y: i * 100})),
      },
    },
    workspace
  );
  return workspaceToToolboxDefinition(workspace as BlocklyCore.WorkspaceSvg);
}

describe('workspaceToToolboxDefinition', () => {
  it('saves the blocks under a dynamic category into it', () => {
    const toolbox = toolboxOf([
      {type: BLOCK_TYPES.category, fields: {CATEGORY: 'Math'}},
      {type: 'math_number', fields: {NUM: 1}},
      {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Variables'}},
      {type: 'math_number', fields: {NUM: 2}},
      {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Functions'}},
    ]);

    expect(toolbox.kind).toBe('categoryToolbox');
    expect(toolbox.contents).toEqual([
      expect.objectContaining({
        name: 'Math',
        contents: [expect.objectContaining({fields: {NUM: 1}})],
      }),
      expect.objectContaining({
        name: 'Variables',
        custom: 'VARIABLE',
        contents: [expect.objectContaining({fields: {NUM: 2}})],
      }),
      expect.objectContaining({name: 'Functions', custom: 'PROCEDURE'}),
    ]);
    // Levels saved before dynamic categories held blocks keep their JSON.
    expect(toolbox.contents[2]).not.toHaveProperty('contents');
  });
});
