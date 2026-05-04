export const DEFAULT_NODE_WIDTH = 160;
export const DEFAULT_NODE_HEIGHT = 120;

export const MIN_NODE_WIDTH = 80;
export const MIN_NODE_HEIGHT = 60;

// Default rotation in degrees.
export const DEFAULT_ROTATION = 0;

export const KEYBOARD_RESIZE_STEP = 20;
export const KEYBOARD_MOVE_STEP = 10;

// Side length of the hidden node that anchors a line endpoint.
export const LINE_ANCHOR_SIZE_PX = 10;

export const LINE_DEFAULT_LENGTH_PX = 220;

// Magnetic snap radius (in screen pixels) used when reconnecting an edge
// endpoint to a node handle. Applies to mouse drags and to React Flow's
// own connection drag (via the `connectionRadius` prop). Matches React
// Flow's default of 20 px; surfaced as a constant so we can tune by feel.
export const LINE_RECONNECT_SNAP_RADIUS_PX = 20;

// Snap radius (in FLOW units) for keyboard-driven edge moves. Sized so
// that any arrow press whose post-move position lands within one move
// step of a target handle still snaps. Converted to screen pixels at the
// call site by multiplying with the current zoom.
export const KEYBOARD_SNAP_RADIUS_FLOW_UNITS = 20;

// Milliseconds to debounce project saves after canvas changes.
export const SAVE_DEBOUNCE_MS = 300;

// S3 asset path prefix for project files.
export const ASSET_PATH_PREFIX = '/v3/assets';

export const ARROW_MARKER_WIDTH_PX = 14;
export const ARROW_MARKER_HEIGHT_PX = 14;
