// Where a placement sits when the window is not the shape the map was drawn at.
//
// A position in a map is a position, which is right until one map is loaded
// into two worlds of different shapes — a pause menu over a square level and
// over a phone-shaped one (specs/ANCHORS_PLAN.md). An anchored placement keeps
// its distance from a named edge instead of its distance from the origin.
//
// THE OFFSET IS MEASURED, NOT AUTHORED. A learner drags a thing into the
// corner of the map and says "bottom right"; how far from the corner that was
// is arithmetic, and asking them for it as a number would be asking them to
// say twice what they have already shown once.
//
// Pure, and here rather than in `World`, for the reason every other piece of
// the engine's arithmetic is: it can be tested without a world, and the one
// caller is a loader that has quite enough to do.

import {Vector} from './Vector';

/** The nine places a placement may be anchored to. */
export const ANCHORS = [
  'top left',
  'top',
  'top right',
  'left',
  'center',
  'right',
  'bottom left',
  'bottom',
  'bottom right',
] as const;

export type Anchor = (typeof ANCHORS)[number];

/** Whether a stored string is one we know. */
export const isAnchor = (value: unknown): value is Anchor =>
  typeof value === 'string' && (ANCHORS as readonly string[]).includes(value);

/** How far along each axis an anchor sits, as a fraction of the whole. */
const FRACTION: Record<Anchor, {x: number; y: number}> = {
  'top left': {x: 0, y: 0},
  top: {x: 0.5, y: 0},
  'top right': {x: 1, y: 0},
  left: {x: 0, y: 0.5},
  center: {x: 0.5, y: 0.5},
  right: {x: 1, y: 0.5},
  'bottom left': {x: 0, y: 1},
  bottom: {x: 0.5, y: 1},
  'bottom right': {x: 1, y: 1},
};

/** The point an anchor names, in a rectangle of this size. */
export const anchorPoint = (size: Vector, anchor: Anchor): Vector =>
  new Vector(size.x * FRACTION[anchor].x, size.y * FRACTION[anchor].y);

/**
 * Where a placement drawn at `at` in a map of `map` size belongs in a view of
 * `view` size, keeping its distance from `anchor`.
 *
 * An identity when the two sizes agree, which is the ordinary case and the one
 * the map editor shows: authoring is always at the map's own shape.
 */
export function anchored(
  at: Vector,
  anchor: Anchor,
  map: Vector,
  view: Vector,
): Vector {
  const from = anchorPoint(map, anchor);
  const to = anchorPoint(view, anchor);
  return new Vector(at.x - from.x + to.x, at.y - from.y + to.y);
}
