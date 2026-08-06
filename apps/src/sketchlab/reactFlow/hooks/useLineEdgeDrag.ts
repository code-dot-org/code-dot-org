import {useReactFlow, type XYPosition} from '@xyflow/react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {LINE_RECONNECT_SNAP_RADIUS_PX} from '../constants';
import {getSelectionMoveIds} from '../utils/grouping';
import {attachEdgeEndpoint} from '../utils/handleSnap';
import {
  attachEdgeToFreshAnchor,
  findAnchorHandleSnap,
  getStandaloneLineAnchorIds,
  resolveEdgeEndpoint,
} from '../utils/lineAnchors';

interface DraggingAnchor {
  id: string;
  side: 'source' | 'target';
  startPosition: XYPosition;
  currentPosition: XYPosition;
  // Handle this anchor most recently snapped onto, if it is currently snapped.
  snapTarget: {nodeId: string; handleId: string | null} | null;
}

interface PendingDetach {
  side: 'source' | 'target';
  flowPosition: XYPosition;
}

interface DragState {
  edgeId: string;
  anchors: DraggingAnchor[];
  pendingDetaches: PendingDetach[];
  startPointer: XYPosition;
  hasMoved: boolean;
}

// A whole-selection drag started from the body of a line inside it.
interface SelectionDragState {
  startPositions: Map<string, XYPosition>;
  startPointer: XYPosition;
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
  screenToFlowPosition: (position: XYPosition) => XYPosition;
  flowToScreenPosition: (position: XYPosition) => XYPosition;
  pushSnapshot: () => void;
  multiSelectedNodeIds: ReadonlySet<string>;
}

