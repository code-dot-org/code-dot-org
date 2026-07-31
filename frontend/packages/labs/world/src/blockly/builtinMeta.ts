// The built-in rule library as {@link RuleMeta} — the metadata the editor's
// trait dropdown and block generator read. Lives in its own module (not
// domainBlocks) so `traitOptions` can consume it too without a cycle
// (domainBlocks imports traitOptions for its dropdown extension).
//
// The list is the standard rules in dependency order; the toolbox lists one
// category per rule and the generators walk them in this order. Deriving the
// metadata from the live `Rule` objects (via `builtinRuleMeta`) keeps the editor
// in step with the engine — add a rule, or a member, and its blocks follow.

import * as WorldLab from '../engine';
import {
  AnimationRule,
  CollisionRule,
  InputRule,
  MotionRule,
  SpatialRule,
} from '../engine';

import {builtinRuleMeta, type RuleMeta} from './ruleMeta';

/**
 * The rules the engine provides, in dependency order.
 *
 * GRAVITY IS NOT AMONG THEM. It is a stock `.rule` a project imports
 * (`rules/stock`), which is the whole point of the rule-authoring work: gravity
 * is the worked example of a mechanic a learner can open and read, and having a
 * second, built-in "Has Gravity" in the palette meant two categories of the
 * same name holding different blocks. The engine module still exists as the
 * reference the stock rule was ported from, and the engine's own tests build
 * worlds with it; it simply is not offered for authoring.
 *
 * What remains here is what a rule cannot yet be written in blocks: the spatial
 * frame, integration, collision resolution, input, and animation.
 */
export const BUILTIN_RULES = [
  SpatialRule,
  MotionRule,
  CollisionRule,
  InputRule,
  AnimationRule,
];

export const BUILTIN_RULE_META: RuleMeta[] = builtinRuleMeta(
  BUILTIN_RULES,
  WorldLab as unknown as Record<string, unknown>,
);
