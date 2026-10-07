import classNames from 'classnames';
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';

import {TEST_PANEL_WIDTH} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {
  DISPLAY_TREE_ROOT_ID,
  formatNumber,
  thresholdText,
  type DisplayTreeBranch,
  type DisplayTreeNode,
} from '../helpers/displayTree';
import {
  getNodesBounds,
  layoutDisplayTree,
  type PlacedTreeNode,
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH,
} from '../helpers/displayTreeLayout';
import {getNodeForKey} from '../helpers/displayTreeNavigation';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {
  getDisplayTree,
  getPredictionTrace,
} from '../selectors/visualizationSelectors';

import TreeCanvas from './TreeCanvas';

import styles from './decisionTree.module.scss';

const orList = new Intl.ListFormat('en', {type: 'disjunction'});

const EDGE_BEND_DROP = 20;
const EDGE_CORNER_RADIUS = 8;
const BRANCH_LABEL_RISE = 22;

const canvasVariables = {
  '--tree-node-width': `${TREE_NODE_WIDTH}px`,
  '--tree-node-height': `${TREE_NODE_HEIGHT}px`,
  '--tree-branch-offset': `${BRANCH_LABEL_RISE}px`,
} as CSSProperties;

function edgePath(parent: PlacedTreeNode, child: PlacedTreeNode): string {
  const startX = parent.x + TREE_NODE_WIDTH / 2;
  const startY = parent.y + TREE_NODE_HEIGHT;
  const endX = child.x + TREE_NODE_WIDTH / 2;
  const bendY = startY + EDGE_BEND_DROP;
  const radius = Math.min(EDGE_CORNER_RADIUS, Math.abs(endX - startX) / 2);
  const turn = Math.sign(endX - startX) * radius;
  return [
    `M ${startX} ${startY}`,
    `V ${bendY - radius}`,
    `Q ${startX} ${bendY} ${startX + turn} ${bendY}`,
    `H ${endX - turn}`,
    `Q ${endX} ${bendY} ${endX} ${bendY + radius}`,
    `V ${child.y}`,
  ].join(' ');
}

interface DecisionTreeProps {
  overlay?: ReactNode;
}

const DecisionTree = ({overlay}: DecisionTreeProps) => {
  const tree = useAppSelector(getDisplayTree);
  const trace = useAppSelector(getPredictionTrace);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const layout = useMemo(
    () => (tree ? layoutDisplayTree(tree) : undefined),
    [tree],
  );
  const pathIds = useMemo(() => new Set(trace?.path), [trace]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState(DISPLAY_TREE_ROOT_ID);
  const nodeElements = useRef(new Map<string, HTMLElement>());

  if (!tree || !layout) {
    return null;
  }

  const tabStopId = layout.nodes.some(placed => placed.id === focusedId)
    ? focusedId
    : DISPLAY_TREE_ROOT_ID;

  const trackNodeElement = (id: string, element: HTMLElement | null) => {
    if (element) {
      nodeElements.current.set(id, element);
    } else {
      nodeElements.current.delete(id);
    }
  };

  const moveFocus = (event: KeyboardEvent, from: PlacedTreeNode) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    const to = getNodeForKey(layout.nodes, from, event.key);
    if (to) {
      event.preventDefault();
      nodeElements.current.get(to.id)?.focus({preventScroll: true});
    }
  };

  const valueText = (value: string): string =>
    String(getLocalizedValue(value, datasetId));

  const branchText = (branch: DisplayTreeBranch): string => {
    if (branch.kind !== 'values') {
      return thresholdText(branch);
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

  const pathBounds =
    trace &&
    getNodesBounds(layout.nodes.filter(placed => pathIds.has(placed.id)));

  // Path edges go last so a sibling edge cannot paint over the stub they share.
  const edgeOrder = [...layout.nodes].sort(
    (a, b) => Number(pathIds.has(a.id)) - Number(pathIds.has(b.id)),
  );

  return (
    <div id="uitest-decision-tree" className={styles.decisionTree}>
      <div className={styles.canvasArea}>
        <TreeCanvas
          contentWidth={layout.width}
          contentHeight={layout.height}
          pathBounds={pathBounds}
          overlayRef={overlayRef}
        >
          <div
            role="tree"
            aria-label="Your model's decision tree"
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
              const siblings = placed.parent?.children ?? [placed];
              return (
                <div
                  key={placed.id}
                  ref={element => trackNodeElement(placed.id, element)}
                  // eslint-disable-next-line jsx-a11y/role-has-required-aria-props -- ARIA 1.2 requires no aria-selected, and nodes are not selectable
                  role="treeitem"
                  aria-level={placed.depth + 1}
                  aria-setsize={siblings.length}
                  aria-posinset={siblings.indexOf(placed) + 1}
                  tabIndex={placed.id === tabStopId ? 0 : -1}
                  onFocus={() => setFocusedId(placed.id)}
                  onKeyDown={event => moveFocus(event, placed)}
                  className={styles.nodeSlot}
                  style={{left: placed.x, top: placed.y}}
                >
                  {branch && (
                    <div
                      title={branch}
                      className={classNames(styles.branch, {
                        [styles.pathBranch]: pathIds.has(placed.id),
                      })}
                    >
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
        </TreeCanvas>
        {overlay && (
          <div
            ref={overlayRef}
            className={styles.overlay}
            style={{width: TEST_PANEL_WIDTH}}
          >
            {overlay}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionTree;
