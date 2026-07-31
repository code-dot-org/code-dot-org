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
 */
const PORT_COLORS: Record<EffectValueType, string> = {
  float: '#8ab4f8',
  vec2: '#7ee0b8',
  vec3: '#ffd166',
  vec4: '#ff8fa3',
  sampler2D: '#c792ea',
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
  return type === 'generic' ? '#9aa4c4' : PORT_COLORS[type];
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
