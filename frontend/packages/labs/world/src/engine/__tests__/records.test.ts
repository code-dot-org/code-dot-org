// Keeping records: actors of a kind, saved and brought back.
//
// A record is an ACTOR — named typed fields, an inspector, blocks, a picture —
// so what was missing was never a way to describe one, only a way to keep one
// (specs/RECORDS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {each} from '../core/actorValue';
import {Vector} from '../core/Vector';
import {PositionProperty} from '../rules/spatial';

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
    /** The notes in the world, which is what `any ⟨Note⟩` is. */
    held: () => [...world.actors].filter(one => one.type === 'actors/note'),
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
    expect(first.world.rememberActors(first.held(), 'notes')).toBe(true);

    // A NEW WORLD over the same storage, which is what a reload is.
    const again = open(first.storage);
    expect(again.world.recallActors('notes').length).toBe(2);
    expect(again.notes()).toEqual([
      {text: 'milk', done: false, at: 10},
      {text: 'bread', done: true, at: 20},
    ]);
  });

  it('answers zero on a first run, which is how a start screen tells', () => {
    const fresh = open();
    expect(fresh.world.recallActors('notes').length).toBe(0);
    expect(fresh.notes()).toEqual([]);
  });

  it('adds rather than replacing, so calling it twice makes two sets', () => {
    // Quietly clearing first would destroy actors it was never shown.
    const first = open();
    first.write('milk');
    first.world.rememberActors(first.held(), 'notes');

    const again = open(first.storage);
    again.world.recallActors('notes');
    again.world.recallActors('notes');
    expect(again.notes()).toHaveLength(2);
  });

  it('keeps a SUBSET, which is what taking the actors buys', () => {
    // The first cut took a KIND and could only ever keep all of them. A
    // socket takes `the ⟨Note⟩s where ⟨done⟩ is false` just as happily.
    const first = open();
    first.write('milk', false);
    first.write('bread', true);
    const undone = first.held().filter(one => !one.get(first.done));
    first.world.rememberActors(undone, 'notes');

    const again = open(first.storage);
    expect(again.world.recallActors('notes')).toHaveLength(1);
    expect(again.notes()).toEqual([{text: 'milk', done: false, at: 0}]);
  });

  it('skips a row whose kind this world no longer holds', () => {
    // Saved data outlives edits, and the REST of the set is still worth
    // having — so a row nothing can make is passed over rather than thrown.
    const one = open();
    one.storage.held.set(
      'world-lab.memory.notes',
      JSON.stringify({
        rows: [
          {kind: 'actors/gone', fields: {text: 'x'}},
          {kind: 'actors/note', fields: {text: 'milk'}},
        ],
      }),
    );
    expect(one.world.recallActors('notes')).toHaveLength(1);
    expect(one.notes()).toEqual([{text: 'milk', done: false, at: 0}]);
  });

  it('takes a field the data does not mention as the kind has it', () => {
    // Saved data outlives edits: a project that ADDS a field should not find
    // its other values wiped.
    const one = open();
    one.storage.held.set(
      'world-lab.memory.notes',
      JSON.stringify({rows: [{kind: 'actors/note', fields: {text: 'milk'}}]}),
    );
    expect(one.world.recallActors('notes').length).toBe(1);
    expect(one.notes()).toEqual([{text: 'milk', done: false, at: 0}]);
  });

  it('ignores a field the kind no longer declares', () => {
    const one = open();
    one.storage.held.set(
      'world-lab.memory.notes',
      JSON.stringify({
        rows: [{kind: 'actors/note', fields: {text: 'milk', colour: 'red'}}],
      }),
    );
    expect(one.world.recallActors('notes').length).toBe(1);
    expect(one.notes()).toEqual([{text: 'milk', done: false, at: 0}]);
  });

  it('is not taken down by a key that is not a memory', () => {
    const one = open();
    one.storage.held.set('world-lab.memory.notes', 'not json at all');
    expect(one.world.recallActors('notes').length).toBe(0);
  });

  it('remembers nothing where a browser lends no storage', () => {
    const bare = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    expect(bare.rememberActors([], 'notes')).toBe(false);
    expect(bare.recallActors('notes').length).toBe(0);
  });
});

