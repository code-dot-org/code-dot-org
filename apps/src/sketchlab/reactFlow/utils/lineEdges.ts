import {MarkerType} from '@xyflow/react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {ARROW_MARKER_HEIGHT_PX, ARROW_MARKER_WIDTH_PX} from '../constants';
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';

export function isArrowEdge(edge: SketchlabReactFlowEdge): boolean {
  return Boolean(edge.markerStart || edge.markerEnd);
}

// Default visual fields shared by every line edge: tool-created lines and
// arrows, mouse-drag connections, and keyboard-driven connections. Spread
// into the edge being built. `arrow: true` adds the end-arrow marker;
// `arrow: false` (the line tool) omits it.
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
