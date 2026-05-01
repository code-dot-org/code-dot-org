import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

export function isLineEdge(
  edge: SketchlabReactFlowEdge,
  nodes: SketchlabReactFlowNode[]
): boolean {
  if (edge.data?.kind === 'line') {
    return true;
  }
  // Legacy fallback: pre-`data.kind` lines were any edge whose endpoints were
  // both `lineAnchor` nodes. Saved diagrams from before this flag still load
  // correctly via this branch — they get re-tagged on next save.
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);
  return sourceNode?.type === 'lineAnchor' && targetNode?.type === 'lineAnchor';
}

export function isArrowEdge(edge: SketchlabReactFlowEdge): boolean {
  return Boolean(edge.markerStart || edge.markerEnd);
}
