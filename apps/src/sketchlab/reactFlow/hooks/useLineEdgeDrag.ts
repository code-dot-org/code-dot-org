import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

type FlowPoint = {x: number; y: number};

interface DragState {
  sourceId: string;
  targetId: string;
  startPointer: FlowPoint;
  startSourcePosition: FlowPoint;
  startTargetPosition: FlowPoint;
}

interface UseLineEdgeDragOptions {
  readOnly: boolean;
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  screenToFlowPosition: (position: {x: number; y: number}) => FlowPoint;
}

// This hook enables moving both endpoints of a line edge simultaneously by dragging the edge itself.
export function useLineEdgeDrag({
  readOnly,
  setNodes,
  screenToFlowPosition,
}: UseLineEdgeDragOptions) {
  const {getNode} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();
  const draggingLineEdgeRef = useRef<DragState | null>(null);

  const handleLineEdgeMouseMove = useCallback(
    (event: MouseEvent) => {
      const dragState = draggingLineEdgeRef.current;
      if (!dragState) {
        return;
      }

      const currentPointer = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const deltaX = currentPointer.x - dragState.startPointer.x;
      const deltaY = currentPointer.y - dragState.startPointer.y;

      setNodes(currentNodes =>
        currentNodes.map(node => {
          if (node.id === dragState.sourceId) {
            return {
              ...node,
              position: {
                x: dragState.startSourcePosition.x + deltaX,
                y: dragState.startSourcePosition.y + deltaY,
              },
            };
          }
          if (node.id === dragState.targetId) {
            return {
              ...node,
              position: {
                x: dragState.startTargetPosition.x + deltaX,
                y: dragState.startTargetPosition.y + deltaY,
              },
            };
          }
          return node;
        })
      );
    },
    [screenToFlowPosition, setNodes]
  );

  const stopLineEdgeDrag = useCallback(() => {
    draggingLineEdgeRef.current = null;
    window.removeEventListener('mousemove', handleLineEdgeMouseMove);
    window.removeEventListener('mouseup', stopLineEdgeDrag);
  }, [handleLineEdgeMouseMove]);

  const handleEdgeMouseDown = useCallback(
    (event: React.MouseEvent, edge: SketchlabReactFlowEdge) => {
      if (readOnly || event.button !== 0) {
        return;
      }

      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);
      const isLineEdge =
        sourceNode?.type === 'lineAnchor' && targetNode?.type === 'lineAnchor';
      if (!sourceNode || !targetNode || !isLineEdge) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      draggingLineEdgeRef.current = {
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        startPointer: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        startSourcePosition: {...sourceNode.position},
        startTargetPosition: {...targetNode.position},
      };

      window.addEventListener('mousemove', handleLineEdgeMouseMove);
      window.addEventListener('mouseup', stopLineEdgeDrag);
    },
    [
      readOnly,
      getNode,
      screenToFlowPosition,
      handleLineEdgeMouseMove,
      stopLineEdgeDrag,
    ]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleLineEdgeMouseMove);
      window.removeEventListener('mouseup', stopLineEdgeDrag);
    };
  }, [handleLineEdgeMouseMove, stopLineEdgeDrag]);

  return {handleEdgeMouseDown};
}
