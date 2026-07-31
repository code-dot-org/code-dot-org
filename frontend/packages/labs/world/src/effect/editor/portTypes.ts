import {translate} from '../localization';
import type {EffectParameterType, EffectValueType} from '../model/types';

/**
 * Wire colors by type.
 *
 * Type is the one thing a learner must be able to read at a glance — a vec2
 * will not go where a vec4 belongs, and the error only shows up at compile
 * time. Color carries that before they drag.
 *
 * Color is never the only cue: every handle also has a `title` naming its
 * type, and the node body prints the type beside each port label.
 *
 * These are the one palette in the editor NOT taken from the design system's
 * brand colors, and the reason is what they have to do. Five hues that must
 * stay mutually distinguishable is a syntax-highlighting problem; brand
 * families are chosen to sit together, which is the opposite requirement. So
 * they stay hand-picked — but they still follow the theme, because a set tuned
 * against a dark canvas washes out on a white one. The two sets live in
 * `EffectEditor.module.css`, which is also where `data-theme` selects between
 * them; this file only names them.
 */
const PORT_COLORS: Record<EffectValueType, string> = {
  float: 'var(--effect-port-float)',
  vec2: 'var(--effect-port-vec2)',
  vec3: 'var(--effect-port-vec3)',
  vec4: 'var(--effect-port-vec4)',
  sampler2D: 'var(--effect-port-sampler)',
};

const PORT_TYPE_LABELS: Record<EffectValueType, string> = {
  float: 'number',
  vec2: '2D value',
  vec3: 'color (RGB)',
  vec4: 'color (RGBA)',
  sampler2D: 'texture',
};

/**
 * Learner-facing name for a parameter's type.
 *
 * Wider than `portTypeLabel`: `bool` and `int` are ways of *editing* a number
 * rather than things a wire can carry, so they exist here and nowhere in the
 * port vocabulary. Worded for someone meeting the idea for the first time —
 * "whole number", not "int".
 */
const PARAMETER_TYPE_LABELS: Record<EffectParameterType, string> = {
  float: 'number',
  int: 'whole number',
  bool: 'on or off',
  vec2: '2D value',
  vec3: 'color (RGB)',
  vec4: 'color (RGBA)',
};

export function parameterTypeLabel(type: EffectParameterType): string {
  return translate(PARAMETER_TYPE_LABELS[type]);
}

export function portColor(type: EffectValueType | 'generic'): string {
  // A generic port carries no type yet, so it wears the muted chrome color
  // rather than claiming one of the five.
  return type === 'generic' ? 'var(--effect-editor-muted)' : PORT_COLORS[type];
}

/** Learner-facing name for a type, e.g. "2D value" rather than "vec2". */
export function portTypeLabel(type: EffectValueType | 'generic'): string {
  return translate(type === 'generic' ? 'any number' : PORT_TYPE_LABELS[type]);
}

/**
 * Where a port's dot sits along its node edge, as a CSS percentage.
 *
 * Ports take the centre of equal slices of the edge, so two ports land at 25%
 * and 75% rather than jammed into the corners. The same value positions the
 * dot and its label, which is the only thing tying a name to a wire — on a
 * Split node, four unlabelled dots give a learner no way to tell which one
 * carries Y.
 */
export function portOffset(index: number, count: number): string {
  return `${((index + 0.5) / count) * 100}%`;
}
