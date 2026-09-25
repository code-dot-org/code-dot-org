import {useLayoutEffect, useMemo, useRef, useState} from 'react';

import {colors, styles} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import type {DisplayTreeBranch, DisplayTreeNode} from '../helpers/displayTree';
import {
  layoutDisplayTree,
  type PlacedTreeNode,
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH,
  TREE_ROW_GAP,
} from '../helpers/displayTreeLayout';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {getDisplayTree} from '../selectors/visualizationSelectors';

const NODE_TEXT_MAX_LENGTH = 20;
const BRANCH_TEXT_MAX_LENGTH = 22;
const BRANCH_LABEL_HEIGHT = 18;
const BRANCH_LABEL_PADDING = 12;
const BRANCH_LABEL_MAX_WIDTH = TREE_NODE_WIDTH;
const BRANCH_LABEL_CHAR_WIDTH = 7;

function truncate(text: string, maxLength: number): string {
  const characters = Array.from(text);
  return characters.length > maxLength
    ? `${characters.slice(0, maxLength - 1).join('')}…`
    : text;
}

function formatNumber(value: number): string {
  return String(Number(value.toFixed(2)));
}

function edgePath(parent: PlacedTreeNode, child: PlacedTreeNode): string {
  const startX = parent.x + TREE_NODE_WIDTH / 2;
  const startY = parent.y + TREE_NODE_HEIGHT;
  const endX = child.x + TREE_NODE_WIDTH / 2;
  return `M ${startX} ${startY} V ${startY + TREE_ROW_GAP / 2} H ${endX} V ${child.y}`;
}

interface BranchLabelProps {
  text: string;
  centerX: number;
  centerY: number;
}

const BranchLabel = ({text, centerX, centerY}: BranchLabelProps) => {
  const shown = truncate(text, BRANCH_TEXT_MAX_LENGTH);
  const textRef = useRef<SVGTextElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>();

  useLayoutEffect(() => {
    setMeasuredWidth(textRef.current?.getComputedTextLength?.());
  }, [shown]);

  const textWidth =
    measuredWidth ?? Array.from(shown).length * BRANCH_LABEL_CHAR_WIDTH;
  const maxTextWidth = BRANCH_LABEL_MAX_WIDTH - BRANCH_LABEL_PADDING;
  const squeeze = measuredWidth !== undefined && textWidth > maxTextWidth;
  const width = Math.min(textWidth, maxTextWidth) + BRANCH_LABEL_PADDING;

  return (
    <g>
      <title>{text}</title>
      <rect
        x={centerX - width / 2}
        y={centerY - BRANCH_LABEL_HEIGHT / 2}
        width={width}
        height={BRANCH_LABEL_HEIGHT}
        rx={BRANCH_LABEL_HEIGHT / 2}
        fill="white"
        stroke="grey"
      />
      <text
        ref={textRef}
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        textLength={squeeze ? maxTextWidth : undefined}
        lengthAdjust={squeeze ? 'spacingAndGlyphs' : undefined}
      >
        {shown}
      </text>
    </g>
  );
};

const DecisionTree = () => {
  const tree = useAppSelector(getDisplayTree);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const layout = useMemo(
    () => (tree ? layoutDisplayTree(tree) : undefined),
    [tree],
  );

  if (!tree || !layout) {
    return null;
  }

  const valueText = (value: string): string =>
    String(getLocalizedValue(value, datasetId));

  const branchText = (branch: DisplayTreeBranch): string => {
    if (branch.kind !== 'values') {
      const sign = branch.kind === 'lessThan' ? '<' : '≥';
      // Unrounded: any rounding can put a row on the wrong side of the threshold
      return `${sign} ${branch.threshold}`;
    }
    const values = branch.values.map(valueText);
    if (values.length < 2) {
      return values.join('');
    }
    return `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`;
  };

  const nodeText = (node: DisplayTreeNode): string => {
    if (node.type === 'question') {
      return `${getLocalizedColumnName(datasetId, node.column)}?`;
    }
    return typeof node.prediction === 'number'
      ? formatNumber(node.prediction)
      : valueText(node.prediction);
  };

  return (
    <div id="uitest-decision-tree" style={styles.decisionTree}>
      <div style={{...styles.decisionTreeHeader, ...styles.bold}}>
        Your model's decision tree
      </div>
      <div style={styles.decisionTreeScroll}>
        <svg
          width={layout.width}
          height={layout.height}
          role="img"
          aria-label="Diagram of your model's decision tree"
          style={{display: 'block'}}
        >
          {layout.nodes.map(
            placed =>
              placed.parent && (
                <path
                  key={`edge-${placed.id}`}
                  d={edgePath(placed.parent, placed)}
                  fill="none"
                  stroke="grey"
                  strokeWidth={1.5}
                />
              ),
          )}
          {layout.nodes.map(placed => {
            if (!placed.branch) {
              return null;
            }
            return (
              <BranchLabel
                key={`branch-${placed.id}`}
                text={branchText(placed.branch)}
                centerX={placed.x + TREE_NODE_WIDTH / 2}
                centerY={placed.y - TREE_ROW_GAP / 4}
              />
            );
          })}
          {layout.nodes.map(placed => {
            const isAnswer = placed.node.type === 'answer';
            const text = nodeText(placed.node);
            return (
              <g key={`node-${placed.id}`}>
                <title>{text}</title>
                <rect
                  x={placed.x}
                  y={placed.y}
                  width={TREE_NODE_WIDTH}
                  height={TREE_NODE_HEIGHT}
                  rx={6}
                  fill={isAnswer ? colors.label : 'white'}
                  stroke={isAnswer ? colors.label : colors.feature}
                  strokeWidth={2}
                />
                <text
                  x={placed.x + TREE_NODE_WIDTH / 2}
                  y={placed.y + TREE_NODE_HEIGHT / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                >
                  {truncate(text, NODE_TEXT_MAX_LENGTH)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default DecisionTree;
