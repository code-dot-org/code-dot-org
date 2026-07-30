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
  GravityRule,
  InputRule,
  MotionRule,
  SpatialRule,
} from '../engine';

import {builtinRuleMeta, type RuleMeta} from './ruleMeta';

export const BUILTIN_RULES = [
  SpatialRule,
  MotionRule,
  CollisionRule,
  GravityRule,
  InputRule,
  AnimationRule,
];

export const BUILTIN_RULE_META: RuleMeta[] = builtinRuleMeta(
  BUILTIN_RULES,
  WorldLab as unknown as Record<string, unknown>,
);
