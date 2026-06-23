import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

// Checks whether either node is a line anchor, which should not be connectable to any other node.
export function canCreateConnection(
  sourceNodeId: string,
  targetNodeId: string,
  nodes: SketchlabReactFlowNode[]
) {
  return (
    !isLineAnchorNodeId(sourceNodeId, nodes) &&
    !isLineAnchorNodeId(targetNodeId, nodes)
  );
}

export function isLineAnchorNodeId(
  nodeId: string,
  nodes: SketchlabReactFlowNode[]
) {
  const node = nodes.find(candidate => candidate.id === nodeId);
  return node?.type === 'lineAnchor';
}

// Whether an edge endpoint is a free line anchor rather than a real node.
// A missing node counts as an anchor: it has no label.
export function isAnchorEndpoint(
  node: SketchlabReactFlowNode | undefined
): boolean {
  return !node || node.type === 'lineAnchor';
}
