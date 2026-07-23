import {useEffect, useState} from 'react';

import {Algorithms, ColumnTypes, styles} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {
  getDecisionTreeBranchKey,
  getDecisionTreeRoot,
  getDecisionTreeTraceStage,
  traceDecisionTree,
  type DecisionTreeTraceResult,
  type DecisionTreeTraceStep,
} from '../helpers/decisionTree';
import {getKeyByValue} from '../helpers/utils';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getPredictAvailable} from '../redux';
import type {DecisionTreeNode} from '../types';

interface TreePlacement {
  node: DecisionTreeNode;
  pathKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  parentCx?: number;
  parentBottomY?: number;
  parentNode?: Extract<DecisionTreeNode, {type: 'decision'}>;
  branchValue?: string;
  branchKey?: string;
}

interface DecisionTreeSvgProps {
  root: DecisionTreeNode;
  activePathKeys: Set<string>;
  activeBranchKeys: Set<string>;
  emphasizedPathKeys: Set<string>;
  emphasizedBranchKeys: Set<string>;
  getFeatureName: (featureIndex: number) => string;
  getBranchLabel: (
    node: Extract<DecisionTreeNode, {type: 'decision'}>,
    branchValue: string,
  ) => string;
  getPredictionLabel: (prediction: string | number) => string;
}

const TREE_ROW_HEIGHT = 118;
const TREE_TOP_PADDING = 18;
const TREE_BOTTOM_PADDING = 24;
const TREE_LEAF_SLOT_WIDTH = 180;
const TREE_MIN_WIDTH = 560;
const TREE_DECISION_NODE_WIDTH = 152;
const TREE_DECISION_NODE_HEIGHT = 48;
const TREE_LEAF_NODE_WIDTH = 132;
const TREE_LEAF_NODE_HEIGHT = 48;
const TREE_ARROW_COLOR = '#9aa0a6';
const TREE_ACTIVE_COLOR = 'rgb(89, 202, 211)';

const formatNumber = (value: number): string =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '');

function truncateLabel(label: string, maxLength: number): string {
  return label.length > maxLength
    ? `${label.slice(0, Math.max(0, maxLength - 3))}...`
    : label;
}

function getNodeLines(text: string): string[] {
  const maxLineLength = 18;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLineLength) {
      currentLine = nextLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine =
        word.length > maxLineLength
          ? truncateLabel(word, maxLineLength)
          : word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
}

const DecisionTreeSvg = ({
  root,
  activePathKeys,
  activeBranchKeys,
  emphasizedPathKeys,
  emphasizedBranchKeys,
  getFeatureName,
  getBranchLabel,
  getPredictionLabel,
}: DecisionTreeSvgProps) => {
  const layout = getTreeLayout(root);

  return (
    <svg
      aria-label={I18n.t('decisionTreeSvgLabel')}
      role="img"
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      style={styles.decisionTreeSvg}
    >
      <defs>
        <marker
          id="decision-tree-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill={TREE_ARROW_COLOR} />
        </marker>
        <marker
          id="decision-tree-arrow-active"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill={TREE_ACTIVE_COLOR} />
        </marker>
      </defs>
      {layout.placements.map(placement => (
        <TreeEdge
          key={`edge-${placement.pathKey}`}
          placement={placement}
          activeBranchKeys={activeBranchKeys}
          emphasizedBranchKeys={emphasizedBranchKeys}
          getBranchLabel={getBranchLabel}
        />
      ))}
      {layout.placements.map(placement => (
        <TreeSvgNode
          key={`node-${placement.pathKey}`}
          placement={placement}
          activePathKeys={activePathKeys}
          emphasizedPathKeys={emphasizedPathKeys}
          getFeatureName={getFeatureName}
          getPredictionLabel={getPredictionLabel}
        />
      ))}
    </svg>
  );
};

