// The main map's layers as the world's declaration (`mainMapLayers`,
// specs/LAYERS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {layerDeclarations, mainMapLayersOf} from '../mainMapLayers';

const LAYERS = [
  {
    id: 'layer1',
    name: 'Sky',
    parallax: {x: 0.2, y: 0},
    background: {sprite: 'sky.png', repeat: true, offset: {x: 4, y: 0}},
  },
  {id: 'main'},
  {id: 'layer2', name: 'Fog', fit: true, foreground: {sprite: 'fog.png'}},
];

describe('mainMapLayersOf', () => {
  it('reads the layers a world’s map states, or none', () => {
    expect(mainMapLayersOf(JSON.stringify({map: {layers: LAYERS}}))).toEqual(
      LAYERS,
    );
    expect(mainMapLayersOf('{"blocks":{}}')).toEqual([]);
    expect(mainMapLayersOf('{broken')).toEqual([]);
    expect(mainMapLayersOf('{"map":{"layers":[{"name":"no id"}]}}')).toEqual(
      [],
    );
  });
});

describe('layerDeclarations', () => {
  it('declares the map’s layers in order, then sets their slots', () => {
    expect(layerDeclarations(LAYERS, [], 'main')).toBe(
      'world.defineLayer({id: "layer1", name: "Sky", parallax: new WorldLab.Vector(0.2, 0)});\n' +
        'world.defineLayer({id: "main"});\n' +
        'world.defineLayer({id: "layer2", name: "Fog", fit: true});\n' +
        'world.setBackground("sky.png", "layer1");\n' +
        'world.setBackgroundRepeat(true, "layer1");\n' +
        'world.setBackgroundOffset(new WorldLab.Vector(4, 0), "layer1");\n' +
        'world.setForeground("fog.png", "layer2");\n',
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
