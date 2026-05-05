// Utils for handling edge 'snap' behavior, where an edge will snap
// to a nearby node handle when it is close enough.

import {XYPosition} from '@xyflow/react';

import type {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

export interface SnapTarget {
  nodeId: string;
  handleId: string | null;
  handleType: 'source' | 'target';
}

// Reads the type from React Flow's class hint. v12's `Handle` adds the
// bare `source` / `target` class to the rendered div; revisit if the
// React Flow major changes.
function getHandleType(handle: HTMLElement): 'source' | 'target' | null {
  if (handle.classList.contains('source')) {
    return 'source';
  }
  if (handle.classList.contains('target')) {
    return 'target';
  }
  return null;
}

// Pulls an (x,y) position out of either a MouseEvent (direct
// fields) or a TouchEvent (first changedTouches/touches entry). Returns
// null when no touch is present.
export function getEventClientPosition(
  event: MouseEvent | TouchEvent
): XYPosition | null {
  if (event instanceof MouseEvent) {
    return {x: event.clientX, y: event.clientY};
  }
  const touch = event.changedTouches[0] ?? event.touches[0] ?? null;
  return touch ? {x: touch.clientX, y: touch.clientY} : null;
}

// Returns the nearest handle matching the criteria within the radius, or null if
// none found.
export function findNearestHandleInRadius(
  screenPoint: XYPosition,
  excludeNodeId: string,
  requiredType: 'source' | 'target',
  radiusPx: number
): SnapTarget | null {
  const handles = document.querySelectorAll<HTMLElement>('.react-flow__handle');
  let closest: SnapTarget | null = null;
  let closestDistance = radiusPx;

  handles.forEach(handle => {
    const nodeId = handle.dataset.nodeid;
    if (!nodeId || nodeId === excludeNodeId) {
      return;
    }
    // Lines only attach to real nodes (shape/text/image), not other line's hidden anchors.
    if (
      handle
        .closest('.react-flow__node')
        ?.classList.contains('react-flow__node-lineAnchor')
    ) {
      return;
    }
    const handleType = getHandleType(handle);
    if (handleType !== requiredType) {
      return;
    }

    const rect = handle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(
      centerX - screenPoint.x,
      centerY - screenPoint.y
    );

    if (distance < closestDistance) {
      closest = {
        nodeId,
        handleId: handle.dataset.handleid ?? null,
        handleType,
      };
      closestDistance = distance;
    }
  });

  return closest;
}

// Convert a snap result into the partial edge fields that wire that side
// of the edge to the snapped handle.
export function snapResultToEdgePatch(
  side: 'source' | 'target',
  snap: SnapTarget
): Partial<SketchlabReactFlowEdge> {
  return side === 'source'
    ? {source: snap.nodeId, sourceHandle: snap.handleId ?? undefined}
    : {target: snap.nodeId, targetHandle: snap.handleId ?? undefined};
}

// Handles snapping an edge endpoint onto a real node handle.
// Looks up the nearest valid handle and, if found, rewrites the edge.
// Returns true when a snap was performed, false otherwise.
export function snapEdgeEndpointToHandle({
  edgeId,
  excludeNodeId,
  side,
  screenPoint,
  radiusPx,
  setEdges,
}: {
  edgeId: string;
  excludeNodeId: string;
  side: 'source' | 'target';
  screenPoint: XYPosition;
  radiusPx: number;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}): boolean {
  const snap = findNearestHandleInRadius(
    screenPoint,
    excludeNodeId,
    side,
    radiusPx
  );
  if (!snap) return false;
  const patch = snapResultToEdgePatch(side, snap);
  setEdges(currentEdges =>
    currentEdges.map(currentEdge =>
      currentEdge.id === edgeId ? {...currentEdge, ...patch} : currentEdge
    )
  );
  return true;
}
