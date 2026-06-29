import type {XYPosition} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH} from '../constants';
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
  onGroupNodes: (ids: Set<string>) => void;
}

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

  for (const edge of edges) {
    if (edge.data?.locked) continue;
    const src = nodes.find(n => n.id === edge.source);
    const tgt = nodes.find(n => n.id === edge.target);
    if (src?.type !== 'lineAnchor' || tgt?.type !== 'lineAnchor') continue;
    if (isGroupedChildNode(src) || isGroupedChildNode(tgt)) continue;
    if (src.parentId || tgt.parentId) continue;

    const inBox = (pos: XYPosition) =>
      pos.x >= canvasMin.x &&
      pos.x <= canvasMax.x &&
      pos.y >= canvasMin.y &&
      pos.y <= canvasMax.y;

    if (inBox(src.position) || inBox(tgt.position)) {
      ids.add(edge.source);
      ids.add(edge.target);
    }
  }

  return ids;
}

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

// Drag-to-select on the canvas pane. Mousedown on the pane starts tracking;
// once the pointer moves past DRAG_THRESHOLD_PX a selection box appears.
// pendingSelectedIds updates live as the box changes so elements highlight
// in real time. Mouseup commits: overlapping elements are grouped via onGroupNodes.
export function useDragSelection({
  nodes,
  edges,
  isGrabMode,
  readOnly,
  screenToFlowPosition,
  onGroupNodes,
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

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (isGrabMode || readOnly) return;
      // Only begin on a click directly on the pane background, not on a node/edge.
      const target = event.target as HTMLElement;
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
      onGroupNodes(selectedIds);
    },
    [nodes, edges, screenToFlowPosition, onGroupNodes]
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
    dragSelectMouseDown: handleMouseDown,
    dragSelectMouseMove: handleMouseMove,
    dragSelectMouseUp: handleMouseUp,
    dragSelectMouseLeave: handleMouseLeave,
  };
}
