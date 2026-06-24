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
 * Ghost line shown while dragging out a new connection. Mirrors the path type,
 * stroke styling, and arrow marker a new line will get so the line doesn't
 * change appearance when the drag lands.
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
  // React Flow prefixes marker ids with the flow's id.
  const flowId = useStore(state => state.rfId);
  const {type: edgeType, style, markerEnd} = defaultLineEdgeFields();

  const markerUrl = (marker?: EdgeMarkerType) =>
    marker ? `url('#${getMarkerId(marker, flowId)}')` : undefined;

  // The ghost runs from the fixed endpoint to the pointer; a new line carries
  // its arrow at the dragging end, so the markers render swapped when the drag
  // starts from a target handle.
  const fixedEndIsTarget = fromHandle.type === 'target';
  const startMarker = fixedEndIsTarget ? markerEnd : undefined;
  const endMarker = fixedEndIsTarget ? undefined : markerEnd;

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
