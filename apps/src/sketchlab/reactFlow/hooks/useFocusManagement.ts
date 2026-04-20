import {useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {
  entriesMatch,
  getEntryFromDOM,
  type TabOrderEntry,
} from '../utils/computeTabOrder';

const PAN_DURATION_MS = 200;

export interface PanIfClippedMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

type FitViewFn = ReturnType<typeof useReactFlow>['fitView'];
type GetZoomFn = ReturnType<typeof useReactFlow>['getZoom'];

/**
 * If `element` (optionally expanded by per-side margins) is not fully
 * inside its `.react-flow` container, call `fitView` on `fitNodes` to
 * bring it into view. Margins let a caller ensure room for auxiliary UI
 * (e.g., a node-side toolbar) that sits outside the element itself.
 */
export function panIfClipped({
  element,
  fitView,
  getZoom,
  fitNodes,
  margins,
}: {
  element: HTMLElement;
  fitView: FitViewFn;
  getZoom: GetZoomFn;
  fitNodes: {id: string}[];
  margins?: PanIfClippedMargins;
}): void {
  const container = element.closest<HTMLElement>('.react-flow');
  if (!container) return;
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const m = {top: 0, right: 0, bottom: 0, left: 0, ...margins};
  const clipped =
    elementRect.left - m.left < containerRect.left ||
    elementRect.right + m.right > containerRect.right ||
    elementRect.top - m.top < containerRect.top ||
    elementRect.bottom + m.bottom > containerRect.bottom;
  if (!clipped) return;
  fitView({
    nodes: fitNodes,
    duration: PAN_DURATION_MS,
    maxZoom: getZoom(),
  });
}

/**
 * If a NodeToolbar is mounted for `nodeId`, compute how far it extends
 * past each side of the node element. The portaled toolbar is tagged
 * with `data-id="<nodeId> "` by React Flow. Returns undefined when no
 * toolbar is present (so the caller can skip the extra margin).
 */
function computeNodeToolbarMargins(
  nodeElement: HTMLElement,
  nodeId: string
): PanIfClippedMargins | undefined {
  const toolbar = document.querySelector<HTMLElement>(
    `.react-flow__node-toolbar[data-id~="${CSS.escape(nodeId)}"]`
  );
  if (!toolbar) return undefined;
  const nodeRect = nodeElement.getBoundingClientRect();
  const toolbarRect = toolbar.getBoundingClientRect();
  const left = Math.max(0, nodeRect.left - toolbarRect.left);
  const right = Math.max(0, toolbarRect.right - nodeRect.right);
  const top = Math.max(0, nodeRect.top - toolbarRect.top);
  const bottom = Math.max(0, toolbarRect.bottom - nodeRect.bottom);
  if (left === 0 && right === 0 && top === 0 && bottom === 0) return undefined;
  return {left, right, top, bottom};
}

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
      let fitNodes: {id: string}[];
      let margins: PanIfClippedMargins | undefined;
      if (entry.type === 'edge') {
        const edge = edges.find(e => e.id === entry.id);
        if (!edge) return;
        fitNodes = [{id: edge.source}, {id: edge.target}];
      } else {
        fitNodes = [{id: entry.id}];
        margins = computeNodeToolbarMargins(element, entry.id);
      }
      panIfClipped({element, fitView, getZoom, fitNodes, margins});
    },
    [edges, fitView, getZoom, setActiveTabEntry]
  );

  const handleFocusCapture = useCallback(
    (event: React.FocusEvent) => {
      const entry = getEntryFromDOM(event.target as HTMLElement);
      if (!entry || !tabOrder.some(tabEntry => entriesMatch(tabEntry, entry))) {
        return;
      }
      setActiveTabEntry(entry);
      if (entry.type !== 'node') return;
      const nodeId = entry.id;
      // Defer to the next frame: focusing a child (e.g., a shape's text
      // label) fires before React Flow commits the selection state and
      // mounts the node's toolbar, so measuring synchronously would miss
      // the toolbar's margins.
      requestAnimationFrame(() => {
        const nodeElement = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${nodeId}"]`
        );
        if (!nodeElement) return;
        panIfClipped({
          element: nodeElement,
          fitView,
          getZoom,
          fitNodes: [{id: nodeId}],
          margins: computeNodeToolbarMargins(nodeElement, nodeId),
        });
      });
    },
    [tabOrder, setActiveTabEntry, fitView, getZoom]
  );

  return {focusEntry, handleFocusCapture};
}
