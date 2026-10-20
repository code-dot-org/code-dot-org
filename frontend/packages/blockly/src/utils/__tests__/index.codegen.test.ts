import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, describe, expect, it} from 'vitest';

import {
  domToBlockSpace,
  getAllGeneratedCode,
  getAllUsedBlocks,
  getBlockFields,
  getCodeFromBlockJsonSource,
  getCodeFromBlockXmlSource,
} from '../index';

/*
 * The code-generation helpers build a throwaway headless workspace from XML or
 * JSON and run the JavaScript generator over it — no rendering, so jsdom is
 * enough. Standard block definitions (blockly/blocks) and their generators
 * (pulled in by utils/index via blockly/javascript) must be present, and the
 * locale must be set or block init throws on the unresolved %{BKY_...} messages.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

let workspace: Blockly.Workspace | undefined;
afterEach(() => {
  workspace?.dispose();
  workspace = undefined;
});

describe('xml-toolbox.md: getCodeFromBlockXmlSource', () => {
  it('XML-12: generates code for a print block fed by a text block', () => {
    const code = getCodeFromBlockXmlSource(
      '<xml><block type="text_print">' +
        '<value name="TEXT"><block type="text"><field name="TEXT">hi</field></block></value>' +
        '</block></xml>',
    );
    expect(code).toContain("window.alert('hi')");
  });
});

describe('xml-toolbox.md: getCodeFromBlockJsonSource', () => {
  it('XML-12: generates the same code from the equivalent serialized JSON', () => {
    const code = getCodeFromBlockJsonSource({
      blocks: {
        blocks: [
          {
            type: 'text_print',
            inputs: {TEXT: {shadow: {type: 'text', fields: {TEXT: 'hi'}}}},
          },
        ],
      },
    });
    expect(code).toContain("window.alert('hi')");
  });

  it('XML-12: generates a loop body for controls_repeat_ext', () => {
    const code = getCodeFromBlockJsonSource({
      blocks: {
        blocks: [
          {
            type: 'controls_repeat_ext',
            inputs: {
              TIMES: {shadow: {type: 'math_number', fields: {NUM: 3}}},
              DO: {
                block: {
                  type: 'text_print',
                  inputs: {TEXT: {shadow: {type: 'text', fields: {TEXT: 'x'}}}},
                },
              },
            },
          },
        ],
      },
    });
    expect(code).toMatch(/for \(/);
    expect(code).toContain("window.alert('x')");
  });

  it('XML-12: returns empty code for an empty program', () => {
    expect(getCodeFromBlockJsonSource({}).trim()).toBe('');
  });
});

describe('xml-toolbox.md: domToBlockSpace', () => {
  it('XML-12: creates the top-level blocks in source order', () => {
    workspace = new Blockly.Workspace();
    const dom = Blockly.utils.xml.textToDom(
      '<xml><block type="text_print"/><block type="controls_whileUntil"/></xml>',
    );

    const blocks = domToBlockSpace(dom, workspace);

    expect(blocks.map(b => b.type)).toEqual([
      'text_print',
      'controls_whileUntil',
    ]);
  });
});

const print = (text: string) => ({
  type: 'text_print',
  inputs: {TEXT: {block: {type: 'text', fields: {TEXT: text}}}},
});

describe('xml-toolbox.md: getAllGeneratedCode', () => {
  it('XML-11: follows extraCode with each workspace, in order', () => {
    workspace = new Blockly.Workspace();
    const second = new Blockly.Workspace();
    Blockly.serialization.blocks.append(print('a'), workspace);
    Blockly.serialization.blocks.append(print('b'), second);
    const code = getAllGeneratedCode({
      extraCode: '// start\n',
      workspaces: [workspace, second],
    });
    expect(code).toBe(
      "// start\n\n\n\nwindow.alert('a');\n\n\n\nwindow.alert('b');\n",
    );
    second.dispose();
  });

  it('XML-11: generates only blocks of startBlock when given', () => {
    workspace = new Blockly.Workspace();
    Blockly.serialization.blocks.append(print('a'), workspace);
    Blockly.serialization.blocks.append(
      {type: 'math_number', fields: {NUM: 1}},
      workspace,
    );
    expect(
      getAllGeneratedCode({workspaces: [workspace], startBlock: 'text_print'}),
    ).toBe("\n\n\nwindow.alert('a');\n");
  });

  it('XML-11, XML-V4: generates a loose value block as a statement', () => {
    workspace = new Blockly.Workspace();
    Blockly.serialization.blocks.append(
      {type: 'math_number', fields: {NUM: 42}},
      workspace,
    );
    Blockly.serialization.blocks.append(print('a'), workspace);
    expect(getAllGeneratedCode({workspaces: [workspace]})).toBe(
      "\n\n\n42;\n\nwindow.alert('a');\n",
    );
  });
});

describe('xml-toolbox.md: block helpers', () => {
  it('XML-13: getBlockFields lists every input field in order', () => {
    workspace = new Blockly.Workspace();
    const block = Blockly.serialization.blocks.append(
      {type: 'controls_repeat_ext'},
      workspace,
    );
    expect(getBlockFields(block).map(field => field.getText())).toEqual(
      block.inputList.flatMap(input => input.fieldRow.map(f => f.getText())),
    );
  });

  it('XML-13: getAllUsedBlocks leaves out disabled blocks and their children', () => {
    workspace = new Blockly.Workspace();
    const used = Blockly.serialization.blocks.append(print('a'), workspace);
    const unused = Blockly.serialization.blocks.append(print('b'), workspace);
    unused.setDisabledReason(true, 'test');
    expect(getAllUsedBlocks(workspace)).toEqual(
      expect.arrayContaining([used, used.getChildren(false)[0]]),
    );
    expect(getAllUsedBlocks(workspace)).toHaveLength(2);
  });
});

describe('xml-toolbox.md: generating from a source', () => {
  it('XML-12: generates a loose value block in JSON as a statement', () => {
    expect(
      getCodeFromBlockJsonSource({
        blocks: {blocks: [{type: 'math_number', fields: {NUM: 42}}]},
      }),
    ).toBe('\n\n\n42;\n');
  });
});
