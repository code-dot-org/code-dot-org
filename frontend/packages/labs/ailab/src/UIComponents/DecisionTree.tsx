import classNames from 'classnames';
import {type CSSProperties, useMemo} from 'react';

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
import {
  getDisplayTree,
  getPredictionTrace,
} from '../selectors/visualizationSelectors';

import shared from '../shared.module.scss';
import styles from './decisionTree.module.scss';

const orList = new Intl.ListFormat('en', {type: 'disjunction'});

const canvasVariables = {
  '--tree-node-width': `${TREE_NODE_WIDTH}px`,
  '--tree-node-height': `${TREE_NODE_HEIGHT}px`,
  '--tree-branch-offset': `${TREE_ROW_GAP / 4}px`,
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
  const trace = useAppSelector(getPredictionTrace);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const layout = useMemo(
    () => (tree ? layoutDisplayTree(tree) : undefined),
    [tree],
  );
  const pathIds = useMemo(() => new Set(trace?.path), [trace]);

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

  // Path edges go last so a sibling edge cannot paint over the stub they share.
  const edgeOrder = [...layout.nodes].sort(
    (a, b) => Number(pathIds.has(a.id)) - Number(pathIds.has(b.id)),
  );

  return (
    <div id="uitest-decision-tree" className={styles.decisionTree}>
      <div className={classNames(styles.header, shared.bold)}>
        Your model's decision tree
      </div>
      <div className={styles.scroll}>
        <div
          role="img"
          aria-label="Diagram of your model's decision tree"
          className={styles.canvas}
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
            className={styles.edges}
          >
            {edgeOrder.map(
              placed =>
                placed.parent && (
                  <path
                    key={placed.id}
                    d={edgePath(placed.parent, placed)}
                    className={classNames({
                      [styles.pathEdge]: pathIds.has(placed.id),
                    })}
                  />
                ),
            )}
          </svg>
          {layout.nodes.map(placed => {
            const text = nodeText(placed.node);
            const branch = placed.branch && branchText(placed.branch);
            const kind =
              placed.node.type === 'answer' ? styles.answer : styles.question;
            return (
              <div
                key={placed.id}
                className={styles.nodeSlot}
                style={{left: placed.x, top: placed.y}}
              >
                {branch && (
                  <div title={branch} className={styles.branch}>
                    {branch}
                  </div>
                )}
                <div
                  title={text}
                  className={classNames(styles.node, kind, {
                    [styles.pathNode]: pathIds.has(placed.id),
                  })}
                >
                  <span className={styles.nodeText}>{text}</span>
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
