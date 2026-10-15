import type {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  GROUP_PADDING_PX,
} from '../constants';
import type {GroupNodeType, SketchLabNode} from '../types';

type LockableEdge = {
  source: string;
  target: string;
  data?: {locked?: boolean};
};

export function isGroupNode(node: SketchLabNode): node is GroupNodeType {
  return node.type === 'group';
}

export function isGroupedChildNode(node: SketchLabNode | undefined): boolean {
  return Boolean(node?.parentId);
}

export function getGroupChildren(
  groupId: string,
  nodes: SketchLabNode[]
): SketchLabNode[] {
  return nodes.filter(n => n.parentId === groupId);
}

/**
 * Counts elements as a user sees them: a regular node is one, and each pair of
 * lineAnchor nodes is one standalone line.
 */
export function countLogicalElements(
  nodes: Pick<SketchLabNode, 'type'>[]
): number {
  const anchorCount = nodes.filter(node => node.type === 'lineAnchor').length;
  return nodes.length - anchorCount + Math.floor(anchorCount / 2);
}

/**
 * Anchor pseudo-nodes at the ends of a locked line. A line's lock lives on its
 * edge, so the anchors themselves carry no lock and have to inherit one.
 * Endpoints that are real nodes are left alone; they have their own lock state.
 */
export function getLockedLineAnchorIds(
  nodes: SketchlabReactFlowNode[],
  edges: LockableEdge[]
): Set<string> {
  const anchorIds = new Set(
    nodes.filter(node => node.type === 'lineAnchor').map(node => node.id)
  );
  const lockedAnchorIds = new Set<string>();
  for (const edge of edges) {
    if (edge.data?.locked !== true) continue;
    if (anchorIds.has(edge.source)) lockedAnchorIds.add(edge.source);
    if (anchorIds.has(edge.target)) lockedAnchorIds.add(edge.target);
  }
  return lockedAnchorIds;
}

/**
 * Ids a whole-selection move should translate, in node order; empty when fewer
 * than two elements survive filtering.
 *
 * Locked elements and grouped children are dropped: undo can restore either
 * state while the selection that predates it is still live.
 */
export function getSelectionMoveIds(
  selectedIds: ReadonlySet<string>,
  nodes: SketchlabReactFlowNode[],
  edges: LockableEdge[]
): string[] {
  const lockedAnchorIds = getLockedLineAnchorIds(nodes, edges);
  const movable = nodes.filter(
    node =>
      selectedIds.has(node.id) &&
      !node.data?.locked &&
      !lockedAnchorIds.has(node.id) &&
      !isGroupedChildNode(node)
  );
  return countLogicalElements(movable) >= 2 ? movable.map(node => node.id) : [];
}

function computeBounds(nodes: SketchLabNode[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const node of nodes) {
    const {x, y} = node.position;
    const w =
      node.width ??
      (typeof node.style?.width === 'number'
        ? node.style.width
        : DEFAULT_NODE_WIDTH);
    const h =
      node.height ??
      (typeof node.style?.height === 'number'
        ? node.style.height
        : DEFAULT_NODE_HEIGHT);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  }
  return {minX, minY, maxX, maxY};
}

/**
 * Wraps `selectedIds` in a new group node. Child positions are converted from
 * absolute to parent-relative. Returns the updated node list with the group
 * node inserted before its children (lower z-order).
 */
export function groupSelectedNodes(
  selectedIds: string[],
  nodes: SketchLabNode[],
  groupId: string
): SketchLabNode[] {
  // Exclude already-grouped and locked nodes.
  const targets = nodes.filter(
    n => selectedIds.includes(n.id) && !n.parentId && !n.data?.locked
  );
  if (countLogicalElements(targets) < 2) return nodes;

  const {minX, minY, maxX, maxY} = computeBounds(targets);
  const groupX = minX - GROUP_PADDING_PX;
  const groupY = minY - GROUP_PADDING_PX;
  const groupWidth = maxX - minX + GROUP_PADDING_PX * 2;
  const groupHeight = maxY - minY + GROUP_PADDING_PX * 2;
  const groupNode: GroupNodeType = {
    id: groupId,
    type: 'group',
    position: {x: groupX, y: groupY},
    width: groupWidth,
    height: groupHeight,
    // Render the group behind its children in manual z-index mode.
    zIndex: -1,
    data: {},
  };

  const updatedNodes = nodes.map(node => {
    if (!selectedIds.includes(node.id)) return node;
    return {
      ...node,
      parentId: groupId,
      expandParent: true,
      position: {
        x: node.position.x - groupX,
        y: node.position.y - groupY,
      },
    };
  });

  // Group node goes first so it sits beneath children when React Flow
  // renders the list top-to-bottom.
  return [groupNode, ...updatedNodes];
}

/**
 * Expands a pending deletion so removing a group also removes its children.
 *
 * React Flow's cascade delete only propagates to deletable children, but
 * grouped children are marked deletable:false (so a user can't delete one
 * child out of a group). This re-adds each deleted group's children, plus any edges whose
 * endpoints are being removed, so no dangling nodes or edges survive.
 */
export function expandGroupDeletion<
  E extends {id: string; source: string; target: string}
>(
  nodesToDelete: SketchLabNode[],
  edgesToDelete: E[],
  allNodes: SketchLabNode[],
  allEdges: E[]
): {nodes: SketchLabNode[]; edges: E[]} {
  const deletedNodeIds = new Set(nodesToDelete.map(node => node.id));
  const orphanedChildren = allNodes.filter(
    node =>
      node.parentId &&
      deletedNodeIds.has(node.parentId) &&
      !deletedNodeIds.has(node.id)
  );
  if (orphanedChildren.length === 0) {
    return {nodes: nodesToDelete, edges: edgesToDelete};
  }

  const finalNodesToDelete = [...nodesToDelete, ...orphanedChildren];
  const finalNodeIds = new Set(finalNodesToDelete.map(node => node.id));
  const finalEdgeIds = new Set(edgesToDelete.map(edge => edge.id));
  const finalEdgesToDelete = [...edgesToDelete];
  for (const edge of allEdges) {
    if (
      !finalEdgeIds.has(edge.id) &&
      (finalNodeIds.has(edge.source) || finalNodeIds.has(edge.target))
    ) {
      finalEdgesToDelete.push(edge);
    }
  }
  return {nodes: finalNodesToDelete, edges: finalEdgesToDelete};
}

/**
 * Dissolves a group: removes the group node and converts child positions back
 * to absolute coordinates.
 */
export function ungroupNode(
  groupId: string,
  nodes: SketchLabNode[]
): SketchLabNode[] {
  const groupNode = nodes.find(n => n.id === groupId);
  if (!groupNode || groupNode.type !== 'group') return nodes;

  const {x: gx, y: gy} = groupNode.position;

  return nodes
    .filter(n => n.id !== groupId)
    .map(node => {
      if (node.parentId !== groupId) return node;
      // Strip parentId and expandParent, restore absolute position.
      const result = {
        ...node,
        position: {x: node.position.x + gx, y: node.position.y + gy},
      } as Record<string, unknown>;
      delete result.parentId;
      delete result.expandParent;
      return result as SketchLabNode;
    });
}
