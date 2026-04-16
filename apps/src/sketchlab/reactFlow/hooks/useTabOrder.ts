import {useEffect, useMemo, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {computeTabOrder, type TabOrderEntry} from '../utils/computeTabOrder';

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

  // If the active element was deleted, reset to the first in tab order.
  useEffect(() => {
    if (
      activeTabEntry &&
      !tabOrder.some(
        entry =>
          entry.type === activeTabEntry.type && entry.id === activeTabEntry.id
      )
    ) {
      setActiveTabEntry(tabOrder[0] ?? null);
    }
  }, [tabOrder, activeTabEntry]);

  // The entry that should have tabIndex 0 (first in order when nothing
  // has been focused yet).
  const activeEntry = activeTabEntry ?? tabOrder[0] ?? null;

  return {tabOrder, activeEntry, setActiveTabEntry};
}
