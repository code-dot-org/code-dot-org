import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

/**
 * Human-readable label for a node, used in screen-reader announcements.
 */
export function getNodeLabel(node: SketchlabReactFlowNode): string {
  if (node.type === 'shape') {
    return node.data.label
      ? `${node.data.shapeType} with label ${node.data.label}`
      : node.data.shapeType;
  }
  if (node.type === 'text' && node.data.text) {
    return node.data.text;
  }
  if (node.type === 'image') {
    return node.data.altText || 'image';
  }
  // lineAnchor is an internal implementation detail; callers that need a
  // user-facing description should check for this type before calling.
  return node.type;
}

const MAX_LABEL_WORDS = 10;

function truncateToWords(text: string): string {
  const words = text.trim().split(/\s+/);
  return words.length > MAX_LABEL_WORDS
    ? `${words.slice(0, MAX_LABEL_WORDS).join(' ')}...`
    : text;
}

/**
 * Aria label for an edge, describing its endpoints in human-readable terms.
 * For a free-floating line (both endpoints are node anchors) the
 * label is simply "Line". When one or both endpoints are real nodes the
 * source and target are described using getNodeLabel.
 */
export function getEdgeLabel(
  edge: SketchlabReactFlowEdge,
  nodeMap: Map<string, SketchlabReactFlowNode>,
  lineIndex?: number
): string {
  const sourceNode = nodeMap.get(edge.source);
  const targetNode = nodeMap.get(edge.target);

  const sourceIsAnchor = !sourceNode || sourceNode.type === 'lineAnchor';
  const targetIsAnchor = !targetNode || targetNode.type === 'lineAnchor';

  if (sourceIsAnchor && targetIsAnchor) {
    return lineIndex !== undefined ? `Line ${lineIndex}` : 'Line';
  }

  const sourceLabel = sourceIsAnchor
    ? 'line endpoint'
    : truncateToWords(getNodeLabel(sourceNode!));
  const targetLabel = targetIsAnchor
    ? 'line endpoint'
    : truncateToWords(getNodeLabel(targetNode!));
  return `Line from ${sourceLabel} to ${targetLabel}`;
}
