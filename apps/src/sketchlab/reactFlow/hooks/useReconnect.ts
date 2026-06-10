import {Connection, Edge, HandleType, XYPosition} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

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
  pushSnapshot: () => void;
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
  pushSnapshot,
}: UseReconnectOptions) {
  const reconnectingEdgeRef = useRef<{landed: boolean} | null>(null);
  // The in-flight edge is also tracked as state so the connection ghost
  // can render with its styling.
  const [reconnectingEdge, setReconnectingEdge] =
    useState<SketchlabReactFlowEdge | null>(null);

  const isReconnecting = useCallback(
    () => reconnectingEdgeRef.current !== null,
    []
  );

  // Push snapshot at drag start, before the endpoint mutation commits.
  const handleReconnectStart = useCallback(
    (_event: React.MouseEvent, edge: SketchlabReactFlowEdge) => {
      pushSnapshot();
      reconnectingEdgeRef.current = {landed: false};
      setReconnectingEdge(edge);
    },
    [pushSnapshot]
  );

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
    (event: MouseEvent | TouchEvent, edge: Edge, handleType: HandleType) => {
      const reconnectState = reconnectingEdgeRef.current;
      reconnectingEdgeRef.current = null;
      setReconnectingEdge(null);
      if (reconnectState?.landed) {
        return;
      }

      // Drop on empty canvas: spawn a fresh anchor at the pointer and
      // attach the dragged endpoint to it. The connectionState argument's
      // `to` is in container-relative screen coordinates, not flow coordinates;
      // convert the raw pointer position instead.
      const clientPosition = getEventClientPosition(event);
      if (!clientPosition) {
        return;
      }
      const dropPosition = screenToFlowPosition(clientPosition);

      // React Flow reports the type of the handle that stayed fixed during
      // the reconnect (it draws the drag as a new connection from that
      // end), so the endpoint the user dragged is the opposite side.
      const draggedSide: HandleType =
        handleType === 'source' ? 'target' : 'source';
      const {anchor, edgePatch} = attachEdgeToFreshAnchor(
        dropPosition,
        draggedSide
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
    reconnectingEdge,
    handleReconnectStart,
    handleReconnect,
    handleReconnectEnd,
  };
}
