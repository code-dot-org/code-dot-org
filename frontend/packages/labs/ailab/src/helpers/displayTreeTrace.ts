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

export function countDisplayTreeRows(
  root: DisplayTreeNode,
  modelRoot: SerializedTreeNode,
  examples: number[][],
  grades: string[],
): Map<string, DisplayTreeNodeCounts> {
  const counts = new Map<string, DisplayTreeNodeCounts>();

  examples.forEach((inputs, index) => {
    const grade =
      grades[index] === ResultsGrades.CORRECT ? 'correct' : 'incorrect';
    traceDisplayTree(root, modelRoot, inputs, {}).path.forEach(nodeId => {
      const nodeCounts = counts.get(nodeId) ?? {...NO_ROWS};
      nodeCounts[grade]++;
      counts.set(nodeId, nodeCounts);
    });
  });

  return counts;
}
