// The layers a block can name: its own map's (`layers`, specs/VIEWPORT.md).

import * as Blockly from 'blockly/core';
import {afterEach, describe, expect, it} from 'vitest';

import {DEFAULT_LAYER_ID} from '../../engine/core/Layer';
import {setEditingFile} from '../editingRule';
import {ROOT_HOMES} from '../fileKind';
import {layerIdFromValue, layerOptions} from '../layers';
import {setMapLayers} from '../moduleOptions';
import {mapLayerOptions} from '../projectModules';

afterEach(() => setMapLayers({}));

/** A LAYER dropdown on a block in the code of `modulePath`. */
const fieldIn = (modulePath: string | undefined) => {
  const workspace = new Blockly.Workspace();
  setEditingFile(workspace as never, modulePath);
  const block = workspace.newBlock('text');
  return {getSourceBlock: () => block} as unknown as Parameters<
    typeof layerOptions
  >[0];
};

describe('the layers a project’s maps hold', () => {
  it('are each map’s own, by the names the map editor shows, and never a screen’s', () => {
    const files = {
      'maps/level.map': JSON.stringify({
        layers: [{id: 'layer1', name: 'Sky'}, {id: 'main'}],
      }),
      // A second map's layer of the same id is that map's, under its name.
      'maps/other.map': JSON.stringify({
        layers: [{id: 'layer1', name: 'Clouds'}],
      }),
      // A screen is flat, and a list it held anyway is not offered.
      'screens/main.screen': JSON.stringify({
        layers: [{id: 'hud', name: 'Interface'}],
      }),
      'maps/broken.map': '{',
      'actors/coin.actor': JSON.stringify({layers: [{id: 'nope'}]}),
    };

    expect(mapLayerOptions(files)).toEqual({
      'maps/level': [
        ['Sky', 'layer1'],
        ['Main', 'main'],
      ],
      // The default is every map's, at the back where a map does not place it.
      'maps/other': [
        ['Main', 'main'],
        ['Clouds', 'layer1'],
      ],
    });
  });
});

describe('a LAYER dropdown', () => {
  it('offers the layers of the map whose code it is in, the default first', () => {
    setMapLayers({
      'maps/level': [['Sky', 'layer1']],
      'maps/other': [['Clouds', 'layer1']],
    });
    expect(layerOptions(fieldIn('maps/level'))).toEqual([
      ['Main', DEFAULT_LAYER_ID],
      ['Sky', 'layer1'],
    ]);
    expect(layerOptions(fieldIn('maps/other'))).toEqual([
      ['Main', DEFAULT_LAYER_ID],
      ['Clouds', 'layer1'],
    ]);
  });

  it('offers no map’s layers outside a map', () => {
    setMapLayers({'maps/level': [['Sky', 'layer1']]});
    expect(layerOptions(fieldIn('actors/hero'))).toEqual([
      ['Main', DEFAULT_LAYER_ID],
    ]);
    expect(layerOptions()).toEqual([['Main', DEFAULT_LAYER_ID]]);
  });

  it('is on blocks only a map and its placements are offered', () => {
    for (const type of ['world_all_actors_in_layer', 'world_is_in_layer']) {
      expect([...(ROOT_HOMES.get(type) ?? [])]).toEqual(['map', 'placement']);
    }
  });
});

describe('resolving a LAYER dropdown value', () => {
  it('is the layer the value names, or the default for none', () => {
    expect(layerIdFromValue({} as never, 'hud')).toBe('hud');
    expect(layerIdFromValue({} as never, '')).toBe(DEFAULT_LAYER_ID);
  });
});
