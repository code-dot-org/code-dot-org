import {MarkerType} from '@xyflow/react';
import React, {useCallback, useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {ARROW_MARKER_HEIGHT_PX, ARROW_MARKER_WIDTH_PX} from '../constants';
import {ToolbarTarget} from '../context';
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
  LineStrokeStyleValue,
  strokeDasharrayFromStyle,
} from '../elementToolbars/toolbarPalettes';
import {isLineEdge} from '../utils/lineEdges';

type ArrowHeadValue = 'start' | 'end' | 'both';

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
          if (edge.data?.locked === true) {
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

  const updateLineEdgeData = useCallback(
    (
      edgeId: string,
      updateData: (
        currentData: NonNullable<SketchlabReactFlowEdge['data']>
      ) => NonNullable<SketchlabReactFlowEdge['data']>
    ) => {
      setEdges(currentEdges =>
        currentEdges.map(edge => {
          if (edge.id !== edgeId) {
            return edge;
          }
          const currentData = {...(edge.data || {})};
          return {
            ...edge,
            data: updateData(currentData),
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
          if (edge.data?.locked === true) {
            return edge;
          }
          const markerStart =
            edge.markerStart && typeof edge.markerStart !== 'string'
              ? edge.markerStart
              : undefined;
          const markerEnd =
            edge.markerEnd && typeof edge.markerEnd !== 'string'
              ? edge.markerEnd
              : undefined;
          return {
            ...edge,
            ...(markerStart
              ? {
                  markerStart: {
                    ...markerStart,
                    ...markerPatch,
                  },
                }
              : {}),
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

  const setLineEdgeArrowHeads = useCallback(
    (edgeId: string, arrowHeads: ArrowHeadValue) => {
      setEdges(currentEdges =>
        currentEdges.map(edge => {
          if (edge.id !== edgeId) {
            return edge;
          }
          if (edge.data?.locked === true) {
            return edge;
          }

          const strokeColor =
            typeof edge.style?.stroke === 'string'
              ? edge.style.stroke
              : DEFAULT_STROKE_COLOR;
          const strokeWidth = Number(edge.style?.strokeWidth);
          const markerStrokeWidth = Number.isFinite(strokeWidth)
            ? strokeWidth
            : DEFAULT_LINE_WIDTH;
          const marker = {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: ARROW_MARKER_WIDTH_PX,
            height: ARROW_MARKER_HEIGHT_PX,
            strokeWidth: markerStrokeWidth,
          };

          return {
            ...edge,
            markerStart:
              arrowHeads === 'start' || arrowHeads === 'both'
                ? marker
                : undefined,
            markerEnd:
              arrowHeads === 'end' || arrowHeads === 'both'
                ? marker
                : undefined,
          };
        })
      );
    },
    [setEdges]
  );

  const setLineEdgeLocked = useCallback(
    (edgeId: string, locked: boolean) => {
      updateLineEdgeData(edgeId, currentData => ({
        ...currentData,
        locked,
      }));
    },
    [updateLineEdgeData]
  );

  return {
    handleEdgeClick,
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
    setLineEdgeLocked,
  };
}
