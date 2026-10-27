// The main map's layers as the world's declaration (`mainMapLayers`,
// specs/LAYERS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {layerDeclarations} from '../mainMapLayers';

const LAYERS = [
  {
    id: 'layer1',
    name: 'Sky',
    parallax: {x: 0.2, y: 0},
    background: {sprite: 'sky.png', repeat: true, offset: {x: 4, y: 0}},
  },
  {id: 'main'},
  // Fog over the game: a layer in front of it, with a background of its own.
  {id: 'layer2', name: 'Fog', fit: true, background: {sprite: 'fog.png'}},
];

describe('layerDeclarations', () => {
  it('declares the map’s layers in order, then sets their slots', () => {
    expect(layerDeclarations(LAYERS, [], 'main')).toBe(
      'world.defineLayer({id: "layer1", name: "Sky", parallax: new WorldLab.Vector(0.2, 0)});\n' +
        'world.defineLayer({id: "main"});\n' +
        'world.defineLayer({id: "layer2", name: "Fog", fit: true});\n' +
        'world.setBackground("sky.png", "layer1");\n' +
        'world.setBackgroundRepeat(true, "layer1");\n' +
        'world.setBackgroundOffset(new WorldLab.Vector(4, 0), "layer1");\n' +
        'world.setBackground("fog.png", "layer2");\n',
    );
  });

  it('says when mirrors leave a layer out, and only then', () => {
    // specs/MIRRORING_PLAN.md, step 8: shown is what a layer says by saying
    // nothing.
    expect(
      layerDeclarations(
        [{id: 'hud', fit: true, inMirrors: false}, {id: 'main'}],
        [],
        'main',
      ),
    ).toBe(
      'world.defineLayer({id: "hud", fit: true, inMirrors: false});\n' +
        'world.defineLayer({id: "main"});\n',
    );
  });

  it('puts the blocks’ layers after, less the ones the map names', () => {
    const code = layerDeclarations(
      [{id: 'main'}],
      [{id: 'layer_hud'}, {id: 'main'}],
      'main',
    );
    expect(code).toBe(
      'world.defineLayer({id: "main"});\n' +
        'world.defineLayer({id: "layer_hud"});\n',
    );
  });

  it('says what the blocks alone said, when the map names none', () => {
    expect(
      layerDeclarations([], [{id: 'layer_hud'}, {id: 'main'}], 'main'),
    ).toBe(
      'world.defineLayer({id: "layer_hud"});\nworld.defineLayer({id: "main"});\n',
    );
    // …and nothing at all for a world with no layers anywhere.
    expect(layerDeclarations([], [{id: 'main'}], 'main')).toBe('');
    expect(layerDeclarations([], [], 'main')).toBe('');
  });
});