const TreeEdge = ({
  placement,
  activeBranchKeys,
  emphasizedBranchKeys,
  getBranchLabel,
}: {
  placement: TreePlacement;
  activeBranchKeys: Set<string>;
  emphasizedBranchKeys: Set<string>;
  getBranchLabel: (
    node: Extract<DecisionTreeNode, {type: 'decision'}>,
    branchValue: string,
  ) => string;
}) => {
  if (
    placement.parentCx === undefined ||
    placement.parentBottomY === undefined ||
    !placement.branchKey ||
    placement.branchValue === undefined
  ) {
    return null;
  }

  const branchIsActive = activeBranchKeys.has(placement.branchKey);
  const branchIsEmphasized = emphasizedBranchKeys.has(placement.branchKey);
  if (!placement.parentNode) {
    return null;
  }

  const branchLabel = getBranchLabel(placement.parentNode, placement.branchValue);
  const labelX = (placement.parentCx + placement.cx) / 2;
  const labelY =
    placement.parentBottomY + (placement.y - placement.parentBottomY) / 2;
  const labelWidth = Math.min(
    116,
    Math.max(42, truncateLabel(branchLabel, 18).length * 7 + 18),
  );
  const path = [
    `M ${placement.parentCx} ${placement.parentBottomY}`,
    `C ${placement.parentCx} ${placement.parentBottomY + 36}`,
    `${placement.cx} ${placement.y - 36}`,
    `${placement.cx} ${placement.y}`,
  ].join(' ');

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={branchIsActive ? TREE_ACTIVE_COLOR : TREE_ARROW_COLOR}
        strokeWidth={branchIsEmphasized ? 4 : branchIsActive ? 2.5 : 1.5}
        markerEnd={
          branchIsActive
            ? 'url(#decision-tree-arrow-active)'
            : 'url(#decision-tree-arrow)'
        }
      />
      <rect
        x={labelX - labelWidth / 2}
        y={labelY - 11}
        width={labelWidth}
        height="22"
        rx="11"
        fill={
          branchIsEmphasized
            ? 'rgba(89, 202, 211, 0.3)'
            : branchIsActive
              ? 'rgba(89, 202, 211, 0.16)'
              : 'white'
        }
        stroke={branchIsActive ? TREE_ACTIVE_COLOR : '#cccccc'}
        strokeWidth={branchIsEmphasized ? 2.5 : branchIsActive ? 1.5 : 1}
      />
      <text
        x={labelX}
        y={labelY + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight={branchIsEmphasized ? 900 : branchIsActive ? 800 : 600}
        fill={branchIsActive ? '#0b6770' : '#555555'}
      >
        {truncateLabel(branchLabel, 18)}
      </text>
    </g>
  );
};

