import {getLocalizedColumnName} from './columnDetails';
import {
  DISPLAY_TREE_ROOT_ID,
  formatNumber,
  getChildNodeId,
  type DisplayTreeNode,
} from './displayTree';
import {TREE_NODE_MAX_WIDTH} from './displayTreeLayout';
import {getLocalizedValue} from './valueDetails';

// The node box in decisionTree.module.scss, which these must match.
const NODE_PADDING = 12;
const NODE_BORDER = 2;
const ANSWER_DOT_SIZE = 12;
const ANSWER_DOT_GAP = 8;

export function displayNodeLabel(
  node: DisplayTreeNode,
  datasetId: string,
): string {
  if (node.type === 'question') {
    return `${getLocalizedColumnName(datasetId, node.column)}?`;
  }
  return typeof node.prediction === 'number'
    ? formatNumber(node.prediction)
    : String(getLocalizedValue(node.prediction, datasetId));
}

let context: CanvasRenderingContext2D | undefined;

function textWidth(text: string, font: string): number {
  context ??= document.createElement('canvas').getContext('2d')!;
  context.font = font;
  return context.measureText(text).width;
}

export function measureDisplayTreeNodes(
  root: DisplayTreeNode,
  datasetId: string,
): Map<string, number> {
  const family = getComputedStyle(document.documentElement).getPropertyValue(
    '--font-family-main',
  );
  const labelFont = `600 14px ${family}`;

  const widths = new Map<string, number>();
  const measure = (node: DisplayTreeNode, id: string) => {
    const contentWidth =
      (node.type === 'answer' ? ANSWER_DOT_SIZE + ANSWER_DOT_GAP : 0) +
      textWidth(displayNodeLabel(node, datasetId), labelFont);
    widths.set(
      id,
      Math.min(
        TREE_NODE_MAX_WIDTH,
        Math.ceil(contentWidth + 2 * (NODE_PADDING + NODE_BORDER)),
      ),
    );
    if (node.type === 'question') {
      node.branches.forEach((branch, index) =>
        measure(branch.child, getChildNodeId(id, index)),
      );
    }
  };
  measure(root, DISPLAY_TREE_ROOT_ID);

  return widths;
}
