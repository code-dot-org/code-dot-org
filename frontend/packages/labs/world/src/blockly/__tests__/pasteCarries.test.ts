// What a copied block brings with it into another file.
//
// The paste shortcut is ours; what is on the clipboard is Blockly's, and the
// spec leans on two of its habits (specs/PASTE.md): a copy carries a variable
// field in full, so the destination declares a variable it has not got, and a
// block keeps its id unless the destination has one already. Both are pinned
// here against the serializer with the options a copy uses, so a Blockly
// upgrade that changed either would say so.

import * as Blockly from 'blockly/core';
import {beforeAll, describe, expect, it} from 'vitest';

import {
  SCOPED_DEFAULT_EXTENSION,
  scopedVariableDefaultExtension,
} from '../extensions/scopedVariableDefault';
import {
  registerScopedVariableField,
  SCOPED_VARIABLE_FIELD,
} from '../fields/scopedVariable';

const BLOCKLYS = 'test_paste_blockly_variable';
const OURS = 'test_paste_scoped_variable';

beforeAll(() => {
  // The variable dropdown's own rows, which Blockly reads on the first look.
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  registerScopedVariableField();
  if (!Blockly.Extensions.isRegistered(SCOPED_DEFAULT_EXTENSION)) {
    Blockly.Extensions.register(
      SCOPED_DEFAULT_EXTENSION,
      scopedVariableDefaultExtension.extension as never,
    );
  }
  Blockly.defineBlocksWithJsonArray([
    {
      type: BLOCKLYS,
      message0: 'set %1',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variableTypes: ['Actor'],
          defaultType: 'Actor',
        },
      ],
      previousStatement: true,
      nextStatement: true,
    },
    {
      type: OURS,
      message0: '%1',
      args0: [
        {
          type: SCOPED_VARIABLE_FIELD,
          name: 'VAR',
          variableTypes: ['Actor'],
          defaultType: 'Actor',
        },
      ],
      extensions: [SCOPED_DEFAULT_EXTENSION],
      output: 'Actor',
    },
  ]);
});

/** What `BlockSvg.toCopyData` puts on the clipboard, for a bare block. */
const copyOf = (block: Blockly.Block) =>
  Blockly.serialization.blocks.save(block, {
    addCoordinates: true,
    addNextBlocks: false,
  })!;

describe('a variable travels with its block', () => {
  it.each([
    ['Blockly’s own field', BLOCKLYS],
    ['the lab’s scoped field', OURS],
  ])('through %s', (_which, type) => {
    const from = new Blockly.Workspace();
    const shot = from.getVariableMap().createVariable('shot', 'Actor');
    const block = from.newBlock(type);
    block.setFieldValue(shot.getId(), 'VAR');

    const state = copyOf(block);
    const into = new Blockly.Workspace();
    expect(into.getVariableMap().getVariableById(shot.getId())).toBeNull();

    const pasted = Blockly.serialization.blocks.append(state, into);
    const declared = into.getVariableMap().getVariableById(shot.getId());
    expect(declared?.getName()).toBe('shot');
    expect(declared?.getType()).toBe('Actor');
    expect(pasted.getFieldValue('VAR')).toBe(shot.getId());
  });
});

describe('a block’s id', () => {
  it('is kept where the destination has no block by it', () => {
    const from = new Blockly.Workspace();
    const block = from.newBlock(BLOCKLYS, 'kept_id');

    const pasted = Blockly.serialization.blocks.append(
      copyOf(block),
      new Blockly.Workspace(),
    );
    expect(pasted.id).toBe('kept_id');
  });

  it('is fresh where the destination already holds it', () => {
    const from = new Blockly.Workspace();
    const block = from.newBlock(BLOCKLYS, 'taken_id');
    const into = new Blockly.Workspace();
    into.newBlock(BLOCKLYS, 'taken_id');

    const pasted = Blockly.serialization.blocks.append(copyOf(block), into);
    expect(pasted.id).not.toBe('taken_id');
  });
});
