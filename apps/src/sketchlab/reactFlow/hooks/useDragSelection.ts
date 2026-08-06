import type {XYPosition} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  LINE_ANCHOR_SIZE_PX,
} from '../constants';
import {isGroupedChildNode} from '../utils/grouping';

const DRAG_THRESHOLD_PX = 4;
const EMPTY_SET: ReadonlySet<string> = new Set();

export interface DragSelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UseDragSelectionOptions {
  nodes: SketchlabReactFlowNode[];
  edges: SketchlabReactFlowEdge[];
  isGrabMode: boolean;
  readOnly: boolean;
  screenToFlowPosition: (pos: XYPosition) => XYPosition;
  onSelectNodes: (ids: Set<string>) => void;
}

// Returns the set of node/anchor IDs that overlap the drag box in canvas space.
// lineAnchor nodes are intentionally skipped in the node loop; they are
// detected via edges below so a standalone line is captured as a unit (both
// anchor IDs together) rather than as two independent hits.
function computeOverlapIds(
  nodes: SketchlabReactFlowNode[],
  edges: SketchlabReactFlowEdge[],
  canvasMin: XYPosition,
  canvasMax: XYPosition
): Set<string> {
  const ids = new Set<string>();

  for (const node of nodes) {
    if (
      node.type === 'lineAnchor' ||
      node.type === 'group' ||
      isGroupedChildNode(node) ||
      node.data?.locked
    ) {
      continue;
    }
    const x = node.position.x;
    const y = node.position.y;
    const w = node.width ?? DEFAULT_NODE_WIDTH;
    const h = node.height ?? DEFAULT_NODE_HEIGHT;
    if (
      x < canvasMax.x &&
      x + w > canvasMin.x &&
      y < canvasMax.y &&
      y + h > canvasMin.y
    ) {
      ids.add(node.id);
    }
  }
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  for (const edge of edges) {
    if (edge.data?.locked) continue;
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src?.type !== 'lineAnchor' || tgt?.type !== 'lineAnchor') continue;
    if (isGroupedChildNode(src) || isGroupedChildNode(tgt)) continue;
    if (src.parentId || tgt.parentId) continue;

    // Anchors are 10×10px positioned by top-left corner, so use a partial-
    // overlap check rather than a point-in-box test: a drag box that starts
    // at the visible line endpoint would miss the anchor with a point test.
    const anchorOverlaps = (anchor: SketchlabReactFlowNode) => {
      const {x, y} = anchor.position;
      return (
        x < canvasMax.x &&
        x + LINE_ANCHOR_SIZE_PX > canvasMin.x &&
        y < canvasMax.y &&
        y + LINE_ANCHOR_SIZE_PX > canvasMin.y
      );
    };

    if (anchorOverlaps(src) || anchorOverlaps(tgt)) {
      ids.add(edge.source);
      ids.add(edge.target);
    }
  }

  return ids;
}

// Guards setPendingSelectedIds against unnecessary re-renders: mousemove fires
// on every pixel, so skip the state update when the overlap set hasn't changed.
function setsEqual(a: ReadonlySet<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of b) {
    if (!a.has(id)) return false;
  }
  return true;
}

function screenBoxToCanvas(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  screenToFlowPosition: (pos: XYPosition) => XYPosition
): {canvasMin: XYPosition; canvasMax: XYPosition} {
  const canvasMin = screenToFlowPosition({
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
  });
  const canvasMax = screenToFlowPosition({
    x: Math.max(startX, endX),
    y: Math.max(startY, endY),
  });
  return {canvasMin, canvasMax};
}

// Drag-to-select on the canvas pane. A selection box appears once the pointer
// moves past DRAG_THRESHOLD_PX, and pendingSelectedIds tracks what it overlaps
// so those elements can highlight live. Mouseup hands them to onSelectNodes;
// grouping them is a separate, explicit step.
export function useDragSelection({
  nodes,
  edges,
  isGrabMode,
  readOnly,
  screenToFlowPosition,
  onSelectNodes,
}: UseDragSelectionOptions) {
  const [selectionBox, setSelectionBox] = useState<DragSelectionBox | null>(
    null
  );
  const [pendingSelectedIds, setPendingSelectedIds] =
    useState<ReadonlySet<string>>(EMPTY_SET);

  // Ref-based drag state so mouseup never reads stale closure values.
  const dragRef = useRef<{
    startX: number;
    startY: number;
    active: boolean;
  } | null>(null);

  // Suppresses the pane click that follows the mouseup ending a drag
  // selection, which would otherwise clear the selection the drag just made.
  const completedDragRef = useRef(false);

  const consumeDragSelectClick = useCallback(() => {
    const completed = completedDragRef.current;
    completedDragRef.current = false;
    return completed;
  }, []);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (isGrabMode || readOnly || event.button !== 0) return;
      // Only begin on a click directly on the pane background, not on a node/edge.
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.classList.contains('react-flow__pane')) return;
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        active: false,
      };
    },
    [isGrabMode, readOnly]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (
        !drag.active &&
        Math.abs(dx) < DRAG_THRESHOLD_PX &&
        Math.abs(dy) < DRAG_THRESHOLD_PX
      ) {
        return;
      }
      drag.active = true;
      setSelectionBox({
        startX: drag.startX,
        startY: drag.startY,
        endX: event.clientX,
        endY: event.clientY,
      });

      const {canvasMin, canvasMax} = screenBoxToCanvas(
        drag.startX,
        drag.startY,
        event.clientX,
        event.clientY,
        screenToFlowPosition
      );
      const overlapIds = computeOverlapIds(nodes, edges, canvasMin, canvasMax);
      setPendingSelectedIds(prev =>
        setsEqual(prev, overlapIds) ? prev : overlapIds
      );
    },
    [nodes, edges, screenToFlowPosition]
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      setSelectionBox(null);
      setPendingSelectedIds(EMPTY_SET);
      if (!drag?.active) return;

      const {canvasMin, canvasMax} = screenBoxToCanvas(
        drag.startX,
        drag.startY,
        event.clientX,
        event.clientY,
        screenToFlowPosition
      );
      const selectedIds = computeOverlapIds(nodes, edges, canvasMin, canvasMax);
      // A drag that caught nothing should land like a plain pane click.
      if (selectedIds.size > 0) {
        completedDragRef.current = true;
        // The click arrives in the same task as this mouseup, so clear the flag
        // right after: a drag released over the toolbar produces no pane click
        // and must not swallow a later one.
        setTimeout(() => {
          completedDragRef.current = false;
        }, 0);
      }
      onSelectNodes(selectedIds);
    },
    [nodes, edges, screenToFlowPosition, onSelectNodes]
  );

  // Cancel an in-progress drag if the pointer leaves the canvas container.
  const handleMouseLeave = useCallback(() => {
    dragRef.current = null;
    setSelectionBox(null);
    setPendingSelectedIds(EMPTY_SET);
  }, []);

  return {
    selectionBox,
    pendingSelectedIds,
    consumeDragSelectClick,
    dragSelectMouseDown: handleMouseDown,
    dragSelectMouseMove: handleMouseMove,
    dragSelectMouseUp: handleMouseUp,
    dragSelectMouseLeave: handleMouseLeave,
  };
}
