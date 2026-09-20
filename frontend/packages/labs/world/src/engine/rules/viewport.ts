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
  scroll: 'scroll',
  content: 'content',
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

/**
 * How far the window has been scrolled over what it holds, in pixels.
 *
 * FROM THE TOP LEFT OF THE CONTENT TO THE TOP LEFT OF THE WINDOW, which is
 * what a scroll offset means everywhere else and is not what the camera holds.
 * The camera is a MIDDLE, which is the right shape for a level a player walks
 * around and the wrong one for a list: "scrolled to 0" should mean the top,
 * not the middle of the first screenful (specs/SCROLLING_PLAN.md).
 *
 * KEPT HONEST BY THE ENGINE. `World.settleSpace` clamps the camera into the
 * space's bounds every tick and writes the result back here, so a project that
 * scrolls past the end reads back the place it actually stopped — which is
 * what a scrollbar has to draw and what "am I at the bottom" has to ask.
 */
export const ViewportScrollProperty = ViewportTrait.addProperty(
  VIEWPORT.scroll,
  'vector',
  {x: 0, y: 0},
  {name: 'scroll'},
);

/**
 * How big the thing being scrolled is, in pixels — the space's bounds.
 *
 * READ-ONLY, and written by the engine when a map is loaded
 * (`World.growSpaceToFit`). A project needs it for the two questions a scroll
 * view always asks: how far there is left to go, and how long a scrollbar's
 * thumb should be. Working it out from the map would mean knowing which map is
 * loaded and how big its tiles are, which is the engine's business.
 */
export const ViewportContentProperty = ViewportTrait.addProperty(
  VIEWPORT.content,
  'vector',
  {x: 0, y: 0},
  {name: 'content', readonly: true},
);

export const ViewportRule = rule.build();
