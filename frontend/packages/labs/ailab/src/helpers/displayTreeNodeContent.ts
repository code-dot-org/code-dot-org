import {CdoTheme} from '@code-dot-org/component-library/themes';

import {getLocalizedColumnName} from './columnDetails';
import {
  formatNumber,
  THRESHOLD_SIGNS,
  thresholdValue,
  type DisplayTreeBranch,
  type DisplayTreeNode,
} from './displayTree';
import {TREE_NODE_MAX_WIDTH} from './displayTreeLayout';
import type {
  DisplayTreeCountsLookup,
  DisplayTreeNodeCounts,
} from './displayTreeTrace';
import {getLocalizedValue} from './valueDetails';

export const NODE_PADDING_INLINE = 12;
export const PATH_NODE_BORDER = 2;
export const ANSWER_DOT_SIZE = 12;
export const NODE_GAP = 8;
export const COUNTS_GAP = 6;
export const GRADE_ICON_SIZE = 11;
export const GRADE_ICON_GAP = 3;

const GRADES = ['correct', 'incorrect'] as const;

export type Grade = (typeof GRADES)[number];

export function displayNodeLabel(
  node: DisplayTreeNode,
  datasetId: string
): string {
  return node.type === 'question'
    ? `${getLocalizedColumnName(datasetId, node.column)}?`
    : displayValue(node.prediction, datasetId);
}

export function displayValue(
  value: string | number,
  datasetId: string
): string {
  return typeof value === 'number'
    ? formatNumber(value)
    : String(getLocalizedValue(value, datasetId));
}

const orList = new Intl.ListFormat('en', {type: 'disjunction'});

export function branchLabel(
  branch: DisplayTreeBranch,
  datasetId: string
): {sign?: string; text: string} {
  return branch.kind === 'values'
    ? {
        text: orList.format(
          branch.values.map(value =>
            String(getLocalizedValue(value, datasetId))
          )
        ),
      }
    : {sign: THRESHOLD_SIGNS[branch.kind], text: thresholdValue(branch)};
}

export function rowCountText(counts: DisplayTreeNodeCounts): string {
  const rows = counts.correct + counts.incorrect;
  return `${rows} test ${rows === 1 ? 'row' : 'rows'}`;
}

export function shownGrades(
  node: DisplayTreeNode,
  counts: DisplayTreeNodeCounts
): Grade[] {
  return node.type === 'answer'
    ? GRADES.filter(grade => counts[grade] > 0)
    : [];
}

function textMeasurer(): (
  variant: 'body3' | 'body4',
  weight: number,
  text: string
) => number {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  const context = document.createElement('canvas').getContext('2d')!;
  return (variant, weight, text) => {
    const {fontFamily, fontSize} = CdoTheme.typography[variant];
    const rems = parseFloat(String(fontSize));
    context.font = `${weight} ${rems * rootFontSize}px ${fontFamily}`;
    return context.measureText(text).width;
  };
}

export function nodeWidthMeasurer(
  datasetId: string,
  counts: DisplayTreeCountsLookup
): (node: DisplayTreeNode, id: string) => number {
  const textWidth = textMeasurer();

  const countsWidth = (
    node: DisplayTreeNode,
    nodeCounts: DisplayTreeNodeCounts
  ): number => {
    const shown = shownGrades(node, nodeCounts);
    if (shown.length === 0) {
      return textWidth('body4', 400, rowCountText(nodeCounts));
    }
    return shown.reduce(
      (sum, grade) =>
        sum +
        GRADE_ICON_SIZE +
        GRADE_ICON_GAP +
        textWidth('body4', 600, String(nodeCounts[grade])),
      COUNTS_GAP * (shown.length - 1)
    );
  };

  return (node, id) => {
    const nodeCounts = counts(id);
    const contentWidth =
      (node.type === 'answer' ? ANSWER_DOT_SIZE + NODE_GAP : 0) +
      textWidth('body3', 600, displayNodeLabel(node, datasetId)) +
      NODE_GAP +
      COUNTS_GAP +
      countsWidth(node, nodeCounts);
    return Math.min(
      TREE_NODE_MAX_WIDTH,
      Math.ceil(contentWidth + 2 * (NODE_PADDING_INLINE + PATH_NODE_BORDER))
    );
  };
}
