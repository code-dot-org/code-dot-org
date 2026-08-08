// The stock effect library: `.effect` documents the lab ships, ready to be
// copied into a project.
//
// Effect-domain DATA, not a layer. It imports `model` and nothing else, so the
// lab's default project (src/constants.ts) and — later — the import dialog can
// both read it without reaching into the editor or the compiler.
//
// Every one of these is written to be READ, not just run. A learner meeting
// their first shader opens one of these and has to be able to follow it, so
// each carries:
//
//   - a `description`, the one line an import dialog shows beside its name;
//   - a Comment node explaining what the effect is for and the idea behind it;
//   - a `note` on every working node saying what that step does and why.
//
// Those notes are not decoration. The compiler carries them into the generated
// GLSL as line comments above each node's own statements, so the shader a
// learner eventually reads is annotated in the same words as the graph.
//
// They are ordered by how much they ask of the reader, and they build on each
// other deliberately: Tint introduces sampling and multiplying a color; Fade
// introduces taking a color apart; Grayscale introduces mixing; Pulse
// introduces the clock; Pixelate introduces changing *where* the picture is
// read; Ripple uses all of it at once; Radial Ripple turns Ripple a quarter
// turn, driving the same wave from distance-to-a-point rather than one axis.
// Anything added here should say where it belongs in that progression.

import type {EffectDocument} from '../model/types';

import {fadeEffect} from './fade';
import {grayscaleEffect} from './grayscale';
import {pixelateEffect} from './pixelate';
import {pulseEffect} from './pulse';
import {radialRippleEffect} from './radialRipple';
import {rippleEffect} from './ripple';
import {tintEffect} from './tint';

export {
  fadeEffect,
  grayscaleEffect,
  pixelateEffect,
  pulseEffect,
  radialRippleEffect,
  rippleEffect,
  tintEffect,
};

/** One entry in the library. */
export interface StockEffect {
  /**
   * File stem this is imported as — `ripple` becomes `effects/ripple.effect`.
   *
   * Separate from the document's `name` because that is learner-facing text
   * they may rename ("Ripple" → "Underwater Wobble"), while this has to stay a
   * safe file name.
   */
  id: string;
  document: EffectDocument;
}

/**
 * The library, simplest first.
 *
 * Order is meaningful: it is the order an import dialog should list them in,
 * and the order they teach in.
 */
export const STOCK_EFFECTS: readonly StockEffect[] = [
  {id: 'tint', document: tintEffect},
  {id: 'fade', document: fadeEffect},
  {id: 'grayscale', document: grayscaleEffect},
  {id: 'pulse', document: pulseEffect},
  {id: 'pixelate', document: pixelateEffect},
  {id: 'ripple', document: rippleEffect},
  {id: 'radial-ripple', document: radialRippleEffect},
];

/** Look one up by its file stem. */
export function stockEffect(id: string): StockEffect | undefined {
  return STOCK_EFFECTS.find(effect => effect.id === id);
}
