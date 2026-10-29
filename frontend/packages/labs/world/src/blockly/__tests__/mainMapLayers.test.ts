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
    expect(layerDeclarations(LAYERS)).toBe(
      'world.defineScreenLayer({id: "layer1", name: "Sky", parallax: new WorldLab.Vector(0.2, 0)});\n' +
        'world.defineScreenLayer({id: "main"});\n' +
        'world.defineScreenLayer({id: "layer2", name: "Fog", fit: true});\n' +
        'world.setScreenBackground("sky.png", "layer1");\n' +
        'world.setScreenBackgroundRepeat(true, "layer1");\n' +
        'world.setScreenBackgroundOffset(new WorldLab.Vector(4, 0), "layer1");\n' +
        'world.setScreenBackground("fog.png", "layer2");\n',
    );
  });

  it('says nothing for a map with no layers', () => {
    expect(layerDeclarations([])).toBe('');
  });
});
