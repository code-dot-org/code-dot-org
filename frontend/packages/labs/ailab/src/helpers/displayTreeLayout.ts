import {
  DISPLAY_TREE_ROOT_ID,
  getChildNodeId,
  type DisplayTreeBranch,
  type DisplayTreeNode,
} from './displayTree';
import type {Rect} from './fitToView';

export const TREE_NODE_MAX_WIDTH = 280;
export const TREE_NODE_HEIGHT = 42;
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
  width: number;
  parent?: PlacedTreeNode;
  children: PlacedTreeNode[];
  branch?: DisplayTreeBranch;
  answerIndex?: number;
}

export interface DisplayTreeLayout {
  nodes: PlacedTreeNode[];
  width: number;
  height: number;
}

const EDGE_BEND_DROP = 20;
const EDGE_CORNER_RADIUS = 10;

export function edgePath(
  parent: PlacedTreeNode,
  child: PlacedTreeNode,
  bendDrop = EDGE_BEND_DROP,
): string {
  const startX = parent.x + parent.width / 2;
  const startY = parent.y + TREE_NODE_HEIGHT;
  const endX = child.x + child.width / 2;
  const bendY = startY + bendDrop;
  const radius = Math.min(EDGE_CORNER_RADIUS, Math.abs(endX - startX) / 2);
  const turn = Math.sign(endX - startX) * radius;
  return [
    `M ${startX} ${startY}`,
    `V ${bendY - radius}`,
    `Q ${startX} ${bendY} ${startX + turn} ${bendY}`,
    `H ${endX - turn}`,
    `Q ${endX} ${bendY} ${endX} ${bendY + radius}`,
    `V ${child.y}`,
  ].join(' ');
}

interface SubtreeExtent {
  nodeWidth: number;
  // The rest are measured from the subtree's left edge.
  span: number;
  center: number;
  childLefts: number[];
}

function extentOver(
  nodeWidth: number,
  children: SubtreeExtent[],
): SubtreeExtent {
  if (children.length === 0) {
    return {nodeWidth, span: nodeWidth, center: nodeWidth / 2, childLefts: []};
  }
  let right = 0;
  const childLefts = children.map(child => {
    const left = right;
    right += child.span + TREE_COLUMN_GAP;
    return left;
  });
  const childrenSpan = right - TREE_COLUMN_GAP;
  const last = children.length - 1;
  const center =
    (childLefts[0] +
      children[0].center +
      childLefts[last] +
      children[last].center) /
    2;
  const overhang = Math.max(0, nodeWidth / 2 - center);
  return {
    nodeWidth,
    span: Math.max(childrenSpan, center + nodeWidth / 2) + overhang,
    center: center + overhang,
    childLefts: childLefts.map(left => left + overhang),
  };
}

export function layoutDisplayTree(
  root: DisplayTreeNode,
  nodeWidth: (node: DisplayTreeNode, id: string) => number = () =>
    TREE_NODE_MAX_WIDTH,
  rowGap = TREE_ROW_GAP,
): DisplayTreeLayout {
  const extents = new Map<string, SubtreeExtent>();

  const measure = (node: DisplayTreeNode, id: string): SubtreeExtent => {
    const children =
      node.type === 'question'
        ? node.branches.map((branch, index) =>
            measure(branch.child, getChildNodeId(id, index)),
          )
        : [];
    const extent = extentOver(nodeWidth(node, id), children);
    extents.set(id, extent);
    return extent;
  };

  const nodes: PlacedTreeNode[] = [];
  let answerCount = 0;
  let maxDepth = 0;

  const place = (
    node: DisplayTreeNode,
    id: string,
    depth: number,
    left: number,
    parent?: PlacedTreeNode,
    branch?: DisplayTreeBranch,
  ): PlacedTreeNode => {
    const {nodeWidth: width, center, childLefts} = extents.get(id)!;
    const placed: PlacedTreeNode = {
      id,
      node,
      depth,
      x: left + center - width / 2,
      y: depth * (TREE_NODE_HEIGHT + rowGap),
      width,
      parent,
      children: [],
      branch,
    };
    nodes.push(placed);
    maxDepth = Math.max(maxDepth, depth);

    if (node.type === 'answer') {
      placed.answerIndex = answerCount;
      answerCount++;
    } else {
      placed.children = node.branches.map((childBranch, index) =>
        place(
          childBranch.child,
          getChildNodeId(id, index),
          depth + 1,
          left + childLefts[index],
          placed,
          childBranch,
        ),
      );
    }
    return placed;
  };

  const {span} = measure(root, DISPLAY_TREE_ROOT_ID);
  place(root, DISPLAY_TREE_ROOT_ID, 0, 0);

  return {
    nodes,
    width: span,
    height: (maxDepth + 1) * (TREE_NODE_HEIGHT + rowGap) - rowGap,
  };
}

export function getNodesBounds(nodes: PlacedTreeNode[]): Rect {
  const ys = nodes.map(placed => placed.y);
  const left = Math.min(...nodes.map(placed => placed.x));
  const top = Math.min(...ys);
  return {
    x: left,
    y: top,
    width: Math.max(...nodes.map(placed => placed.x + placed.width)) - left,
    height: Math.max(...ys) + TREE_NODE_HEIGHT - top,
  };
}
