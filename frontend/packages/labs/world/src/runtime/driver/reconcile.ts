// Hot-reload strategy for the preview (PLAN §9). On a rebuild the driver builds
// the new world, then reconciles it against the previous build's snapshot:
//
//   - only world-scoped property values changed (same rules, actors, and actor
//     values) → patch the RUNNING world in place and keep the game going
//     ("reconciled" — Level 1, e.g. change gravity strength and see it live);
//   - anything structural (rules/actors) or any actor value changed → the caller
//     restarts the game ("restarted" — Level 0).
//
// This is pure logic over the engine's public `snapshot()` / `setWorldProperty()`
// — no Phaser, no engine internals — so it unit-tests headlessly and never holds
// a second engine instance.

import type {ReloadMode} from '../messages';

// The subset of the world-lab `World` this module needs. Structural typing keeps
// it decoupled from the engine instance the learner's module created.
interface ReconcilableWorld {
  snapshot(): {
    ruleIds: string[];
    actorIds: string[];
    world: Record<string, unknown>;
    actors: Record<string, Record<string, unknown>>;
  };
  setWorldProperty(path: string, value: unknown): boolean;
}

type Snapshot = ReturnType<ReconcilableWorld['snapshot']>;

const stable = (value: unknown) => JSON.stringify(value);

/**
 * Decide how to apply `incoming` given the `previous` build's snapshot, patching
 * `running` in place when a live reconcile is possible.
 *
 * @param running  the world currently driving the game (patched on reconcile)
 * @param incoming the freshly built world
 * @param previous the snapshot of the last build, or null on the first load
 * @returns the chosen mode and the new snapshot to store as the next baseline
 */
export function reconcile(
  running: ReconcilableWorld,
  incoming: ReconcilableWorld,
  previous: Snapshot | null,
): {mode: ReloadMode; snapshot: Snapshot} {
  const snapshot = incoming.snapshot();
  if (!previous) {
    return {mode: 'built', snapshot};
  }

  const sameStructure =
    stable(previous.ruleIds) === stable(snapshot.ruleIds) &&
    stable(previous.actorIds) === stable(snapshot.actorIds);
  const sameActors = stable(previous.actors) === stable(snapshot.actors);
  const worldChanged = stable(previous.world) !== stable(snapshot.world);

  if (sameStructure && sameActors && worldChanged) {
    // Level 1: apply the changed world-scoped values to the live world.
    for (const [path, value] of Object.entries(snapshot.world)) {
      running.setWorldProperty(path, value);
    }
    return {mode: 'reconciled', snapshot};
  }

  // Structural / actor change (or a pure code-body edit we can't safely patch):
  // the caller restarts with `incoming`.
  return {mode: 'restarted', snapshot};
}
