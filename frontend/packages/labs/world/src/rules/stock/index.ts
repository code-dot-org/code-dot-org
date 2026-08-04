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

import {arrowsRule} from './arrows';
import {collisionsRule} from './collisions';
import {gravityRule} from './gravity';
import {inputRule} from './input';
import {motionRule} from './motion';
import {solidRule} from './solid';

/** One entry in the library. */
export interface StockRule {
  /**
   * File stem this is imported as — `gravity` becomes `rules/gravity.rule`.
   *
   * Only a file name. References are built from the rule's NAME, so where the
   * copy lands and what it is called on disk are the learner's business.
   */
  id: string;
  /**
   * What the rule is, matching its `define rule` NAME — "Gravity".
   *
   * The name every reference to its members is built from
   * (`Gravity#AffectedByGravityTrait`), so two rules answering to one name is
   * an ambiguity, which is why importing the same stock rule twice is a no-op.
   */
  name: string;
  /** What using it gives a world, matching ABILITY — "Has Gravity". */
  ability: string;
  /** One line on what the rule does, for the import dialog. */
  description: string;
  /** What it gives an actor, in the dialog: the traits it provides. */
  provides: readonly string[];
  /**
   * Whether a project holding this rule runs it without saying so.
   *
   * The engine's own foundation (Space, Appearance) is seeded by
   * `WorldBuilder` — a rule cannot provide a position or read a sprite sheet,
   * so no world can lack them. This flag is the same idea for a rule that IS
   * authored: the keyboard's events belong to a rule now, but noticing a
   * keypress is not a mechanic a game opts into, so a project that holds
   * `rules/input.rule` gets it in play the way it gets its `.anim` files
   * registered — by holding them.
   *
   * `use rule` keeps meaning what it says: a mechanic in play, which is a
   * choice. Naming a foundational rule explicitly is allowed and does nothing
   * extra.
   */
  foundational?: boolean;
  /** The `.rule` workspace JSON, copied verbatim on import. */
  contents: string;
}

/**
 * The library: the mechanics that used to be engine code, in the order a project
 * is likely to want them.
 */
export const STOCK_RULES: readonly StockRule[] = [
  {
    id: 'motion',
    name: 'Physics',
    ability: 'Has Physics',
    description:
      'Gives actors a speed, moves them by it every frame, and lets a force change it.',
    provides: ['Can Move'],
    contents: motionRule,
  },
  {
    id: 'collisions',
    name: 'Collisions',
    ability: 'Notices Collisions',
    description:
      'Works out which actors are touching which, once a tick, and writes each one down. Says nothing about what to do about it.',
    provides: ['Can Collide'],
    contents: collisionsRule,
  },
  {
    id: 'solid',
    name: 'Solid Bodies',
    ability: 'Has Solid Bodies',
    description:
      'Stops moving actors passing through solid ones, pushing them out at the face they entered.',
    provides: ['Solid'],
    contents: solidRule,
  },
  {
    id: 'input',
    name: 'Input',
    ability: 'Responds to Input',
    description:
      'Raises an event on every actor when a key goes down or comes up, so a handler can react to a press rather than to it being held.',
    provides: [],
    foundational: true,
    contents: inputRule,
  },
  {
    id: 'arrows',
    name: 'Arrow Keys',
    ability: 'Moves with Arrow Keys',
    description:
      'Walks an actor left and right while the arrow keys are held, at a speed the actor carries.',
    provides: ['Controlled by Arrow Keys'],
    contents: arrowsRule,
  },
  {
    id: 'gravity',
    name: 'Gravity',
    ability: 'Has Gravity',
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

/** Look one up by the name its `define rule` block carries — what a `use rule`
 *  in another stock rule refers to it as. */
export function stockRuleByName(name: string): StockRule | undefined {
  return STOCK_RULES.find(rule => rule.name === name);
}

export {
  arrowsRule,
  solidRule,
  collisionsRule,
  gravityRule,
  inputRule,
  motionRule,
};
