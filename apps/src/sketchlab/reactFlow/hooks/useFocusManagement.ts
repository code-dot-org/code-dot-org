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
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return;
      element.focus();
      // Pan if the element is not fully visible in the viewport.
      if (entry.type === 'node') {
        const container = element.closest<HTMLElement>('.react-flow');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const nodeRect = element.getBoundingClientRect();
          const notFullyVisible =
            nodeRect.left < containerRect.left ||
            nodeRect.right > containerRect.right ||
            nodeRect.top < containerRect.top ||
            nodeRect.bottom > containerRect.bottom;
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
    (event: React.FocusEvent) => {
      const target = event.target as HTMLElement;
      const nodeElement = target.closest('.react-flow__node');
      const edgeElement = target.closest('.react-flow__edge');
      const entry: TabOrderEntry | null = nodeElement
        ? {type: 'node', id: nodeElement.getAttribute('data-id')!}
        : edgeElement
        ? {type: 'edge', id: edgeElement.getAttribute('data-id')!}
        : null;
      if (
        entry &&
        tabOrder.some(
          tabEntry => tabEntry.type === entry.type && tabEntry.id === entry.id
        )
      ) {
        setActiveTabEntry(entry);
      }
    },
    [tabOrder, setActiveTabEntry]
  );

  return {focusEntry, handleFocusCapture};
}
