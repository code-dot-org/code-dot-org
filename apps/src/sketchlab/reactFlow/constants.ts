export const DEFAULT_NODE_WIDTH = 160;
export const DEFAULT_NODE_HEIGHT = 120;

// Text boxes start a single line tall: one line of the default 16px font at
// 1.3 line-height, plus the text node's 8px padding and 1px border per side.
export const DEFAULT_TEXT_NODE_HEIGHT = 40;

export const MIN_NODE_WIDTH = 80;
export const MIN_NODE_HEIGHT = 60;

// Text boxes can shrink to their single-line starting height.
export const MIN_TEXT_NODE_HEIGHT = DEFAULT_TEXT_NODE_HEIGHT;

export const ELEMENT_BORDER_PX = 2;

// Default rotation in degrees.
export const DEFAULT_ROTATION = 0;

export const KEYBOARD_RESIZE_STEP = 20;
export const KEYBOARD_MOVE_STEP = 10;

// Screen pixels the viewport shifts per arrow-key press when panning the
// workspace with the keyboard in hand mode.
export const KEYBOARD_PAN_STEP = 50;

// Side length of the hidden node that anchors a line endpoint.
export const LINE_ANCHOR_SIZE_PX = 10;

export const LINE_DEFAULT_LENGTH_PX = 220;

// Magnetic snap radius (in screen pixels) used when reconnecting an edge
// endpoint to a node handle. Applies to mouse drags.
export const LINE_RECONNECT_SNAP_RADIUS_PX = 40;

// Milliseconds to debounce project saves after canvas changes.
export const SAVE_DEBOUNCE_MS = 300;

export const DEFAULT_PASTE_OFFSET_PX = 30;

// How long transient on-canvas messages (mode hints, upload errors) stay up.
export const TRANSIENT_MESSAGE_DURATION_MS = 3000;

// Custom clipboard MIME type stamped onto the system clipboard when a canvas
// element is copied in-app. A dedicated type (rather than text/plain) keeps the
// marker out of what external apps paste; they only read standard formats.
export const INTERNAL_CLIPBOARD_MIME = 'application/x-cdo-sketchlab';
export const INTERNAL_CLIPBOARD_MARKER = 'cdo-sketchlab-internal-clipboard';

// S3 asset path prefix for project files.
export const ASSET_PATH_PREFIX = '/v3/assets';

export const ARROW_MARKER_WIDTH_PX = 14;
export const ARROW_MARKER_HEIGHT_PX = 14;

export const MIN_ZOOM = 0.1;

// Stable class used by focus and pointer-down handlers.
export const SKETCHLAB_TOOLBAR_PANEL_CLASS = 'sketchlab-toolbar-panel';

// data-* attribute the onboarding tour targets to highlight a set of related
// buttons as one unit.
export const TOUR_GROUP_ATTR = 'data-tour-group';
export const TOUR_GROUP = {
  selectionTools: 'selection-tools',
  shapeTools: 'shape-tools',
  undoRedo: 'undo-redo',
  zoom: 'zoom',
} as const;

// Padding (px) added around child nodes when computing initial group bounds.
// This is consistent with the padding used by React Flow's built-in group node.
export const GROUP_PADDING_PX = 10;
