// Dragging a corner of something that may be turned.
//
// PORTED FROM SKETCH LAB, deliberately: `apps/src/sketchlab/reactFlow/utils/
// rotatedResize.ts` solves exactly this and two labs that resize things should
// behave the same way while they are doing it. The handle names, the rule that
// the point opposite the dragged handle stays put, and the order of operations
// are all theirs (specs/BOXES_PLAN.md).
//
// WHAT DIVERGES, and it is one thing: a placement in this lab is stored by its
// MIDDLE, not by its top left (`mapModel`, `positional.position`). So this
// takes a centre and answers a centre, which removes the two conversions
// Sketch Lab does at either end and changes nothing else.
//
// PURE, like theirs. No React, no canvas, no map — a size, a rotation and a
// pointer movement in, a size and a centre out. That is what lets the awkward
// half of a resize be tested without a mouse (specs/BOXES_PLAN.md).

export type ResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export const RESIZE_HANDLES: readonly ResizeHandle[] = [
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
];

/** A corner handle resizes both axes; its name is hyphenated. */
export const isCornerHandle = (handle: ResizeHandle): boolean =>
  handle.includes('-');

/**
 * Which local axes a handle grows along.
 *
 * -1 grows toward negative x/y (left/top), 1 toward positive, 0 leaves that
 * axis alone — which is what makes an edge handle a one-axis resize without
 * any second code path.
 */
const HANDLE_AXES: Record<ResizeHandle, {x: number; y: number}> = {
  'top-left': {x: -1, y: -1},
  top: {x: 0, y: -1},
  'top-right': {x: 1, y: -1},
  right: {x: 1, y: 0},
  'bottom-right': {x: 1, y: 1},
  bottom: {x: 0, y: 1},
  'bottom-left': {x: -1, y: 1},
  left: {x: -1, y: 0},
};

export interface Box {
  /** The MIDDLE of the box, which is where a placement is stored. */
  center: {x: number; y: number};
  width: number;
  height: number;
  /** Degrees, clockwise, about the middle. */
  rotation: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

/**
 * Where a handle sits, in the same space the centre is in.
 *
 * Used to draw the handles and to hit-test a press on one, so there is one
 * answer for where a handle IS rather than two that can drift apart.
 */
export function handlePoint(
  box: Box,
  handle: ResizeHandle,
): {x: number; y: number} {
  const axes = HANDLE_AXES[handle];
  const theta = box.rotation * DEGREES_TO_RADIANS;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const localX = (axes.x * box.width) / 2;
  const localY = (axes.y * box.height) / 2;
  return {
    x: box.center.x + localX * cos - localY * sin,
    y: box.center.y + localX * sin + localY * cos,
  };
}

/** Where the rotation grip sits: above the top edge, turning with the box. */
export function rotationPoint(box: Box, reach: number): {x: number; y: number} {
  const theta = box.rotation * DEGREES_TO_RADIANS;
  const localY = -box.height / 2 - reach;
  return {
    x: box.center.x - localY * Math.sin(theta),
    y: box.center.y + localY * Math.cos(theta),
  };
}

/**
 * Resize a box that is turned about its middle, keeping the point OPPOSITE
 * the dragged handle where it was.
 *
 * `pointerDelta` is the total movement since the drag began, not the movement
 * since the last event. Using the total keeps the answer exact however many
 * events arrive, and means a drag can be replayed from its start — which is
 * what makes it testable and what stops rounding accumulating.
 */
export function resizeBox(options: {
  start: Box;
  handle: ResizeHandle;
  pointerDelta: {x: number; y: number};
  minWidth: number;
  minHeight: number;
}): {center: {x: number; y: number}; width: number; height: number} {
  const {start, handle, pointerDelta, minWidth, minHeight} = options;
  const axes = HANDLE_AXES[handle];
  const theta = start.rotation * DEGREES_TO_RADIANS;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // The pointer's movement said in the BOX's own axes, so dragging the corner
  // of a turned box grows it along the edges you can see rather than along the
  // screen.
  const localX = pointerDelta.x * cos + pointerDelta.y * sin;
  const localY = -pointerDelta.x * sin + pointerDelta.y * cos;

  // Clamped in local space BEFORE the new middle is worked out. Clamping
  // afterwards would move the middle and let the anchor drift, which reads as
  // the box sliding away from the corner you are holding.
  const width =
    axes.x === 0
      ? start.width
      : Math.max(minWidth, start.width + axes.x * localX);
  const height =
    axes.y === 0
      ? start.height
      : Math.max(minHeight, start.height + axes.y * localY);

  // The fixed point: the corner opposite the handle, where it is now.
  const anchorLocalX = (-axes.x * start.width) / 2;
  const anchorLocalY = (-axes.y * start.height) / 2;
  const anchor = {
    x: start.center.x + anchorLocalX * cos - anchorLocalY * sin,
    y: start.center.y + anchorLocalX * sin + anchorLocalY * cos,
  };

  // …and the new middle, placed so that point is still there.
  const centerLocalX = (axes.x * width) / 2;
  const centerLocalY = (axes.y * height) / 2;
  return {
    center: {
      x: anchor.x + centerLocalX * cos - centerLocalY * sin,
      y: anchor.y + centerLocalX * sin + centerLocalY * cos,
    },
    width,
    height,
  };
}

/** Degrees, wrapped to 0–359 as Sketch Lab stores them. */
export const normalizeRotation = (degrees: number): number =>
  ((Math.round(degrees) % 360) + 360) % 360;

/**
 * The angle from a box's middle to a point, in the same degrees a placement
 * stores — clockwise, with zero pointing UP, because that is where the grip
 * sits and what "turned by 90" should mean.
 */
export const angleTo = (
  center: {x: number; y: number},
  at: {x: number; y: number},
): number =>
  normalizeRotation(
    Math.atan2(at.y - center.y, at.x - center.x) / DEGREES_TO_RADIANS + 90,
  );