const TreeSvgNode = ({
  placement,
  activePathKeys,
  emphasizedPathKeys,
  getFeatureName,
  getPredictionLabel,
}: {
  placement: TreePlacement;
  activePathKeys: Set<string>;
  emphasizedPathKeys: Set<string>;
  getFeatureName: (featureIndex: number) => string;
  getPredictionLabel: (prediction: string | number) => string;
}) => {
  const nodeIsActive = activePathKeys.has(placement.pathKey);
  const nodeIsEmphasized = emphasizedPathKeys.has(placement.pathKey);
  const isLeaf = placement.node.type === 'leaf';
  const fill = nodeIsActive
    ? isLeaf
      ? 'rgba(89, 202, 211, 0.28)'
      : 'white'
    : isLeaf
      ? 'rgb(231, 232, 234)'
      : 'white';
  const stroke = nodeIsActive ? TREE_ACTIVE_COLOR : '#777777';
  const lines =
    placement.node.type === 'leaf'
      ? [
          I18n.t('decisionTreeLeafLabel') ?? '',
          truncateLabel(getPredictionLabel(placement.node.prediction), 18),
        ]
      : getNodeLines(getFeatureName(placement.node.featureIndex));

  return (
    <g aria-current={nodeIsActive ? 'step' : undefined}>
      {nodeIsActive && (
        <rect
          x={placement.x - 5}
          y={placement.y - 5}
          width={placement.width + 10}
          height={placement.height + 10}
          rx={isLeaf ? (placement.height + 10) / 2 : 12}
          fill="none"
          stroke={TREE_ACTIVE_COLOR}
          strokeWidth={nodeIsEmphasized ? 3 : 2}
          opacity={nodeIsEmphasized ? 0.55 : 0.3}
        />
      )}
      <rect
        x={placement.x}
        y={placement.y}
        width={placement.width}
        height={placement.height}
        rx={isLeaf ? placement.height / 2 : 9}
        fill={fill}
        stroke={stroke}
        strokeWidth={nodeIsEmphasized ? 4 : nodeIsActive ? 2.5 : 1.5}
      />
      <text
        x={placement.cx}
        y={placement.cy - (lines.length - 1) * 7}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isLeaf ? 12 : 13}
        fontWeight={nodeIsEmphasized ? 800 : 700}
        fill="#333333"
      >
        {lines.map((line, index) => (
          <tspan key={index} x={placement.cx} dy={index === 0 ? 0 : 15}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const DecisionTreeVisualization = () => {
  const selectedAlgorithm = useAppSelector(state => state.selectedAlgorithm);
  const trainedModel = useAppSelector(state => state.trainedModel);
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);
  const featureNumberKey = useAppSelector(state => state.featureNumberKey);
  const testData = useAppSelector(state => state.testData);
  const labelColumn = useAppSelector(state => state.labelColumn);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const predictAvailable = useAppSelector(getPredictAvailable);
  const [activeTraceIndex, setActiveTraceIndex] = useState(0);

  const root =
    selectedAlgorithm === Algorithms.DECISION_TREE
      ? getDecisionTreeRoot(trainedModel)
      : undefined;
  const traceResult = root && labelColumn && predictAvailable
    ? traceDecisionTree(
        root,
        selectedFeatures.map(feature =>
          getTrainingValue(
            feature,
            testData[feature],
            columnsByDataType,
            featureNumberKey,
          ),
        ),
      )
    : undefined;

  const traceKey = getTraceKey(traceResult);
  useEffect(() => {
    setActiveTraceIndex(0);
  }, [traceKey]);

  if (selectedAlgorithm !== Algorithms.DECISION_TREE) {
    return null;
  }

  if (!root || !labelColumn) {
    return null;
  }

  const activeTraceStage = traceResult
    ? getDecisionTreeTraceStage(traceResult, activeTraceIndex)
    : undefined;
  const activePathKeys = new Set<string>(
    activeTraceStage?.activePathKeys ?? [],
  );
  const activeBranchKeys = new Set<string>(
    activeTraceStage?.activeBranchKeys ?? [],
  );
  const emphasizedPathKeys = new Set<string>(
    activeTraceStage?.emphasizedPathKeys ?? [],
  );
  const emphasizedBranchKeys = new Set<string>(
    activeTraceStage?.emphasizedBranchKeys ?? [],
  );

  const getFeatureName = (featureIndex: number) => {
    const feature = selectedFeatures[featureIndex];
    return feature
      ? getLocalizedColumnName(datasetId, feature)
      : `Feature ${featureIndex + 1}`;
  };

  const getBranchLabel = (
    node: Extract<DecisionTreeNode, {type: 'decision'}>,
    branchValue: string,
  ) => {
    if (node.splitType === 'numerical') {
      return branchValue === 'left'
        ? `<= ${formatNumber(node.threshold)}`
        : `> ${formatNumber(node.threshold)}`;
    }

    const feature = selectedFeatures[node.featureIndex];
    return getDisplayValue(
      feature,
      branchValue,
      datasetId,
      columnsByDataType,
      featureNumberKey,
    );
  };

  const getPredictionLabel = (prediction: string | number) =>
    getDisplayValue(
      labelColumn,
      prediction,
      datasetId,
      columnsByDataType,
      featureNumberKey,
    );

  return (
    <section
      aria-labelledby="decision-tree-visualization-heading"
      style={styles.decisionTreePanel}
    >
      <h3
        id="decision-tree-visualization-heading"
        style={styles.exportModelSectionHeading}
      >
        {I18n.t('decisionTreeVisualizationHeading')}
      </h3>
      <div style={styles.decisionTreeLayout}>
        <div style={styles.decisionTreeScroll}>
          <DecisionTreeSvg
            root={root}
            activePathKeys={activePathKeys}
            activeBranchKeys={activeBranchKeys}
            emphasizedPathKeys={emphasizedPathKeys}
            emphasizedBranchKeys={emphasizedBranchKeys}
            getFeatureName={getFeatureName}
            getBranchLabel={getBranchLabel}
            getPredictionLabel={getPredictionLabel}
          />
        </div>
        <TracePanel
          traceResult={traceResult}
          activeTraceIndex={activeTraceStage?.activeTraceIndex ?? 0}
          setActiveTraceIndex={setActiveTraceIndex}
          getFeatureName={getFeatureName}
          getBranchLabel={(step: DecisionTreeTraceStep) =>
            getTraceBranchLabel(step, getBranchLabel)
          }
          getDisplayValue={(column, value) =>
            getDisplayValue(
              column,
              value,
              datasetId,
              columnsByDataType,
              featureNumberKey,
            )
          }
          getPredictionLabel={getPredictionLabel}
          selectedFeatures={selectedFeatures}
        />
      </div>
    </section>
  );
};

const TracePanel = ({
  traceResult,
  activeTraceIndex,
  setActiveTraceIndex,
  getFeatureName,
  getBranchLabel,
  getDisplayValue,
  getPredictionLabel,
  selectedFeatures,
}: {
  traceResult: DecisionTreeTraceResult | undefined;
  activeTraceIndex: number;
  setActiveTraceIndex: (traceIndex: number) => void;
  getFeatureName: (featureIndex: number) => string;
  getBranchLabel: (step: DecisionTreeTraceStep) => string;
  getDisplayValue: (column: string, value: string | number) => string;
  getPredictionLabel: (prediction: string | number) => string;
  selectedFeatures: string[];
}) => {
  const totalTraceStages = traceResult ? traceResult.steps.length + 1 : 0;
  const previousDisabled = !traceResult || activeTraceIndex === 0;
  const nextDisabled =
    !traceResult || activeTraceIndex === totalTraceStages - 1;

  return (
    <div style={styles.decisionTreeTrace}>
      <h4 style={styles.exportModelSectionHeading}>
        {I18n.t('decisionTreeTraceHeading')}
      </h4>
      {!traceResult && (
        <p style={styles.regularText}>{I18n.t('decisionTreeTraceEmpty')}</p>
      )}
      {traceResult && (
        <>
          <div style={styles.decisionTreeTraceControls}>
            <button
              type="button"
              onClick={() => setActiveTraceIndex(activeTraceIndex - 1)}
              disabled={previousDisabled}
              style={{
                ...styles.decisionTreeTraceButton,
                ...(previousDisabled ? styles.disabledButton : undefined),
              }}
            >
              {I18n.t('decisionTreeTracePrevious')}
            </button>
            <span style={styles.decisionTreeTraceProgress}>
              {I18n.t('decisionTreeTraceProgress', {
                current: activeTraceIndex + 1,
                total: totalTraceStages,
              })}
            </span>
            <button
              type="button"
              onClick={() => setActiveTraceIndex(activeTraceIndex + 1)}
              disabled={nextDisabled}
              style={{
                ...styles.decisionTreeTraceButton,
                ...(nextDisabled ? styles.disabledButton : undefined),
              }}
            >
              {I18n.t('decisionTreeTraceNext')}
            </button>
          </div>
          <ol style={styles.decisionTreeTraceList}>
            {traceResult.steps.map((step, index) => {
              const feature = selectedFeatures[step.node.featureIndex];
              const stepIsActive = index === activeTraceIndex;
              return (
                <li
                  key={index}
                  aria-current={stepIsActive ? 'step' : undefined}
                  style={{
                    ...styles.decisionTreeTraceItem,
                    ...(stepIsActive
                      ? styles.decisionTreeTraceItemActive
                      : undefined),
                  }}
                >
                  {I18n.t('decisionTreeTraceDecision', {
                    feature: getFeatureName(step.node.featureIndex),
                    value: getDisplayValue(feature, step.value),
                    branch: getBranchLabel(step),
                  })}
                  {stepIsActive &&
                    ` (${I18n.t('decisionTreeTraceCurrentStep')})`}
                  {step.usedDefault && (
                    <div>{I18n.t('decisionTreeTraceDefault')}</div>
                  )}
                </li>
              );
            })}
            <li
              aria-current={
                activeTraceIndex === traceResult.steps.length
                  ? 'step'
                  : undefined
              }
              style={{
                ...styles.decisionTreeTraceItem,
                ...(activeTraceIndex === traceResult.steps.length
                  ? styles.decisionTreeTraceItemActive
                  : undefined),
              }}
            >
              {I18n.t('decisionTreeTracePrediction', {
                prediction: getPredictionLabel(traceResult.prediction),
              })}
              {activeTraceIndex === traceResult.steps.length &&
                ` (${I18n.t('decisionTreeTraceCurrentStep')})`}
            </li>
          </ol>
        </>
      )}
    </div>
  );
};

function getTreeLayout(root: DecisionTreeNode): {
  placements: TreePlacement[];
  width: number;
  height: number;
} {
  const width = Math.max(
    TREE_MIN_WIDTH,
    getLeafWeight(root) * TREE_LEAF_SLOT_WIDTH,
  );
  const placements: TreePlacement[] = [];
  placeTreeNode(root, 'root', 0, TREE_TOP_PADDING, width, placements);
  const height =
    Math.max(...placements.map(placement => placement.y + placement.height)) +
    TREE_BOTTOM_PADDING;
  return {placements, width, height};
}

function placeTreeNode(
  node: DecisionTreeNode,
  pathKey: string,
  x: number,
  y: number,
  width: number,
  placements: TreePlacement[],
  parent?: TreePlacement,
  parentNode?: Extract<DecisionTreeNode, {type: 'decision'}>,
  branchValue?: string,
): void {
  const nodeWidth =
    node.type === 'leaf' ? TREE_LEAF_NODE_WIDTH : TREE_DECISION_NODE_WIDTH;
  const nodeHeight =
    node.type === 'leaf' ? TREE_LEAF_NODE_HEIGHT : TREE_DECISION_NODE_HEIGHT;
  const cx = x + width / 2;
  const placement: TreePlacement = {
    node,
    pathKey,
    x: cx - nodeWidth / 2,
    y,
    width: nodeWidth,
    height: nodeHeight,
    cx,
    cy: y + nodeHeight / 2,
    parentCx: parent?.cx,
    parentBottomY: parent ? parent.y + parent.height : undefined,
    parentNode,
    branchValue,
    branchKey:
      parent && branchValue !== undefined
        ? getDecisionTreeBranchKey(parent.pathKey, pathKey)
        : undefined,
  };
  placements.push(placement);

  if (node.type === 'leaf') {
    return;
  }

  const branches = getBranches(node, pathKey);
  const totalWeight = branches.reduce(
    (sum, branch) => sum + getLeafWeight(branch.node),
    0,
  );
  let childX = x;
  branches.forEach(branch => {
    const childWidth = (getLeafWeight(branch.node) / totalWeight) * width;
    placeTreeNode(
      branch.node,
      branch.pathKey,
      childX,
      y + TREE_ROW_HEIGHT,
      childWidth,
      placements,
      placement,
      node,
      branch.value,
    );
    childX += childWidth;
  });
}

function getLeafWeight(node: DecisionTreeNode): number {
  if (node.type === 'leaf') {
    return 1;
  }

  return getBranches(node, 'root').reduce(
    (sum, branch) => sum + getLeafWeight(branch.node),
    0,
  );
}

function getBranches(
  node: Extract<DecisionTreeNode, {type: 'decision'}>,
  pathKey: string,
) {
  if (node.splitType === 'numerical') {
    return [
      {value: 'left', pathKey: `${pathKey}.left`, node: node.left},
      {value: 'right', pathKey: `${pathKey}.right`, node: node.right},
    ];
  }

  return Object.keys(node.children)
    .sort((a, b) => Number(a) - Number(b))
    .map(value => ({
      value,
      pathKey: `${pathKey}.children.${value}`,
      node: node.children[value],
    }));
}

function getTrainingValue(
  feature: string,
  value: string | number,
  columnsByDataType: Record<string, string>,
  featureNumberKey: Record<string, Record<string, number>>,
): number {
  if (columnsByDataType[feature] === ColumnTypes.CATEGORICAL) {
    return featureNumberKey[feature][String(value)];
  }
  return parseFloat(String(value));
}

function getTraceBranchLabel(
  step: DecisionTreeTraceStep,
  getBranchLabel: (
    node: Extract<DecisionTreeNode, {type: 'decision'}>,
    branchValue: string,
  ) => string,
): string {
  if (step.branchDirection === 'default') {
    return I18n.t('decisionTreeDefaultBranch') ?? '';
  }
  if (step.branchDirection === 'left' || step.branchDirection === 'right') {
    return getBranchLabel(step.node, step.branchDirection);
  }
  return getBranchLabel(step.node, step.branchValue ?? '');
}

function getDisplayValue(
  column: string,
  value: string | number,
  datasetId: string,
  columnsByDataType: Record<string, string>,
  featureNumberKey: Record<string, Record<string, number>>,
): string {
  if (columnsByDataType[column] === ColumnTypes.CATEGORICAL) {
    const option = getKeyByValue(featureNumberKey[column] ?? {}, Number(value));
    return String(getLocalizedValue(option ?? value, datasetId));
  }

  return typeof value === 'number' ? formatNumber(value) : String(value);
}

function getTraceKey(
  traceResult: DecisionTreeTraceResult | undefined,
): string {
  if (!traceResult) {
    return 'no-trace';
  }

  return [
    ...traceResult.steps.map(step =>
      [
        step.pathKey,
        step.branchDirection,
        step.branchValue,
        step.childPathKey,
      ].join(':'),
    ),
    traceResult.leafPathKey,
    String(traceResult.prediction),
  ].join('|');
}

export default DecisionTreeVisualization;
