import {useMemo, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {
  computeTabOrder,
  entriesMatch,
  type TabOrderEntry,
} from '../utils/computeTabOrder';

/**
 * Compute a logical tab order for nodes and edges and maintain roving
 * tabindex state. Returns the resolved active entry so callers can
 * apply tabIndex through React Flow's domAttributes API rather than
 * direct DOM manipulation (which React Flow's renders can overwrite).
 */
export function useTabOrder(
  nodes: SketchlabReactFlowNode[],
  edges: SketchlabReactFlowEdge[]
) {
  const tabOrder = useMemo(() => computeTabOrder(nodes, edges), [nodes, edges]);

  const [activeTabEntry, setActiveTabEntry] = useState<TabOrderEntry | null>(
    null
  );

  // The entry that should have tabIndex 0. Falls back to the first in
  // order when nothing has been focused yet or the active element was
  // deleted (derived — no effect needed).
  const isActiveValid =
    activeTabEntry &&
    tabOrder.some(entry => entriesMatch(entry, activeTabEntry));
  const activeEntry = isActiveValid ? activeTabEntry : tabOrder[0] ?? null;

  return {tabOrder, activeEntry, setActiveTabEntry};
}
