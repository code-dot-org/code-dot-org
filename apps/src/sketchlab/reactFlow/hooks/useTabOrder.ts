import {useEffect, useMemo, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {computeTabOrder, type TabOrderEntry} from '../utils/computeTabOrder';

/**
 * Compute a logical tab order for nodes and edges and maintain roving
 * tabindex state. Syncs tabIndex attributes to the DOM so exactly one
 * element has tabIndex 0 and the rest have -1.
 *
 * Queries are scoped to containerClassName so multiple React Flow
 * instances on the same page don't interfere with each other.
 */
export function useTabOrder(
  nodes: SketchlabReactFlowNode[],
  edges: SketchlabReactFlowEdge[],
  containerClassName: string
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

  // Sync roving tabindex to the DOM.
  useEffect(() => {
    const container = document.querySelector(`.${containerClassName}`);
    if (!container) return;

    const active = activeTabEntry ?? tabOrder[0] ?? null;
    container
      .querySelectorAll<HTMLElement>('.react-flow__node')
      .forEach(element => {
        const id = element.getAttribute('data-id');
        element.tabIndex = active?.type === 'node' && active.id === id ? 0 : -1;
      });
    container
      .querySelectorAll<HTMLElement>('.react-flow__edge')
      .forEach(element => {
        const id = element.getAttribute('data-id');
        element.tabIndex = active?.type === 'edge' && active.id === id ? 0 : -1;
      });
  }, [tabOrder, activeTabEntry, containerClassName]);

  return {tabOrder, activeTabEntry, setActiveTabEntry};
}
