import {
  Connection,
  Edge,
  FinalConnectionState,
  HandleType,
  XYPosition,
} from '@xyflow/react';
import React, {useCallback, useRef} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {LINE_RECONNECT_SNAP_RADIUS_PX} from '../constants';
import {findNearestHandle} from '../utils/handleSnap';
import {createLineAnchorAtHandle} from '../utils/lineAnchors';

interface UseReconnectOptions {
  edges: SketchlabReactFlowEdge[];
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
}

// Owns the lifecycle for moving an edge endpoint onto a node handle. Two
// entry points feed into the same outcome:
//   - React Flow's edge-endpoint handle:
//       onReconnectStart -> onReconnect (landed)
//                        \-> onReconnectEnd (canvas drop spawns an anchor)
//   - Dragging a lineAnchor node directly: onNodeDragStop snaps it onto a
//     nearby real-node handle, and the orphan-prune effect drops the now-
//     unused anchor.
//
// `isReconnecting` lets the caller relax connection validation while a
// reconnect is in flight — line anchor to real node connections are blocked
// for fresh connections.
export function useReconnect({
  edges,
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
        const clientPoint =
          event instanceof MouseEvent
            ? {x: event.clientX, y: event.clientY}
            : (() => {
                const touch =
                  event.changedTouches[0] ?? event.touches[0] ?? null;
                return touch ? {x: touch.clientX, y: touch.clientY} : null;
              })();
        if (!clientPoint) {
          return;
        }
        dropPosition = screenToFlowPosition(clientPoint);
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

  // Snap a line endpoint onto a real node's handle when the user drops the
  // anchor close enough. We look at where the pointer landed in screen
  // space and find the nearest matching handle on a non-anchor node within
  // the snap radius. The orphaned anchor is removed by the prune effect.
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent | MouseEvent, node: SketchlabReactFlowNode) => {
      if (node.type !== 'lineAnchor') {
        return;
      }
      const associatedEdge = edges.find(
        edge => edge.source === node.id || edge.target === node.id
      );
      if (!associatedEdge) {
        return;
      }
      const isSourceSide = associatedEdge.source === node.id;
      const requiredHandleType: 'source' | 'target' = isSourceSide
        ? 'source'
        : 'target';

      const snapTarget = findNearestHandle(
        {x: event.clientX, y: event.clientY},
        node.id,
        requiredHandleType,
        LINE_RECONNECT_SNAP_RADIUS_PX
      );
      if (!snapTarget) {
        return;
      }

      setEdges(currentEdges =>
        currentEdges.map(currentEdge => {
          if (currentEdge.id !== associatedEdge.id) {
            return currentEdge;
          }
          if (isSourceSide) {
            return {
              ...currentEdge,
              source: snapTarget.nodeId,
              sourceHandle: snapTarget.handleId ?? undefined,
            };
          }
          return {
            ...currentEdge,
            target: snapTarget.nodeId,
            targetHandle: snapTarget.handleId ?? undefined,
          };
        })
      );
    },
    [edges, setEdges]
  );

  return {
    isReconnecting,
    handleReconnectStart,
    handleReconnect,
    handleReconnectEnd,
    handleNodeDragStop,
  };
}
