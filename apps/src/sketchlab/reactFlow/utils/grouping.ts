import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  GROUP_PADDING_PX,
} from '../constants';
import type {GroupNodeType, SketchLabNode} from '../types';

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
  // Exclude already-grouped nodes — they cannot be nested into a new group.
  const targets = nodes.filter(n => selectedIds.includes(n.id) && !n.parentId);
  if (targets.length < 2) return nodes;

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
