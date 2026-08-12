// The rules and traits a world runs on without holding a file for them.
//
// A much smaller list than it was, and the shrinking is the point. It used to
// have two halves: the engine's own rules, and the STOCK rules a project ran by
// merely holding — the keyboard, which nobody opts into noticing. That second
// half is now every rule, since holding one is what puts it in play
// (blockly/projectModules), so there is nothing left to distinguish.
//
// What remains is what no project holds a file for: Space and Appearance are
// built in precisely because a rule cannot provide them — a position is not
// something a rule can invent, and animation reads sprite sheets the language
// cannot see (builtinMeta) — and `WorldBuilder` seeds them into every world it
// builds, so they hold for a hand-written `.js` world too.
//
// This module is the list, so the trait dropdown and anything else that has to
// know cannot disagree about it.

import {FOUNDATION_TRAIT_IDS} from '../engine';

import {BUILTIN_RULE_META} from './builtinMeta';
import {memberValue} from './ruleRegistry';

/**
 * The engine's own rules, by NAME — in play in every world, file or no file.
 *
 * Names, because that is what a reference resolves by: a project that ejected
 * Appearance into an authored `.rule` still answers to "Appearance", and the
 * name finds whichever module currently declares it.
 */
export const FOUNDATION_RULE_NAMES: readonly string[] = BUILTIN_RULE_META.map(
  rule => rule.name,
);

/**
 * The traits every actor has already, as `use trait` DROPDOWN VALUES.
 *
 * The foundation one level down: a world runs Space and Appearance, and an
 * actor carries their two traits whether it elects them or not
 * (`ActorBuilder`'s FOUNDATION_TRAITS) — "Can Be Positioned" is what being in
 * the world means, and "Has Appearance" is what `set sprite` writes to. So a
 * `use trait` row for either is the same tautology `use rule Has Space` was.
 *
 * Built from the engine's ids rather than written out, because the two have to
 * agree and a second spelling of the same list is a thing to forget. Values,
 * not names: what a dropdown holds is `<RuleName>#<exportName>`, which is a
 * fact about the rule that declares the trait.
 *
 * Only the ELECTING dropdown leaves these out. `has trait` is asking a question
 * about a value, and "is this thing positioned" stays a question a learner may
 * ask — of a camera, say, whose value is Actor-typed on purpose (traitOptions).
 */
export const FOUNDATION_TRAIT_VALUES: ReadonlySet<string> = new Set(
  BUILTIN_RULE_META.flatMap(rule =>
    rule.traits
      .filter(trait => FOUNDATION_TRAIT_IDS.includes(trait.id))
      .map(trait => memberValue(trait.ref)),
  ),
);
