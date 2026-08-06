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
import {effectContentHash, effectSnapshotId} from '../core/effectIds';
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

describe('ActorBuilder.addEffect', () => {
  it('carries path and document onto the instantiated actor', () => {
    const ripple = doc('Ripple');
    const actor = positional('fish')
      .addEffect('effects/ripple', ripple)
      .instantiate();

    expect(actor.effects()).toEqual([
      {path: 'effects/ripple', document: ripple},
    ]);
  });

  it('keeps application order for several effects', () => {
    const actor = positional('fish')
      .addEffect('effects/ripple', doc('Ripple'))
      .addEffect('effects/glow', doc('Glow'))
      .instantiate();

    expect(actor.effects().map(effect => effect.path)).toEqual([
      'effects/ripple',
      'effects/glow',
    ]);
  });

  it('carries parameter values when given', () => {
    const actor = positional('fish')
      .addEffect('effects/ripple', doc('Ripple'), {strength: 0.05})
      .instantiate();

    expect(actor.effects()[0].values).toEqual({strength: 0.05});
  });

  it('omits values entirely when none are given', () => {
    // Absent rather than `{}`: the driver fills every parameter from its own
    // default, so an empty map and no map mean the same thing — and the
    // snapshot id hashes this, so they must not look like different effects.
    const actor = positional('fish')
      .addEffect('effects/ripple', doc('Ripple'))
      .instantiate();

    expect(actor.effects()[0]).not.toHaveProperty('values');
  });

  it('is idempotent by path, exactly as on the live actor', () => {
    // The two must agree: ONE Blockly block emits `actor.addEffect(…)` and
    // lands on the builder in a template body and on the live actor inside an
    // event handler. A difference here would be a difference the learner sees
    // only after moving a block.
    const actor = positional('fish')
      .addEffect('effects/ripple', doc('Ripple'))
      .addEffect('effects/ripple', doc('Ripple'), {strength: 0.9})
      .instantiate();

    expect(actor.effects()).toHaveLength(1);
    expect(actor.effects()[0]).not.toHaveProperty('values');
  });

  it('gives an actor with no effects an empty list, not undefined', () => {
    expect(positional('rock').instantiate().effects()).toEqual([]);
  });

  it('does not share the list between instances of one template', () => {
    // The builder is reusable; each instance must own its own array.
    const builder = positional('fish').addEffect('effects/ripple', doc('R'));
    const first = builder.instantiate('a');
    builder.addEffect('effects/glow', doc('G'));

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

  it('retunes an effect it already has, rather than ignoring the call', () => {
    // Not stacking is the point of the one-per-path rule; ignoring the new
    // values is not. `add effect Ripple` with a computed strength means a new
    // strength each time the handler runs, and keeping the first would freeze
    // it there with nothing to show why.
    const actor = positional('fish').instantiate();

    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.1});
    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.9});

    expect(actor.effects()).toHaveLength(1);
    expect(actor.effects()[0].values).toEqual({strength: 0.9});
  });

  it('keeps its place in the application order when retuned', () => {
    // Effects compose in order; retuning one should not move it past another.
    const actor = positional('fish').instantiate();
    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.1});
    actor.addEffect('effects/glow', doc('Glow'));

    actor.addEffect('effects/ripple', doc('Ripple'), {strength: 0.9});

    expect(actor.effects().map(effect => effect.path)).toEqual([
      'effects/ripple',
      'effects/glow',
    ]);
  });

  it('stops an effect', () => {
    const actor = positional('fish').instantiate();
    actor.addEffect('effects/ripple', doc('Ripple'));

    actor.removeEffect('effects/ripple');

    expect(actor.effects()).toEqual([]);
  });

  it('ignores removing an effect the actor does not have', () => {
    const actor = positional('fish')
      .addEffect('effects/ripple', doc('Ripple'))
      .instantiate();

    actor.removeEffect('effects/glow');

    expect(actor.effects()).toHaveLength(1);
  });

  it('can remove one the template applied', () => {
    // A template effect and a runtime one are the same list; nothing marks an
    // effect as "from the builder" and so unremovable.
    const actor = positional('fish')
      .addEffect('effects/ripple', doc('Ripple'))
      .instantiate();

    actor.removeEffect('effects/ripple');

    expect(actor.effects()).toEqual([]);
  });

  it('leaves other instances of the template alone', () => {
    const builder = positional('fish').addEffect('effects/ripple', doc('R'));
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
      positional('fish').addEffect('effects/ripple', ripple),
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

describe('world effects', () => {
  const worldWithEffect = (
    document = doc('Underwater'),
    values?: Record<string, number>,
  ) =>
    new WorldBuilder({id: 'w', name: 'W'})
      .useRules([SpatialRule])
      .addEffect('effects/underwater', document, values)
      .instantiate();

  it('carries an effect declared on the world', () => {
    const document = doc('Underwater');

    expect(worldWithEffect(document).effects()).toEqual([
      {path: 'effects/underwater', document},
    ]);
  });

  it('is idempotent by path, exactly as on the live world', () => {
    // `add effect … to the world` is one block that lands on the builder in a
    // `.world` file and on the live World in a handler, so the two must agree.
    //
    // They did not. The builder kept the FIRST spec at a path and the World
    // replaces it, so re-adding an effect with new values was ignored under
    // `define world` and honoured in a handler — the same two blocks meaning
    // two things. Now there is one implementation (WorldBuilder records and
    // replays), so the question can only be answered once: retuning an effect
    // retunes it, and `murk` below wins.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([SpatialRule])
      .addEffect('effects/underwater', doc('Underwater'))
      .addEffect('effects/underwater', doc('Underwater'), {murk: 0.9})
      .instantiate();

    expect(world.effects()).toHaveLength(1);
    expect(world.effects()[0].values).toEqual({murk: 0.9});
  });

  it('is empty for a world that declares none', () => {
    expect(worldWith(positional('rock')).effects()).toEqual([]);
  });

  it('carries parameter values', () => {
    expect(worldWithEffect(doc('U'), {murk: 0.4}).effects()[0].values).toEqual({
      murk: 0.4,
    });
  });

  it('can be added and removed while the game runs', () => {
    const world = worldWith(positional('rock'));

    world.addEffect('effects/underwater', doc('Underwater'));
    expect(world.effects()).toHaveLength(1);

    world.removeEffect('effects/underwater');
    expect(world.effects()).toEqual([]);
  });

  it('is idempotent by path, the way an actor effect is', () => {
    const world = worldWith(positional('rock'));

    world.addEffect('effects/underwater', doc('U'));
    world.addEffect('effects/underwater', doc('U'));

    expect(world.effects()).toHaveLength(1);
  });

  it('joins the snapshot ids', () => {
    expect(worldWithEffect().snapshot().effectIds).toHaveLength(1);
  });

  it('reports its graph in effectDocs, not in the ids', () => {
    const before = worldWithEffect(doc('U', 'sample-1')).snapshot();
    const after = worldWithEffect(doc('U', 'sine-9')).snapshot();

    // Editing the graph must NOT read as a structural change — it is patchable
    // into a running game (see reconcile).
    expect(after.effectIds).toEqual(before.effectIds);
    expect(after.effectDocs).not.toEqual(before.effectDocs);
  });

  it('sits in the same id list as the actors', () => {
    // Nothing downstream distinguishes a viewport effect from an actor's; the
    // reconciler only asks whether the set changed.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([SpatialRule])
      .addEffect('effects/underwater', doc('U'))
      .instantiate();
    world.addActor(
      positional('fish').addEffect('effects/ripple', doc('R')).instantiate('a'),
    );

    expect(world.snapshot().effectIds).toHaveLength(2);
  });
});

describe('setEffectValues', () => {
  it('retunes the slot it names, and leaves the others alone', () => {
    const document = doc('Ripple');
    const world = worldWith(
      positional('fish').addEffect('effects/ripple', document, {strength: 0.1}),
      positional('crab').addEffect('effects/ripple', document, {strength: 0.9}),
    );
    const [first] = [...world.actors];

    expect(
      world.setEffectValues(first.id, 'effects/ripple', {strength: 0.5}),
    ).toBe(true);

    expect(Object.values(world.snapshot().effectValues)).toEqual([
      {strength: 0.5},
      {strength: 0.9},
    ]);
  });

  it("retunes the world's own, and a backdrop's", () => {
    const world = worldWith();
    world.addEffect('effects/underwater', doc('Underwater'), {murk: 0.2});
    world.addBackgroundEffect('effects/ripple', doc('Ripple'), {speed: 1});

    expect(
      world.setEffectValues('world', 'effects/underwater', {murk: 0.8}),
    ).toBe(true);
    expect(
      world.setEffectValues('backdrop:main', 'effects/ripple', {speed: 4}),
    ).toBe(true);

    expect(world.effects()[0].values).toEqual({murk: 0.8});
    expect(world.backdropSnapshot()[0].effects[0].values).toEqual({speed: 4});
  });

  it('says so when there is no such slot', () => {
    // A patch is computed from a snapshot, and a snapshot can describe a world
    // that has since changed underneath it.
    const world = worldWith();

    expect(world.setEffectValues('world', 'effects/gone', {a: 1})).toBe(false);
    expect(world.setEffectValues('nobody', 'effects/ripple', {a: 1})).toBe(
      false,
    );
    expect(world.setEffectValues('backdrop:9', 'effects/ripple', {a: 1})).toBe(
      false,
    );
  });
});

describe('snapshot().effectIds', () => {
  it('is empty when nothing carries an effect', () => {
    expect(worldWith(positional('rock')).snapshot().effectIds).toEqual([]);
  });

  it('lists one id per applied effect, across every actor', () => {
    const world = worldWith(
      positional('fish').addEffect('effects/ripple', doc('Ripple')),
      positional('lamp').addEffect('effects/glow', doc('Glow')),
    );

    expect(world.snapshot().effectIds).toHaveLength(2);
  });

  it('is stable across snapshots of an unchanged world', () => {
    const world = worldWith(
      positional('fish').addEffect('effects/ripple', doc('Ripple')),
    );

    expect(world.snapshot().effectIds).toEqual(world.snapshot().effectIds);
  });

  it('does NOT change when only the graph changes', () => {
    // Identity is which effect with which knob settings. The graph lives in
    // `effectDocs` precisely so an edit to it can be swapped into a running
    // game instead of restarting one.
    const before = worldWith(
      positional('fish').addEffect('effects/ripple', doc('Ripple', 'sample-1')),
    ).snapshot();
    const after = worldWith(
      positional('fish').addEffect('effects/ripple', doc('Ripple', 'sine-9')),
    ).snapshot();

    expect(after.effectIds).toEqual(before.effectIds);
    expect(after.effectDocs).not.toEqual(before.effectDocs);
  });

  it('does NOT change when a parameter value changes', () => {
    // Knobs are not identity. A filter that is attached can be retuned in
    // place — the driver pushes new values onto it — so a value change must not
    // read as structure, or every nudge restarts the game
    // (specs/QUALITY_OF_LIFE.md §1).
    const document = doc('Ripple');
    const before = worldWith(
      positional('fish').addEffect('effects/ripple', document, {strength: 0.1}),
    ).snapshot();
    const after = worldWith(
      positional('fish').addEffect('effects/ripple', document, {strength: 0.9}),
    ).snapshot();

    expect(after.effectIds).toEqual(before.effectIds);
    // They travel beside it instead, by slot.
    expect(after.effectValues).not.toEqual(before.effectValues);
    expect(Object.values(after.effectValues)).toEqual([{strength: 0.9}]);
  });

  it('says which slot each set of knobs belongs to', () => {
    // The same effect on two actors is two sets of knobs; patching one must not
    // reach the other, so the key says what carries it.
    const world = worldWith(
      positional('fish').addEffect('effects/ripple', doc('Ripple'), {
        strength: 0.1,
      }),
      positional('crab').addEffect('effects/ripple', doc('Ripple'), {
        strength: 0.9,
      }),
    ).snapshot();

    // Two slots, one per actor, each with its own knobs — and the key says
    // which actor carries it (its id) and which effect it is.
    const slots = Object.keys(world.effectValues).map(
      key => JSON.parse(key) as [string, string],
    );
    expect(slots).toHaveLength(2);
    expect(slots.map(([, path]) => path)).toEqual([
      'effects/ripple',
      'effects/ripple',
    ]);
    expect(new Set(slots.map(([owner]) => owner)).size).toBe(2);
    expect(Object.values(world.effectValues)).toEqual([
      {strength: 0.1},
      {strength: 0.9},
    ]);
  });

  it('sorts, so actor order does not move it', () => {
    const ids = worldWith(
      positional('a').addEffect('effects/zzz', doc('Z')),
      positional('b').addEffect('effects/aaa', doc('A')),
    ).snapshot().effectIds;

    expect(ids).toEqual([...ids].sort());
  });
});

describe('effectSnapshotId', () => {
  it('is `<path>@<hash of values>`', () => {
    const id = effectSnapshotId({path: 'effects/ripple', document: doc('R')});

    expect(id).toMatch(/^effects\/ripple@[a-z0-9]+$/);
  });

  it('separates the same effect tuned differently', () => {
    const document = doc('Ripple');
    const a = effectSnapshotId({path: 'e', document, values: {s: 0.1}});
    const b = effectSnapshotId({path: 'e', document, values: {s: 0.9}});

    expect(a).not.toBe(b);
  });

  it('ignores the graph', () => {
    const a = effectSnapshotId({path: 'e', document: doc('R', 'node-1')});
    const b = effectSnapshotId({path: 'e', document: doc('R', 'node-2')});

    expect(a).toBe(b);
  });
});

describe('effectContentHash', () => {
  it('separates documents that differ only late in the text', () => {
    // A weak hash that dropped low bits would collide here; the FNV-1a shifts
    // exist for exactly this case.
    const a = effectContentHash({path: 'e', document: doc('Ripple', 'node-1')});
    const b = effectContentHash({path: 'e', document: doc('Ripple', 'node-2')});

    expect(a).not.toBe(b);
  });

  it('ignores the values, which are identity rather than content', () => {
    const document = doc('Ripple');
    const a = effectContentHash({path: 'e', document, values: {s: 0.1}});
    const b = effectContentHash({path: 'e', document, values: {s: 0.9}});

    expect(a).toBe(b);
  });
});
