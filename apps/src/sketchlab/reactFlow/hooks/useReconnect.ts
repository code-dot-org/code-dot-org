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
  const reconnectRef = useRef<{
    edge: SketchlabReactFlowEdge;
    landed: boolean;
  } | null>(null);
  // Render mirror of the in-flight edge so the connection ghost can render
  // with its styling.
  const [reconnectingEdge, setReconnectingEdge] =
    useState<SketchlabReactFlowEdge | null>(null);

  const beginReconnect = useCallback((edge: SketchlabReactFlowEdge) => {
    reconnectRef.current = {edge, landed: false};
    setReconnectingEdge(edge);
  }, []);

  // Clears the in-flight reconnect and returns its final state.
  const endReconnect = useCallback(() => {
    const finished = reconnectRef.current;
    reconnectRef.current = null;
    setReconnectingEdge(null);
    return finished;
  }, []);

  const isReconnecting = useCallback(() => reconnectRef.current !== null, []);

  // Push snapshot at drag start, before the endpoint mutation commits.
  const handleReconnectStart = useCallback(
    (_event: React.MouseEvent, edge: SketchlabReactFlowEdge) => {
      pushSnapshot();
      beginReconnect(edge);
    },
    [pushSnapshot, beginReconnect]
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (reconnectRef.current) {
        reconnectRef.current.landed = true;
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
      const finished = endReconnect();
      if (finished?.landed) {
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
    [endReconnect, screenToFlowPosition, setEdges, setNodes]
  );

  return {
    isReconnecting,
    reconnectingEdge,
    handleReconnectStart,
    handleReconnect,
    handleReconnectEnd,
  };
}
