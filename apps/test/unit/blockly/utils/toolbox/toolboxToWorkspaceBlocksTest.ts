import type * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import toolboxToWorkspaceBlocks from '@cdo/apps/blockly/utils/toolbox/toolboxToWorkspaceBlocks';

import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;

setBlocklyGlobal();

const blocksOf = (toolbox: ToolboxInfo) =>
  toolboxToWorkspaceBlocks(toolbox).blocks?.blocks || [];

describe('toolboxToWorkspaceBlocks', () => {
  it('converts categories keyed by id', () => {
    const blocks = blocksOf({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Math',
          id: 'Math',
          contents: [{kind: 'block', type: 'math_number'}],
        },
        {
          kind: 'category',
          name: 'Variables',
          id: 'Variables',
          custom: 'VARIABLE',
        },
      ],
    } as ToolboxInfo);

    expect(blocks).toEqual([
      {type: BLOCK_TYPES.category, fields: {CATEGORY: 'Math'}},
      {kind: 'block', type: 'math_number'},
      {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Variables'}},
    ]);
  });

  // Hand-authored level toolboxes carry no id; dropping their categories
  // flattens the toolbox on the next save in toolbox edit mode.
  it('falls back to the category name when there is no id', () => {
    const blocks = blocksOf({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'World',
          contents: [{kind: 'block', type: 'math_number'}],
        },
        {kind: 'category', name: 'Functions', custom: 'PROCEDURE'},
      ],
    } as ToolboxInfo);

    expect(blocks).toEqual([
      {type: BLOCK_TYPES.category, fields: {CATEGORY: 'World'}},
      {kind: 'block', type: 'math_number'},
      {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Functions'}},
    ]);
  });

  it('names a dynamic category from its custom flyout alone', () => {
    const blocks = blocksOf({
      kind: 'categoryToolbox',
      contents: [{kind: 'category', custom: 'VARIABLE'}],
    } as ToolboxInfo);

    expect(blocks).toEqual([
      {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Variables'}},
    ]);
  });

  // Saving rewrites `custom` from the block's dropdown, so trusting a label
  // that disagrees with it would change which flyout the category opens.
  it('keeps the flyout a mislabeled category names', () => {
    const blocks = blocksOf({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Functions',
          id: 'Functions',
          custom: 'VARIABLE',
        },
      ],
    } as ToolboxInfo);

    expect(blocks).toEqual([
      {type: BLOCK_TYPES.categoryDynamic, fields: {CUSTOM: 'Variables'}},
    ]);
  });

  // The CUSTOM dropdown offers only Functions and Variables, so a category
  // bound to any other flyout has no block to become.
  it('drops a dynamic category with an unsupported flyout', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const blocks = blocksOf({
      kind: 'categoryToolbox',
      contents: [
        {kind: 'category', name: 'Behaviors', custom: 'Behavior'},
        // A supported label doesn't rescue an unsupported flyout.
        {kind: 'category', name: 'Variables', custom: 'Behavior'},
      ],
    } as ToolboxInfo);

    expect(blocks).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('skips the placeholder DEFAULT category', () => {
    const blocks = blocksOf({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'DEFAULT',
          id: 'DEFAULT',
          contents: [{kind: 'block', type: 'math_number'}],
        },
      ],
    } as ToolboxInfo);

    expect(blocks).toEqual([{kind: 'block', type: 'math_number'}]);
  });

  it('returns no blocks for an undefined toolbox', () => {
    expect(toolboxToWorkspaceBlocks(undefined)).toEqual({});
  });
});
