// Turning a learner's `.effect` graphs into running Phaser filters.
//
// This is the join between the two halves of the effect system: the engine
// carries an `AppliedEffectSpec` (a module path and the parsed document) out
// through `renderSnapshot` without looking inside it, and here the graph is
// compiled to GLSL and registered with the renderer as a filter render node.
//
// It is the *only* place in the driver that reaches into `src/effect`, and it
// reaches for two layers and no more — `compiler` and `runtime`. Neither pulls
// in React Flow, which is what keeps the editor out of the preview bundle (see
// src/effect/AGENTS.md). Importing the editor here would work and would quietly
// double the bundle the game boots from.
//
// Phaser arrives as an argument rather than an import for the same reason the
// effect runtime takes it that way: the preview surface loads its own vendored
// build, and there must be exactly one copy.

import type {AppliedEffectSpec} from 'world-lab';

import {compileEffect} from '../../effect/compiler';
import type {CompiledEffect} from '../../effect/compiler/types';
import {
  applyEffectToActor,
  applyEffectToWorld,
  buildUniformValues,
  registerEffect,
  updateEffect,
} from '../../effect/runtime';
import type {
  AppliedEffect,
  PhaserNamespace,
  RegisteredEffect,
} from '../../effect/runtime/types';
import {effectSnapshotId} from '../../engine/core/effectIds';

/**
 * A Game Object that can carry filters. Every drawn actor qualifies —
 * `Components.Filters` is mixed into Phaser's base `GameObject`, so the
 * textured Image and the fallback Rectangle both have it.
 */
type FilterableGameObject = Parameters<typeof applyEffectToActor>[1];

/** How a failure is reported to whoever is showing the learner messages. */
export type EffectErrorReporter = (message: string) => void;

/**
 * One attached effect, and the knob settings it currently carries.
 *
 * The settings are held as their identity hash rather than the map itself, so
 * the per-frame comparison is a string equality whatever the effect declares.
 */
interface LiveEffect {
  applied: AppliedEffect;
  identity: string;
}

/**
 * Per-scene registry of compiled effects.
 *
 * Keyed by the effect's module path, which is its identity: registering a
 * render node twice under one name would compile and upload the same program
 * twice, so twenty actors wearing the same ripple share one.
 *
 * A registry belongs to one scene and does not outlive it. A restart builds a
 * new Phaser game with a new renderer, and a render node registered with the
 * old one means nothing to it.
 */
export class EffectRegistry {
  private readonly compiled = new Map<string, RegisteredEffect>();
  /**
   * The document each registered effect was compiled from, by path.
   *
   * Compared by identity, not by hashing: the engine replaces the whole spec
   * when a `.effect` is edited (`World.setEffectDocument`), so a new object IS
   * the signal, and re-hashing a graph every frame for every actor would be
   * work done to learn what a pointer comparison already says.
   */
  private readonly compiledFrom = new Map<string, unknown>();
  /** Controllers attached per path, so a shader swap can refresh their uniforms. */
  private readonly controllers = new Map<string, Set<AppliedEffect>>();
  /**
   * The graph that last failed to compile, by path.
   *
   * Keyed by the DOCUMENT, not just the path, and that distinction is the
   * difference between "do not repeat yourself" and "give up". Remembering the
   * path alone silences the repeat — it is recompiled every frame for every
   * actor wearing it — but also means a learner who fixes the graph gets
   * nothing, because the effect is permanently written off. Remembering which
   * graph failed reports each broken version once and retries the moment the
   * learner changes it.
   */
  private readonly failed = new Map<string, unknown>();
  /**
   * What is currently attached to each Game Object, by effect path.
   *
   * The engine's list is the intent and this is the reality; `reconcile`
   * closes the gap each frame. Weak so a destroyed object takes its entry with
   * it — the driver never gets told an actor is gone.
   */
  private readonly attached = new WeakMap<object, Map<string, LiveEffect>>();
  private readonly phaser: PhaserNamespace;
  private readonly onError: EffectErrorReporter;

  constructor(phaser: PhaserNamespace, onError: EffectErrorReporter) {
    this.phaser = phaser;
    this.onError = onError;
  }

  /**
   * Bring a Game Object's filters in line with the effects its actor carries.
   *
   * Called every frame, because the list can change every frame: an event
   * handler may add an effect when the player is hit and remove it when the
   * hurt wears off. Attaching is not idempotent — Phaser would stack a second
   * filter — so what is already on the object is tracked and only the
   * difference is applied.
   *
   * The common case is an actor with no effects and nothing attached, which
   * costs one property read and returns.
   *
   * An effect that will not compile is reported and skipped; the actor still
   * draws, without it. Refusing to draw the actor at all would turn one bad
   * graph into a missing character, which is a worse thing for a learner to
   * debug than a missing wobble.
   */
  reconcile(
    scene: Phaser.Scene,
    object: FilterableGameObject,
    effects: readonly AppliedEffectSpec[],
  ): void {
    this.reconcileInto(scene, object, effects, (registered, values) =>
      applyEffectToActor(this.phaser, object, registered, values),
    );
  }

  /**
   * The same, for the whole viewport.
   *
   * An actor's effect filters that actor's own pixels before it is composited;
   * a world's filters everything the camera has already drawn — an underwater
   * distortion over a whole scene rather than a wobble on one fish. Identical
   * bookkeeping, a different surface, so the camera is just another key in the
   * same map.
   */
  reconcileCamera(
    scene: Phaser.Scene,
    camera: Phaser.Cameras.Scene2D.Camera,
    effects: readonly AppliedEffectSpec[],
  ): void {
    this.reconcileInto(scene, camera, effects, (registered, values) =>
      applyEffectToWorld(this.phaser, camera, registered, values),
    );
  }

