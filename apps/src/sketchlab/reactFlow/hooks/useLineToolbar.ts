import React, {useCallback, useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {ToolbarTarget} from '../context';
import {
  LineStrokeStyleValue,
  strokeDasharrayFromStyle,
} from '../elementToolbars/toolbarPalettes';
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

  const updateLineEdgeStyle = useCallback(
    (
      edgeId: string,
      updateStyle: (currentStyle: React.CSSProperties) => React.CSSProperties
    ) => {
      setEdges(currentEdges =>
        currentEdges.map(edge => {
          if (edge.id !== edgeId) {
            return edge;
          }
          const currentStyle = {...edge.style};
          return {
            ...edge,
            style: updateStyle(currentStyle),
          };
        })
      );
    },
    [setEdges]
  );

  const updateLineEdgeMarker = useCallback(
    (edgeId: string, markerPatch: {color?: string; strokeWidth?: number}) => {
      setEdges(currentEdges =>
        currentEdges.map(edge => {
          if (edge.id !== edgeId) {
            return edge;
          }
          const markerEnd =
            edge.markerEnd && typeof edge.markerEnd !== 'string'
              ? edge.markerEnd
              : undefined;
          return {
            ...edge,
            ...(markerEnd
              ? {
                  markerEnd: {
                    ...markerEnd,
                    ...markerPatch,
                  },
                }
              : {}),
          };
        })
      );
    },
    [setEdges]
  );

  const setLineEdgeColor = useCallback(
    (edgeId: string, strokeColor: string) => {
      updateLineEdgeStyle(edgeId, currentStyle => ({
        ...currentStyle,
        stroke: strokeColor,
      }));
      updateLineEdgeMarker(edgeId, {color: strokeColor});
    },
    [updateLineEdgeStyle, updateLineEdgeMarker]
  );

  const setLineEdgeWidth = useCallback(
    (edgeId: string, strokeWidth: number) => {
      updateLineEdgeStyle(edgeId, currentStyle => ({
        ...currentStyle,
        strokeWidth,
      }));
      updateLineEdgeMarker(edgeId, {strokeWidth});
    },
    [updateLineEdgeStyle, updateLineEdgeMarker]
  );

  const setLineEdgeStrokeStyle = useCallback(
    (edgeId: string, strokeStyle: LineStrokeStyleValue) => {
      const strokeDasharray = strokeDasharrayFromStyle(strokeStyle);
      updateLineEdgeStyle(edgeId, currentStyle => {
        if (!strokeDasharray) {
          const styleWithoutDasharray = {...currentStyle};
          delete styleWithoutDasharray.strokeDasharray;
          return styleWithoutDasharray;
        }
        return {...currentStyle, strokeDasharray};
      });
    },
    [updateLineEdgeStyle]
  );

  return {
    handleEdgeClick,
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
  };
}
