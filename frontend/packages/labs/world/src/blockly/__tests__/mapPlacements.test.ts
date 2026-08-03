// `create actor in map`: the placements, and the code they become.
//
// The arrangement lives in the block (MAPS.md §2), so the two things to pin are
// that it survives a save/load round trip — that is what makes it part of the
// `.world` file — and that the generated code places exactly those actors, with
// ids that are unique across the world and stable across rebuilds.

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';
import {mapPlacementsMutator} from '../extensions/mapPlacementsMutator';
import {localActorValue, localActorVar} from '../localActors';
import {
  asMapActors,
  asPlacements,
  instanceId,
  placementsOf,
  setPlacements,
  type MapPlacement,
} from '../mapPlacements';

const COIN: MapPlacement[] = [
  {id: 'c1', properties: {positional: {position: {x: 64, y: 96}}}},
  {id: 'c2', properties: {positional: {position: {x: 128, y: 96}}}},
];

/** A stand-in workspace: the top blocks, and lookup by id. */
const workspace = (
  blocks: Array<{id: string; type: string; name?: string}>,
) => {
  const made = blocks.map(block => ({
    id: block.id,
    type: block.type,
    getFieldValue: (field: string) =>
      field === 'NAME' ? (block.name ?? '') : undefined,
  }));
  return {
    getTopBlocks: () => made,
    getBlockById: (id: string) => made.find(block => block.id === id) ?? null,
  };
};

const WORLD = () =>
  workspace([
    {id: 'w1', type: 'world_world', name: 'Platform World'},
    {id: 'a1', type: 'world_actor', name: 'Coin'},
  ]);

/** Run the block's generator with given fields, placements and workspace. */
const emit = (
  fields: Record<string, string>,
  placements: MapPlacement[],
  space: unknown = WORLD(),
  id = 'mk1',
): {code: string; imports: string[]} => {
  const definition = DOMAIN_BLOCKS.find(b => b.type === 'world_create_in_map')!;
  const block = {
    id,
    workspace: space,
    getFieldValue: (name: string) => fields[name],
    getNextBlock: () => null,
  };
  setPlacements(block as never, placements);
  const definitions: Record<string, string> = {};
  const code = definition.generator.javascript(
    block as never,
    {
      definitions_: definitions,
      statementToCode: () => '',
      valueToCode: () => '',
      blockToCode: () => '',
    } as never,
    {} as never,
  ) as string;
  return {code, imports: Object.keys(definitions)};
};

describe('the placements a block carries', () => {
  it('survives a save and load, which is what puts it in the .world file', () => {
    const {mutator} = mapPlacementsMutator as unknown as {
      mutator: {
        saveExtraState(this: unknown): unknown;
        loadExtraState(this: unknown, state: unknown): void;
      };
    };
    const block = {mapPlacements_: {placements: COIN}};

    const saved = mutator.saveExtraState.call(block);
    const loaded = {mapPlacements_: {placements: []}};
    mutator.loadExtraState.call(loaded, saved);

    expect(loaded.mapPlacements_.placements).toEqual(COIN);
    // Copied, not shared: a duplicated block must not edit its original's map.
    expect(loaded.mapPlacements_.placements[0]).not.toBe(COIN[0]);
  });

  it('loads an absent or malformed state as no placements', () => {
    const {mutator} = mapPlacementsMutator as unknown as {
      mutator: {loadExtraState(this: unknown, state: unknown): void};
    };
    const block = {mapPlacements_: {placements: COIN}};

    mutator.loadExtraState.call(block, {});

    expect(block.mapPlacements_.placements).toEqual([]);
  });

  it('gains and loses its type at the canvas boundary', () => {
    // The entries store no type — the block's dropdown says which actor these
    // are, and storing it twice is storing it wrong.
    const actors = asMapActors(COIN, 'Coin');

    expect(actors.map(a => a.type)).toEqual(['Coin', 'Coin']);
    expect(asPlacements(actors)).toEqual(COIN);
  });
});

describe('create actor in map', () => {
  it('places a world’s own actor, with no import', () => {
    const {code, imports} = emit({ACTOR: localActorValue('a1')}, COIN);

    expect(code).toContain(
      `world.define("Coin", ${localActorVar('Coin', 'a1')});`,
    );
    expect(code).toContain('world.loadMap({actors: [');
    expect(code).toContain(`"id":"${instanceId('mk1', 'c1')}"`);
    expect(code).toContain('"position":{"x":64,"y":96}');
    expect(imports).toEqual([]);
  });

  it('places a module actor, imported like `add actor` imports one', () => {
    const {code, imports} = emit({ACTOR: 'actors/coin'}, COIN);

    expect(code).toContain('world.define("actors/coin", Coin);');
    expect(code).toContain('"type":"actors/coin"');
    expect(imports).toEqual(['mod:actors/coin']);
  });

  it('gives every placement an id unique across the world', () => {
    // Two blocks may each hold a `c1`; the block's id is what tells them apart,
    // and it is stable across rebuilds so the reconciler can too.
    const first = emit({ACTOR: 'actors/coin'}, COIN, WORLD(), 'mk1').code;
    const second = emit({ACTOR: 'actors/coin'}, COIN, WORLD(), 'mk2').code;

    expect(first).toContain('"id":"mk1:c1"');
    expect(second).toContain('"id":"mk2:c1"');
  });

  it('emits nothing before anything has been arranged', () => {
    expect(emit({ACTOR: 'actors/coin'}, []).code).toBe('');
    expect(emit({ACTOR: ''}, COIN).code).toBe('');
  });

  it('emits nothing for a definition that has been deleted', () => {
    expect(emit({ACTOR: localActorValue('gone')}, COIN).code).toBe('');
  });

  it('carries a placement with no overrides at all', () => {
    // An actor dropped with nothing changed still has a place in the list.
    const {code} = emit({ACTOR: 'actors/coin'}, [{id: 'c1'}]);

    expect(code).toContain('{"type":"actors/coin","id":"mk1:c1"}');
  });
});

describe('placementsOf', () => {
  it('is empty for a block that has never been edited', () => {
    expect(placementsOf(undefined)).toEqual([]);
    expect(placementsOf({} as never)).toEqual([]);
  });
});
