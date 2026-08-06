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
    /** Each rule's code, hashed (`ruleIds.ts`) — a rule EDITED, not swapped. */
    ruleCode: Record<string, string>;
    actorIds: string[];
    /** The layers in stack order, each with its settings (core/Layer). */
    layers: string[];
    /** Every handler in the world, hashed with its body (`Actor.handlerIds`). */
    handlerIds: string[];
    /** Which effects are in play, and what carries each (effectIds.ts). */
    effectIds: string[];
    /** Their knob settings, by the same key — patchable, unlike the above. */
    effectValues: Record<
      string,
      Readonly<Record<string, number | boolean | number[]>> | undefined
    >;
    /** The graph behind each effect in play, hashed, by module path. */
    effectDocs: Record<string, string>;
    /**
     * What each backdrop layer draws. The colour is four floats (engine
     * color.ts); spelled out rather than imported, like everything else here.
     */
    backdrops: Array<{
      sprite?: string;
      color: [number, number, number, number];
    }>;
    world: Record<string, unknown>;
    actors: Record<string, Record<string, unknown>>;
  };
  setWorldProperty(path: string, value: unknown): boolean;
  setActorProperty(actorId: string, path: string, value: unknown): boolean;
  setBackground(sprite: string | undefined, layer?: number): unknown;
  setBackgroundColor(color: readonly number[]): unknown;
  setEffectDocument(path: string, document: unknown): boolean;
  setEffectValues(
    owner: string,
    path: string,
    values: Readonly<Record<string, number | boolean | number[]>> | undefined,
  ): boolean;
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
  //
  // Handlers and rule code count as structure for a harder reason than the
  // rest: a patch keeps the RUNNING world, and it holds the functions the
  // previous build gave it — the handlers its actors copied, the steps its
  // scheduler ordered. Delete a `when` block, patch, and the block is gone from
  // the screen while its handler still fires; edit a `.rule` and the old step
  // goes on running. The reload even says it applied the change live. Nothing
  // is patchable about a closure, so any difference here restarts.
  const sameStructure =
    stable(previous.ruleIds) === stable(snapshot.ruleIds) &&
    stable(previous.ruleCode) === stable(snapshot.ruleCode) &&
    stable(previous.actorIds) === stable(snapshot.actorIds) &&
    // Layers are the scene graph the driver built, so any difference — one
    // added, one removed, two reordered, a parallax factor retuned — is a
    // reload rather than a patch. Nothing here can be spliced into a live
    // Phaser display list, and the ORDER is part of the value for exactly that
    // reason (see WorldSnapshot.layers).
    stable(previous.layers) === stable(snapshot.layers) &&
    stable(previous.handlerIds) === stable(snapshot.handlerIds) &&
    stable(previous.effectIds) === stable(snapshot.effectIds);
  const worldChanged = stable(previous.world) !== stable(snapshot.world);
  // What the backdrops draw is a value, like a world property, and patches the
  // same way. Without this a rebuild whose only change was the background would
  // compare equal to the previous one and reconcile to a running world that
  // still has the old sky — the change silently lost. Their EFFECTS are
  // structural and live in `effectIds`.
  const backdropChanged =
    stable(previous.backdrops) !== stable(snapshot.backdrops);

  // Actor values the LEARNER changed — not values that have merely moved.
  //
  // Both snapshots are authored: the previous one was taken when its build
  // landed, and the incoming world is freshly built (an unchanged bundle
  // re-imports to the same module and the caller returns before reaching here).
  // So their difference is exactly what was edited, and patching it leaves a
  // falling actor falling instead of putting it back where it started.
  const actorEdits: Array<[string, string, unknown]> = [];
  for (const [actorId, values] of Object.entries(snapshot.actors)) {
    const before = previous.actors[actorId];
    if (!before) {
      continue; // a new actor: structural, handled above
    }
    for (const [path, value] of Object.entries(values)) {
      if (stable(before[path]) !== stable(value)) {
        actorEdits.push([actorId, path, value]);
      }
    }
  }

  // Effects whose graph was edited: same effect, new shader.
  const editedEffects = Object.keys(snapshot.effectDocs).filter(
    path => previous.effectDocs[path] !== snapshot.effectDocs[path],
  );

  // Effects whose KNOBS were turned: same effect, same shader, new numbers.
  // Patchable for the same reason the graph is — the filter is already
  // attached, and the driver pushes new values onto it (effects.ts). A learner
  // nudging a number should see the number, not a restart.
  const retunedEffects = Object.keys(snapshot.effectValues).filter(
    slot =>
      stable(previous.effectValues[slot]) !==
      stable(snapshot.effectValues[slot]),
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
  if (
    sameStructure &&
    (editedEffects.length ||
      retunedEffects.length ||
      actorEdits.length ||
      worldChanged ||
      backdropChanged)
  ) {
    // Level 1: patch the running world rather than replacing it.
    for (const [path, value] of Object.entries(snapshot.world)) {
      running.setWorldProperty(path, value);
    }
    for (const [actorId, path, value] of actorEdits) {
      running.setActorProperty(actorId, path, value);
    }
    snapshot.backdrops.forEach((backdrop, layer) =>
      running.setBackground(backdrop.sprite, layer),
    );
    // One sky: only layer 0 carries a colour anyone can see (World.setBackgroundColor).
    if (snapshot.backdrops[0]) {
      running.setBackgroundColor(snapshot.backdrops[0].color);
    }
    // Retune each slot whose knobs moved. By slot, so the same effect on two
    // actors keeps two sets of settings.
    for (const slot of retunedEffects) {
      const [owner, path] = JSON.parse(slot) as [string, string];
      running.setEffectValues(owner, path, snapshot.effectValues[slot]);
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
