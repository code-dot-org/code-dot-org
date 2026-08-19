// `world.actors` — the collection generated code walks.
//
// It exists only as that surface: the engine's own methods reach `actorList`
// directly, so every one of these four exits is something a block compiles to.
// What has to be true of all four is the same thing, and it is the rule
// specs/ACTOR_LISTS.md states as a decision: a SOURCE IS READ ONCE, at the top
// of the loop. A rule that changes the world while walking it walks the world
// as it was, and terminates.
//
// Three of them copied and said so. The fourth — the plain iterator, which is
// the one a `for each actor in ⟨all actors⟩` actually uses — did not, and these
// are the two ways that showed.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder, type World} from '..';

const world = (): World => new WorldBuilder({id: 'w', name: 'W'}).instantiate();
const actor = (id: string, type?: string) =>
  new ActorBuilder({id, name: id}).instantiate(id, type);

const populate = (into: World, ids: string[], type?: string) => {
  for (const id of ids) {
    into.addActor(actor(id, type));
  }
  return into;
};

describe('walking every actor', () => {
  it('does not walk what the body adds', () => {
    // Unbounded, this is a hung frame rather than a wrong answer: a loop whose
    // body adds an actor finds the actor it added, for ever. The cap is what
    // keeps this test from being the hang it is testing for.
    const live = world();
    populate(live, ['a']);
    const walked: string[] = [];

    for (const found of live.actors) {
      walked.push(found.id);
      if (walked.length < 20) {
        populate(live, [`spawned${walked.length}`]);
      }
    }

    expect(walked).toEqual(['a']);
  });

  it('removes all of them when the body removes each', () => {
    // The one that mattered. `removeActor` splices, so a live iterator skipped
    // the next actor every time and "remove everything" removed half — quietly,
    // which is worse than failing.
    const live = world();
    populate(live, ['a', 'b', 'c', 'd']);

    for (const found of live.actors) {
      live.removeActor(found);
    }

    expect([...live.actors]).toHaveLength(0);
  });

  it('sees what was there when the walk started, not what is there now', () => {
    // The rule stated plainly, without a body doing the changing.
    const live = world();
    populate(live, ['a', 'b']);
    const walk = live.actors[Symbol.iterator]();
    populate(live, ['c']);

    const walked = [];
    for (let step = walk.next(); !step.done; step = walk.next()) {
      walked.push(step.value.id);
    }

    expect(walked).toEqual(['a', 'b']);
  });

  it('is true of the narrowed lists too, as it always was', () => {
    // `ofType`, `inLayer` and `with` filtered into a new array from the start.
    // Kept here so the four exits are checked in one place rather than one of
    // them being the odd one out again.
    const live = world();
    populate(live, ['a', 'b'], 'actors/coin');
    const coins = live.actors.ofType('actors/coin');
    populate(live, ['c'], 'actors/coin');

    expect(coins.map(found => found.id)).toEqual(['a', 'b']);
  });
});
