// `the actors in ⟨…⟩ within ⟨60⟩ of ⟨this actor⟩` — the neighborhood query.
//
// The list operations in `core/actorValue` know nothing about where an actor
// is; this one is about nothing else, which is why it lives with the rule that
// owns positions. What is worth pinning is the three decisions in it: middle to
// middle, near ANY of several, and never the thing measured from.

import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
  all,
  taken,
  within,
  type Actor,
} from '..';

const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();

const at = (id: string, x: number, y: number): Actor => {
  const actor = new ActorBuilder({id, name: id})
    .set(PositionProperty, new Vector(x, y))
    .instantiate(id);
  world.addActor(actor);
  return actor;
};

const middle = at('middle', 100, 100);
at('near', 140, 100);
at('alsoNear', 100, 60);
const far = at('far', 300, 100);
const names = (found: Iterable<Actor>) => [...found].map(actor => actor.id);

describe('within', () => {
  it('finds what is close enough and leaves what is not', () => {
    expect(names(within(world.actors, middle, 50)).sort()).toEqual([
      'alsoNear',
      'near',
    ]);
  });

  it('measures middle to middle, and takes the edge as near enough', () => {
    // Exactly the distance counts: a radius of 40 includes the actor 40 away,
    // which is what "within 40" says.
    expect(names(within(world.actors, middle, 40))).toContain('near');
    expect(names(within(world.actors, middle, 39))).not.toContain('near');
  });

  it('never answers with what it measured from', () => {
    // A thing is not near itself. A boid counting its neighbors would
    // otherwise always have one.
    expect(names(within(world.actors, middle, 1000))).not.toContain('middle');
  });

  it('is near ANY of several', () => {
    // `within ⟨80⟩ of ⟨any Guard⟩` is everything near a guard — and none of the
    // guards, because each of them is measured from.
    const found = names(within(world.actors, [middle, far], 45));

    expect(found.sort()).toEqual(['alsoNear', 'near']);
  });

  it('finds nothing at no distance, and nothing from nothing', () => {
    expect(names(within(world.actors, middle, 0))).toEqual([]);
    expect(names(within(world.actors, middle, -10))).toEqual([]);
    expect(names(within(world.actors, [], 1000))).toEqual([]);
  });

  it('stays lazy, so taking three stops at three', () => {
    expect(all(taken(within(world.actors, middle, 1000), 1))).toHaveLength(1);
  });
});
