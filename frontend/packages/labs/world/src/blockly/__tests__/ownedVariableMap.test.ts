// The variable store: two variables may share a name, and renaming one never
// touches the other (specs/VARIABLE_OWNERSHIP_PLAN.md, step 2).

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {OwnedVariableMap, registerOwnedVariableMap} from '../ownedVariableMap';

const GETTER = 'test_owned_get';

beforeAll(() => {
  // Blockly's variable field reads these the moment it takes a value.
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  registerOwnedVariableMap();
  Blockly.defineBlocksWithJsonArray([
    {
      type: GETTER,
      message0: '%1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
      ],
      output: 'Number',
    },
  ]);
});

describe('a workspace’s variables', () => {
  it('are kept in the owned store', () => {
    expect(new Blockly.Workspace().getVariableMap()).toBeInstanceOf(
      OwnedVariableMap,
    );
  });

  it('may share a name and a type', () => {
    const map = new Blockly.Workspace().getVariableMap();
    const one = map.createVariable('amount', 'Number');
    const other = map.createVariable('amount', 'Number');

    expect(one.getId()).not.toBe(other.getId());
    expect(map.getVariablesOfType('Number')).toHaveLength(2);
  });

  it('answer an id already held with what holds it', () => {
    const map = new Blockly.Workspace().getVariableMap();
    const one = map.createVariable('amount', 'Number', 'a1');

    expect(map.createVariable('amount', 'Number', 'a1')).toBe(one);
    expect(() => map.createVariable('total', 'Number', 'a1')).toThrow(
      /already in use/,
    );
  });

  it('are renamed one at a time, and never merged', () => {
    const workspace = new Blockly.Workspace();
    const map = workspace.getVariableMap();
    const one = map.createVariable('amount', 'Number');
    const other = map.createVariable('total', 'Number');
    const reader = workspace.newBlock(GETTER);
    reader.setFieldValue(other.getId(), 'VAR');

    // Blockly's own store would move every use of `total` onto `amount` and
    // delete `total`.
    map.renameVariable(other, 'amount');

    expect(map.getVariableById(other.getId())?.getName()).toBe('amount');
    expect(map.getVariableById(one.getId())?.getName()).toBe('amount');
    expect(reader.getFieldValue('VAR')).toBe(other.getId());
  });

  it('come back from a save as they went', () => {
    const workspace = new Blockly.Workspace();
    const map = workspace.getVariableMap();
    const one = map.createVariable('amount', 'Number');
    const other = map.createVariable('amount', 'Number');
    workspace.newBlock(GETTER).setFieldValue(one.getId(), 'VAR');
    workspace.newBlock(GETTER).setFieldValue(other.getId(), 'VAR');

    const saved = Blockly.serialization.workspaces.save(workspace);
    const loaded = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(saved, loaded);

    const idsOf = (one: Blockly.Workspace) =>
      one
        .getVariableMap()
        .getAllVariables()
        .map(variable => variable.getId())
        .sort();
    expect(idsOf(loaded)).toEqual(idsOf(workspace));
    expect(idsOf(loaded)).toEqual(
      expect.arrayContaining([one.getId(), other.getId()]),
    );
    expect(
      loaded
        .getAllBlocks(false)
        .map(block => block.getFieldValue('VAR'))
        .sort(),
    ).toEqual([one.getId(), other.getId()].sort());
  });
});
