import type {XYPosition} from '@xyflow/react';
import React, {useCallback, useRef, useState} from 'react';

import type {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH} from '../constants';
import {isGroupedChildNode} from '../utils/grouping';

const DRAG_THRESHOLD_PX = 4;

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

// Drag-to-select on the canvas pane. Mousedown on the pane starts tracking;
// once the pointer moves past DRAG_THRESHOLD_PX a selection box appears.
// Mouseup commits: nodes with partial overlap and standalone lines with either
// endpoint inside the box are immediately grouped via onGroupNodes.
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

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
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
  }, []);

  const handleMouseUp = useCallback(
    (event: React.MouseEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      setSelectionBox(null);
      if (!drag?.active) return;

      const screenMinX = Math.min(drag.startX, event.clientX);
      const screenMinY = Math.min(drag.startY, event.clientY);
      const screenMaxX = Math.max(drag.startX, event.clientX);
      const screenMaxY = Math.max(drag.startY, event.clientY);

      const flowMin = screenToFlowPosition({x: screenMinX, y: screenMinY});
      const flowMax = screenToFlowPosition({x: screenMaxX, y: screenMaxY});

      const selectedIds = new Set<string>();

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
        // Partial overlap: include if any part of the node intersects the box.
        if (
          x < flowMax.x &&
          x + w > flowMin.x &&
          y < flowMax.y &&
          y + h > flowMin.y
        ) {
          selectedIds.add(node.id);
        }
      }

      // Standalone lines: include if either endpoint falls inside the box.
      for (const edge of edges) {
        if (edge.data?.locked) continue;
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (src?.type !== 'lineAnchor' || tgt?.type !== 'lineAnchor') continue;
        if (isGroupedChildNode(src) || isGroupedChildNode(tgt)) continue;
        if (src.parentId || tgt.parentId) continue;

        const inBox = (pos: XYPosition) =>
          pos.x >= flowMin.x &&
          pos.x <= flowMax.x &&
          pos.y >= flowMin.y &&
          pos.y <= flowMax.y;

        if (inBox(src.position) || inBox(tgt.position)) {
          selectedIds.add(edge.source);
          selectedIds.add(edge.target);
        }
      }

      onGroupNodes(selectedIds);
    },
    [nodes, edges, screenToFlowPosition, onGroupNodes]
  );

  // Cancel an in-progress drag if the pointer leaves the canvas container.
  const handleMouseLeave = useCallback(() => {
    dragRef.current = null;
    setSelectionBox(null);
  }, []);

  return {
    selectionBox,
    dragSelectMouseDown: handleMouseDown,
    dragSelectMouseMove: handleMouseMove,
    dragSelectMouseUp: handleMouseUp,
    dragSelectMouseLeave: handleMouseLeave,
  };
}
