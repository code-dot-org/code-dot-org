import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {buildToolbox} from './index';

/*
 * buildToolbox is a pure transform from our simplified toolbox config into the
 * ToolboxInfo Blockly consumes — no workspace, no DOM — so it lives in jsdom.
 */

describe('buildToolbox', () => {
  it('passes a native Blockly toolbox (kind already set) through unchanged', () => {
    const native = {
      kind: 'categoryToolbox',
      contents: [{kind: 'category', name: 'X', contents: []}],
    } as Blockly.utils.toolbox.ToolboxInfo;

    expect(buildToolbox(native)).toBe(native);
  });

  it('builds a categoryToolbox from an array of categories', () => {
    const result = buildToolbox([
      {
        name: 'Loops',
        blocks: [
          'controls_repeat_ext',
          {kind: 'block', type: 'controls_whileUntil'},
        ],
      },
    ]);

    expect(result).toEqual({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Loops',
          // string entries become {kind:'block', type}, object entries pass through
          contents: [
            {kind: 'block', type: 'controls_repeat_ext'},
            {kind: 'block', type: 'controls_whileUntil'},
          ],
        },
      ],
    });
  });

  it('marks a dynamic category with custom=key and defaults empty blocks', () => {
    const result = buildToolbox([
      {name: 'Variables', key: 'VARIABLE', onLoad: () => []},
    ]) as Blockly.utils.toolbox.StaticCategoryInfo;

    expect(result.contents[0]).toEqual({
      kind: 'category',
      name: 'Variables',
      custom: 'VARIABLE',
      contents: [],
    });
  });

  it('builds a flyoutToolbox from a single static category', () => {
    const result = buildToolbox({
      name: 'flyout',
      blocks: ['text', {kind: 'block', type: 'text_print'}],
    });

    expect(result).toEqual({
      kind: 'flyoutToolbox',
      contents: [
        {kind: 'block', type: 'text'},
        {kind: 'block', type: 'text_print'},
      ],
    });
  });
});
