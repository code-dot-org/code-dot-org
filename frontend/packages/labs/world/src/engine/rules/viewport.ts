// The Viewport's rule: what makes an actor a window onto a map of its own
// (specs/MAP_FIRST.md, "Levels: the Viewport"; specs/VIEWPORT_PLAN.md).
//
// An actor that `Shows a Map` is given a space of its own when it is placed
// (`World.place`), and its map is loaded into that space the first time the
// world runs it. That much is the engine's: a space is not a thing a rule can
// invent, any more than a position is (`rules/spatial`).
//
// WHERE THE VIEW LOOKS IS NOT. The space's camera used to be kept on what the
// map's `camera.follows` named, which was following written a second time in the
// engine. A space's cameras elect traits like the world's, so `Follows`, `Eases`
// and `Confined to the Map` reach them (specs/SPACE_CAMERAS_PLAN.md). What the
// engine still does is scroll a camera that elects nothing, since `scroll` is
// the Viewport's own property and a scroll view is the Viewport deciding about
// the scene it shows.
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
  showsThrough: 'showsThrough',
  showsMap: 'showsMap',
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

/**
 * Which of this Viewport's cameras the view is taken through, by name.
 *
 * EMPTY IS ITS MAIN CAMERA, which every space has and which cannot be taken
 * away — so a Viewport that says nothing shows through the camera it was made
 * with, and every Viewport written before cameras could be declared on one
 * reads exactly as it did (specs/SPACE_CAMERAS_PLAN.md).
 *
 * A PROPERTY rather than a block of its own, because a Viewport is a placement:
 * a property gives it a field in the inspector and a `set` block for free, so
 * cutting to a chase camera for the boss and back to the wide shot afterwards is
 * an ordinary `set` with nothing invented for it. The world has
 * `setActiveCamera` instead, for want of a placement to hang a field on, and
 * that is the whole of what makes the world the odd one out.
 *
 * A name no camera of this Viewport has is its main one rather than a black
 * screen — the same answer `World.camera` gives for an unknown id, and for the
 * same reason: the name comes from generated code or a field, and a world with
 * no view is not a better answer than a world looking through its default.
 */
export const ViewportShowsThroughProperty = ViewportTrait.addProperty(
  VIEWPORT.showsThrough,
  'string',
  '',
  {name: 'shows through'},
);

/**
 * `when ⟨this Viewport⟩ shows a map` — raised once the map has landed, with the
 * map's path as the event value.
 *
 * THE MOMENT A VIEWPORT'S CAMERA CAN BE AIMED. `set actor to follow` in a
 * Viewport's `on create` runs before its map has loaded, and `any ⟨Pilot⟩` is a
 * snapshot at the moment of the set, so it freezes to the root's Pilots or to
 * nobody. Making the stored value lazy was rejected as a surprise in how values
 * work; this is the other answer, the same moment `showHeldMap` and
 * `loadMapInto` already know (specs/SPACE_CAMERAS_PLAN.md, step 12).
 *
 * Raised for a load by path and a load by value alike, after the map's actors
 * exist in the space, and queued like every event — so a handler runs on the
 * tick the map landed, with the actors there to find. Not raised for an unload,
 * and not raised when the path names no map: a Viewport showing nothing has not
 * been shown a map.
 */
export const ViewportShowsMapEvent = rule.addEvent(VIEWPORT.showsMap, {
  name: 'shows a map',
});

export const ViewportRule = rule.build();
