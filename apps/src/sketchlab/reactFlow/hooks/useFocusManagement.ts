import {useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {
  entriesMatch,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';

const PAN_DURATION_MS = 200;

/**
 * Focus helpers for the React Flow canvas. Provides focusEntry (move focus
 * to a specific node or edge) and handleFocusCapture (sync the roving
 * tabindex when a node/edge receives focus by other means).
 *
 * Auto-panning: when the focused element is not fully visible within the
 * canvas container, fitView is called to bring it into view.
 */
export function useFocusManagement(
  tabOrder: TabOrderEntry[],
  edges: SketchlabReactFlowEdge[],
  setActiveTabEntry: (entry: TabOrderEntry) => void
) {
  const {fitView, getZoom} = useReactFlow();

  /** Pan the viewport so that `entry` is fully visible, if it isn't already. */
  const panToEntryIfNeeded = useCallback(
    (entry: TabOrderEntry, element: HTMLElement) => {
      const container = element.closest<HTMLElement>('.react-flow');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const notFullyVisible =
        elementRect.left < containerRect.left ||
        elementRect.right > containerRect.right ||
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom;
      if (!notFullyVisible) return;
      const zoom = getZoom();
      if (entry.type === 'edge') {
        const edge = edges.find(e => e.id === entry.id);
        if (edge) {
          fitView({
            nodes: [{id: edge.source}, {id: edge.target}],
            duration: PAN_DURATION_MS,
            maxZoom: zoom,
          });
        }
      } else {
        fitView({
          nodes: [{id: entry.id}],
          duration: PAN_DURATION_MS,
          maxZoom: zoom,
        });
      }
    },
    [edges, fitView, getZoom]
  );

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
      panToEntryIfNeeded(entry, element);
    },
    [panToEntryIfNeeded, setActiveTabEntry]
  );

  const handleFocusCapture = useCallback(
    (event: React.FocusEvent) => {
      const entry = getEntryFromDOM(event.target as HTMLElement);
      if (entry && tabOrder.some(tabEntry => entriesMatch(tabEntry, entry))) {
        setActiveTabEntry(entry);
        // Pan the focused element into view when it is off-screen.
        // Deferred so it runs after React Flow finishes processing the
        // focus event internally; calling fitView synchronously here
        // gets overridden by React Flow's state reconciliation.
        requestAnimationFrame(() => {
          const selector =
            entry.type === 'node'
              ? `.react-flow__node[data-id="${entry.id}"]`
              : `.react-flow__edge[data-id="${entry.id}"]`;
          const element = document.querySelector<HTMLElement>(selector);
          if (element) {
            panToEntryIfNeeded(entry, element);
          }
        });
      }
    },
    [tabOrder, setActiveTabEntry, panToEntryIfNeeded]
  );

  return {focusEntry, handleFocusCapture};
}
