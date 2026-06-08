import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, describe, expect, it} from 'vitest';

import {
  domToBlockSpace,
  getCodeFromBlockJsonSource,
  getCodeFromBlockXmlSource,
} from './index';

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

describe('getCodeFromBlockXmlSource', () => {
  it('generates code for a print block fed by a text block', () => {
    const code = getCodeFromBlockXmlSource(
      '<xml><block type="text_print">' +
        '<value name="TEXT"><block type="text"><field name="TEXT">hi</field></block></value>' +
        '</block></xml>',
    );
    expect(code).toContain("window.alert('hi')");
  });
});

describe('getCodeFromBlockJsonSource', () => {
  it('generates the same code from the equivalent serialized JSON', () => {
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

  it('generates a loop body for controls_repeat_ext', () => {
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

  it('returns empty code for an empty program', () => {
    expect(getCodeFromBlockJsonSource({}).trim()).toBe('');
  });
});

describe('domToBlockSpace', () => {
  it('creates the top-level blocks in source order', () => {
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
