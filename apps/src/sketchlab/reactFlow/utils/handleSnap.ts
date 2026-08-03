// Utils for handling edge 'snap' behavior, where an edge will snap
// to a nearby node handle when it is close enough.

import {XYPosition} from '@xyflow/react';

import type {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {
  REACT_FLOW_SELECTOR,
  reactFlowNodeTypeClass,
} from '../reactFlowSelectors';

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

// Picks the nearest handle to screenPoint among the given candidates,
// keeping only those of the requested type and within radiusPx. resolveNodeId
// returns the node id to record for a candidate, or null to skip it — this
// is where callers express their inclusion rules (e.g. exclude a specific
// node, skip lineAnchor handles).
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
  excludeNodeIds: string[],
  requiredType: 'source' | 'target',
  radiusPx: number
): SnapTarget | null {
  const handles = document.querySelectorAll<HTMLElement>(
    REACT_FLOW_SELECTOR.handle
  );
  return findNearestHandleAmong(
    handles,
    screenPoint,
    requiredType,
    radiusPx,
    handle => {
      const nodeId = handle.dataset.nodeid;
      if (!nodeId || excludeNodeIds.includes(nodeId)) {
        return null;
      }
      // Lines only attach to real nodes (shape/text/image), not other line's hidden anchors.
      if (
        handle
          .closest(REACT_FLOW_SELECTOR.node)
          ?.classList.contains(reactFlowNodeTypeClass('lineAnchor'))
      ) {
        return null;
      }
      return nodeId;
    }
  );
}

// Points one end of an edge at a real-node handle, unless that would make both
// ends share a node and collapse the edge into a self-loop. The check also
// catches the case where two endpoints snap to the same node in one gesture,
// which the candidate search can't see (each side searches independently).
export function attachEdgeEndpoint({
  edgeId,
  side,
  nodeId,
  handleId,
  setEdges,
}: {
  edgeId: string;
  side: 'source' | 'target';
  nodeId: string;
  handleId: string | null;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
}): void {
  const patch = endpointPatch(side, nodeId, handleId);
  setEdges(currentEdges =>
    currentEdges.map(currentEdge => {
      if (currentEdge.id !== edgeId) return currentEdge;
      const patched = {...currentEdge, ...patch};
      return patched.source === patched.target ? currentEdge : patched;
    })
  );
}

// Discrete snap (keyboard moves, which have no live preview): find the nearest
// real-node handle to a free anchor and attach the edge there in one step.
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
  const oppositeNodeId =
    side === 'source' ? associatedEdge.target : associatedEdge.source;
  const snap = findNearestHandleInRadius(
    screenPoint,
    [anchorId, oppositeNodeId],
    side,
    radiusPx
  );
  if (!snap) return null;
  attachEdgeEndpoint({
    edgeId: associatedEdge.id,
    side,
    nodeId: snap.nodeId,
    handleId: snap.handleId,
    setEdges,
  });
  return associatedEdge.id;
}
