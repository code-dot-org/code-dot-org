import {describe, expect, it} from 'vitest';

import type {EffectDocument} from '../../../effect/model/types';
import {
  ActorBuilder,
  AffectedByGravityTrait,
  GravityRule,
  GroundTrait,
  PositionProperty,
  StrengthProperty,
  Vector,
  WorldBuilder,
  type World,
} from '../../../engine';
import {reconcile} from '../reconcile';

// Build a world like the demo: a gravity world with a player and a ground.
// `strength` overrides the gravity rule's world-scoped property.
function makeWorld(strength = 900, playerY = 20): World {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule])
    .set(StrengthProperty, strength)
    .instantiate();
  world.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, new Vector(200, playerY))
      .instantiate(),
  );
  world.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(200, 260))
      .instantiate(),
  );
  return world;
}

/** A minimal `.effect` document; `nodeId` is the knob a test turns to differ. */
const effectDoc = (nodeId: string): EffectDocument => ({
  version: 1,
  name: 'Ripple',
  parameters: [],
  nodes: [{id: nodeId, type: 'sample', position: {x: 0, y: 0}}],
  edges: [],
  functions: [],
});

/**
 * `makeWorld`, with the player wearing an effect and nothing else changed.
 *
 * Structurally identical on purpose — same rules, same two actors, same values
 * — so a test comparing it against `makeWorld` isolates the effect. Differ in
 * anything else and the reconciler restarts for that instead, and the test
 * passes while proving nothing.
 */
function makeWorldWithEffect(document: EffectDocument, strength = 900): World {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule])
    .set(StrengthProperty, strength)
    .instantiate();
  world.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, new Vector(200, 20))
      .useEffect('effects/ripple', document)
      .instantiate(),
  );
  world.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(200, 260))
      .instantiate(),
  );
  return world;
}

describe('reconcile', () => {
  it('reports "built" on the first load', () => {
    const world = makeWorld();
    const {mode, snapshot} = reconcile(world, world, null);
    expect(mode).toBe('built');
    expect(snapshot.world['gravity.strength']).toBe(900);
  });

  it('reconciles a world-only change live, patching the running world', () => {
    const running = makeWorld(900);
    const baseline = running.snapshot();
    // Simulate the sim advancing the running world (a mutated position).
    running.tick(0.1);

    // A rebuild that changes only gravity strength (900 -> 1500).
    const incoming = makeWorld(1500);
    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    // The running world was patched in place — no restart needed.
    expect(running.snapshot().world['gravity.strength']).toBe(1500);
  });

  it('restarts when an actor value changed', () => {
    const running = makeWorld(900, 20);
    const baseline = running.snapshot();
    const incoming = makeWorld(900, 50); // player start moved
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });

  it('restarts when structure changed (an actor added)', () => {
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    incoming.addActor(
      new ActorBuilder({id: 'extra', name: 'Extra'})
        .useTraits([GroundTrait])
        .instantiate(),
    );
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });

  it('restarts when nothing changed (a pure code-body edit is not patchable)', () => {
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });

  it('restarts when an effect changed ALONGSIDE a world property', () => {
    // The case `effectIds` exists for, and the only one where it decides
    // anything. A shader is compiled when its actor's Game Object is created,
    // so an edited `.effect` reaches the screen only on a restart — but a
    // changed world property is precisely the condition for patching live
    // instead. Without effects in the snapshot this rebuild looks like "only
    // gravity moved", the game keeps running, and the new shader never loads.
    //
    // An effect-only edit restarts either way, through the fallthrough below
    // ("nothing changed is not patchable"), so it does not discriminate.
    const running = makeWorldWithEffect(effectDoc('sample-1'), 900);
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sine-9'), 1500);
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });

  it('restarts on an effect-only edit too', () => {
    const running = makeWorldWithEffect(effectDoc('sample-1'));
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sine-9'));
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });

  it('still applies a world-property change live when the effect is untouched', () => {
    // The other half: carrying effects in the snapshot must not cost the live
    // reconcile. Same effect, changed gravity — patch it, do not restart.
    const document = effectDoc('sample-1');
    const running = makeWorldWithEffect(document, 900);
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(document, 1500);
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('reconciled');
    expect(running.snapshot().world['gravity.strength']).toBe(1500);
  });

  it('restarts when an effect is added to an actor that had none', () => {
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sample-1'), 900);
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });
});