describe('what comes back', () => {
  it('is the actors, so a project can put them where they belong', () => {
    // THE REASON IT IS NOT A COUNT. A record has nowhere to be and does not
    // care; anything DRAWN has to be put somewhere, and only the project
    // knows where. Handing the set over is what lets it say so
    // (specs/RECORDS_PLAN.md).
    const first = open();
    first.write('milk');
    first.write('bread');
    first.world.rememberActors(first.held(), 'notes');

    const again = open(first.storage);
    const back = again.world.recallActors('notes');
    expect(back).toHaveLength(2);
    // …and they are ACTORS, with everything an actor has.
    expect(back.map(one => one.get(again.text))).toEqual(['milk', 'bread']);
  });

  it('is already in the world, so nothing leaks if it is dropped', () => {
    // An actor outside a world has no age and is found by nothing, so a set
    // of unplaced actors would be a value that leaked.
    const first = open();
    first.write('milk');
    first.world.rememberActors(first.held(), 'notes');

    const again = open(first.storage);
    again.world.recallActors('notes');
    expect(again.held()).toHaveLength(1);
  });

  it('comes back mixed when it went in mixed', () => {
    // Every row carries its own kind, which is what a socket over a KIND
    // dropdown buys: one memory, two sorts of thing.
    const kind = new ActorBuilder({id: 'tag', name: 'Tag'}).isData();
    const label = kind.defineProperty('label', 'string', '');
    const first = open();
    first.world.define('actors/tag', kind);
    first.write('milk');
    const tag = first.world.addActor(kind, undefined, 'actors/tag');
    tag.set(label, 'shopping');

    first.world.rememberActors(
      [...first.world.actors].filter(one => one.type !== 'actors/list'),
      'notes',
    );

    const again = open(first.storage);
    again.world.define('actors/tag', kind);
    const back = again.world.recallActors('notes');
    expect(back.map(one => one.type)).toEqual(['actors/note', 'actors/tag']);
  });
});

describe('putting back what came back', () => {
  it('takes a whole set at once, because a statement broadcasts', () => {
    // No new block was needed for this. `set position of ⟨any Coin⟩` already
    // means every coin (`core/actorValue`), so it equally means every actor
    // that came back — which is why `bring back` answers the SET.
    const first = open();
    first.write('milk');
    first.write('bread');
    first.world.rememberActors(first.held(), 'notes');

    const again = open(first.storage);
    const back = again.world.recallActors('notes');
    each(back, one => one.set(PositionProperty, new Vector(5, 7)));
    expect(back.map(one => one.get(PositionProperty))).toEqual([
      new Vector(5, 7),
      new Vector(5, 7),
    ]);
  });

  it('is reparented by the ordinary block — for a kind that is DRAWN', () => {
    // Which is the answer to "where do they go": wherever the project puts
    // them, with the blocks it already has. A parent carries its children's
    // LAYER and SPACE (`Actor.setParent`), so rows brought back into a Scroll
    // View go into that view's space by being parented to something in it.
    const row = new ActorBuilder({id: 'row', name: 'Row'});
    const label = row.defineProperty('label', 'string', '');
    const storage = store();
    const first = new WorldBuilder({id: 'w', name: 'W'})
      .define('actors/row', row)
      .getWorld();
    first.useStorage(storage);
    const made = first.addActor(row, undefined, 'actors/row');
    made.set(label, 'milk');
    first.rememberActors([made], 'rows');

    const again = new WorldBuilder({id: 'w', name: 'W'})
      .define('actors/row', row)
      .define('actors/panel', new ActorBuilder({id: 'panel', name: 'Panel'}))
      .getWorld();
    again.useStorage(storage);
    const holder = again.addActor(
      new ActorBuilder({id: 'panel', name: 'Panel'}),
      'Holder',
      'actors/panel',
    );
    const back = again.recallActors('rows');
    each(back, one => one.setParent(holder));

    expect(back).toHaveLength(1);
    expect(back[0].parent()).toBe(holder);
    expect(back[0].layer).toBe(holder.layer);
  });

  it('cannot parent a RECORD, which is right: it has no place', () => {
    // Parenting is the positional trait's, and `is data` is the absence of
    // it. A thing with nowhere to be has nowhere to be RELATIVE to either,
    // and the engine says so rather than pretending (specs/RECORDS_PLAN.md).
    const one = open();
    const note = one.write('milk');
    const holder = one.world.addActor(
      new ActorBuilder({id: 'panel', name: 'Panel'}),
      'Holder',
      'actors/panel',
    );
    expect(note.setParent(holder)).toBe(false);
    expect(note.parent()).toBeUndefined();
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

    world.rememberActors([one, other], 'notes');
    const written = JSON.parse(storage.held.get('world-lab.memory.notes')!);
    expect(written.rows[0]).toEqual({
      kind: 'actors/note',
      fields: {text: 'milk'},
    });
  });
});
