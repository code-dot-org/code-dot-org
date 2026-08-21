// One actor or several, and what a block does with the difference
// (specs/ACTOR_LISTS.md).
//
// There is one actor type: `this actor` is one, `any ⟨Coin⟩` is every coin, and
// every actor value fits every actor socket. What differs is what an operation
// MEANS when the value holds several — a statement broadcasts, a value reads
// the first — and these pin down that the generated code says so.

import {describe, expect, it} from 'vitest';

import {cameraFollowRule} from '../../rules/stock';
import {buildDomainPalette, DOMAIN_BLOCKS} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';

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
      'WorldLab.each(world.actors.ofType("actors/coin"), subject => ' +
        'subject.set(WorldLab.PositionProperty, new WorldLab.Vector(1, 2)));\n',
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
      'WorldLab.each(world.actors.ofType("actors/coin"), subject => ' +
        'world.removeActor(subject));\n',
    );
  });

  it('wraps `first actor in ⟨…⟩`, which may hold no actor at all', () => {
    // Zero needs the wrapper for the same reason many does, and this is the
    // block that can answer zero: the front of a list that turned out empty.
    // Broadcast, the statement runs no times; called bare it would run once on
    // nothing and throw — a TypeError naming a value the learner never wrote.
    const code = emit('world_remove_actor', {}, 'world_first_actor', {
      ACTOR: 'WorldLab.firstOf(world.actors)',
    });

    expect(code).toBe(
      'WorldLab.each(WorldLab.firstOf(world.actors), ' +
        'subject => world.removeActor(subject));\n',
    );
  });

  it('wraps a filter, which may match nothing at all', () => {
    // The other half of what `first actor … where` used to be, and it needs the
    // wrapper for both reasons at once: it can hold several, and it can hold
    // none (specs/ACTOR_LISTS.md).
    const code = emit('world_remove_actor', {}, 'world_filter_actors', {
      ACTOR: 'WorldLab.filtered(world.actors, other => true)',
    });

    expect(code).toContain('WorldLab.each(');
  });

  it('does not capture `this actor` from the scope around it', () => {
    // The parameter is `subject` and not `actor`, and that is a bug fix rather
    // than taste. The VALUE being set is generated in the enclosing scope — a
    // handler, where `this actor` means whoever the event fired for — and is
    // then placed textually inside this lambda. `this actor` compiles to the
    // bare name `actor`, so a parameter of that name captured it.
    //
    // It was silent in the way that matters: the code ran, read the wrong
    // actor's property, and threw somewhere else entirely. The starter's
    // health bar was told to read its own health and reported
    // "Actor 'HealthBar' has no property 'health'".
    const code = emit('world_set_position', {}, KIND, {
      ACTOR: 'world.actors.ofType("actors/coin")',
      X: 'actor.get(WorldLab.PositionProperty).x',
      Y: '0',
    });

    // The read of the ENCLOSING actor survives, because nothing between it and
    // its binding is called `actor`.
    expect(code).toContain('actor.get(WorldLab.PositionProperty).x');
    expect(code).not.toContain('actor =>');
  });

  it('is how "remove every coin" is written — no bulk block needed', () => {
    // The same pair as above, stated as the thing a learner is trying to do.
    // `remove actor` over a value holding several IS the bulk operation, so a
    // separate "remove all of a kind" block would be a second way to say one
    // thing — and the two would have to be kept agreeing forever.
    const one = emit('world_remove_actor', {}, ONE, {ACTOR: 'actor'});
    const every = emit('world_remove_actor', {}, KIND, {
      ACTOR: 'world.actors.ofType("actors/coin")',
    });

    expect(one).toBe('world.removeActor(actor);\n');
    expect(every).toContain('WorldLab.each(');
    expect(every).toContain('world.removeActor(subject)');
  });
});

describe('a property that says ONE actor', () => {
  // Saying one is not the same as being handed one. `set actor to follow of
  // ⟨camera⟩ to ⟨any Player⟩` is a reasonable thing to write in a game with one
  // player, and nothing stops it in a game with three. The store narrows it
  // (Traited), and this is what covers the paths that do not go through the
  // store — which is why an `actor` property is still registered as a value
  // that could hold several, exactly like an `actors` one.
  const FOLLOWS = 'world_get_CameraFollow_ActorToFollowProperty';

  it('is still read through `one`', () => {
    // Building the palette is what registers the block; the registry is by
    // type, so anything plugging it into an actor socket sees the same answer.
    buildDomainPalette([
      parseRuleMeta('rules/cameraFollow', cameraFollowRule)!,
    ]);

    const code = emit('world_is_a', {TYPE: 'actors/player'}, FOLLOWS, {
      ACTOR: 'target',
    })[0] as unknown as string;

    expect(code).toContain('WorldLab.one(target).type');
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
      {},
      {DO: 'body();\n'},
    );

    expect(code).toBe('for (const each of world.actors) {\nbody();\n}\n');
  });

  it('walks whatever else it is given', () => {
    const code = emit(
      'world_for_each',
      {VAR: 'each'},
      {SOURCE: 'world_actor_kind'},
      {SOURCE: 'world.actors.ofType("actors/coin")'},
      {DO: 'body();\n'},
    );

    expect(code).toBe(
      'for (const each of WorldLab.all(world.actors.ofType("actors/coin"))) ' +
        '{\nbody();\n}\n',
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
      'WorldLab.each([...world.actors], subject => world.removeActor(subject));\n',
    );
  });
});

