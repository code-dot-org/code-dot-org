import {MarkerType} from '@xyflow/react';
import React, {useCallback, useMemo} from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {ARROW_MARKER_HEIGHT_PX, ARROW_MARKER_WIDTH_PX} from '../constants';
import {ToolbarTarget} from '../context';
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
  LineStrokeStyleValue,
  strokeDasharrayFromStyle,
} from '../elementToolbars/toolbarPalettes';
import {ArrowHeadValue} from '../types';

interface UseLineToolbarOptions {
  edges: SketchlabReactFlowEdge[];
  openToolbarTarget: ToolbarTarget | null;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}

export function useLineToolbar({
  edges,
  openToolbarTarget,
  setEdges,
}: UseLineToolbarOptions) {
  const updateLineEdge = useCallback(
    (
      edgeId: string,
      updater: (edge: SketchlabReactFlowEdge) => SketchlabReactFlowEdge
    ) => {
      setEdges(currentEdges =>
        currentEdges.map(edge => {
          if (edge.id !== edgeId) {
            return edge;
          }
          if (edge.data?.locked === true) {
            return edge;
          }
          return updater(edge);
        })
      );
    },
    [setEdges]
  );

  const updateLineEdgeLockState = useCallback(
    (edgeId: string, locked: boolean) => {
      setEdges(currentEdges =>
        currentEdges.map(edge => {
          if (edge.id !== edgeId) {
            return edge;
          }
          return {
            ...edge,
            data: {
              ...(edge.data || {}),
              locked,
            },
          };
        })
      );
    },
    [setEdges]
  );

  const openLineEdge = useMemo(() => {
    if (openToolbarTarget?.type !== 'edge') {
      return null;
    }
    return (
      edges.find(currentEdge => currentEdge.id === openToolbarTarget.id) ?? null
    );
  }, [openToolbarTarget, edges]);

  const updateLineEdgeStyle = useCallback(
    (
      edgeId: string,
      updateStyle: (currentStyle: React.CSSProperties) => React.CSSProperties
    ) => {
      updateLineEdge(edgeId, edge => {
        const currentStyle = {...edge.style};
        return {
          ...edge,
          style: updateStyle(currentStyle),
        };
      });
    },
    [updateLineEdge]
  );

  const updateLineEdgeMarker = useCallback(
    (edgeId: string, markerPatch: {color?: string; strokeWidth?: number}) => {
      updateLineEdge(edgeId, edge => {
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
      });
    },
    [updateLineEdge]
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
      updateLineEdge(edgeId, edge => {
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
            arrowHeads === 'end' || arrowHeads === 'both' ? marker : undefined,
        };
      });
    },
    [updateLineEdge]
  );

  const setLineEdgeLocked = useCallback(
    (edgeId: string, locked: boolean) => {
      updateLineEdgeLockState(edgeId, locked);
    },
    [updateLineEdgeLockState]
  );

  return {
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeArrowHeads,
    setLineEdgeLocked,
  };
}
