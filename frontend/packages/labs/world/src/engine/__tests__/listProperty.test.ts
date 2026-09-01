// A property that holds a list of plain values (specs/LISTS.md).
//
// The type that lets the language hold two numbers, and the two things it has
// to get right: a list is COPIED on the way in, so a default is not one array
// behind every holder of it; and it is SNAPSHOTTED, which is the whole reason
// it is worth being state rather than only a value — an actor list can be
// neither, because an actor holds the world that holds it.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, RuleBuilder, Vector, WorldBuilder} from '..';

/** A rule with one list property of each shape, world- and actor-scoped. */
const listRule = () => {
  const rule = new RuleBuilder({
    id: 'tally',
    name: 'Tally',
    ability: 'Tallies',
  });
  const scores = rule.addProperty('scores', 'numbers', []);
  const trait = rule.addTrait({id: 'remembers', name: 'Remembers'});
  const places = trait.addProperty('places', 'vectors', []);
  const said = trait.addProperty('said', 'words', []);
  return {rule: rule.build(), scores, places, said};
};

describe('a list property', () => {
  it('holds what it is given, and hands back a list of its own', () => {
    const {rule, scores} = listRule();
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule])
      .instantiate();

    const given = [10, 20];
    world.set(scores, given);
    given.push(30);

    // The world kept a COPY: a caller that goes on using the array it passed is
    // not still writing into the world's state.
    expect(world.get(scores)).toEqual([10, 20]);
  });

  it('gives each holder its own, rather than the default they share', () => {
    // The failure this exists to stop: a default held by reference is one array
    // behind every actor that elected the trait — two players, one bag.
    const {rule, said} = listRule();
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule])
      .instantiate();
    const player = (id: string) =>
      new ActorBuilder({id, name: id})
        .useTraits([rule.traits.remembers])
        .instantiate(id);
    const one = player('one');
    const two = player('two');
    world.addActor(one);
    world.addActor(two);

    one.set(said, ['hello']);

    expect(one.get(said)).toEqual(['hello']);
    expect(two.get(said)).toEqual([]);
  });

  it('holds vectors as vectors, however they were written', () => {
    // A `.map` file's JSON has `{x, y}` in it and a block hands over the real
    // thing; a list that held both would work until somebody saved the project.
    const {rule, places} = listRule();
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule])
      .instantiate();
    const actor = new ActorBuilder({id: 'a', name: 'a'})
      .useTraits([rule.traits.remembers])
      .instantiate('a');
    world.addActor(actor);

    actor.set(places, [{x: 1, y: 2}, new Vector(3, 4)] as never);

    const held = actor.get(places) as Vector[];
    expect(held.every(place => place instanceof Vector)).toBe(true);
    expect(held.map(place => place.x)).toEqual([1, 3]);
  });

  it('is in the snapshot, which an actor list can never be', () => {
    // The reason to have it as state at all: a hot reload compares snapshots by
    // stringifying, so a list of plain data is carried across a rebuild and
    // patched live, where a list of actors is a cycle that would throw.
    const {rule, scores} = listRule();
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule])
      .instantiate();
    world.set(scores, [7, 8]);

    const snapshot = world.snapshot();

    expect(snapshot.world['tally.scores']).toEqual([7, 8]);
    expect(() => JSON.stringify(snapshot)).not.toThrow();
  });
});
