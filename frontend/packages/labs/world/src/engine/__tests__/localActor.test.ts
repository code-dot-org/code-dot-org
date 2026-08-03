// Placing an actor a world built for itself.
//
// The engine end of `define actor` inside a `.world` file (BACKGROUNDS-style
// blocks aside, see blockly/localActors): the generated module builds an
// `ActorBuilder` as a plain `const` in the world's own module and hands it
// straight to `addActor`. No `define`, no module, no export — so what has to be
// true is that a builder nothing registered is as placeable as one a `.actor`
// file exported, and that the placed actor carries the type it was given.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';

import {AffectedByGravityTrait, GravityRule} from './fixtures/gravityRule';

/** What the generated code does, in the order it does it. */
const worldWithLocalActor = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'}).useRules([GravityRule]);
  // `const actor_Twin_ab1 = new WorldLab.ActorBuilder({id: "Twin", …});`
  const local = new ActorBuilder({id: 'Twin', name: 'Twin'})
    .useTraits([AffectedByGravityTrait])
    .set(PositionProperty, new Vector(120, 40));
  // `{ const actor = world.addActor(actor_Twin_ab1, "<blockId>", "Twin"); }`
  const placed = world.addActor(local, 'placeLocal', 'Twin');
  return {world: world.getWorld(), local, placed};
};

describe('an actor defined inside its world', () => {
  it('is placed like any other, and carries its type', () => {
    const {world, placed} = worldWithLocalActor();

    expect([...world.actors]).toHaveLength(1);
    expect(placed.id).toBe('placeLocal');
    // The `type` is what `is a` compares against, and what a placed actor is
    // known by — an id here rather than a module path, because there is no
    // module (blockly/localActors).
    expect(placed.type).toBe('Twin');
    expect(placed.get(PositionProperty)).toEqual(new Vector(120, 40));
  });

  it('lives under the world’s rules, like an imported one', () => {
    // The point of placing it at all: it is an actor of this world, so the
    // world's steps run over it.
    const {world, placed} = worldWithLocalActor();

    world.tick(0.1);

    expect(placed.get(PositionProperty).y).toBeGreaterThan(40);
  });

  it('is placed twice as two actors, from one template', () => {
    // A definition is a template, not an instance — the same as a `.actor`
    // file's, which is what makes `add actor` twice mean two of them.
    const world = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const local = new ActorBuilder({id: 'Twin', name: 'Twin'}).useTraits([
      AffectedByGravityTrait,
    ]);

    const first = world.addActor(local, 'a', 'Twin');
    const second = world.addActor(local, 'b', 'Twin');

    expect([...world.getWorld().actors]).toHaveLength(2);
    expect(first).not.toBe(second);
    expect(second.type).toBe('Twin');
  });

  it('is not registered as a type anyone else could name', () => {
    // "The actor does not exist outside this world": nothing defines it for a
    // map to place, and no module exports it. A map naming "Twin" finds
    // nothing rather than quietly placing the world's own.
    const world = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const local = new ActorBuilder({id: 'Twin', name: 'Twin'}).useTraits([
      AffectedByGravityTrait,
    ]);
    world.addActor(local, 'a', 'Twin');

    expect(() => world.loadMap({actors: [{type: 'Twin'}]})).toThrow(/Twin/);
  });
});
