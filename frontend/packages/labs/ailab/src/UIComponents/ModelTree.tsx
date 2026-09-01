/* React component to draw the trained decision tree. */
import {useMemo} from 'react';

import {colors, styles} from '../constants';
import {
  buildTreeView,
  countLeaves,
  getTreeDepth,
  type TreeViewNode,
} from '../helpers/treeStructure';
import {useAppSelector} from '../hooks';

/*
  The tree is drawn left to right, one column per level. The trainer's
  candidate depths bound the number of columns at nine, while the number of
  leaves doubles with every level, so the growing dimension is the vertical
  one. Laying it out this way keeps the root at the left edge, in view, and
  puts the overflow on the axis a reader expects to scroll.
*/
const NODE_WIDTH = 168;
const NODE_HEIGHT = 46;
const COLUMN_GAP = 56;
const ROW_GAP = 14;
const MARGIN = 20;
const CHARS_PER_LINE = 26;
const MAX_LINES = 2;
const LINE_HEIGHT = 13;

const COLUMN_PITCH = NODE_WIDTH + COLUMN_GAP;
const ROW_PITCH = NODE_HEIGHT + ROW_GAP;

interface PlacedNode {
  node: TreeViewNode;
  x: number;
  y: number;
  children: {child: PlacedNode; whenTrue: boolean}[];
}

interface Layout {
  placed: PlacedNode;
  width: number;
  height: number;
}

/*
  Lay out bottom-up: each leaf takes the next vertical slot, and a split sits
  level with its `yes` child rather than midway between its two children.
  Midway is prettier on a shallow tree, but it puts the root halfway down a
  canvas whose height doubles per level, so on a deep tree the root opens off
  screen. Aligning on the first child pins the root to the top left at any
  size, and gives the reader a straight line for `yes` and a step down for
  `no`.
*/
function placeNodes(root: TreeViewNode): Layout {
  let nextLeafSlot = 0;

  const place = (node: TreeViewNode, depth: number): PlacedNode => {
    const x = MARGIN + depth * COLUMN_PITCH;

    if (node.kind === 'leaf') {
      const y = MARGIN + nextLeafSlot * ROW_PITCH;
      nextLeafSlot++;
      return {node, x, y, children: []};
    }

    const whenTrue = place(node.whenTrue, depth + 1);
    const whenFalse = place(node.whenFalse, depth + 1);
    return {
      node,
      x,
      y: whenTrue.y,
      children: [
        {child: whenTrue, whenTrue: true},
        {child: whenFalse, whenTrue: false},
      ],
    };
  };

  const placed = place(root, 0);
  return {
    placed,
    width: MARGIN * 2 + (getTreeDepth(root) + 1) * COLUMN_PITCH - COLUMN_GAP,
    height: MARGIN * 2 + nextLeafSlot * ROW_PITCH - ROW_GAP,
  };
}

// SVG text does not wrap, so break the condition on word boundaries.
function wrapText(text: string): string[] {
  const lines: string[] = [];
  let line = '';

  text.split(' ').forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > CHARS_PER_LINE && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) {
    lines.push(line);
  }

  return lines.slice(0, MAX_LINES);
}

interface PlacedProps {
  placed: PlacedNode;
}

const NodeShape = ({placed}: PlacedProps) => {
  const {node, x, y} = placed;
  const isLeaf = node.kind === 'leaf';
  const text = isLeaf ? node.prediction : node.condition;
  const lines = wrapText(text);
  // Leave room under a split node for its row count.
  const blockCenterY = y + NODE_HEIGHT / 2 - (isLeaf ? 0 : 5);
  const firstLineY = blockCenterY - ((lines.length - 1) * LINE_HEIGHT) / 2 + 4;

  return (
    <g>
      <title>{text}</title>
      <rect
        x={x}
        y={y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={isLeaf ? 20 : 4}
        fill={isLeaf ? colors.label : colors.feature}
      />
      {lines.map((line, index) => (
        <text
          key={index}
          x={x + NODE_WIDTH / 2}
          y={firstLineY + index * LINE_HEIGHT}
          textAnchor="middle"
          style={isLeaf ? styles.modelTreeLeafText : styles.modelTreeNodeText}
        >
          {line}
        </text>
      ))}
      {!isLeaf && node.numberSamples !== undefined && (
        <text
          x={x + NODE_WIDTH / 2}
          y={y + NODE_HEIGHT - 5}
          textAnchor="middle"
          style={styles.modelTreeSampleText}
        >
          {`${node.numberSamples} rows`}
        </text>
      )}
    </g>
  );
};

const Branches = ({placed}: PlacedProps) => (
  <g>
    {placed.children.map(({child, whenTrue}) => {
      const fromX = placed.x + NODE_WIDTH;
      const fromY = placed.y + NODE_HEIGHT / 2;
      const toY = child.y + NODE_HEIGHT / 2;
      const midX = fromX + COLUMN_GAP / 2;

      return (
        <g key={whenTrue ? 'true' : 'false'}>
          <path
            d={
              toY === fromY
                ? `M ${fromX} ${fromY} H ${child.x}`
                : `M ${fromX} ${fromY} H ${midX} V ${toY} H ${child.x}`
            }
            fill="none"
            stroke="#9aa5ad"
            strokeWidth={2}
          />
          <text
            x={toY === fromY ? fromX + 6 : midX + 5}
            y={toY - 6}
            style={styles.modelTreeEdgeLabel}
          >
            {whenTrue ? 'yes' : 'no'}
          </text>
          <Branches placed={child} />
        </g>
      );
    })}
  </g>
);

const Nodes = ({placed}: PlacedProps) => (
  <g>
    <NodeShape placed={placed} />
    {placed.children.map(({child, whenTrue}) => (
      <Nodes key={whenTrue ? 'true' : 'false'} placed={child} />
    ))}
  </g>
);

const ModelTree = () => {
  const trainedModel = useAppSelector(state => state.trainedModel);
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const featureNumberKey = useAppSelector(state => state.featureNumberKey);
  const labelColumn = useAppSelector(state => state.labelColumn);
  const hyperparameters = useAppSelector(state => state.hyperparameters);

  const view = useMemo(() => {
    if (!trainedModel || !labelColumn) {
      return undefined;
    }
    return buildTreeView(
      trainedModel.toJSON() as Parameters<typeof buildTreeView>[0],
      {features: selectedFeatures, featureNumberKey, labelColumn},
    );
  }, [trainedModel, selectedFeatures, featureNumberKey, labelColumn]);

  const layout = useMemo(() => (view ? placeNodes(view) : undefined), [view]);

  if (!view || !layout) {
    return null;
  }

  const depth = getTreeDepth(view);
  const allowedDepth = hyperparameters.maxDepth;

  return (
    <div style={styles.panel}>
      <div style={styles.largeText}>How the model decides</div>
      <div style={styles.modelTreeSummary}>
        {`This tree asks at most ${depth} ` +
          `${depth === 1 ? 'question' : 'questions'}, and has ` +
          `${countLeaves(view)} possible answers. Start at the left and ` +
          `follow yes or no until you reach ${labelColumn}.` +
          (allowedDepth === undefined
            ? ''
            : ` The trainer was allowed a depth of ${allowedDepth}.`)}
      </div>
      <div style={styles.modelTreeScroller}>
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          role="img"
          aria-label={`Decision tree of depth ${depth} predicting ${labelColumn}`}
        >
          <Branches placed={layout.placed} />
          <Nodes placed={layout.placed} />
        </svg>
      </div>
    </div>
  );
};

export default ModelTree;
