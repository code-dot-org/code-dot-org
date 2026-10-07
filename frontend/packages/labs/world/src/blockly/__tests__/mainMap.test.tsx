// A world's main map: the `map` beside its `blocks`, compiled into the world's
// module and loaded after the world's prologue and BEFORE its rows, so that a
// row can name a placement (specs/MAIN_MAP_PLAN.md,
// specs/MAP_BEFORE_ROWS_PLAN.md).

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {PositionProperty} from '../../engine';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';

/** `when this actor is created` → `pause the game`, on one placement. */
const PAUSES_ON_CREATE = {
  blocks: {
    blocks: [
      {
        type: 'world_on_Space_CreatedEvent',
        next: {block: {type: 'world_pause_game'}},
      },
    ],
  },
};

const world = (map?: object) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Main'},
          // A row of its own, so the main map's load can be seen to precede it.
          next: {block: {type: 'world_resume_game'}},
        },
      ],
    },
    ...(map ? {map} : {}),
  });

const COIN = JSON.stringify({
  blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Coin'}}]},
});

const MAIN = {
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  actors: [
    {
      type: 'actors/coin',
      id: 'c',
      properties: {positional: {position: {x: 48, y: 48}}},
      blocks: PAUSES_ON_CREATE,
    },
    {type: 'actors/coin', id: 'd'},
  ],
};

const generate = async (contents: string): Promise<string> => {
  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} />);
  await new Promise(resolve => setTimeout(resolve, 50));
  return ref.current!.generate(contents, 'worlds/main.world');
};

describe('the main map in the world’s module', () => {
  it('is data, defined kinds, and a load, before the world’s own rows', async () => {
    const js = await generate(world(MAIN));
    const data = JSON.parse(js.match(/^const mainMap = (.*);$/m)![1]) as {
      actors: Array<Record<string, unknown>>;
    };

    expect(data.actors.map(actor => actor.id)).toEqual(['c', 'd']);
    expect(data.actors.every(actor => !('blocks' in actor))).toBe(true);
    expect(js).toContain('import ActorsCoin from "actors/coin";');
    expect(js).toContain('world.define("actors/coin", ActorsCoin);');
    expect(js).toContain('world.loadMap(mainMap);');
    // Inside the world block: after `const world` and what has to precede
    // a placement, before the row chained under `define world`, and before
    // any hat of the world's.
    const at = (text: string) => js.indexOf(text);
    expect(at('const world = ')).toBeGreaterThanOrEqual(0);
    expect(at('const world = ')).toBeLessThan(at('world.loadMap(mainMap);'));
    expect(at('world.loadMap(mainMap);')).toBeLessThan(at('world.resume();'));
  });

  it('lifts a `use rule` row above the load, where a rule still may be used', async () => {
    // `WorldBuilder` refuses a rule once an actor exists, and with the map
    // loaded first every row is after an actor. A world does not need the
    // row; one that has it must still build.
    const contents = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'Main'},
            next: {
              block: {
                type: 'world_resume_game',
                next: {
                  block: {type: 'world_use_rule', fields: {RULE: 'Space'}},
                },
              },
            },
          },
        ],
      },
      map: MAIN,
    });
    const js = await generate(contents);
    const at = (text: string) => js.indexOf(text);
    expect(at('world.useRules([WorldLab.')).toBeGreaterThanOrEqual(0);
    expect(at('world.useRules([WorldLab.')).toBeLessThan(
      at('world.loadMap(mainMap);'),
    );
    expect(at('world.loadMap(mainMap);')).toBeLessThan(at('world.resume();'));
  });

  it('carries each placement’s script, bound to that placement', async () => {
    const js = await generate(world(MAIN));
    expect(js).toContain('mainMap.script = (world, placed, map) => {');
    expect(js).toContain('const actor = placed["c"];');
    expect(js).not.toContain('placed["d"]');
  });

  it('is nothing for a world with no map, or an empty one', async () => {
    for (const contents of [world(), world({actors: []})]) {
      const js = await generate(contents);
      expect(js).not.toContain('mainMap');
      expect(js).not.toContain('loadMap');
    }
  });
});

