// Utils for handling edge 'snap' behavior, where an edge will snap
// to a nearby node handle when it is close enough.

import {XYPosition} from '@xyflow/react';

import type {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

// Builds the partial edge fields that point one side at a node+handle.
export function endpointPatch(
  side: 'source' | 'target',
  nodeId: string,
  handleId: string | null | undefined
): Partial<SketchlabReactFlowEdge> {
  return side === 'source'
    ? {source: nodeId, sourceHandle: handleId ?? undefined}
    : {target: nodeId, targetHandle: handleId ?? undefined};
}

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

// Picks the nearest handle to screenPoint among the given candidates,
// keeping only those of the requested type and within radiusPx. resolveNodeId
// returns the node id to record for a candidate, or null to skip it — this
// is where callers express their inclusion rules (e.g. exclude a specific
// node, skip lineAnchor handles). Call sites that evaluate many screen
// points against the same handle set should query the NodeList once and
// pass it in here to avoid repeated DOM lookups.
export function findNearestHandleAmong(
  handles: NodeListOf<HTMLElement>,
  screenPoint: XYPosition,
  requiredType: 'source' | 'target',
  radiusPx: number,
  resolveNodeId: (handle: HTMLElement) => string | null
): SnapTarget | null {
  let closest: SnapTarget | null = null;
  let closestDistance = radiusPx;

  handles.forEach(handle => {
    const handleType = getHandleType(handle);
    if (handleType !== requiredType) {
      return;
    }
    const nodeId = resolveNodeId(handle);
    if (nodeId === null) {
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

// Returns the nearest handle matching the criteria within the radius, or null if
// none found.
export function findNearestHandleInRadius(
  screenPoint: XYPosition,
  excludeNodeId: string,
  requiredType: 'source' | 'target',
  radiusPx: number
): SnapTarget | null {
  const handles = document.querySelectorAll<HTMLElement>('.react-flow__handle');
  return findNearestHandleAmong(
    handles,
    screenPoint,
    requiredType,
    radiusPx,
    handle => {
      const nodeId = handle.dataset.nodeid;
      if (!nodeId || nodeId === excludeNodeId) {
        return null;
      }
      // Lines only attach to real nodes (shape/text/image), not other line's hidden anchors.
      if (
        handle
          .closest('.react-flow__node')
          ?.classList.contains('react-flow__node-lineAnchor')
      ) {
        return null;
      }
      return nodeId;
    }
  );
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
  const patch = endpointPatch(side, snap.nodeId, snap.handleId);
  setEdges(currentEdges =>
    currentEdges.map(currentEdge =>
      currentEdge.id === edgeId ? {...currentEdge, ...patch} : currentEdge
    )
  );
  return true;
}

// Snap a free-floating anchor onto a nearby real-node handle, if any.
// Returns the edge id when snapping occurred, null otherwise.
export function snapAnchorIfNearby({
  anchorId,
  screenPoint,
  radiusPx,
  edges,
  setEdges,
}: {
  anchorId: string;
  screenPoint: XYPosition;
  radiusPx: number;
  edges: SketchlabReactFlowEdge[];
  setEdges: (
    updater: (
      currentEdges: SketchlabReactFlowEdge[]
    ) => SketchlabReactFlowEdge[]
  ) => void;
}): string | null {
  const associatedEdge = edges.find(
    edge => edge.source === anchorId || edge.target === anchorId
  );
  if (!associatedEdge) return null;
  const side: 'source' | 'target' =
    associatedEdge.source === anchorId ? 'source' : 'target';
  const snapped = snapEdgeEndpointToHandle({
    edgeId: associatedEdge.id,
    excludeNodeId: anchorId,
    side,
    screenPoint,
    radiusPx,
    setEdges,
  });
  return snapped ? associatedEdge.id : null;
}
