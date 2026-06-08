import type * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import type {Theme} from '../../types';

import BlockLimitMap from './BlockLimitMap';

/*
 * BlockLimitMap is pure count/limit bookkeeping built from a toolbox definition;
 * only indicatorFor (covered in the browser test) touches Blockly. The theme is
 * unused on these paths, so a bare stub suffices.
 */

const theme = {} as Theme;

// kind:'block' entries with extraState.limit define limits; everything else is
// ignored. extraState is not on Blockly's published BlockInfo type.
const toolboxBlocks = [
  {kind: 'block', type: 'text_print', extraState: {limit: 2}},
  {kind: 'block', type: 'controls_if', extraState: {limit: 1}},
  {kind: 'block', type: 'math_number'}, // no limit -> untracked
  {kind: 'label', text: 'Section'}, // not a block -> ignored
] as unknown as Blockly.utils.toolbox.ToolboxItemInfo[];

const newMap = () => new BlockLimitMap(toolboxBlocks, theme);

describe('BlockLimitMap', () => {
  it('builds limits only from blocks that declare extraState.limit', () => {
    const map = newMap();
    expect(map.size).toBe(2);
    expect(map.has('text_print')).toBe(true);
    expect(map.has('controls_if')).toBe(true);
    expect(map.has('math_number')).toBe(false);
  });

  it('reports the configured limit, and Infinity for untracked types', () => {
    const map = newMap();
    expect(map.limitFor('text_print')).toBe(2);
    expect(map.limitFor('math_number')).toBe(Infinity);
  });

  it('starts every tracked count at zero', () => {
    const map = newMap();
    expect(map.get('text_print')).toBe(0);
    expect(map.remainingFor('text_print')).toBe(2);
  });

  it('tracks counts via set and increment', () => {
    const map = newMap();
    map.increment('text_print');
    map.increment('text_print');
    expect(map.get('text_print')).toBe(2);
    expect(map.remainingFor('text_print')).toBe(0);

    map.set('text_print', 1);
    expect(map.get('text_print')).toBe(1);
  });

  it('reports get() as 0 for an unknown type', () => {
    expect(newMap().get('does_not_exist')).toBe(0);
  });

  it('flags anyOver only once a type exceeds (not merely meets) its limit', () => {
    const map = newMap();
    expect(map.anyOver()).toBe(false);

    map.set('controls_if', 1); // at the limit
    expect(map.anyOver()).toBe(false);

    map.increment('controls_if'); // 2 > 1
    expect(map.anyOver()).toBe(true);
  });

  it('clear() resets counts back to zero', () => {
    const map = newMap();
    map.set('text_print', 2);
    map.set('controls_if', 2);

    map.clear();

    expect(map.get('text_print')).toBe(0);
    expect(map.get('controls_if')).toBe(0);
    expect(map.anyOver()).toBe(false);
  });
});
