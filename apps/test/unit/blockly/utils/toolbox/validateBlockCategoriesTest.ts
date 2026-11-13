import type * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {validateBlockCategories} from '@cdo/apps/blockly/utils/toolbox/validateBlockCategories';

function workspaceOf(types: string[]) {
  const blocks = types.map(type => ({type, setWarningText: jest.fn()}));
  const workspace = {
    getTopBlocks: () => blocks,
    getBlocksByType: (type: string) => blocks.filter(b => b.type === type),
  } as unknown as BlocklyCore.WorkspaceSvg;
  return {workspace, underVariables: blocks[1].setWarningText};
}

describe('validateBlockCategories', () => {
  const layout = [BLOCK_TYPES.categoryDynamic, 'math_number'];

  it('warns about a block under a dynamic category', () => {
    const {workspace, underVariables} = workspaceOf(layout);
    validateBlockCategories(workspace);
    expect(underVariables).toHaveBeenCalledWith(
      'Auto-populated categories cannot include static blocks.'
    );
  });

  it('accepts it where dynamic categories hold blocks', () => {
    const {workspace, underVariables} = workspaceOf(layout);
    validateBlockCategories(workspace, {dynamicCategoriesHoldBlocks: true});
    expect(underVariables).toHaveBeenCalledWith(null);
  });
});
