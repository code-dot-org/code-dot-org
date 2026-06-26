import {blocks} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {PluginType} from '../../plugins';

import plugin from './index';

/*
 * A thin global plugin: on initialize it swaps Blockly's stock procedure blocks
 * for the shareable-procedures ones. Purely registry work, so jsdom is enough.
 */

describe('sharableProcedures plugin', () => {
  it('is a global plugin', () => {
    expect(plugin.type).toBe(PluginType.Global);
  });

  it('defines the shareable procedure blocks on initialize', () => {
    const types = Object.keys(blocks);
    expect(types.length).toBeGreaterThan(0);

    plugin.initialize();

    for (const type of types) {
      expect(Blockly.Blocks[type]).toBeDefined();
    }
  });

  it('registers the shareable definitions, not stand-ins of the same name', () => {
    plugin.initialize();

    // Each registered block is the exact shareable definition object — proof it
    // installed the shareable version rather than merely leaving something named
    // the same in place.
    for (const type of Object.keys(blocks)) {
      expect(Blockly.Blocks[type]).toBe(blocks[type as keyof typeof blocks]);
    }
  });

  it('replaces an existing procedure block of the same type', () => {
    const [type] = Object.keys(blocks);
    // Stand in a different definition under one of the procedure type names.
    const placeholder = {init() {}};
    Blockly.Blocks[type] = placeholder;

    plugin.initialize();

    expect(Blockly.Blocks[type]).not.toBe(placeholder);
    expect(Blockly.Blocks[type]).toBe(blocks[type as keyof typeof blocks]);
  });

  it('can be initialized repeatedly without error', () => {
    expect(() => {
      plugin.initialize();
      plugin.initialize();
    }).not.toThrow();

    for (const type of Object.keys(blocks)) {
      expect(Blockly.Blocks[type]).toBe(blocks[type as keyof typeof blocks]);
    }
  });
});
