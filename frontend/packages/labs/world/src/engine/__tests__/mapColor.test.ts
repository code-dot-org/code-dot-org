// A map's own color, loaded into the World: the sky each Viewport paints.

import {describe, expect, it} from 'vitest';

import {WorldBuilder} from '../builders/WorldBuilder';

const fresh = () => new WorldBuilder({id: 'w', name: 'W'}).instantiate();

describe('the color a map brings into the World', () => {
  it('is the World’s sky while the map is loaded', () => {
    const world = fresh();
    world.loadWorldMap({actors: [], backgroundColor: '#336699'});

    expect(world.snapshot().clearColor).toEqual([0.2, 0.4, 0.6, 1]);
  });

  it('goes with the map, so a map with none shows the Viewport’s face', () => {
    const world = fresh();
    world.loadWorldMap({actors: [], backgroundColor: '#336699'});
    world.loadWorldMap({actors: []});

    expect(world.snapshot().clearColor).toBeUndefined();
  });

  it('may be changed by the map’s own script', () => {
    const world = fresh();
    world.loadWorldMap({
      actors: [],
      backgroundColor: '#336699',
      script: (live: typeof world) => void live.setBackgroundColor('#000000'),
    } as never);

    expect(world.snapshot().clearColor).toEqual([0, 0, 0, 1]);
  });
});
