jest.mock('@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields', () => ({
  takeLevelDefaults: jest.fn(),
}));

import {takeLevelDefaults} from '@cdo/apps/p5lab/spritelab/lab2/blockly/imagePickerFields';
import {codeFromSavedScene} from '@cdo/apps/p5lab/spritelab/lab2/blockly/savedSceneCode';

describe('codeFromSavedScene', () => {
  const workspace = {dispose: jest.fn()};
  const load = jest.fn();
  const workspaceToCode = jest.fn();
  const blockly = globalThis as {Blockly?: unknown};
  let blocklyBefore: unknown;

  beforeEach(() => {
    jest.clearAllMocks();
    blocklyBefore = blockly.Blockly;
    blockly.Blockly = {
      Workspace: jest.fn(() => workspace),
      serialization: {workspaces: {load}},
      JavaScript: {workspaceToCode},
    };
  });

  afterEach(() => {
    blockly.Blockly = blocklyBefore;
  });

  it('gives the dropdowns their level defaults before generating code', () => {
    const order: string[] = [];
    load.mockImplementation(() => order.push('load'));
    (takeLevelDefaults as jest.Mock).mockImplementation(() =>
      order.push('defaults')
    );
    workspaceToCode.mockImplementation(() => {
      order.push('code');
      return 'say();';
    });
    const source = {blocks: {blocks: []}};
    expect(codeFromSavedScene(source)).toBe('say();');
    expect(load).toHaveBeenCalledWith(source, workspace);
    expect(takeLevelDefaults).toHaveBeenCalledWith(workspace);
    expect(order).toEqual(['load', 'defaults', 'code']);
    expect(workspace.dispose).toHaveBeenCalledTimes(1);
  });

  it('disposes of the workspace when the blocks fail to load', () => {
    load.mockImplementation(() => {
      throw new Error('bad blocks');
    });
    expect(() => codeFromSavedScene({})).toThrow('bad blocks');
    expect(workspace.dispose).toHaveBeenCalledTimes(1);
  });
});
