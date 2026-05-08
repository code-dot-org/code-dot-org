import {useReactFlow} from '@xyflow/react';
import React, {useCallback, useEffect} from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {SKETCHLAB_TOOLBAR_PANEL_CLASS} from '../elementToolbars/CornerToolbarPanel';
import {
  entriesMatch,
  getElementForEntry,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';
import {getViewportOverflow} from '../utils/viewport';

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
  nodeOrEdgeFocused: boolean,
  setLastFocusedEntry: (entry: TabOrderEntry | null) => void,
  setNodeOrEdgeFocused: (focused: boolean) => void
) {
  const {fitView, getZoom} = useReactFlow();

  // Close the toolbar on clicks outside nodes, edges, and the
  // toolbar itself. Clicking on non-focusable areas (e.g. the canvas
  // pane background) does not move DOM focus, so blur-based detection
  // alone misses this case. Scoped to when a node/edge is focused so
  // we don't attach a global listener unnecessarily.
  useEffect(() => {
    if (!nodeOrEdgeFocused) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest('.react-flow__node') ||
        target.closest('.react-flow__edge') ||
        target.closest(`.${SKETCHLAB_TOOLBAR_PANEL_CLASS}`)
      ) {
        return;
      }
      setLastFocusedEntry(null);
      setNodeOrEdgeFocused(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [nodeOrEdgeFocused, setLastFocusedEntry, setNodeOrEdgeFocused]);

  /** Pan the viewport so that `entry` is fully visible, if it isn't already. */
  const panToEntryIfNeeded = useCallback(
    (entry: TabOrderEntry, element: HTMLElement) => {
      if (!getViewportOverflow(element)) return;
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
      const element = getElementForEntry(entry);
      if (!element) return;
      setLastFocusedEntry(entry);
      setNodeOrEdgeFocused(true);
      element.focus();
      panToEntryIfNeeded(entry, element);
    },
    [panToEntryIfNeeded, setLastFocusedEntry, setNodeOrEdgeFocused]
  );

  const handleFocusCapture = useCallback(
    (event: React.FocusEvent) => {
      const entry = getEntryFromDOM(event.target as HTMLElement);
      if (entry && tabOrder.some(tabEntry => entriesMatch(tabEntry, entry))) {
        setLastFocusedEntry(entry);
        setNodeOrEdgeFocused(true);
        // Pan the focused element into view when it is off-screen.
        // Deferred so it runs after React Flow finishes processing the
        // focus event internally; calling fitView synchronously here
        // gets overridden by React Flow's state reconciliation.
        // The lookup must stay inside the rAF — it has to outlast that
        // synchronous reconciliation.
        requestAnimationFrame(() => {
          const element = getElementForEntry(entry);
          if (element) {
            panToEntryIfNeeded(entry, element);
          }
        });
      } else {
        const focusTarget = event.target as HTMLElement;
        const inToolbar = focusTarget.closest(
          `.${SKETCHLAB_TOOLBAR_PANEL_CLASS}`
        );
        if (!inToolbar) {
          // Focus moved to a non-node/edge element (e.g. Controls buttons).
          // Clear visual selection but preserve lastFocusedEntry so the
          // roving tabindex target stays correct for shift-tab.
          // We skip this when focus moves into a node or edge toolbar
          // so the toolbar stays mounted while the user interacts with it.
          setNodeOrEdgeFocused(false);
        }
      }
    },
    [tabOrder, setLastFocusedEntry, setNodeOrEdgeFocused, panToEntryIfNeeded]
  );

  return {focusEntry, handleFocusCapture};
}
