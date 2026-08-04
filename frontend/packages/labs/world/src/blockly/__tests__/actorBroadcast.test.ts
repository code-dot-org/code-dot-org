// One actor or several, and what a block does with the difference
// (specs/ACTOR_LISTS.md).
//
// There is one actor type: `this actor` is one, `any ⟨Coin⟩` is every coin, and
// every actor value fits every actor socket. What differs is what an operation
// MEANS when the value holds several — a statement broadcasts, a value reads
// the first — and these pin down that the generated code says so.

import {describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';

/** Run a block's generator with chosen blocks plugged into its sockets. */
const emit = (
  type: string,
  fields: Record<string, string>,
  plugged: string | null | Record<string, string | null>,
  values: Record<string, string> = {},
  statements: Record<string, string> = {},
): string => {
  const definition = DOMAIN_BLOCKS.find(block => block.type === type)!;
  const sockets: Record<string, string | null> =
    typeof plugged === 'string' || plugged === null
      ? {ACTOR: plugged}
      : plugged;
  return definition.generator.javascript(
    {
      getFieldValue: (name: string) => fields[name] ?? null,
      getInputTargetBlock: (name: string) =>
        sockets[name] ? {type: sockets[name]} : null,
    } as never,
    {
      definitions_: {},
      valueToCode: (_block: unknown, name: string) => values[name] ?? '',
      statementToCode: (_block: unknown, name: string) =>
        statements[name] ?? '',
      getVariableName: (id: string) => id,
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

describe('the loop takes a source', () => {
  it('walks the world when given `all actors`, as it always did', () => {
    // The default, seeded as the socket's shadow — so a loop dragged out today
    // generates what a loop dragged out yesterday generated, no copy and no
    // wrapper for a value that is already every actor and already iterable.
    const code = emit(
      'world_for_each',
      {VAR: 'each'},
      {SOURCE: 'world_all_actors'},
      {WHERE: 'true'},
      {DO: 'body();\n'},
    );

    expect(code).toBe(
      'for (const each of world.actors) {\nif (true) {\nbody();\n}\n}\n',
    );
  });

  it('walks whatever else it is given', () => {
    const code = emit(
      'world_for_each',
      {VAR: 'each'},
      {SOURCE: 'world_actor_kind'},
      {WHERE: 'true', SOURCE: 'world.actors.ofType("actors/coin")'},
      {DO: 'body();\n'},
    );

    expect(code).toBe(
      'for (const each of WorldLab.all(world.actors.ofType("actors/coin"))) ' +
        '{\nif (true) {\nbody();\n}\n}\n',
    );
  });

  it('is a real loop, so a body may return out of the rule it is in', () => {
    // Not a callback: a query answering early has to leave the QUERY, and a
    // `return` inside a callback would leave only the callback.
    const code = emit(
      'world_for_each',
      {VAR: 'each'},
      {SOURCE: 'world_all_actors'},
      {},
      {DO: 'return true;\n'},
    );

    expect(code).toContain('for (const each of');
    expect(code).toContain('return true;');
  });
});

describe('all actors', () => {
  it('is a copy, so adding while iterating terminates', () => {
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_all_actors')!;
    const [code] = block.generator.javascript(
      {} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code).toBe('[...world.actors]');
  });

  it('is an actor value like any other, so a statement broadcasts over it', () => {
    const code = emit('world_remove_actor', {}, 'world_all_actors', {
      ACTOR: '[...world.actors]',
    });

    expect(code).toBe(
      'WorldLab.each([...world.actors], actor => world.removeActor(actor));\n',
    );
  });
});
