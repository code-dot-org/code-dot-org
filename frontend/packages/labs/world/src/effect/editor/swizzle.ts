import {
  SWIZZLE_COMPONENTS,
  componentCount,
  componentLabel,
  isNumericType,
  swizzleResultType,
} from '../glsl/valueTypes';
import type {EffectPortType, EffectValueType} from '../model/types';

export {componentLabel, swizzleLabel} from '../glsl/valueTypes';

/**
 * Narrowing a wire by choosing components.
 *
 * The compiler refuses to invent which part of a color a number port should
 * receive — that is the "no silent narrowing" rule. A swizzle is the learner
 * answering that question out loud, which is exactly why it is allowed where
 * automatic conversion is not: the choice is theirs, recorded on the wire, and
 * legible on screen afterwards.
 */

/** One offer in the picker: what to store, and how to say it. */
export interface SwizzleOption {
  /** Canonical `xyzw` form, as stored on the edge. */
  swizzle: string;
  /** How this component is spelled for the learner — "R" or "X". */
  label: string;
}

/** What the picker has to ask for, to bridge one particular drop. */
export interface SwizzlePlan {
  /** How many components the target port needs, in order. */
  componentsNeeded: number;
  /** Every component the source has to offer. */
  available: SwizzleOption[];
}

/**
 * What it would take to narrow this wire, or null when narrowing is not the
 * answer here.
 *
 * Only ever narrowing: the source must have strictly more components than the
 * target. Equal widths need no help, and a target *wider* than its source is
 * refused outright — filling the gap would mean repeating a component the
 * learner never asked to repeat, which is the invention this whole mechanism
 * exists to avoid.
 */
export function swizzlePlan(
  sourceType: EffectPortType,
  targetType: EffectPortType,
): SwizzlePlan | null {
  if (sourceType === 'generic' || targetType === 'generic') {
    return null;
  }
  if (!isNumericType(sourceType) || !isNumericType(targetType)) {
    return null;
  }

  const from = componentCount(sourceType);
  const needed = componentCount(targetType);
  if (needed < 1 || from <= needed) {
    return null;
  }

  return {
    componentsNeeded: needed,
    available: [...SWIZZLE_COMPONENTS.slice(0, from)].map(component => ({
      swizzle: component,
      label: componentLabel(sourceType, component),
    })),
  };
}

/** Whether a swizzle could bridge these two ports. */
export function canSwizzle(
  sourceType: EffectPortType,
  targetType: EffectPortType,
): boolean {
  return swizzlePlan(sourceType, targetType) !== null;
}

/** The components the picker starts from — the natural prefix, `xy` of `xyzw`. */
export function defaultSwizzle(plan: SwizzlePlan): string {
  return plan.available
    .slice(0, plan.componentsNeeded)
    .map(option => option.swizzle)
    .join('');
}

/** The type a wire actually delivers, after any narrowing it carries. */
export function deliveredType(
  sourceType: EffectValueType,
  swizzle: string | undefined,
): EffectValueType {
  return swizzle ? swizzleResultType(swizzle) : sourceType;
}
