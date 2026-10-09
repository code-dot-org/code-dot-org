import {CdoTheme} from '@code-dot-org/component-library/themes';

import {getLocalizedColumnName} from './columnDetails';
import {formatNumber, type DisplayTreeNode} from './displayTree';
import {TREE_NODE_MAX_WIDTH} from './displayTreeLayout';
import {NO_ROWS, type DisplayTreeNodeCounts} from './displayTreeTrace';
import {getLocalizedValue} from './valueDetails';

export const NODE_PADDING_INLINE = 12;
export const PATH_NODE_BORDER = 2;
export const ANSWER_DOT_SIZE = 12;
export const NODE_GAP = 8;
export const COUNTS_GAP = 6;
export const GRADE_ICON_SIZE = 11;
export const GRADE_ICON_GAP = 3;

const GRADES = ['correct', 'incorrect'] as const;

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

export function rowCount(counts: DisplayTreeNodeCounts): number {
  return counts.correct + counts.incorrect;
}

export function rowCountText(rows: number): string {
  return `${rows} test ${rows === 1 ? 'row' : 'rows'}`;
}

export function showsGrades(
  node: DisplayTreeNode,
  counts: DisplayTreeNodeCounts,
): boolean {
  return node.type === 'answer' && rowCount(counts) > 0;
}

function textMeasurer(
  variant: 'body3' | 'body4',
  weight: number,
): (text: string) => number {
  const {fontFamily, fontSize} = CdoTheme.typography[variant];
  const rems = parseFloat(String(fontSize));
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  const context = document.createElement('canvas').getContext('2d')!;
  context.font = `${weight} ${rems * rootFontSize}px ${fontFamily}`;
  return text => context.measureText(text).width;
}

export function nodeWidthMeasurer(
  datasetId: string,
  counts: Map<string, DisplayTreeNodeCounts>,
): (node: DisplayTreeNode, id: string) => number {
  const labelWidth = textMeasurer('body3', 600);
  const rowsWidth = textMeasurer('body4', 400);
  const gradeWidth = textMeasurer('body4', 600);

  const countsWidth = (
    node: DisplayTreeNode,
    nodeCounts: DisplayTreeNodeCounts,
  ): number => {
    if (!showsGrades(node, nodeCounts)) {
      return rowsWidth(rowCountText(rowCount(nodeCounts)));
    }
    const shown = GRADES.filter(grade => nodeCounts[grade] > 0);
    return shown.reduce(
      (sum, grade) =>
        sum +
        GRADE_ICON_SIZE +
        GRADE_ICON_GAP +
        gradeWidth(String(nodeCounts[grade])),
      COUNTS_GAP * (shown.length - 1),
    );
  };

  return (node, id) => {
    const nodeCounts = counts.get(id) ?? NO_ROWS;
    const contentWidth =
      (node.type === 'answer' ? ANSWER_DOT_SIZE + NODE_GAP : 0) +
      labelWidth(displayNodeLabel(node, datasetId)) +
      NODE_GAP +
      COUNTS_GAP +
      countsWidth(node, nodeCounts);
    return Math.min(
      TREE_NODE_MAX_WIDTH,
      Math.ceil(contentWidth + 2 * (NODE_PADDING_INLINE + PATH_NODE_BORDER)),
    );
  };
}
