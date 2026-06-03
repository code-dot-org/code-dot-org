import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  GROUP_PADDING_PX,
} from '../constants';
import {GroupPadding} from '../types';

interface NodeBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function getNodeWidth(node: SketchlabReactFlowNode): number {
  return node.width ?? DEFAULT_NODE_WIDTH;
}

function getNodeHeight(node: SketchlabReactFlowNode): number {
  return node.height ?? DEFAULT_NODE_HEIGHT;
}

function getNodeMap(nodes: SketchlabReactFlowNode[]) {
  return new Map(nodes.map(node => [node.id, node]));
}

function addBoundsForNode(
  bounds: NodeBounds,
  position: {x: number; y: number},
  node: SketchlabReactFlowNode
) {
  const width = getNodeWidth(node);
  const height = getNodeHeight(node);
  bounds.minX = Math.min(bounds.minX, position.x);
  bounds.minY = Math.min(bounds.minY, position.y);
  bounds.maxX = Math.max(bounds.maxX, position.x + width);
  bounds.maxY = Math.max(bounds.maxY, position.y + height);
}

function getBoundsOrNull(bounds: NodeBounds): NodeBounds | null {
  return Number.isFinite(bounds.minX) ? bounds : null;
}

export function isGroupNode(
  node: SketchlabReactFlowNode
): node is Extract<SketchlabReactFlowNode, {type: 'group'}> {
  return node.type === 'group';
}

export function isGroupableNode(node: SketchlabReactFlowNode): boolean {
  return (
    node.type !== 'group' &&
    node.type !== 'lineAnchor' &&
    node.parentId === undefined
  );
}

export function getAbsoluteNodePosition(
  node: SketchlabReactFlowNode,
  nodeMap: Map<string, SketchlabReactFlowNode>
): {x: number; y: number} {
  let absoluteX = node.position.x;
  let absoluteY = node.position.y;
  let parentId = node.parentId;
  const visited = new Set<string>();

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = nodeMap.get(parentId);
    if (!parent) {
      break;
    }
    absoluteX += parent.position.x;
    absoluteY += parent.position.y;
    parentId = parent.parentId;
  }

  return {x: absoluteX, y: absoluteY};
}

function computeAbsoluteBounds(
  nodes: SketchlabReactFlowNode[],
  nodeMap: Map<string, SketchlabReactFlowNode>
): NodeBounds | null {
  const bounds: NodeBounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  nodes.forEach(node => {
    addBoundsForNode(bounds, getAbsoluteNodePosition(node, nodeMap), node);
  });

  return getBoundsOrNull(bounds);
}

function computeRelativeBounds(
  nodes: SketchlabReactFlowNode[]
): NodeBounds | null {
  const bounds: NodeBounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  nodes.forEach(node => addBoundsForNode(bounds, node.position, node));
  return getBoundsOrNull(bounds);
}

export function getGroupPadding(
  node: Extract<SketchlabReactFlowNode, {type: 'group'}>
): GroupPadding {
  return (
    node.data.padding ?? {
      top: GROUP_PADDING_PX,
      right: GROUP_PADDING_PX,
      bottom: GROUP_PADDING_PX,
      left: GROUP_PADDING_PX,
    }
  );
}

export function getGroupPaddingFromChildren(
  groupNode: Extract<SketchlabReactFlowNode, {type: 'group'}>,
  nodes: SketchlabReactFlowNode[]
): GroupPadding | null {
  const childBounds = computeRelativeBounds(
    nodes.filter(node => node.parentId === groupNode.id)
  );
  if (!childBounds) {
    return null;
  }

  return {
    top: Math.max(0, childBounds.minY),
    right: Math.max(
      0,
      (groupNode.width ?? DEFAULT_NODE_WIDTH) - childBounds.maxX
    ),
    bottom: Math.max(
      0,
      (groupNode.height ?? DEFAULT_NODE_HEIGHT) - childBounds.maxY
    ),
    left: Math.max(0, childBounds.minX),
  };
}

function paddingsMatch(a: GroupPadding, b: GroupPadding): boolean {
  return (
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left
  );
}

