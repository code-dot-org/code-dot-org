// A world's file as the map editor reads and writes it (`worldFileDocument`).

import {describe, expect, it} from 'vitest';

import {mapFileDocument, worldFileDocument} from '../worldDocument';

const WORLD = {
  blocks: {blocks: [{type: 'world_world', fields: {NAME: 'W'}}]},
  variables: [{id: 'v', name: 'score', type: 'Number'}],
  map: {
    size: {width: 8, height: 6},
    tile: {width: 32, height: 32},
    actors: [{type: 'actors/coin', id: 'c'}],
  },
};

describe('worldFileDocument', () => {
  it('reads the map beside the blocks, with defaults for what is missing', () => {
    const map = worldFileDocument.read(JSON.stringify(WORLD));
    expect(map.size).toEqual({width: 8, height: 6});
    expect(map.actors).toEqual([{type: 'actors/coin', id: 'c'}]);

    const bare = worldFileDocument.read('{"blocks":{}}');
    expect(bare.actors).toEqual([]);
    expect(bare.size.width).toBeGreaterThan(0);
    expect(worldFileDocument.read('{broken').actors).toEqual([]);
  });

  it('writes the map back beside the blocks, the blocks untouched', () => {
    const map = worldFileDocument.read(JSON.stringify(WORLD));
    const next = {
      ...map,
      actors: [...map.actors, {type: 'actors/coin', id: 'd'}],
    };

    const written = JSON.parse(
      worldFileDocument.write(JSON.stringify(WORLD), next),
    );

    expect(written.blocks).toEqual(WORLD.blocks);
    expect(written.variables).toEqual(WORLD.variables);
    expect(written.map.actors.map((actor: {id: string}) => actor.id)).toEqual([
      'c',
      'd',
    ]);
  });

  it('names the world’s module, and has no map script of its own', () => {
    expect(worldFileDocument.modulePath('worlds/main.world')).toBe(
      'worlds/main',
    );
    expect(worldFileDocument.hasMapScript).toBe(false);
    expect(mapFileDocument.modulePath('maps/level1.map')).toBe('maps/level1');
    expect(mapFileDocument.hasMapScript).toBe(true);
  });
});