describe('a world with a main map, running', () => {
  it('places the map’s actors and runs their scripts', async () => {
    const {world: built} = await compileProject({
      'worlds/main.world': world(MAIN),
      'actors/coin.actor': COIN,
    });

    expect([...built.actors].map(actor => actor.id)).toEqual(['c', 'd']);
    // Running until the placement's `is created` handler pauses it, once
    // the events are dispatched.
    expect(built.isPaused()).toBe(false);
    built.tick(0);
    expect(built.isPaused()).toBe(true);
  });
});

describe('a row under `define world`', () => {
  it('can name what the main map placed', async () => {
    // The reason the map loads first (specs/MAP_BEFORE_ROWS_PLAN.md): a row
    // about `the ⟨Coin⟩` runs as the world is built, and the Coin is on the
    // map. Loaded after the rows, there was no Coin for the row to move.
    const contents = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'Main'},
            next: {
              block: {
                type: 'world_set_position',
                inputs: {
                  ACTOR: {
                    block: {
                      type: 'world_actor_kind',
                      fields: {ACTOR: 'actors/coin'},
                    },
                  },
                  X: {shadow: {type: 'math_number', fields: {NUM: 200}}},
                  Y: {shadow: {type: 'math_number', fields: {NUM: 100}}},
                },
              },
            },
          },
        ],
      },
      map: {...MAIN, actors: [{type: 'actors/coin', id: 'only'}]},
    });
    const {world: built} = await compileProject({
      'worlds/main.world': contents,
      'actors/coin.actor': COIN,
    });
    const [coin] = [...built.actors];
    expect(coin.id).toBe('only');
    expect(coin.get(PositionProperty)).toMatchObject({x: 200, y: 100});
  });

  it('places its actors over the map’s, which are there first', async () => {
    const contents = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'Main'},
            next: {
              block: {type: 'world_add_actor', fields: {ACTOR: 'actors/coin'}},
            },
          },
        ],
      },
      map: {...MAIN, actors: [{type: 'actors/coin', id: 'onTheMap'}]},
    });
    const {world: built} = await compileProject({
      'worlds/main.world': contents,
      'actors/coin.actor': COIN,
    });
    // The world's list is its draw order within a layer.
    expect([...built.actors][0].id).toBe('onTheMap');
    expect([...built.actors]).toHaveLength(2);
  });
});

describe('the main map’s layers', () => {
  const LAYERED = {
    ...MAIN,
    layers: [
      {
        id: 'layer1',
        name: 'Sky',
        parallax: {x: 0.2, y: 0},
        background: {sprite: 'sky.png'},
      },
      {id: 'main'},
    ],
    actors: [
      {type: 'actors/coin', id: 'far', layer: 'layer1'},
      {type: 'actors/coin', id: 'near'},
    ],
  };

  it('are declared in the world’s prologue, before anything is placed', async () => {
    const js = await generate(world(LAYERED));
    expect(js).toContain(
      'world.defineLayer({id: "layer1", name: "Sky", parallax: new WorldLab.Vector(0.2, 0)});',
    );
    expect(js).toContain('world.setBackground("sky.png", "layer1");');
    // Before the load, which is the first placement, and so before the rows.
    expect(js.indexOf('world.defineLayer(')).toBeLessThan(
      js.indexOf('world.loadMap(mainMap);'),
    );
    expect(js.indexOf('world.loadMap(mainMap);')).toBeLessThan(
      js.indexOf('world.resume();'),
    );
  });

  it('are the world’s layers when it runs, with each placement on its own', async () => {
    const {world: built} = await compileProject({
      'worlds/main.world': world(LAYERED),
      'actors/coin.actor': COIN,
    });

    expect(built.layers.map(layer => layer.id)).toEqual(['layer1', 'main']);
    expect(built.layer('layer1')!.parallax).toEqual({x: 0.2, y: 0});
    expect(built.layer('layer1')!.background.sprite).toBe('sky.png');
    expect([...built.actors].map(actor => [actor.id, actor.layer])).toEqual([
      ['far', 'layer1'],
      ['near', 'main'],
    ]);
  });
});
