import {describe, expect, it} from 'vitest';

import type {EffectDocument} from '../../../effect/model/types';
import {
  ActorBuilder,
  PositionProperty,
  rgba,
  Vector,
  WorldBuilder,
  type Trait,
  type World,
} from '../../../engine';
// Gravity and Collisions are `.rule` files now; the engine's test fixtures are
// what these worlds run.
import {SolidTrait} from '../../../engine/__tests__/fixtures/collisionRule';
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

/**
 * The same world with the ground's traits spelled out — what a `use trait` row
 * added or removed under `define actor` generates.
 *
 * Built rather than mutated, because that is what the preview does: a rebuild
 * imports a new module and makes a whole new world from it, and the reconciler
 * compares that against the last build's snapshot.
 */
function makeGroundWorld(traits: Trait[]): World {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule])
    .instantiate();
  world.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, new Vector(200, 20))
      .instantiate(),
  );
  world.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits(traits)
      .set(PositionProperty, new Vector(200, 260))
      .instantiate(),
  );
  return world;
}

/** A world's snapshot as the reconciler compares it — by stringifying. */
const stableSnapshot = (world: World): string =>
  JSON.stringify(world.snapshot());

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

  it('patches an actor value the learner changed', () => {
    // A start position nudged on the `.actor` file reaches the game that is
    // running, rather than restarting it (specs/QUALITY_OF_LIFE.md §1).
    const running = makeWorld(900, 20);
    const baseline = running.snapshot();
    const incoming = makeWorld(900, 50); // player start moved

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    expect(running.snapshot().actors.player['positional.position']).toEqual(
      new Vector(200, 50),
    );
  });

  it('leaves alone the actors the learner did not touch', () => {
    // The whole point of patching the DIFFERENCE: everything is falling, and
    // writing the incoming snapshot back wholesale would put every actor at its
    // authored position — the reset this is meant to avoid.
    const running = makeWorld(900, 20);
    const baseline = running.snapshot();
    running.tick(0.2); // the player and the ground move on
    const movedTo = running.snapshot().actors.player['positional.position'];

    // A rebuild whose only edit is to the GROUND's position.
    const incoming = makeWorld(900, 20);
    for (const actor of incoming.actors) {
      if (actor.id === 'ground') {
        actor.set(PositionProperty, new Vector(200, 300));
      }
    }

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    expect(running.snapshot().actors.ground['positional.position']).toEqual(
      new Vector(200, 300),
    );
    // …and the player is still where the simulation had carried it.
    expect(running.snapshot().actors.player['positional.position']).toEqual(
      movedTo,
    );
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

  it('retunes the running game when the knob settings change', () => {
    // A filter that is attached can be retuned in place, and the driver pushes
    // the new values onto it every frame — so nudging a number is a patch, not
    // a restart (specs/QUALITY_OF_LIFE.md §1).
    const document = effectDoc('sample-1');
    const running = makeWorldWithEffect(document, 900, {strength: 0.1});
    const baseline = running.snapshot();
    const incoming = makeWorldWithEffect(document, 900, {strength: 0.9});

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    // And it landed: without the patch this reconciles to a running game whose
    // filter still has the old number.
    expect(Object.values(running.snapshot().effectValues)).toEqual([
      {strength: 0.9},
    ]);
  });

  it('retunes only the slot that changed', () => {
    // The same effect on two actors has two sets of knobs; turning one must not
    // reach the other.
    const document = effectDoc('sample-1');
    const running = makeWorld(900);
    for (const [index, actor] of [...running.actors].entries()) {
      actor.addEffect('effects/ripple', document, {strength: index / 10});
    }
    const baseline = running.snapshot();

    const incoming = makeWorld(900);
    for (const [index, actor] of [...incoming.actors].entries()) {
      actor.addEffect('effects/ripple', document, {
        strength: index === 0 ? 0.7 : index / 10,
      });
    }

    expect(reconcile(running, incoming, baseline).mode).toBe('reconciled');
    expect(Object.values(running.snapshot().effectValues)).toEqual([
      {strength: 0.7},
      {strength: 0.1},
    ]);
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
    expect(running.backdropSnapshot()[0]).toMatchObject({sprite: 'cave.png'});
    expect(running.backdropColor()).toEqual(rgba('#88ccff'));
  });

  it('restarts when the backdrop gains an effect', () => {
    // Which effects are in play is structure, on a backdrop as on an actor.
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    incoming.addBackgroundEffect('effects/ripple', effectDoc('sample-1'));

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
  });

  it('restarts when an actor takes a trait it did not have', () => {
    // A `use trait` row added to an actor already in the world. Nothing else in
    // the snapshot says so: the trait's own property SLOTS arrive looking like
    // edited values, and `setActorProperty` then finds no slot for those paths
    // and silently returns false. Patching here left the running ground with
    // neither `collidable` nor `ground` — a platformer whose player falls
    // through the floor until some later edit happens to force a restart.
    const running = makeGroundWorld([]);
    const baseline = running.snapshot();
    const incoming = makeGroundWorld([GroundTrait, SolidTrait]);

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
  });

  it('restarts when the trait added declares nothing of its own', () => {
    // The other half, and the one that only ever worked by accident: `Solid`
    // brings no property the ground did not already have through `Can Collide`,
    // so the two snapshots were identical and the reconciler restarted because
    // it had found nothing to patch rather than because it had noticed.
    const running = makeGroundWorld([GroundTrait]);
    const baseline = running.snapshot();
    const incoming = makeGroundWorld([GroundTrait, SolidTrait]);

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
  });
  it('changes the track on the running game rather than restarting it', () => {
    // Music is a value, like the sky. Restarting for it would throw away the
    // game a learner is listening to while they pick one (specs/SOUND.md).
    const running = makeWorld(900);
    running.setMusic('theme');
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    incoming.setMusic('boss');

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    // And it landed: without the patch this reconciles to a running world still
    // playing the old track, and the change is silently lost — the failure the
    // backdrop patch was written for, one channel over.
    expect(running.music()).toBe('boss');
  });

  it('stops the music on the running game', () => {
    // Silence is a value too, and it is the one an absent key spells — so this
    // is the case a `!==` on two `undefined`s would get right by accident and a
    // truthiness check would get wrong.
    const running = makeWorld(900);
    running.setMusic('theme');
    const baseline = running.snapshot();
    const incoming = makeWorld(900);

    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('reconciled');
    expect(running.music()).toBeUndefined();
  });

  it('does not restart for a sound that was played', () => {
    // The other half of the split, from this side. A one-shot is not in the
    // snapshot, so a rebuild whose only difference is that something went pop
    // has nothing to compare — and a queue that had leaked into the baseline
    // would both restart the game and play the pop again.
    const running = makeWorld(900);
    const baseline = running.snapshot();
    const incoming = makeWorld(900);
    incoming.playSound('pop');

    expect(stableSnapshot(incoming)).toBe(stableSnapshot(running));
    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
  });
});
