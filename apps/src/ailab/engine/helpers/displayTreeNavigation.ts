import type {PlacedTreeNode} from './displayTreeLayout';

export function getNodeForKey(
  nodes: PlacedTreeNode[],
  from: PlacedTreeNode,
  key: string
): PlacedTreeNode | undefined {
  // layoutDisplayTree places nodes in preorder, which is the tree's reading order.
  const index = nodes.indexOf(from);
  switch (key) {
    case 'ArrowDown':
      return nodes[index + 1] ?? from;
    case 'ArrowUp':
      return nodes[index - 1] ?? from;
    case 'ArrowRight':
      return from.children[0] ?? from;
    case 'ArrowLeft':
      return from.parent ?? from;
    case 'Home':
      return nodes[0];
    case 'End':
      return nodes[nodes.length - 1];
    default:
      return undefined;
  }
}
