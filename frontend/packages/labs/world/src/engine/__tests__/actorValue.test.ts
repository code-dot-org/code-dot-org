// One actor or several (specs/ACTOR_LISTS.md).
//
// The language has one actor type, and these are the two functions that say
// what an operation means when a value holds several: a statement broadcasts,
// a value reads the first. Generated code routes through them; the engine's own
// methods never see a list.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder, each, firstWhere, one} from '..';

const world = () => new WorldBuilder({id: 'w', name: 'W'}).instantiate();
const actor = (id: string, type?: string) =>
  new ActorBuilder({id, name: id}).instantiate(id, type);

describe('each', () => {
  it('runs once for one actor', () => {
    const seen: string[] = [];

    each(actor('a'), found => seen.push(found.id));

    expect(seen).toEqual(['a']);
  });

  it('runs once per actor for several', () => {
    const seen: string[] = [];

    each([actor('a'), actor('b')], found => seen.push(found.id));

    expect(seen).toEqual(['a', 'b']);
  });

  it('runs nothing for none', () => {
    // What a loop over nothing does, which is what a broadcast to nothing
    // should do — not an error a learner has to guard.
    const seen: string[] = [];

    each([], found => seen.push(found.id));

    expect(seen).toEqual([]);
  });
});

describe('one', () => {
  it('is the actor, or the first of them', () => {
    const a = actor('a');

    expect(one(a)).toBe(a);
    expect(one([a, actor('b')])).toBe(a);
  });
});

describe('firstWhere', () => {
  it('is the first actor the test accepts, as a value holding it', () => {
    const a = actor('a', 'gem');
    const b = actor('b', 'coin');
    const c = actor('c', 'coin');

    expect(firstWhere([a, b, c], found => found.type === 'coin')).toEqual([b]);
    expect(one(firstWhere([a, b, c], found => found.type === 'coin'))).toBe(b);
  });

  it('holds NO actors when none of them match', () => {
    // Not `undefined`: a search that finds nothing is an ordinary outcome, and
    // a value holding no actors is what the language already says for it.
    expect(firstWhere([actor('a')], () => false)).toEqual([]);
    expect(firstWhere([], () => true)).toEqual([]);
  });

  it('makes a statement over no match do nothing, rather than fail', () => {
    // The reason for the list. `remove actor ⟨first actor … where …⟩` compiles
    // to a broadcast, and a broadcast to nothing runs no times — so a search
    // that matched nothing removes nothing, quietly and correctly.
    const ran: string[] = [];

    each(
      firstWhere([actor('a'), actor('b')], () => false),
      found => ran.push(found.id),
    );

    expect(ran).toEqual([]);
  });

  it('stops at the match', () => {
    // The whole difference from the loop it mirrors: asked for "a Coin" in a
    // world of a thousand actors, it walks until it finds one.
    const actors = [actor('a'), actor('b'), actor('c')];
    const asked: string[] = [];

    firstWhere(actors, found => {
      asked.push(found.id);
      return found.id === 'b';
    });

    expect(asked).toEqual(['a', 'b']);
  });

  it('walks the world’s own collection, not just an array', () => {
    // What the generated code hands it for the common source: `world.actors`
    // is iterable but not an array, and copying the world to look at its first
    // actor would be the wrong shape for a search.
    const built = world();
    built.addActor(actor('coin1', 'actors/coin'));
    built.addActor(actor('player', 'actors/player'));

    expect(
      one(firstWhere(built.actors, found => found.type === 'actors/player')).id,
    ).toBe('player');
  });
});

describe('world.actors.ofType', () => {
  it('is every actor placed under that type', () => {
    // What `any ⟨Coin⟩` compiles to everywhere but a handler's subject socket.
    // A type is what the world stamped the instance with — a module path for a
    // project actor, an id for a world's own — so nothing has to be imported
    // to ask for them.
    const built = world();
    built.addActor(actor('coin1', 'actors/coin'));
    built.addActor(actor('coin2', 'actors/coin'));
    built.addActor(actor('player', 'actors/player'));

    expect(built.actors.ofType('actors/coin').map(a => a.id)).toEqual([
      'coin1',
      'coin2',
    ]);
    expect(built.actors.ofType('actors/nothing')).toEqual([]);
  });
});
