import type {
  DecisionTreeLabel,
  DecisionTreeModelData,
  DecisionTreeNode,
  PredictionModel,
} from '../types';

export type DecisionTreeBranchDirection =
  | 'categorical'
  | 'left'
  | 'right'
  | 'default';

export interface DecisionTreeTraceStep {
  pathKey: string;
  node: Extract<DecisionTreeNode, {type: 'decision'}>;
  value: number;
  branchDirection: DecisionTreeBranchDirection;
  branchValue?: string;
  childPathKey?: string;
  branchKey?: string;
  usedDefault: boolean;
}

export interface DecisionTreeTraceResult {
  steps: DecisionTreeTraceStep[];
  leafPathKey: string;
  prediction: DecisionTreeLabel;
  usedDefault: boolean;
}

export interface DecisionTreeTraceStage {
  activePathKeys: string[];
  activeBranchKeys: string[];
  emphasizedPathKeys: string[];
  emphasizedBranchKeys: string[];
  activeTraceIndex: number;
}

export function getDecisionTreeBranchKey(
  parentPathKey: string,
  childPathKey: string,
): string {
  return `${parentPathKey}->${childPathKey}`;
}

export function getDecisionTreeTraceStage(
  traceResult: DecisionTreeTraceResult,
  traceIndex: number,
): DecisionTreeTraceStage {
  const maxTraceIndex = traceResult.steps.length;
  const activeTraceIndex = Math.min(
    Math.max(traceIndex, 0),
    maxTraceIndex,
  );

  if (activeTraceIndex === maxTraceIndex) {
    return {
      activePathKeys: getTracePathKeys(traceResult),
      activeBranchKeys: getTraceBranchKeys(traceResult),
      emphasizedPathKeys: [traceResult.leafPathKey],
      emphasizedBranchKeys: [],
      activeTraceIndex,
    };
  }

  const step = traceResult.steps[activeTraceIndex];
  return {
    activePathKeys: getTracePathKeys(traceResult, activeTraceIndex),
    activeBranchKeys: getTraceBranchKeys(traceResult, activeTraceIndex),
    emphasizedPathKeys: [step.pathKey],
    emphasizedBranchKeys: step.branchKey ? [step.branchKey] : [],
    activeTraceIndex,
  };
}

function getTracePathKeys(
  traceResult: DecisionTreeTraceResult,
  activeTraceIndex = traceResult.steps.length,
): string[] {
  const pathKeys: string[] = [];
  for (let i = 0; i <= activeTraceIndex && i < traceResult.steps.length; i++) {
    addUnique(pathKeys, traceResult.steps[i].pathKey);
  }
  if (activeTraceIndex >= traceResult.steps.length) {
    addUnique(pathKeys, traceResult.leafPathKey);
  }
  return pathKeys;
}

function getTraceBranchKeys(
  traceResult: DecisionTreeTraceResult,
  activeTraceIndex = traceResult.steps.length - 1,
): string[] {
  const branchKeys: string[] = [];
  for (let i = 0; i <= activeTraceIndex && i < traceResult.steps.length; i++) {
    const branchKey = traceResult.steps[i].branchKey;
    if (branchKey) {
      addUnique(branchKeys, branchKey);
    }
  }
  return branchKeys;
}

function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

export function getDecisionTreeRoot(
  model: PredictionModel | undefined,
): DecisionTreeNode | undefined {
  if (!model) {
    return undefined;
  }

  const json = model.toJSON();
  if (isDecisionTreeModelData(json)) {
    return json.root;
  }
  if (isDecisionTreeNode(json)) {
    return json;
  }
  return undefined;
}

export function traceDecisionTree(
  root: DecisionTreeNode,
  example: number[],
): DecisionTreeTraceResult {
  let node = root;
  let pathKey = 'root';
  const steps: DecisionTreeTraceStep[] = [];

  while (node.type === 'decision') {
    const value = example[node.featureIndex];
    if (node.splitType === 'numerical') {
      const branchDirection = value <= node.threshold ? 'left' : 'right';
      const child = branchDirection === 'left' ? node.left : node.right;
      const childPathKey = `${pathKey}.${branchDirection}`;
      steps.push({
        pathKey,
        node,
        value,
        branchDirection,
        childPathKey,
        branchKey: getDecisionTreeBranchKey(pathKey, childPathKey),
        usedDefault: false,
      });
      node = child;
      pathKey = childPathKey;
    } else {
      const branchValue = String(value);
      const child = node.children[branchValue];
      const childPathKey = child
        ? `${pathKey}.children.${branchValue}`
        : undefined;
      steps.push({
        pathKey,
        node,
        value,
        branchDirection: child ? 'categorical' : 'default',
        branchValue,
        childPathKey,
        branchKey: childPathKey
          ? getDecisionTreeBranchKey(pathKey, childPathKey)
          : undefined,
        usedDefault: !child,
      });

      if (!child) {
        return {
          steps,
          leafPathKey: pathKey,
          prediction: node.defaultLabel,
          usedDefault: true,
        };
      }

      node = child;
      pathKey = childPathKey!;
    }
  }

  return {
    steps,
    leafPathKey: pathKey,
    prediction: node.prediction,
    usedDefault: false,
  };
}

function isDecisionTreeModelData(
  value: unknown,
): value is DecisionTreeModelData {
  return (
    isRecord(value) &&
    value.algorithm === 'id3' &&
    isDecisionTreeNode(value.root)
  );
}

function isDecisionTreeNode(value: unknown): value is DecisionTreeNode {
  if (!isRecord(value)) {
    return false;
  }

  if (value.type === 'leaf') {
    return 'prediction' in value;
  }

  if (value.type !== 'decision' || typeof value.featureIndex !== 'number') {
    return false;
  }

  if (
    value.splitType === 'numerical' &&
    typeof value.threshold === 'number'
  ) {
    return isDecisionTreeNode(value.left) && isDecisionTreeNode(value.right);
  }

  return value.splitType === 'categorical' && isRecord(value.children);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
