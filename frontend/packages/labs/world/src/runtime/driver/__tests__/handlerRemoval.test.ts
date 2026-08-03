// A `when` block that was deleted must stop firing.
//
// The reconciler patches the RUNNING world when it judges a rebuild
// non-structural, and the running world's actors hold the handler functions the
// previous build copied into them (`ActorBuilder.instantiate`). So if a handler
// is invisible to the snapshot, deleting its block reconciles to "applied the
// changes live" — and the handler keeps running, from a block that is no longer
// on the screen. Same for editing one: the old body would go on running.

import {describe, expect, it, vi} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
  type World,
} from '../../../engine';
import {
  AffectedByGravityTrait,
  GravityRule,
  StartsFallingEvent,
  StrengthProperty,
} from '../../../engine/__tests__/fixtures/gravityRule';
import {reconcile} from '../reconcile';

/**
 * A world with a falling player, optionally with a `when starts falling`
 * handler on it — the two builds either side of deleting that block.
 *
 * `strength` differs between the builds in the tests below on purpose: that is
 * what makes this the case that bites. A rebuild with NOTHING patchable in it
 * restarts anyway, so removing a handler alone was already safe by accident;
 * the bug needs one patchable change alongside it, which is as ordinary as
 * nudging gravity in the same sitting.
 */
function build(handler: (() => void) | undefined, strength = 900): World {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule])
    .set(StrengthProperty, strength)
    .instantiate();
  const player = new ActorBuilder({id: 'player', name: 'Player'})
    .useTraits([AffectedByGravityTrait])
    .set(PositionProperty, new Vector(200, 20));
  if (handler) {
    player.on(StartsFallingEvent, handler);
  }
  world.addActor(player.instantiate());
  return world;
}

/** Run far enough for the fall to start and the event to flush. */
const run = (world: World) => {
  for (let tick = 0; tick < 4; tick++) {
    world.tick(1 / 60);
  }
};

describe('deleting a handler', () => {
  it('restarts rather than patching, so the handler stops', () => {
    const fired = vi.fn();
    const running = build(fired);
    const baseline = running.snapshot();

    // The rebuild: the `when` block deleted, gravity nudged.
    const incoming = build(undefined, 1200);
    const {mode} = reconcile(running, incoming, baseline);

    expect(mode).toBe('restarted');
    // The caller drops the running world for `incoming` on a restart, and that
    // one has no handler at all.
    run(incoming);
    expect(fired).not.toHaveBeenCalled();
  });

  it('restarts when a handler is rewritten, so the old body stops', () => {
    // Same block, different code inside it — a closure the running actor
    // already holds, and no patch reaches inside one.
    const before = vi.fn();
    const running = build(() => before());
    const baseline = running.snapshot();

    const after = vi.fn();
    const incoming = build(() => after(), 1200);

    expect(reconcile(running, incoming, baseline).mode).toBe('restarted');
    run(incoming);
    expect(before).not.toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
  });

  it('still patches when the handlers are untouched', () => {
    // The guard has to be narrow: an unchanged handler must not cost a learner
    // the live reload they came for. Two builds of the same source produce
    // handlers with the same body, which is what the hash compares.
    const running = build(() => undefined);
    const baseline = running.snapshot();

    const incoming = build(() => undefined, 1200);

    expect(reconcile(running, incoming, baseline).mode).toBe('reconciled');
    expect(running.get(StrengthProperty)).toBe(1200);
  });
});
