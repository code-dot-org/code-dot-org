// A world's own memory, written and read back (specs/SAVING_PLAN.md).
//
// The world-state spec refused persistence until there was a reason to say
// what a saved thing IS. It is the world's own properties under a name the
// project chooses — not actors, not where they are, not which maps are
// loaded.

import {describe, expect, it} from 'vitest';

import {RuleBuilder, WorldBuilder} from '..';
import type {WorldStorage} from '../core/types';

/** A storage that is just a Map, which is all the engine asks for. */
const held = (): WorldStorage & {seen: Map<string, string>} => {
  const seen = new Map<string, string>();
  return {
    seen,
    getItem: key => seen.get(key) ?? null,
    setItem: (key, value) => void seen.set(key, value),
    removeItem: key => void seen.delete(key),
  };
};

/**
 * A world with two properties of its own: a number and a list of words.
 *
 * Declared on the BUILDER, which is where a world's own properties are said
 * (`WorldBuilder.defineProperty`); the world is handed them as it is made.
 * `more` is what a project ADDED since it last saved.
 */
const noting = (more: ReadonlyArray<[string, string]> = []) => {
  const Rule = new RuleBuilder({id: 'noting', name: 'Noting'}).build();
  const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([Rule]);
  const count = builder.defineProperty('count', 'number', 0);
  const notes = builder.defineProperty('notes', 'words', [] as string[]);
  const extra = more.map(([id, value]) =>
    builder.defineProperty(id, 'string', value),
  );
  return {world: builder.instantiate(), count, notes, extra};
};

describe('a world with nowhere to remember', () => {
  it('saves nothing, recalls nothing, and says so', () => {
    // The headless check runner is this world, and every test that does not
    // ask for a storage. It must answer rather than throw.
    const {world} = noting();

    expect(world.save('notes')).toBe(false);
    expect(world.recall('notes')).toBe(false);
    expect(world.forget('notes')).toBe(false);
  });
});

describe('a world lent somewhere to remember', () => {
  it('writes its own properties, and reads them back', () => {
    const store = held();
    const first = noting();
    first.world.useStorage(store);
    first.world.set(first.count, 3);
    first.world.set(first.notes, ['milk', 'bread']);

    expect(first.world.save('notes')).toBe(true);

    // A SECOND WORLD, as a reload is: same declarations, fresh values.
    const second = noting();
    second.world.useStorage(store);
    expect(second.world.get(second.count)).toBe(0);

    expect(second.world.recall('notes')).toBe(true);
    expect(second.world.get(second.count)).toBe(3);
    expect(second.world.get(second.notes)).toEqual(['milk', 'bread']);
  });

  it('says there was nothing under a name nobody has used', () => {
    // What tells a first run from a later one, which is the whole of what an
    // app's start screen needs.
    const {world} = noting();
    world.useStorage(held());

    expect(world.recall('notes')).toBe(false);
  });

  it('keeps a property the saved data does not mention', () => {
    // A project that adds a property after saving should not find its other
    // values wiped; what an unmentioned property holds is already its
    // default.
    const store = held();
    const before = noting();
    before.world.useStorage(store);
    before.world.set(before.count, 7);
    before.world.save('notes');

    const after = noting([['theme', 'dark']]);
    after.world.useStorage(store);
    after.world.set(after.extra[0], 'light');

    after.world.recall('notes');

    expect(after.world.get(after.count)).toBe(7);
    expect(after.world.get(after.extra[0])).toBe('light');
  });

  it('ignores a value the world no longer declares', () => {
    // Saved data outlives edits. A value nothing can hold is not worth
    // taking a project down for.
    const store = held();
    const before = noting([['gone', 'anything']]);
    before.world.useStorage(store);
    before.world.set(before.count, 4);
    before.world.save('notes');

    const after = noting();
    after.world.useStorage(store);

    expect(after.world.recall('notes')).toBe(true);
    expect(after.world.get(after.count)).toBe(4);
  });

  it('throws a memory away', () => {
    const store = held();
    const {world} = noting();
    world.useStorage(store);
    world.save('notes');

    expect(world.forget('notes')).toBe(true);
    expect(world.recall('notes')).toBe(false);
  });

  it('keeps two names apart', () => {
    const store = held();
    const one = noting();
    one.world.useStorage(store);
    one.world.set(one.count, 1);
    one.world.save('first');
    one.world.set(one.count, 2);
    one.world.save('second');

    const back = noting();
    back.world.useStorage(store);
    back.world.recall('first');

    expect(back.world.get(back.count)).toBe(1);
  });

  it('is not fooled by somebody else’s key, or half of one', () => {
    // The storage is the sandbox origin's and holds whatever else has been
    // put there. A thing that is not a memory has to read as no memory.
    const store = held();
    const {world} = noting();
    world.useStorage(store);
    store.seen.set('world-lab.memory.notes', 'not json at all');

    expect(world.recall('notes')).toBe(false);
  });

  it('says false when the storage refuses', () => {
    // A browser with its site data blocked throws from `setItem`, which is a
    // real thing and not a crash.
    const {world} = noting();
    world.useStorage({
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });

    expect(world.save('notes')).toBe(false);
    expect(world.recall('notes')).toBe(false);
    expect(world.forget('notes')).toBe(false);
  });
});
