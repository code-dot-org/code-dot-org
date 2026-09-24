/* Positions for drawing a display tree top-down, one column per answer. */
import type {DisplayTreeBranch, DisplayTreeNode} from './displayTree';

export const TREE_NODE_WIDTH = 160;
export const TREE_NODE_HEIGHT = 40;
export const TREE_COLUMN_GAP = 16;
// Tall enough for a branch label between two rows of nodes.
export const TREE_ROW_GAP = 64;

export interface PlacedTreeNode {
  // Unique within one tree, e.g. "0.1.0"; for React keys.
  id: string;
  node: DisplayTreeNode;
  // Top-left corner.
  x: number;
  y: number;
  parent?: PlacedTreeNode;
  // The branch of `parent` that leads here.
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
      x: 0,
      y: depth * (TREE_NODE_HEIGHT + TREE_ROW_GAP),
      parent,
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
          `${id}.${index}`,
          depth + 1,
          placed,
          childBranch,
        ),
      );
      placed.x = (children[0].x + children[children.length - 1].x) / 2;
    }
    return placed;
  };

  place(root, '0', 0);

  return {
    nodes,
    width: answerCount * (TREE_NODE_WIDTH + TREE_COLUMN_GAP) - TREE_COLUMN_GAP,
    height: (maxDepth + 1) * (TREE_NODE_HEIGHT + TREE_ROW_GAP) - TREE_ROW_GAP,
  };
}
