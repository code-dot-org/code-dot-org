import {useReactFlow, type XYPosition} from '@xyflow/react';
import {useCallback} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {snapEdgeEndpointToHandle} from '../utils/handleSnap';

interface UseAnchorMoveOptions {
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}

// Helper for snapping a line anchor to a real node handle when it has moved close enough.
export function useAnchorMove({setEdges}: UseAnchorMoveOptions) {
  const {getEdges} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();

  const attemptAnchorSnap = useCallback(
    ({
      anchorId,
      screenPoint,
      radiusPx,
    }: {
      anchorId: string;
      screenPoint: XYPosition;
      radiusPx: number;
    }): string | null => {
      const associatedEdge = getEdges().find(
        edge => edge.source === anchorId || edge.target === anchorId
      );
      if (!associatedEdge) return null;
      const isSourceSide = associatedEdge.source === anchorId;
      const snapped = snapEdgeEndpointToHandle({
        edgeId: associatedEdge.id,
        excludeNodeId: anchorId,
        side: isSourceSide ? 'source' : 'target',
        screenPoint,
        radiusPx,
        setEdges,
      });
      return snapped ? associatedEdge.id : null;
    },
    [getEdges, setEdges]
  );

  return {attemptAnchorSnap};
}
