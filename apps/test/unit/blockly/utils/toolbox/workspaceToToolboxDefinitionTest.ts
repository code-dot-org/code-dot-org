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
function toolboxOf(
  blocks: BlocklyCore.serialization.blocks.State[],
  options?: {dynamicCategoriesHoldBlocks?: boolean}
) {
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
  return workspaceToToolboxDefinition(
    workspace as BlocklyCore.WorkspaceSvg,
    options
  );
}

const LAYOUT = [
  {type: BLOCK_TYPES.category, fields: {CATEGORY: 'Math'}},
  {type: 'math_number', fields: {NUM: 1}},
  {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Variables'}},
  {type: 'math_number', fields: {NUM: 2}},
  {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Functions'}},
];

describe('workspaceToToolboxDefinition', () => {
  it('saves the blocks under a dynamic category into it', () => {
    const toolbox = toolboxOf(LAYOUT, {dynamicCategoriesHoldBlocks: true});

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

  it('saves them to a DEFAULT category by default', () => {
    const toolbox = toolboxOf(LAYOUT);

    expect(toolbox.contents).toEqual([
      expect.objectContaining({name: 'Math'}),
      expect.objectContaining({name: 'Variables', custom: 'VARIABLE'}),
      expect.objectContaining({
        name: 'DEFAULT',
        contents: [expect.objectContaining({fields: {NUM: 2}})],
      }),
      expect.objectContaining({name: 'Functions', custom: 'PROCEDURE'}),
    ]);
    expect(toolbox.contents[1]).not.toHaveProperty('contents');
  });
});
