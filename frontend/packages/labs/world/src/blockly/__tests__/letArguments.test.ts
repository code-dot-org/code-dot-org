// A `let` in the arguments row is an argument.
//
// The claim is that one block says the same thing in two places. In a body,
// `let number ⟨amount⟩ be ⟨5⟩` makes a working value; in a `define block`'s
// arguments row it asks the CALLER for one, five unless they say otherwise.
// Both bind the same kind of variable, and the body reads either with the same
// getter — which is the whole reason the separate `argument` block stopped
// being the first thing a learner meets (`surfaceToolbox`, the `block`
// surface).
//
// The blocks here are hand-defined rather than taken from the palette, as
// `scopedVariableField`'s are: the real `define block` carries a preview field
// that wants a rendered workspace, and what is being tested is the reading and
// writing of the row, which needs neither.

import * as Blockly from 'blockly/core';
import {beforeEach, describe, expect, it} from 'vitest';

import {
  blockDesignerMutator,
  paramTypeOf,
  type BlockPart,
} from '../extensions/blockDesigner';

const HOST = 'test_define_block';

/**
 * The shapes the real blocks have, in the parts this code reads.
 *
 * The `VAR` field is Blockly's own `field_variable` rather than the lab's
 * `VariableNameField`, which is a text box over the same thing: both store the
 * variable's ID as the field's value (`fields/variableName`), and the id is the
 * whole of what the designer reads.
 */
const define = () => {
  // Blockly's variable field reads these the moment it takes a value.
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  if (!Blockly.Extensions.isRegistered(blockDesignerMutator.name)) {
    Blockly.Extensions.registerMutator(
      blockDesignerMutator.name,
      blockDesignerMutator.mutator as never,
    );
  }
  if (Blockly.Blocks[HOST]) {
    return;
  }
  Blockly.defineBlocksWithJsonArray([
    {
      type: HOST,
      message0: 'define block %1 do %2',
      args0: [
        {type: 'input_statement', name: 'ARGUMENTS'},
        {type: 'input_statement', name: 'DO'},
      ],
      mutator: blockDesignerMutator.name,
    },
    {
      type: 'world_let_number',
      message0: 'let number %1 be %2',
      args0: [
        {type: 'field_variable', name: 'VAR', variable: 'n'},
        {type: 'input_value', name: 'VALUE'},
      ],
      previousStatement: true,
      nextStatement: true,
    },
    {
      type: 'world_let_actor',
      message0: 'let actor %1',
      args0: [{type: 'field_variable', name: 'VAR', variable: 'a'}],
      previousStatement: true,
      nextStatement: true,
    },
    {
      type: 'world_signature_text',
      message0: 'text %1',
      args0: [{type: 'field_input', name: 'TEXT', text: 'word'}],
      previousStatement: true,
      nextStatement: true,
    },
    {
      type: 'world_signature_argument',
      message0: 'argument %1 %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'TYPE',
          options: [
            ['number', 'number'],
            ['kind', 'kind'],
          ],
        },
        {type: 'field_input', name: 'TEXT', text: 'value'},
      ],
      previousStatement: true,
      nextStatement: true,
    },
  ]);
};

interface Designer {
  parts_: BlockPart[];
  buildArguments_(): void;
  readArguments_(): void;
  saveExtraState(): {parts: BlockPart[]};
  loadExtraState(state: {parts: BlockPart[]}): void;
}

const host = (workspace: Blockly.Workspace) =>
  workspace.newBlock(HOST) as unknown as Blockly.Block & Designer;

/** The stack in the arguments row, by block type. */
const row = (block: Blockly.Block): string[] => {
  const types: string[] = [];
  for (
    let at = block.getInput('ARGUMENTS')?.connection?.targetBlock();
    at;
    at = at.getNextBlock()
  ) {
    types.push(at.type);
  }
  return types;
};

/** Put a shadow literal on a socket, as the real `let` blocks arrive with. */
const seedShadow = (
  block: Blockly.Block,
  input: string,
  type: string,
  field: string,
  value: unknown,
) => {
  const shadow = block.workspace.newBlock(type);
  shadow.setShadow(true);
  shadow.setFieldValue(value as string, field);
  block.getInput(input)?.connection?.connect(shadow.outputConnection!);
};

