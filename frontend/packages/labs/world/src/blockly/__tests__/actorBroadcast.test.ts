// One actor or several, and what a block does with the difference
// (specs/ACTOR_LISTS.md).
//
// There is one actor type: `this actor` is one, `any ⟨Coin⟩` is every coin, and
// every actor value fits every actor socket. What differs is what an operation
// MEANS when the value holds several — a statement broadcasts, a value reads
// the first — and these pin down that the generated code says so.

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';

/** Run a block's generator with a chosen block plugged into its ACTOR socket. */
const emit = (
  type: string,
  fields: Record<string, string>,
  pluggedType: string | null,
  values: Record<string, string> = {},
): string => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type)!;
  return definition.generator.javascript(
    {
      getFieldValue: (name: string) => fields[name] ?? null,
      getInputTargetBlock: (name: string) =>
        name === 'ACTOR' && pluggedType ? {type: pluggedType} : null,
    } as never,
    {
      definitions_: {},
      valueToCode: (_block: unknown, name: string) => values[name] ?? '',
    } as never,
    {} as never,
  ) as string;
};

const KIND = 'world_actor_kind';
const ONE = 'world_this_actor';

describe('a statement over an actor value', () => {
  it('broadcasts when the value could hold several', () => {
    const code = emit('world_set_position', {}, KIND, {
      ACTOR: 'world.actors.ofType("actors/coin")',
      X: '1',
      Y: '2',
    });

    expect(code).toBe(
      'WorldLab.each(world.actors.ofType("actors/coin"), actor => ' +
        'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(1, 2)));\n',
    );
  });

  it('says nothing extra when it holds one', () => {
    // The common case, and the reason the broadcast is conditional: wrapping
    // `this actor` would make every actor file harder to read for a case it
    // does not have.
    const code = emit('world_set_position', {}, ONE, {
      ACTOR: 'actor',
      X: '1',
      Y: '2',
    });

    expect(code).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(1, 2));\n',
    );
  });

  it('wraps the whole call when the actor is an argument', () => {
    // `remove actor` passes the actor to the world rather than calling a method
    // on it, so the broadcast has to go around the call, not inside it.
    const code = emit('world_remove_actor', {}, KIND, {
      ACTOR: 'world.actors.ofType("actors/coin")',
    });

    expect(code).toBe(
      'WorldLab.each(world.actors.ofType("actors/coin"), actor => ' +
        'world.removeActor(actor));\n',
    );
  });
});

describe('a value over an actor value', () => {
  it('reads the first when the value could hold several', () => {
    const code = emit('world_is_a', {TYPE: 'actors/coin'}, KIND, {
      ACTOR: 'world.actors.ofType("actors/coin")',
    })[0] as unknown as string;

    expect(code).toContain(
      'WorldLab.one(world.actors.ofType("actors/coin")).type',
    );
  });

  it('reads it directly when it holds one', () => {
    const code = emit('world_is_a', {TYPE: 'actors/coin'}, ONE, {
      ACTOR: 'actor',
    })[0] as unknown as string;

    expect(code).toBe('actor.type === "actors/coin"');
  });
});
