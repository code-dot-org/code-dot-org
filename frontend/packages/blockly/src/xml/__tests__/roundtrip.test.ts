import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import {afterEach, beforeAll, describe, expect, it} from 'vitest';

import {workspaceToXmlString} from '../../utils';
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

/*
 * Plan risk #2 (Blockly visual level editor, 2026-08-27): does
 * `Blockly.Xml.workspaceToDom` emit XML our reader's legacy `<mutation>`
 * handling (`elseif` -> `elseIfCount`, `else` -> `hasElse`,
 * `xml/index.ts`'s `mutationEntry`) can still read back?
 *
 * The blocks the plan named to test first (`karel_ifElse`, `maze_ifElse`,
 * `controls_repeat_dropdown` — packages/labs/maze/src/blocks.ts) turn out to
 * have NO mutator at all in this port: karel_ifElse/maze_ifElse are a fixed
 * message0/message1/message2 with static DO/ELSE inputs, and
 * controls_repeat_dropdown's TIMES is a plain field_dropdown. None of the
 * three exercise `mutationEntry`.
 *
 * The block that actually does is stock Blockly's own `controls_if`
 * (registered globally via `blockly/blocks`, packages/blockly/src/blocks/
 * index.ts's `legacyBlocks`) — real maze .level files use it directly, e.g.
 * `<block type="controls_if" inline="false"><mutation else="1"/>...`
 * (grepped across dashboard/config/levels/custom/maze/*.level). This suite
 * tests that one, since it is the one the mutation-remap code exists for.
 */
describe('capture round-trip (workspaceToXmlString) preserves controls_if mutation state', () => {
  const captureRoundTrip = (xml: string) => {
    workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(
      convertBlocklyXmlToJson(parser, xml),
      workspace,
    );
    const capturedXml = workspaceToXmlString(workspace);
    workspace.dispose();
    workspace = new Blockly.Workspace();
    return {
      capturedXml,
      recapturedState: Blockly.serialization.workspaces.save(
        (() => {
          Blockly.serialization.workspaces.load(
            convertBlocklyXmlToJson(parser, capturedXml),
            workspace,
          );
          return workspace;
        })(),
      ),
    };
  };

  it('round-trips a bare elseif/else controls_if through capture and back', () => {
    const {capturedXml, recapturedState} = captureRoundTrip(
      '<xml><block type="controls_if"><mutation elseif="1" else="1"/></block></xml>',
    );
    // The reader's own `<mutation>` dialect, not Blockly's serialized-state
    // dialect — this is what a re-imported .level file would carry.
    expect(capturedXml).toContain('elseif="1"');
    expect(capturedXml).toContain('else="1"');

    const controlsIf = recapturedState.blocks?.blocks?.[0];
    expect(controlsIf?.type).toBe('controls_if');
    expect(controlsIf?.extraState).toMatchObject({
      elseIfCount: 1,
      hasElse: true,
    });
  });

  it('strips block ids from the captured XML', () => {
    const {capturedXml} = captureRoundTrip(
      '<xml><block type="controls_if" id="keep-me-out"><mutation else="1"/></block></xml>',
    );
    expect(capturedXml).not.toContain('keep-me-out');
    expect(capturedXml).not.toContain('id=');
  });

  it('round-trips a real .level fixture shape: controls_if with a DO0 branch and a next chain', () => {
    // Mirrors "Course 4 Bee Params 3 (copy 1).level": a controls_if with an
    // else branch, nested inside a procedure body, followed by another
    // top-level block.
    const {recapturedState} = captureRoundTrip(
      '<xml><block type="rt_block">' +
        '<field name="MSG">before</field>' +
        '<next><block type="controls_if" inline="false">' +
        '<mutation else="1"/>' +
        '<statement name="DO0">' +
        '<block type="rt_block"><field name="MSG">inside-do</field></block>' +
        '</statement>' +
        '<statement name="ELSE">' +
        '<block type="rt_block"><field name="MSG">inside-else</field></block>' +
        '</statement>' +
        '</block></next>' +
        '</block></xml>',
    );
    const first = recapturedState.blocks?.blocks?.[0];
    expect(first).toMatchObject({fields: {MSG: 'before'}});
    const controlsIf = first?.next?.block;
    expect(controlsIf?.type).toBe('controls_if');
    expect(controlsIf?.extraState).toMatchObject({hasElse: true});
    expect(controlsIf?.inputs?.DO0?.block).toMatchObject({
      fields: {MSG: 'inside-do'},
    });
    expect(controlsIf?.inputs?.ELSE?.block).toMatchObject({
      fields: {MSG: 'inside-else'},
    });
  });
});
