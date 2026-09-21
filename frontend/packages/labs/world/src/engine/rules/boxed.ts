// A box: the one thing every interface actor has and nothing named.
//
// Nine of the stock actors are a width and a height with something drawn in
// them — a Button, a Panel, a List, a Text Input, a Scroll View. They got
// those two numbers by ACTING LIKE a Label, which works and says the wrong
// thing: a Button is not a kind of Label, and a Slider and an Image are not
// either, so both of those ended up declaring a `width` and a `height` of
// their own. Three different `width` properties for one idea
// (specs/BOXES_PLAN.md).
//
// A THING SHARED BY MANY KINDS IS A TRAIT. That is the rule this lab keeps
// arriving at from both directions: `text` is the Label's because a Label and
// a Button and a Score all mean the same by it, and `fraction` is the Progress
// Bar's because nobody else means anything by it. A box is the first kind:
// every interface kind means exactly the same thing, and the map editor asks
// "does this have a box" without knowing any of their names.
//
// A FOUNDATION RULE, in play in every world, for the same reason the Viewport
// is: a resize handle cannot ask whether a project happened to import the rule
// that gives things a size. It is not a mechanic somebody opts into.
//
// NOT THE SAME AS `intrinsic size`, which is the engine's read-only answer to
// "how big is the picture this actor draws" (`rules/spatial`). This is what
// the project ASKED for. A Label's drawing reads this and lays its words into
// it; an Image reads it and scales its picture to fit. Where the two disagree,
// this is the intention and that is the result.

import {RuleBuilder} from '../builders/RuleBuilder';

export const BOXED = {
  rule: 'boxed',
  trait: 'hasABox',
  width: 'width',
  height: 'height',
} as const;

const rule = new RuleBuilder({
  id: BOXED.rule,
  name: 'Boxed',
  ability: 'Has a Box',
});

/**
 * NAMED FOR THE TRAIT, not for the rule, and the name is load-bearing.
 *
 * A built-in rule's members are referenced by their EXPORT name — a `use
 * trait` row stores `Boxed#HasABoxTrait` and the editor resolves that against
 * this module's exports (`blockly/builtinMeta`, `builtinRuleMeta`). Exported
 * as `BoxedTrait` it resolved to nothing, so every `use trait` row naming it
 * elected nothing, silently: no error, no warning, and nine interface actors
 * with no box at all (specs/BOXES_PLAN.md).
 */
export const HasABoxTrait = rule.addTrait({
  id: BOXED.trait,
  name: 'Has a Box',
});

/** How wide the project asked for this to be, in pixels. */
export const WidthProperty = HasABoxTrait.addProperty(
  BOXED.width,
  'number',
  0,
  {
    name: 'width',
  },
);

/** …and how tall. */
export const HeightProperty = HasABoxTrait.addProperty(
  BOXED.height,
  'number',
  0,
  {name: 'height'},
);

export const BoxedRule = rule.build();
