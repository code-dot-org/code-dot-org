import {useReactFlow, type XYPosition} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {LINE_RECONNECT_SNAP_RADIUS_PX} from '../constants';
import {attachEdgeEndpoint} from '../utils/handleSnap';
import {
  findAnchorHandleSnap,
  snapEdgesIntoDraggedNode,
} from '../utils/lineAnchors';

interface UseNodeDragOptions {
  setNodes: (
    updater: (nodes: SketchlabReactFlowNode[]) => SketchlabReactFlowNode[]
  ) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
  flowToScreenPosition: (position: XYPosition) => XYPosition;
  pushSnapshot: () => void;
}

// React Flow's node drag callbacks. For ordinary nodes this just snapshots for
// undo and, on drop, snaps any free line endpoint within range onto the node's handles. For
// lineAnchor nodes it overrides the pointer-following position so the anchor
// snaps onto a nearby handle mid-drag and commits that attachment on release.
export function useNodeDrag({
  setNodes,
  setEdges,
  screenToFlowPosition,
  flowToScreenPosition,
  pushSnapshot,
}: UseNodeDragOptions) {
  const {getEdges, getNode} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();

  const [isDirectAnchorDragging, setIsDirectAnchorDragging] = useState(false);

  // Track whether this drag has produced any movement yet, so we only set
  // isDirectAnchorDragging on the first onNodeDrag (not on bare clicks).
  const anchorDragMovedRef = useRef(false);

  // The edge endpoint being pointer-dragged, captured at drag start so each
  // move can exclude the opposite endpoint and drag-stop can commit without
  // searching again.
  const draggedAnchorRef = useRef<{
    edgeId: string;
    side: 'source' | 'target';
    oppositeNodeId: string;
  } | null>(null);
  // The handle the dragged anchor most recently snapped onto, or null when it
  // sits free. Committed verbatim on drag-stop so the attachment matches the
  // preview the user saw.
  const anchorSnapTargetRef = useRef<{
    nodeId: string;
    handleId: string | null;
  } | null>(null);

  // Push snapshot when a drag begins — at this point nodesRef still holds the
  // pre-drag positions, so undo correctly restores the node to where it was
  // before the move.
  const handleNodeDragStart = useCallback(
    (_event: React.MouseEvent, node: SketchlabReactFlowNode) => {
      pushSnapshot();
      if (node.type === 'lineAnchor') {
        anchorDragMovedRef.current = false;
        anchorSnapTargetRef.current = null;
        const edge = getEdges().find(
          candidate =>
            candidate.source === node.id || candidate.target === node.id
        );
        const side = edge?.source === node.id ? 'source' : 'target';
        draggedAnchorRef.current = edge
          ? {
              edgeId: edge.id,
              side,
              oppositeNodeId: side === 'source' ? edge.target : edge.source,
            }
          : null;
      }
    },
    [pushSnapshot, getEdges]
  );

  const handleNodeDrag = useCallback(
    (_event: React.MouseEvent, node: SketchlabReactFlowNode) => {
      if (node.type !== 'lineAnchor') {
        return;
      }
      if (!anchorDragMovedRef.current) {
        anchorDragMovedRef.current = true;
        setIsDirectAnchorDragging(true);
      }
      // Override React Flow's pointer-following position so the anchor visually
      // snaps onto a nearby handle mid-drag, and remember which handle so the
      // drag-stop attaches to exactly what the user saw. Recomputing from the
      // live position each move means the anchor releases once dragged back out
      // of range.
      const context = draggedAnchorRef.current;
      const snap = findAnchorHandleSnap({
        anchorPosition: node.position,
        role: node.data.lineAnchorRole,
        excludeNodeIds: context ? [node.id, context.oppositeNodeId] : [node.id],
        radiusPx: LINE_RECONNECT_SNAP_RADIUS_PX,
        flowToScreenPosition,
        screenToFlowPosition,
      });
      anchorSnapTargetRef.current = snap
        ? {nodeId: snap.nodeId, handleId: snap.handleId}
        : null;
      if (!snap) {
        return;
      }
      setNodes(currentNodes =>
        currentNodes.map(currentNode =>
          currentNode.id === node.id
            ? {...currentNode, position: snap.position}
            : currentNode
        )
      );
    },
    [flowToScreenPosition, screenToFlowPosition, setNodes]
  );

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: SketchlabReactFlowNode) => {
      if (node.type === 'lineAnchor') {
        setIsDirectAnchorDragging(false);
        // Commit the handle the live drag last snapped onto, so the endpoint
        // attaches to exactly what the user saw rather than a freshly-searched
        // target derived from the raw pointer.
        const context = draggedAnchorRef.current;
        const target = anchorSnapTargetRef.current;
        draggedAnchorRef.current = null;
        anchorSnapTargetRef.current = null;
        if (context && target) {
          attachEdgeEndpoint({
            edgeId: context.edgeId,
            side: context.side,
            nodeId: target.nodeId,
            handleId: target.handleId,
            setEdges,
          });
        }
        return;
      }
      // A real node was dropped: attach any free line endpoint whose
      // handle lands within the snap radius of one of the node's handles.
      snapEdgesIntoDraggedNode({
        draggedNodeId: node.id,
        edges: getEdges(),
        getNode,
        flowToScreenPosition,
        setEdges,
        radiusPx: LINE_RECONNECT_SNAP_RADIUS_PX,
      });
    },
    [getEdges, getNode, flowToScreenPosition, setEdges]
  );

  return {
    isDirectAnchorDragging,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
  };
}