export function groupSelectedNodes(
  nodes: SketchlabReactFlowNode[],
  selectedNodeIds: string[],
  groupId: string
): {nodes: SketchlabReactFlowNode[]; groupId: string} | null {
  const selectedIdSet = new Set(selectedNodeIds);
  const selectedNodes = nodes.filter(node => selectedIdSet.has(node.id));

  if (
    selectedNodes.length < 2 ||
    selectedNodes.some(node => !isGroupableNode(node))
  ) {
    return null;
  }

  const nodeMap = getNodeMap(nodes);
  const bounds = computeAbsoluteBounds(selectedNodes, nodeMap);
  if (!bounds) {
    return null;
  }

  const padding: GroupPadding = {
    top: GROUP_PADDING_PX,
    right: GROUP_PADDING_PX,
    bottom: GROUP_PADDING_PX,
    left: GROUP_PADDING_PX,
  };
  const groupPosition = {
    x: bounds.minX - padding.left,
    y: bounds.minY - padding.top,
  };
  const groupNode: Extract<SketchlabReactFlowNode, {type: 'group'}> = {
    id: groupId,
    type: 'group',
    position: groupPosition,
    width: bounds.maxX - bounds.minX + padding.left + padding.right,
    height: bounds.maxY - bounds.minY + padding.top + padding.bottom,
    data: {padding},
  };

  const firstSelectedIndex = nodes.findIndex(node =>
    selectedIdSet.has(node.id)
  );
  const updatedNodes = nodes.map(node => {
    if (!selectedIdSet.has(node.id)) {
      return node;
    }

    const absolutePosition = getAbsoluteNodePosition(node, nodeMap);
    return {
      ...node,
      parentId: groupId,
      position: {
        x: absolutePosition.x - groupPosition.x,
        y: absolutePosition.y - groupPosition.y,
      },
    };
  });

  return {
    groupId,
    nodes: [
      ...updatedNodes.slice(0, firstSelectedIndex),
      groupNode,
      ...updatedNodes.slice(firstSelectedIndex),
    ],
  };
}

export function ungroupNode(
  nodes: SketchlabReactFlowNode[],
  groupId: string
): SketchlabReactFlowNode[] {
  const groupNode = nodes.find(
    node => node.id === groupId && isGroupNode(node)
  );
  if (!groupNode) {
    return nodes;
  }

  let changed = false;
  const nextNodes = nodes.flatMap(node => {
    if (node.id === groupId) {
      changed = true;
      return [];
    }
    if (node.parentId !== groupId) {
      return [node];
    }

    changed = true;
    return [
      {
        ...node,
        parentId: undefined,
        position: {
          x: groupNode.position.x + node.position.x,
          y: groupNode.position.y + node.position.y,
        },
      },
    ];
  });

  return changed ? nextNodes : nodes;
}

export function syncGroupBounds(
  nodes: SketchlabReactFlowNode[]
): SketchlabReactFlowNode[] {
  const groupIds = nodes.filter(isGroupNode).map(node => node.id);
  if (groupIds.length === 0) {
    return nodes;
  }

  const updates = new Map<
    string,
    {
      groupPosition: {x: number; y: number};
      width: number;
      height: number;
      shiftX: number;
      shiftY: number;
    }
  >();

  nodes.forEach(node => {
    if (!isGroupNode(node)) {
      return;
    }

    const children = nodes.filter(child => child.parentId === node.id);
    const childBounds = computeRelativeBounds(children);
    if (!childBounds) {
      return;
    }

    const padding = getGroupPadding(node);
    const shiftX = childBounds.minX - padding.left;
    const shiftY = childBounds.minY - padding.top;
    const width =
      childBounds.maxX - childBounds.minX + padding.left + padding.right;
    const height =
      childBounds.maxY - childBounds.minY + padding.top + padding.bottom;

    if (
      shiftX === 0 &&
      shiftY === 0 &&
      width === (node.width ?? DEFAULT_NODE_WIDTH) &&
      height === (node.height ?? DEFAULT_NODE_HEIGHT)
    ) {
      return;
    }

    updates.set(node.id, {
      groupPosition: {
        x: node.position.x + shiftX,
        y: node.position.y + shiftY,
      },
      width,
      height,
      shiftX,
      shiftY,
    });
  });

  if (updates.size === 0) {
    return nodes;
  }

  return nodes.map(node => {
    const groupUpdate = updates.get(node.id);
    if (groupUpdate && isGroupNode(node)) {
      return {
        ...node,
        position: groupUpdate.groupPosition,
        width: groupUpdate.width,
        height: groupUpdate.height,
      };
    }

    const parentUpdate = node.parentId ? updates.get(node.parentId) : undefined;
    if (!parentUpdate) {
      return node;
    }

    return {
      ...node,
      position: {
        x: node.position.x - parentUpdate.shiftX,
        y: node.position.y - parentUpdate.shiftY,
      },
    };
  });
}

export function setGroupPaddingFromBounds(
  nodes: SketchlabReactFlowNode[],
  groupId: string
): SketchlabReactFlowNode[] {
  const groupNode = nodes.find(
    (node): node is Extract<SketchlabReactFlowNode, {type: 'group'}> =>
      node.id === groupId && isGroupNode(node)
  );
  if (!groupNode) {
    return nodes;
  }

  const nextPadding = getGroupPaddingFromChildren(groupNode, nodes);
  if (!nextPadding || paddingsMatch(getGroupPadding(groupNode), nextPadding)) {
    return nodes;
  }

  return nodes.map(node =>
    node.id === groupId && isGroupNode(node)
      ? {...node, data: {...node.data, padding: nextPadding}}
      : node
  );
}
