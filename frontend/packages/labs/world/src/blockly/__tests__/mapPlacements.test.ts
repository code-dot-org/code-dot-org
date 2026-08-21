// `create actor in map`: the click model, and the code it becomes.
//
// The whole interaction is one act — a click means "there should be one here"
// or "there should not" — which is why the editor can be a field dropdown
// rather than a window. That act is a pure function, and this is where it is
// pinned; the grid around it only turns cells into calls.
//
// The arrangement is the FIELD's value, so Blockly saves and loads it with the
// block and there is nothing of ours in that path to test.

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';
import {localActorValue, localActorVar} from '../localActors';
import {
  cellCentre,
  cellOf,
  instanceId,
  placementAt,
  toggleCell,
  type MapPlacement,
} from '../mapPlacements';

const TILE = 32;

const at = (x: number, y: number): MapPlacement['properties'] => ({
  positional: {position: {x, y}},
});

const COIN: MapPlacement[] = [
  {id: 'p1', properties: at(48, 80)},
  {id: 'p2', properties: at(112, 80)},
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

/** Run the block's generator with given fields and placements. */
const emit = (
  fields: Record<string, unknown>,
  space: unknown = WORLD(),
  id = 'mk1',
): {code: string; imports: string[]} => {
  const definition = DOMAIN_BLOCKS.find(b => b.type === 'world_create_in_map')!;
  const definitions: Record<string, string> = {};
  const code = definition.generator.javascript(
    {
      id,
      workspace: space,
      getFieldValue: (name: string) => fields[name],
      getNextBlock: () => null,
    } as never,
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

describe('clicking a cell', () => {
  it('puts one in an empty cell, at the middle of it', () => {
    const next = toggleCell([], {column: 2, row: 3}, TILE);

    expect(next).toEqual([{id: 'p1', properties: at(80, 112)}]);
    expect(cellCentre({column: 2, row: 3}, TILE)).toEqual({x: 80, y: 112});
  });

  it('takes away the one that is there', () => {
    // The second click on a cell undoes the first, which is the whole of "and
    // nothing else".
    const next = toggleCell(COIN, {column: 1, row: 2}, TILE);

    expect(next).toEqual([COIN[1]]);
  });

  it('numbers ids rather than inventing them', () => {
    // These become instance ids in the running world, and an id that changed on
    // every edit would be an actor the reconciler cannot recognise.
    const once = toggleCell(COIN, {column: 5, row: 5}, TILE);
    expect(once[2].id).toBe('p3');

    // A gap left by a removal is filled, not skipped past.
    const removed = toggleCell(COIN, {column: 1, row: 2}, TILE);
    expect(toggleCell(removed, {column: 5, row: 5}, TILE)[1].id).toBe('p1');
  });

  it('knows which cell a placement is in, and which is empty', () => {
    expect(cellOf(COIN[0], TILE)).toEqual({column: 1, row: 2});
    expect(placementAt(COIN, {column: 1, row: 2}, TILE)).toBe(COIN[0]);
    expect(placementAt(COIN, {column: 9, row: 9}, TILE)).toBeUndefined();
    // A placement with no position at all belongs to no cell.
    expect(cellOf({id: 'p9'}, TILE)).toBeUndefined();
  });
});

describe('create actor in map', () => {
  it('places a world own actor, with no import', () => {
    const {code, imports} = emit({
      ACTOR: localActorValue('a1'),
      PLACEMENTS: COIN,
    });

    expect(code).toContain(
      `world.define("Coin", ${localActorVar('Coin', 'a1')});`,
    );
    expect(code).toContain('world.loadMap({actors: [');
    expect(code).toContain(`"id":"${instanceId('mk1', 'p1')}"`);
    expect(code).toContain('"position":{"x":48,"y":80}');
    expect(imports).toEqual([]);
  });

  it('places a module actor, imported like `add actor` imports one', () => {
    const {code, imports} = emit({ACTOR: 'actors/coin', PLACEMENTS: COIN});

    expect(code).toContain('world.define("actors/coin", ActorsCoin);');
    expect(code).toContain('"type":"actors/coin"');
    expect(imports).toEqual(['mod:actors/coin']);
  });

  it('gives every placement an id unique across the world', () => {
    // Two blocks may each hold a `p1`; the block id tells them apart, and it is
    // stable across rebuilds so the reconciler can too.
    const first = emit(
      {ACTOR: 'actors/coin', PLACEMENTS: COIN},
      WORLD(),
      'mk1',
    );
    const second = emit(
      {ACTOR: 'actors/coin', PLACEMENTS: COIN},
      WORLD(),
      'mk2',
    );

    expect(first.code).toContain('"id":"mk1:p1"');
    expect(second.code).toContain('"id":"mk2:p1"');
  });

  it('emits nothing before anything has been placed', () => {
    expect(emit({ACTOR: 'actors/coin', PLACEMENTS: []}).code).toBe('');
    // A field Blockly has not filled in yet reads as absent, not as empty.
    expect(emit({ACTOR: 'actors/coin'}).code).toBe('');
    expect(emit({ACTOR: '', PLACEMENTS: COIN}).code).toBe('');
  });

  it('emits nothing for a definition that has been deleted', () => {
    expect(emit({ACTOR: localActorValue('gone'), PLACEMENTS: COIN}).code).toBe(
      '',
    );
  });
});
