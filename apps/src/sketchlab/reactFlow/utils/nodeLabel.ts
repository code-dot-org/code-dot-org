import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

/**
 * Human-readable label for a node, used in screen-reader announcements.
 * Falls back to the node's `type` when no editable text is set.
 */
export function getNodeLabel(node: SketchlabReactFlowNode): string {
  if (node.type === 'shape' && node.data.label) {
    return node.data.label;
  }
  if (node.type === 'text' && node.data.text) {
    return node.data.text;
  }
  return node.type;
}
