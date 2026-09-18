// The Viewport's rule: what makes an actor a window onto a map of its own
// (specs/MAP_FIRST.md, "Levels: the Viewport"; specs/VIEWPORT_PLAN.md).
//
// One trait and one property. An actor that `Shows a Map` is given a space of
// its own when it is placed (`World.place`), its map is loaded into that
// space the first time the world runs it, and the space's camera is kept on
// what the map's `camera.follows` names and inside the map's bounds. All of
// that is the engine's: a space is not a thing a rule can invent, any more
// than a position is (`rules/spatial`).
//
// A built-in rule rather than a stock `.rule`, and a FOUNDATION one, in play
// in every world, so the stock Viewport's `use trait` resolves whether or
// not a project ever mentions this rule.

import {RuleBuilder} from '../builders/RuleBuilder';

export const VIEWPORT = {
  rule: 'viewport',
  trait: 'showsMap',
  map: 'map',
} as const;

const rule = new RuleBuilder({
  id: VIEWPORT.rule,
  name: 'Viewport',
  ability: 'Shows a Map',
});

export const ViewportTrait = rule.addTrait({
  id: VIEWPORT.trait,
  name: 'Shows a Map',
});

/** The map the viewport holds, by module path — `maps/level1`. */
export const ViewportMapProperty = ViewportTrait.addProperty(
  VIEWPORT.map,
  'string',
  '',
  {name: 'map'},
);

export const ViewportRule = rule.build();
