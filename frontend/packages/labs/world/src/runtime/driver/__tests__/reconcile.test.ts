import {describe, expect, it} from 'vitest';

import type {EffectDocument} from '../../../effect/model/types';
import {
  ActorBuilder,
  PositionProperty,
  rgba,
  Vector,
  WorldBuilder,
  type World,
} from '../../../engine';
// Gravity is a `.rule` now; the engine's test fixture is what these worlds run.
import {
  AffectedByGravityTrait,
  GravityRule,
  GroundTrait,
  StrengthProperty,
} from '../../../engine/__tests__/fixtures/gravityRule';
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
function makeWorldWithEffect(
  document: EffectDocument,
  strength = 900,
  values?: Record<string, number>,
): World {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule])
    .set(StrengthProperty, strength)
    .instantiate();
  world.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, new Vector(200, 20))
      .addEffect('effects/ripple', document, values)
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

  it('patches an edited graph into the running game instead of restarting', () => {
    // The live shader swap. A graph can be replaced underneath a filter that is
    // already drawing, so editing a `.effect` must NOT reboot the game and
    // throw away the player's position — it patches, and the driver swaps the
    // shader on its next frame.
    const running = makeWorldWithEffect(effectDoc('sample-1'));
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sine-9'));

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
  });

  it('writes the new graph onto the RUNNING world, not just the rebuild', () => {
    // Patching is only real if the world the driver reads each frame carries
    // the new document; the freshly built world is discarded.
    const running = makeWorldWithEffect(effectDoc('sample-1'));
    const baseline = running.snapshot();
    const edited = effectDoc('sine-9');

    reconcile(running, makeWorldWithEffect(edited), baseline);

    expect(running.allEffects()[0].document).toEqual(edited);
  });

  it('patches an edited graph alongside a changed world property', () => {
    const running = makeWorldWithEffect(effectDoc('sample-1'), 900);
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sine-9'), 1500);

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    expect(running.snapshot().world['gravity.strength']).toBe(1500);
  });

  it('patches an edited graph even when the actors have moved on', () => {
    // `sameActors` compares the previous build's pre-tick snapshot with the
    // incoming one, and the incoming world is not always freshly built — so for
    // a game where anything moves the flag reads false on almost every rebuild.
    // Gating the shader swap on it would mean the swap never happened.
    const running = makeWorldWithEffect(effectDoc('sample-1'));
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sine-9'));
    // The rebuild reports a player who has since fallen.
    for (const actor of incoming.actors) {
      actor.set(PositionProperty, new Vector(200, 400));
    }

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
  });

  it('still restarts when the knob settings change', () => {
    // Values are read once, when the driver attaches the filter, so retuning
    // is structural in a way that editing the graph is not.
    const document = effectDoc('sample-1');
    const running = makeWorldWithEffect(document, 900, {strength: 0.1});
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(document, 900, {strength: 0.9});

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
  });

  it('restarts when an effect is added to an actor that had none', () => {
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(effectDoc('sample-1'), 900);
    const {mode} = reconcile(running, incoming, baseline);
    expect(mode).toBe('restarted');
  });

  it('changes the sky on the running game rather than restarting it', () => {
    // A background is a value, like a world property. Restarting for it would
    // throw away the game state a learner is looking at while they pick one.
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    incoming.setBackground('cave.png');
    incoming.setBackgroundColor('#88ccff');

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    // And it actually landed: without the patch this reconciles to a running
    // world that still has the old sky, and the change is silently lost.
    expect(running.backdropSnapshot()[0]).toMatchObject({
      sprite: 'cave.png',
      color: rgba('#88ccff'),
    });
  });

  it('restarts when the backdrop gains an effect', () => {
    // Which effects are in play is structure, on a backdrop as on an actor.
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    incoming.addBackgroundEffect('effects/ripple', effectDoc('sample-1'));

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
  });
});
