import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {PluginType} from '../../plugins';
import CdoConstantsProvider from '../../renderers/constants';
import {
  RectangleInputPlugin,
  RoundInputPlugin,
  TriangleInputPlugin,
} from '../index';

type PuzzleTab = Blockly.blockRendering.PuzzleTab;

const pathsOf = (make: typeof RectangleInputPlugin) => {
  const tab = make('T').makePath.call(new CdoConstantsProvider([]), 7);
  return {up: tab.pathUp, down: tab.pathDown, tab};
};

describe('inputs.md: the shapes', () => {
  it('INP-1: each factory makes an input plugin for the given type', () => {
    for (const [make, shape] of [
      [RectangleInputPlugin, 'RECTANGLE'],
      [RoundInputPlugin, 'ROUND'],
      [TriangleInputPlugin, 'TRIANGLE'],
    ] as const) {
      const plugin = make('Location');
      expect(plugin.type).toBe(PluginType.Input);
      expect(plugin.check).toBe('Location');
      expect(plugin.shape).toBe(shape);
    }
  });

  it("INP-2: a shape takes the provider's tab size and the given number", () => {
    const {tab} = pathsOf(RectangleInputPlugin);
    expect(tab).toMatchObject({type: 7, width: 8, height: 15});
  });

  it('INP-3: the rectangle', () => {
    expect(pathsOf(RectangleInputPlugin)).toMatchObject({
      up: ' l -8,0  0,-15  8,0 ',
      down: ' l -8,0  0,15  8,0 ',
    });
  });

  it('INP-4: the round notch', () => {
    expect(pathsOf(RoundInputPlugin)).toMatchObject({
      up: ' c-12, 0 -12, -15 0, -15 ',
      down: ' c-12, 0 -12, 15 0, 15 ',
    });
  });

  it('INP-5: the triangle', () => {
    expect(pathsOf(TriangleInputPlugin)).toMatchObject({
      up: ' l -8,-7.5  8,-7.5 ',
      down: ' l -8,7.5  8,7.5 ',
    });
  });
});

describe('inputs.md: using them', () => {
  it('INP-7: a value connection of the type is drawn with the shape', () => {
    const provider = new CdoConstantsProvider([
      RectangleInputPlugin('Location'),
    ]);
    provider.init();
    const connection = {
      type: Blockly.ConnectionType.INPUT_VALUE,
      getCheck: () => ['Location'],
    } as unknown as Blockly.RenderedConnection;

    const shape = provider.shapeFor(connection) as PuzzleTab;
    expect(shape.pathDown).toBe(' l -8,0  0,15  8,0 ');
  });
});
