import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

export function canCreateConnection(
  sourceNodeId: string,
  targetNodeId: string,
  nodes: SketchlabReactFlowNode[],
  edgesToCheck: SketchlabReactFlowEdge[]
) {
  const sourceLimited = isLineAnchorNodeId(sourceNodeId, nodes);
  const targetLimited = isLineAnchorNodeId(targetNodeId, nodes);
  if (sourceLimited && nodeHasAnyEdge(sourceNodeId, edgesToCheck)) {
    return false;
  }
  if (targetLimited && nodeHasAnyEdge(targetNodeId, edgesToCheck)) {
    return false;
  }
  return true;
}

export function isLineAnchorNodeId(
  nodeId: string,
  nodes: SketchlabReactFlowNode[]
) {
  const node = nodes.find(candidate => candidate.id === nodeId);
  return node?.type === 'lineAnchor';
}

function nodeHasAnyEdge(nodeId: string, edges: SketchlabReactFlowEdge[]) {
  return edges.some(edge => edge.source === nodeId || edge.target === nodeId);
}