  private reconcileInto(
    scene: Phaser.Scene,
    target: object,
    effects: readonly AppliedEffectSpec[],
    attach: (
      registered: RegisteredEffect,
      values: AppliedEffectSpec['values'],
    ) => AppliedEffect,
  ): void {
    const object = target;
    let live = this.attached.get(object);
    if (effects.length === 0 && !live?.size) {
      return;
    }
    // Resolved once and mutated in place. Re-reading (or rebuilding) it per
    // attach is a trap: the second effect on an actor would replace the map
    // holding the first, so the first looked unattached on the next frame and
    // was attached again — every frame, stacking filters without bound.
    if (!live) {
      live = new Map<string, LiveEffect>();
      this.attached.set(object, live);
    }

    const wanted = new Set(effects.map(effect => effect.path));

    // Gone from the actor: detach and forget.
    for (const [path, entry] of [...live]) {
      if (!wanted.has(path)) {
        entry.applied.remove();
        live.delete(path);
      }
    }

    for (const effect of effects) {
      // Resolved even when already attached: this is where an edited graph is
      // noticed and swapped onto the live shader. Skipping it for attached
      // effects — the obvious shape — means the only effects that could ever
      // be updated are the ones not currently drawing.
      const registered = this.resolve(scene, effect);
      if (!registered) {
        continue;
      }
      const existing = live.get(effect.path);
      if (existing) {
        // Attached already — but the KNOB SETTINGS may have moved since. They
        // can now change while the game runs: `add effect Tint to the world`
        // with a random color behind it produces a different color every time
        // the handler fires, and a handler that removes the effect and adds it
        // back within one frame never shows the driver an empty list, so the
        // only evidence anything happened is the values.
        //
        // This used to `continue`, on the reasoning (written into
        // `effectSnapshotId`) that "the driver reads values once, when it
        // attaches". That held when values could only change at BUILD time,
        // where a restart carries them. It stopped holding the moment a block
        // could compute them.
        const identity = effectSnapshotId(effect);
        if (existing.identity !== identity) {
          existing.applied.setValues(effect.values ?? {});
          existing.identity = identity;
        }
        continue;
      }
      try {
        // Values are the learner's knob settings from the block;
        // `buildUniformValues` fills in each parameter's own default for
        // anything absent, so a partial map is fine.
        const applied = attach(registered, effect.values);
        live.set(effect.path, {applied, identity: effectSnapshotId(effect)});
        // Remembered so a later shader swap can refresh this filter's uniforms.
        const forPath =
          this.controllers.get(effect.path) ?? new Set<AppliedEffect>();
        forPath.add(applied);
        this.controllers.set(effect.path, forPath);
      } catch (error) {
        this.report(effect.path, effect.document, error);
      }
    }
  }

  /** Compile and register an effect, or return undefined having reported why. */
  private resolve(
    scene: Phaser.Scene,
    effect: AppliedEffectSpec,
  ): RegisteredEffect | undefined {
    const existing = this.compiled.get(effect.path);
    if (existing) {
      if (this.compiledFrom.get(effect.path) !== effect.document) {
        this.swap(scene, effect, existing);
      }
      return existing;
    }
    if (this.failed.get(effect.path) === effect.document) {
      return undefined;
    }

    let compiled: CompiledEffect;
    try {
      compiled = compileEffect(effect.document);
    } catch (error) {
      this.report(effect.path, effect.document, error);
      return undefined;
    }
    this.compiledFrom.set(effect.path, effect.document);

    try {
      const registered = registerEffect(
        this.phaser,
        scene,
        effect.path,
        compiled,
      );
      this.compiled.set(effect.path, registered);
      return registered;
    } catch (error) {
      // Registration fails on a Canvas renderer, which the driver refuses at
      // boot (`assertWebGL`), so reaching here means something rarer.
      this.report(effect.path, effect.document, error);
      return undefined;
    }
  }

  /**
   * The learner edited this effect's graph: recompile and swap the shader on
   * the node the running filters already point at.
   *
   * Every filter using it keeps working — they hold the node by name — but
   * their uniform values are rebuilt, because a new graph may declare different
   * parameters and the old value map would be keyed for the old ones.
   *
   * A graph that no longer compiles is reported and the previous shader stays
   * on screen. Blanking the effect mid-edit would punish the learner for a
   * half-finished change; the editor already shows them the error.
   */
  private swap(
    scene: Phaser.Scene,
    effect: AppliedEffectSpec,
    registered: RegisteredEffect,
  ): void {
    let compiled: CompiledEffect;
    try {
      compiled = compileEffect(effect.document);
    } catch (error) {
      this.report(effect.path, effect.document, error);
      return;
    }
    this.failed.delete(effect.path);
    this.compiledFrom.set(effect.path, effect.document);

    try {
      updateEffect(scene, registered, compiled);
    } catch (error) {
      this.report(effect.path, effect.document, error);
      return;
    }
    for (const applied of this.controllers.get(effect.path) ?? []) {
      applied.controller.uniformValues = buildUniformValues(
        compiled,
        effect.values,
      );
    }
  }

  private report(path: string, document: unknown, error: unknown): void {
    this.failed.set(path, document);
    const detail = error instanceof Error ? error.message : String(error);
    // Name the file. The compiler's messages are about a graph ("Nothing is
    // connected to the Output yet."), and the learner has to be told which
    // graph before that sentence means anything.
    this.onError(`${path}.effect: ${detail}`);
  }
}
