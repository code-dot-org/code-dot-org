// One actor or several (specs/ACTOR_LISTS.md).
//
// The language has one actor type, and these are the two functions that say
// what an operation means when a value holds several: a statement broadcasts,
// a value reads the first. Generated code routes through them; the engine's own
// methods never see a list.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder, each, one} from '..';

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
