// Effects through the engine: applied on a builder, carried to the render
// snapshot, and reported in the world snapshot so a change restarts the game.
//
// The engine deliberately never looks inside an effect document — it is
// appearance-of-the-drawing, not simulated state — so what is under test is
// that it carries the thing faithfully and reports when it differs.

import {describe, expect, it} from 'vitest';

import type {EffectDocument} from '../../effect/model/types';
import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {effectSnapshotId} from '../core/effectIds';
import {PositionalTrait, SpatialRule} from '../rules/spatial';

const doc = (name: string, nodeId = 'sample-1'): EffectDocument => ({
  version: 1,
  name,
  parameters: [],
  nodes: [{id: nodeId, type: 'sample', position: {x: 0, y: 0}}],
  edges: [],
  functions: [],
});

const worldWith = (...actors: ActorBuilder[]) => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([SpatialRule])
    .instantiate();
  actors.forEach((builder, index) =>
    world.addActor(builder.instantiate(`a${index}`)),
  );
  return world;
};

const positional = (id: string) =>
  new ActorBuilder({id, name: id}).useTraits([PositionalTrait]);

describe('ActorBuilder.useEffect', () => {
  it('carries path and document onto the instantiated actor', () => {
    const ripple = doc('Ripple');
    const actor = positional('fish')
      .useEffect('effects/ripple', ripple)
      .instantiate();

    expect(actor.effects()).toEqual([
      {path: 'effects/ripple', document: ripple},
    ]);
  });

  it('keeps application order for several effects', () => {
    const actor = positional('fish')
      .useEffect('effects/ripple', doc('Ripple'))
      .useEffect('effects/glow', doc('Glow'))
      .instantiate();

    expect(actor.effects().map(effect => effect.path)).toEqual([
      'effects/ripple',
      'effects/glow',
    ]);
  });

  it('carries parameter values when given', () => {
    const actor = positional('fish')
      .useEffect('effects/ripple', doc('Ripple'), {strength: 0.05})
      .instantiate();

    expect(actor.effects()[0].values).toEqual({strength: 0.05});
  });

  it('omits values entirely when none are given', () => {
    // Absent rather than `{}`: the driver fills every parameter from its own
    // default, so an empty map and no map mean the same thing — and the
    // snapshot id hashes this, so they must not look like different effects.
    const actor = positional('fish')
      .useEffect('effects/ripple', doc('Ripple'))
      .instantiate();

    expect(actor.effects()[0]).not.toHaveProperty('values');
  });

  it('gives an actor with no effects an empty list, not undefined', () => {
    expect(positional('rock').instantiate().effects()).toEqual([]);
  });

  it('does not share the list between instances of one template', () => {
    // The builder is reusable; each instance must own its own array.
    const builder = positional('fish').useEffect('effects/ripple', doc('R'));
    const first = builder.instantiate('a');
    builder.useEffect('effects/glow', doc('G'));

    expect(first.effects()).toHaveLength(1);
    expect(builder.instantiate('b').effects()).toHaveLength(2);
  });
});

describe('Actor.addEffect / removeEffect', () => {
  it('starts an effect on a live actor', () => {
    const ripple = doc('Ripple');
    const actor = positional('fish').instantiate();

    actor.addEffect('effects/ripple', ripple);

    expect(actor.effects()).toEqual([
      {path: 'effects/ripple', document: ripple},
    ]);
  });

  it('is idempotent by path', () => {
    // The case this exists for: an event that fires every frame while a
    // condition holds. Stacking would attach a new filter per frame.
    const actor = positional('fish').instantiate();

    actor.addEffect('effects/ripple', doc('Ripple'));
    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.9});

    expect(actor.effects()).toHaveLength(1);
  });

  it('keeps the first values when adding a path it already has', () => {
    // Idempotent means idempotent: the second call is not a way to retune a
    // running effect. Changing values while attached is separate work.
    const actor = positional('fish').instantiate();

    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.1});
    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.9});

    expect(actor.effects()[0].values).toEqual({strength: 0.1});
  });

  it('stops an effect', () => {
    const actor = positional('fish').instantiate();
    actor.addEffect('effects/ripple', doc('Ripple'));

    actor.removeEffect('effects/ripple');

    expect(actor.effects()).toEqual([]);
  });

  it('ignores removing an effect the actor does not have', () => {
    const actor = positional('fish')
      .useEffect('effects/ripple', doc('Ripple'))
      .instantiate();

    actor.removeEffect('effects/glow');

    expect(actor.effects()).toHaveLength(1);
  });

  it('can remove one the template applied', () => {
    // A template effect and a runtime one are the same list; nothing marks an
    // effect as "from the builder" and so unremovable.
    const actor = positional('fish')
      .useEffect('effects/ripple', doc('Ripple'))
      .instantiate();

    actor.removeEffect('effects/ripple');

    expect(actor.effects()).toEqual([]);
  });

  it('leaves other instances of the template alone', () => {
    const builder = positional('fish').useEffect('effects/ripple', doc('R'));
    const first = builder.instantiate('a');
    const second = builder.instantiate('b');

    first.removeEffect('effects/ripple');

    expect(first.effects()).toEqual([]);
    expect(second.effects()).toHaveLength(1);
  });
});

