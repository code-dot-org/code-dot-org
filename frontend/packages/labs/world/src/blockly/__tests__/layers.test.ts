// The layers a block can name: every map's (`layers`, specs/VIEWPORT.md).

import {afterEach, describe, expect, it} from 'vitest';

import {DEFAULT_LAYER_ID} from '../../engine/core/Layer';
import {layerIdFromValue, layerOptions} from '../layers';
import {setProjectLayers} from '../moduleOptions';
import {projectLayerOptions} from '../projectModules';

afterEach(() => setProjectLayers([]));

describe('the layers a LAYER dropdown offers', () => {
  it('are every map’s, each id once, by name, and never a screen’s', () => {
    const files = {
      'maps/level.map': JSON.stringify({
        layers: [{id: 'layer1', name: 'Sky'}, {id: 'main'}],
      }),
      // A screen is flat, and a list it held anyway is not offered.
      'screens/main.screen': JSON.stringify({
        layers: [{id: 'hud', name: 'Interface'}],
      }),
      // The same id in a second map is the same layer to a dropdown.
      'maps/other.map': JSON.stringify({
        layers: [{id: 'layer1', name: 'Clouds'}],
      }),
      'maps/broken.map': '{',
      'actors/coin.actor': JSON.stringify({layers: [{id: 'nope'}]}),
    };

    expect(projectLayerOptions(files)).toEqual([
      ['Sky', 'layer1'],
      ['main', 'main'],
    ]);
  });

  it('lead with the default, which every map has', () => {
    setProjectLayers([['Sky', 'layer1']]);
    expect(layerOptions()).toEqual([
      ['Main', DEFAULT_LAYER_ID],
      ['Sky', 'layer1'],
    ]);
    // A project with no layers still has the default to offer.
    setProjectLayers([]);
    expect(layerOptions()).toEqual([['Main', DEFAULT_LAYER_ID]]);
  });
});

describe('resolving a LAYER dropdown value', () => {
  it('is the layer the value names, or the default for none', () => {
    expect(layerIdFromValue({} as never, 'hud')).toBe('hud');
    expect(layerIdFromValue({} as never, '')).toBe(DEFAULT_LAYER_ID);
  });
});
