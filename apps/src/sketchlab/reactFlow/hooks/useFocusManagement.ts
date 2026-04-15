import {useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import type {TabOrderEntry} from '../utils/computeTabOrder';

/**
 * Focus helpers for the React Flow canvas. Provides focusEntry (move focus
 * to a specific node or edge, panning if off-screen) and handleFocusCapture
 * (sync the roving tabindex when a node/edge receives focus by other means).
 */
export function useFocusManagement(
  tabOrder: TabOrderEntry[],
  setActiveTabEntry: (entry: TabOrderEntry) => void
) {
  const {fitView, getZoom} = useReactFlow();

  const focusEntry = useCallback(
    (entry: TabOrderEntry) => {
      setActiveTabEntry(entry);
      const selector =
        entry.type === 'node'
          ? `.react-flow__node[data-id="${entry.id}"]`
          : `.react-flow__edge[data-id="${entry.id}"]`;
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      el.focus();
      // Pan if the element is not fully visible in the viewport.
      if (entry.type === 'node') {
        const container = el.closest<HTMLElement>('.react-flow');
        if (container) {
          const cr = container.getBoundingClientRect();
          const nr = el.getBoundingClientRect();
          const notFullyVisible =
            nr.left < cr.left ||
            nr.right > cr.right ||
            nr.top < cr.top ||
            nr.bottom > cr.bottom;
          if (notFullyVisible) {
            const zoom = getZoom();
            fitView({nodes: [{id: entry.id}], duration: 200, maxZoom: zoom});
          }
        }
      }
    },
    [fitView, getZoom, setActiveTabEntry]
  );

  const handleFocusCapture = useCallback(
    (e: React.FocusEvent) => {
      const target = e.target as HTMLElement;
      const nodeEl = target.closest('.react-flow__node');
      const edgeEl = target.closest('.react-flow__edge');
      const entry: TabOrderEntry | null = nodeEl
        ? {type: 'node', id: nodeEl.getAttribute('data-id')!}
        : edgeEl
        ? {type: 'edge', id: edgeEl.getAttribute('data-id')!}
        : null;
      if (
        entry &&
        tabOrder.some(e => e.type === entry.type && e.id === entry.id)
      ) {
        setActiveTabEntry(entry);
      }
    },
    [tabOrder, setActiveTabEntry]
  );

  return {focusEntry, handleFocusCapture};
}
