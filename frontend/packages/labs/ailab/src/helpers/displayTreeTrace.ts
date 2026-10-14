import {ResultsGrades} from '../constants';
import type {DataRow} from '../types';

import {
  DISPLAY_TREE_ROOT_ID,
  getChildNodeId,
  type DisplayTreeBranch,
  type DisplayTreeNode,
  type SerializedTreeNode,
} from './displayTree';

export interface DisplayTreeStep {
  nodeId: string;
  column: string;
  value: string | number | undefined;
  branchIndex: number;
  branch: DisplayTreeBranch;
}

export interface DisplayTreeTrace {
  path: string[];
  steps: DisplayTreeStep[];
  prediction: string | number;
}

export interface DisplayTreeNodeCounts {
  correct: number;
  incorrect: number;
}

export const NO_ROWS: DisplayTreeNodeCounts = {correct: 0, incorrect: 0};

export type DisplayTreeCountsLookup = (nodeId: string) => DisplayTreeNodeCounts;

// Indices into the dataset of the rows that reach a node, test rows by grade.
export interface DisplayTreeNodeRows {
  correct: number[];
  incorrect: number[];
  trained: number[];
}

export const NO_NODE_ROWS: DisplayTreeNodeRows = {
  correct: [],
  incorrect: [],
  trained: [],
};

export type DisplayTreeRowsLookup = (nodeId: string) => DisplayTreeNodeRows;

export function traceDisplayTree(
  root: DisplayTreeNode,
  modelRoot: SerializedTreeNode,
  inputs: number[],
  row: DataRow,
): DisplayTreeTrace {
  const path = [DISPLAY_TREE_ROOT_ID];
  const steps: DisplayTreeStep[] = [];
  let node = root;
  let modelNode = modelRoot;

  while (node.type === 'question') {
    const nodeId = path[path.length - 1];
    const goesLeft = inputs[modelNode.splitColumn!] < modelNode.splitValue!;
    const branchIndex = goesLeft ? 0 : 1;
    const branch = node.branches[branchIndex];

    steps.push({
      nodeId,
      column: node.column,
      value: row[node.column],
      branchIndex,
      branch,
    });
    path.push(getChildNodeId(nodeId, branchIndex));
    node = branch.child;
    modelNode = goesLeft ? modelNode.left! : modelNode.right!;
  }

  return {path, steps, prediction: node.prediction};
}

// Maps each node to the indices, into examples, of the examples that reach it.
export function groupDisplayTreeRows(
  root: DisplayTreeNode,
  modelRoot: SerializedTreeNode,
  examples: number[][],
): Map<string, number[]> {
  const groups = new Map<string, number[]>();

  examples.forEach((inputs, index) => {
    traceDisplayTree(root, modelRoot, inputs, {}).path.forEach(nodeId => {
      const group = groups.get(nodeId) ?? [];
      group.push(index);
      groups.set(nodeId, group);
    });
  });

  return groups;
}

export function countDisplayTreeRows(
  root: DisplayTreeNode,
  modelRoot: SerializedTreeNode,
  examples: number[][],
  grades: string[],
): Map<string, DisplayTreeNodeCounts> {
  const counts = new Map<string, DisplayTreeNodeCounts>();

  groupDisplayTreeRows(root, modelRoot, examples).forEach((indices, nodeId) => {
    const correct = indices.filter(
      index => grades[index] === ResultsGrades.CORRECT,
    ).length;
    counts.set(nodeId, {correct, incorrect: indices.length - correct});
  });

  return counts;
}
