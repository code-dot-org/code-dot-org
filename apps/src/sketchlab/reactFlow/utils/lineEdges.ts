import {MarkerType} from '@xyflow/react';

import {ARROW_MARKER_HEIGHT_PX, ARROW_MARKER_WIDTH_PX} from '../constants';
import {
  DEFAULT_EDGE_TYPE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';

// Default visual fields shared by every line edge.
// Defaults to a solid line with an arrow at the end.
export function defaultLineEdgeFields() {
  return {
    type: DEFAULT_EDGE_TYPE,
    style: {
      stroke: DEFAULT_STROKE_COLOR,
      strokeWidth: DEFAULT_LINE_WIDTH,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: DEFAULT_STROKE_COLOR,
      width: ARROW_MARKER_WIDTH_PX,
      height: ARROW_MARKER_HEIGHT_PX,
      strokeWidth: DEFAULT_LINE_WIDTH,
    },
  };
}