describe('renderSnapshot', () => {
  it('hands each actor its effects, for the driver to compile', () => {
    const ripple = doc('Ripple');
    const world = worldWith(
      positional('fish').useEffect('effects/ripple', ripple),
    );

    const [state] = world.renderSnapshot();

    expect(state.effects).toEqual([{path: 'effects/ripple', document: ripple}]);
  });

  it('reports an effect added after the actor was built', () => {
    // The driver re-reads this every frame, which is how a runtime add reaches
    // the screen without a restart.
    const world = worldWith(positional('fish'));
    const [state] = world.renderSnapshot();
    expect(state.effects).toEqual([]);

    state.actor.addEffect('effects/ripple', doc('Ripple'));

    expect(world.renderSnapshot()[0].effects).toHaveLength(1);
  });

  it('reports an empty list for an actor with no effects', () => {
    const world = worldWith(positional('rock'));

    expect(world.renderSnapshot()[0].effects).toEqual([]);
  });
});

describe('snapshot().effectIds', () => {
  it('is empty when nothing carries an effect', () => {
    expect(worldWith(positional('rock')).snapshot().effectIds).toEqual([]);
  });

  it('lists one id per applied effect, across every actor', () => {
    const world = worldWith(
      positional('fish').useEffect('effects/ripple', doc('Ripple')),
      positional('lamp').useEffect('effects/glow', doc('Glow')),
    );

    expect(world.snapshot().effectIds).toHaveLength(2);
  });

  it('is stable across snapshots of an unchanged world', () => {
    const world = worldWith(
      positional('fish').useEffect('effects/ripple', doc('Ripple')),
    );

    expect(world.snapshot().effectIds).toEqual(world.snapshot().effectIds);
  });

  it('changes when the effect document changes', () => {
    // This is the whole reason the id carries a hash rather than just a path:
    // editing a `.effect` is the change that has to restart the game, and it
    // leaves the path alone.
    const before = worldWith(
      positional('fish').useEffect('effects/ripple', doc('Ripple', 'sample-1')),
    ).snapshot().effectIds;
    const after = worldWith(
      positional('fish').useEffect('effects/ripple', doc('Ripple', 'sine-9')),
    ).snapshot().effectIds;

    expect(after).not.toEqual(before);
  });

  it('changes when a parameter value changes', () => {
    // Values are read once, when the filter is attached to the Game Object, so
    // turning a knob only reaches the screen on a restart — which means the
    // reconciler has to see it, which means the id has to hash it.
    const document = doc('Ripple');
    const before = worldWith(
      positional('fish').useEffect('effects/ripple', document, {
        strength: 0.02,
      }),
    ).snapshot().effectIds;
    const after = worldWith(
      positional('fish').useEffect('effects/ripple', document, {strength: 0.5}),
    ).snapshot().effectIds;

    expect(after).not.toEqual(before);
  });

  it('sorts, so actor order does not move it', () => {
    const ids = worldWith(
      positional('a').useEffect('effects/zzz', doc('Z')),
      positional('b').useEffect('effects/aaa', doc('A')),
    ).snapshot().effectIds;

    expect(ids).toEqual([...ids].sort());
  });
});

describe('effectSnapshotId', () => {
  it('is `<path>@<hash>`', () => {
    const id = effectSnapshotId({path: 'effects/ripple', document: doc('R')});

    expect(id).toMatch(/^effects\/ripple@[a-z0-9]+$/);
  });

  it('separates documents that differ only late in the text', () => {
    // A weak hash that dropped low bits would collide here; the FNV-1a shifts
    // exist for exactly this case.
    const a = effectSnapshotId({path: 'e', document: doc('Ripple', 'node-1')});
    const b = effectSnapshotId({path: 'e', document: doc('Ripple', 'node-2')});

    expect(a).not.toBe(b);
  });
});
