// A Scroll View on the stage: a window onto its children, drawn as the game
// starts, at no scroll (specs/ONE_WORLD_PLAN.md, step 8).
//
// A child is drawn, and can be clicked, only inside every Scroll View that
// holds it. Opened, a Scroll View shows the whole of what it holds, the
// window and everything below it, so content taller than the window can be
// arranged; the room past the content is somewhere to put the next row.

import {
  isCarriedBy,
  parentIdOf,
  transformOf,
  worldTransformOf,
  type Placement,
  type Transform,
  type Vec,
} from './mapModel';
import {toLocalFrame} from './stageGeometry';

/** A placement's box, before its scale: what the stage draws it at. */
export type BoxOf = (actor: Placement) => {width: number; height: number};

/** One rectangle a placement is clipped to: a Scroll View's, in its frame. */
export interface Clip {
  /** The Scroll View's transform on the canvas. */
  at: Transform;
  /** Half its box, before its scale. */
  half: Vec;
  /** How far the rectangle reaches below its window, before its scale. */
  below: number;
}

/**
 * The Scroll Views that hold a placement, nearest first. A cycle, or a
 * parent the map does not hold, ends the walk.
 */
export function scrollViewsHolding(
  actor: Placement,
  actors: readonly Placement[],
  scrolls: (actor: Placement) => boolean,
): Placement[] {
  const held: Placement[] = [];
  const seen = new Set([actor.id]);
  for (
    let parent = actors.find(one => one.id === parentIdOf(actor));
    parent && !seen.has(parent.id);
    parent = actors.find(one => one.id === parentIdOf(parent!))
  ) {
    seen.add(parent.id);
    if (scrolls(parent)) {
      held.push(parent);
    }
  }
  return held;
}

/**
 * How big what a Scroll View holds is, from its window's top left corner:
 * the window, or its children's extent where that is bigger. The engine's
 * `content`, worked out from the map (`World.settleScrolling`).
 */
export function contentOf(
  scrollView: Placement,
  actors: readonly Placement[],
  boxOf: BoxOf,
  scales?: Record<string, Vec>,
): {width: number; height: number} {
  const window = boxOf(scrollView);
  let right = window.width;
  let bottom = window.height;
  for (const child of actors) {
    if (parentIdOf(child) !== scrollView.id) {
      continue;
    }
    const local = transformOf(child, scales?.[child.type]);
    const box = boxOf(child);
    right = Math.max(
      right,
      local.pos.x +
        window.width / 2 +
        (box.width * Math.abs(local.scale.x)) / 2,
    );
    bottom = Math.max(
      bottom,
      local.pos.y +
        window.height / 2 +
        (box.height * Math.abs(local.scale.y)) / 2,
    );
  }
  return {width: right, height: bottom};
}

/**
 * The rectangle an opened Scroll View shows: its content and, below it, the
 * window's height again as room for more.
 */
export function openedClip(
  scrollView: Placement,
  actors: readonly Placement[],
  boxOf: BoxOf,
  scales?: Record<string, Vec>,
): Clip {
  const window = boxOf(scrollView);
  const content = contentOf(scrollView, actors, boxOf, scales);
  return {
    at: worldTransformOf(scrollView, actors, scales),
    half: {x: window.width / 2, y: window.height / 2},
    // What is past the window, `content − window`, and the window's height
    // again: the content's height.
    below: content.height,
  };
}

/**
 * Every rectangle a placement is drawn inside: one per Scroll View holding
 * it, the opened one at its full height.
 */
export function clipsOf(
  actor: Placement,
  actors: readonly Placement[],
  scrolls: (actor: Placement) => boolean,
  boxOf: BoxOf,
  opened: string | null,
  scales?: Record<string, Vec>,
): Clip[] {
  return scrollViewsHolding(actor, actors, scrolls).map(scrollView =>
    scrollView.id === opened
      ? openedClip(scrollView, actors, boxOf, scales)
      : {
          at: worldTransformOf(scrollView, actors, scales),
          half: {
            x: boxOf(scrollView).width / 2,
            y: boxOf(scrollView).height / 2,
          },
          below: 0,
        },
  );
}

/** A clip's four corners on the canvas, clockwise from the top left. */
export function clipCorners(clip: Clip): Vec[] {
  const {at, half, below} = clip;
  const a = (at.rotation * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const skew = Math.tan((at.skew * Math.PI) / 180);
  const corner = (x: number, y: number): Vec => {
    const sx = x * at.scale.x;
    const sy = y * at.scale.y;
    const rx = sx * cos - sy * sin;
    const ry = sx * sin + sy * cos;
    return {x: at.pos.x + rx, y: at.pos.y + ry + skew * rx};
  };
  const top = -half.y;
  const bottom = half.y + below;
  return [
    corner(-half.x, top),
    corner(half.x, top),
    corner(half.x, bottom),
    corner(-half.x, bottom),
  ];
}

/** Whether a canvas point is inside a clip. */
export function insideClip(world: Vec, clip: Clip): boolean {
  const local = toLocalFrame(world, clip.at);
  return (
    Math.abs(local.x) <= clip.half.x &&
    local.y >= -clip.half.y &&
    local.y <= clip.half.y + clip.below
  );
}

/** Whether a placement is the opened Scroll View's, at any depth below it. */
export const isInside = (
  actor: Placement,
  opened: Placement,
  actors: readonly Placement[],
): boolean => actor.id !== opened.id && isCarriedBy(actor, opened, actors);
