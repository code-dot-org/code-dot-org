// Electing a trait while the game runs, and dropping one.
//
// `use trait` says what an actor IS as it is built. This is the other half —
// stop this camera following, give the player a shield for ten seconds — and
// the three things worth pinning are the ones that were decisions rather than
// mechanics: a dropped trait keeps its properties, a trait held only by
// dependency does not go, and steps notice on the next frame without anything
// telling them to.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, RuleBuilder, WorldBuilder} from '..';

/** A rule with two traits, the second requiring the first. */
const twoTraits = () => {
  const rule = new RuleBuilder({id: 'kit', name: 'Kit'});
  const base = rule.addTrait({id: 'Base', name: 'Base'});
  const charge = base.addProperty('charge', 'number', 0);
  const extra = rule.addTrait({id: 'Extra', name: 'Extra'});
  extra.requires([base]);
  return {rule, base, extra, charge};
};

describe('adding a trait after the fact', () => {
  it('brings the slots it declares', () => {
    const {base, charge} = twoTraits();
    const actor = new ActorBuilder({id: 'a', name: 'A'}).instantiate();

    expect(actor.has(base)).toBe(false);
    actor.addTrait(base);

    expect(actor.has(base)).toBe(true);
    expect(actor.get(charge)).toBe(0);
  });

  it('brings what the trait requires with it', () => {
    const {base, extra} = twoTraits();
    const actor = new ActorBuilder({id: 'a', name: 'A'}).instantiate();

    actor.addTrait(extra);

    expect(actor.has(base)).toBe(true);
  });
});

describe('dropping a trait', () => {
  it('keeps what it remembered, so putting it back resumes', () => {
    // The decision. A property is read by anything holding a reference to it,
    // not only by the trait that declared it, so dropping the slots would turn
    // "this camera stopped following" into a crash somewhere unrelated. It also
    // makes off-and-on a toggle rather than a reset.
    const {base, charge} = twoTraits();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([base])
      .instantiate();
    actor.set(charge, 7);

    actor.removeTrait(base);

    expect(actor.has(base)).toBe(false);
    expect(actor.get(charge)).toBe(7);

    actor.addTrait(base);

    expect(actor.get(charge)).toBe(7);
  });

  it('leaves one that something else still requires', () => {
    const {base, extra} = twoTraits();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([base, extra])
      .instantiate();

    actor.removeTrait(base);

    // Explicitly elected AND required by a survivor: the count keeps it.
    expect(actor.has(base)).toBe(true);

    actor.removeTrait(extra);

    expect(actor.has(base)).toBe(false);
  });

  it('says nothing about one held only by dependency', () => {
    // Silent by design: it is the same answer as removing a trait the actor
    // never had, and neither is worth stopping a game over.
    const {base, extra} = twoTraits();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([extra])
      .instantiate();

    expect(() => actor.removeTrait(base)).not.toThrow();
    expect(actor.has(base)).toBe(true);
  });

  it('says nothing about one that was never there', () => {
    const {base} = twoTraits();
    const actor = new ActorBuilder({id: 'a', name: 'A'}).instantiate();

    expect(() => actor.removeTrait(base)).not.toThrow();
    expect(actor.has(base)).toBe(false);
  });
});

describe('what the world sees', () => {
  it('stops offering the actor to that trait’s steps', () => {
    // Why no scheduler change was needed: `with` re-filters every frame, so a
    // step's subjects are a question asked afresh rather than a list to update.
    const {base} = twoTraits();
    const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([base])
      .instantiate();
    world.addActor(actor);

    expect(world.actors.with(base)).toEqual([actor]);

    actor.removeTrait(base);

    expect(world.actors.with(base)).toEqual([]);
  });

  it('hands back a copy, so a step may drop a trait while walking', () => {
    // The list is materialised before the body runs, so a step that removes the
    // trait it is iterating finishes its pass and takes effect next frame.
    const {base} = twoTraits();
    const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
    for (const id of ['a', 'b']) {
      world.addActor(
        new ActorBuilder({id, name: id}).useTraits([base]).instantiate(),
      );
    }
    const walked: string[] = [];
    for (const actor of world.actors.with(base)) {
      walked.push(actor.id);
      actor.removeTrait(base);
    }

    expect(walked).toEqual(['a', 'b']);
    expect(world.actors.with(base)).toEqual([]);
  });
});

describe('a template', () => {
  it('answers the same two names, so one block serves both', () => {
    // A block emits `actor.addTrait(…)` whether it sits in a template body or
    // in an event handler, and `actor` is a builder in the first and a live
    // actor in the second (the reason `addEffect` is named as it is).
    const {base} = twoTraits();
    const built = new ActorBuilder({id: 'a', name: 'A'})
      .addTrait(base)
      .instantiate();

    expect(built.has(base)).toBe(true);

    const dropped = new ActorBuilder({id: 'b', name: 'B'})
      .addTrait(base)
      .removeTrait(base)
      .instantiate();

    expect(dropped.has(base)).toBe(false);
  });
});
