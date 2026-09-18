// Which actor variables could hold more than one actor
// (specs/ACTOR_LISTS.md).
//
// A literal says for itself — `this actor` is one, `any ⟨Coin⟩` is many. A
// variable says nothing, so the generator reads the workspace: a variable is
// many if something builds a list in it, or if it is set from something that
// is already many. Getting this wrong in the cautious direction costs a
// wrapper nobody reads; getting it wrong the other way is a broadcast that
// never happens.

import {describe, expect, it} from 'vitest';

import {
  manyActorVariables,
  registerManyActorBlock,
  yieldsMany,
} from '../manyActors';

/** A stand-in workspace: blocks by type, with the fields they carry. */
const workspace = (
  blocks: Array<{
    type: string;
    fields?: Record<string, string>;
    value?: {type: string; fields?: Record<string, string>};
  }>,
) => {
  const made = blocks.map(block => ({
    type: block.type,
    getFieldValue: (name: string) => block.fields?.[name] ?? null,
    getInputTargetBlock: (name: string) =>
      name === 'VALUE' && block.value
        ? {
            type: block.value.type,
            getFieldValue: (field: string) =>
              block.value?.fields?.[field] ?? null,
          }
        : null,
  }));
  return {
    getBlocksByType: (type: string) =>
      made.filter(block => block.type === type),
  };
};

describe('manyActorVariables', () => {
  it('names a variable something is added to', () => {
    const space = workspace([
      {type: 'world_push_actor', fields: {LIST: 'coins'}},
    ]);

    expect([...manyActorVariables(space as never)]).toEqual(['coins']);
  });

  it('names a variable that is emptied', () => {
    // `empty ⟨coins⟩` says as plainly as `add` does that this holds a group.
    const space = workspace([
      {type: 'world_clear_actors', fields: {LIST: 'coins'}},
    ]);

    expect([...manyActorVariables(space as never)]).toEqual(['coins']);
  });

  it('carries it along a chain of assignments', () => {
    // `set ⟨a⟩ to ⟨all actors⟩`, then `set ⟨b⟩ to ⟨a⟩`: both hold many, and the
    // second only by way of the first, so one pass would miss it.
    const space = workspace([
      {
        type: 'variables_set_Actor',
        fields: {VAR: 'a'},
        value: {type: 'world_all_actors'},
      },
      {
        type: 'variables_set_Actor',
        fields: {VAR: 'b'},
        value: {type: 'variables_get_Actor', fields: {VAR: 'a'}},
      },
    ]);

    expect([...manyActorVariables(space as never)].sort()).toEqual(['a', 'b']);
  });

  it('counts a `let` as a write, like the setter it replaced', () => {
    // A name gets its value from whichever block writes it, and `let actor
    // ⟨into⟩ be ⟨…⟩` is that block just as much as a setter is. Left out, a
    // `let` from a many-valued expression made the variable look like a single
    // actor, and every read of it lost the `one` that turns several into one —
    // which reads at runtime as `into.has(…) is not a function`, the value
    // being a collection asked an actor's question. The stock rules declare
    // their working values this way now, so this is not a hypothetical.
    const space = workspace([
      {
        type: 'world_let_actor',
        fields: {VAR: 'into'},
        value: {type: 'world_all_actors'},
      },
    ]);

    expect([...manyActorVariables(space as never)]).toEqual(['into']);
  });

  it('carries it from a `let` down a chain, as it does from a setter', () => {
    const space = workspace([
      {
        type: 'world_let_actor',
        fields: {VAR: 'a'},
        value: {type: 'world_all_actors'},
      },
      {
        type: 'variables_set_Actor',
        fields: {VAR: 'b'},
        value: {type: 'variables_get_Actor', fields: {VAR: 'a'}},
      },
    ]);

    expect([...manyActorVariables(space as never)].sort()).toEqual(['a', 'b']);
  });

  it('leaves an ordinary variable alone', () => {
    // A loop variable, a parameter, a local holding one actor: nothing here
    // builds a list, so nothing generates a broadcast.
    const space = workspace([
      {
        type: 'variables_set_Actor',
        fields: {VAR: 'other'},
        value: {type: 'world_this_actor'},
      },
    ]);

    expect([...manyActorVariables(space as never)]).toEqual([]);
  });
});

describe('yieldsMany', () => {
  const space = workspace([
    {type: 'world_push_actor', fields: {LIST: 'coins'}},
  ]);
  const getter = (id: string) => ({
    type: 'variables_get_Actor',
    workspace: space,
    getFieldValue: () => id,
  });

  it('answers for the literals without asking the workspace', () => {
    expect(yieldsMany({type: 'world_actor_kind'} as never)).toBe(true);
    expect(yieldsMany({type: 'world_all_actors'} as never)).toBe(true);
    expect(yieldsMany({type: 'world_this_actor'} as never)).toBe(false);
  });

  it('asks the workspace about a variable', () => {
    expect(yieldsMany(getter('coins') as never)).toBe(true);
    expect(yieldsMany(getter('each') as never)).toBe(false);
  });

  it('is false for an empty socket', () => {
    expect(yieldsMany(null)).toBe(false);
  });
});

describe('a property that holds actors', () => {
  // `actor to follow`, declared `actors` on a camera trait. Such a property is
  // ALWAYS a list — `Traited.coerce` wraps a lone actor into one — so its
  // getter hands over `[player]`, never `player`.
  //
  // Its block type is generated per property, so it cannot be listed with the
  // literals; the generator registers it instead. Before that, `get position of
  // ⟨get actor to follow⟩` compiled to `[player].get(PositionProperty)` — the
  // property read off the array, which is not a method an array has. Every
  // socket that reads one actor was blind to the list.
  const GETTER = 'world_get_CameraFollowActorToFollow';

  it('yields many once the generator has registered it', () => {
    expect(yieldsMany({type: GETTER} as never)).toBe(false);

    registerManyActorBlock(GETTER);

    expect(yieldsMany({type: GETTER} as never)).toBe(true);
  });

  it('carries into a variable set from it', () => {
    // The same reasoning `set ⟨a⟩ to ⟨any Coin⟩` already got: what a list is
    // assigned to is a list.
    registerManyActorBlock(GETTER);
    const space = workspace([
      {
        type: 'variables_set_Actor',
        fields: {VAR: 'target'},
        value: {type: GETTER},
      },
    ]);

    expect(manyActorVariables(space as never).has('target')).toBe(true);
  });
});
