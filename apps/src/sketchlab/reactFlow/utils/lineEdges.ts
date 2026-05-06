import {MarkerType} from '@xyflow/react';

import {ARROW_MARKER_HEIGHT_PX, ARROW_MARKER_WIDTH_PX} from '../constants';
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';

// Default visual fields shared by every line edge.
// `arrow: true` adds the end-arrow marker;`arrow: false` omits it.
export function defaultLineEdgeFields({arrow}: {arrow: boolean}) {
  return {
    type: 'straight',
    style: {
      stroke: DEFAULT_STROKE_COLOR,
      strokeWidth: DEFAULT_LINE_WIDTH,
    },
    ...(arrow && {
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: DEFAULT_STROKE_COLOR,
        width: ARROW_MARKER_WIDTH_PX,
        height: ARROW_MARKER_HEIGHT_PX,
        strokeWidth: DEFAULT_LINE_WIDTH,
      },
    }),
  };
}
