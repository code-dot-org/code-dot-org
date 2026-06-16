import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

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
// A missing node counts as an anchor: it can't host a reconnect handle and
// has no label.
export function isAnchorEndpoint(
  node: SketchlabReactFlowNode | undefined
): boolean {
  return !node || node.type === 'lineAnchor';
}

// Returns false if the edge can't be reconnected at all, 'source' or 'target' if only
// one end is reconnectable, and true if both ends are reconnectable.
export function getEdgeReconnectability(
  edge: SketchlabReactFlowEdge,
  nodeMap: Map<string, SketchlabReactFlowNode>,
  {locked, readOnly}: {locked: boolean; readOnly: boolean}
): boolean | 'source' | 'target' {
  if (locked || readOnly) {
    return false;
  }
  const sourceIsAnchor = isAnchorEndpoint(nodeMap.get(edge.source));
  const targetIsAnchor = isAnchorEndpoint(nodeMap.get(edge.target));
  if (sourceIsAnchor && targetIsAnchor) {
    return false;
  }
  if (sourceIsAnchor) {
    return 'target';
  }
  if (targetIsAnchor) {
    return 'source';
  }
  return true;
}
