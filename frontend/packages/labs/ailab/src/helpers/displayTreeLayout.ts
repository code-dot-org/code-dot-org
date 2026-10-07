import {
  DISPLAY_TREE_ROOT_ID,
  getChildNodeId,
  type DisplayTreeBranch,
  type DisplayTreeNode,
} from './displayTree';
import type {Rect} from './fitToView';

export const TREE_NODE_WIDTH = 160;
export const TREE_NODE_HEIGHT = 40;
export const TREE_COLUMN_GAP = 16;
// Tall enough for a branch label between two rows of nodes.
export const TREE_ROW_GAP = 64;

export interface PlacedTreeNode {
  id: string;
  node: DisplayTreeNode;
  depth: number;
  // Top-left corner.
  x: number;
  y: number;
  parent?: PlacedTreeNode;
  children: PlacedTreeNode[];
  branch?: DisplayTreeBranch;
}

export interface DisplayTreeLayout {
  nodes: PlacedTreeNode[];
  width: number;
  height: number;
}

export function layoutDisplayTree(root: DisplayTreeNode): DisplayTreeLayout {
  const nodes: PlacedTreeNode[] = [];
  let answerCount = 0;
  let maxDepth = 0;

  const place = (
    node: DisplayTreeNode,
    id: string,
    depth: number,
    parent?: PlacedTreeNode,
    branch?: DisplayTreeBranch,
  ): PlacedTreeNode => {
    const placed: PlacedTreeNode = {
      id,
      node,
      depth,
      x: 0,
      y: depth * (TREE_NODE_HEIGHT + TREE_ROW_GAP),
      parent,
      children: [],
      branch,
    };
    nodes.push(placed);
    maxDepth = Math.max(maxDepth, depth);

    if (node.type === 'answer') {
      placed.x = answerCount * (TREE_NODE_WIDTH + TREE_COLUMN_GAP);
      answerCount++;
    } else {
      const children = node.branches.map((childBranch, index) =>
        place(
          childBranch.child,
          getChildNodeId(id, index),
          depth + 1,
          placed,
          childBranch,
        ),
      );
      placed.children = children;
      placed.x = (children[0].x + children[children.length - 1].x) / 2;
    }
    return placed;
  };

  place(root, DISPLAY_TREE_ROOT_ID, 0);

  return {
    nodes,
    width: answerCount * (TREE_NODE_WIDTH + TREE_COLUMN_GAP) - TREE_COLUMN_GAP,
    height: (maxDepth + 1) * (TREE_NODE_HEIGHT + TREE_ROW_GAP) - TREE_ROW_GAP,
  };
}

export function getNodesBounds(nodes: PlacedTreeNode[]): Rect {
  const xs = nodes.map(placed => placed.x);
  const ys = nodes.map(placed => placed.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    x: left,
    y: top,
    width: Math.max(...xs) + TREE_NODE_WIDTH - left,
    height: Math.max(...ys) + TREE_NODE_HEIGHT - top,
  };
}
