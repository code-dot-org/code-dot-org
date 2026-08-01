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
import {AnimationRule, SpatialRule} from '../engine';

import {builtinRuleMeta, type RuleMeta} from './ruleMeta';

/**
 * The rules the engine provides, in dependency order.
 *
 * MECHANICS ARE NOT AMONG THEM. Gravity and arrow-key walking are stock
 * `.rule` files a project imports (`rules/stock`), which is the whole point of
 * the rule-authoring work: they are the mechanics a learner can open and read.
 * Gravity's engine module is now only a test fixture
 * (`engine/__tests__/fixtures/gravityRule`); walking and the keyboard's events
 * left too, as `rules/stock/arrows` and `rules/stock/input`. The World still
 * OWNS the keyboard — which keys are down, and which changed since the last
 * frame — but what a key means is a rule's business, and now it is written like
 * one.
 *
 * Impenetrability went the same way (`rules/stock/collision`), and then moving
 * itself (`rules/stock/motion`) — a speed, a shove, and a step that turns speed
 * into a change of place, including the scale between speeds and pixels, which
 * is a property of that rule now rather than a constant inside the engine.
 *
 * What remains is what a rule cannot reach: the spatial frame every actor has
 * (a position is not something a rule can invent), and animation, which reads
 * the sprite sheets the engine loads and the language cannot see.
 */
export const BUILTIN_RULES = [SpatialRule, AnimationRule];

export const BUILTIN_RULE_META: RuleMeta[] = builtinRuleMeta(
  BUILTIN_RULES,
  WorldLab as unknown as Record<string, unknown>,
);
