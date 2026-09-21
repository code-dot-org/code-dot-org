// Keeping records: actors of a kind, saved and brought back.
//
// A record is an ACTOR — named typed fields, an inspector, blocks, a picture —
// so what was missing was never a way to describe one, only a way to keep one
// (specs/RECORDS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';

const store = () => {
  const held = new Map<string, string>();
  return {
    held,
    getItem: (key: string) => held.get(key) ?? null,
    setItem: (key: string, value: string) => void held.set(key, value),
    removeItem: (key: string) => void held.delete(key),
  };
};

/** A Note: words, a tick, and a moment — the shape an app actually keeps. */
const noteKind = () => {
  const kind = new ActorBuilder({id: 'note', name: 'Note'}).isData();
  const text = kind.defineProperty('text', 'string', '');
  const done = kind.defineProperty('done', 'boolean', false);
  const at = kind.defineProperty('at', 'number', 0);
  return {kind, text, done, at};
};

const open = (storage = store()) => {
  const {kind, text, done, at} = noteKind();
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .define('actors/note', kind)
    .getWorld();
  world.useStorage(storage);
  return {
    world,
    storage,
    text,
    done,
    at,
    /** Make one, as `add actor ⟨Note⟩ do …` would. */
    write: (words: string, ticked = false, when = 0) => {
      const actor = world.addActor(kind, undefined, 'actors/note');
      actor.set(text, words);
      actor.set(done, ticked);
      actor.set(at, when);
      return actor;
    },
    notes: () =>
      [...world.actors]
        .filter(actor => actor.type === 'actors/note')
        .map(actor => ({
          text: actor.get(text),
          done: actor.get(done),
          at: actor.get(at),
        })),
  };
};

describe('remembering a kind', () => {
  it('brings every field back, in order', () => {
    const first = open();
    first.write('milk', false, 10);
    first.write('bread', true, 20);
    expect(first.world.rememberActors('actors/note', 'notes')).toBe(true);

    // A NEW WORLD over the same storage, which is what a reload is.
    const again = open(first.storage);
    expect(again.world.recallActors('actors/note', 'notes')).toBe(2);
    expect(again.notes()).toEqual([
      {text: 'milk', done: false, at: 10},
      {text: 'bread', done: true, at: 20},
    ]);
  });

  it('answers zero on a first run, which is how a start screen tells', () => {
    const fresh = open();
    expect(fresh.world.recallActors('actors/note', 'notes')).toBe(0);
    expect(fresh.notes()).toEqual([]);
  });

  it('adds rather than replacing, so calling it twice makes two sets', () => {
    // Quietly clearing first would destroy actors it was never shown.
    const first = open();
    first.write('milk');
    first.world.rememberActors('actors/note', 'notes');

    const again = open(first.storage);
    again.world.recallActors('actors/note', 'notes');
    again.world.recallActors('actors/note', 'notes');
    expect(again.notes()).toHaveLength(2);
  });

  it('keeps nothing of a kind that is not there', () => {
    const one = open();
    one.write('milk');
    one.world.rememberActors('actors/nothing', 'notes');
    const again = open(one.storage);
    expect(again.world.recallActors('actors/note', 'notes')).toBe(0);
  });

  it('refuses a memory saved for another kind', () => {
    const one = open();
    one.write('milk');
    one.world.rememberActors('actors/note', 'notes');
    const again = open(one.storage);
    expect(again.world.recallActors('actors/other', 'notes')).toBe(0);
  });

  it('takes a field the data does not mention as the kind has it', () => {
    // Saved data outlives edits: a project that ADDS a field should not find
    // its other values wiped.
    const one = open();
    one.storage.held.set(
      'world-lab.memory.notes',
      JSON.stringify({kind: 'actors/note', rows: [{text: 'milk'}]}),
    );
    expect(one.world.recallActors('actors/note', 'notes')).toBe(1);
    expect(one.notes()).toEqual([{text: 'milk', done: false, at: 0}]);
  });

  it('ignores a field the kind no longer declares', () => {
    const one = open();
    one.storage.held.set(
      'world-lab.memory.notes',
      JSON.stringify({
        kind: 'actors/note',
        rows: [{text: 'milk', colour: 'red'}],
      }),
    );
    expect(one.world.recallActors('actors/note', 'notes')).toBe(1);
    expect(one.notes()).toEqual([{text: 'milk', done: false, at: 0}]);
  });

  it('is not taken down by a key that is not a memory', () => {
    const one = open();
    one.storage.held.set('world-lab.memory.notes', 'not json at all');
    expect(one.world.recallActors('actors/note', 'notes')).toBe(0);
  });

  it('remembers nothing where a browser lends no storage', () => {
    const bare = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    expect(bare.rememberActors('actors/note', 'notes')).toBe(false);
    expect(bare.recallActors('actors/note', 'notes')).toBe(0);
  });
});

describe('what a record refuses to keep', () => {
  it('leaves out a field that points at another actor', () => {
    // Across two runs there is nothing for it to point at: `loadMap` resolves
    // a reference because both ends are in one map, and two runs are not.
    const kind = new ActorBuilder({id: 'note', name: 'Note'}).isData();
    const text = kind.defineProperty('text', 'string', '');
    const friend = kind.defineProperty('friend', 'actor', undefined);
    const storage = store();
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .define('actors/note', kind)
      .getWorld();
    world.useStorage(storage);
    const one = world.addActor(kind, undefined, 'actors/note');
    one.set(text, 'milk');
    const other = world.addActor(kind, undefined, 'actors/note');
    one.set(friend, other as never);

    world.rememberActors('actors/note', 'notes');
    const written = JSON.parse(storage.held.get('world-lab.memory.notes')!);
    expect(written.rows[0]).toEqual({text: 'milk'});
  });
});