describe('building a group', () => {
  /** A block whose ACTOR socket holds `plugged`, in a workspace of `blocks`. */
  const emitWith = (
    type: string,
    fields: Record<string, string>,
    plugged: Record<string, string | null>,
    values: Record<string, string>,
    workspaceBlocks: Array<{type: string; fields: Record<string, string>}> = [],
  ): string | [string, number] => {
    const definition = DOMAIN_BLOCKS.find(block => block.type === type)!;
    const made = workspaceBlocks.map(block => ({
      type: block.type,
      getFieldValue: (name: string) => block.fields[name] ?? null,
      getInputTargetBlock: () => null,
    }));
    const space = {
      getBlocksByType: (wanted: string) =>
        made.filter(block => block.type === wanted),
    };
    return definition.generator.javascript(
      {
        getFieldValue: (name: string) => fields[name] ?? null,
        getInputTargetBlock: (name: string) =>
          plugged[name]
            ? {
                type: plugged[name],
                workspace: space,
                getFieldValue: () => fields[`${name}_VAR`] ?? null,
              }
            : null,
      } as never,
      {
        definitions_: {},
        valueToCode: (_block: unknown, name: string) => values[name] ?? '',
        getVariableName: (id: string) => id,
      } as never,
      {} as never,
    ) as string | [string, number];
  };

  it('adds to what a variable holds, and assigns it back', () => {
    // Assigned back because a variable holding ONE actor cannot be appended
    // to: it becomes a list of two, and the actor that was in it is untouched.
    const code = emitWith(
      'world_push_actor',
      {LIST: 'coins'},
      {ACTOR: 'world_this_actor'},
      {ACTOR: 'actor'},
    );

    expect(code).toBe('coins = WorldLab.pushed(coins, actor);\n');
  });

  it('empties one', () => {
    expect(emitWith('world_clear_actors', {LIST: 'coins'}, {}, {})).toBe(
      'coins = [];\n',
    );
  });

  it('counts what a value holds, one or many', () => {
    const [code] = emitWith(
      'world_count_actors',
      {},
      {ACTOR: 'world_all_actors'},
      {ACTOR: '[...world.actors]'},
    ) as [string, number];

    expect(code).toBe('WorldLab.all([...world.actors]).length');
  });

  it('asks whether there is any actor at all', () => {
    // The question `first actor … where …` needs: a search that matched
    // nothing answers with a value holding none, and this is how a program
    // tests for that without doing arithmetic to ask a yes-or-no question.
    const [code] = emitWith(
      'world_any_actors',
      {},
      {LIST: 'world_first_where'},
      {LIST: 'WorldLab.firstWhere(world.actors, other => true)'},
    ) as [string, number];

    expect(code).toBe(
      'WorldLab.all(WorldLab.firstWhere(world.actors, other => true)).length > 0',
    );
  });

  it('asks whether an actor is among them', () => {
    const [code] = emitWith(
      'world_is_in_actors',
      {LIST_VAR: 'coins'},
      {ACTOR: 'world_this_actor', LIST: 'variables_get_Actor'},
      {ACTOR: 'actor', LIST: 'coins'},
      [{type: 'world_push_actor', fields: {LIST: 'coins'}}],
    ) as [string, number];

    expect(code).toBe('WorldLab.all(coins).includes(actor)');
  });

  it('broadcasts over a variable that a group was built in', () => {
    // The step 4 change: until something pushed into it, a variable held one
    // actor and generated code said so. `coins` is many now, and every
    // statement over it broadcasts.
    const code = emitWith(
      'world_remove_actor',
      {ACTOR_VAR: 'coins'},
      {ACTOR: 'variables_get_Actor'},
      {ACTOR: 'coins'},
      [{type: 'world_push_actor', fields: {LIST: 'coins'}}],
    );

    expect(code).toBe(
      'WorldLab.each(coins, subject => world.removeActor(subject));\n',
    );
  });
});

describe('a property whose value is actors', () => {
  // What a rule works out about who is where (specs/COLLISION.md). The blocks
  // it generates are ordinary get/set blocks — the point is that what they
  // carry is an ACTOR value, so it plugs into everything actor-shaped.
  const meta = parseRuleMeta(
    'rules/touch',
    JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Touching', ABILITY: 'Has Touching'},
          },
          {
            type: 'world_rule_trait',
            fields: {NAME: 'Can Touch'},
            next: {
              block: {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'actors',
                  ACCESS: 'writable',
                  NAME: 'contacts',
                  DEFAULT: '',
                },
              },
            },
          },
        ],
      },
    }),
  )!;
  const {blocks} = buildDomainPalette([meta]);
  const find = (type: string) =>
    blocks.find(block => block.type === type) as {
      args0?: Array<{type: string; name: string; check?: string}>;
      output?: string;
    };

  it('starts holding none', () => {
    expect(meta.properties[0]).toMatchObject({type: 'actors', default: []});
  });

  it('is set through an actor socket, with no shadow to mean none', () => {
    const set = find('world_set_Touching_ContactsProperty');

    expect(set.args0?.[1]).toMatchObject({
      type: 'input_value',
      name: 'VALUE',
      check: 'Actor',
    });
  });

  it('reports an actor value, so a loop can walk what it holds', () => {
    const get = find('world_get_Touching_ContactsProperty');

    expect(get.output).toBe('Actor');
  });
});
