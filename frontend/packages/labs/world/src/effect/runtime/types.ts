import type {CompiledEffect} from '../compiler/types';
import type {EffectLiteral} from '../model/types';

/**
 * The Phaser namespace, taken as a value rather than imported.
 *
 * Phaser is an optional peer dependency: the editor, the compiler, and the
 * WebGL preview all work without it, and the World lab loads its own vendored
 * build. Accepting the namespace keeps this package from pinning a second copy
 * of the engine into the bundle.
 */
export type PhaserNamespace = typeof import('phaser');

/**
 * Values supplied for an effect's parameters, keyed by `EffectParameter.id`.
 *
 * A switch parameter accepts a boolean as well as 1/0, since `{glow: true}` is
 * what a game would naturally write.
 */
export type EffectParameterValues = Readonly<
  Record<string, EffectLiteral | boolean>
>;

/** A compiled effect registered with a renderer and ready to apply. */
export interface RegisteredEffect {
  /** Name of the render node registered with the renderer. */
  renderNodeName: string;
  compiled: CompiledEffect;
}

/** What `applyEffect` hands back so the caller can update or remove it. */
export interface AppliedEffect {
  /** The Phaser filter controller driving this effect. */
  controller: EffectFilterController;
  /** Replace the parameter values in place. */
  setValues: (values: EffectParameterValues) => void;
  /** Restart the effect's own clock, replaying a one-shot animation. */
  restart: () => void;
  /** Remove the effect from whatever it was applied to. */
  remove: () => void;
}

/**
 * The controller interface the render node reads from.
 *
 * Declared structurally rather than as a class type because the class itself
 * is built at runtime against the caller's Phaser namespace.
 */
export interface EffectFilterController {
  active: boolean;
  effect: RegisteredEffect;
  /** Parameter values by uniform name, ready to hand to `setUniform`. */
  uniformValues: Map<string, number | number[]>;
  /** Scene clock reading when this effect was applied, in milliseconds. */
  startedAt: number;
}
