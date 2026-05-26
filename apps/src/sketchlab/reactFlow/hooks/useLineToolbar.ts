import {MarkerType} from '@xyflow/react';
import React, {useCallback, useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  ARROW_MARKER_HEIGHT_PX,
  ARROW_MARKER_WIDTH_PX,
  DEFAULT_ROTATION,
} from '../constants';
import {ToolbarTarget} from '../context';
import {
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
  EdgeTypeValue,
  LineStrokeStyleValue,
  strokeDasharrayFromStyle,
} from '../elementToolbars/toolbarPalettes';
import {ArrowHeadValue} from '../types';
import {anchorHandleFlowPosition} from '../utils/lineAnchors';

const LINE_ANCHOR_SIZE_PX = 10;

function rotatePoint(
  point: {x: number; y: number},
  center: {x: number; y: number},
  radians: number
) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

interface UseLineToolbarOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  openToolbarTarget: ToolbarTarget | null;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  pushSnapshot: () => void;
}

export function useLineToolbar({
  nodes,
  edges,
  setNodes,
  openToolbarTarget,
  setEdges,
  pushSnapshot,
}: UseLineToolbarOptions) {
  const updateLineEdge = useCallback(
    (
      edgeId: string,
      updater: (edge: SketchlabReactFlowEdge) => SketchlabReactFlowEdge
    ) => {
      pushSnapshot();
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
    [pushSnapshot, setEdges]
  );

  const updateLineEdgeLockState = useCallback(
    (edgeId: string, locked: boolean) => {
      pushSnapshot();
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
    [pushSnapshot, setEdges]
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

  const setLineEdgeColor = useCallback(
    (edgeId: string, strokeColor: string) => {
      updateLineEdge(edgeId, edge => {
        const markerStart =
          edge.markerStart && typeof edge.markerStart !== 'string'
            ? {...edge.markerStart, color: strokeColor}
            : edge.markerStart;
        const markerEnd =
          edge.markerEnd && typeof edge.markerEnd !== 'string'
            ? {...edge.markerEnd, color: strokeColor}
            : edge.markerEnd;
        return {
          ...edge,
          style: {...edge.style, stroke: strokeColor},
          markerStart,
          markerEnd,
        };
      });
    },
    [updateLineEdge]
  );

  const setLineEdgeWidth = useCallback(
    (edgeId: string, strokeWidth: number) => {
      updateLineEdge(edgeId, edge => {
        const markerStart =
          edge.markerStart && typeof edge.markerStart !== 'string'
            ? {...edge.markerStart, strokeWidth}
            : edge.markerStart;
        const markerEnd =
          edge.markerEnd && typeof edge.markerEnd !== 'string'
            ? {...edge.markerEnd, strokeWidth}
            : edge.markerEnd;
        return {
          ...edge,
          style: {...edge.style, strokeWidth},
          markerStart,
          markerEnd,
        };
      });
    },
    [updateLineEdge]
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

  const setLineEdgeType = useCallback(
    (edgeId: string, edgeType: EdgeTypeValue) => {
      updateLineEdge(edgeId, edge => ({...edge, type: edgeType}));
    },
    [updateLineEdge]
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

  const setLineEdgeRotation = useCallback(
    (edgeId: string, rotation: number) => {
      updateLineEdge(edgeId, edge => {
        const currentRotation = edge.data?.rotation ?? DEFAULT_ROTATION;
        const deltaRadians = ((rotation - currentRotation) * Math.PI) / 180;
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        const bothEndpointsAreAnchors =
          sourceNode?.type === 'lineAnchor' &&
          targetNode?.type === 'lineAnchor';
        const style = {...edge.style};
        if (bothEndpointsAreAnchors) {
          const sourceHandle = anchorHandleFlowPosition(
            sourceNode.position,
            'source'
          );
          const targetHandle = anchorHandleFlowPosition(
            targetNode.position,
            'target'
          );
          const center = {
            x: (sourceHandle.x + targetHandle.x) / 2,
            y: (sourceHandle.y + targetHandle.y) / 2,
          };
          const rotatedSourceHandle = rotatePoint(
            sourceHandle,
            center,
            deltaRadians
          );
          const rotatedTargetHandle = rotatePoint(
            targetHandle,
            center,
            deltaRadians
          );
          setNodes(currentNodes =>
            currentNodes.map(node => {
              if (node.id === sourceNode.id) {
                return {
                  ...node,
                  position: {
                    x: rotatedSourceHandle.x - LINE_ANCHOR_SIZE_PX,
                    y: rotatedSourceHandle.y - LINE_ANCHOR_SIZE_PX / 2,
                  },
                };
              }
              if (node.id === targetNode.id) {
                return {
                  ...node,
                  position: {
                    x: rotatedTargetHandle.x,
                    y: rotatedTargetHandle.y - LINE_ANCHOR_SIZE_PX / 2,
                  },
                };
              }
              return node;
            })
          );
          delete style.transform;
          delete style.transformBox;
          delete style.transformOrigin;
        } else if (rotation === DEFAULT_ROTATION) {
          delete style.transform;
          delete style.transformBox;
          delete style.transformOrigin;
        } else {
          style.transform = `rotate(${rotation}deg)`;
          style.transformBox = 'fill-box';
          style.transformOrigin = 'center';
        }

        return {
          ...edge,
          data: {
            ...(edge.data || {}),
            rotation,
          },
          style,
        };
      });
    },
    [nodes, setNodes, updateLineEdge]
  );

  return {
    openLineEdge,
    setLineEdgeColor,
    setLineEdgeWidth,
    setLineEdgeStrokeStyle,
    setLineEdgeType,
    setLineEdgeArrowHeads,
    setLineEdgeRotation,
    setLineEdgeLocked,
  };
}
