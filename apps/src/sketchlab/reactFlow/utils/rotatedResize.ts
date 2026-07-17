import type {XYPosition} from '@xyflow/react';

export type ResizeHandlePosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export const RESIZE_HANDLE_POSITIONS: readonly ResizeHandlePosition[] = [
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
];

// Which local axes a handle resizes along: -1 grows toward negative x/y
// (left/top), 1 toward positive (right/bottom), 0 leaves that axis alone.
const HANDLE_AXIS_FACTORS: Record<ResizeHandlePosition, XYPosition> = {
  'top-left': {x: -1, y: -1},
  top: {x: 0, y: -1},
  'top-right': {x: 1, y: -1},
  right: {x: 1, y: 0},
  'bottom-right': {x: 1, y: 1},
  bottom: {x: 0, y: 1},
  'bottom-left': {x: -1, y: 1},
  left: {x: -1, y: 0},
};

export interface RotatedResizeStart {
  position: XYPosition;
  width: number;
  height: number;
  rotationDeg: number;
}

export interface RotatedResizeResult {
  position: XYPosition;
  width: number;
  height: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

/**
 * Resize a node that is rotated about its center, keeping the point opposite
 * the dragged handle (corner, or edge midpoint for edge handles) fixed in
 * flow space. Pointer motion is mapped onto the node's own rotated axes, so
 * dragging e.g. the visually-bottom handle of a 90°-rotated node changes its
 * height, as the user expects.
 *
 * `pointerDelta` is the total pointer movement since the drag started, in
 * flow coordinates. Using the total delta (rather than accumulating
 * per-event deltas) keeps the result exact, and makes the math work
 * unchanged for grouped children whose `position` is parent-relative.
 */
export function computeRotatedResize(options: {
  start: RotatedResizeStart;
  handle: ResizeHandlePosition;
  pointerDelta: XYPosition;
  minWidth: number;
  minHeight: number;
}): RotatedResizeResult {
  const {start, handle, pointerDelta, minWidth, minHeight} = options;
  const factors = HANDLE_AXIS_FACTORS[handle];
  const theta = start.rotationDeg * DEGREES_TO_RADIANS;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  // Pointer delta expressed in the node's local (rotated) axes.
  const localDeltaX = pointerDelta.x * cos + pointerDelta.y * sin;
  const localDeltaY = -pointerDelta.x * sin + pointerDelta.y * cos;

  // Clamp in local space before computing the new center; clamping later
  // would shift the center and make the anchor drift.
  const width =
    factors.x === 0
      ? start.width
      : Math.max(minWidth, start.width + factors.x * localDeltaX);
  const height =
    factors.y === 0
      ? start.height
      : Math.max(minHeight, start.height + factors.y * localDeltaY);

  const startCenter = {
    x: start.position.x + start.width / 2,
    y: start.position.y + start.height / 2,
  };

  // The fixed anchor: the corner (or edge midpoint) opposite the handle,
  // at its rotated position about the old center.
  const anchorLocalX = (-factors.x * start.width) / 2;
  const anchorLocalY = (-factors.y * start.height) / 2;
  const anchor = {
    x: startCenter.x + anchorLocalX * cos - anchorLocalY * sin,
    y: startCenter.y + anchorLocalX * sin + anchorLocalY * cos,
  };

  // Place the new center so the anchor keeps the same local offset
  // (scaled to the new size) under the same rotation.
  const centerLocalX = (factors.x * width) / 2;
  const centerLocalY = (factors.y * height) / 2;
  const center = {
    x: anchor.x + centerLocalX * cos - centerLocalY * sin,
    y: anchor.y + centerLocalX * sin + centerLocalY * cos,
  };

  return {
    position: {x: center.x - width / 2, y: center.y - height / 2},
    width,
    height,
  };
}

// Clockwise angle from north for each handle at rotation 0.
const HANDLE_BASE_ANGLE_DEG: Record<ResizeHandlePosition, number> = {
  top: 0,
  'top-right': 45,
  right: 90,
  'bottom-right': 135,
  bottom: 180,
  'bottom-left': 225,
  left: 270,
  'top-left': 315,
};

const RESIZE_CURSORS = [
  'ns-resize',
  'nesw-resize',
  'ew-resize',
  'nwse-resize',
] as const;

export type ResizeCursor = (typeof RESIZE_CURSORS)[number];

const CURSOR_STEP_DEG = 45;

/**
 * Resize cursor for a handle on a rotated node, so the cursor's direction
 * matches the handle's on-screen position (quantized to 45°).
 */
export function resizeCursorForHandle(
  handle: ResizeHandlePosition,
  rotationDeg: number
): ResizeCursor {
  const angle = HANDLE_BASE_ANGLE_DEG[handle] + rotationDeg;
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const step = Math.round(normalizedAngle / CURSOR_STEP_DEG) % 8;
  return RESIZE_CURSORS[step % RESIZE_CURSORS.length];
}
