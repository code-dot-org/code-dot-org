import {useMemo} from 'react';

import {styles} from '../constants';
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
        <div
          role="img"
          aria-label="Diagram of your model's decision tree"
          style={{
            ...styles.decisionTreeCanvas,
            width: layout.width,
            height: layout.height,
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            aria-hidden="true"
            style={styles.decisionTreeEdges}
          >
            {layout.nodes.map(
              placed =>
                placed.parent && (
                  <path
                    key={placed.id}
                    d={edgePath(placed.parent, placed)}
                    fill="none"
                    stroke="grey"
                    strokeWidth={1.5}
                  />
                ),
            )}
          </svg>
          {layout.nodes.map(placed => {
            const text = nodeText(placed.node);
            const branch = placed.branch && branchText(placed.branch);
            return (
              <div
                key={placed.id}
                style={{
                  position: 'absolute',
                  left: placed.x,
                  top: placed.y,
                  width: TREE_NODE_WIDTH,
                  height: TREE_NODE_HEIGHT,
                }}
              >
                {branch && (
                  <div
                    title={branch}
                    style={{
                      ...styles.decisionTreeBranch,
                      top: -TREE_ROW_GAP / 4,
                    }}
                  >
                    {branch}
                  </div>
                )}
                <div
                  title={text}
                  style={{
                    ...styles.decisionTreeNode,
                    ...(placed.node.type === 'answer'
                      ? styles.decisionTreeAnswer
                      : styles.decisionTreeQuestion),
                  }}
                >
                  <span style={styles.decisionTreeNodeText}>{text}</span>
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
