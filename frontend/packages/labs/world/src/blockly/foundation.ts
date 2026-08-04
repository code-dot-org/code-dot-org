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

import {STOCK_RULES, type StockRule} from '../rules/stock';

import {BUILTIN_RULE_META} from './builtinMeta';

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
