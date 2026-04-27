import React, {useCallback, useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {ToolbarTarget} from '../context';
import {isLineEdge} from '../utils/lineEdges';

interface UseLineToolbarOptions {
  edges: SketchlabReactFlowEdge[];
  nodes: SketchlabReactFlowNode[];
  readOnly: boolean;
  openToolbarTarget: ToolbarTarget | null;
  openToolbar: (target: ToolbarTarget, options?: {trapFocus?: boolean}) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}

export function useLineToolbar({
  edges,
  nodes,
  readOnly,
  openToolbarTarget,
  openToolbar,
  setEdges,
}: UseLineToolbarOptions) {
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: {id: string}) => {
      if (readOnly) {
        return;
      }
      const clickedEdge = edges.find(currentEdge => currentEdge.id === edge.id);
      if (clickedEdge && isLineEdge(clickedEdge, nodes)) {
        openToolbar({type: 'edge', id: clickedEdge.id}, {trapFocus: false});
      }
    },
    [readOnly, edges, nodes, openToolbar]
  );

  const openLineEdge = useMemo(() => {
    if (openToolbarTarget?.type !== 'edge') {
      return null;
    }
    const edge = edges.find(
      currentEdge => currentEdge.id === openToolbarTarget.id
    );
    if (!edge || !isLineEdge(edge, nodes)) {
      return null;
    }
    return edge;
  }, [openToolbarTarget, edges, nodes]);

  const setLineEdgeColor = useCallback(
    (edgeId: string, strokeColor: string) => {
      setEdges(currentEdges =>
        currentEdges.map(edge =>
          edge.id === edgeId
            ? {
                ...edge,
                style: {...edge.style, stroke: strokeColor},
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  return {handleEdgeClick, openLineEdge, setLineEdgeColor};
}
