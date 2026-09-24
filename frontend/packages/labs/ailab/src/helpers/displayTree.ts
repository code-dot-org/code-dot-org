/*
  Turns a trained ml-cart tree into plain nodes that a view can draw.

  ml-cart treats every feature as a number and sends a row to the left child
  when its value is below `splitValue`. Categorical features reach the tree as
  the codes in `featureNumberKey`, so a categorical split sends a set of values
  down each branch. The view reads only the nodes built here, never the model.
*/
import {getKeyByValue} from './utils';

export type DisplayTreeBranch =
  | {kind: 'values'; values: string[]; child: DisplayTreeNode}
  | {kind: 'lessThan' | 'atLeast'; threshold: number; child: DisplayTreeNode};

export interface DisplayTreeQuestion {
  type: 'question';
  column: string;
  branches: [DisplayTreeBranch, DisplayTreeBranch];
}

export interface DisplayTreeAnswer {
  type: 'answer';
  prediction: string | number;
}

export type DisplayTreeNode = DisplayTreeQuestion | DisplayTreeAnswer;

// A live model holds an ml-matrix row vector; a saved one, a nested array.
type ClassDistribution = number[][] | {getRow(row: number): number[]};

// A leaf that ml-cart stopped splitting keeps `splitColumn` and `splitValue`.
interface SerializedTreeNode {
  splitColumn?: number;
  splitValue?: number;
  left?: SerializedTreeNode;
  right?: SerializedTreeNode;
  distribution?: ClassDistribution | number;
}

export interface SerializedTree {
  name?: string;
  root?: SerializedTreeNode;
}

export interface DisplayTreeContext {
  // In the column order of the training examples.
  features: string[];
  featureNumberKey: Record<string, Record<string, number>>;
  labelColumn: string;
}

const TREE_MODEL_NAMES = ['DTClassifier', 'DTRegression'];

function isTreeModel(model: SerializedTree): boolean {
  return TREE_MODEL_NAMES.includes(model.name ?? '') && !!model.root;
}

// `model` is `toJSON()`, from a live model or a saved one.
export function buildDisplayTree(
  model: SerializedTree,
  context: DisplayTreeContext,
): DisplayTreeNode | undefined {
  if (!isTreeModel(model)) {
    return undefined;
  }
  const valuesByColumn: Record<string, string[]> = {};
  context.features.forEach(feature => {
    const key = context.featureNumberKey[feature];
    if (key) {
      valuesByColumn[feature] = Object.keys(key);
    }
  });
  return buildNode(model.root!, context, valuesByColumn);
}

// `valuesByColumn` holds the categorical values a row can still have here.
function buildNode(
  node: SerializedTreeNode,
  context: DisplayTreeContext,
  valuesByColumn: Record<string, string[]>,
): DisplayTreeNode {
  if (!node.left || !node.right) {
    return {type: 'answer', prediction: getPrediction(node, context)};
  }

  const column = context.features[node.splitColumn!];
  const threshold = node.splitValue!;
  const key = context.featureNumberKey[column];

  if (!key) {
    return {
      type: 'question',
      column,
      branches: [
        {
          kind: 'lessThan',
          threshold,
          child: buildNode(node.left, context, valuesByColumn),
        },
        {
          kind: 'atLeast',
          threshold,
          child: buildNode(node.right, context, valuesByColumn),
        },
      ],
    };
  }

  const lesser = valuesByColumn[column].filter(value => key[value] < threshold);
  const greater = valuesByColumn[column].filter(
    value => key[value] >= threshold,
  );
  return {
    type: 'question',
    column,
    branches: [
      {
        kind: 'values',
        values: sortValues(lesser),
        child: buildNode(node.left, context, {
          ...valuesByColumn,
          [column]: lesser,
        }),
      },
      {
        kind: 'values',
        values: sortValues(greater),
        child: buildNode(node.right, context, {
          ...valuesByColumn,
          [column]: greater,
        }),
      },
    ],
  };
}

function getPrediction(
  node: SerializedTreeNode,
  context: DisplayTreeContext,
): string | number {
  const {distribution} = node;
  if (typeof distribution === 'number') {
    return distribution;
  }

  if (!distribution) {
    throw new Error('Decision tree leaf has no class distribution');
  }

  // The row is as long as the highest class code in this leaf, plus one.
  const probabilities = Array.isArray(distribution)
    ? distribution[0]
    : distribution.getRow(0);
  // ml-cart predicts the first class with the highest probability.
  let best = 0;
  probabilities.forEach((probability, index) => {
    if (probability > probabilities[best]) {
      best = index;
    }
  });

  const labelKey = context.featureNumberKey[context.labelColumn];
  return (labelKey && getKeyByValue(labelKey, best)) ?? best;
}

function sortValues(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, 'en', {numeric: true}));
}
