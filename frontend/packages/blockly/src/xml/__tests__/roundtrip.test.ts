import * as Blockly from 'blockly/core';
import {afterEach, beforeAll, describe, expect, it} from 'vitest';

import {convertBlocklyXmlToJson} from '../index';

/*
 * The converter's purpose is to turn Blockly XML into JSON offline — JSON that
 * Blockly itself can later deserialize without a workspace having produced it.
 * These tests close that loop in a headless workspace: XML -> convert -> load ->
 * save, asserting the round-trip preserves type, fields, value inputs, and next
 * chains. This is what proves the converter emits a shape Blockly accepts, which
 * the offline string-level tests in index.test.ts cannot.
 */

const parser = new DOMParser();

beforeAll(() => {
  // Block definitions the fixtures reference. Guarded so re-imports in a shared
  // worker do not redefine (defineBlocksWithJsonArray throws on a duplicate).
  if (!Blockly.Blocks['rt_block']) {
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'rt_block',
        message0: '%1 %2',
        args0: [
          {type: 'field_input', name: 'MSG'},
          {type: 'input_value', name: 'VAL'},
        ],
        previousStatement: null,
        nextStatement: null,
      },
      {
        type: 'rt_num',
        message0: '%1',
        args0: [{type: 'field_number', name: 'NUM'}],
        output: null,
      },
    ]);
  }
});

let workspace: Blockly.Workspace;
afterEach(() => workspace?.dispose());

// Convert XML, load it into a fresh headless workspace, and serialize back out.
const roundTrip = (xml: string) => {
  workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(
    convertBlocklyXmlToJson(parser, xml),
    workspace,
  );
  return Blockly.serialization.workspaces.save(workspace);
};

describe('convertBlocklyXmlToJson round-trips through Blockly', () => {
  it('loads a single block with a field', () => {
    const state = roundTrip(
      '<xml><block type="rt_block"><field name="MSG">hello</field></block></xml>',
    );
    expect(state.blocks?.blocks?.[0]).toMatchObject({
      type: 'rt_block',
      fields: {MSG: 'hello'},
    });
  });

  it('preserves a value input and the nested block, including a numeric field', () => {
    const state = roundTrip(
      '<xml><block type="rt_block">' +
        '<field name="MSG">outer</field>' +
        '<value name="VAL"><block type="rt_num"><field name="NUM">42</field></block></value>' +
        '</block></xml>',
    );
    const inner = state.blocks?.blocks?.[0]?.inputs?.VAL?.block;
    expect(inner).toMatchObject({type: 'rt_num', fields: {NUM: 42}});
    // the coerced number survives as a number through field_number
    expect(typeof inner?.fields?.NUM).toBe('number');
  });

  it('preserves a next chain', () => {
    const state = roundTrip(
      '<xml><block type="rt_block">' +
        '<field name="MSG">first</field>' +
        '<next><block type="rt_block"><field name="MSG">second</field></block></next>' +
        '</block></xml>',
    );
    const top = state.blocks?.blocks?.[0];
    expect(top).toMatchObject({fields: {MSG: 'first'}});
    expect(top?.next?.block).toMatchObject({
      type: 'rt_block',
      fields: {MSG: 'second'},
    });
  });
});
