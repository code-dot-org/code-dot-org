// The stock rule library — rules a learner can import into a project.
//
// The counterpart to the stock EFFECT library, and it exists for the same
// reason: a rule is a lot to write from nothing, and the first useful thing a
// learner does with one is read it. Importing copies the workspace into
// `rules/<id>.rule`, where it is theirs — openable, editable, and no longer
// connected to anything here.
//
// It is also how gravity now reaches a project. There is no built-in gravity
// rule any more (see `builtinMeta`): "Has Gravity" is one of these, and the
// default project is a project that imported it.

import {gravityRule} from './gravity';

/** One entry in the library. */
export interface StockRule {
  /**
   * File stem this is imported as — `gravity` becomes `rules/gravity.rule`.
   *
   * Separate from the rule's authored name because that is learner-facing text
   * they may change ("Has Gravity" → "Moon Gravity"), while this has to stay a
   * safe file name — and it is what every reference to the rule's members is
   * built from (`rules/gravity#AffectedByGravityTrait`).
   */
  id: string;
  /** Learner-facing name, matching the `define rule` block's NAME field. */
  name: string;
  /** One line on what the rule does, for the import dialog. */
  description: string;
  /** What it gives an actor, in the dialog: the traits it provides. */
  provides: readonly string[];
  /** The `.rule` workspace JSON, copied verbatim on import. */
  contents: string;
}

/**
 * The library. One rule so far, which is honest: gravity is the worked example
 * and the only one that has been authored end to end.
 */
export const STOCK_RULES: readonly StockRule[] = [
  {
    id: 'gravity',
    name: 'Has Gravity',
    description:
      'Pulls actors downward, lands them on solid ground, and tells them when they start and stop falling.',
    provides: ['Affected by Gravity', 'Acts as Ground'],
    contents: gravityRule,
  },
];

/** Look one up by its file stem. */
export function stockRule(id: string): StockRule | undefined {
  return STOCK_RULES.find(rule => rule.id === id);
}

export {gravityRule};
