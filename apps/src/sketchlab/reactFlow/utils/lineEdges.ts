import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

export function isLineEdge(
  edge: SketchlabReactFlowEdge,
  nodes: SketchlabReactFlowNode[]
): boolean {
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);
  return sourceNode?.type === 'lineAnchor' && targetNode?.type === 'lineAnchor';
}
