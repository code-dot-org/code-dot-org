import {CdoTheme} from '@code-dot-org/component-library/themes';

import {getLocalizedColumnName} from './columnDetails';
import {formatNumber, type DisplayTreeNode} from './displayTree';
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

export function nodeWidthMeasurer(
  datasetId: string,
): (node: DisplayTreeNode) => number {
  const context = document.createElement('canvas').getContext('2d')!;
  context.font = labelFont();

  return node => {
    const contentWidth =
      (node.type === 'answer' ? ANSWER_DOT_SIZE + ANSWER_DOT_GAP : 0) +
      context.measureText(displayNodeLabel(node, datasetId)).width;
    return Math.min(
      TREE_NODE_MAX_WIDTH,
      Math.ceil(contentWidth + 2 * (NODE_PADDING_INLINE + PATH_NODE_BORDER)),
    );
  };
}
