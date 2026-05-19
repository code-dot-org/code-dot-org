import type {XYPosition} from '@xyflow/react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';
import {createUuid} from '@cdo/apps/utils';

import {LINE_ANCHOR_SIZE_PX} from '../constants';
import {NodeDataBase} from '../types';

import {endpointPatch} from './handleSnap';

// The Handle id rendered by LineAnchorNode for a given role.
export function lineAnchorHandleId(role: 'source' | 'target'): string {
  return `line-anchor-${role}`;
}

// Builds a lineAnchor node positioned so that its visible Handle ends up at
// `handleFlowPosition`. Source anchors render their Handle on the right
// side of the 10×10 box; target anchors render on the left. Both sit
// vertically centered, so we offset the node's top-left corner accordingly.
export function createLineAnchorAtHandle(
  handleFlowPosition: XYPosition,
  role: 'source' | 'target',
  baseData?: Partial<NodeDataBase>
): SketchlabReactFlowNode {
  const position: XYPosition =
    role === 'source'
      ? {
          x: handleFlowPosition.x - LINE_ANCHOR_SIZE_PX,
          y: handleFlowPosition.y - LINE_ANCHOR_SIZE_PX / 2,
        }
      : {
          x: handleFlowPosition.x,
          y: handleFlowPosition.y - LINE_ANCHOR_SIZE_PX / 2,
        };
  return {
    id: createUuid(),
    type: 'lineAnchor',
    position,
    data: {...baseData, lineAnchorRole: role},
    style: {width: LINE_ANCHOR_SIZE_PX, height: LINE_ANCHOR_SIZE_PX},
  };
}

// Inverse of createLineAnchorAtHandle's offset: given an anchor's top-left
// position and role, return the flow-coordinate position of its visible
// Handle. Used by drag/keyboard paths that need to test whether the
// post-move handle position lands on (or near) another node's handle.
export function anchorHandleFlowPosition(
  position: XYPosition,
  role: 'source' | 'target'
): XYPosition {
  return role === 'source'
    ? {
        x: position.x + LINE_ANCHOR_SIZE_PX,
        y: position.y + LINE_ANCHOR_SIZE_PX / 2,
      }
    : {
        x: position.x,
        y: position.y + LINE_ANCHOR_SIZE_PX / 2,
      };
}

// Spawns a fresh lineAnchor at `flowPosition` and returns the partial
// edge fields that point one side of an edge at it. `baseData` lets
// callers carry across state (e.g. showHandles) from an existing
// anchor on the edge so detach paths don't reset toolbar choices.
export function attachEdgeToFreshAnchor(
  flowPosition: XYPosition,
  side: 'source' | 'target',
  baseData?: Partial<NodeDataBase>
): {
  anchor: SketchlabReactFlowNode;
  edgePatch: Partial<SketchlabReactFlowEdge>;
} {
  const anchor = createLineAnchorAtHandle(flowPosition, side, baseData);
  const edgePatch = endpointPatch(side, anchor.id, lineAnchorHandleId(side));
  return {anchor, edgePatch};
}

// When one side of an edge is being detached, look at the side that's
// staying put. If that side is an existing lineAnchor with toolbar
// state worth inheriting (currently just hidden handles), return
// it so the new anchor can adopt the same state.
export function inheritedAnchorBaseData(
  edge: {source: string; target: string},
  detachingSide: 'source' | 'target',
  getNode: (id: string) => SketchlabReactFlowNode | undefined
): Partial<NodeDataBase> {
  const otherId = detachingSide === 'source' ? edge.target : edge.source;
  const otherNode = getNode(otherId);
  if (
    otherNode?.type === 'lineAnchor' &&
    otherNode.data.showHandles === false
  ) {
    return {showHandles: false};
  }
  return {};
}

// Returns an object containing the current flow position of the
// given side's handle for an edge and the endpoint node.
export function resolveEdgeEndpoint(
  edge: SketchlabReactFlowEdge,
  side: 'source' | 'target',
  getNode: (id: string) => SketchlabReactFlowNode | undefined,
  screenToFlowPosition: (point: XYPosition) => XYPosition
): {flowPosition: XYPosition; node: SketchlabReactFlowNode} | null {
  const endpointId = side === 'source' ? edge.source : edge.target;
  const node = getNode(endpointId);
  if (!node) return null;
  if (node.type === 'lineAnchor') {
    return {flowPosition: anchorHandleFlowPosition(node.position, side), node};
  }
  const handleId = side === 'source' ? edge.sourceHandle : edge.targetHandle;
  const flowPosition = getHandleFlowPosition(
    endpointId,
    handleId ?? undefined,
    screenToFlowPosition
  );
  return flowPosition ? {flowPosition, node} : null;
}

// Resolves the on-screen position of a node's handle to canvas coordinates.
// Returns null if the node isn't currently rendered. When the handleId
// can't be matched we fall back to any handle on the node, which
// keeps the line endpoint roughly correct rather than dropping the drag.
export function getHandleFlowPosition(
  nodeId: string,
  handleId: string | undefined,
  screenToFlowPosition: (point: XYPosition) => XYPosition
): XYPosition | null {
  const handles = document.querySelectorAll<HTMLElement>(
    `.react-flow__handle[data-nodeid="${CSS.escape(nodeId)}"]`
  );
  if (handles.length === 0) {
    return null;
  }
  const matched = handleId
    ? Array.from(handles).find(handle => handle.dataset.handleid === handleId)
    : undefined;
  const chosen = matched ?? handles[0];
  const rect = chosen.getBoundingClientRect();
  return screenToFlowPosition({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}
