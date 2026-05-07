import {
  Connection,
  Edge,
  FinalConnectionState,
  HandleType,
  XYPosition,
} from '@xyflow/react';
import {useCallback, useRef} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {getEventClientPosition} from '../utils/handleSnap';
import {attachEdgeToFreshAnchor} from '../utils/lineAnchors';

interface UseReconnectOptions {
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
}

// Owns the lifecycle for React Flow's edge-endpoint reconnect:
//   onReconnectStart -> onReconnect (landed on a handle)
//                    \-> onReconnectEnd (dropped on canvas; spawn an anchor)
//
// `isReconnecting` lets the caller relax connection validation while a
// reconnect is in flight.
export function useReconnect({
  setNodes,
  setEdges,
  screenToFlowPosition,
}: UseReconnectOptions) {
  const reconnectingEdgeRef = useRef<{landed: boolean} | null>(null);

  const isReconnecting = useCallback(
    () => reconnectingEdgeRef.current !== null,
    []
  );

  const handleReconnectStart = useCallback(() => {
    reconnectingEdgeRef.current = {landed: false};
  }, []);

  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (reconnectingEdgeRef.current) {
        reconnectingEdgeRef.current.landed = true;
      }
      setEdges(currentEdges =>
        currentEdges.map(currentEdge => {
          if (currentEdge.id !== oldEdge.id) {
            return currentEdge;
          }
          return {
            ...currentEdge,
            source: newConnection.source,
            target: newConnection.target,
            sourceHandle: newConnection.sourceHandle ?? undefined,
            targetHandle: newConnection.targetHandle ?? undefined,
          };
        })
      );
    },
    [setEdges]
  );

  const handleReconnectEnd = useCallback(
    (
      event: MouseEvent | TouchEvent,
      edge: Edge,
      handleType: HandleType,
      connectionState: FinalConnectionState
    ) => {
      const reconnectState = reconnectingEdgeRef.current;
      reconnectingEdgeRef.current = null;
      if (reconnectState?.landed) {
        return;
      }

      // Drop on empty canvas: spawn a fresh anchor at the pointer and
      // attach the dragged endpoint to it. Prefer the flow-coordinate
      // position React Flow already computed; fall back to the raw
      // pointer if that's missing.
      let dropPosition = connectionState.to;
      if (!dropPosition) {
        const clientPosition = getEventClientPosition(event);
        if (!clientPosition) {
          return;
        }
        dropPosition = screenToFlowPosition(clientPosition);
      }

      const {anchor, edgePatch} = attachEdgeToFreshAnchor(
        dropPosition,
        handleType
      );
      setNodes(currentNodes => [...currentNodes, anchor]);
      setEdges(currentEdges =>
        currentEdges.map(currentEdge =>
          currentEdge.id === edge.id
            ? {...currentEdge, ...edgePatch}
            : currentEdge
        )
      );
    },
    [screenToFlowPosition, setEdges, setNodes]
  );

  return {
    isReconnecting,
    handleReconnectStart,
    handleReconnect,
    handleReconnectEnd,
  };
}
