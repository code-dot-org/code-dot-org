// The rules a world has without asking for them.
//
// Space and Appearance are built in because a rule cannot provide them — a
// position is not something a rule can invent, and animation reads sprite
// sheets the language cannot see. A world without them is not a simpler world,
// it is a broken one, so `WorldBuilder` seeds them and `use rule` is left for
// the mechanics a game could sensibly be without. Their TRAITS go the same way
// one level down (`ActorBuilder`): being somewhere and being drawn are not
// capabilities an actor opts into.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder} from '..';
import {
  AnimationRule,
  AppearanceTrait,
  SpriteProperty,
} from '../rules/animation';
import {PositionProperty, PositionalTrait, SpatialRule} from '../rules/spatial';

describe('the foundation', () => {
  it('is in play in a world that asked for nothing', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();

    expect(world.snapshot().ruleIds).toEqual(['animation', 'spatial']);
  });

  it('draws an actor that elected nothing at all', () => {
    // The point of seeding, seen from the learner's side: an actor with no
    // `use trait` rows is somewhere and is drawn. Before this it was ABSENT —
    // `renderSnapshot` skips an actor without the positional trait, so a
    // forgotten row meant an actor that existed and could not be seen.
    const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
    world.addActor(new ActorBuilder({id: 'a', name: 'A'}).instantiate());

    expect(world.renderSnapshot().length).toBe(1);
  });

  it('lets `set sprite` and `play animation` work on any actor', () => {
    // Which is what electing "Has Appearance" used to be for. Reading the
    // property is the test: it exists on an actor that never asked for it.
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .set(SpriteProperty, 'coin.png')
      .instantiate();

    expect(actor.get(SpriteProperty)).toBe('coin.png');
    expect(actor.get(PositionProperty).equals({x: 0, y: 0})).toBe(true);
  });

  it('does not duplicate a trait the actor elects anyway', () => {
    // `use trait Can Be Positioned` stays legal and stays a no-op, like naming
    // a foundational rule.
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([PositionalTrait, AppearanceTrait])
      .instantiate();

    expect(
      actor
        .traits()
        .map(trait => trait.id)
        .sort(),
    ).toEqual(['appearance', 'positional']);
  });

  it('does not duplicate a rule the world names anyway', () => {
    // Saying `use rule Has Space` is allowed and means what it says; it just
    // does not put the rule in twice.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([SpatialRule, AnimationRule])
      .instantiate();

    expect(world.snapshot().ruleIds).toEqual(['animation', 'spatial']);
  });

  it('lets an explicitly named rule of the same id win', () => {
    // What keeps the foundation from being a trap. Eject Appearance into an
    // authored rule, name it, and the world runs THAT one — otherwise the
    // learner would edit a rule and watch the built-in it shadows keep running.
    const ejected = {...AnimationRule, steps: {}};
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([ejected])
      .instantiate();

    expect(world.snapshot().ruleIds).toEqual(['animation', 'spatial']);
    // The seeded one has a step; this one has none, so the step list says which
    // of the two is actually in play.
    expect(world.stepOrder().map(step => step.ownerId)).not.toContain(
      'animation',
    );
  });
});
