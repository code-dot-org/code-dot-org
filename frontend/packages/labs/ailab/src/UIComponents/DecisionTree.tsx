import {type CSSProperties, useMemo} from 'react';

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

import moduleStyles from './decisionTree.module.scss';

const orList = new Intl.ListFormat('en', {type: 'disjunction'});

const canvasVariables = {
  '--tree-node-width': `${TREE_NODE_WIDTH}px`,
  '--tree-node-height': `${TREE_NODE_HEIGHT}px`,
  '--tree-branch-offset': `${TREE_ROW_GAP / 4}px`,
  '--tree-question-color': colors.feature,
  '--tree-answer-color': colors.label,
} as CSSProperties;

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
      const sign = branch.kind === 'lessThan' ? '<' : '≥';
      return `${sign} ${branch.threshold}`;
    }
    return orList.format(branch.values.map(valueText));
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
    <div id="uitest-decision-tree" className={moduleStyles.decisionTree}>
      <div className={moduleStyles.header} style={styles.bold}>
        Your model's decision tree
      </div>
      <div className={moduleStyles.scroll}>
        <div
          role="img"
          aria-label="Diagram of your model's decision tree"
          className={moduleStyles.canvas}
          style={{
            ...canvasVariables,
            width: layout.width,
            height: layout.height,
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
            className={moduleStyles.edges}
          >
            {layout.nodes.map(
              placed =>
                placed.parent && (
                  <path key={placed.id} d={edgePath(placed.parent, placed)} />
                ),
            )}
          </svg>
          {layout.nodes.map(placed => {
            const text = nodeText(placed.node);
            const branch = placed.branch && branchText(placed.branch);
            const kind =
              placed.node.type === 'answer'
                ? moduleStyles.answer
                : moduleStyles.question;
            return (
              <div
                key={placed.id}
                className={moduleStyles.nodeSlot}
                style={{left: placed.x, top: placed.y}}
              >
                {branch && (
                  <div title={branch} className={moduleStyles.branch}>
                    {branch}
                  </div>
                )}
                <div title={text} className={`${moduleStyles.node} ${kind}`}>
                  <span className={moduleStyles.nodeText}>{text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DecisionTree;
