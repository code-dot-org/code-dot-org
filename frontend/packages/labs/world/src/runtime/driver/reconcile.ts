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
    /** Identity per applied effect — see engine/core/effectIds.ts. */
    effectIds: string[];
    /** The graph behind each effect in play, hashed, by module path. */
    effectDocs: Record<string, string>;
    world: Record<string, unknown>;
    actors: Record<string, Record<string, unknown>>;
  };
  setWorldProperty(path: string, value: unknown): boolean;
  setEffectDocument(path: string, document: unknown): boolean;
  /**
   * Every effect in play — the world's own AND every actor's — so a patch can
   * lift the new graph off the rebuild wherever the edited effect is used.
   */
  allEffects(): ReadonlyArray<{path: string; document: unknown}>;
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

  // Which effects are in play, and with what knob settings, counts as
  // structure: the driver reads values once, when it attaches a filter. The
  // GRAPH behind an effect does not — it can be swapped underneath a running
  // filter, and is handled below.
  const sameStructure =
    stable(previous.ruleIds) === stable(snapshot.ruleIds) &&
    stable(previous.actorIds) === stable(snapshot.actorIds) &&
    stable(previous.effectIds) === stable(snapshot.effectIds);
  const sameActors = stable(previous.actors) === stable(snapshot.actors);
  const worldChanged = stable(previous.world) !== stable(snapshot.world);

  // Effects whose graph was edited: same effect, new shader.
  const editedEffects = Object.keys(snapshot.effectDocs).filter(
    path => previous.effectDocs[path] !== snapshot.effectDocs[path],
  );

  // An edited graph patches even when `sameActors` is false, and that exception
  // is deliberate. `sameActors` compares the previous build's PRE-TICK snapshot
  // against the incoming one, but the incoming world is not always freshly
  // built — an unchanged bundle re-imports to the same module instance, whose
  // world has been ticking — so for any game where something moves the two
  // disagree about positions and the flag reads false on almost every rebuild.
  //
  // Gating a shader swap on it would mean the swap never happens, which is the
  // whole feature. And the gate is not meaningful here regardless: replacing a
  // fragment program has nothing to do with where the actors are.
  //
  // The cost is narrow and recoverable. Edit a `.effect` AND an actor's start
  // position in one rebuild and the position change waits for the next restart.
  // (That `sameActors` is unreliable at all is a pre-existing problem worth
  // chasing on its own; it is the same flag the live world-property patch
  // depends on.)
  if (sameStructure && (editedEffects.length || (sameActors && worldChanged))) {
    // Level 1: patch the running world rather than replacing it.
    for (const [path, value] of Object.entries(snapshot.world)) {
      running.setWorldProperty(path, value);
    }
    // Lift each edited graph off the freshly built world and write it into the
    // running one. The driver re-reads these specs every frame, so it sees the
    // new document and swaps the shader on the node the filters already use —
    // no restart, and the game keeps its state.
    if (editedEffects.length) {
      const rebuilt = new Map(
        incoming.allEffects().map(effect => [effect.path, effect.document]),
      );
      for (const path of editedEffects) {
        const document = rebuilt.get(path);
        if (document !== undefined) {
          running.setEffectDocument(path, document);
        }
      }
    }
    return {mode: 'reconciled', snapshot};
  }

  // Structural / actor change (or a pure code-body edit we can't safely patch):
  // the caller restarts with `incoming`.
  return {mode: 'restarted', snapshot};
}
