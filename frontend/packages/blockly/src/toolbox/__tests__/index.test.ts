import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {buildToolbox, toolboxFromCategoryBlocks} from '../index';

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
          // string entries become {kind:'block', type, id:type}; object entries pass through
          contents: [
            {
              kind: 'block',
              type: 'controls_repeat_ext',
              id: 'controls_repeat_ext',
            },
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
        // string entry gets id:type; object entry passes through unchanged
        {kind: 'block', type: 'text', id: 'text'},
        {kind: 'block', type: 'text_print'},
      ],
    });
  });
});

describe('toolboxFromCategoryBlocks', () => {
  it('builds categories from the spec, names taken as given', () => {
    const result = toolboxFromCategoryBlocks(
      {Play: ['play_sound'], 'My Bespoke': ['repeat', 'when_run']},
      'category',
    );
    expect(result).toEqual([
      {name: 'Play', blocks: ['play_sound']},
      {name: 'My Bespoke', blocks: ['repeat', 'when_run']},
    ]);
  });

  it('flattens all blocks into a single flyout', () => {
    const result = toolboxFromCategoryBlocks(
      {Play: ['play_sound', 'play_pattern']},
      'flyout',
    );
    expect(result).toEqual({name: '', blocks: ['play_sound', 'play_pattern']});
  });

  it('defaults to a category toolbox', () => {
    const result = toolboxFromCategoryBlocks({Play: ['play_sound']});
    expect(result).toEqual([{name: 'Play', blocks: ['play_sound']}]);
  });

  it('skips categories mapped to undefined', () => {
    const result = toolboxFromCategoryBlocks(
      {Play: ['play_sound'], Empty: undefined},
      'category',
    );
    expect(result).toEqual([{name: 'Play', blocks: ['play_sound']}]);
  });
});
