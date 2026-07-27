import {describe, expect, it} from 'vitest';

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
});
