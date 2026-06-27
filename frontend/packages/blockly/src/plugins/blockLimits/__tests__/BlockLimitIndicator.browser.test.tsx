import 'blockly/blocks';
import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import DefaultTheme from '../../../themes/default';

import BlockLimitIndicator from '../BlockLimitIndicator';
import BlockLimitMap from '../BlockLimitMap';

/*
 * The indicator draws an SVG bubble on the block and sizes it via getBBox(), so
 * it needs a rendered block — headless Chromium, not jsdom. indicatorFor (on the
 * map) is the integration point that constructs one, so it is covered here too.
 */

Blockly.setLocale(En as unknown as {[key: string]: string});

let container: HTMLDivElement;
let workspace: Blockly.WorkspaceSvg;

beforeEach(() => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  workspace = Blockly.inject(container, {});
});

afterEach(() => {
  workspace.dispose();
  container.remove();
});

const append = (type: string) =>
  Blockly.serialization.blocks.append({type}, workspace) as Blockly.BlockSvg;

// Text content of every <text> drawn on the block — block labels plus, once an
// indicator exists, its bubble. The count/'!' won't collide with block labels.
const textsOn = (block: Blockly.BlockSvg) =>
  Array.from(block.getSvgRoot().querySelectorAll('text')).map(
    t => t.textContent,
  );

describe('BlockLimitIndicator', () => {
  it('draws the remaining count as a bubble on the block', () => {
    const block = append('text_print');

    new BlockLimitIndicator(block, 3, DefaultTheme);

    expect(textsOn(block)).toContain('3');
  });

  it('shows "!" when over the limit (negative remaining)', () => {
    const block = append('text_print');
    const indicator = new BlockLimitIndicator(block, 0, DefaultTheme);

    indicator.updateCount(-1);

    const texts = textsOn(block);
    expect(texts).toContain('!');
    expect(texts).not.toContain('0');
  });
});

describe('BlockLimitMap.indicatorFor', () => {
  it('creates one indicator per block and caches it', () => {
    const block = append('text_print');
    const map = new BlockLimitMap(
      [
        {kind: 'block', type: 'text_print', extraState: {limit: 2}},
      ] as unknown as Blockly.utils.toolbox.ToolboxItemInfo[],
      DefaultTheme,
    );

    const first = map.indicatorFor('text_print', block);
    const second = map.indicatorFor('text_print', block);

    expect(first).toBe(second);
    expect(textsOn(block)).toContain('2'); // the block's limit
  });
});
