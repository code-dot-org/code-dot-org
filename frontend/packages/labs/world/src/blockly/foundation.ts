// The rules a world runs on without saying so.
//
// `use rule` is a sentence about a world — "this world has gravity" — and it
// earns its place when the answer could be no. It does not earn its place for a
// rule no game can be without: making a learner write `use rule Has Space`
// before anything has a position is asking them to affirm a tautology, and a
// world block whose first four rows are tautologies is a worse starting point
// than one whose rows are all choices.
//
// Two sources, because the foundation has two halves:
//
//   - The ENGINE's own rules. Space and Appearance are built in precisely
//     because a rule cannot provide them — a position is not something a rule
//     can invent, and animation reads sprite sheets the language cannot see
//     (builtinMeta). `WorldBuilder` seeds them into every world it builds, so
//     they hold for a hand-written `.js` world too.
//   - Foundational STOCK rules. The keyboard's events are an authored `.rule`
//     now, and that was the right move — it is the worked example for the
//     Engine blocks — but noticing a keypress is still not a mechanic a game
//     opts into. A project HOLDING `rules/input.rule` runs it, exactly as
//     holding a `.anim` file registers it. The world generator emits those.
//
// This module is the list, so the generator, the trait dropdown, and anything
// else that has to know cannot disagree about it.

import {FOUNDATION_TRAIT_IDS} from '../engine';
import {STOCK_RULES, type StockRule} from '../rules/stock';

import {BUILTIN_RULE_META} from './builtinMeta';
import {memberValue} from './ruleRegistry';

/** Stock rules a project runs by holding them (`StockRule.foundational`). */
export const FOUNDATIONAL_STOCK_RULES: readonly StockRule[] =
  STOCK_RULES.filter(rule => rule.foundational);

/**
 * Every foundational rule's NAME — the engine's, and the stock ones.
 *
 * Names, because that is what a reference resolves by: a project that ejected
 * Appearance into an authored `.rule` still answers to "Appearance", and the
 * name finds whichever module currently declares it.
 */
export const FOUNDATION_RULE_NAMES: readonly string[] = [
  ...BUILTIN_RULE_META.map(rule => rule.name),
  ...FOUNDATIONAL_STOCK_RULES.map(rule => rule.name),
];

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