describe('paramTypeOf', () => {
  const item = (type: string) => ({type, getFieldValue: () => null});

  it('reads a `let` as the type it declares', () => {
    expect(paramTypeOf(item('world_let_number'))).toBe('number');
    expect(paramTypeOf(item('world_let_word'))).toBe('string');
    expect(paramTypeOf(item('world_let_boolean'))).toBe('boolean');
    expect(paramTypeOf(item('world_let_vector'))).toBe('vector');
    expect(paramTypeOf(item('world_let_actor'))).toBe('actor');
  });

  it('reads `position` as its own type, not as a vector', () => {
    // The value that arrives is a vector either way; what differs is the call
    // site, which is an x and a y rather than an arrow grid — a different
    // block, so a different type (`typedValueInputs`, case 'position').
    expect(paramTypeOf(item('world_let_position'))).toBe('position');
  });

  it('still says nothing about a label', () => {
    expect(paramTypeOf(item('world_signature_text'))).toBeUndefined();
  });
});

describe('a `let` in the arguments row', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    define();
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'math_number',
        message0: '%1',
        args0: [{type: 'field_number', name: 'NUM', value: 0}],
        output: 'Number',
      },
    ]);
    workspace = new Blockly.Workspace();
    // The generator's flag, which stops the designer rebuilding a preview it
    // has no renderer to draw (`blockDesigner.rebuildDesign_`).
    (workspace as {isRuleGenerator?: boolean}).isRuleGenerator = true;
  });

  it('is read as a parameter, bound to its own variable', () => {
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const item = workspace.newBlock('world_let_number');
    item.setFieldValue(amount.getId(), 'VAR');
    block.getInput('ARGUMENTS')?.connection?.connect(item.previousConnection!);

    block.readArguments_();

    expect(block.saveExtraState().parts).toEqual([
      {kind: 'param', type: 'number', var: amount.getId(), name: 'amount'},
    ]);
  });

  it('takes its default from the value it is given', () => {
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const item = workspace.newBlock('world_let_number');
    item.setFieldValue(amount.getId(), 'VAR');
    seedShadow(item, 'VALUE', 'math_number', 'NUM', 5);
    block.getInput('ARGUMENTS')?.connection?.connect(item.previousConnection!);

    block.readArguments_();

    expect(block.saveExtraState().parts[0]).toMatchObject({default: 5});
  });

  it('has no default when the socket holds a calculation', () => {
    // A default is what a call site STARTS with, so it has to be a value. A
    // learner who plugs a real block in has written something the caller
    // cannot be given, and no default is the honest answer.
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const item = workspace.newBlock('world_let_number');
    item.setFieldValue(amount.getId(), 'VAR');
    const real = workspace.newBlock('math_number');
    item.getInput('VALUE')?.connection?.connect(real.outputConnection!);
    block.getInput('ARGUMENTS')?.connection?.connect(item.previousConnection!);

    block.readArguments_();

    expect(block.saveExtraState().parts[0]).not.toHaveProperty('default');
  });

  it('is what the row is written back as', () => {
    // The round trip: `parts` is the file, and opening a body surface writes
    // the row from it. A parameter a `let` can say comes back as one.
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    block.loadExtraState({
      parts: [
        {kind: 'label', text: 'push'},
        {
          kind: 'param',
          type: 'number',
          var: amount.getId(),
          name: 'amount',
        },
      ],
    });

    block.buildArguments_();

    expect(row(block)).toEqual(['world_signature_text', 'world_let_number']);
  });

  it('leaves `argument` to the types no `let` can say', () => {
    // A `kind` parameter, which is the block's remaining job.
    const block = host(workspace);
    block.loadExtraState({
      parts: [{kind: 'param', type: 'kind', var: '', name: 'what'}],
    });

    block.buildArguments_();

    expect(row(block)).toEqual(['world_signature_argument']);
  });

  it('writes an actor argument with no value to give it', () => {
    const block = host(workspace);
    const who = workspace.getVariableMap().createVariable('who', 'Actor');
    block.loadExtraState({
      parts: [{kind: 'param', type: 'actor', var: who.getId(), name: 'who'}],
    });

    block.buildArguments_();

    expect(row(block)).toEqual(['world_let_actor']);
    expect(
      block
        .getInput('ARGUMENTS')
        ?.connection?.targetBlock()
        ?.getFieldValue('VAR'),
    ).toBe(who.getId());
  });
});
