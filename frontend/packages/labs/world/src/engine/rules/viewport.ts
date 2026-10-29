// The Viewport's rule: what makes an actor a window onto the World
// (specs/ONE_WORLD_PLAN.md).
//
// An actor that `Shows a Map` is given a space of its own when it is placed
// (`World.place`): its camera and its window, looking at the World, whose map
// the Main Screen names (`worldMap`). That much is the engine's: a space is
// not a thing a rule can invent, any more than a position is
// (`rules/spatial`).
//
// WHERE THE VIEW LOOKS IS NOT. A Viewport has one camera, which elects traits
// as any camera does, so `Follows`, `Eases` and `Confined to the Map` aim it
// (specs/SPACE_CAMERAS_PLAN.md). What it elects is said by its placement
// (`World.setViewportCamera`).
//
// A built-in rule rather than a stock `.rule`, and a FOUNDATION one, in play
// in every world, so the stock Viewport's `use trait` resolves whether or
// not a project ever mentions this rule.

import {RuleBuilder} from '../builders/RuleBuilder';

export const VIEWPORT = {
  rule: 'viewport',
  trait: 'showsMap',
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
  description: 'Shows the World inside it, through a camera of its own.',
});

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
