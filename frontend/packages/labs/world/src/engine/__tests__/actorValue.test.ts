// One actor or several (specs/ACTOR_LISTS.md).
//
// The language has one actor type, and these are the two functions that say
// what an operation means when a value holds several: a statement broadcasts,
// a value reads the first. Generated code routes through them; the engine's own
// methods never see a list.

import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  WorldBuilder,
  all,
  each,
  extreme,
  filtered,
  firstOf,
  firstWhere,
  one,
  ordered,
  pushed,
  taken,
} from '..';

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

describe('filtered', () => {
  const ids = (value: Parameters<typeof all>[0]) =>
    all(value).map(found => found.id);

  it('keeps what the test accepts', () => {
    const actors = [actor('a'), actor('b'), actor('c')];

    expect(ids(filtered(actors, found => found.id !== 'b'))).toEqual([
      'a',
      'c',
    ]);
  });

  it('reads its source before anything walks it', () => {
    // `world.actors` iterates the LIVE list, so deferring the read would let a
    // body that spawns actors go on finding more of them for ever. The source
    // is materialised when the filter is made; only the test waits.
    const actors = [actor('a')];
    const result = filtered(actors, () => true);
    actors.push(actor('b'));

    expect(ids(result)).toEqual(['a']);
  });

  it('stops testing once one actor has been asked for', () => {
    // The short-circuit `first actor … where` promised, kept after that block
    // was deleted: a world of a thousand actors asked for "a Coin" tests until
    // it finds one.
    const tested: string[] = [];
    const actors = [actor('a'), actor('b'), actor('c')];

    one(
      filtered(actors, found => {
        tested.push(found.id);
        return true;
      }),
    );

    expect(tested).toEqual(['a']);
  });

  it('answers the same when it is walked twice', () => {
    // A one-shot sequence that read empty the second time would be a bug
    // nobody could see in the blocks.
    const result = filtered([actor('a'), actor('b')], () => true);

    expect(ids(result)).toEqual(ids(result));
    expect(ids(result)).toEqual(['a', 'b']);
  });

  it('becomes a list when something is added to it', () => {
    // `add ⟨…⟩ to ⟨a variable holding a filter⟩`: a sequence is a description
    // of a walk, not a place to put things.
    const result = pushed(
      filtered([actor('a')], () => true),
      actor('b'),
    );

    expect(result.map(found => found.id)).toEqual(['a', 'b']);
  });
});

describe('ordered', () => {
  it('sorts by what the key says', () => {
    const actors = [actor('a'), actor('b'), actor('c')];
    const rank: Record<string, number> = {a: 3, b: 1, c: 2};

    const result = ordered(actors, found => rank[found.id]);

    expect(result.map(found => found.id)).toEqual(['b', 'c', 'a']);
  });

  it('reverses when the greatest goes first', () => {
    const actors = [actor('a'), actor('b')];
    const rank: Record<string, number> = {a: 1, b: 2};

    expect(
      ordered(actors, found => rank[found.id], true).map(found => found.id),
    ).toEqual(['b', 'a']);
  });

  it('leaves equal keys in the world\u2019s order', () => {
    // Ties break by the order actors were added, which is what everything else
    // here yields.
    const actors = [actor('a'), actor('b'), actor('c')];

    expect(ordered(actors, () => 0).map(found => found.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('reads each key once', () => {
    // The key is an authored expression, and a comparison-time key would
    // evaluate it several times per actor.
    let reads = 0;
    const actors = [actor('a'), actor('b'), actor('c')];

    ordered(actors, () => ++reads);

    expect(reads).toBe(3);
  });
});

describe('taken', () => {
  it('takes the first few', () => {
    const actors = [actor('a'), actor('b'), actor('c')];

    expect(all(taken(actors, 2)).map(found => found.id)).toEqual(['a', 'b']);
  });

  it('takes everything when asked for more than there is', () => {
    expect(all(taken([actor('a')], 5)).map(found => found.id)).toEqual(['a']);
  });

  it('takes none for a count of zero or less', () => {
    expect(all(taken([actor('a')], 0))).toEqual([]);
    expect(all(taken([actor('a')], -1))).toEqual([]);
  });

  it('stops the filter under it once it has enough', () => {
    // Why this is lazy: "the three nearest" should not test everything and
    // then drop most of it.
    const tested: string[] = [];
    const actors = [actor('a'), actor('b'), actor('c')];

    all(
      taken(
        filtered(actors, found => {
          tested.push(found.id);
          return true;
        }),
        2,
      ),
    );

    expect(tested).toEqual(['a', 'b']);
  });
});

describe('extreme', () => {
  const rank: Record<string, number> = {a: 3, b: 1, c: 2};

  it('answers with the least', () => {
    const actors = [actor('a'), actor('b'), actor('c')];

    expect(extreme(actors, found => rank[found.id])[0].id).toBe('b');
  });

  it('answers with the greatest', () => {
    const actors = [actor('a'), actor('b'), actor('c')];

    expect(extreme(actors, found => rank[found.id], true)[0].id).toBe('a');
  });

  it('answers with no actors when there are none to choose between', () => {
    // An ordinary outcome, like a search that finds nothing: a statement over
    // it does nothing rather than failing.
    expect(extreme([], () => 0)).toEqual([]);
  });

  it('skips an actor whose key is not a number', () => {
    // NaN loses every comparison, so without this an actor whose key failed to
    // compute could win by falling through both branches.
    const actors = [actor('a'), actor('b')];

    expect(extreme(actors, found => (found.id === 'a' ? NaN : 5))[0].id).toBe(
      'b',
    );
  });
});

describe('firstOf', () => {
  it('answers with the first of several', () => {
    expect(firstOf([actor('a'), actor('b')])[0].id).toBe('a');
  });

  it('answers with the one, for one', () => {
    expect(firstOf(actor('a'))[0].id).toBe('a');
  });

  it('answers with no actors for none', () => {
    expect(firstOf([])).toEqual([]);
  });

  it('pulls one item from a sequence and stops', () => {
    const tested: string[] = [];

    firstOf(
      filtered([actor('a'), actor('b')], found => {
        tested.push(found.id);
        return true;
      }),
    );

    expect(tested).toEqual(['a']);
  });
});
