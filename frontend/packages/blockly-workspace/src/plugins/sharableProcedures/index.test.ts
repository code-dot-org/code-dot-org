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
});
