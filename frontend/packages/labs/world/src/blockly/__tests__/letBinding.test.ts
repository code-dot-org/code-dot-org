// Which variable a `let` gives as it is named and moved, and what a pasted
// copy of one gives (specs/VARIABLE_OWNERSHIP_PLAN.md, step 3).

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import '../typedVariables';
import {VARIABLE_NAME_FIELD} from '../fields/variableName';
import {
  joinWarning,
  LET_BINDING_EXTENSION,
  letBindingExtension,
  settleLet,
} from '../letBinding';
import {freshBindings} from '../ownedPaster';

const LET = 'world_let_number';
const GET = 'test_read_number';

beforeAll(() => {
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  if (!Blockly.Extensions.isRegistered(LET_BINDING_EXTENSION)) {
    Blockly.Extensions.register(
      LET_BINDING_EXTENSION,
      letBindingExtension.extension as never,
    );
  }
  Blockly.defineBlocksWithJsonArray([
    {
      type: LET,
      message0: 'let %1 be %2',
      args0: [
        {
          type: VARIABLE_NAME_FIELD,
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
        {type: 'input_value', name: 'VALUE'},
      ],
      previousStatement: true,
      nextStatement: true,
      extensions: [LET_BINDING_EXTENSION],
    },
    {
      type: GET,
      message0: 'read %1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
      ],
      previousStatement: true,
      nextStatement: true,
    },
  ]);
});

/** A `let` of `name` on `workspace`, with a reader of it below. */
const letWithReader = (workspace: Blockly.Workspace, name: string) => {
  const binder = workspace.newBlock(LET);
  binder.setFieldValue(name, 'VAR');
  const reader = workspace.newBlock(GET);
  reader.setFieldValue(binder.getFieldValue('VAR'), 'VAR');
  binder.nextConnection!.connect(reader.previousConnection!);
  return {binder, reader};
};

describe('a `let` carried under another of its name', () => {
  it('joins it, takes its readers along, and says it sets it', () => {
    const workspace = new Blockly.Workspace();
    const outer = workspace.newBlock(LET);
    outer.setFieldValue('amount', 'VAR');
    const {binder, reader} = letWithReader(workspace, 'amount');
    const own = binder.getFieldValue('VAR');
    expect(own).not.toBe(outer.getFieldValue('VAR'));

    outer.nextConnection!.connect(binder.previousConnection!);
    expect(settleLet(binder)).toBe(true);

    expect(binder.getFieldValue('VAR')).toBe(outer.getFieldValue('VAR'));
    expect(reader.getFieldValue('VAR')).toBe(outer.getFieldValue('VAR'));
    expect(workspace.getVariableMap().getVariableById(own)).toBeNull();
    expect(joinWarning(binder)).toMatch(/^amount is already known here/);
  });

  it('takes a variable of its own again when carried away', () => {
    const workspace = new Blockly.Workspace();
    const outer = workspace.newBlock(LET);
    outer.setFieldValue('amount', 'VAR');
    const {binder, reader} = letWithReader(workspace, 'amount');
    outer.nextConnection!.connect(binder.previousConnection!);
    settleLet(binder);

    binder.unplug(false);
    expect(settleLet(binder)).toBe(true);

    const own = binder.getFieldValue('VAR');
    expect(own).not.toBe(outer.getFieldValue('VAR'));
    expect(reader.getFieldValue('VAR')).toBe(own);
    expect(joinWarning(binder)).toBeNull();
  });

  it('leaves a `let` of another name alone', () => {
    const workspace = new Blockly.Workspace();
    const outer = workspace.newBlock(LET);
    outer.setFieldValue('amount', 'VAR');
    const {binder} = letWithReader(workspace, 'total');
    outer.nextConnection!.connect(binder.previousConnection!);

    expect(settleLet(binder)).toBe(false);
    expect(joinWarning(binder)).toBeNull();
  });
});

describe('a name typed into a `let`', () => {
  it('joins one visible above it, and its readers follow', () => {
    const workspace = new Blockly.Workspace();
    const outer = workspace.newBlock(LET);
    outer.setFieldValue('amount', 'VAR');
    const {binder, reader} = letWithReader(workspace, 'total');
    outer.nextConnection!.connect(binder.previousConnection!);

    binder.setFieldValue('amount', 'VAR');

    expect(binder.getFieldValue('VAR')).toBe(outer.getFieldValue('VAR'));
    expect(reader.getFieldValue('VAR')).toBe(outer.getFieldValue('VAR'));
  });

  it('leaving a joined name makes a variable, and renames nothing above', () => {
    const workspace = new Blockly.Workspace();
    const outer = workspace.newBlock(LET);
    outer.setFieldValue('amount', 'VAR');
    const binder = workspace.newBlock(LET);
    outer.nextConnection!.connect(binder.previousConnection!);
    binder.setFieldValue('amount', 'VAR');

    binder.setFieldValue('total', 'VAR');

    const map = workspace.getVariableMap();
    expect(map.getVariableById(outer.getFieldValue('VAR'))?.getName()).toBe(
      'amount',
    );
    expect(map.getVariableById(binder.getFieldValue('VAR'))?.getName()).toBe(
      'total',
    );
  });
});

describe('a pasted copy', () => {
  it('gives each binding in it a fresh id, and its readers follow', () => {
    const workspace = new Blockly.Workspace();
    const outer = workspace.newBlock(LET);
    outer.setFieldValue('amount', 'VAR');
    const {binder} = letWithReader(workspace, 'total');
    outer.nextConnection!.connect(binder.previousConnection!);
    // A reader of `amount` inside the copy, whose binding is not copied.
    const outside = workspace.newBlock(GET);
    outside.setFieldValue(outer.getFieldValue('VAR'), 'VAR');
    binder.getNextBlock()!.nextConnection!.connect(outside.previousConnection!);

    const saved = Blockly.serialization.blocks.save(binder, {
      doFullSerialization: true,
    })!;
    const {state, fresh} = freshBindings(saved, workspace);

    const total = binder.getFieldValue('VAR');
    const copied = state.fields!.VAR as {id: string; name: string};
    const copiedReader = state.next!.block!;
    const copiedOutside = copiedReader.next!.block!;
    expect(copied.id).not.toBe(total);
    expect(copied.name).toBe('total');
    expect((copiedReader.fields!.VAR as {id: string}).id).toBe(copied.id);
    expect((copiedOutside.fields!.VAR as {id: string}).id).toBe(
      outer.getFieldValue('VAR'),
    );
    expect(fresh).toEqual([{id: copied.id, name: 'total', type: 'Number'}]);
  });
});
