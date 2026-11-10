import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import Registry from '../../../Registry';
import {plugin} from '../index';

describe('fields.md: the colour field', () => {
  it('FLD-10, FLD-11: installs the colour field and blocks, and leaves them installed', () => {
    const registry = new Registry();
    registry.register(plugin);

    expect(
      Blockly.registry.hasItem(Blockly.registry.Type.FIELD, 'field_colour'),
    ).toBe(true);
    for (const type of [
      'colour_picker',
      'colour_rgb',
      'colour_blend',
      'colour_random',
    ]) {
      expect(Blockly.Blocks[type]).toBeDefined();
    }

    registry.unregisterAll();

    expect(
      Blockly.registry.hasItem(Blockly.registry.Type.FIELD, 'field_colour'),
    ).toBe(true);
    expect(Blockly.Blocks.colour_picker).toBeDefined();
  });
});
