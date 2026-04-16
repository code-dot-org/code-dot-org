import {useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {
  entriesMatch,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';

/**
 * Focus helpers for the React Flow canvas. Provides focusEntry (move focus
 * to a specific node or edge) and handleFocusCapture (sync the roving
 * tabindex when a node/edge receives focus by other means).
 *
 * Node auto-panning is handled by React Flow's built-in autoPanOnNodeFocus.
 * Edge auto-panning is custom since React Flow has no built-in equivalent.
 */
export function useFocusManagement(
  tabOrder: TabOrderEntry[],
  edges: SketchlabReactFlowEdge[],
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
      // Pan edges into view (nodes are handled by RF's autoPanOnNodeFocus).
      if (entry.type === 'edge') {
        const container = element.closest<HTMLElement>('.react-flow');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const edgeRect = element.getBoundingClientRect();
          const notFullyVisible =
            edgeRect.left < containerRect.left ||
            edgeRect.right > containerRect.right ||
            edgeRect.top < containerRect.top ||
            edgeRect.bottom > containerRect.bottom;
          if (notFullyVisible) {
            const edge = edges.find(e => e.id === entry.id);
            if (edge) {
              const zoom = getZoom();
              fitView({
                nodes: [{id: edge.source}, {id: edge.target}],
                duration: 200,
                maxZoom: zoom,
              });
            }
          }
        }
      }
    },
    [edges, fitView, getZoom, setActiveTabEntry]
  );

  const handleFocusCapture = useCallback(
    (event: React.FocusEvent) => {
      const entry = getEntryFromDOM(event.target as HTMLElement);
      if (entry && tabOrder.some(tabEntry => entriesMatch(tabEntry, entry))) {
        setActiveTabEntry(entry);
      }
    },
    [tabOrder, setActiveTabEntry]
  );

  return {focusEntry, handleFocusCapture};
}
