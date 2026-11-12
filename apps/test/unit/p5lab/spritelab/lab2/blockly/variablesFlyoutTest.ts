import * as BlocklyCore from 'blockly/core';

import {
  SHOW_VARIABLE_BLOCK_TYPE,
  SHOW_VARIABLE_LOCATION,
  variablesFlyout,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/variablesFlyout';

import setBlocklyGlobal from '../../../../../util/setupBlocklyGlobal';

type FlyoutItemInfoArray = BlocklyCore.utils.toolbox.FlyoutItemInfoArray;
type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;

// The flyout reads only the variables and registers the create button.
function workspaceWith(...names: string[]): BlocklyCore.WorkspaceSvg {
  const workspace = new BlocklyCore.Workspace();
  names.forEach(name => workspace.getVariableMap().createVariable(name));
  return Object.assign(workspace, {
    registerButtonCallback: () => {},
  }) as unknown as BlocklyCore.WorkspaceSvg;
}

function block(flyout: FlyoutItemInfoArray, type: string) {
  return flyout.find(item => (item as BlockInfo).type === type) as
    | BlockInfo
    | undefined;
}

describe('variablesFlyout', () => {
  beforeAll(() => setBlocklyGlobal());

  beforeEach(() => {
    Blockly.Blocks[SHOW_VARIABLE_BLOCK_TYPE] = {init() {}};
  });

  afterEach(() => {
    delete Blockly.Blocks[SHOW_VARIABLE_BLOCK_TYPE];
  });

  it('ends with show variable, for the variable the set block offers', () => {
    const flyout = variablesFlyout(workspaceWith('lives', 'score'));
    const show = flyout[flyout.length - 1] as BlockInfo;

    expect(show.type).toBe(SHOW_VARIABLE_BLOCK_TYPE);
    expect(show.fields?.VAR).toEqual(
      block(flyout, 'variables_set')?.fields?.VAR
    );
    expect(show.inputs?.LOCATION).toEqual({
      shadow: {
        type: 'gamelab_location_picker',
        fields: {LOCATION: SHOW_VARIABLE_LOCATION},
      },
    });
  });

  it('offers no show variable before there is a variable', () => {
    expect(
      block(variablesFlyout(workspaceWith()), SHOW_VARIABLE_BLOCK_TYPE)
    ).toBeUndefined();
  });

  it("offers no show variable when the level's block pool lacks it", () => {
    delete Blockly.Blocks[SHOW_VARIABLE_BLOCK_TYPE];
    expect(
      block(variablesFlyout(workspaceWith('score')), SHOW_VARIABLE_BLOCK_TYPE)
    ).toBeUndefined();
  });
});
