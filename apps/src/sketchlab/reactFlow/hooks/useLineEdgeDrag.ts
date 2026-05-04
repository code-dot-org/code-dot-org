import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect, useRef} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  LINE_ANCHOR_SIZE_PX,
  LINE_RECONNECT_SNAP_RADIUS_PX,
} from '../constants';
import {findNearestHandle} from '../utils/handleSnap';
import {
  createLineAnchorAtHandle,
  getHandleFlowPosition,
} from '../utils/lineAnchors';

type FlowPoint = {x: number; y: number};

interface DraggingAnchor {
  id: string;
  side: 'source' | 'target';
  startPosition: FlowPoint;
}

interface PendingDetach {
  side: 'source' | 'target';
  flowPosition: FlowPoint;
}

interface DragState {
  edgeId: string;
  anchors: DraggingAnchor[];
  pendingDetaches: PendingDetach[];
  startPointer: FlowPoint;
  hasMoved: boolean;
}

interface UseLineEdgeDragOptions {
  readOnly: boolean;
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  screenToFlowPosition: (position: {x: number; y: number}) => FlowPoint;
  flowToScreenPosition: (position: {x: number; y: number}) => FlowPoint;
}

// Dragging the body of a line edge translates the line as a whole. Free
// endpoints (lineAnchor nodes) follow the pointer directly. Attached
// endpoints (real nodes) get detached on first move — we spawn a fresh
// anchor at the current handle position, rewrite the edge to point at it,
// and treat it like any other dragging anchor from then on. This is the
// inverse of the snap-on-drop attach. If neither endpoint is attached and
// neither is an anchor, the drag is a no-op.
export function useLineEdgeDrag({
  readOnly,
  setNodes,
  setEdges,
  screenToFlowPosition,
  flowToScreenPosition,
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

      // First-move detach: materialize fresh anchors at any attached
      // endpoint, splice them into the edge, and add them to the dragging
      // set. We do this here (not on mousedown) so a click-without-drag
      // doesn't detach the line.
      if (!dragState.hasMoved && dragState.pendingDetaches.length > 0) {
        const newAnchors: SketchlabReactFlowNode[] = [];
        const edgePatch: Partial<SketchlabReactFlowEdge> = {};
        dragState.pendingDetaches.forEach(pending => {
          const anchor = createLineAnchorAtHandle(
            pending.flowPosition,
            pending.side
          );
          newAnchors.push(anchor);
          if (pending.side === 'source') {
            edgePatch.source = anchor.id;
            edgePatch.sourceHandle = 'line-anchor-source';
          } else {
            edgePatch.target = anchor.id;
            edgePatch.targetHandle = 'line-anchor-target';
          }
          dragState.anchors.push({
            id: anchor.id,
            side: pending.side,
            startPosition: {...anchor.position},
          });
        });
        setNodes(currentNodes => [...currentNodes, ...newAnchors]);
        setEdges(currentEdges =>
          currentEdges.map(currentEdge =>
            currentEdge.id === dragState.edgeId
              ? {...currentEdge, ...edgePatch}
              : currentEdge
          )
        );
        dragState.pendingDetaches = [];
      }
      dragState.hasMoved = true;

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
    [screenToFlowPosition, setNodes, setEdges]
  );

  const stopLineEdgeDrag = useCallback(
    (event?: MouseEvent) => {
      const dragState = draggingLineEdgeRef.current;
      draggingLineEdgeRef.current = null;
      window.removeEventListener('mousemove', handleLineEdgeMouseMove);
      window.removeEventListener('mouseup', stopLineEdgeDrag);

      // Snap-on-release: for each anchor that moved during the drag, check
      // whether its handle ended up close enough to a real-node handle to
      // attach. We compute each anchor's final flow position from the drag
      // delta, project the anchor's Handle (offset within the 10×10 box)
      // to screen space, and look up the nearest matching handle. The
      // orphan-prune effect then removes the anchor since no edge points
      // at it anymore.
      if (!dragState || !dragState.hasMoved || !event) {
        return;
      }
      const finalPointer = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const deltaX = finalPointer.x - dragState.startPointer.x;
      const deltaY = finalPointer.y - dragState.startPointer.y;

      const edgePatch: Partial<SketchlabReactFlowEdge> = {};
      dragState.anchors.forEach(anchor => {
        const finalPosition: FlowPoint = {
          x: anchor.startPosition.x + deltaX,
          y: anchor.startPosition.y + deltaY,
        };
        const handleFlowPosition: FlowPoint =
          anchor.side === 'source'
            ? {
                x: finalPosition.x + LINE_ANCHOR_SIZE_PX,
                y: finalPosition.y + LINE_ANCHOR_SIZE_PX / 2,
              }
            : {
                x: finalPosition.x,
                y: finalPosition.y + LINE_ANCHOR_SIZE_PX / 2,
              };
        const handleScreen = flowToScreenPosition(handleFlowPosition);
        const snap = findNearestHandle(
          handleScreen,
          anchor.id,
          anchor.side,
          LINE_RECONNECT_SNAP_RADIUS_PX
        );
        if (!snap) {
          return;
        }
        if (anchor.side === 'source') {
          edgePatch.source = snap.nodeId;
          edgePatch.sourceHandle = snap.handleId ?? undefined;
        } else {
          edgePatch.target = snap.nodeId;
          edgePatch.targetHandle = snap.handleId ?? undefined;
        }
      });

      if (Object.keys(edgePatch).length > 0) {
        setEdges(currentEdges =>
          currentEdges.map(currentEdge =>
            currentEdge.id === dragState.edgeId
              ? {...currentEdge, ...edgePatch}
              : currentEdge
          )
        );
      }
    },
    [
      handleLineEdgeMouseMove,
      screenToFlowPosition,
      flowToScreenPosition,
      setEdges,
    ]
  );

  const handleEdgeMouseDown = useCallback(
    (event: React.MouseEvent, edge: SketchlabReactFlowEdge) => {
      if (readOnly || event.button !== 0) {
        return;
      }

      const sourceNode = getNode(edge.source);
      const targetNode = getNode(edge.target);
      const anchors: DraggingAnchor[] = [];
      const pendingDetaches: PendingDetach[] = [];

      if (sourceNode?.type === 'lineAnchor') {
        anchors.push({
          id: sourceNode.id,
          side: 'source',
          startPosition: {...sourceNode.position},
        });
      } else if (sourceNode) {
        const handlePos = getHandleFlowPosition(
          edge.source,
          edge.sourceHandle,
          screenToFlowPosition
        );
        if (handlePos) {
          pendingDetaches.push({side: 'source', flowPosition: handlePos});
        }
      }
      if (targetNode?.type === 'lineAnchor') {
        anchors.push({
          id: targetNode.id,
          side: 'target',
          startPosition: {...targetNode.position},
        });
      } else if (targetNode) {
        const handlePos = getHandleFlowPosition(
          edge.target,
          edge.targetHandle,
          screenToFlowPosition
        );
        if (handlePos) {
          pendingDetaches.push({side: 'target', flowPosition: handlePos});
        }
      }
      if (anchors.length === 0 && pendingDetaches.length === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      draggingLineEdgeRef.current = {
        edgeId: edge.id,
        anchors,
        pendingDetaches,
        startPointer: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        hasMoved: false,
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
