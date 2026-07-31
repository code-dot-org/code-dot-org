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
import {applyEffectToActor, registerEffect} from '../../effect/runtime';
import type {
  PhaserNamespace,
  RegisteredEffect,
} from '../../effect/runtime/types';

/**
 * A Game Object that can carry filters. Every drawn actor qualifies —
 * `Components.Filters` is mixed into Phaser's base `GameObject`, so the
 * textured Image and the fallback Rectangle both have it.
 */
type FilterableGameObject = Parameters<typeof applyEffectToActor>[1];

/** How a failure is reported to whoever is showing the learner messages. */
export type EffectErrorReporter = (message: string) => void;

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
   * Paths whose graph would not compile.
   *
   * Remembered so the message is reported once. Without this a broken effect on
   * an actor would recompile and re-report on every Game Object creation, and
   * the console would fill with the same sentence.
   */
  private readonly failed = new Set<string>();
  private readonly phaser: PhaserNamespace;
  private readonly onError: EffectErrorReporter;

  constructor(phaser: PhaserNamespace, onError: EffectErrorReporter) {
    this.phaser = phaser;
    this.onError = onError;
  }

  /**
   * Play every effect an actor carries on its Game Object.
   *
   * Called once per object, at creation. An effect that will not compile is
   * reported and skipped — the actor still draws, without it. Refusing to draw
   * the actor at all would turn one bad graph into a missing character, which
   * is a worse thing for a learner to debug than a missing wobble.
   */
  applyTo(
    scene: Phaser.Scene,
    object: FilterableGameObject,
    effects: readonly AppliedEffectSpec[],
  ): void {
    for (const effect of effects) {
      const registered = this.resolve(scene, effect);
      if (!registered) {
        continue;
      }
      try {
        // Values are the learner's knob settings from the `use effect` block;
        // `buildUniformValues` fills in each parameter's own default for
        // anything absent, so a partial map is fine.
        applyEffectToActor(this.phaser, object, registered, effect.values);
      } catch (error) {
        this.report(effect.path, error);
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
      return existing;
    }
    if (this.failed.has(effect.path)) {
      return undefined;
    }

    let compiled: CompiledEffect;
    try {
      compiled = compileEffect(effect.document);
    } catch (error) {
      this.report(effect.path, error);
      return undefined;
    }

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
      this.report(effect.path, error);
      return undefined;
    }
  }

  private report(path: string, error: unknown): void {
    this.failed.add(path);
    const detail = error instanceof Error ? error.message : String(error);
    // Name the file. The compiler's messages are about a graph ("Nothing is
    // connected to the Output yet."), and the learner has to be told which
    // graph before that sentence means anything.
    this.onError(`${path}.effect: ${detail}`);
  }
}
