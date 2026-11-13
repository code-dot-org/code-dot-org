import type * as BlocklyCore from 'blockly/core';

import {getCategoryBlocksJson} from '@cdo/apps/blockly/utils/toolbox/retrieval';

import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;

setBlocklyGlobal();

const variablesHolding = (
  contents: BlocklyCore.utils.toolbox.FlyoutItemInfoArray
): ToolboxInfo => ({
  kind: 'categoryToolbox',
  contents: [
    {kind: 'category', name: 'Variables', custom: 'VARIABLE', contents},
    {kind: 'category', name: 'Functions', custom: 'PROCEDURE'},
  ] as ToolboxInfo['contents'],
});

const workspaceShowing = (toolbox: ToolboxInfo) =>
  ({options: {languageTree: toolbox}} as unknown as BlocklyCore.WorkspaceSvg);

describe('getCategoryBlocksJson', () => {
  afterEach(() => {
    Blockly.toolboxBlocks = undefined;
  });

  it("reads a JSON toolbox's dynamic category blocks", () => {
    const toolbox = variablesHolding([{kind: 'block', type: 'math_number'}]);
    Blockly.toolboxBlocks = toolbox;
    const workspace = workspaceShowing(toolbox);

    expect(getCategoryBlocksJson(workspace, 'VARIABLE')).toEqual([
      {kind: 'block', type: 'math_number'},
    ]);
    expect(getCategoryBlocksJson(workspace, 'PROCEDURE')).toEqual([]);
  });

  it('reads the toolbox the workspace shows now, not the injected one', () => {
    Blockly.toolboxBlocks = variablesHolding([]);
    const workspace = workspaceShowing(
      variablesHolding([{kind: 'block', type: 'math_number'}])
    );

    expect(getCategoryBlocksJson(workspace, 'VARIABLE')).toEqual([
      {kind: 'block', type: 'math_number'},
    ]);
  });
});
