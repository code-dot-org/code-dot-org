import type {PlacedTreeNode} from './displayTreeLayout';

export function getNodeForKey(
  nodes: PlacedTreeNode[],
  from: PlacedTreeNode,
  key: string,
): PlacedTreeNode | undefined {
  // layoutDisplayTree places nodes in preorder, so each row reads left to right.
  const row = nodes.filter(placed => placed.depth === from.depth);
  const column = row.indexOf(from);
  switch (key) {
    case 'ArrowUp':
      return from.parent ?? from;
    case 'ArrowDown':
      return from.children[0] ?? from;
    case 'ArrowLeft':
      return row[column - 1] ?? from;
    case 'ArrowRight':
      return row[column + 1] ?? from;
    case 'Home':
      return nodes[0];
    case 'End':
      return row[row.length - 1];
    default:
      return undefined;
  }
}
