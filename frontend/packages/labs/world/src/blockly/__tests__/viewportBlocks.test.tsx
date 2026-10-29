// The Viewport's blocks and what a world does for them
// (specs/VIEWPORT_PLAN.md): `map ⟨…⟩` as a value, `load map ⟨…⟩ into ⟨…⟩`,
// `unload ⟨…⟩`, every project map registered on the world, and a placed
// Viewport showing the map its property names.

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {ViewportTrait} from '../../engine';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';
import {DOMAIN_BLOCKS} from '../domainBlocks';
import {refreshProjectDropdowns} from '../projectDropdowns';

const emit = (
  type: string,
  fields: Record<string, string> = {},
  values: Record<string, string> = {},
  many = false,
): string => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type)!;
  const out = definition.generator.javascript(
    {
      getFieldValue: (name: string) => fields[name] ?? '',
      getInputTargetBlock: (name: string) =>
        name === 'ACTOR' && many ? {type: 'world_actor_kind'} : null,
    } as never,
    {
      valueToCode: (_block: unknown, name: string) => values[name] ?? '',
    } as never,
    {} as never,
  );
  return Array.isArray(out) ? out[0] : (out ?? '');
};

describe('the blocks', () => {
  it('names a map by its path', () => {
    expect(emit('world_map_ref', {MAP: 'maps/level1'})).toBe('"maps/level1"');
  });

  it('loads a map value into the World', () => {
    expect(emit('world_load_map', {}, {MAP: '"maps/level1"'})).toBe(
      'world.loadWorldMap("maps/level1");\n',
    );
    // An empty socket loads nothing rather than throwing on undefined.
    expect(emit('world_load_map', {}, {})).toBe("world.loadWorldMap('');\n");
  });
});

const LEVEL = JSON.stringify({
  type: 'map',
  size: {width: 20, height: 10},
  tile: {width: 32, height: 32},
  actors: [
    {
      type: 'actors/coin',
      id: 'a',
      properties: {positional: {position: {x: 48, y: 48}}},
    },
    {
      type: 'actors/coin',
      id: 'b',
      properties: {positional: {position: {x: 320, y: 160}}},
    },
  ],
});
const COIN = JSON.stringify({
  blocks: {blocks: [{type: 'world_actor', fields: {NAME: 'Coin'}}]},
});
/** A kind that Shows a Map; its size is the placement's to say. */
const WINDOW = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Window'},
        next: {
          block: {
            type: 'world_use_trait',
            fields: {TRAIT: 'Viewport#ViewportTrait'},
          },
        },
      },
    ],
  },
});
/** A Main Screen with a Viewport on it, and a World that starts with the level. */
const SCREEN = JSON.stringify({
  type: 'map',
  name: 'Main',
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  worldMap: 'maps/level1',
  actors: [
    {
      type: 'actors/window',
      id: 'Game',
      properties: {
        positional: {
          position: {x: 160, y: 160},
          intrinsicSize: {x: 100, y: 80},
        },
      },
    },
  ],
});
const FILES = {
  'screens/main.screen': SCREEN,
  'actors/coin.actor': COIN,
  'actors/window.actor': WINDOW,
  'maps/level1.map': LEVEL,
};

describe('the Main Screen’s module', () => {
  it('registers every map the project holds, with the kinds it places', async () => {
    refreshProjectDropdowns(FILES, [], {}, []);
    const ref = createRef<BlocklyGeneratorHandle>();
    render(<BlocklyGenerator ref={ref} />);
    await new Promise(resolve => setTimeout(resolve, 50));
    const js = ref.current!.generate(SCREEN, 'screens/main.screen');

    expect(js).toContain('import MapsLevel1 from "maps/level1";');
    expect(js).toContain('world.define("actors/coin", ActorsCoin);');
    expect(js).toContain('world.defineMap("maps/level1", MapsLevel1);');
    // …and loads the World's map before it places the screen, so a camera
    // the screen aims finds what the level holds (specs/ONE_WORLD_PLAN.md).
    expect(js.indexOf('world.loadWorldMap("maps/level1");')).toBeGreaterThan(
      js.indexOf('world.defineMap("maps/level1"'),
    );
    expect(js.indexOf('world.loadWorldMap("maps/level1");')).toBeLessThan(
      js.indexOf('world.loadScreen(mainMap);'),
    );
    // Before the screen is loaded, so a Viewport on it finds its map.
    expect(js.indexOf('world.defineMap(')).toBeLessThan(
      js.indexOf('world.loadScreen(mainMap)'),
    );
  });
});

describe('a placed Viewport', () => {
  it('shows the map the World starts with', async () => {
    const {world} = await compileProject(FILES);
    const window = [...world.actors].find(actor => actor.id === 'Game')!;
    expect(window.has(ViewportTrait)).toBe(true);
    // The level is in the world as soon as the module has run, with no tick:
    // the World's map is loaded before the screen is placed.
    expect([...world.actors]).toHaveLength(3);

    world.tick(0);

    const ids = [...world.actors].map(actor => actor.id);
    expect(ids).toEqual(['a', 'b', 'Game']);
    const space = world.viewportSpaceOf(window)!;
    expect(
      [...world.actors]
        .filter(actor => actor !== window)
        .every(actor => actor.space === space.mirrorOf),
    ).toBe(true);
    expect(space.bounds).toEqual({x: 640, y: 320});
    // The middle of the window it is seen through. A map no longer says what to
    // follow — a Viewport's camera elects `Follows`, as the world's always has
    // (specs/SPACE_CAMERAS_PLAN.md).
    expect(space.camera!.position).toEqual({x: 50, y: 40});
    expect(world.spaceSnapshot()[1]).toMatchObject({
      owner: 'Game',
      mirrors: 'world',
      view: {x: 100, y: 80},
    });
  });
});
