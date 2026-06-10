import {
  type ConnectionLineComponentProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useStore,
} from '@xyflow/react';
import {getMarkerId} from '@xyflow/system';
import React from 'react';

import {useReconnectingEdge} from '../context';
import {defaultLineEdgeFields} from '../utils/lineEdges';

/**
 * Ghost line shown while dragging a connection. Mirrors the path type,
 * stroke styling, and arrow marker of the edge being reconnected (or the
 * defaults a new line will get) so the line doesn't change appearance when
 * the drag lands.
 */
export default function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  fromHandle,
}: ConnectionLineComponentProps) {
  const reconnectingEdge = useReconnectingEdge();
  // React Flow prefixes marker ids with the flow's id.
  const flowId = useStore(state => state.rfId);
  const defaults = defaultLineEdgeFields();
  const edgeType = reconnectingEdge?.type ?? defaults.type;
  const style = reconnectingEdge?.style ?? defaults.style;
  const marker = reconnectingEdge?.markerEnd ?? defaults.markerEnd;

  const markerUrl = marker
    ? `url('#${getMarkerId(marker, flowId)}')`
    : undefined;
  const arrowAtStart = fromHandle.type === 'target';

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
      markerStart={arrowAtStart ? markerUrl : undefined}
      markerEnd={arrowAtStart ? undefined : markerUrl}
    />
  );
}
