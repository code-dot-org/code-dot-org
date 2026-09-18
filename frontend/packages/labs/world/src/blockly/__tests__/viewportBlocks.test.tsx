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

  it('loads a map value into an actor, or into each of several', () => {
    expect(
      emit('world_load_map_into', {}, {MAP: '"maps/level1"', ACTOR: 'actor'}),
    ).toBe('world.loadMapInto(actor, "maps/level1");\n');
    expect(
      emit('world_load_map_into', {}, {MAP: 'm', ACTOR: 'list'}, true),
    ).toBe(
      'WorldLab.each(list, subject => {\nworld.loadMapInto(subject, m);\n});\n',
    );
    // An empty socket loads nothing rather than throwing on undefined.
    expect(emit('world_load_map_into', {}, {ACTOR: 'actor'})).toBe(
      'world.loadMapInto(actor, "");\n',
    );
  });

  it('unloads a viewport', () => {
    expect(emit('world_unload_viewport', {}, {ACTOR: 'actor'})).toBe(
      'world.unloadViewport(actor);\n',
    );
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
  camera: {follows: 'b'},
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
const WORLD = JSON.stringify({
  blocks: {blocks: [{type: 'world_world', fields: {NAME: 'Main'}}]},
  map: {
    size: {width: 10, height: 10},
    tile: {width: 32, height: 32},
    actors: [
      {
        type: 'actors/window',
        id: 'Game',
        properties: {
          positional: {
            position: {x: 160, y: 160},
            intrinsicSize: {x: 100, y: 80},
          },
          showsMap: {map: 'maps/level1'},
        },
      },
    ],
  },
});
const FILES = {
  'worlds/main.world': WORLD,
  'actors/coin.actor': COIN,
  'actors/window.actor': WINDOW,
  'maps/level1.map': LEVEL,
};

describe('the world module', () => {
  it('registers every map the project holds, with the kinds it places', async () => {
    refreshProjectDropdowns(FILES, [], {}, []);
    const ref = createRef<BlocklyGeneratorHandle>();
    render(<BlocklyGenerator ref={ref} />);
    await new Promise(resolve => setTimeout(resolve, 50));
    const js = ref.current!.generate(WORLD, 'worlds/main.world');

    expect(js).toContain('import MapsLevel1 from "maps/level1";');
    expect(js).toContain('world.define("actors/coin", ActorsCoin);');
    expect(js).toContain('world.defineMap("maps/level1", MapsLevel1);');
    // Before the main map is loaded, so a Viewport in it finds its map.
    expect(js.indexOf('world.defineMap(')).toBeLessThan(
      js.indexOf('world.loadMap(mainMap)'),
    );
  });
});

describe('a placed Viewport', () => {
  it('shows the map its property names, in a space of its own', async () => {
    const {world} = await compileProject(FILES);
    const [window] = [...world.actors];
    expect(window.has(ViewportTrait)).toBe(true);
    // The level is in the world as soon as the main map is loaded, with no
    // tick run: a world is handed over holding what its Viewports hold.
    expect([...world.actors]).toHaveLength(3);

    world.tick(0);

    const ids = [...world.actors].map(actor => actor.id);
    expect(ids).toEqual(['Game', 'a', 'b']);
    const space = world.viewportSpaceOf(window)!;
    expect(
      [...world.actors].slice(1).every(actor => actor.space === space),
    ).toBe(true);
    expect(space.bounds).toEqual({x: 640, y: 320});
    expect(space.camera!.position).toEqual({x: 320, y: 160});
    expect(world.spaceSnapshot()[0]).toMatchObject({
      owner: 'Game',
      view: {x: 100, y: 80},
    });
  });
});
