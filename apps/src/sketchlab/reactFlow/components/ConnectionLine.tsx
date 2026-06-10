import {
  type ConnectionLineComponentProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import React from 'react';

import {useReconnectingEdge} from '../context';
import {
  DEFAULT_EDGE_TYPE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
} from '../elementToolbars/toolbarPalettes';

/**
 * Ghost line shown while dragging a connection. Mirrors the path type and
 * stroke styling of the edge being reconnected (or the defaults a new line
 * will get) so the line doesn't change shape when the drag lands.
 */
export default function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) {
  const reconnectingEdge = useReconnectingEdge();
  const edgeType = reconnectingEdge?.type ?? DEFAULT_EDGE_TYPE;
  const style = reconnectingEdge?.style ?? {
    stroke: DEFAULT_STROKE_COLOR,
    strokeWidth: DEFAULT_LINE_WIDTH,
  };

  const pathParams = {
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  };

  let path: string;
  switch (edgeType) {
    case 'straight':
      [path] = getStraightPath(pathParams);
      break;
    case 'step':
      [path] = getSmoothStepPath({...pathParams, borderRadius: 0});
      break;
    case 'smoothstep':
      [path] = getSmoothStepPath(pathParams);
      break;
    default:
      [path] = getBezierPath(pathParams);
  }

  return (
    <path
      d={path}
      fill="none"
      className="react-flow__connection-path"
      style={style}
    />
  );
}
