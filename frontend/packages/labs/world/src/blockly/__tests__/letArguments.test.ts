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
      message0: 'let actor %1 be %2',
      args0: [
        {type: 'field_variable', name: 'VAR', variable: 'a'},
        {type: 'input_value', name: 'VALUE'},
      ],
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
      {
        type: 'math_arithmetic',
        message0: '%1 + %2',
        args0: [
          {type: 'input_value', name: 'A'},
          {type: 'input_value', name: 'B'},
        ],
        output: 'Number',
      },
      // What an actor argument starts with (`buildArguments_`).
      {type: 'world_this_actor', message0: 'this actor', output: 'Actor'},
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

  it("takes the whole block it is given as the call site's starting one", () => {
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const item = workspace.newBlock('world_let_number');
    item.setFieldValue(amount.getId(), 'VAR');
    seedShadow(item, 'VALUE', 'math_number', 'NUM', 5);
    block.getInput('ARGUMENTS')?.connection?.connect(item.previousConnection!);

    block.readArguments_();

    // A PLACEHOLDER, because that is what was in the socket: the author typed
    // over the `let`'s own shadow rather than plugging a block in.
    expect(block.saveExtraState().parts[0]).toMatchObject({
      shadow: {shadow: {type: 'math_number', fields: {NUM: 5}}},
    });
  });

  it('takes a real block too, and remembers that it was one', () => {
    // The point of the generalisation. A default used to be a value a field
    // could hold; it is whatever the author built now. What is stored is the
    // SOCKET — a block they plugged in stays a block — because a block that
    // came back as a shadow could not be dragged out again.
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const item = workspace.newBlock('world_let_number');
    item.setFieldValue(amount.getId(), 'VAR');
    const sum = workspace.newBlock('math_arithmetic');
    const left = workspace.newBlock('math_number');
    left.setFieldValue(2, 'NUM');
    sum.getInput('A')?.connection?.connect(left.outputConnection!);
    item.getInput('VALUE')?.connection?.connect(sum.outputConnection!);
    block.getInput('ARGUMENTS')?.connection?.connect(item.previousConnection!);

    block.readArguments_();

    const {shadow} = block.saveExtraState().parts[0] as {
      shadow?: {block?: {type: string; inputs?: Record<string, object>}};
    };

    // A BLOCK, because the author plugged one in — which is what lets them
    // pull it out again after the surface is rebuilt.
    expect(shadow?.block?.type).toBe('math_arithmetic');
    expect(shadow?.block?.inputs?.A).toMatchObject({
      block: {type: 'math_number', fields: {NUM: 2}},
    });
  });

  it('carries nothing when the socket is empty', () => {
    const block = host(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const item = workspace.newBlock('world_let_number');
    item.setFieldValue(amount.getId(), 'VAR');
    block.getInput('ARGUMENTS')?.connection?.connect(item.previousConnection!);

    block.readArguments_();

    expect(block.saveExtraState().parts[0]).not.toHaveProperty('shadow');
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

  it('starts an actor argument at `this actor`', () => {
    // It used to start at nothing, and an empty socket on a row that declares
    // an argument is not "nobody yet" — it is a default nobody could give,
    // drawn as a hole. `this actor` is what the call site is seeded with
    // anyway (`typedValueInputs`, case 'actor'), so the row shows the default
    // the caller will actually get.
    const block = host(workspace);
    const who = workspace.getVariableMap().createVariable('who', 'Actor');
    block.loadExtraState({
      parts: [{kind: 'param', type: 'actor', var: who.getId(), name: 'who'}],
    });

    block.buildArguments_();

    expect(row(block)).toEqual(['world_let_actor']);
    const item = block.getInput('ARGUMENTS')?.connection?.targetBlock();
    expect(item?.getFieldValue('VAR')).toBe(who.getId());
    expect(item?.getInputTargetBlock('VALUE')?.type).toBe('world_this_actor');
  });
});

describe('a starting block, after the surface is rebuilt', () => {
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
      {type: 'world_this_actor', message0: 'this actor', output: 'Actor'},
      {type: 'world_any_kind', message0: 'any kind', output: 'Actor'},
    ]);
    workspace = new Blockly.Workspace();
    (workspace as {isRuleGenerator?: boolean}).isRuleGenerator = true;
  });

  /** `define block` with the parts given, its arguments row written out. */
  const rebuilt = (parts: BlockPart[]) => {
    // The variables the parts name. `bindParts_` would make them, but this
    // workspace is flagged as the generator's so the designer does not rebuild
    // — and a `let` pointed at an id nothing holds draws nothing.
    for (const part of parts) {
      if (part.kind === 'param' && part.var) {
        workspace
          .getVariableMap()
          .createVariable(part.name ?? part.var, 'Actor', part.var);
      }
    }
    const block = host(workspace);
    block.loadExtraState({parts});
    block.buildArguments_();
    const row: Blockly.Block[] = [];
    for (
      let at = block.getInput('ARGUMENTS')?.connection?.targetBlock();
      at;
      at = at.getNextBlock()
    ) {
      row.push(at);
    }
    return {block, row};
  };

  it('comes back as a block, so it can be pulled out again', () => {
    // A shadow cannot be dragged. An author who plugs a block into a `let`,
    // leaves the surface and comes back must find the block they plugged in,
    // still theirs to move — so what was real is written back real.
    const {row} = rebuilt([
      {
        kind: 'param',
        type: 'number',
        var: 'n',
        name: 'amount',
        shadow: {block: {type: 'math_number', fields: {NUM: 7}}},
      },
    ]);
    const held = row[0].getInputTargetBlock('VALUE');

    expect(held?.type).toBe('math_number');
    expect(held?.isShadow()).toBe(false);
    // …and taking it off leaves the socket, rather than throwing.
    held?.outputConnection?.disconnect();
    expect(row[0].getInputTargetBlock('VALUE')).toBeNull();
  });

  it('comes back as a placeholder when that is what it was', () => {
    const {row} = rebuilt([
      {
        kind: 'param',
        type: 'number',
        var: 'n',
        name: 'amount',
        shadow: {shadow: {type: 'math_number', fields: {NUM: 7}}},
      },
    ]);

    expect(row[0].getInputTargetBlock('VALUE')?.isShadow()).toBe(true);
  });

  it('leaves one actor argument alone when another is filled in', () => {
    // Two of the same type, and only the second was given something. The first
    // keeps the `this actor` every actor argument starts with; nothing about
    // one part reaches the other.
    const {row} = rebuilt([
      {kind: 'param', type: 'actor', var: 'a', name: 'who'},
      {kind: 'label', text: 'and'},
      {
        kind: 'param',
        type: 'actor',
        var: 'b',
        name: 'other',
        shadow: {block: {type: 'world_any_kind'}},
      },
    ]);

    expect(row[0].getInputTargetBlock('VALUE')?.type).toBe('world_this_actor');
    expect(row[0].getInputTargetBlock('VALUE')?.isShadow()).toBe(true);
    expect(row[2].getInputTargetBlock('VALUE')?.type).toBe('world_any_kind');
    expect(row[2].getInputTargetBlock('VALUE')?.isShadow()).toBe(false);
  });

  it('reads that pair back as the two different things they are', () => {
    // The round trip of the case above: what is written out has to survive
    // being read in, or the second visit to a surface would lose one of them.
    const {block, row} = rebuilt([
      {kind: 'param', type: 'actor', var: 'a', name: 'who'},
      {kind: 'label', text: 'and'},
      {
        kind: 'param',
        type: 'actor',
        var: 'b',
        name: 'other',
        shadow: {block: {type: 'world_any_kind'}},
      },
    ]);
    expect(row).toHaveLength(3);

    block.readArguments_();
    const parts = block.saveExtraState().parts;

    expect(parts[0]).toMatchObject({
      shadow: {shadow: {type: 'world_this_actor'}},
    });
    expect(parts[2]).toMatchObject({shadow: {block: {type: 'world_any_kind'}}});
  });
});
