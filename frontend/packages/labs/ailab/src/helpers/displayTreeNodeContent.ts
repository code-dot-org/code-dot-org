import {getLocalizedColumnName} from './columnDetails';
import {
  DISPLAY_TREE_ROOT_ID,
  formatNumber,
  getChildNodeId,
  type DisplayTreeNode,
} from './displayTree';
import {TREE_NODE_MAX_WIDTH} from './displayTreeLayout';
import {NO_ROWS, type DisplayTreeNodeCounts} from './displayTreeTrace';
import {getLocalizedValue} from './valueDetails';

// The node box in decisionTree.module.scss, which these must match.
const NODE_PADDING = 12;
const NODE_BORDER = 2;
const ANSWER_DOT_SIZE = 12;
const ANSWER_DOT_GAP = 8;
const LABEL_GAP = 14;
const GRADES_GAP = 6;
const GRADE_ICON_SIZE = 11;
const GRADE_ICON_GAP = 3;

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

let context: CanvasRenderingContext2D | undefined;

function textWidth(text: string, font: string): number {
  context ??= document.createElement('canvas').getContext('2d')!;
  context.font = font;
  return context.measureText(text).width;
}

export function measureDisplayTreeNodes(
  root: DisplayTreeNode,
  counts: Map<string, DisplayTreeNodeCounts>,
  datasetId: string,
): Map<string, number> {
  const family = getComputedStyle(document.documentElement).getPropertyValue(
    '--font-family-main',
  );
  const labelFont = `600 14px ${family}`;
  const rowsFont = `400 12px ${family}`;
  const gradeFont = `600 12px ${family}`;

  const countsWidth = (
    node: DisplayTreeNode,
    nodeCounts: DisplayTreeNodeCounts,
  ): number => {
    if (!showsGrades(node, nodeCounts)) {
      return textWidth(rowCountText(rowCount(nodeCounts)), rowsFont);
    }
    const shown = GRADES.filter(grade => nodeCounts[grade] > 0);
    return shown.reduce(
      (sum, grade) =>
        sum +
        GRADE_ICON_SIZE +
        GRADE_ICON_GAP +
        textWidth(String(nodeCounts[grade]), gradeFont),
      GRADES_GAP * (shown.length - 1),
    );
  };

  const widths = new Map<string, number>();
  const measure = (node: DisplayTreeNode, id: string) => {
    const nodeCounts = counts.get(id) ?? NO_ROWS;
    const contentWidth =
      (node.type === 'answer' ? ANSWER_DOT_SIZE + ANSWER_DOT_GAP : 0) +
      textWidth(displayNodeLabel(node, datasetId), labelFont) +
      LABEL_GAP +
      countsWidth(node, nodeCounts);
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
