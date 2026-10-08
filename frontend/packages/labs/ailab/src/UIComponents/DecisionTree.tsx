import {Typography} from '@mui/material';
import classNames from 'classnames';
import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {TEST_PANEL_WIDTH} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {
  DISPLAY_TREE_ROOT_ID,
  formatNumber,
  THRESHOLD_SIGNS,
  thresholdValue,
  type DisplayTreeBranch,
  type DisplayTreeNode,
  type DisplayTreeQuestion,
} from '../helpers/displayTree';
import {
  edgePath,
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
  getPredictionStep,
  getPredictionTrace,
} from '../selectors/visualizationSelectors';

import TreeCanvas from './TreeCanvas';

import styles from './decisionTree.module.scss';

const orList = new Intl.ListFormat('en', {type: 'disjunction'});

const TREE_NAME = "Your model's decision tree";

const HIDDEN_WORDS = {
  is: 'is',
  lessThan: 'less than',
  atLeast: 'at least',
  predicts: ', predicts',
  then: ', then',
  onPath: 'On your path',
};

const BRANCH_LABEL_RISE = 22;

const canvasVariables = {
  '--tree-node-width': `${TREE_NODE_WIDTH}px`,
  '--tree-node-height': `${TREE_NODE_HEIGHT}px`,
  '--tree-branch-offset': `${BRANCH_LABEL_RISE}px`,
} as CSSProperties;

interface KeyHintProps {
  id: string;
  shown: boolean;
  children: ReactNode;
}

const KeyHint = ({id, shown, children}: KeyHintProps) => (
  <Typography
    id={id}
    variant="body4"
    component="span"
    className={classNames(styles.hint, {[styles.shownHint]: shown})}
  >
    {children}
  </Typography>
);

interface DecisionTreeProps {
  overlay?: ReactNode;
}

