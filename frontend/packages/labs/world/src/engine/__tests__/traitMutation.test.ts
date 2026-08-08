// Electing a trait while the game runs, and dropping one.
//
// `use trait` says what an actor IS as it is built. This is the other half —
// stop this camera following, give the player a shield for ten seconds — and
// the three things worth pinning are the ones that were decisions rather than
// mechanics: a dropped trait keeps its properties, a trait held only by
// dependency does not go, and steps notice on the next frame without anything
// telling them to.

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {ActorBuilder, RuleBuilder, WorldBuilder} from '..';
import type {Actor} from '../core/Actor';
import {resetTraitWarnings} from '../core/Traited';

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

describe('a trait that does not exist', () => {
  // What a saved workspace naming a since-deleted rule generates: the block
  // still holds the field value, the module still names the export, and the
  // export is gone — so the engine is handed `undefined`. It used to reach
  // `DependencySet`, which keys traits by `id`, and stop the game with "Cannot
  // read properties of undefined (reading 'id')", naming nothing a learner
  // wrote. One broken reference is not a reason for a game to stop.
  const missing = undefined as unknown as Parameters<Actor['has']>[0];

  beforeEach(() => {
    resetTraitWarnings();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('is not had, rather than fatal', () => {
    const actor = new ActorBuilder({id: 'a', name: 'A'}).instantiate();

    expect(actor.has(missing)).toBe(false);
  });

  it('is skipped by both halves of the pair', () => {
    const actor = new ActorBuilder({id: 'a', name: 'A'}).instantiate();

    expect(() => actor.addTrait(missing)).not.toThrow();
    expect(() => actor.removeTrait(missing)).not.toThrow();
  });

  it('does not stop a camera either — the same store answers both', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
    const camera = world.camera();

    expect(camera?.has(missing)).toBe(false);
    expect(() => camera?.removeTrait(missing)).not.toThrow();
  });

  it('does not stop a template from being built', () => {
    // The builder fails EARLIER than the live actor — at `instantiate`, before
    // anything has run — so an actor file with one stale `use trait` row would
    // otherwise take the whole project down.
    const actor = new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([missing])
      .instantiate();

    expect(actor.traits().length).toBe(2); // the two foundation traits
  });

  it('is survivable through the builder’s own pair', () => {
    expect(() =>
      new ActorBuilder({id: 'a', name: 'A'})
        .addTrait(missing)
        .removeTrait(missing)
        .instantiate(),
    ).not.toThrow();
  });

  it('says so once, however many actors ask', () => {
    // A `for each actor where ⟨has trait …⟩` asks the same broken question of
    // every actor sixty times a second. One line is the diagnostic; a hundred
    // identical ones are noise that buries it.
    const actors = ['a', 'b', 'c'].map(id =>
      new ActorBuilder({id, name: id}).instantiate(),
    );
    for (let frame = 0; frame < 5; frame++) {
      for (const actor of actors) {
        actor.has(missing);
      }
    }

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(vi.mocked(console.warn).mock.calls[0][0]).toMatch(
      /trait that does not exist/,
    );
  });

  it('says which operation it skipped', () => {
    const actor = new ActorBuilder({id: 'a', name: 'A'}).instantiate();
    actor.has(missing);
    actor.addTrait(missing);
    actor.removeTrait(missing);

    // Three operations, three distinct messages, each said once.
    expect(console.warn).toHaveBeenCalledTimes(3);
    const said = vi.mocked(console.warn).mock.calls.map(c => String(c[0]));
    expect(said.some(m => m.includes('has trait'))).toBe(true);
    expect(said.some(m => m.includes('add trait'))).toBe(true);
    expect(said.some(m => m.includes('remove trait'))).toBe(true);
  });
});
