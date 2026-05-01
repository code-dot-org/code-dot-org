import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

type FlowPoint = {x: number; y: number};

interface DraggingAnchor {
  id: string;
  startPosition: FlowPoint;
}

interface DragState {
  anchors: DraggingAnchor[];
  startPointer: FlowPoint;
}

interface UseLineEdgeDragOptions {
  readOnly: boolean;
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  screenToFlowPosition: (position: {x: number; y: number}) => FlowPoint;
}

// Dragging the body of a line edge translates the line's free endpoints
// (lineAnchor nodes). Endpoints that are attached to real nodes stay put;
// the edge follows them naturally because React Flow re-routes by id. If
// both endpoints are attached, the drag is a no-op.
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
          const draggingAnchor = dragState.anchors.find(
            anchor => anchor.id === node.id
          );
          if (!draggingAnchor) {
            return node;
          }
          return {
            ...node,
            position: {
              x: draggingAnchor.startPosition.x + deltaX,
              y: draggingAnchor.startPosition.y + deltaY,
            },
          };
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
      const anchors: DraggingAnchor[] = [];
      if (sourceNode?.type === 'lineAnchor') {
        anchors.push({id: sourceNode.id, startPosition: {...sourceNode.position}});
      }
      if (targetNode?.type === 'lineAnchor') {
        anchors.push({id: targetNode.id, startPosition: {...targetNode.position}});
      }
      if (anchors.length === 0) {
        // Both endpoints attached to real nodes; nothing to drag.
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      draggingLineEdgeRef.current = {
        anchors,
        startPointer: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
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