const DecisionTree = ({overlay}: DecisionTreeProps) => {
  const tree = useAppSelector(getDisplayTree);
  const trace = useAppSelector(getPredictionTrace);
  const step = useAppSelector(getPredictionStep);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const layout = useMemo(
    () => (tree ? layoutDisplayTree(tree) : undefined),
    [tree],
  );
  const pathIds = useMemo(() => new Set(trace?.path), [trace]);
  const reachedIds = useMemo(
    () => new Set(trace?.path.slice(0, step + 1)),
    [trace, step],
  );
  const currentId = trace?.path[step];
  const nextId = trace?.path[step + 1];
  const stepBounds = useMemo(() => {
    if (!layout || !trace) {
      return undefined;
    }
    const shown = trace.path.slice(step, step + 2);
    return getNodesBounds(
      layout.nodes.filter(placed => shown.includes(placed.id)),
    );
  }, [layout, trace, step]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const enterHintId = useId();
  const keysHintId = useId();
  const nameId = useId();
  const [focusedId, setFocusedId] = useState(DISPLAY_TREE_ROOT_ID);
  const [entered, setEntered] = useState(false);
  const nodeElements = useRef(new Map<string, HTMLElement>());

  if (!tree || !layout) {
    return null;
  }

  const tabStopId = layout.nodes.some(placed => placed.id === focusedId)
    ? focusedId
    : DISPLAY_TREE_ROOT_ID;

  const textId = (id: string) => `${nameId}-text-${id}`;
  const columnId = (id: string) => `${nameId}-column-${id}`;
  const branchId = (id: string) => `${nameId}-branch-${id}`;
  const wordId = (word: string) => `${nameId}-${word}`;

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

  const trackEntered = (event: FocusEvent<HTMLElement>) =>
    setEntered(event.target !== event.currentTarget);

  const leaveWhenFocusLeaves = ({
    currentTarget,
    relatedTarget,
  }: FocusEvent<HTMLElement>) => {
    if (!currentTarget.contains(relatedTarget)) {
      setEntered(false);
    }
  };

  const enterOrLeave = (event: KeyboardEvent<HTMLElement>) => {
    const onCanvas = event.target === event.currentTarget;
    if (event.key === 'Enter' && onCanvas) {
      event.preventDefault();
      nodeElements.current.get(tabStopId)?.focus({preventScroll: true});
    } else if (event.key === 'Escape' && !onCanvas) {
      event.preventDefault();
      event.currentTarget.focus();
    }
  };

  const valueText = (value: string): string =>
    String(getLocalizedValue(value, datasetId));

  const branchLabel = (
    branch: DisplayTreeBranch,
  ): {sign?: string; text: string} =>
    branch.kind === 'values'
      ? {text: orList.format(branch.values.map(valueText))}
      : {sign: THRESHOLD_SIGNS[branch.kind], text: thresholdValue(branch)};

  const columnText = (node: DisplayTreeQuestion): string =>
    getLocalizedColumnName(datasetId, node.column);

  const nodeText = (node: DisplayTreeNode): string => {
    if (node.type === 'question') {
      return `${columnText(node)}?`;
    }
    return typeof node.prediction === 'number'
      ? formatNumber(node.prediction)
      : valueText(node.prediction);
  };

  const pathBounds =
    trace &&
    getNodesBounds(layout.nodes.filter(placed => pathIds.has(placed.id)));

  // Marks draw as a layer over every edge, so a sibling edge cannot paint over the stub they share.
  const edges = layout.nodes.flatMap(placed =>
    placed.parent ? [{id: placed.id, d: edgePath(placed.parent, placed)}] : [],
  );

  return (
    <div id="uitest-decision-tree" className={styles.decisionTree}>
      {Object.entries(HIDDEN_WORDS).map(([word, text]) => (
        <span key={word} id={wordId(word)} hidden>
          {text}
        </span>
      ))}
      <div className={styles.canvasArea}>
        <TreeCanvas
          contentWidth={layout.width}
          contentHeight={layout.height}
          pathBounds={pathBounds}
          stepBounds={stepBounds}
          overlayRef={overlayRef}
          toolbarTabbable={entered}
          hints={
            <span className={styles.hints}>
              <KeyHint id={enterHintId} shown={!entered}>
                Press Enter to explore the tree
              </KeyHint>
              <KeyHint id={keysHintId} shown={entered}>
                Use the arrow keys to move, and Escape to exit
              </KeyHint>
            </span>
          }
          role="group"
          aria-label={TREE_NAME}
          aria-describedby={enterHintId}
          tabIndex={0}
          onFocus={trackEntered}
          onBlur={leaveWhenFocusLeaves}
          onKeyDown={enterOrLeave}
          className={styles.canvasGroup}
        >
          <div
            role="tree"
            aria-label={TREE_NAME}
            aria-describedby={keysHintId}
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
              {edges.map(({id, d}) => (
                <path key={id} d={d} />
              ))}
              <g className={styles.marks}>
                {edges.map(({id, d}) => (
                  <path
                    key={id}
                    d={d}
                    className={classNames({
                      [styles.pathEdge]: reachedIds.has(id),
                      [styles.nextEdge]: id === nextId,
                    })}
                  />
                ))}
              </g>
            </svg>
            {layout.nodes.map(placed => {
              const text = nodeText(placed.node);
              const label = placed.branch && branchLabel(placed.branch);
              const branch = label?.sign
                ? `${label.sign} ${label.text}`
                : label?.text;
              const kind =
                placed.node.type === 'answer' ? styles.answer : styles.question;
              const siblings = placed.parent?.children ?? [placed];
              const nameParts = [
                placed.parent && columnId(placed.parent.id),
                placed.parent && wordId('is'),
                placed.branch &&
                  placed.branch.kind !== 'values' &&
                  wordId(placed.branch.kind),
                placed.branch && branchId(placed.id),
                placed.node.type === 'answer' && wordId('predicts'),
                placed.parent &&
                  placed.node.type === 'question' &&
                  wordId('then'),
                textId(placed.id),
              ];
              return (
                <div
                  key={placed.id}
                  ref={element => trackNodeElement(placed.id, element)}
                  // eslint-disable-next-line jsx-a11y/role-has-required-aria-props -- ARIA 1.2 requires no aria-selected, and nodes are not selectable
                  role="treeitem"
                  aria-labelledby={nameParts.filter(Boolean).join(' ')}
                  aria-describedby={
                    [
                      placed.id === DISPLAY_TREE_ROOT_ID && keysHintId,
                      reachedIds.has(placed.id) && wordId('onPath'),
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                  aria-current={placed.id === currentId ? 'step' : undefined}
                  aria-expanded={placed.node.type === 'question' || undefined}
                  aria-level={placed.depth + 1}
                  aria-setsize={siblings.length}
                  aria-posinset={siblings.indexOf(placed) + 1}
                  tabIndex={entered && placed.id === tabStopId ? 0 : -1}
                  onFocus={() => setFocusedId(placed.id)}
                  onKeyDown={event => moveFocus(event, placed)}
                  className={styles.nodeSlot}
                  style={{left: placed.x, top: placed.y}}
                >
                  {label?.text && (
                    <div
                      title={branch}
                      className={classNames(styles.branch, {
                        [styles.pathBranch]: reachedIds.has(placed.id),
                        [styles.nextBranch]: placed.id === nextId,
                      })}
                    >
                      {label.sign && `${label.sign} `}
                      <span id={branchId(placed.id)}>{label.text}</span>
                    </div>
                  )}
                  <div
                    title={text}
                    className={classNames(styles.node, kind, {
                      [styles.pathNode]: reachedIds.has(placed.id),
                    })}
                  >
                    <span id={textId(placed.id)} className={styles.nodeText}>
                      {placed.node.type === 'question' ? (
                        <>
                          <span id={columnId(placed.id)}>
                            {columnText(placed.node)}
                          </span>
                          ?
                        </>
                      ) : (
                        text
                      )}
                    </span>
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
