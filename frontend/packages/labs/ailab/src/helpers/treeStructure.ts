/*
  Translate a serialized ml-cart tree into named features and readable
  conditions. Pure, so the drawing component holds no knowledge of the
  library's shape.

  Three properties of ml-cart 2.1.1 that this file exists to absorb:

  - A node is internal when it has BOTH children. A node that stopped
    splitting keeps its `splitValue` and `splitColumn`, so those fields do not
    identify an internal node.
  - `distribution` on a classifier leaf is a proportional row indexed by class,
    truncated at the highest class present in that leaf. `[[1]]` is class 0 and
    `[[0,1]]` is class 1, so the array length is not the class count. `toJSON`
    returns it as a live Matrix; a JSON round-trip turns it into `number[][]`.
    Both shapes reach this file.
  - A split on a categorical feature is a numeric threshold over the ordinal
    encoding, so `shape < 0.5` has to be read back through the feature number
    key as "shape is round".
*/

export interface SerializedTreeNode {
  splitValue?: number;
  splitColumn?: number;
  numberSamples?: number;
  left?: SerializedTreeNode;
  right?: SerializedTreeNode;
  distribution?: unknown;
}

export interface SerializedTree {
  name?: string;
  root: SerializedTreeNode;
}

export interface TreeViewOptions {
  features: string[];
  featureNumberKey: Record<string, Record<string, number>>;
  labelColumn: string;
}

export interface TreeSplitNode {
  kind: 'split';
  condition: string;
  numberSamples: number | undefined;
  whenTrue: TreeViewNode;
  whenFalse: TreeViewNode;
}

export interface TreeLeafNode {
  kind: 'leaf';
  prediction: string;
}

export type TreeViewNode = TreeSplitNode | TreeLeafNode;

const MAX_NAMED_OPTIONS = 3;

function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function isInternal(node: SerializedTreeNode): boolean {
  return !!node.left && !!node.right;
}

function describeCategoricalSplit(
  feature: string,
  optionNumbers: Record<string, number>,
  splitValue: number,
): string {
  const matching = Object.keys(optionNumbers).filter(
    option => optionNumbers[option] < splitValue,
  );

  if (matching.length === 0) {
    return `${feature} < ${formatNumber(splitValue)}`;
  }
  if (matching.length > MAX_NAMED_OPTIONS) {
    return `${feature} is one of ${matching.length} options`;
  }
  return `${feature} is ${matching.join(' or ')}`;
}

function describeSplit(
  node: SerializedTreeNode,
  options: TreeViewOptions,
): string {
  const feature = options.features[node.splitColumn ?? 0];
  const splitValue = node.splitValue ?? 0;

  if (feature === undefined) {
    return `feature ${node.splitColumn} < ${formatNumber(splitValue)}`;
  }

  const optionNumbers = options.featureNumberKey[feature];
  return optionNumbers
    ? describeCategoricalSplit(feature, optionNumbers, splitValue)
    : `${feature} < ${formatNumber(splitValue)}`;
}

/*
  A classifier leaf holds proportions per class. `predict` takes the first
  index that holds the maximum, so a tie reads the same way here as it does
  in the model.
*/
function distributionRow(distribution: unknown): number[] {
  const asMatrix = distribution as {getRow?: (row: number) => number[]};
  if (typeof asMatrix?.getRow === 'function') {
    return asMatrix.getRow(0);
  }
  const rows = distribution as number[][];
  return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : [];
}

function predictedClassIndex(distribution: unknown): number | undefined {
  const row = distributionRow(distribution);
  if (row.length === 0) {
    return undefined;
  }
  return row.indexOf(Math.max(...row));
}

function describeLeaf(
  node: SerializedTreeNode,
  options: TreeViewOptions,
): string {
  if (typeof node.distribution === 'number') {
    return formatNumber(node.distribution);
  }

  const classIndex = predictedClassIndex(node.distribution);
  if (classIndex === undefined) {
    return '?';
  }

  const labelNumbers = options.featureNumberKey[options.labelColumn];
  const name =
    labelNumbers &&
    Object.keys(labelNumbers).find(
      option => labelNumbers[option] === classIndex,
    );
  return name ?? String(classIndex);
}

function buildNode(
  node: SerializedTreeNode,
  options: TreeViewOptions,
): TreeViewNode {
  if (!isInternal(node)) {
    return {kind: 'leaf', prediction: describeLeaf(node, options)};
  }

  return {
    kind: 'split',
    condition: describeSplit(node, options),
    numberSamples: node.numberSamples,
    // ml-cart sends a row down `left` when the value is below the threshold.
    whenTrue: buildNode(node.left!, options),
    whenFalse: buildNode(node.right!, options),
  };
}

export function buildTreeView(
  tree: SerializedTree,
  options: TreeViewOptions,
): TreeViewNode {
  return buildNode(tree.root, options);
}

export function getTreeDepth(node: TreeViewNode): number {
  if (node.kind === 'leaf') {
    return 0;
  }
  return 1 + Math.max(getTreeDepth(node.whenTrue), getTreeDepth(node.whenFalse));
}

export function countLeaves(node: TreeViewNode): number {
  if (node.kind === 'leaf') {
    return 1;
  }
  return countLeaves(node.whenTrue) + countLeaves(node.whenFalse);
}
