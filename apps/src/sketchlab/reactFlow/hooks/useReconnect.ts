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
import {createLineAnchorAtHandle} from '../utils/lineAnchors';

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
// The other "anchor moved" path — dragging a lineAnchor node directly with
// the mouse — lives in `useAnchorMove`, which also handles the keyboard
// equivalents.
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

      const anchorRole: 'source' | 'target' =
        handleType === 'source' ? 'source' : 'target';
      const anchor = createLineAnchorAtHandle(dropPosition, anchorRole);
      const handleId = `line-anchor-${anchorRole}`;
      setNodes(currentNodes => [...currentNodes, anchor]);
      setEdges(currentEdges =>
        currentEdges.map(currentEdge => {
          if (currentEdge.id !== edge.id) {
            return currentEdge;
          }
          return handleType === 'source'
            ? {...currentEdge, source: anchor.id, sourceHandle: handleId}
            : {...currentEdge, target: anchor.id, targetHandle: handleId};
        })
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
