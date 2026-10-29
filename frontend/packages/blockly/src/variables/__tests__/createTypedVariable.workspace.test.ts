import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import Driver from '../../Driver';
import ThrasosRenderer from '../../renderers/thrasos';
import DefaultTheme from '../../themes/default';
import type {Environment} from '../../types';
import {createTypedVariable} from '../createTypedVariable';

Blockly.setLocale(En as unknown as {[key: string]: string});

const Actor = createTypedVariable({type: 'Actor'});
const Count = createTypedVariable({type: 'Count'});

let driver: Driver;
let workspace: Blockly.Workspace;

beforeEach(() => {
  driver = new Driver({} as Environment, ThrasosRenderer, DefaultTheme);
  driver.setBlocks([
    Actor.getterBlock,
    Actor.setterBlock,
    Count.getterBlock,
    Count.setterBlock,
  ]);
  workspace = new Blockly.Workspace();
});

afterEach(() => {
  workspace.dispose();
  driver.deconstruct();
});

const variables = (ws: Blockly.Workspace) =>
  ws
    .getVariableMap()
    .getAllVariables()
    .map(v => [v.getName(), v.getType()]);

describe('typed-variables.md: in a workspace', () => {
  it('TV-5, TV-V1: a new getter creates a variable of its type, named by default', () => {
    workspace.newBlock(Actor.getterType);
    expect(variables(workspace)).toEqual([['actor', 'Actor']]);
  });

  it('TV-5: the getter offers only variables of its type', () => {
    const getter = workspace.newBlock(Actor.getterType);
    workspace.getVariableMap().createVariable('n', 'Count');
    workspace.getVariableMap().createVariable('other', 'Actor');
    const options = (getter.getField('VAR') as Blockly.FieldVariable)
      .getOptions(false)
      .map(option => option[0]);
    expect(options).toContain('other');
    expect(options).not.toContain('n');
  });

  it('TV-3: a getter plugs into its own setter and not into another type', () => {
    const setter = workspace.newBlock(Actor.setterType);
    const socket = setter.getInput('VALUE')!.connection!;
    const checker = workspace.connectionChecker;
    expect(
      checker.canConnect(
        socket,
        workspace.newBlock(Actor.getterType).outputConnection,
        false,
      ),
    ).toBe(true);
    expect(
      checker.canConnect(
        socket,
        workspace.newBlock(Count.getterType).outputConnection,
        false,
      ),
    ).toBe(false);
  });

  it('TV-6, TV-V2: generates an assignment and declares the variable', () => {
    const setter = workspace.newBlock(Actor.setterType);
    const getter = workspace.newBlock(Actor.getterType);
    setter.getInput('VALUE')!.connection!.connect(getter.outputConnection!);
    javascriptGenerator.init(workspace);
    const code = javascriptGenerator.blockToCode(setter) as string;
    expect(javascriptGenerator.finish(code)).toBe(
      'var actor;\n\n\nactor = actor;\n',
    );
  });

  it('TV-8: saves and loads each variable with its type', () => {
    workspace.newBlock(Actor.getterType);
    workspace.newBlock(Count.setterType);
    const loaded = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      Blockly.serialization.workspaces.save(workspace),
      loaded,
    );
    expect(variables(loaded)).toEqual(variables(workspace));
    loaded.dispose();
  });
});
