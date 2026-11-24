import type * as BlocklyCore from 'blockly/core';

import {filterToolboxBlocks} from '@cdo/apps/blockly/utils/toolbox';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;

describe('filterToolboxBlocks', () => {
  it('filters the blocks a dynamic category holds', () => {
    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Variables',
          custom: 'VARIABLE',
          contents: [
            {kind: 'block', type: 'math_number'},
            {kind: 'block', type: 'text'},
          ],
        },
        {kind: 'category', name: 'Functions', custom: 'PROCEDURE'},
      ],
    } as ToolboxInfo;

    expect(
      filterToolboxBlocks(toolbox, block => block.type !== 'text')
    ).toEqual({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Variables',
          custom: 'VARIABLE',
          contents: [{kind: 'block', type: 'math_number'}],
        },
        {kind: 'category', name: 'Functions', custom: 'PROCEDURE'},
      ],
    });
  });
});
