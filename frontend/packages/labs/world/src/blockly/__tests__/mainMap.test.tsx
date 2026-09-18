// A world's main map: the `map` beside its `blocks`, compiled into the world's
// module and loaded after the world's own rows (specs/MAIN_MAP_PLAN.md).

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';

/** `when this actor is created` → `pause the game`, on one placement. */
const PAUSES_ON_CREATE = {
  blocks: {
    blocks: [
      {
        type: 'world_on_Space_CreatedEvent',
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
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
          // A row of its own, so the main map's load can be seen to follow it.
          next: {block: {type: 'world_pause_game'}},
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
  it('is data, defined kinds, and a load, after the world’s own rows', async () => {
    const js = await generate(world(MAIN));
    const data = JSON.parse(js.match(/^const mainMap = (.*);$/m)![1]) as {
      actors: Array<Record<string, unknown>>;
    };

    expect(data.actors.map(actor => actor.id)).toEqual(['c', 'd']);
    expect(data.actors.every(actor => !('blocks' in actor))).toBe(true);
    expect(js).toContain('import ActorsCoin from "actors/coin";');
    expect(js).toContain('world.define("actors/coin", ActorsCoin);');
    expect(js).toContain('world.loadMap(mainMap);');
    // After the row chained under `define world`.
    expect(js.indexOf('world.pause();')).toBeLessThan(
      js.indexOf('world.loadMap(mainMap);'),
    );
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
    // The world block's own row paused it; resume, and see the placement's
    // `is created` handler pause it again once the events are dispatched.
    built.resume();
    expect(built.isPaused()).toBe(false);
    built.tick(0);
    expect(built.isPaused()).toBe(true);
  });
});
