import * as BlocklyCore from 'blockly/core';

import {
  HIDE_VARIABLE_BLOCK_TYPE,
  SHOW_VARIABLE_BLOCK_TYPE,
  SHOW_VARIABLE_LOCATION,
  variablesFlyout,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/variablesFlyout';

import setBlocklyGlobal from '../../../../../util/setupBlocklyGlobal';

type FlyoutItemInfoArray = BlocklyCore.utils.toolbox.FlyoutItemInfoArray;
type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;

const VARIABLE_BLOCK_TYPES = [
  SHOW_VARIABLE_BLOCK_TYPE,
  HIDE_VARIABLE_BLOCK_TYPE,
];

// The flyout reads only the variables and registers the create button.
function workspaceWith(...names: string[]): BlocklyCore.WorkspaceSvg {
  const workspace = new BlocklyCore.Workspace();
  names.forEach(name => workspace.getVariableMap().createVariable(name));
  return Object.assign(workspace, {
    registerButtonCallback: () => {},
  }) as unknown as BlocklyCore.WorkspaceSvg;
}

function typesIn(flyout: FlyoutItemInfoArray) {
  return flyout.map(item => (item as BlockInfo).type);
}

describe('variablesFlyout', () => {
  beforeAll(() => setBlocklyGlobal());

  beforeEach(() => {
    VARIABLE_BLOCK_TYPES.forEach(type => {
      Blockly.Blocks[type] = {init() {}};
    });
  });

  afterEach(() => {
    VARIABLE_BLOCK_TYPES.forEach(type => {
      delete Blockly.Blocks[type];
    });
  });

  it('ends with show then hide, for the variable the set block offers', () => {
    const flyout = variablesFlyout(workspaceWith('lives', 'score'));
    const [show, hide] = flyout.slice(-2) as BlockInfo[];
    const setter = flyout.find(
      item => (item as BlockInfo).type === 'variables_set'
    ) as BlockInfo;

    expect([show.type, hide.type]).toEqual(VARIABLE_BLOCK_TYPES);
    expect(show.fields?.VAR).toEqual(setter.fields?.VAR);
    expect(hide.fields?.VAR).toEqual(setter.fields?.VAR);
    expect(show.inputs?.LOCATION).toEqual({
      shadow: {
        type: 'gamelab_location_picker',
        fields: {LOCATION: SHOW_VARIABLE_LOCATION},
      },
    });
  });

  it('offers neither before there is a variable', () => {
    const offered = typesIn(variablesFlyout(workspaceWith()));
    VARIABLE_BLOCK_TYPES.forEach(type => expect(offered).not.toContain(type));
  });

  it("leaves out a block the level's pool lacks", () => {
    delete Blockly.Blocks[SHOW_VARIABLE_BLOCK_TYPE];
    const offered = typesIn(variablesFlyout(workspaceWith('score')));
    expect(offered).not.toContain(SHOW_VARIABLE_BLOCK_TYPE);
    expect(offered).toContain(HIDE_VARIABLE_BLOCK_TYPE);
  });
});