// Dragging the body of a line edge moves the line as a whole. Free
// endpoints (lineAnchor nodes) follow the pointer directly. Attached
// endpoints (real nodes) get detached on first move; we spawn a fresh
// anchor at the current handle position, rewrite the edge to point at it,
// and treat it like any other dragging anchor from then on.
//
// When the line is part of a multi-selection the drag translates the whole
// selection instead, matching React Flow's behavior for a selected node.
export function useLineEdgeDrag({
  readOnly,
  setNodes,
  setEdges,
  screenToFlowPosition,
  flowToScreenPosition,
  pushSnapshot,
  multiSelectedNodeIds,
}: UseLineEdgeDragOptions) {
  const {getNode, getNodes} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();
  const draggingLineEdgeRef = useRef<DragState | null>(null);
  const draggingSelectionRef = useRef<SelectionDragState | null>(null);
  const [isLineDragging, setIsLineDragging] = useState(false);

  // Suppresses the click on the line that follows the mouseup ending a
  // selection drag, which would otherwise clear the selection just moved.
  const completedSelectionDragRef = useRef(false);

  const consumeSelectionDragClick = useCallback(() => {
    const completed = completedSelectionDragRef.current;
    completedSelectionDragRef.current = false;
    return completed;
  }, []);

  const handleLineEdgeMouseMove = useCallback(
    (event: MouseEvent) => {
      const dragState = draggingLineEdgeRef.current;
      if (!dragState) {
        return;
      }

      // Push the undo snapshot on the first move, before any mutation, so
      // a bare click on the line doesn't create a history entry.
      if (!dragState.hasMoved) {
        pushSnapshot();
      }

      // On detach, create fresh anchors at any attached endpoint
      // and add them to the dragging set.
      if (!dragState.hasMoved && dragState.pendingDetaches.length > 0) {
        const newAnchors: SketchlabReactFlowNode[] = [];
        const combinedPatch: Partial<SketchlabReactFlowEdge> = {};
        dragState.pendingDetaches.forEach(pending => {
          const {anchor, edgePatch} = attachEdgeToFreshAnchor(
            pending.flowPosition,
            pending.side
          );
          newAnchors.push(anchor);
          Object.assign(combinedPatch, edgePatch);
          dragState.anchors.push({
            id: anchor.id,
            side: pending.side,
            startPosition: {...anchor.position},
            currentPosition: {...anchor.position},
            snapTarget: null,
          });
        });
        setNodes(currentNodes => [...currentNodes, ...newAnchors]);
        setEdges(currentEdges =>
          currentEdges.map(currentEdge =>
            currentEdge.id === dragState.edgeId
              ? {...currentEdge, ...combinedPatch}
              : currentEdge
          )
        );
        dragState.pendingDetaches = [];
      }
      if (!dragState.hasMoved) {
        setIsLineDragging(true);
      }
      dragState.hasMoved = true;

      const currentPointer = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const deltaX = currentPointer.x - dragState.startPointer.x;
      const deltaY = currentPointer.y - dragState.startPointer.y;

      // Snap each dragging anchor onto a nearby handle, falling back to the raw
      // pointer-following position when nothing is close, and remember the
      // handle so stop can attach to exactly what was previewed.
      dragState.anchors.forEach(anchor => {
        const rawPosition = {
          x: anchor.startPosition.x + deltaX,
          y: anchor.startPosition.y + deltaY,
        };
        const snap = findAnchorHandleSnap({
          anchorPosition: rawPosition,
          role: anchor.side,
          excludeNodeIds: [anchor.id],
          radiusPx: LINE_RECONNECT_SNAP_RADIUS_PX,
          flowToScreenPosition,
          screenToFlowPosition,
        });
        anchor.snapTarget = snap
          ? {nodeId: snap.nodeId, handleId: snap.handleId}
          : null;
        anchor.currentPosition = snap ? snap.position : rawPosition;
      });

      setNodes(currentNodes =>
        currentNodes.map(node => {
          const draggingAnchor = dragState.anchors.find(
            anchor => anchor.id === node.id
          );
          return draggingAnchor
            ? {...node, position: draggingAnchor.currentPosition}
            : node;
        })
      );
    },
    [
      screenToFlowPosition,
      flowToScreenPosition,
      setNodes,
      setEdges,
      pushSnapshot,
    ]
  );

  const stopLineEdgeDrag = useCallback(
    (event?: MouseEvent) => {
      const dragState = draggingLineEdgeRef.current;
      draggingLineEdgeRef.current = null;
      setIsLineDragging(false);
      window.removeEventListener('mousemove', handleLineEdgeMouseMove);
      window.removeEventListener('mouseup', stopLineEdgeDrag);

      // Attach any anchor that ended the drag snapped onto a real-node handle,
      // committing the handle the move already found.
      if (!dragState || !dragState.hasMoved) {
        return;
      }
      dragState.anchors.forEach(anchor => {
        if (!anchor.snapTarget) {
          return;
        }
        attachEdgeEndpoint({
          edgeId: dragState.edgeId,
          side: anchor.side,
          nodeId: anchor.snapTarget.nodeId,
          handleId: anchor.snapTarget.handleId,
          setEdges,
        });
      });
    },
    [handleLineEdgeMouseMove, setEdges]
  );

  // No endpoint snapping: a selection moves as a rigid body, so a line inside
  // it shouldn't reattach to whatever it passes over.
  const handleSelectionMouseMove = useCallback(
    (event: MouseEvent) => {
      const dragState = draggingSelectionRef.current;
      if (!dragState) {
        return;
      }
      // Snapshot before the first mutation so a bare click doesn't create a
      // history entry.
      if (!dragState.hasMoved) {
        pushSnapshot();
        dragState.hasMoved = true;
      }

      const currentPointer = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const deltaX = currentPointer.x - dragState.startPointer.x;
      const deltaY = currentPointer.y - dragState.startPointer.y;
      setNodes(currentNodes =>
        currentNodes.map(node => {
          const startPosition = dragState.startPositions.get(node.id);
          return startPosition
            ? {
                ...node,
                position: {
                  x: startPosition.x + deltaX,
                  y: startPosition.y + deltaY,
                },
              }
            : node;
        })
      );
    },
    [screenToFlowPosition, setNodes, pushSnapshot]
  );

  const stopSelectionDrag = useCallback(() => {
    const dragState = draggingSelectionRef.current;
    draggingSelectionRef.current = null;
    window.removeEventListener('mousemove', handleSelectionMouseMove);
    window.removeEventListener('mouseup', stopSelectionDrag);
    if (dragState?.hasMoved) {
      completedSelectionDragRef.current = true;
      // The click arrives in the same task as this mouseup, so clear the flag
      // right after in case no click ever lands on the line.
      setTimeout(() => {
        completedSelectionDragRef.current = false;
      }, 0);
    }
  }, [handleSelectionMouseMove]);

  const handleEdgeMouseDown = useCallback(
    (event: React.MouseEvent, edge: SketchlabReactFlowEdge) => {
      if (readOnly || event.button !== 0) {
        return;
      }
      // Grouped lines are not movable individually.
      if (getNode(edge.source)?.parentId || getNode(edge.target)?.parentId) {
        return;
      }

      // The line belongs to the multi-selection, so drag the whole selection.
      // A selection of just this line yields no ids and falls through to the
      // single-line drag below.
      const anchorIds = getStandaloneLineAnchorIds(edge, getNode);
      if (anchorIds?.every(id => multiSelectedNodeIds.has(id))) {
        const currentNodes = getNodes();
        const idsToMove = new Set(
          getSelectionMoveIds(multiSelectedNodeIds, currentNodes)
        );
        if (idsToMove.size > 0) {
          event.preventDefault();
          event.stopPropagation();
          draggingSelectionRef.current = {
            startPositions: new Map(
              currentNodes
                .filter(node => idsToMove.has(node.id))
                .map(node => [node.id, {...node.position}])
            ),
            startPointer: screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            }),
            hasMoved: false,
          };
          window.addEventListener('mousemove', handleSelectionMouseMove);
          window.addEventListener('mouseup', stopSelectionDrag);
          return;
        }
      }

      const anchors: DraggingAnchor[] = [];
      const pendingDetaches: PendingDetach[] = [];

      // Determine whether the given side terminates in an anchor or a real
      // node handle, and prepare the drag state accordingly.
      const planSide = (side: 'source' | 'target') => {
        const endpoint = resolveEdgeEndpoint(
          edge,
          side,
          getNode,
          screenToFlowPosition
        );
        if (!endpoint) return;
        if (endpoint.node.type === 'lineAnchor') {
          anchors.push({
            id: endpoint.node.id,
            side,
            startPosition: {...endpoint.node.position},
            currentPosition: {...endpoint.node.position},
            snapTarget: null,
          });
        } else {
          pendingDetaches.push({side, flowPosition: endpoint.flowPosition});
        }
      };
      planSide('source');
      planSide('target');
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
      getNodes,
      multiSelectedNodeIds,
      screenToFlowPosition,
      handleLineEdgeMouseMove,
      stopLineEdgeDrag,
      handleSelectionMouseMove,
      stopSelectionDrag,
    ]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleLineEdgeMouseMove);
      window.removeEventListener('mouseup', stopLineEdgeDrag);
      window.removeEventListener('mousemove', handleSelectionMouseMove);
      window.removeEventListener('mouseup', stopSelectionDrag);
    };
  }, [
    handleLineEdgeMouseMove,
    stopLineEdgeDrag,
    handleSelectionMouseMove,
    stopSelectionDrag,
  ]);

  return {handleEdgeMouseDown, isLineDragging, consumeSelectionDragClick};
}
