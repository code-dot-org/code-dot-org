import {
  type ConnectionLineComponentProps,
  type EdgeMarkerType,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  type Position,
  useStore,
} from '@xyflow/react';
import {getMarkerId} from '@xyflow/system';
import React from 'react';

import {useReconnectingEdge} from '../context';
import {type EdgeTypeValue} from '../elementToolbars/toolbarPalettes';
import {defaultLineEdgeFields} from '../utils/lineEdges';

interface GhostPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
}

const PATH_BUILDERS: Record<
  EdgeTypeValue,
  (params: GhostPathParams) => string
> = {
  straight: params => getStraightPath(params)[0],
  default: params => getBezierPath(params)[0],
  smoothstep: params => getSmoothStepPath(params)[0],
  step: params => getSmoothStepPath({...params, borderRadius: 0})[0],
};

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

  // Saved data can hold edge types we no longer offer; fall back to the
  // curved path like React Flow does for unknown types.
  const buildPath =
    PATH_BUILDERS[edgeType as EdgeTypeValue] ?? PATH_BUILDERS.default;
  const path = buildPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

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
