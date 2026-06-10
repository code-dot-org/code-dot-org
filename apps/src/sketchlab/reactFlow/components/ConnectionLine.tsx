import {
  type ConnectionLineComponentProps,
  type EdgeMarkerType,
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
  // When reconnecting, mirror the edge's own markers — including their
  // absence; the default arrow applies only to brand-new lines.
  const sourceMarker = reconnectingEdge?.markerStart;
  const targetMarker = reconnectingEdge
    ? reconnectingEdge.markerEnd
    : defaults.markerEnd;

  const markerUrl = (marker?: EdgeMarkerType) =>
    marker ? `url('#${getMarkerId(marker, flowId)}')` : undefined;

  // The ghost runs from the fixed endpoint to the pointer, so when the
  // fixed endpoint is the target, the edge's markers render swapped.
  const fixedEndIsTarget = fromHandle.type === 'target';
  const startMarker = fixedEndIsTarget ? targetMarker : sourceMarker;
  const endMarker = fixedEndIsTarget ? sourceMarker : targetMarker;

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
      markerStart={markerUrl(startMarker)}
      markerEnd={markerUrl(endMarker)}
    />
  );
}
