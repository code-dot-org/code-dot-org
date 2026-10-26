// What a world remembers is filed under the PROJECT, not just under a name.
//
// Storage belongs to an ORIGIN, and every project in the lab runs on the same
// sandbox origin. A key of the name alone means every published app that keeps
// a `score` reads and writes the same slot as every other — tolerable while a
// learner has one project, a bug the moment anybody shares one, which is the
// point of saving at all (specs/RECORDS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {WorldBuilder} from '../builders/WorldBuilder';

/** A browser's storage, with the keys left visible. */
const store = () => {
  const held = new Map<string, string>();
  return {
    held,
    getItem: (key: string) => held.get(key) ?? null,
    setItem: (key: string, value: string) => void held.set(key, value),
    removeItem: (key: string) => void held.delete(key),
  };
};

const world = (channel?: string) => {
  const built = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
  const storage = store();
  built.useStorage(storage);
  if (channel !== undefined) {
    built.useChannel(channel);
  }
  return {world: built, storage};
};

describe('where a memory is filed', () => {
  it('puts the project in the key', () => {
    const {world: one, storage} = world('abc123');
    one.save('score');
    expect([...storage.held.keys()]).toEqual(['world-lab.memory.abc123.score']);
  });

  it('keeps two projects apart under the same name', () => {
    // The whole reason: two shared apps that both keep a `score`.
    const a = world('aaa');
    const b = world('bbb');
    a.world.save('score');
    b.world.save('score');

    expect([...a.storage.held.keys()]).toEqual(['world-lab.memory.aaa.score']);
    expect([...b.storage.held.keys()]).toEqual(['world-lab.memory.bbb.score']);
  });

  it('reads back only its own', () => {
    const a = world('aaa');
    a.world.save('score');
    // A second world on the SAME storage but another project finds nothing.
    const elsewhere = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    elsewhere.useStorage(a.storage);
    elsewhere.useChannel('bbb');
    expect(elsewhere.recall('score')).toBe(false);

    elsewhere.useChannel('aaa');
    expect(elsewhere.recall('score')).toBe(true);
  });

  it('forgets only its own', () => {
    const a = world('aaa');
    a.world.save('score');
    const other = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    other.useStorage(a.storage);
    other.useChannel('bbb');

    other.forget('score');
    expect(a.storage.held.size).toBe(1);
  });

  it('falls back to a shared slot when nobody says which project', () => {
    // The headless case: every test, the check runner, the rule demos. It is
    // the behaviour the whole lab had before, kept rather than made an error.
    const {world: one, storage} = world();
    one.save('score');
    expect([...storage.held.keys()]).toEqual(['world-lab.memory.score']);
  });
});
