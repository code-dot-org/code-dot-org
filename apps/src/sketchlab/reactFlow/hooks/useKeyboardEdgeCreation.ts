import {addEdge, MarkerType} from '@xyflow/react';
import React, {useCallback, useState} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import type {TabOrderEntry} from '../utils/computeTabOrder';

/**
 * Pick source/target handles based on relative node positions so the arrow
 * points in a sensible direction.
 */
function pickHandles(
  source: SketchlabReactFlowNode,
  target: SketchlabReactFlowNode
) {
  const deltaX = target.position.x - source.position.x;
  const deltaY = target.position.y - source.position.y;
  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0
      ? {sourceHandle: 'right-source', targetHandle: 'left-target'}
      : {sourceHandle: 'left-source', targetHandle: 'right-target'};
  }
  return deltaY >= 0
    ? {sourceHandle: 'bottom-source', targetHandle: 'top-target'}
    : {sourceHandle: 'top-source', targetHandle: 'bottom-target'};
}

function getNodeLabel(node: SketchlabReactFlowNode): string {
  return (
    (node.data?.label as string) ||
    (node.data?.text as string) ||
    node.type ||
    node.id
  );
}

interface UseKeyboardEdgeCreationOptions {
  nodes: SketchlabReactFlowNode[];
  tabOrder: TabOrderEntry[];
  focusEntry: (entry: TabOrderEntry) => void;
  setEdges: (
    updater: (edges: SketchlabReactFlowEdge[]) => SketchlabReactFlowEdge[]
  ) => void;
  readOnly: boolean;
}

/**
 * Keyboard-driven edge creation and canvas key handling.
 *
 * Press "c" on a focused node to enter connect mode, Tab to cycle through
 * candidate target nodes, Enter to create the edge. Escape or "c" again
 * cancels. Also handles Tab-based navigation in normal mode and Enter to
 * activate a node's editable content.
 */
export function useKeyboardEdgeCreation({
  nodes,
  tabOrder,
  focusEntry,
  setEdges,
  readOnly,
}: UseKeyboardEdgeCreationOptions) {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectAnnouncement, setConnectAnnouncement] = useState('');

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (readOnly) return;

      const target = event.target as HTMLElement;
      // Don't intercept non-Tab keys when the user is editing text content.
      const isEditing =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA';
      if (isEditing && event.key !== 'Tab') {
        return;
      }

      // Determine which node or edge currently has focus.
      const nodeElement = target.closest('.react-flow__node');
      const edgeElement = target.closest('.react-flow__edge');
      const focusedEntry: TabOrderEntry | null = nodeElement
        ? {type: 'node', id: nodeElement.getAttribute('data-id')!}
        : edgeElement
        ? {type: 'edge', id: edgeElement.getAttribute('data-id')!}
        : null;
      const focusedNodeId =
        focusedEntry?.type === 'node' ? focusedEntry.id : undefined;

      // "c" toggles connect mode on/off (nodes only).
      if (event.key === 'c') {
        if (connectingFrom) {
          event.preventDefault();
          setConnectingFrom(null);
          setConnectAnnouncement('Connect mode cancelled.');
          return;
        }
        if (focusedNodeId) {
          event.preventDefault();
          const node = nodes.find(candidate => candidate.id === focusedNodeId);
          setConnectingFrom(focusedNodeId);
          setConnectAnnouncement(
            `Connect mode: ${
              node ? getNodeLabel(node) : focusedNodeId
            } selected as source. Tab to a target node and press Enter to connect. Press Escape or C to cancel.`
          );
        }
        return;
      }

      // Tab uses the computed logical tab order.
      if (event.key === 'Tab') {
        if (tabOrder.length === 0) return;
        const currentIdx = focusedEntry
          ? tabOrder.findIndex(
              tabEntry =>
                tabEntry.type === focusedEntry.type &&
                tabEntry.id === focusedEntry.id
            )
          : -1;
        const direction = event.shiftKey ? -1 : 1;

        if (connectingFrom) {
          // Connect mode: cycle through nodes only, wrap around.
          const nodeEntries = tabOrder.filter(
            tabEntry => tabEntry.type === 'node'
          );
          if (nodeEntries.length === 0) return;
          const curNodeIdx = focusedNodeId
            ? nodeEntries.findIndex(tabEntry => tabEntry.id === focusedNodeId)
            : -1;
          const nextNodeIdx =
            (((curNodeIdx + direction + nodeEntries.length) %
              nodeEntries.length) +
              nodeEntries.length) %
            nodeEntries.length;
          event.preventDefault();
          focusEntry(nodeEntries[nextNodeIdx]);
          return;
        }

        // Normal mode: move through full order; escape at boundaries.
        if (focusedEntry) {
          const nextIdx = currentIdx + direction;
          if (nextIdx >= 0 && nextIdx < tabOrder.length) {
            event.preventDefault();
            focusEntry(tabOrder[nextIdx]);
          }
          // else: out of bounds -- let focus leave the canvas naturally.
          return;
        }
      }

      // Enter on a different node completes the connection.
      if (event.key === 'Enter' && connectingFrom) {
        if (focusedNodeId && focusedNodeId !== connectingFrom) {
          event.preventDefault();
          const sourceNode = nodes.find(node => node.id === connectingFrom);
          const targetNode = nodes.find(node => node.id === focusedNodeId);
          if (sourceNode && targetNode) {
            const handles = pickHandles(sourceNode, targetNode);
            setEdges(currentEdges =>
              addEdge(
                {
                  source: connectingFrom,
                  target: focusedNodeId,
                  ...handles,
                  markerEnd: {type: MarkerType.ArrowClosed},
                },
                currentEdges
              )
            );
            setConnectAnnouncement(
              `Edge created to ${getNodeLabel(targetNode)}.`
            );
          }
          setConnectingFrom(null);
        }
        return;
      }

      if (event.key === 'Escape' && connectingFrom) {
        event.preventDefault();
        setConnectingFrom(null);
        setConnectAnnouncement('Connect mode cancelled.');
        return;
      }

      // Enter on a focused node (outside connect mode) enters edit mode.
      if (event.key === 'Enter' && focusedNodeId) {
        const focusedNodeElement = document.querySelector<HTMLElement>(
          `.react-flow__node[data-id="${focusedNodeId}"]`
        );
        const editable = focusedNodeElement?.querySelector<HTMLElement>(
          '[role="textbox"], button, input'
        );
        if (editable) {
          event.preventDefault();
          if (editable.tagName === 'BUTTON') {
            editable.click();
          } else {
            editable.focus();
          }
        }
      }
    },
    [connectingFrom, focusEntry, nodes, readOnly, setEdges, tabOrder]
  );

  return {connectingFrom, connectAnnouncement, handleKeyDown};
}
