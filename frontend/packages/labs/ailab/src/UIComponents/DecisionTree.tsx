/* React component to draw the trained decision tree. */
import {type ReactNode, useMemo} from 'react';

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
import I18n from '../i18n';
import {getDisplayTree} from '../selectors/visualizationSelectors';

// SVG text does not wrap. Sibling branch labels stay apart at this length.
const NODE_TEXT_MAX_LENGTH = 20;
const BRANCH_TEXT_MAX_LENGTH = 22;
const BRANCH_LABEL_HEIGHT = 18;
const BRANCH_LABEL_CHAR_WIDTH = 7;

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
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
      const key =
        branch.kind === 'lessThan'
          ? 'decisionTreeLessThan'
          : 'decisionTreeAtLeast';
      return I18n.t(key, {value: formatNumber(branch.threshold)}) ?? '';
    }
    const values = branch.values.map(valueText);
    if (values.length < 2) {
      return values.join('');
    }
    return (
      I18n.t('decisionTreeValueList', {
        values: values.slice(0, -1).join(', '),
        lastValue: values[values.length - 1],
      }) ?? values.join(', ')
    );
  };

  const nodeText = (node: DisplayTreeNode): string => {
    if (node.type === 'question') {
      const column = getLocalizedColumnName(datasetId, node.column);
      return I18n.t('decisionTreeQuestion', {column}) ?? column;
    }
    return typeof node.prediction === 'number'
      ? formatNumber(node.prediction)
      : valueText(node.prediction);
  };

  const describe = (node: DisplayTreeNode, id: string): ReactNode =>
    node.type === 'answer' ? (
      <li key={id}>
        {I18n.t('decisionTreeAnswer', {prediction: nodeText(node)})}
      </li>
    ) : (
      <li key={id}>
        {nodeText(node)}
        <ul>
          {node.branches.map((branch, index) => (
            <li key={`${id}.${index}`}>
              {branchText(branch)}
              <ul>{describe(branch.child, `${id}.${index}`)}</ul>
            </li>
          ))}
        </ul>
      </li>
    );

  return (
    <div id="uitest-decision-tree" style={styles.decisionTree}>
      <div style={{...styles.decisionTreeHeader, ...styles.bold}}>
        {I18n.t('decisionTreeHeader')}
      </div>
      <div style={styles.decisionTreeScroll}>
        <svg
          width={layout.width}
          height={layout.height}
          aria-hidden="true"
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
            const text = branchText(placed.branch);
            const shown = truncate(text, BRANCH_TEXT_MAX_LENGTH);
            const centerX = placed.x + TREE_NODE_WIDTH / 2;
            const centerY = placed.y - TREE_ROW_GAP / 4;
            const width = shown.length * BRANCH_LABEL_CHAR_WIDTH + 12;
            return (
              <g key={`branch-${placed.id}`}>
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
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {shown}
                </text>
              </g>
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
                  fill={isAnswer ? 'white' : 'black'}
                >
                  {truncate(text, NODE_TEXT_MAX_LENGTH)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <ul style={styles.visuallyHidden}>{describe(tree, '0')}</ul>
    </div>
  );
};

export default DecisionTree;
