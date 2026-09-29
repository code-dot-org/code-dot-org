/*
  Follows one row through a display tree and records each question on the way.
  The route is the one ml-cart's predict takes, so the trace ends at the answer
  the model gives for the same row. A view reads the steps to show the path of
  a prediction.
*/
import type {DataRow} from '../types';

import {
  DISPLAY_TREE_ROOT_ID,
  getChildNodeId,
  type DisplayTreeBranch,
  type DisplayTreeNode,
} from './displayTree';

export interface DisplayTreeStep {
  nodeId: string;
  column: string;
  value: string | number | undefined;
  branchIndex: number;
  branch: DisplayTreeBranch;
}

export interface DisplayTreeTrace {
  // Node ids from the root to the answer.
  path: string[];
  steps: DisplayTreeStep[];
  prediction: string | number;
}

export function traceDisplayTree(
  root: DisplayTreeNode,
  row: DataRow,
): DisplayTreeTrace {
  const path = [DISPLAY_TREE_ROOT_ID];
  const steps: DisplayTreeStep[] = [];
  let node = root;

  while (node.type === 'question') {
    const nodeId = path[path.length - 1];
    const value = row[node.column];
    const branchIndex = matches(node.branches[0], value) ? 0 : 1;
    const branch = node.branches[branchIndex];

    steps.push({nodeId, column: node.column, value, branchIndex, branch});
    path.push(getChildNodeId(nodeId, branchIndex));
    node = branch.child;
  }

  return {path, steps, prediction: node.prediction};
}

// ml-cart goes left only for `value < splitValue`, so unknown values go right.
function matches(
  branch: DisplayTreeBranch,
  value: string | number | undefined,
): boolean {
  if (branch.kind === 'values') {
    return branch.values.includes(String(value));
  }
  const number = parseFloat(String(value));
  return branch.kind === 'lessThan'
    ? number < branch.threshold
    : number >= branch.threshold;
}
