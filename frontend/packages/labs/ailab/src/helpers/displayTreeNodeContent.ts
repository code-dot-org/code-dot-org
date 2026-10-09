import {CdoTheme} from '@code-dot-org/component-library/themes';

import {getLocalizedColumnName} from './columnDetails';
import {
  DISPLAY_TREE_ROOT_ID,
  formatNumber,
  getChildNodeId,
  type DisplayTreeNode,
} from './displayTree';
import {TREE_NODE_MAX_WIDTH} from './displayTreeLayout';
import {getLocalizedValue} from './valueDetails';

export const NODE_PADDING_INLINE = 12;
export const PATH_NODE_BORDER = 2;
export const ANSWER_DOT_SIZE = 12;
export const ANSWER_DOT_GAP = 8;

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

// body3's fontSize is in rem.
function labelFont(): string {
  const {fontFamily, fontSize} = CdoTheme.typography.body3;
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return `600 ${parseFloat(String(fontSize)) * rootFontSize}px ${fontFamily}`;
}

let canvasContext: CanvasRenderingContext2D | undefined;

export function measureDisplayTreeNodes(
  root: DisplayTreeNode,
  datasetId: string,
): Map<string, number> {
  const context = (canvasContext ??= document
    .createElement('canvas')
    .getContext('2d')!);
  context.font = labelFont();

  const widths = new Map<string, number>();
  const measure = (node: DisplayTreeNode, id: string) => {
    const contentWidth =
      (node.type === 'answer' ? ANSWER_DOT_SIZE + ANSWER_DOT_GAP : 0) +
      context.measureText(displayNodeLabel(node, datasetId)).width;
    widths.set(
      id,
      Math.min(
        TREE_NODE_MAX_WIDTH,
        Math.ceil(contentWidth + 2 * (NODE_PADDING_INLINE + PATH_NODE_BORDER)),
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
